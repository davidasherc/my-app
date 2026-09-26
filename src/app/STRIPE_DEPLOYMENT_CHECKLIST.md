# ✅ Stripe Deployment Checklist

Use this checklist to ensure you've completed all steps for Stripe integration.

---

## 📋 Pre-Development Setup

### Stripe Account Setup
- [ ] Created Stripe account at https://stripe.com
- [ ] Completed business verification
- [ ] Added bank account for payouts
- [ ] **CRITICAL:** Signed HIPAA Business Associate Agreement (BAA)
  - [ ] Requested BAA from Stripe
  - [ ] Signed and returned BAA
  - [ ] Received confirmation from Stripe

### Stripe Dashboard Configuration

#### Products & Prices
- [ ] Created "Premium Subscription" product
  - [ ] Monthly price: $9.99
  - [ ] Copied Price ID: `___________________`
  - [ ] Yearly price: $99.99 (optional)
  - [ ] Copied Price ID: `___________________`

- [ ] Created "Family Subscription" product (optional)
  - [ ] Monthly price: $14.99
  - [ ] Copied Price ID: `___________________`
  - [ ] Yearly price: $149.99 (optional)
  - [ ] Copied Price ID: `___________________`

#### API Keys (Test Mode)
- [ ] Copied Publishable Key: `pk_test_...`
- [ ] Copied Secret Key: `sk_test_...` (keep secure!)

#### Webhooks (Test Mode)
- [ ] Created webhook endpoint
  - Endpoint URL: `___________________________________`
- [ ] Selected events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Copied Webhook Secret: `whsec_...`

---

## 🔧 Development Setup

### Environment Variables

#### Local .env File
- [ ] Created `.env` file in project root
- [ ] Added to `.gitignore`
- [ ] Configured all variables from `.env.example`:
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
  - [ ] `VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID`
  - [ ] `VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID` (optional)
  - [ ] `VITE_STRIPE_FAMILY_MONTHLY_PRICE_ID` (optional)
  - [ ] `VITE_STRIPE_FAMILY_YEARLY_PRICE_ID` (optional)
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`

#### Supabase Edge Functions Secrets
- [ ] Logged into Supabase Dashboard
- [ ] Went to Settings → Edge Functions → Secrets
- [ ] Added secrets:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Database Setup

- [ ] Ran migration: `001_stripe_schema.sql`
- [ ] Verified tables created:
  - [ ] `users` table has Stripe columns
  - [ ] `subscription_events` table exists
  - [ ] Indexes created successfully
  - [ ] RLS policies enabled

### Code Integration

- [ ] Installed dependencies:
  ```bash
  npm install @stripe/stripe-js stripe
  npm install @supabase/supabase-js
  ```

- [ ] Deployed Edge Functions:
  ```bash
  supabase functions deploy create-checkout-session
  supabase functions deploy stripe-webhook
  supabase functions deploy create-portal-session
  ```

- [ ] Updated SubscriptionManager.tsx with Stripe integration
  - [ ] Replaced mock code with real Stripe calls
  - [ ] Imported stripe utilities
  - [ ] Added error handling
  - [ ] Added loading states

---

## 🧪 Testing

### Test in Stripe Test Mode

#### Successful Payment Flow
- [ ] Selected Premium plan
- [ ] Clicked "Upgrade to Premium"
- [ ] Redirected to Stripe Checkout
- [ ] Entered test card: `4242 4242 4242 4242`
- [ ] Completed checkout
- [ ] Redirected back to app
- [ ] User subscription updated to "premium"
- [ ] Premium features unlocked

#### Failed Payment
- [ ] Tested with declined card: `4000 0000 0000 0002`
- [ ] Verified error handling
- [ ] User remained on free plan

#### 3D Secure Authentication
- [ ] Tested with 3DS card: `4000 0025 0000 3155`
- [ ] Completed 3D Secure flow
- [ ] Payment succeeded

#### Webhooks
- [ ] Checked Stripe Dashboard → Webhooks
- [ ] Verified events received:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `invoice.payment_succeeded`
- [ ] No failed webhook deliveries
- [ ] Database updated correctly

#### Subscription Management
- [ ] Clicked "Manage Subscription" button
- [ ] Redirected to Stripe Customer Portal
- [ ] Tested:
  - [ ] Update payment method
  - [ ] Change plan (upgrade/downgrade)
  - [ ] Cancel subscription
  - [ ] View invoices

### Mobile Testing
- [ ] Tested on iOS Safari
- [ ] Tested on Android Chrome
- [ ] Apple Pay works (if configured)
- [ ] Google Pay works (if configured)
- [ ] Responsive design looks good

---

## 🚀 Production Deployment

### Switch to Live Mode

#### Stripe Live Keys
- [ ] Toggled to "Live mode" in Stripe Dashboard
- [ ] Copied Live Publishable Key: `pk_live_...`
- [ ] Copied Live Secret Key: `sk_live_...`
- [ ] Updated production environment variables

#### Live Products & Prices
- [ ] Created products in Live mode (or toggled existing)
- [ ] Copied Live Price IDs:
  - Premium Monthly: `___________________`
  - Premium Yearly: `___________________`
  - Family Monthly: `___________________`
  - Family Yearly: `___________________`
- [ ] Updated production environment variables

#### Live Webhooks
- [ ] Created new webhook endpoint for production
  - Production URL: `___________________________________`
- [ ] Selected same events as test mode
- [ ] Copied Live Webhook Secret: `whsec_...`
- [ ] Updated Supabase production secrets

### Supabase Production

- [ ] Deployed Edge Functions to production
- [ ] Updated production secrets in Supabase Dashboard
- [ ] Ran database migrations on production
- [ ] Verified RLS policies

### Final Production Checks

- [ ] Completed business verification in Stripe
- [ ] Added business details (address, tax ID, etc.)
- [ ] Configured payout schedule
- [ ] Set up email receipts
- [ ] Configured invoice settings
- [ ] Tested with real $0.50 payment
- [ ] Refunded test payment
- [ ] Monitored first few real transactions

---

## 📊 Post-Launch Monitoring

### Daily (First Week)
- [ ] Check Stripe Dashboard for new subscriptions
- [ ] Monitor failed payments
- [ ] Review webhook delivery logs
- [ ] Check for support tickets

### Weekly
- [ ] Review subscription metrics (MRR, churn)
- [ ] Check failed payment retry status
- [ ] Review Stripe Radar for fraud
- [ ] Monitor customer support requests

### Monthly
- [ ] Analyze subscription trends
- [ ] Review refund requests
- [ ] Check payment method updates
- [ ] Update pricing if needed

---

## 🆘 Troubleshooting Quick Reference

### Common Issues

**"No such price: price_xxx"**
- ✅ Verify Price ID is correct
- ✅ Check if using test vs live mode correctly

**"Webhook signature verification failed"**
- ✅ Re-copy webhook secret
- ✅ Ensure using raw request body

**"This customer has no attached payment method"**
- ✅ Check checkout session mode is 'subscription'
- ✅ Verify payment succeeded

**"User subscription not updating"**
- ✅ Check webhook is receiving events
- ✅ Verify database has correct user ID
- ✅ Check webhook logs for errors

### Support Contacts

- **Stripe Support:** https://support.stripe.com
- **Stripe HIPAA:** Contact Stripe directly about BAA
- **Stripe Docs:** https://stripe.com/docs

---

## 🎉 Launch Ready!

Once all checkboxes are complete:

- [ ] **FINAL:** Confirmed HIPAA BAA is signed
- [ ] **FINAL:** Tested end-to-end payment flow
- [ ] **FINAL:** Monitored first production transaction
- [ ] **FINAL:** Created runbook for failed payments
- [ ] **FINAL:** Set up alerts for critical issues

**You're ready to accept payments!** 🚀

---

## 📝 Notes

_Use this space to track important information:_

**Stripe Account ID:** `___________________`

**Production Webhook Endpoint:** `___________________`

**Support Email:** `___________________`

**BAA Signed Date:** `___________________`

**Go-Live Date:** `___________________`
