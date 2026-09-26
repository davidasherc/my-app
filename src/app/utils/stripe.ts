// Stripe Integration Utilities
// Import this in components that need Stripe functionality

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_PRICE_IDS, STRIPE_PUBLISHABLE_KEY } from './stripe/config';

// Initialize Stripe (singleton pattern)
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY === 'pk_test_YOUR_KEY_HERE') {
      console.error('⚠️ Please update STRIPE_PUBLISHABLE_KEY in /utils/stripe/config.ts');
      return null;
    }
    
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Price IDs from config file
export const STRIPE_PRICES = STRIPE_PRICE_IDS;

// Supabase Edge Function URL
import { projectId, publicAnonKey } from './supabase/info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY = publicAnonKey;

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  email: string;
  planName: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
  authToken?: string
): Promise<{ sessionId: string; url: string } | null> {
  try {
    console.log('🔥🔥🔥 createCheckoutSession STARTING 🔥🔥🔥');
    console.log('🔥 Timestamp:', new Date().toISOString());
    console.log('🔥 Params:', params);
    console.log('🔥 Using SUPABASE_URL:', SUPABASE_URL);
    console.log('🔥 Using auth:', authToken ? 'Custom token' : 'Anon key');
    console.log('🔥 Window origin:', window.location.origin);
    
    const url = `${SUPABASE_URL}/functions/v1/make-server-2538a5b0/create-checkout-session`;
    console.log('🔥 Full request URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        priceId: params.priceId,
        userId: params.userId,
        email: params.email,
        planName: params.planName,
        successUrl: params.successUrl || `${window.location.origin}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancelUrl: params.cancelUrl || `${window.location.origin}/?canceled=true`,
      }),
    });

    console.log('🔥 Response received!');
    console.log('🔥 Response status:', response.status);
    console.log('🔥 Response ok:', response.ok);
    console.log('🔥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ Response NOT OK - Reading error...');
      const errorText = await response.text();
      console.error('❌ Error response text:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('❌ Parsed error data:', errorData);
      } catch (e) {
        console.error('❌ Could not parse error as JSON');
        errorData = { error: errorText };
      }
      
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅✅✅ Checkout session created successfully!');
    console.log('✅ Response data:', data);
    return data;
  } catch (error) {
    console.error('❌❌❌ Error in createCheckoutSession! ❌❌❌');
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ Full error object:', error);
    throw error;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw error;
  }
}

/**
 * Get price ID based on plan and billing cycle
 */
export function getPriceId(plan: 'premium' | 'family', cycle: 'monthly' | 'yearly'): string {
  console.log('🔵 getPriceId called with:', { plan, cycle });
  console.log('🔵 Available STRIPE_PRICES:', STRIPE_PRICES);
  
  const key = `${plan}_${cycle}` as keyof typeof STRIPE_PRICES;
  const priceId = STRIPE_PRICES[key];
  
  console.log('🔵 Looking for key:', key);
  console.log('🔵 Found priceId:', priceId);
  
  if (!priceId) {
    console.error('❌ Price ID not found!', { plan, cycle, key, STRIPE_PRICES });
    throw new Error(`Price ID not found for ${plan} ${cycle}`);
  }
  
  return priceId;
}

/**
 * Handle successful checkout (call this on success page)
 */
export async function handleCheckoutSuccess(sessionId: string): Promise<void> {
  // The webhook will handle updating the user's subscription
  // This is just for UI feedback
  console.log('Checkout successful:', sessionId);
  
  // You can optionally verify the session here
  // by calling your backend to confirm the subscription was created
}

/**
 * Create a Customer Portal session (for managing subscriptions)
 */
export async function createPortalSession(
  customerId: string,
  authToken?: string
): Promise<{ url: string } | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/make-server-2538a5b0/create-portal-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}