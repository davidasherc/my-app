import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import Stripe from "npm:stripe@17.4.0";

const app = new Hono();

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
});

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

// Test Resend API key endpoint
app.get("/make-server-2538a5b0/test-resend", (c) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  return c.json({
    configured: !!resendApiKey,
    length: resendApiKey?.length || 0,
    startsWithRe: resendApiKey?.startsWith('re_') || false,
    first10Chars: resendApiKey?.substring(0, 10) || 'none'
  });
});

// Authentication endpoints
app.post("/make-server-2538a5b0/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    console.log('🔐 Login attempt for:', email);

    // Demo user credentials
    if (email === 'demo@example.com' && password === 'demo123') {
      // Check if demo user exists in KV with subscription data
      const userKey = `user:${email}`;
      let demoUser = await kv.get(userKey);

      if (!demoUser) {
        // Create default demo user
        demoUser = {
          id: '0',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          subscriptionStatus: 'trial',
          subscriptionPlan: 'basic',
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        await kv.set(userKey, demoUser);
      }

      console.log('✅ Demo user login successful with subscription:', demoUser.subscriptionPlan);
      const { password: _, ...userWithoutPassword } = demoUser;
      return c.json({ success: true, user: userWithoutPassword });
    }

    // Check KV store for registered users
    const userKey = `user:${email}`;
    const userData = await kv.get(userKey);

    if (userData && userData.password === password) {
      const { password: _, ...userWithoutPassword } = userData;
      console.log('✅ User login successful:', email);
      return c.json({ success: true, user: userWithoutPassword });
    }

    console.log('❌ Invalid credentials for:', email);
    return c.json({ success: false, error: 'Invalid email or password' }, 401);
  } catch (error) {
    console.error('❌ Login error:', error);
    return c.json({ success: false, error: 'Login failed. Please try again.' }, 500);
  }
});

app.post("/make-server-2538a5b0/auth/register", async (c) => {
  try {
    const { email, password, firstName, lastName, therapistEmail } = await c.req.json();
    console.log('📝 Registration attempt for:', email);

    // Check if user already exists
    const userKey = `user:${email}`;
    const existingUser = await kv.get(userKey);

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return c.json({ success: false, error: 'User already exists' }, 400);
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, this should be hashed!
      firstName,
      lastName,
      therapistEmail: therapistEmail || undefined,
      subscriptionStatus: 'trial',
      subscriptionPlan: 'basic',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    await kv.set(userKey, newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    console.log('✅ User registered successfully:', email);
    return c.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return c.json({ success: false, error: 'Registration failed. Please try again.' }, 500);
  }
});

// Stripe checkout session endpoint
app.post("/make-server-2538a5b0/create-checkout-session", async (c) => {
  try {
    const { priceId, userId, email, planName, successUrl, cancelUrl } = await c.req.json();
    console.log('💳 Creating checkout session for:', { priceId, userId, email, planName });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
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
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log('✅ Checkout session created:', session.id);
    return c.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Checkout session error:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to create checkout session' }, 500);
  }
});

// Manual sync subscription from Stripe
app.post("/make-server-2538a5b0/sync-from-stripe", async (c) => {
  try {
    const { userId, email } = await c.req.json();
    console.log('🔄🔄🔄 SYNC FROM STRIPE STARTING');
    console.log('🔄 User ID:', userId);
    console.log('🔄 Email:', email);

    // Search for ANY recent customers or subscriptions in Stripe
    console.log('🔄 Searching Stripe for customers...');
    const recentCustomers = await stripe.customers.list({
      limit: 100
    });

    console.log('🔄 Found', recentCustomers.data.length, 'total customers in Stripe');

    // Also try searching by the specific email
    const customersByEmail = await stripe.customers.list({
      email: email,
      limit: 10
    });

    console.log('🔄 Found', customersByEmail.data.length, 'customers with email:', email);

    if (customersByEmail.data.length === 0) {
      console.log('❌ No customer found with this email');
      console.log('🔄 Recent customers emails:', recentCustomers.data.slice(0, 5).map(c => c.email));
      return c.json({
        success: false,
        error: `No Stripe customer found with email: ${email}. Did you use a different email when checking out?`,
        recentEmails: recentCustomers.data.slice(0, 5).map(c => c.email).filter(Boolean)
      });
    }

    const customer = customersByEmail.data[0];
    console.log('✅ Found Stripe customer:', customer.id);

    // Get subscriptions for this customer
    console.log('🔄 Fetching subscriptions for customer:', customer.id);
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10
    });

    console.log('🔄 Found', subscriptions.data.length, 'subscriptions');
    console.log('🔄 Subscription statuses:', subscriptions.data.map(s => s.status));

    const activeSubscription = subscriptions.data.find(s => s.status === 'active');

    if (!activeSubscription) {
      console.log('❌ No active subscription found');
      return c.json({
        success: false,
        error: 'No active subscription found. Subscription may still be processing.'
      });
    }

    const priceId = activeSubscription.items.data[0].price.id;
    console.log('🔄 Price ID:', priceId);

    // Determine plan based on price ID
    let planName = 'premium';
    if (priceId.includes('family') || priceId.includes('Family')) {
      planName = 'family';
    }

    console.log('✅ Determined plan:', planName);

    // Update user in KV store
    const userKey = `user:${email}`;
    console.log('🔄 Fetching user from KV:', userKey);
    let userData = await kv.get(userKey);

    if (!userData) {
      console.log('⚠️ User not in KV, creating...');
      userData = {
        id: userId,
        email: email,
        firstName: 'User',
        lastName: 'Name',
        subscriptionStatus: 'active',
        subscriptionPlan: planName,
        stripeCustomerId: customer.id,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
    } else {
      console.log('✅ Found user in KV, updating...');
      userData.subscriptionStatus = 'active';
      userData.subscriptionPlan = planName;
      userData.stripeCustomerId = customer.id;
    }

    await kv.set(userKey, userData);
    console.log('✅✅✅ USER UPDATED SUCCESSFULLY');
    console.log('✅ New plan:', userData.subscriptionPlan);
    console.log('✅ New status:', userData.subscriptionStatus);

    return c.json({
      success: true,
      message: `Subscription activated: ${planName.toUpperCase()}!`,
      user: userData
    });
  } catch (error) {
    console.error('❌❌❌ SYNC ERROR:', error);
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Sync failed. Please check server logs.'
    }, 500);
  }
});

// Get user by ID
app.post("/make-server-2538a5b0/get-user", async (c) => {
  try {
    const { userId } = await c.req.json();
    console.log('📥 Getting user:', userId);

    // Try to find user by ID first
    const userKeys = await kv.getByPrefix('user:');
    const user = userKeys.find((u: any) => u.id === userId);

    if (user) {
      return c.json({ success: true, user });
    }

    return c.json({ success: false, error: 'User not found' });
  } catch (error) {
    console.error('❌ Get user error:', error);
    return c.json({ success: false, error: 'Failed to get user' }, 500);
  }
});

// Send journal entry to therapist via email
app.post("/make-server-2538a5b0/send-to-therapist", async (c) => {
  try {
    const { therapistEmail, patientName, patientEmail, entryDate, emotions } = await c.req.json();
    console.log('📧 Sending email to therapist:', therapistEmail);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log('🔑 RESEND_API_KEY exists:', !!resendApiKey);
    console.log('🔑 RESEND_API_KEY length:', resendApiKey?.length || 0);
    console.log('🔑 RESEND_API_KEY starts with re_:', resendApiKey?.startsWith('re_'));

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return c.json({ success: false, error: 'Email service not configured' }, 500);
    }

    // Format the emotion data for email
    const emotionsList = Object.entries(emotions)
      .map(([emotion, value]) => `${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${value}/10`)
      .join('\n');

    const emailBody = `
Hello,

Your patient ${patientName} (${patientEmail}) has shared their Mood2Day journal entry with you.

Entry Date: ${new Date(entryDate).toLocaleDateString()}

Emotion Ratings:
${emotionsList}

---
This email was sent via Mood2Day, a HIPAA-compliant emotional wellness tracking application.
    `.trim();

    // Send email via Resend (using onboarding@resend.dev for testing)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mood2Day <onboarding@resend.dev>',
        to: therapistEmail,
        subject: `New Journal Entry from ${patientName}`,
        text: emailBody,
      }),
    });

    console.log('📧 Resend API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Resend API error:', errorText);
      return c.json({ success: false, error: 'Failed to send email' }, 500);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result);

    return c.json({ success: true, message: 'Email sent to therapist' });
  } catch (error) {
    console.error('❌ Send to therapist error:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Failed to send email' }, 500);
  }
});

// Stripe customer portal endpoint
app.post("/make-server-2538a5b0/create-portal-session", async (c) => {
  try {
    const { customerId, returnUrl } = await c.req.json();
    console.log('🔧 Creating portal session for customer:', customerId);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log('✅ Portal session created');
    return c.json({ url: session.url });
  } catch (error) {
    console.error('❌ Portal session error:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to create portal session' }, 500);
  }
});

// Stripe webhook endpoint
app.post("/make-server-2538a5b0/webhook", async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const body = await c.req.text();

    if (!signature) {
      return c.json({ error: 'Missing stripe-signature header' }, 400);
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return c.json({ error: 'Webhook secret not configured' }, 500);
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('🎯 Webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        const planName = session.metadata?.planName;

        if (userId) {
          console.log('✅ Checkout completed for user:', userId, 'plan:', planName);

          // Update user in KV store
          const userKey = `user:${userId}`;
          const userData = await kv.get(userKey);

          if (userData) {
            userData.subscriptionStatus = 'active';
            userData.subscriptionPlan = planName;
            userData.stripeCustomerId = session.customer as string;
            await kv.set(userKey, userData);
            console.log('✅ User updated with subscription');
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const allUsers = await kv.getByPrefix('user:');
        const user = allUsers.find((u: any) => u.stripeCustomerId === customerId);

        if (user) {
          user.subscriptionStatus = 'cancelled';
          user.subscriptionPlan = 'basic';
          const userKey = `user:${user.id}`;
          await kv.set(userKey, user);
          console.log('✅ Subscription cancelled for user:', user.id);
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Webhook failed' }, 400);
  }
});

Deno.serve(app.fetch);