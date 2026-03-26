# 🔐 Complete Stripe Setup Guide for HIPAA-Compliant Journaling App

## 📋 Overview
This guide walks you through setting up Stripe payments for your freemium journaling app, including HIPAA compliance requirements.

---

## 🎯 Quick Start Checklist

- [ ] Create Stripe account
- [ ] Sign Stripe's BAA (Business Associate Agreement)
- [ ] Create Products & Prices in Stripe Dashboard
- [ ] Get API Keys (Publishable & Secret)
- [ ] Configure Webhooks
- [ ] Add environment variables to your app
- [ ] Set up Supabase Edge Functions (or backend)
- [ ] Test with test cards
- [ ] Switch to live mode for production

---

## 1️⃣ Create Stripe Account & HIPAA Compliance

### Step 1.1: Sign Up for Stripe
1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Complete business verification:
   - Business type (Individual, Company, or Non-profit)
   - Tax ID (EIN or SSN)
   - Bank account for payouts
   - Business details

### Step 1.2: Sign the BAA (CRITICAL for HIPAA)
**This is mandatory for healthcare apps!**

1. Go to: https://dashboard.stripe.com/settings/compliance
2. Look for "HIPAA" section or contact Stripe support
3. Request and sign the Business Associate Agreement (BAA)
4. Wait for Stripe to approve (usually 1-2 business days)

**Important Notes:**
- Without a signed BAA, your app is NOT HIPAA compliant
- The BAA must be in place BEFORE processing any real patient data
- Stripe's BAA covers payment processing, NOT the health data itself
- Your app must still maintain HIPAA compliance for journal entries

### Step 1.3: Configure HIPAA Settings
1. In Stripe Dashboard → Settings → HIPAA
2. Enable "HIPAA mode" if available
3. Configure data retention policies
4. Avoid logging PHI (Protected Health Information) in Stripe metadata

---

## 2️⃣ Create Products & Prices in Stripe Dashboard

### Step 2.1: Navigate to Products
1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. Click **Products** in left sidebar
3. Click **+ Add product**

### Step 2.2: Create Premium Subscription Product

**Product Details:**
- **Name:** Premium Subscription
- **Description:** "Advanced emotional tracking with 6 emotion sliders and 5-month history"
- **Upload image:** (optional - add your app logo)

**Pricing:**
- **Pricing model:** Recurring
- **Price:** $9.99 USD
- **Billing period:** Monthly
- **Billing:** Charge automatically
- **Free trial:** (optional) 7 days or 14 days

Click **Save product**

**Important:** Copy the **Price ID** - it looks like `price_1A2B3C4D5E6F7G8H9I0J`

### Step 2.3: (Optional) Create Yearly Plan
If you want to offer yearly billing with discount:

1. Go to the same product
2. Click **Add another price**
3. Set price: $99.99 USD (17% discount from monthly)
4. Billing period: Yearly
5. Save and copy this **Price ID** too

### Step 2.4: Create Family Plan (Optional)
Repeat the process for Family plan:
- **Name:** Family Subscription
- **Price:** $14.99/month or $149.99/year
- **Description:** "Up to 4 family accounts with shared insights"

---

## 3️⃣ Get Your API Keys

### Step 3.1: Find Your Keys
1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see:
   - **Publishable key:** `pk_test_...` (safe to use in frontend)
   - **Secret key:** `sk_test_...` (NEVER expose in frontend!)

### Step 3.2: Test vs Live Keys
- **Test mode:** Use for development
  - Test keys start with `pk_test_` and `sk_test_`
  - Use test credit cards (e.g., 4242 4242 4242 4242)
  - No real charges

- **Live mode:** Use for production
  - Toggle to "Live mode" in top right
  - Keys start with `pk_live_` and `sk_live_`
  - Real charges to real cards

### Step 3.3: Copy Your Keys
```bash
# Test Mode Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEf...
STRIPE_SECRET_KEY=sk_test_51AbCdEf...

# Live Mode Keys (for production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51AbCdEf...
STRIPE_SECRET_KEY=sk_live_51AbCdEf...
```

---

## 4️⃣ Configure Webhooks

Webhooks notify your backend when subscription events occur (payment success, cancellation, etc.)

### Step 4.1: Create Webhook Endpoint
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. Enter your endpoint URL:
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```
   (Replace with your actual Supabase project URL)

### Step 4.2: Select Events to Listen To
Check these events:
- ✅ `checkout.session.completed` - User completed checkout
- ✅ `customer.subscription.created` - New subscription
- ✅ `customer.subscription.updated` - Plan change
- ✅ `customer.subscription.deleted` - Cancellation
- ✅ `invoice.payment_succeeded` - Successful payment
- ✅ `invoice.payment_failed` - Failed payment

### Step 4.3: Get Webhook Signing Secret
1. After creating the endpoint, click on it
2. Click **Reveal** under "Signing secret"
3. Copy the secret (looks like `whsec_...`)
4. Save it as `STRIPE_WEBHOOK_SECRET`

---

## 5️⃣ Environment Variables Setup

### Where to Add These Values

#### Option A: Using Supabase (Recommended for production)
You'll add these in **two places**:

**1. Supabase Dashboard (for Edge Functions):**
1. Go to: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **Edge Functions** → **Secrets**
4. Add these secrets:

```bash
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_1...
STRIPE_FAMILY_PRICE_ID=price_1...
```

**2. Your Local `.env` File (for frontend):**
Create a `.env` file in your project root:

```bash
# Stripe Public Keys (safe for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEf...

# Supabase Config
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

#### Option B: Local Development Only
Create `.env` file in project root:

```bash
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_PREMIUM_PRICE_ID=price_1...
STRIPE_FAMILY_PRICE_ID=price_1...
```

**⚠️ Important:** Add `.env` to your `.gitignore` to never commit secrets!

---

## 6️⃣ Current Implementation Check

### Files That Need Stripe Configuration

#### 1. `/components/SubscriptionManager.tsx`
**Location:** Line 106-128 (the `handleSubscribe` function)

**What to change:**
Replace the mock implementation with actual Stripe checkout:

```tsx
const handleSubscribe = async (planId: string) => {
  if (planId === 'free') return;
  
  setIsProcessing(true);
  
  try {
    // Call your backend to create Stripe Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}` // Your auth token
      },
      body: JSON.stringify({
        priceId: planId === 'premium' 
          ? import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID 
          : import.meta.env.VITE_STRIPE_FAMILY_PRICE_ID,
        userId: user.id,
        email: user.email
      })
    });
    
    const { sessionId } = await response.json();
    
    // Redirect to Stripe Checkout
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    await stripe.redirectToCheckout({ sessionId });
    
  } catch (error) {
    console.error('Subscription failed:', error);
  } finally {
    setIsProcessing(false);
  }
};
```

#### 2. Need to Create: Backend API Endpoint

**Option A: Supabase Edge Function** (Recommended)
Create: `supabase/functions/create-checkout-session/index.ts`

**Option B: Your Own Backend**
Create an API endpoint at: `/api/create-checkout-session`

---

## 7️⃣ Backend Setup (Supabase Edge Functions)

### Step 7.1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 7.2: Login to Supabase
```bash
supabase login
```

### Step 7.3: Link Your Project
```bash
supabase link --project-ref your-project-id
```

### Step 7.4: Create Edge Functions Directory
```bash
mkdir -p supabase/functions
```

I'll create the complete edge function code for you next!

---

## 8️⃣ Testing Your Integration

### Test Cards (Stripe Test Mode)

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Declined Card:**
```
Card: 4000 0000 0000 0002
```

**Requires 3D Secure:**
```
Card: 4000 0025 0000 3155
```

### Testing Checklist
- [ ] Can create checkout session
- [ ] Redirect to Stripe Checkout works
- [ ] Successful payment updates user subscription
- [ ] Webhook receives events
- [ ] User gains access to premium features
- [ ] Cancellation works properly
- [ ] Failed payment is handled gracefully

---

## 9️⃣ Go Live Checklist

Before switching to production:

### Business Requirements
- [ ] Business verified in Stripe
- [ ] Bank account connected
- [ ] BAA signed and approved
- [ ] Terms of Service mentions subscriptions
- [ ] Privacy Policy covers payment data
- [ ] Refund policy documented

### Technical Requirements
- [ ] All webhooks tested
- [ ] Error handling implemented
- [ ] Email confirmations working
- [ ] Subscription status synced to database
- [ ] Cancel/upgrade flows tested
- [ ] Mobile payment tested (Apple/Google Pay)

### Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live mode** (top right)
2. Get your live API keys
3. Update environment variables with live keys
4. Update webhook endpoint URL to production
5. Test with small real payment
6. Monitor first few transactions closely

---

## 🔟 Monthly Maintenance

### Things to Monitor
- **Failed payments:** Set up retry logic
- **Churn rate:** Track cancellations
- **Webhook failures:** Check webhook logs
- **Fraud alerts:** Review Stripe Radar
- **Subscription metrics:** MRR, active users

### Where to Check
- Stripe Dashboard: https://dashboard.stripe.com
- Payments tab: See all transactions
- Subscriptions tab: Active/cancelled subscriptions
- Webhooks tab: Event delivery status
- Analytics tab: Revenue metrics

---

## 🆘 Troubleshooting

### "No such price: price_xxx"
- **Cause:** Price ID is incorrect or from wrong mode (test vs live)
- **Fix:** Copy the correct Price ID from Stripe Dashboard

### "Webhook signature verification failed"
- **Cause:** Wrong webhook secret or payload modified
- **Fix:** Re-copy webhook secret, ensure raw body is used

### "This customer has no attached payment method"
- **Cause:** Checkout session didn't complete
- **Fix:** Ensure `mode: 'subscription'` in checkout session

### "Customer subscription already exists"
- **Cause:** User trying to subscribe twice
- **Fix:** Check for existing subscription before creating new one

---

## 📞 Support Resources

- **Stripe Docs:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **HIPAA Guide:** https://stripe.com/guides/hipaa
- **Test Cards:** https://stripe.com/docs/testing
- **Webhook Testing:** https://stripe.com/docs/webhooks/test

---

## 🎉 Next Steps

1. ✅ Complete steps 1-5 in this guide
2. ✅ Review the code files I'll create next
3. ✅ Test in Stripe test mode
4. ✅ Deploy to production
5. ✅ Start accepting payments!

---

**Ready to implement?** Let me know when you've completed the Stripe Dashboard setup (steps 1-4), and I'll help you with the backend code!
