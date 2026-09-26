// Supabase Edge Function: Handle Stripe Webhooks
// Deploy: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`Received event: ${event.type}`);

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});

// Handle successful checkout
async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('No userId found in checkout session');
    return;
  }

  // Update user with Stripe customer ID and subscription ID
  const { error } = await supabase
    .from('users')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      subscription_plan: session.metadata?.planName || 'premium',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user after checkout:', error);
  } else {
    console.log(`User ${userId} subscription activated`);
  }

  // Log the transaction
  await supabase.from('subscription_events').insert({
    user_id: userId,
    event_type: 'checkout_completed',
    stripe_event_id: session.id,
    amount: session.amount_total,
    currency: session.currency,
    created_at: new Date().toISOString(),
  });
}

// Handle subscription updates (upgrades, downgrades, renewals)
async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const status = subscription.status === 'active' || subscription.status === 'trialing' 
    ? 'active' 
    : subscription.status;

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: status,
      stripe_subscription_id: subscription.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log(`Subscription updated for user ${userId}: ${status}`);
  }

  // Log the event
  await supabase.from('subscription_events').insert({
    user_id: userId,
    event_type: 'subscription_updated',
    stripe_event_id: subscription.id,
    status: status,
    created_at: new Date().toISOString(),
  });
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'cancelled',
      subscription_plan: 'basic',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error canceling subscription:', error);
  } else {
    console.log(`Subscription cancelled for user ${userId}`);
  }

  // Log cancellation
  await supabase.from('subscription_events').insert({
    user_id: userId,
    event_type: 'subscription_cancelled',
    stripe_event_id: subscription.id,
    created_at: new Date().toISOString(),
  });
}

// Handle successful payment (renewal)
async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status
  await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  // Log successful payment
  await supabase.from('subscription_events').insert({
    user_id: user.id,
    event_type: 'payment_succeeded',
    stripe_event_id: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    created_at: new Date().toISOString(),
  });

  console.log(`Payment succeeded for user ${user.id}: ${invoice.amount_paid / 100}`);
}

// Handle failed payment
async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update status if this is the final attempt
  if (invoice.attempt_count >= 3) {
    await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  }

  // Log failed payment
  await supabase.from('subscription_events').insert({
    user_id: user.id,
    event_type: 'payment_failed',
    stripe_event_id: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    created_at: new Date().toISOString(),
  });

  console.log(`Payment failed for user ${user.id} (attempt ${invoice.attempt_count})`);

  // TODO: Send email notification to user about failed payment
}
