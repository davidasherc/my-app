// Supabase Edge Function: Create Stripe Customer Portal Session
// Deploy: supabase functions deploy create-portal-session

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
    const { customerId, returnUrl } = await req.json();

    // Validate required fields
    if (!customerId) {
      throw new Error('Missing required field: customerId');
    }

    // Get the return URL from request or use default
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    const finalReturnUrl = returnUrl || origin;

    // Create Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: finalReturnUrl,
    });

    return new Response(
      JSON.stringify({ 
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating portal session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create portal session' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
