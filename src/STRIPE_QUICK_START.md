# 🚀 Stripe Quick Start - Get Running in 15 Minutes

This is the **fastest path** to get Stripe payments working in your app.

---

## ⚡ 5-Minute Stripe Dashboard Setup

### Step 1: Create Stripe Account (2 min)
1. Go to https://stripe.com
2. Click "Start now" → Sign up
3. Skip optional steps for now (you can complete verification later)

### Step 2: Get Your Test API Keys (1 min)
1. In Stripe Dashboard, click **Developers** (top right)
2. Click **API keys**
3. Copy these two values:

```
Publishable key: pk_test_51AbCdEf... 
Secret key: sk_test_51AbCdEf...  (Click "Reveal")
```

**📋 Save these somewhere safe!**

### Step 3: Create Your Product (2 min)
1. Click **Products** in left sidebar
2. Click **+ Add product**
3. Fill in:
   - Name: `Premium Subscription`
   - Description: `Monthly subscription`
   - Price: `9.99 USD`
   - Billing period: `Monthly`
   - Click **Save**

4. **COPY THE PRICE ID** - it looks like: `price_1AbCdEf...`

**📋 Save this Price ID!**

---

## 🔧 5-Minute App Configuration

### Step 4: Create .env File (2 min)

In your project root, create a file named `.env`:

```bash
# Paste your keys here (replace with YOUR actual values)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEf...
VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_1AbCdEf...

# You'll add these later when you set up Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Step 5: Install Dependencies (1 min)

```bash
npm install @stripe/stripe-js
```

### Step 6: Update SubscriptionManager (2 min)

Replace the contents of `/components/SubscriptionManager.tsx` with the file `/components/SubscriptionManager-with-stripe.tsx`:

```bash
# On Mac/Linux:
cp components/SubscriptionManager-with-stripe.tsx components/SubscriptionManager.tsx

# On Windows:
copy components\SubscriptionManager-with-stripe.tsx components\SubscriptionManager.tsx
```

---

## 🧪 Test Your Integration (5 min)

### Step 7: Start Your App

```bash
npm run dev
```

### Step 8: Try a Test Payment

1. Navigate to the Subscriptions page
2. Click "Upgrade to Premium"
3. You should see a Stripe Checkout page
4. Use test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```
5. Click "Pay"

**✅ Success!** You should be redirected back to your app.

---

## 📊 What's Working Now vs What Needs Backend

### ✅ Working NOW (Without Backend)
- Stripe Checkout loads
- Payment form works
- Test payments succeed
- Redirect back to app works

### ⏳ Needs Backend (Supabase Setup)
- Updating user subscription status in database
- Webhook handling (for renewals, cancellations)
- Subscription management portal
- Persistent subscription state

---

## 🏗️ Next Steps: Add Supabase Backend

To make subscriptions fully functional, you need to:

### 1. Set Up Supabase (10 min)
- Create Supabase account at https://supabase.com
- Create new project
- Copy Project URL and Anon Key to `.env`

### 2. Deploy Edge Functions (5 min)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session
```

### 3. Add Supabase Secrets (3 min)
In Supabase Dashboard → Settings → Edge Functions → Secrets:
```
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_... (from webhooks - see below)
```

### 4. Set Up Database (5 min)
In Supabase Dashboard → SQL Editor, run:
`/supabase/migrations/001_stripe_schema.sql`

### 5. Configure Webhooks (5 min)
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events (see STRIPE_SETUP_GUIDE.md)
4. Copy webhook secret to Supabase secrets

---

## 🎯 Testing Checklist

### Basic Flow
- [ ] Can click "Upgrade to Premium"
- [ ] Stripe Checkout page loads
- [ ] Can enter test card info
- [ ] Payment succeeds
- [ ] Redirects back to app

### With Backend (After Supabase Setup)
- [ ] User subscription status updates
- [ ] Premium features unlock
- [ ] Can manage subscription
- [ ] Webhooks receive events
- [ ] Can cancel subscription

---

## 🆘 Quick Troubleshooting

**"Stripe is not defined"**
```bash
# Install the package
npm install @stripe/stripe-js
```

**"VITE_STRIPE_PUBLISHABLE_KEY is not defined"**
- Check `.env` file exists in project root
- Check variable name matches exactly
- Restart dev server: `npm run dev`

**"No such price: price_xxx"**
- Copy the Price ID from Stripe Dashboard → Products
- Update `VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID` in `.env`

**"This payment could not be completed"**
- Make sure you're using test mode
- Use test card: `4242 4242 4242 4242`

---

## 📚 Full Documentation

For complete setup including HIPAA compliance, webhooks, and production deployment:

- **Complete Guide:** `/STRIPE_SETUP_GUIDE.md`
- **Deployment Checklist:** `/STRIPE_DEPLOYMENT_CHECKLIST.md`
- **Environment Variables:** `/.env.example`

---

## ✅ You're Done!

You now have a working Stripe integration! 

**Current Status:**
- ✅ Stripe Checkout works
- ✅ Test payments process
- ⏳ Need Supabase for full functionality

**Next Step:** Set up Supabase backend to make subscriptions persist.

See `/STRIPE_SETUP_GUIDE.md` for detailed backend setup.

---

## 💡 Pro Tips

1. **Test Mode:** You're in test mode - no real charges!
2. **Test Cards:** More at https://stripe.com/docs/testing
3. **Dashboard:** Check payments in Stripe Dashboard
4. **HIPAA:** Don't forget to sign the BAA before going live!

Happy coding! 🚀
