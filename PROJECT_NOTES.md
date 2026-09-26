# Mood2Day — Complete Project Notes
*Last updated: June 5, 2026*

---

## 1. Project Overview

**App Name:** Mood2Day  
**Type:** Daily emotional journaling app for mental wellness tracking  
**Owner / Company:** ThatOne! Digital  
**Copyright Footer:** © ThatOne! Digital. All rights reserved.  
**Target Platforms:** iOS, Android (via Capacitor), Web (PWA)  
**Compliance:** HIPAA-compliant design  
**Business Model:** Freemium with Stripe-powered subscriptions  

---

## 2. Business Model & Pricing

### Free Tier
- 3 basic emotion sliders (Happiness, Anxiety, Sadness)
- 5-day history
- Basic journaling
- Therapist sharing
- HIPAA compliance

### Premium Tier — $9.99/month
- All 6 emotion sliders (Happiness, Anxiety, Sadness, Anger, Energy, Overall Mood)
- 5-month history
- Advanced insights & trends
- Enhanced therapist reports
- Priority support
- Export capabilities

### Stripe Price IDs (already created in Stripe Dashboard)
These are stored as environment variables. The frontend reads them from:
- `VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID`
- `VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID`
- `VITE_STRIPE_FAMILY_MONTHLY_PRICE_ID`
- `VITE_STRIPE_FAMILY_YEARLY_PRICE_ID`

The frontend Stripe publishable key is at: `VITE_STRIPE_PUBLISHABLE_KEY`

---

## 3. Branding & Design

### Logo — Internal Pages (header)
- **File:** `src/imports/Mood2Day_Logo_w_Mark_and_TypeV3.png` (bundled directly, no external CDN)
- **Import:** `import mood2dayLogo from '../imports/Mood2Day_Logo_w_Mark_and_TypeV3.png'` in `App.tsx`
- **Rendered size:** 104px tall, `width: auto` (preserves aspect ratio)
- **Location in code:** `App.tsx` header section, plain `<img>` tag with inline style

### Logo — Splash / Login Screen
- Still uses Imgur URLs via `BrandingProvider.tsx` (`logoFeature`, `logoIcon`)
- **Version system:** `BRAND_CONFIG_VERSION = 6` — increment to force cached config refresh

| Usage | URL |
|---|---|
| Feature/login screen (large) | `https://i.imgur.com/ReSVEdV.png?v=5` |
| App icon (square, app stores/PWA) | `https://i.imgur.com/FRDC1EM.png?v=5` |

### Default Color Palette (Healthcare theme)
| Token | Hex |
|---|---|
| Primary | `#2563eb` (blue) |
| Secondary | `#0d9488` (teal) |
| Accent | `#f3e8ff` (soft purple) |
| Happiness | `#fbbf24` (amber) |
| Anxiety | `#f97316` (orange) |
| Sadness | `#3b82f6` (blue) |
| Anger | `#ef4444` (red) |
| Energy | `#8b5cf6` (violet) |
| Overall | `#ec4899` (pink) |

### Available Themes
- `healthcare` (default) — blue/teal
- `therapy` — purple/teal
- `wellness` — amber/green
- `startup` — dark blue/orange
- `custom` — user-defined

### Font / UI Settings
- Font family: `modern`
- Border radius: `soft`
- Animation style: `subtle`

### Design Philosophy
Soft colors, gentle interactions, calming aesthetic. Targets mobile-first experience (iOS & Android).

---

## 4. Architecture

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS v4 |
| UI Components | Radix UI primitives + shadcn/ui pattern |
| Animation | Motion (formerly Framer Motion) |
| Backend | Supabase Edge Function (Deno + Hono) |
| Database | Supabase KV store (`kv_store_2538a5b0`) |
| Auth | Custom (email/password stored in KV store) |
| Payments | Stripe Checkout + Billing Portal |
| Email | Resend API |
| Mobile | Capacitor v8 (planned — iOS & Android) |
| Icons | lucide-react |
| Charts | recharts |

### Key File Paths
```
src/app/App.tsx                        — Main app component (entry point)
src/app/config/content.ts             — All copy/text, centralized for easy editing
src/app/components/AuthProvider.tsx   — Auth state management
src/app/components/BrandingProvider.tsx — Brand/theme management + logo URLs
src/app/components/JournalEntry.tsx   — Emotion slider entry screen
src/app/components/ReviewEntry.tsx    — Entry review before saving
src/app/components/SuccessConfirmation.tsx — Post-save confirmation
src/app/components/History.tsx        — Historical entries view
src/app/components/AnalyticsDashboard.tsx — Charts and insights
src/app/components/SubscriptionManager.tsx — Premium subscription UI (ACTIVE)
src/app/components/SubscriptionManager-with-stripe.tsx — Stripe backup version
src/app/components/AuthScreen.tsx     — Login / registration screen
src/app/components/DisclaimerAcceptance.tsx — HIPAA disclaimer modal
src/app/components/DisclaimerFooter.tsx — Footer disclaimer text
src/app/components/LogoComponent.tsx  — Reusable logo display
src/app/components/BrandingCustomizer.tsx — In-app branding editor
src/app/components/UpgradePrompt.tsx  — Premium upsell prompt
src/app/components/LegalDocuments.tsx — Privacy Policy / Terms of Service
src/app/services/SecureStorage.ts    — Encrypted local storage wrapper
src/app/utils/supabase/info.tsx       — Supabase project ID + anon key
src/app/utils/stripe/config.ts        — Stripe publishable key config
src/app/capacitor.config.ts           — Capacitor mobile config
supabase/functions/server/index.tsx   — ALL backend API routes (Hono server)
supabase/functions/server/kv_store.tsx — KV store utility (DO NOT EDIT)
src/styles/theme.css                  — CSS custom properties / design tokens
src/styles/fonts.css                  — Font imports only
```

---

## 5. Supabase Configuration

**Project ID:** `pyixvaanmebwlxsivlue`  
**Public Anon Key:** Stored in `src/app/utils/supabase/info.tsx`  
**Server URL pattern:** `https://pyixvaanmebwlxsivlue.supabase.co/functions/v1/make-server-2538a5b0/<route>`

### Environment Variables (all configured in Supabase)
| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key (never expose to frontend) |
| `STRIPE_SECRET_KEY` | Stripe server-side API key |
| `STRIPE_WEBHOOK_SECRET` | For verifying Stripe webhook signatures |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend Stripe key |
| `VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Stripe price for premium monthly |
| `VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID` | Stripe price for premium yearly |
| `VITE_STRIPE_FAMILY_MONTHLY_PRICE_ID` | Stripe price for family monthly |
| `VITE_STRIPE_FAMILY_YEARLY_PRICE_ID` | Stripe price for family yearly |
| `RESEND_API_KEY` | For therapist email delivery |

### Database
Only the default KV table is used: `kv_store_2538a5b0`  
**No custom migrations or additional tables.** The KV store is flexible enough for all data needs.

### KV Store Key Patterns
| Key Pattern | Data |
|---|---|
| `user:{email}` | Full user object including subscription status |

### User Object Schema
```json
{
  "id": "timestamp-string",
  "email": "user@example.com",
  "password": "plaintext (TODO: hash in production)",
  "firstName": "Jane",
  "lastName": "Doe",
  "therapistEmail": "therapist@clinic.com",
  "subscriptionStatus": "trial | active | cancelled",
  "subscriptionPlan": "basic | premium | family",
  "stripeCustomerId": "cus_xxx",
  "isVerified": true,
  "createdAt": "ISO timestamp"
}
```

---

## 6. Backend API Routes

All routes are prefixed with `/make-server-2538a5b0/`.

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/test-resend` | Debug Resend API key config |
| POST | `/auth/login` | User login |
| POST | `/auth/register` | New user registration |
| POST | `/create-checkout-session` | Creates Stripe Checkout session |
| POST | `/sync-from-stripe` | Manual subscription sync from Stripe |
| POST | `/get-user` | Fetch user by ID |
| POST | `/send-to-therapist` | Email journal entry to therapist via Resend |
| POST | `/create-portal-session` | Creates Stripe Billing Portal session |
| POST | `/webhook` | Receives & verifies Stripe webhook events |

### Stripe Webhook Events Handled
- `checkout.session.completed` → upgrades user plan in KV
- `customer.subscription.deleted` → downgrades user to basic in KV

---

## 7. Email (Resend)

- **Service:** Resend API
- **From address:** `Mood2Day <onboarding@resend.dev>` (Resend test sender — works immediately without domain setup)
- **Use case:** Therapist sharing — patient sends their journal entry to their therapist's email
- **Route:** `POST /send-to-therapist`
- **Note for production:** Configure a custom domain in Resend to send from `noreply@mood2day.com` or similar. Update the `from` field in the server route.

---

## 8. Emotion Sliders

### All 6 Emotions
| Emotion | Free? | Label | Scale |
|---|---|---|---|
| Happiness | ✅ | Happiness | 0–10 |
| Anxiety | ✅ | Anxiety | 0–10 |
| Sadness | ✅ | Sadness | 0–10 |
| Anger | Premium | Anger | 0–10 |
| Energy | Premium | Energy | 0–10, labeled "No Energy – Very Energetic" |
| Overall Mood | Premium | Overall Mood | 0–10 |

**Important copy note:** The Energy slider end labels were changed from "Very tired – Very energetic" to **"No Energy – Very Energetic"**.

---

## 9. App Navigation / Screens

| Tab/Screen | Description |
|---|---|
| Journal | Main emotion entry (sliders) |
| History | Past entries, limited by plan |
| Analytics | Charts and trends |
| Profile | Account settings, therapist email, subscription info |
| Branding | In-app branding customizer (admin/developer use) |
| Subscription | Premium upgrade/manage screen |

### App Screen States
```typescript
type AppScreen = 'journal' | 'review' | 'success' | 'subscription' | 'profile' | 'analytics' | 'branding' | 'history';
```

---

## 10. Auth System

- Custom email/password auth (NOT Supabase Auth)
- Passwords stored in plaintext in KV store — **TODO for production: hash passwords with bcrypt**
- Demo account: `demo@example.com` / `demo123`
- New users start with `subscriptionStatus: 'trial'`, `subscriptionPlan: 'basic'`
- `isVerified: true` is auto-set (email verification skipped for now)
- Session persisted via `SecureStorage` service (encrypted localStorage wrapper using `crypto-js`)

---

## 11. Stripe Integration Flow

1. User clicks upgrade → `SubscriptionManager.tsx` calls `POST /create-checkout-session`
2. Server creates Stripe Checkout session with `priceId`, `userId`, `email`
3. User is redirected to Stripe-hosted checkout page
4. On success, Stripe redirects back to app with `?session_id=xxx`
5. App detects `session_id` in URL and calls `POST /sync-from-stripe`
6. Server looks up customer by email in Stripe, finds active subscription, updates KV store
7. User's plan is updated to `premium` (or `family`) and app unlocks premium features
8. Stripe webhook (`/webhook`) also handles async confirmations

**Subscription management:** Users can access the Stripe Billing Portal via `POST /create-portal-session` to update/cancel their subscription.

---

## 12. Capacitor Mobile Configuration

File: `src/app/capacitor.config.ts`

| Setting | Value |
|---|---|
| App ID | `com.emotionjournal.app` |
| App Name | `Emotion Journal` (update to `Mood2Day` before app store submission) |
| Web Dir | `dist` |
| Android Scheme | `https` |
| Splash BG Color | `#3b82f6` |
| Keystore Alias | `emotion-journal` |

**Status:** Capacitor config exists and is ready. Beta testing planned before final app store submission.

**TODO before submission:**
- Update `appName` in `capacitor.config.ts` from `"Emotion Journal"` to `"Mood2Day"`
- Update `appId` from `com.emotionjournal.app` to your chosen bundle ID
- Generate and safely store the Android release keystore
- Add real app icons and splash screens in the correct Capacitor asset sizes
- Run `npx cap add ios` and `npx cap add android` in a local environment
- Run `npx cap sync` after each web build

---

## 13. PWA Support

Files: `src/app/public/manifest.json`, `src/app/public/sw.js`  
Component: `PWAInstaller.tsx` — shows install-to-home-screen prompt  
The app is installable as a PWA on both iOS (Safari "Add to Home Screen") and Android Chrome.

---

## 14. HIPAA Compliance Features

- `DisclaimerAcceptance.tsx` — required HIPAA disclaimer modal before first use
- `DisclaimerFooter.tsx` — persistent footer with HIPAA notice
- `LegalDocuments.tsx` — Privacy Policy and Terms of Service
- `SecureStorage.ts` — encrypted local storage (AES via crypto-js)
- Therapist sharing uses email, not file transfer
- No PHI is stored server-side beyond encrypted KV entries

---

## 15. Key Copy / Text Reference

All app copy is centralized in: `src/app/config/content.ts`

### Critical copy decisions made
| Location | Current Text |
|---|---|
| Footer copyright | `© ThatOne! Digital. All rights reserved.` |
| App tagline | `HIPAA-compliant emotional wellness tracking` |
| Journal page heading | `Mood2Day Emotional Journal` |
| Energy slider min label | `No Energy` |
| Energy slider max label | `Very Energetic` |
| Premium price | `$9.99/month` |
| Upgrade CTA | `Start Premium Trial` |
| Trial text | `7-day free trial, cancel anytime` |

---

## 16. Known Technical Debt / TODOs

| Priority | Item |
|---|---|
| HIGH | Hash user passwords before production launch (currently plaintext in KV) |
| HIGH | Update `capacitor.config.ts` app name/ID before store submission |
| HIGH | Set up custom Resend domain for production email sending |
| MEDIUM | Implement proper Supabase Auth instead of custom KV-based auth |
| MEDIUM | Add rate limiting to auth endpoints |
| LOW | Remove `console.log` debug statements from production server |
| LOW | Add proper TypeScript types to KV store user lookups |

---

## 17. Deployment Status

- **Web app:** Live and published via Figma Make
- **Stripe:** Configured and working (live mode assumed — verify in Stripe Dashboard)
- **Resend:** Configured and working with `onboarding@resend.dev` sender
- **iOS:** Not yet submitted — Capacitor beta testing planned
- **Android:** Not yet submitted — Capacitor beta testing planned
- **PWA:** Available via web URL

---

## 18. Starting a New Chat Session

To resume work, share this file and say:

> "I'm continuing development on Mood2Day. Here are my project notes: [paste this file]. I need help with [your task]."

Key things to re-establish in a new session:
1. This is a **Figma Make** project (React + Tailwind, Supabase backend, Deno/Hono server)
2. Main file is `src/app/App.tsx`
3. Backend is `supabase/functions/server/index.tsx`
4. Do NOT modify `supabase/functions/server/kv_store.tsx`
5. Do NOT create new database tables — use the KV store
6. Always check `package.json` before installing new packages
7. Use `pnpm` not `npm`
