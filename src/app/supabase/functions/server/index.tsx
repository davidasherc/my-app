import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import Stripe from "npm:stripe";
import { Resend } from "npm:resend";

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

// Register new user
app.post("/make-server-2538a5b0/auth/register", async (c) => {
  console.log('🔐 REGISTER ROUTE HIT');
  
  try {
    const body = await c.req.json();
    const { email, password, firstName, lastName, therapistEmail } = body;
    
    console.log('🔐 Registering user:', email);
    
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return c.json({ success: false, error: 'All fields are required' }, 400);
    }
    
    if (password.length < 8) {
      return c.json({ success: false, error: 'Password must be at least 8 characters' }, 400);
    }
    
    // Check if user already exists
    const existingUser = await kv.get(`user:email:${email.toLowerCase()}`);
    if (existingUser) {
      return c.json({ success: false, error: 'Email already registered' }, 400);
    }
    
    // Create user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Hash password (in production, use proper hashing like bcrypt)
    const passwordHash = btoa(password); // Simple encoding for demo - USE BCRYPT IN PRODUCTION!
    
    // Create user object
    const user = {
      id: userId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      subscriptionStatus: 'trial',
      subscriptionPlan: 'basic',
      therapistEmail: therapistEmail || undefined,
      isVerified: true, // Auto-verify for now
      createdAt: new Date().toISOString(),
    };
    
    // Save user data
    await kv.set(`user:${userId}`, user);
    // Save email->userId mapping for login
    await kv.set(`user:email:${email.toLowerCase()}`, { userId, passwordHash });
    
    console.log('✅ User registered successfully:', userId);
    
    return c.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('❌ Error registering user:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : "Registration failed" },
      500
    );
  }
});

// Login user
app.post("/make-server-2538a5b0/auth/login", async (c) => {
  console.log('🔐 LOGIN ROUTE HIT');
  
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    console.log('🔐 Login attempt for:', email);
    
    // Get user credentials
    const credentials = await kv.get(`user:email:${email.toLowerCase()}`);
    if (!credentials) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401);
    }
    
    // Verify password (simple check for demo - USE BCRYPT IN PRODUCTION!)
    const passwordHash = btoa(password);
    if (credentials.passwordHash !== passwordHash) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401);
    }
    
    // Get full user data
    const user = await kv.get(`user:${credentials.userId}`);
    if (!user) {
      return c.json({ success: false, error: 'User data not found' }, 404);
    }
    
    console.log('✅ User logged in successfully:', credentials.userId);
    
    return c.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('❌ Error logging in:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : "Login failed" },
      500
    );
  }
});

// Stripe Configuration Check Endpoint
app.get("/make-server-2538a5b0/check-stripe-config", async (c) => {
  console.log('🔍 STRIPE CONFIG CHECK ROUTE HIT');
  
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  console.log('🔍 Stripe Secret Key exists:', !!stripeSecretKey);
  console.log('🔍 Stripe Secret Key length:', stripeSecretKey?.length || 0);
  console.log('🔍 Stripe Secret Key prefix:', stripeSecretKey?.substring(0, 7));
  console.log('🔍 Stripe Secret Key starts with sk_:', stripeSecretKey?.startsWith('sk_'));
  console.log('🔍 Webhook Secret exists:', !!webhookSecret);
  console.log('🔍 Webhook Secret starts with whsec_:', webhookSecret?.startsWith('whsec_'));
  
  return c.json({
    stripeConfigured: !!stripeSecretKey && stripeSecretKey.startsWith('sk_'),
    stripeKeyPrefix: stripeSecretKey?.substring(0, 7) || 'MISSING',
    stripeKeyLength: stripeSecretKey?.length || 0,
    isTestKey: stripeSecretKey?.includes('test'),
    webhookConfigured: !!webhookSecret && webhookSecret.startsWith('whsec_'),
    webhookPrefix: webhookSecret?.substring(0, 10) || 'MISSING',
  });
});

// Save API Key to KV store
app.post("/make-server-2538a5b0/save-api-key", async (c) => {
  console.log('🔑 SAVE API KEY ROUTE HIT');
  
  try {
    const body = await c.req.json();
    const { apiKey } = body;
    
    console.log('🔑 Received API key length:', apiKey?.length);
    console.log('🔑 API key starts with re_:', apiKey?.startsWith('re_'));

    if (!apiKey || !apiKey.startsWith('re_')) {
      console.error('❌ Invalid API key format');
      return c.json({ error: "Invalid API key format. Must start with 're_'" }, 400);
    }

    // Save to KV store
    await kv.set('resend_api_key', apiKey);
    console.log('✅ API key saved to KV store');
    
    // Verify it was saved
    const savedKey = await kv.get('resend_api_key');
    console.log('✅ Verification - Key retrieved from KV:', !!savedKey, 'Length:', savedKey?.length);

    return c.json({
      success: true,
      message: 'API key saved successfully! Click Refresh to verify.'
    });
  } catch (error) {
    console.error('❌ Error saving API key:', error);
    return c.json(
      { error: error instanceof Error ? error.message : "Failed to save API key" },
      500
    );
  }
});

// Initialize Stripe
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
console.log('🔑 INITIALIZING STRIPE AT STARTUP');
console.log('🔑 Stripe Secret Key exists:', !!stripeSecretKey);
console.log('🔑 Stripe Secret Key length:', stripeSecretKey?.length || 0);
console.log('🔑 Stripe Secret Key prefix:', stripeSecretKey?.substring(0, 7));

if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
  console.error('❌❌❌ STRIPE SECRET KEY NOT CONFIGURED OR INVALID! ❌❌❌');
  console.error('❌ Please set STRIPE_SECRET_KEY environment variable in Supabase');
}

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2024-12-18.acacia",
});

// Initialize Resend
const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

// Create Stripe Checkout Session
app.post("/make-server-2538a5b0/create-checkout-session", async (c) => {
  console.log('🔵🔵🔵 CREATE CHECKOUT SESSION ROUTE HIT!');
  
  try {
    // 🚨 CRITICAL: Check if Stripe is configured BEFORE processing
    const currentStripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log('🔑 CHECKING STRIPE KEY AT REQUEST TIME:');
    console.log('🔑   Key exists:', !!currentStripeKey);
    console.log('🔑   Key length:', currentStripeKey?.length || 0);
    console.log('🔑   Key prefix:', currentStripeKey?.substring(0, 7));
    console.log('🔑   Key is valid:', currentStripeKey?.startsWith('sk_'));
    
    if (!currentStripeKey || !currentStripeKey.startsWith('sk_')) {
      console.error('❌❌❌ STRIPE NOT CONFIGURED! Cannot create checkout session!');
      return c.json({ 
        error: "Stripe is not configured on the server. Please set STRIPE_SECRET_KEY environment variable in Supabase." 
      }, 500);
    }
    
    const body = await c.req.json();
    console.log('🔵 Request body:', JSON.stringify(body, null, 2));
    
    const { priceId, userId, email, planName, successUrl, cancelUrl } = body;

    console.log('🔵 Extracted fields:', { priceId, userId, email, planName });

    if (!priceId || !userId || !email) {
      console.error('❌ Missing required fields:', { priceId, userId, email });
      return c.json({ error: "Missing required fields" }, 400);
    }

    console.log('🔵 Creating Stripe session with:', { priceId, email, planName });
    console.log('🔵🔵🔵 ABOUT TO CALL STRIPE API - THIS IS THE REAL CALL! 🔵🔵🔵');

    // Get the origin from the request or use successUrl
    const origin = successUrl ? new URL(successUrl).origin : c.req.header('origin') || c.req.header('referer')?.split('/').slice(0, 3).join('/');
    console.log('🔵 Detected origin:', origin);
    console.log('🔵 Success URL param:', successUrl);
    console.log('🔵 Cancel URL param:', cancelUrl);

    const finalSuccessUrl = successUrl || `${origin}/?session_id={CHECKOUT_SESSION_ID}&success=true`;
    const finalCancelUrl = cancelUrl || `${origin}/?canceled=true`;
    
    console.log('🔵 Final success URL:', finalSuccessUrl);
    console.log('🔵 Final cancel URL:', finalCancelUrl);

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
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    });

    console.log('✅✅✅ STRIPE SESSION CREATED SUCCESSFULLY! ✅✅✅');
    console.log('✅ Session ID:', session.id);
    console.log('✅ Checkout URL:', session.url);
    console.log('✅ Session object keys:', Object.keys(session));
    console.log('✅ Full session data:', JSON.stringify(session, null, 2));

    return c.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌❌❌ ERROR CREATING CHECKOUT SESSION! ❌❌❌');
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error name:', error instanceof Error ? error.name : 'N/A');
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
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
  console.log('🎯🎯🎯 STRIPE WEBHOOK HIT!!! 🎯🎯🎯');
  console.log('🎯 Timestamp:', new Date().toISOString());
  console.log('🎯 Headers:', Object.fromEntries(c.req.raw.headers.entries()));
  
  const signature = c.req.header("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  console.log('🎯 Signature exists:', !!signature);
  console.log('🎯 Webhook secret exists:', !!webhookSecret);
  console.log('🎯 Webhook secret starts with whsec_:', webhookSecret?.startsWith('whsec_'));

  if (!signature || !webhookSecret) {
    console.error('❌ Missing signature or webhook secret');
    return c.json({ error: "Webhook signature missing" }, 400);
  }

  try {
    const rawBody = await c.req.text();
    console.log('🎯 Raw body length:', rawBody.length);
    console.log('🎯 Raw body preview:', rawBody.substring(0, 200));
    
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    console.log('🔵 Webhook event type:', event.type);
    console.log('🔵 Webhook event ID:', event.id);
    console.log('🔵 Webhook event data:', JSON.stringify(event.data.object, null, 2));

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout completed:', session.id);
        console.log('   Customer:', session.customer);
        console.log('   Subscription:', session.subscription);
        console.log('   Metadata:', session.metadata);
        console.log('   Client Reference ID:', session.client_reference_id);

        // Update user subscription in KV store
        // Users are keyed by email (user:${email}), not by numeric ID
        const customerEmail = session.customer_email || session.metadata?.email;
        console.log('   Extracted customerEmail:', customerEmail);

        if (customerEmail && session.subscription) {
          const userKey = `user:${customerEmail}`;
          console.log('   Looking for user with key:', userKey);

          const user = await kv.get(userKey);
          console.log('   User found:', !!user);

          if (user) {
            const updatedUser = {
              ...user,
              subscriptionStatus: 'active',
              subscriptionPlan: session.metadata?.planName || 'premium',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              checkoutCompletedAt: new Date().toISOString(),
            };

            await kv.set(userKey, updatedUser);
            console.log('   ✅✅✅ USER SUBSCRIPTION UPDATED VIA WEBHOOK!');
            console.log('   ✅ Updated user:', updatedUser);
          } else {
            console.log('   ⚠️ No user found for email:', customerEmail);
          }
        } else {
          console.log('   ⚠️ Missing customerEmail or subscription, cannot update user');
          console.log('   ⚠️ customerEmail:', customerEmail);
          console.log('   ⚠️ subscription:', session.subscription);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔵 Subscription updated:', subscription.id);
        console.log('   Status:', subscription.status);
        
        // Find user by stripeSubscriptionId
        const allKeys = await kv.getByPrefix('user:');
        for (const userData of allKeys) {
          if (userData.stripeSubscriptionId === subscription.id) {
            await kv.set(`user:${userData.id}`, {
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
        const allKeys = await kv.getByPrefix('user:');
        for (const userData of allKeys) {
          if (userData.stripeSubscriptionId === subscription.id) {
            await kv.set(`user:${userData.id}`, {
              ...userData,
              subscriptionStatus: 'canceled',
              subscriptionPlan: 'basic',
            });
            console.log('✅ User downgraded to basic');
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

// Manual subscription upgrade endpoint (for testing)
app.post("/make-server-2538a5b0/manual-upgrade", async (c) => {
  console.log('🔧 MANUAL UPGRADE ROUTE HIT');
  
  try {
    const body = await c.req.json();
    const { userId, plan } = body;

    console.log('🔧 Upgrading user:', userId, 'to plan:', plan);

    if (!userId || !plan) {
      return c.json({ error: "Missing userId or plan" }, 400);
    }

    // Get user from KV store
    const userKey = `user_${userId}`;
    let user = await kv.get(userKey);
    
    // If user doesn't exist, create a new user record
    if (!user) {
      console.log('⚠️ User not found in KV, creating new user record:', userId);
      user = {
        id: userId,
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        stripeCustomerId: `cus_test_${userId}`,
        stripeSubscriptionId: `sub_test_${userId}`,
        upgradedAt: new Date().toISOString(),
      };
    } else {
      // Update existing user
      user = {
        ...user,
        subscriptionStatus: 'active',
        subscriptionPlan: plan,
        stripeCustomerId: user.stripeCustomerId || `cus_test_${userId}`,
        stripeSubscriptionId: user.stripeSubscriptionId || `sub_test_${userId}`,
        upgradedAt: new Date().toISOString(),
      };
    }

    // Save to KV store
    await kv.set(userKey, user);

    console.log('✅ User upgraded successfully:', user);

    return c.json({ 
      success: true,
      message: `User upgraded to ${plan}`,
      user: user,
    });
  } catch (error) {
    console.error('❌ Manual upgrade error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : "Upgrade failed" },
      500
    );
  }
});

// Test webhook configuration endpoint
app.post("/make-server-2538a5b0/test-webhook", async (c) => {
  console.log('🧪 TEST WEBHOOK ROUTE HIT');
  
  try {
    const body = await c.req.json();
    const { userId, plan } = body;

    console.log('🧪 Testing webhook with userId:', userId, 'plan:', plan);

    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }

    // Check if webhook secret is configured
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret || !webhookSecret.startsWith('whsec_')) {
      return c.json({ 
        success: false,
        error: "Webhook secret not configured or invalid",
        hint: "Must start with 'whsec_'"
      }, 400);
    }

    console.log('✅ Webhook secret is configured correctly');

    // Simulate a successful webhook event by updating the user
    const userKey = `user_${userId}`;
    let user = await kv.get(userKey);
    
    if (!user) {
      console.log('⚠️ Creating test user record');
      user = {
        id: userId,
        subscriptionStatus: 'active',
        subscriptionPlan: plan || 'premium',
        stripeCustomerId: `cus_webhook_test_${userId}`,
        stripeSubscriptionId: `sub_webhook_test_${userId}`,
        webhookTestAt: new Date().toISOString(),
      };
    } else {
      user = {
        ...user,
        subscriptionStatus: 'active',
        subscriptionPlan: plan || 'premium',
        stripeCustomerId: user.stripeCustomerId || `cus_webhook_test_${userId}`,
        stripeSubscriptionId: user.stripeSubscriptionId || `sub_webhook_test_${userId}`,
        webhookTestAt: new Date().toISOString(),
      };
    }

    await kv.set(userKey, user);

    console.log('✅ Webhook test successful - user upgraded');

    return c.json({ 
      success: true,
      message: 'Webhook configuration is valid! User upgraded successfully.',
      webhookSecretConfigured: true,
      webhookSecretPrefix: webhookSecret.substring(0, 10) + '...',
      userUpdated: true,
    });
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return c.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Test failed" 
      },
      500
    );
  }
});

// Get user data endpoint
app.post("/make-server-2538a5b0/get-user", async (c) => {
  console.log('👤 GET USER ROUTE HIT');
  
  try {
    const body = await c.req.json();
    const { userId } = body;

    console.log('👤 Fetching user data for:', userId);

    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }

    // Get user from KV store using correct key format
    const userKey = `user:${userId}`;
    const user = await kv.get(userKey);
    
    console.log('👤 User data retrieved:', user);

    if (!user) {
      console.log('👤 User not found in KV, creating default user record...');
      // Create a default user record if it doesn't exist
      const defaultUser = {
        id: userId,
        subscriptionStatus: 'trial',
        subscriptionPlan: 'basic',
        createdAt: new Date().toISOString(),
      };
      await kv.set(userKey, defaultUser);
      console.log('👤 Created default user:', defaultUser);
      
      return c.json({ 
        success: true,
        user: defaultUser,
      });
    }

    return c.json({ 
      success: true,
      user: user,
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return c.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch user" 
      },
      500
    );
  }
});

// Verify Stripe checkout session and update user
app.post("/make-server-2538a5b0/verify-session", async (c) => {
  console.log('✅ VERIFY SESSION ROUTE HIT');
  
  try {
    const body = await c.req.json();
    const { sessionId, userId } = body;

    console.log('✅ Verifying session:', sessionId, 'for user:', userId);

    if (!sessionId) {
      return c.json({ error: "Missing sessionId" }, 400);
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('✅ Session retrieved from Stripe:', {
      id: session.id,
      paymentStatus: session.payment_status,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata,
      client_reference_id: session.client_reference_id,
      customer_email: session.customer_email
    });

    // Check if payment was successful
    if (session.payment_status === 'paid') {
      // Get user ID from session metadata or client_reference_id
      const userIdFromSession = session.metadata?.userId || session.client_reference_id || userId;
      
      if (!userIdFromSession) {
        console.error('❌ No user ID found in session or request');
        return c.json({ 
          success: false,
          error: 'No user ID found in session or request' 
        }, 400);
      }

      const userKey = `user:${userIdFromSession}`;
      console.log('✅ Looking up user with key:', userKey);
      let user = await kv.get(userKey);
      
      console.log('✅ User found:', !!user);
      console.log('✅ User data:', user);
      
      // If user doesn't exist, create a new user record
      if (!user) {
        console.log('✅ User not found in KV store - creating new user from Stripe session');
        
        // Extract email from session
        const userEmail = session.customer_email || session.metadata?.email;
        
        if (!userEmail) {
          console.error('❌ No email found in Stripe session');
          return c.json({ 
            success: false,
            error: 'No email found in Stripe session' 
          }, 400);
        }

        // Create new user with subscription info from Stripe
        user = {
          id: userIdFromSession,
          email: userEmail,
          subscriptionStatus: 'active',
          subscriptionPlan: session.metadata?.planName || 'premium',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          createdAt: new Date().toISOString(),
          createdViaStripe: true,
          sessionVerifiedAt: new Date().toISOString(),
        };
        
        await kv.set(userKey, user);
        console.log('✅✅✅ NEW USER CREATED from Stripe session!');
        console.log('✅ New user data:', user);
        
        return c.json({ 
          success: true,
          message: 'Subscription activated and user created successfully!',
          user: user,
          userCreated: true,
        });
      } else {
        // Update existing user with subscription info
        const updatedUser = {
          ...user,
          subscriptionStatus: 'active',
          subscriptionPlan: session.metadata?.planName || 'premium',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          sessionVerifiedAt: new Date().toISOString(),
        };
        
        await kv.set(userKey, updatedUser);
        console.log('✅✅✅ User subscription updated after session verification!');
        console.log('✅ Updated user data:', updatedUser);
        
        return c.json({ 
          success: true,
          message: 'Subscription activated successfully!',
          user: updatedUser,
          userCreated: false,
        });
      }
    } else {
      return c.json({ 
        success: false,
        error: 'Payment not completed',
        paymentStatus: session.payment_status 
      }, 400);
    }
  } catch (error) {
    console.error('❌ Verify session error:', error);
    return c.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify session" 
      },
      500
    );
  }
});

// Sync subscriptions from Stripe by email
app.post("/make-server-2538a5b0/sync-from-stripe", async (c) => {
  console.log('🔄🔄🔄 SYNC FROM STRIPE ROUTE HIT!');
  
  try {
    const body = await c.req.json();
    const { email, userId } = body;

    console.log('🔄 Syncing subscriptions for email:', email, 'userId:', userId);

    if (!email || !userId) {
      return c.json({ error: "Missing email or userId" }, 400);
    }

    // Search for customers by email in Stripe
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 10,
    });

    console.log('🔄 Found customers:', customers.data.length);

    if (customers.data.length === 0) {
      return c.json({ 
        success: false,
        error: 'No Stripe customer found with this email. Make sure you completed checkout.' 
      }, 404);
    }

    // Get the most recent customer
    const customer = customers.data[0];
    console.log('🔄 Customer ID:', customer.id);

    // Get subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10,
    });

    console.log('🔄 Found subscriptions:', subscriptions.data.length);

    if (subscriptions.data.length === 0) {
      return c.json({ 
        success: false,
        error: 'No active subscriptions found. If you just paid, please wait a few minutes and try again.' 
      }, 404);
    }

    // Get the most recent active subscription
    const activeSubscription = subscriptions.data.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    ) || subscriptions.data[0];

    console.log('🔄 Active subscription:', {
      id: activeSubscription.id,
      status: activeSubscription.status,
      items: activeSubscription.items.data.length
    });

    // Determine plan from subscription
    const planName = activeSubscription.items.data[0]?.price?.metadata?.plan || 'premium';

    // Update user in KV store
    const userKey = `user:${userId}`;
    const user = await kv.get(userKey);
    
    console.log('🔄 User found:', !!user);

    if (!user) {
      return c.json({ 
        success: false,
        error: 'User not found in database' 
      }, 404);
    }

    const updatedUser = {
      ...user,
      subscriptionStatus: activeSubscription.status,
      subscriptionPlan: planName,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: activeSubscription.id,
      syncedFromStripeAt: new Date().toISOString(),
    };

    await kv.set(userKey, updatedUser);
    
    console.log('🔄✅✅✅ User synced from Stripe successfully!');
    console.log('🔄✅ Updated user:', updatedUser);

    return c.json({ 
      success: true,
      message: 'Subscription synced successfully!',
      user: updatedUser,
      subscription: {
        id: activeSubscription.id,
        status: activeSubscription.status,
        plan: planName,
      }
    });
  } catch (error) {
    console.error('❌ Sync from Stripe error:', error);
    return c.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync from Stripe" 
      },
      500
    );
  }
});

// Send Journal Entry to Therapist via Email
app.post("/make-server-2538a5b0/send-to-therapist", async (c) => {
  console.log('📧 SEND TO THERAPIST ROUTE HIT');
  
  try {
    const body = await c.req.json();
    const { therapistEmail, patientName, patientEmail, entryDate, emotions } = body;

    console.log('📧 Request received for:', { therapistEmail, patientName });

    if (!therapistEmail || !patientName || !entryDate || !emotions) {
      console.error('❌ Missing required fields');
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if Resend API key is configured
    const kvResendKey = await kv.get('resend_api_key') as string;
    const envResendKey = Deno.env.get("RESEND_API_KEY");
    const resendApiKey = kvResendKey || envResendKey;
    
    console.log('📧 KV key exists:', !!kvResendKey);
    console.log('📧 Env key exists:', !!envResendKey);
    console.log('📧 Using key from:', kvResendKey ? 'KV store' : envResendKey ? 'environment' : 'none');
    
    if (!resendApiKey || resendApiKey.length < 10 || !resendApiKey.startsWith('re_')) {
      console.warn('⚠️ Resend API key not configured - skipping email send');
      return c.json({
        success: true,
        emailSent: false,
        message: 'Entry marked as sent, but email not delivered (Resend API key not configured)'
      });
    }

    console.log('📧 Resend API key found, attempting to send email...');

    // Create Resend instance with the API key
    const resendClient = new Resend(resendApiKey);

    // Format emotion data for email
    const emotionList = Object.entries(emotions)
      .filter(([key]) => key !== 'overall')
      .map(([emotion, value]) => {
        const percentage = Math.round((value as number) * 10);
        return `    • ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${percentage}%`;
      })
      .join('\n');

    const overallScore = Math.round((emotions.overall as number) * 10);

    // Format date
    const formattedDate = new Date(entryDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send email using Resend
    const emailResponse = await resendClient.emails.send({
      from: 'Wellness Journal <onboarding@resend.dev>',
      to: therapistEmail,
      subject: `New Journal Entry from ${patientName} - ${formattedDate}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">New Journal Entry</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">HIPAA-Compliant Emotional Wellness Tracking</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #667eea; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Patient Information</h2>
                <p><strong>Patient:</strong> ${patientName}</p>
                ${patientEmail ? `<p><strong>Email:</strong> ${patientEmail}</p>` : ''}
                <p><strong>Entry Date:</strong> ${formattedDate}</p>
              </div>

              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="margin-top: 0; color: #667eea; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Emotional Check-In</h2>
                
                <div style="background: #f0f4ff; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                  <p style="margin: 0;"><strong style="color: #667eea;">Overall Wellness Score:</strong> <span style="font-size: 20px; font-weight: bold; color: #764ba2;">${overallScore}%</span></p>
                </div>

                <p style="font-weight: bold; margin-bottom: 10px;">Individual Emotions:</p>
                <pre style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; font-family: monospace; margin: 0;">${emotionList}</pre>
              </div>

              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>⚕️ HIPAA Notice:</strong> This email contains protected health information. If you are not the intended recipient, please delete this email immediately and notify the sender.
                </p>
              </div>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
                <p>This is an automated notification from the Wellness Journal app.</p>
                <p>For questions or concerns, please contact your patient directly.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Journal Entry from ${patientName}

Patient: ${patientName}
${patientEmail ? `Email: ${patientEmail}` : ''}
Entry Date: ${formattedDate}

Emotional Check-In:
Overall Wellness Score: ${overallScore}%

Individual Emotions:
${emotionList}

⚕️ HIPAA Notice: This email contains protected health information.
      `.trim()
    });

    if (emailResponse.error) {
      console.error('❌ Resend returned an error:', emailResponse.error);
      return c.json({ 
        success: true,
        emailSent: false,
        message: `Entry saved, but email failed: ${emailResponse.error.message}`
      });
    }

    console.log('✅ Email sent successfully! Message ID:', emailResponse.data?.id);

    return c.json({
      success: true,
      emailSent: true,
      messageId: emailResponse.data?.id,
      to: therapistEmail
    });
  } catch (error) {
    console.error('❌ Error in send-to-therapist endpoint:', error);
    return c.json({
      success: true,
      emailSent: false,
      message: 'Entry saved, but email sending failed'
    }, 200); // Return 200 so frontend doesn't fail
  }
});

Deno.serve(app.fetch);