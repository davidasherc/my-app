// Supabase Edge Function: Create Stripe Checkout Session
// Deploy: supabase functions deploy create-checkout-session

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, userId, email, planName } = await req.json();

    // Validate required fields
    if (!priceId || !userId || !email) {
      throw new Error('Missing required fields: priceId, userId, email');
    }

    // Get your app's base URL from environment or use the request origin
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    
    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      client_reference_id: userId, // Link to your user
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Enable Apple Pay & Google Pay
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session', // Save card for future charges
        },
      },
      // Redirect URLs
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/?canceled=true`,
      
      // Metadata to track in Stripe (avoid PHI!)
      metadata: {
        userId: userId,
        planName: planName || 'premium',
        appName: 'Emotional Journal',
      },
      
      // Subscription settings
      subscription_data: {
        metadata: {
          userId: userId,
          planName: planName || 'premium',
        },
        // Optional: trial period
        // trial_period_days: 7,
      },
      
      // Allow promotion codes
      allow_promotion_codes: true,
      
      // Billing settings
      billing_address_collection: 'auto',
    });

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create checkout session' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
