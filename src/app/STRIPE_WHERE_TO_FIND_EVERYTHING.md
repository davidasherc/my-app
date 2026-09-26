# 🗺️ Where to Find Everything - Visual Guide

This guide shows you EXACTLY where to find each value you need.

---

## 🔑 Stripe API Keys

### Where to Find Them
1. Go to https://dashboard.stripe.com
2. Click **"Developers"** in top right corner
3. Click **"API keys"** in left sidebar

### What You'll See
```
┌─────────────────────────────────────────────┐
│ Publishable key                             │
│ pk_test_51AbCdEf1234567890...               │  ← COPY THIS
│ [Hide]                                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Secret key                                  │
│ •••••••••••••••••••••                       │
│ [Reveal]  ← Click this                      │  
└─────────────────────────────────────────────┘

After clicking Reveal:
┌─────────────────────────────────────────────┐
│ Secret key                                  │
│ sk_test_51AbCdEf1234567890...               │  ← COPY THIS
│ [Hide]                                      │
└─────────────────────────────────────────────┘
```

### Where to Paste Them

**In `.env` file** (create in project root):
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEf...  ← Paste here
```

**In Supabase Dashboard** → Settings → Edge Functions → Secrets:
```
STRIPE_SECRET_KEY=sk_test_51AbCdEf...  ← Paste here
```

**⚠️ NEVER put sk_test_ in .env file - it's a secret!**

---

## 🏷️ Price IDs

### Where to Find Them
1. Go to https://dashboard.stripe.com
2. Click **"Products"** in left sidebar
3. Click on your product (e.g., "Premium Subscription")
4. Scroll down to "Pricing" section

### What You'll See
```
┌─────────────────────────────────────────────┐
│ Pricing                                     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ $9.99 / month                           │ │
│ │ API ID: price_1AbCdEfGhIjKlMnOpQrStUv  │ │  ← COPY THIS
│ │                                         │ │
│ │ [Edit] [Archive]                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ $99.99 / year                           │ │
│ │ API ID: price_1ZyXwVuTsRqPoNmLkJiHgFe  │ │  ← COPY THIS TOO
│ │                                         │ │
│ │ [Edit] [Archive]                        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Where to Paste Them

**In `.env` file:**
```bash
VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_1AbCdEf...  ← Monthly price
VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID=price_1ZyXwVu...   ← Yearly price
```

---

## 🔔 Webhook Secret

### Where to Find It
1. Go to https://dashboard.stripe.com
2. Click **"Developers"** → **"Webhooks"**
3. Click **"+ Add endpoint"**
4. Fill in endpoint URL (your Supabase function URL)
5. Select events
6. Click **"Add endpoint"**
7. On the endpoint details page:

### What You'll See
```
┌─────────────────────────────────────────────┐
│ Endpoint details                            │
│                                             │
│ https://xxxxx.supabase.co/functions/v1/...  │
│                                             │
│ Signing secret                              │
│ •••••••••••••••••••••                       │
│ [Reveal]  ← Click this                      │
└─────────────────────────────────────────────┘

After clicking Reveal:
┌─────────────────────────────────────────────┐
│ Signing secret                              │
│ whsec_1234567890abcdefghijklmnopqrstuvwxyz  │  ← COPY THIS
│ [Hide]                                      │
└─────────────────────────────────────────────┘
```

### Where to Paste It

**In Supabase Dashboard** → Settings → Edge Functions → Secrets:
```
STRIPE_WEBHOOK_SECRET=whsec_...  ← Paste here
```

---

## 🗄️ Supabase Credentials

### Where to Find Them
1. Go to https://app.supabase.com
2. Select your project
3. Click **"Settings"** (gear icon in left sidebar)
4. Click **"API"**

### What You'll See
```
┌─────────────────────────────────────────────┐
│ Project URL                                 │
│ https://abcdefghijklmnop.supabase.co       │  ← COPY THIS
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ API Keys                                    │
│                                             │
│ anon / public                               │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    │  ← COPY THIS
│                                             │
│ service_role                                │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    │  ← COPY THIS TOO
│ ⚠️ This key has the ability to bypass RLS   │
└─────────────────────────────────────────────┘
```

### Where to Paste Them

**In `.env` file:**
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co  ← Project URL
VITE_SUPABASE_ANON_KEY=eyJhbGc...            ← anon/public key
```

**In Supabase Dashboard** → Settings → Edge Functions → Secrets:
```
SUPABASE_URL=https://xxxxx.supabase.co                    ← Project URL
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...                      ← service_role key
```

**⚠️ NEVER put service_role key in .env - it bypasses security!**

---

## 📁 File Structure - Where Everything Goes

```
your-app/
├── .env                           ← CREATE THIS (frontend vars)
│   ├── VITE_STRIPE_PUBLISHABLE_KEY
│   ├── VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID
│   ├── VITE_SUPABASE_URL
│   └── VITE_SUPABASE_ANON_KEY
│
├── .env.example                   ← Already exists (template)
│
├── components/
│   ├── SubscriptionManager.tsx    ← UPDATE THIS
│   └── ...
│
├── utils/
│   └── stripe.ts                  ← Already created (utilities)
│
└── supabase/
    ├── functions/
    │   ├── create-checkout-session/
    │   │   └── index.ts           ← Deploy this
    │   ├── stripe-webhook/
    │   │   └── index.ts           ← Deploy this
    │   └── create-portal-session/
    │       └── index.ts           ← Deploy this
    │
    └── migrations/
        └── 001_stripe_schema.sql  ← Run in Supabase SQL Editor
```

---

## 🎯 Supabase Edge Functions Secrets

### Where to Add Them
1. Go to https://app.supabase.com
2. Select your project
3. Click **"Edge Functions"** in left sidebar
4. Click **"Settings"** or **"Manage Secrets"**
5. Click **"Add secret"**

### What You'll See
```
┌─────────────────────────────────────────────┐
│ Edge Function Secrets                       │
│                                             │
│ [+ Add new secret]                          │
│                                             │
│ Name: [                    ]                │
│ Value: [                   ]                │
│                                             │
│ [Save]                                      │
└─────────────────────────────────────────────┘
```

### What to Add (4 secrets total)

**Secret 1:**
```
Name: STRIPE_SECRET_KEY
Value: sk_test_51AbCdEf...
```

**Secret 2:**
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_...
```

**Secret 3:**
```
Name: SUPABASE_URL
Value: https://xxxxx.supabase.co
```

**Secret 4:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGc...
```

---

## ✅ Quick Verification Checklist

### Local .env File Should Have:
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] `VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...`
- [ ] `VITE_SUPABASE_URL=https://...`
- [ ] `VITE_SUPABASE_ANON_KEY=eyJhbGc...`

### Supabase Secrets Should Have:
- [ ] `STRIPE_SECRET_KEY=sk_test_...`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] `SUPABASE_URL=https://...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...`

### Stripe Dashboard Should Have:
- [ ] At least one Product created
- [ ] At least one Price with an ID
- [ ] Webhook endpoint configured (optional for now)

---

## 🔐 Security Summary

### ✅ Safe in .env (Frontend)
- `VITE_STRIPE_PUBLISHABLE_KEY` (starts with `pk_`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Any `VITE_*_PRICE_ID`

### ❌ NEVER in .env (Backend Only)
- `STRIPE_SECRET_KEY` (starts with `sk_`)
- `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
- `SUPABASE_SERVICE_ROLE_KEY`

### Rule of Thumb
**If it starts with "pk_" or has "VITE_" prefix → Frontend OK**
**If it starts with "sk_" or "whsec_" → Backend ONLY**

---

## 📞 Still Stuck?

### Common Issues

**Can't find Stripe Dashboard?**
→ Go to https://dashboard.stripe.com

**Don't see "Developers" menu?**
→ Look in top right corner of Stripe Dashboard

**Can't find Supabase project?**
→ Go to https://app.supabase.com → "All projects"

**Don't see Edge Functions in Supabase?**
→ Make sure you selected the correct project
→ Look in left sidebar for "Edge Functions"

---

## 🎉 Next Steps

Once you've found and copied all these values:

1. ✅ Create `.env` file with frontend values
2. ✅ Add secrets to Supabase
3. ✅ Test with `npm run dev`
4. ✅ Follow `/STRIPE_QUICK_START.md` for complete setup

You've got this! 🚀
