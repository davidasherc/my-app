# ⚡ Quick Command Reference

Copy and paste these commands in order for fast deployment.

---

## 🔧 **1. Install Supabase CLI**

```bash
npm install -g supabase
```

---

## 🔐 **2. Login & Link**

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref pyixvaanmebwlxsivlue
```

---

## 🚀 **3. Deploy All Functions**

```bash
# Deploy all three functions at once
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
```

Or deploy all at once:

```bash
supabase functions deploy create-checkout-session && \
supabase functions deploy create-portal-session && \
supabase functions deploy stripe-webhook
```

---

## 🔑 **4. Set Secrets**

```bash
# Add Stripe Secret Key (replace with your actual key)
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx

# Add Webhook Secret (you'll get this from Stripe Dashboard after creating webhook)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🧪 **5. Test**

```bash
# Restart dev server
npm run dev
```

---

## 📊 **6. Verify Deployment**

```bash
# List deployed functions
supabase functions list

# View function logs (if something goes wrong)
supabase functions logs stripe-webhook
supabase functions logs create-checkout-session
```

---

## 🗄️ **7. Database Migration**

**Run this SQL in Supabase Dashboard → SQL Editor:**

Copy contents of: `/supabase/migrations/001_stripe_schema.sql`

Or use CLI (if you have migrations set up):

```bash
supabase db push
```

---

## 🔍 **8. Check Everything**

```bash
# Check secrets are set
supabase secrets list

# Check functions are deployed
supabase functions list

# View recent logs
supabase functions logs stripe-webhook --limit 50
```

---

## 🆘 **Troubleshooting Commands**

```bash
# View webhook function logs
supabase functions logs stripe-webhook

# View checkout function logs
supabase functions logs create-checkout-session

# Redeploy a function if needed
supabase functions deploy stripe-webhook --no-verify-jwt

# Unset a secret (if you need to fix it)
supabase secrets unset STRIPE_SECRET_KEY
```

---

## 📝 **Your Webhook URL**

```
https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/stripe-webhook
```

Use this in Stripe Dashboard → Webhooks

---

## ✅ **Test Card Numbers**

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Auth Required: 4000 0025 0000 3155
```

Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)

---

## 🎯 **Quick Status Check**

After deployment, verify:

1. ✅ Supabase functions deployed
2. ✅ Secrets set in Supabase
3. ✅ Database migration run
4. ✅ Stripe products created (4 price IDs)
5. ✅ Webhook configured in Stripe
6. ✅ All env variables in `.env`

---

## 🚀 **All-in-One Setup (After you have your Stripe keys)**

```bash
# 1. Install CLI
npm install -g supabase

# 2. Login & Link
supabase login
supabase link --project-ref pyixvaanmebwlxsivlue

# 3. Deploy everything
supabase functions deploy create-checkout-session && \
supabase functions deploy create-portal-session && \
supabase functions deploy stripe-webhook

# 4. Set secrets (replace xxxxx with your actual keys)
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
# (Add webhook secret after creating webhook in Stripe)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# 5. Restart dev server
npm run dev
```

---

**Now go to `/DEPLOYMENT_GUIDE.md` for the complete step-by-step instructions!**
