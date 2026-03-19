# Monetization & Go-to-Market Guide

## Summary recommendation
Use **account-based access + subscriptions (Stripe)**.

## Sales model comparison

### Option 1: URL-based access (current-style) — not recommended for production
Pros:
- Simple to implement
- Easy to share

Cons:
- Hard user management
- Complicated billing
- Security risks (guessable URLs)
- Low scalability

### Option 2: Accounts + subscriptions (recommended)
Approach:
- Email/password login via Supabase Auth
- Subscription status via Stripe

Pros:
- Standard SaaS model
- Easier billing integration
- Better security and scaling

Cons:
- Slightly more engineering work (but well-supported)

## Reference architecture

```
User → Supabase Auth → subscription check → feature gating → app
```

## Suggested database model (high level)

```sql
-- auth.users is managed by Supabase

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT, -- 'free', 'premium'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT, -- 'active', 'canceled', 'past_due'
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then migrate content tables from `site_id` to `user_id` (or introduce a mapping layer).

## Stripe

Why Stripe:
- Industry standard for SaaS
- Strong Next.js ecosystem support
- Subscription automation and billing portal

## Implementation phases (suggested)

1) Auth
- Enable providers in Supabase
- Implement login/signup + session handling
- Enforce per-user data isolation (RLS)

2) Payments
- Create Stripe products/plans
- Checkout session endpoint
- Webhooks to update subscription state
- Feature gating in UI

3) Upsells
- Portfolio export, AI analysis, OCR as paid features

