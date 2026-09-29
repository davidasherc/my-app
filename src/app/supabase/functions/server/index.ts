import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import Stripe from "npm:stripe";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-2538a5b0/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-12-18.acacia",
});

// Create Stripe Checkout Session
app.post("/make-server-2538a5b0/create-checkout-session", async (c) => {
  console.log('🔵🔵🔵 CREATE CHECKOUT SESSION ROUTE HIT!');
  
  try {
    const body = await c.req.json();
    console.log('🔵 Request body:', body);
    
    const { priceId, userId, email, planName, successUrl, cancelUrl } = body;

    if (!priceId || !userId || !email) {
      console.error('❌ Missing required fields:', { priceId, userId, email });
      return c.json({ error: "Missing required fields" }, 400);
    }

    console.log('🔵 Creating Stripe session with:', { priceId, email, planName });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId,
        planName,
      },
      success_url: successUrl || `${c.req.header('origin')}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: cancelUrl || `${c.req.header('origin')}/?canceled=true`,
    });

    console.log('✅ Stripe session created:', session.id);

    return c.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      500
    );
  }
});

// Create Stripe Customer Portal Session
app.post("/make-server-2538a5b0/create-portal-session", async (c) => {
  console.log('🔵🔵🔵 CREATE PORTAL SESSION ROUTE HIT!');
  
  try {
    const body = await c.req.json();
    const { customerId, returnUrl } = body;

    if (!customerId) {
      return c.json({ error: "Missing customerId" }, 400);
    }

    console.log('🔵 Creating portal session for customer:', customerId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || c.req.header('origin') || 'http://localhost:3001',
    });

    console.log('✅ Portal session created:', session.url);

    return c.json({
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Error creating portal session:', error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to create portal session" },
      500
    );
  }
});

// Stripe Webhook Handler
app.post("/make-server-2538a5b0/stripe-webhook", async (c) => {
  console.log('🔵🔵🔵 STRIPE WEBHOOK HIT!');
  
  const signature = c.req.header("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error('❌ Missing signature or webhook secret');
    return c.json({ error: "Webhook signature missing" }, 400);
  }

  try {
    const rawBody = await c.req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    console.log('🔵 Webhook event type:', event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout completed:', session.id);
        console.log('   Customer:', session.customer);
        console.log('   Subscription:', session.subscription);
        console.log('   Metadata:', session.metadata);

        // Update user subscription in KV store
        const userId = session.client_reference_id || session.metadata?.userId;
        if (userId && session.subscription) {
          const user = await kv.get(`user_${userId}`);
          if (user) {
            await kv.set(`user_${userId}`, {
              ...user,
              subscriptionStatus: 'active',
              subscriptionPlan: session.metadata?.planName || 'premium',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            });
            console.log('✅ User subscription updated in KV store');
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔵 Subscription updated:', subscription.id);
        console.log('   Status:', subscription.status);
        
        // Find user by stripeCustomerId
        const allKeys = await kv.getByPrefix('user_');
        for (const userData of allKeys) {
          if (userData.stripeSubscriptionId === subscription.id) {
            await kv.set(`user_${userData.id}`, {
              ...userData,
              subscriptionStatus: subscription.status,
            });
            console.log('✅ User subscription status updated');
            break;
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔵 Subscription deleted:', subscription.id);
        
        // Find user and downgrade to free
        const allKeys = await kv.getByPrefix('user_');
        for (const userData of allKeys) {
          if (userData.stripeSubscriptionId === subscription.id) {
            await kv.set(`user_${userData.id}`, {
              ...userData,
              subscriptionStatus: 'canceled',
              subscriptionPlan: 'free',
            });
            console.log('✅ User downgraded to free');
            break;
          }
        }
        break;
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : "Webhook handler failed" },
      400
    );
  }
});

Deno.serve(app.fetch);
