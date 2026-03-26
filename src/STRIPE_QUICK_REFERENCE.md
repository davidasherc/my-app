# ⚡ Stripe Quick Reference Card

**Print this or keep it handy!**

---

## 🔑 API Keys Quick Lookup

| Key Type | Starts With | Where to Find | Where to Use |
|----------|-------------|---------------|--------------|
| Publishable | `pk_test_` | Stripe → Developers → API keys | `.env` file |
| Secret | `sk_test_` | Stripe → Developers → API keys | Supabase Secrets |
| Webhook Secret | `whsec_` | Stripe → Developers → Webhooks | Supabase Secrets |
| Price ID | `price_` | Stripe → Products → Your Product | `.env` file |

---

## 📁 Environment Variables Cheat Sheet

### In `.env` File (Root of Project)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### In Supabase Dashboard (Settings → Edge Functions → Secrets)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 🚀 Deployment Commands

```bash
# Install Stripe
npm install @stripe/stripe-js

# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy all Edge Functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy create-portal-session

# Run database migration
# (Copy/paste from 001_stripe_schema.sql into Supabase SQL Editor)
```

---

## 💳 Test Cards

```
✅ Success:       4242 4242 4242 4242
❌ Declined:      4000 0000 0000 0002
💰 Insufficient:  4000 0000 0000 9995
🔐 3D Secure:     4000 0025 0000 3155

Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

---

## 🔗 Important URLs

| What | URL |
|------|-----|
| Stripe Dashboard | https://dashboard.stripe.com |
| Stripe API Keys | https://dashboard.stripe.com/test/apikeys |
| Stripe Products | https://dashboard.stripe.com/products |
| Stripe Webhooks | https://dashboard.stripe.com/test/webhooks |
| Supabase Dashboard | https://app.supabase.com |
| Supabase SQL Editor | https://app.supabase.com → SQL Editor |
| Stripe Testing Docs | https://stripe.com/docs/testing |

---

## 📋 Quick Setup Checklist

- [ ] Created Stripe account
- [ ] Copied API keys to `.env`
- [ ] Created Premium product
- [ ] Copied Price ID to `.env`
- [ ] Installed `@stripe/stripe-js`
- [ ] Created Supabase account
- [ ] Added Supabase secrets
- [ ] Deployed Edge Functions
- [ ] Ran database migration
- [ ] Configured webhook endpoint
- [ ] Tested with 4242 card

---

## 🔥 Common Commands

```bash
# Start development
npm run dev

# Deploy Edge Functions
supabase functions deploy

# View Edge Function logs
supabase functions logs create-checkout-session

# Test Edge Function locally
supabase functions serve create-checkout-session
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Stripe is not defined" | `npm install @stripe/stripe-js` |
| "No such price" | Copy Price ID from Stripe Dashboard |
| "Webhook failed" | Re-copy webhook secret |
| Keys not working | Restart dev server: `npm run dev` |
| .env not loading | Check file is named `.env` (not `.env.txt`) |

---

## 📊 Webhook Events to Monitor

```
✅ checkout.session.completed  → User completed payment
✅ customer.subscription.created → New subscription
✅ customer.subscription.updated → Plan changed
✅ customer.subscription.deleted → Subscription cancelled
✅ invoice.payment_succeeded → Payment success
✅ invoice.payment_failed → Payment failed
```

---

## 💡 Pro Tips

1. **Test Mode:** Look for the "Viewing test data" banner in Stripe
2. **Secrets:** Never commit `.env` to git
3. **Webhooks:** Test locally with Stripe CLI
4. **HIPAA:** Sign BAA before going live
5. **Live Mode:** Toggle in top right of Stripe Dashboard

---

## 🎯 Your Pricing

| Plan | Monthly | Yearly | Stripe Product |
|------|---------|--------|----------------|
| Free | $0 | $0 | (no subscription) |
| Premium | $9.99 | $99.99 | Premium Subscription |
| Family | $14.99 | $149.99 | Family Subscription |

---

## 📱 Edge Function URLs

```
Create Checkout:
https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-checkout-session

Stripe Webhook:
https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook

Customer Portal:
https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-portal-session
```

---

## 🔐 Security Rules

### ✅ SAFE in .env (Frontend)
- Anything starting with `pk_`
- Anything starting with `VITE_`
- Price IDs
- Supabase URL
- Supabase anon key

### ❌ NEVER in .env (Backend Only)
- Anything starting with `sk_`
- Anything starting with `whsec_`
- Service role keys

---

## 📖 Documentation Quick Links

| Guide | When to Use |
|-------|-------------|
| `STRIPE_QUICK_START.md` | Getting started (15 min) |
| `STRIPE_WHERE_TO_FIND_EVERYTHING.md` | Finding API keys |
| `STRIPE_SETUP_GUIDE.md` | Complete reference |
| `STRIPE_DEPLOYMENT_CHECKLIST.md` | Going to production |
| `STRIPE_INTEGRATION_SUMMARY.md` | Understanding everything |

---

## ✅ Success Indicators

**It's working when:**
- ✅ Clicking "Upgrade" opens Stripe Checkout
- ✅ Test card payment succeeds
- ✅ Webhooks show "succeeded" in Stripe
- ✅ User's subscription updates in database
- ✅ Premium features unlock

---

**Keep this handy during setup!** 📌

Last updated: March 15, 2026
