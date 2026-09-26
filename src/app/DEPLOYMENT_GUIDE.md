# 🚀 Complete Stripe + Supabase Deployment Guide

This guide will walk you through deploying your full-stack subscription system.

---

## 📋 **Prerequisites**

Before starting, make sure you have:
- ✅ Stripe account created (test mode)
- ✅ Supabase project created (project ref: `pyixvaanmebwlxsivlue`)
- ✅ Your `.env` file with Supabase URL and anon key

---

## 🎯 **Part 1: Stripe Dashboard Setup (15 minutes)**

### **Step 1: Get Your Stripe API Keys**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

**Add to your `.env` file:**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

---

### **Step 2: Create Products & Price IDs**

Go to: https://dashboard.stripe.com/test/products

#### **Product 1: Premium Monthly**
1. Click **+ Add product**
2. Fill in:
   - Name: `Premium Monthly`
   - Description: `Monthly premium subscription - 6 emotion sliders, 5-month history`
   - **Pricing:**
     - Price: `9.99 USD`
     - Billing period: **Monthly** (Recurring)
3. Click **Add product**
4. **COPY THE PRICE ID** (looks like `price_1xxxxxxxxx`)
5. Add to `.env`:
   ```bash
   VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_1xxxxxxxxx
   ```

#### **Product 2: Premium Yearly**
1. Click **+ Add product**
2. Fill in:
   - Name: `Premium Yearly`
   - Description: `Yearly premium subscription - Save 17%!`
   - **Pricing:**
     - Price: `99.99 USD`
     - Billing period: **Yearly** (Recurring)
3. **COPY THE PRICE ID**
4. Add to `.env`:
   ```bash
   VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_1xxxxxxxxx
   ```

#### **Product 3: Family Monthly**
1. Click **+ Add product**
2. Fill in:
   - Name: `Family Monthly`
   - Description: `Monthly family subscription - Up to 4 accounts`
   - **Pricing:**
     - Price: `14.99 USD`
     - Billing period: **Monthly** (Recurring)
3. **COPY THE PRICE ID**
4. Add to `.env`:
   ```bash
   VITE_STRIPE_FAMILY_MONTHLY_PRICE_ID=price_1xxxxxxxxx
   ```

#### **Product 4: Family Yearly**
1. Click **+ Add product**
2. Fill in:
   - Name: `Family Yearly`
   - Description: `Yearly family subscription - Save 17%!`
   - **Pricing:**
     - Price: `149.99 USD`
     - Billing period: **Yearly** (Recurring)
3. **COPY THE PRICE ID**
4. Add to `.env`:
   ```bash
   VITE_STRIPE_FAMILY_YEARLY_PRICE_ID=price_1xxxxxxxxx
   ```

---

## 🗄️ **Part 2: Database Setup (5 minutes)**

### **Run the Migration**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/pyixvaanmebwlxsivlue
2. Click **SQL Editor** in left sidebar
3. Click **+ New query**
4. Copy the contents of `/supabase/migrations/001_stripe_schema.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Cmd/Ctrl + Enter`

**✅ You should see:** "Success. No rows returned"

This creates:
- Stripe-related columns in users table (`stripe_customer_id`, `stripe_subscription_id`, etc.)
- `subscription_events` table for audit logs
- Helper functions for checking subscription status
- Row-level security policies

---

## 🔧 **Part 3: Install Supabase CLI (5 minutes)**

### **Option A: Using npm (Recommended)**

```bash
npm install -g supabase
```

### **Option B: Using Homebrew (Mac)**

```bash
brew install supabase/tap/supabase
```

### **Option C: Using Scoop (Windows)**

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### **Verify Installation**

```bash
supabase --version
```

You should see something like: `1.x.x`

---

## 🔐 **Part 4: Login & Link Project (3 minutes)**

### **Step 1: Login to Supabase**

```bash
supabase login
```

This will open a browser window. Click **Authorize** to generate an access token.

### **Step 2: Link Your Project**

```bash
supabase link --project-ref pyixvaanmebwlxsivlue
```

When prompted for the database password, use the password you set when creating your Supabase project.

**✅ Success message:** "Linked to project pyixvaanmebwlxsivlue"

---

## 🚀 **Part 5: Deploy Edge Functions (5 minutes)**

Now deploy the three Stripe-related Edge Functions:

### **Deploy Create Checkout Session**

```bash
supabase functions deploy create-checkout-session
```

### **Deploy Create Portal Session**

```bash
supabase functions deploy create-portal-session
```

### **Deploy Stripe Webhook**

```bash
supabase functions deploy stripe-webhook
```

**✅ Each should show:** "Deployed function create-checkout-session on project pyixvaanmebwlxsivlue"

---

## 🔑 **Part 6: Set Supabase Secrets (3 minutes)**

You need to add your Stripe secret key to Supabase so the Edge Functions can access it.

### **Method 1: Via Dashboard (Easiest)**

1. Go to: https://supabase.com/dashboard/project/pyixvaanmebwlxsivlue/settings/functions
2. Scroll to **Secrets** section
3. Click **Add new secret**
4. Add:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_xxxxx` (your Stripe secret key from .env)
5. Click **Create secret**

### **Method 2: Via CLI**

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
```

**⚠️ Note:** You'll add `STRIPE_WEBHOOK_SECRET` in the next step after setting up webhooks.

---

## 🪝 **Part 7: Configure Stripe Webhooks (10 minutes)**

This is the most important step! Webhooks allow Stripe to notify your app about subscription events.

### **Step 1: Get Your Webhook URL**

Your webhook endpoint URL is:
```
https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/stripe-webhook
```

### **Step 2: Create Webhook in Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. Fill in:
   - **Endpoint URL:** `https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/stripe-webhook`
   - **Description:** `Production webhook for subscription events`
   
4. Click **Select events to listen to**
5. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

6. Click **Add endpoint**

### **Step 3: Get Webhook Signing Secret**

1. Click on your newly created webhook endpoint
2. In the **Signing secret** section, click **Reveal**
3. Copy the secret (starts with `whsec_`)
4. Add it to Supabase secrets:
   - **Via Dashboard:** Settings → Functions → Secrets → Add `STRIPE_WEBHOOK_SECRET`
   - **Via CLI:** `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

**✅ Your webhook is now configured!**

---

## ✅ **Part 8: Final Configuration Check**

### **Your `.env` file should have:**

```bash
# Supabase
VITE_SUPABASE_URL=https://pyixvaanmebwlxsivlue.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxxxx
VITE_STRIPE_FAMILY_MONTHLY_PRICE_ID=price_xxxxx
VITE_STRIPE_FAMILY_YEARLY_PRICE_ID=price_xxxxx

# Stripe Backend (for local testing - not used in production)
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### **Supabase Secrets should have:**
- ✅ `STRIPE_SECRET_KEY` = `sk_test_xxxxx`
- ✅ `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx`

---

## 🧪 **Part 9: Test Everything! (10 minutes)**

### **Step 1: Restart Your Dev Server**

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### **Step 2: Test the Full Flow**

1. **Login as free user:**
   - Email: `basic@test.com`
   - Password: `basic123`

2. **Click "Upgrade to Premium"**
   - Should redirect to Stripe Checkout page ✅

3. **Use Stripe test card:**
   ```
   Card number: 4242 4242 4242 4242
   Expiry: 12/34 (any future date)
   CVC: 123
   ZIP: 12345
   ```

4. **Complete payment**
   - Should redirect back to your app ✅

5. **Check subscription status:**
   - Refresh the page
   - You should now see **Premium** badge in header ✅
   - All 6 emotion sliders should be visible ✅
   - History should show 5 months ✅

---

## 🔍 **Part 10: Verify Everything Works**

### **Check Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/test/payments
2. You should see your test payment ✅

3. Go to: https://dashboard.stripe.com/test/subscriptions
4. You should see an active subscription ✅

### **Check Supabase Database**

1. Go to: https://supabase.com/dashboard/project/pyixvaanmebwlxsivlue/editor
2. Open the `users` table
3. Find your user - should see:
   - `stripe_customer_id` populated ✅
   - `stripe_subscription_id` populated ✅
   - `subscription_status` = `active` ✅
   - `subscription_plan` = `premium` ✅

4. Check `subscription_events` table:
   - Should see events logged ✅

### **Check Webhook Events**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. You should see recent events with status `200` ✅

---

## 🎉 **Success! You're Done!**

Your full-stack subscription system is now live!

### **What's Working:**
- ✅ Stripe Checkout creates subscriptions
- ✅ Webhooks update user subscription status
- ✅ Premium features unlock automatically
- ✅ Subscription management portal (coming in next update)
- ✅ All events logged for HIPAA compliance

---

## 🐛 **Troubleshooting**

### **"Failed to create checkout session"**
- Check that `STRIPE_SECRET_KEY` is set in Supabase secrets
- Verify Edge Function is deployed: `supabase functions list`

### **Subscription status doesn't update after payment**
- Check webhook events in Stripe Dashboard
- Look for errors in webhook event details
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check Supabase logs: Dashboard → Functions → stripe-webhook → Logs

### **"No such price"**
- Verify Price IDs in `.env` match those in Stripe Dashboard
- Make sure you're in Test mode in Stripe
- Restart dev server after changing `.env`

### **Webhook returns 400 or 500**
- Check Supabase Edge Function logs
- Verify webhook secret matches
- Ensure database migration ran successfully

---

## 🚀 **Next Steps**

1. **Test cancellations:**
   - Use Stripe Dashboard to cancel a test subscription
   - Verify user gets downgraded to free tier

2. **Test different plans:**
   - Try Family plan
   - Try yearly billing

3. **Add Customer Portal:**
   - The `create-portal-session` function is already deployed
   - Users can manage subscriptions via Stripe's hosted portal

4. **Production Deployment:**
   - See `/STRIPE_DEPLOYMENT_CHECKLIST.md`
   - Don't forget to sign Stripe BAA for HIPAA compliance!

---

## 📚 **Additional Resources**

- **Stripe Testing:** https://stripe.com/docs/testing
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Webhook Events:** https://stripe.com/docs/webhooks

---

**Need help?** Check the existing documentation:
- `/STRIPE_QUICK_START.md` - Quick overview
- `/STRIPE_SETUP_GUIDE.md` - Detailed setup guide
- `/STRIPE_DEPLOYMENT_CHECKLIST.md` - Production deployment checklist

Happy coding! 🎉
