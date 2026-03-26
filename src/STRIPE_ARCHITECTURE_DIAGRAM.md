# 🏗️ Stripe Integration Architecture

Visual guide to how everything connects.

---

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR APP                                │
│                                                                 │
│  ┌──────────────┐                                              │
│  │   Frontend   │                                              │
│  │  (React)     │                                              │
│  └──────┬───────┘                                              │
│         │                                                      │
│         │ 1. User clicks "Upgrade"                            │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────┐                  │
│  │  utils/stripe.ts                        │                  │
│  │  - createCheckoutSession()              │                  │
│  │  - redirectToCheckout()                 │                  │
│  └─────────────┬───────────────────────────┘                  │
│                │                                               │
└────────────────┼───────────────────────────────────────────────┘
                 │
                 │ 2. API call with userId, email, priceId
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Edge Function: create-checkout-session                 │   │
│  │  - Validates request                                    │   │
│  │  - Calls Stripe API                                     │   │
│  │  - Returns session ID                                   │   │
│  └─────────────┬───────────────────────────────────────────┘   │
│                │                                               │
│                │ Uses STRIPE_SECRET_KEY                        │
│                │                                               │
└────────────────┼───────────────────────────────────────────────┘
                 │
                 │ 3. Create checkout session
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STRIPE                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Checkout Session Created                               │   │
│  │  - Session ID: cs_xxxxx                                 │   │
│  │  - URL: checkout.stripe.com/...                         │   │
│  └─────────────┬───────────────────────────────────────────┘   │
│                │                                               │
└────────────────┼───────────────────────────────────────────────┘
                 │
                 │ 4. Return session to frontend
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      YOUR APP                                   │
│                                                                 │
│  Frontend receives session ID and redirects user                │
│                                                                 │
│  window.location = "https://checkout.stripe.com/..."            │
└─────────────────────────────────────────────────────────────────┘
                 │
                 │ 5. User redirected to Stripe
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STRIPE CHECKOUT                              │
│                                                                 │
│  ┌───────────────────────────────────────┐                     │
│  │  Secure Payment Form                  │                     │
│  │  - Card number                         │                     │
│  │  - Expiry, CVC                         │                     │
│  │  - Billing details                     │                     │
│  │  - Apple Pay / Google Pay             │                     │
│  │                                        │                     │
│  │  [Pay $9.99]  ← User clicks            │                     │
│  └───────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                 │
                 │ 6. Payment processed
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STRIPE                                  │
│                                                                 │
│  Payment succeeded!                                             │
│                                                                 │
│  Two things happen simultaneously:                              │
│  ┌────────────┐                    ┌─────────────┐              │
│  │ Redirect   │                    │  Webhook    │              │
│  │ User Back  │                    │  Event Sent │              │
│  └─────┬──────┘                    └──────┬──────┘              │
└────────┼─────────────────────────────────┼─────────────────────┘
         │                                  │
         │ 7a. Success redirect             │ 7b. Webhook event
         │                                  │
         ▼                                  ▼
┌────────────────────┐         ┌──────────────────────────────────┐
│    YOUR APP        │         │         SUPABASE                 │
│                    │         │                                  │
│  ?success=true     │         │  Edge Function: stripe-webhook   │
│  &session_id=...   │         │  - Verify signature              │
│                    │         │  - Process event                 │
│  User sees         │         │  - Update database               │
│  success message   │         │                                  │
└────────────────────┘         └──────────┬───────────────────────┘
                                          │
                                          │ 8. Update subscription
                                          │
                                          ▼
                               ┌─────────────────────────────────┐
                               │   SUPABASE DATABASE             │
                               │                                 │
                               │   UPDATE users                  │
                               │   SET subscription_status =     │
                               │       'active',                 │
                               │       subscription_plan =       │
                               │       'premium',                │
                               │       stripe_customer_id =      │
                               │       'cus_xxx',                │
                               │       stripe_subscription_id =  │
                               │       'sub_xxx'                 │
                               │   WHERE id = userId             │
                               │                                 │
                               │   INSERT INTO                   │
                               │   subscription_events...        │
                               └─────────────────────────────────┘
                                          │
                                          │ 9. Database updated
                                          │
                                          ▼
                               ┌─────────────────────────────────┐
                               │      YOUR APP                   │
                               │                                 │
                               │  User refreshes page            │
                               │  → Reads user from database     │
                               │  → subscription_plan = 'premium'│
                               │  → Premium features unlock! ✅  │
                               └─────────────────────────────────┘
```

---

## 🔄 Subscription Management Flow

```
                          USER WANTS TO MANAGE SUBSCRIPTION
                                        │
                                        │ 1. Click "Manage"
                                        │
                                        ▼
                          ┌─────────────────────────────┐
                          │    Frontend                 │
                          │    createPortalSession()    │
                          └──────────┬──────────────────┘
                                     │
                                     │ 2. Call backend
                                     │
                                     ▼
                          ┌─────────────────────────────┐
                          │    Supabase Edge Function   │
                          │    create-portal-session    │
                          └──────────┬──────────────────┘
                                     │
                                     │ 3. Create portal
                                     │
                                     ▼
                          ┌─────────────────────────────┐
                          │         Stripe              │
                          │    Customer Portal          │
                          │    - Update card            │
                          │    - Change plan            │
                          │    - Cancel subscription    │
                          │    - View invoices          │
                          └──────────┬──────────────────┘
                                     │
                                     │ 4. User makes changes
                                     │
                                     ▼
                          ┌─────────────────────────────┐
                          │         Stripe              │
                          │    Sends webhook events     │
                          └──────────┬──────────────────┘
                                     │
                                     │ 5. Webhook events
                                     │
                                     ▼
                          ┌─────────────────────────────┐
                          │    Supabase Edge Function   │
                          │    stripe-webhook           │
                          │    - Updates database       │
                          └──────────┬──────────────────┘
                                     │
                                     │ 6. Database updated
                                     │
                                     ▼
                          ┌─────────────────────────────┐
                          │      Your App               │
                          │    Changes reflected        │
                          └─────────────────────────────┘
```

---

## 📡 Webhook Events Flow

```
                              STRIPE EVENTS
                                    │
                                    │ Triggered by:
                                    │ - New subscription
                                    │ - Plan change
                                    │ - Payment success
                                    │ - Payment failure
                                    │ - Cancellation
                                    │
                                    ▼
              ┌─────────────────────────────────────────┐
              │   Stripe sends POST request             │
              │   to your webhook endpoint              │
              │                                         │
              │   Headers:                              │
              │   - stripe-signature: xxx               │
              │                                         │
              │   Body: { event data }                  │
              └───────────────┬─────────────────────────┘
                              │
                              │
                              ▼
              ┌─────────────────────────────────────────┐
              │   Supabase Edge Function                │
              │   stripe-webhook                        │
              │                                         │
              │   1. Verify signature                   │
              │      ├─ Valid? Continue                 │
              │      └─ Invalid? Return 400             │
              │                                         │
              │   2. Parse event type                   │
              └───────────────┬─────────────────────────┘
                              │
                              │
              ┌───────────────┴─────────────────┐
              │                                 │
              ▼                                 ▼
┌────────────────────────┐      ┌────────────────────────┐
│ checkout.session.      │      │ customer.subscription. │
│ completed              │      │ updated                │
│                        │      │                        │
│ - Get customer ID      │      │ - Update status        │
│ - Get subscription ID  │      │ - Update period        │
│ - Find user by email   │      │ - Log event            │
│ - Update subscription  │      │                        │
│ - Log event            │      │                        │
└────────────┬───────────┘      └────────────┬───────────┘
             │                               │
             └───────────┬───────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │     Update Database                │
         │                                   │
         │  UPDATE users                     │
         │  SET subscription_status = ?      │
         │                                   │
         │  INSERT INTO subscription_events  │
         │  (user_id, event_type, ...)       │
         └───────────────┬───────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │    Return 200 OK to Stripe        │
         │    (Stripe marks webhook success) │
         └───────────────────────────────────┘
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: HTTPS Encryption
┌─────────────────────────────────────────────────────────────┐
│  All communication encrypted with TLS/SSL                   │
│  ✅ Frontend ↔ Supabase                                     │
│  ✅ Supabase ↔ Stripe                                       │
│  ✅ Stripe → Webhook                                        │
└─────────────────────────────────────────────────────────────┘

Layer 2: API Key Security
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Public)         Backend (Secret)                 │
│  ├─ pk_test_xxx           ├─ sk_test_xxx                    │
│  ├─ Supabase anon key     ├─ Supabase service key           │
│  └─ Price IDs             └─ Webhook secret                 │
└─────────────────────────────────────────────────────────────┘

Layer 3: Authentication
┌─────────────────────────────────────────────────────────────┐
│  Edge Functions verify:                                     │
│  ✅ User is authenticated (JWT token)                       │
│  ✅ User owns the resource (RLS)                            │
│  ✅ Request is from authorized origin (CORS)                │
└─────────────────────────────────────────────────────────────┘

Layer 4: Webhook Verification
┌─────────────────────────────────────────────────────────────┐
│  Stripe webhooks verify:                                    │
│  ✅ Signature matches webhook secret                        │
│  ✅ Event is recent (timestamp check)                       │
│  ✅ Event hasn't been processed (idempotency)               │
└─────────────────────────────────────────────────────────────┘

Layer 5: Database Security (RLS)
┌─────────────────────────────────────────────────────────────┐
│  Row Level Security policies:                               │
│  ✅ Users can only see own subscription                     │
│  ✅ Service role bypasses RLS (for webhooks)                │
│  ✅ No direct database access from frontend                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    DATA STORAGE                              │
└──────────────────────────────────────────────────────────────┘

User creates account
        │
        ▼
┌─────────────────────┐
│   users table       │
│                     │
│ - id (UUID)         │
│ - email             │
│ - subscription_plan │ ← Defaults to 'basic'
│ - subscription_     │ ← Defaults to 'active'
│   status            │
│ - stripe_customer_  │ ← NULL initially
│   id                │
│ - stripe_           │ ← NULL initially
│   subscription_id   │
└─────────────────────┘

User subscribes
        │
        ▼
┌─────────────────────┐
│   Stripe            │
│                     │
│ - Customer created  │
│ - Subscription      │
│   created           │
└─────────────────────┘
        │
        │ Webhook updates
        │
        ▼
┌─────────────────────┐
│   users table       │
│                     │
│ - subscription_plan │ ← 'premium'
│ - subscription_     │ ← 'active'
│   status            │
│ - stripe_customer_  │ ← 'cus_xxx'
│   id                │
│ - stripe_           │ ← 'sub_xxx'
│   subscription_id   │
└─────────────────────┘

Every subscription event
        │
        ▼
┌──────────────────────────┐
│ subscription_events      │
│                          │
│ - id                     │
│ - user_id                │
│ - event_type             │ ← 'checkout_completed'
│ - stripe_event_id        │ ← 'evt_xxx'
│ - amount                 │
│ - currency               │
│ - created_at             │
└──────────────────────────┘
         │
         │ Provides audit trail
         │
         ▼
   ┌─────────────────┐
   │  HIPAA          │
   │  Compliance     │
   │  Audit Log      │
   └─────────────────┘
```

---

## 🌐 Environment Variables Flow

```
┌──────────────────────────────────────────────────────────────┐
│              WHERE VARIABLES ARE USED                        │
└──────────────────────────────────────────────────────────────┘

Frontend (.env file)
┌─────────────────────────────────────────────────────────────┐
│ VITE_STRIPE_PUBLISHABLE_KEY                                 │
│      │                                                       │
│      ├─► loadStripe()                                       │
│      └─► stripe.redirectToCheckout()                        │
│                                                             │
│ VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID                        │
│      │                                                       │
│      └─► Passed to createCheckoutSession()                  │
│                                                             │
│ VITE_SUPABASE_URL                                           │
│      │                                                       │
│      └─► API endpoint base URL                              │
│                                                             │
│ VITE_SUPABASE_ANON_KEY                                      │
│      │                                                       │
│      └─► Authorization header                               │
└─────────────────────────────────────────────────────────────┘

Backend (Supabase Secrets)
┌─────────────────────────────────────────────────────────────┐
│ STRIPE_SECRET_KEY                                           │
│      │                                                       │
│      ├─► stripe.checkout.sessions.create()                  │
│      ├─► stripe.billingPortal.sessions.create()             │
│      └─► stripe.webhooks.constructEvent()                   │
│                                                             │
│ STRIPE_WEBHOOK_SECRET                                       │
│      │                                                       │
│      └─► Verify webhook signature                           │
│                                                             │
│ SUPABASE_SERVICE_ROLE_KEY                                   │
│      │                                                       │
│      └─► Database updates (bypasses RLS)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile App Flow (Future)

```
                        MOBILE APP
                            │
                            │ Same flow as web!
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌────────┐        ┌──────────┐        ┌──────────┐
   │ Apple  │        │  Stripe  │        │  Google  │
   │  Pay   │        │ Checkout │        │   Pay    │
   └────────┘        └──────────┘        └──────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            │ Payment method selected
                            │
                            ▼
                      Same backend!
                   (Supabase Edge Functions)
```

---

This diagram shows how all the pieces fit together. Save it for reference! 📌
