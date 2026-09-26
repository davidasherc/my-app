# ✅ Deployment Checklist

Use this to track your deployment progress.

---

## 📋 **Pre-Deployment**

- [ ] Stripe account created
- [ ] Supabase project created (ID: `pyixvaanmebwlxsivlue`)
- [ ] `.env` file exists with Supabase URL and Anon Key
- [ ] App runs locally with `npm run dev`

---

## 🎯 **Part 1: Stripe Setup**

### **API Keys**
- [ ] Copied Stripe Publishable Key (pk_test_...)
- [ ] Copied Stripe Secret Key (sk_test_...)
- [ ] Added both to `.env` file

### **Create Products & Price IDs**
- [ ] Created "Premium Monthly" product ($9.99/month)
  - [ ] Copied Price ID → `VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID`
  
- [ ] Created "Premium Yearly" product ($99.99/year)
  - [ ] Copied Price ID → `VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID`
  
- [ ] Created "Family Monthly" product ($14.99/month)
  - [ ] Copied Price ID → `VITE_STRIPE_FAMILY_MONTHLY_PRICE_ID`
  
- [ ] Created "Family Yearly" product ($149.99/year)
  - [ ] Copied Price ID → `VITE_STRIPE_FAMILY_YEARLY_PRICE_ID`

---

## 🗄️ **Part 2: Database Setup**

- [ ] Opened Supabase SQL Editor
- [ ] Copied contents of `/supabase/migrations/001_stripe_schema.sql`
- [ ] Ran migration successfully
- [ ] Verified `subscription_events` table created
- [ ] Verified `users` table has new Stripe columns

---

## 🔧 **Part 3: Supabase CLI**

- [ ] Installed Supabase CLI (`npm install -g supabase`)
- [ ] Verified installation (`supabase --version`)
- [ ] Logged into Supabase (`supabase login`)
- [ ] Linked to project (`supabase link --project-ref pyixvaanmebwlxsivlue`)

---

## 🚀 **Part 4: Deploy Edge Functions**

- [ ] Deployed `create-checkout-session`
  ```bash
  supabase functions deploy create-checkout-session
  ```
  
- [ ] Deployed `create-portal-session`
  ```bash
  supabase functions deploy create-portal-session
  ```
  
- [ ] Deployed `stripe-webhook`
  ```bash
  supabase functions deploy stripe-webhook
  ```

- [ ] Verified all functions deployed (`supabase functions list`)

---

## 🔑 **Part 5: Supabase Secrets**

- [ ] Added `STRIPE_SECRET_KEY` secret
  - Via Dashboard OR CLI: `supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx`
  
- [ ] Verified secret is set (`supabase secrets list`)

---

## 🪝 **Part 6: Stripe Webhooks**

- [ ] Went to Stripe Dashboard → Webhooks
- [ ] Clicked "Add endpoint"
- [ ] Entered webhook URL: `https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/stripe-webhook`
- [ ] Selected these events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Saved endpoint
- [ ] Revealed and copied Webhook Signing Secret (whsec_...)
- [ ] Added `STRIPE_WEBHOOK_SECRET` to Supabase secrets

---

## ✅ **Part 7: Final Verification**

### **Environment Variables**
- [ ] `.env` file has all required variables:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
  - [ ] `VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID`
  - [ ] `VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID`
  - [ ] `VITE_STRIPE_FAMILY_MONTHLY_PRICE_ID`
  - [ ] `VITE_STRIPE_FAMILY_YEARLY_PRICE_ID`
  - [ ] `STRIPE_SECRET_KEY` (for local testing)

### **Supabase Secrets**
- [ ] `STRIPE_SECRET_KEY` is set
- [ ] `STRIPE_WEBHOOK_SECRET` is set

### **Functions**
- [ ] All 3 Edge Functions deployed
- [ ] No errors in function logs

---

## 🧪 **Part 8: Testing**

### **Initial Test**
- [ ] Restarted dev server (`npm run dev`)
- [ ] Logged in as free user (basic@test.com / basic123)
- [ ] Clicked "Upgrade to Premium"
- [ ] Stripe Checkout page loaded ✅

### **Payment Test**
- [ ] Entered test card (4242 4242 4242 4242)
- [ ] Payment completed successfully
- [ ] Redirected back to app

### **Subscription Verification**
- [ ] Refreshed app
- [ ] Header shows "Premium" badge ✅
- [ ] All 6 emotion sliders visible ✅
- [ ] History shows "5 months" ✅

### **Database Verification**
- [ ] Checked Supabase → Table Editor → `users`
- [ ] User has `stripe_customer_id` ✅
- [ ] User has `stripe_subscription_id` ✅
- [ ] `subscription_status` = "active" ✅
- [ ] `subscription_plan` = "premium" ✅

### **Stripe Dashboard Verification**
- [ ] Payment visible in Stripe → Payments ✅
- [ ] Subscription visible in Stripe → Subscriptions ✅
- [ ] Webhook events show status 200 ✅

---

## 🎉 **Success Criteria**

All of these should be true:

- ✅ User can click "Upgrade to Premium"
- ✅ Stripe Checkout loads
- ✅ Payment processes successfully
- ✅ User automatically gets premium features
- ✅ Subscription status shows "active" in database
- ✅ Webhook events logged successfully
- ✅ Can see payment in Stripe Dashboard

---

## 🐛 **If Something Doesn't Work**

### **Checkout page doesn't load:**
- [ ] Check browser console for errors
- [ ] Verify `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
- [ ] Verify Price IDs are correct
- [ ] Restart dev server

### **Payment succeeds but subscription doesn't activate:**
- [ ] Check Stripe webhook events (should show 200 status)
- [ ] Check Supabase function logs: `supabase functions logs stripe-webhook`
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is correct
- [ ] Check database migration ran successfully

### **Webhook returns 400/500:**
- [ ] Check function logs for error details
- [ ] Verify both secrets are set in Supabase
- [ ] Re-deploy webhook function

---

## 📊 **Useful Commands for Debugging**

```bash
# View webhook logs
supabase functions logs stripe-webhook

# View checkout logs
supabase functions logs create-checkout-session

# Check secrets
supabase secrets list

# Check deployed functions
supabase functions list
```

---

## 🚀 **Next Steps After Deployment**

- [ ] Test yearly billing
- [ ] Test Family plan
- [ ] Test subscription cancellation
- [ ] Test failed payment scenario
- [ ] Set up customer portal for users
- [ ] Review HIPAA compliance checklist
- [ ] Plan production deployment

---

## 📝 **Notes**

Use this section to track any issues or customizations:

```
[Add your notes here]
```

---

**Done? Congratulations! 🎉**

Your full-stack subscription system is now live and processing real payments (in test mode).

See `/STRIPE_DEPLOYMENT_CHECKLIST.md` for production deployment steps.
