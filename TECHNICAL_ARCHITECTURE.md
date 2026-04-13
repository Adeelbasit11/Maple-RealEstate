# Technical Architecture & API Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Pricing Page                     Checkout Page                 │
│  ├─ Plan Selection              ├─ Stripe Elements              │
│  ├─ isUpgrade Check             ├─ Card Input                   │
│  └─ Redirect to Checkout        ├─ Cardholder Name              │
│                                 ├─ Order Summary                │
│                                 └─ Confirm Payment              │
│                                                                   │
└────────────────┬──────────────────────────────────┬─────────────┘
                 │                                  │
                 │ Downgrade                        │ Upgrade/New
                 │ (Direct API call)                │ (Custom Checkout)
                 ▼                                  ▼
┌────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stripe Controller                                               │
│  ├─ createCheckoutSession()        [DEFAULT CHECKOUT]          │
│  │   └─ Handles downgrades         └─ Still available          │
│  │                                                               │
│  ├─ createPaymentIntent()          [CUSTOM CHECKOUT - NEW]     │
│  │   └─ Creates payment intent                                  │
│  │   └─ Returns client secret                                   │
│  │                                                               │
│  ├─ confirmPayment()               [CUSTOM CHECKOUT - NEW]     │
│  │   └─ Verifies payment success                                │
│  │   └─ Creates subscription                                    │
│  │   └─ Updates database                                        │
│  │                                                               │
│  └─ handleWebhook()                [SYNC LAYER]                │
│      └─ Listens for subscription events                         │
│      └─ Keeps DB in sync                                        │
│                                                                  │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │   STRIPE API            │
               ├─────────────────────────┤
               │ - Payment Intents       │
               │ - Subscriptions         │
               │ - Customers             │
               │ - Webhooks              │
               └────────────┬────────────┘
                            │
                            ▼
               ┌─────────────────────────┐
               │  DATABASE (MongoDB)     │
               ├─────────────────────────┤
               │ - User subscription data│
               │ - Stripe customer ID    │
               │ - Plan info             │
               └─────────────────────────┘
```

---

## Request/Response Flow

### 1. NEW SUBSCRIPTION/UPGRADE FLOW

#### Step 1: Get Payment Intent
```
CLIENT                           BACKEND                         STRIPE
   │                              │                               │
   │──POST /create-payment-intent─►│                               │
   │  {plan, isUpgrade}            │                               │
   │                               │─────GET /prices/id────────────►│
   │                               │◄─────Price details────────────│
   │                               │                               │
   │                               │─────POST /payment_intents─────►│
   │                               │◄─────{clientSecret}───────────│
   │◄──{clientSecret, amount}──────│                               │
   │                               │                               │
```

#### Step 2: Confirm Payment with Card
```
CLIENT                           STRIPE
   │                              │
   │──CardElement────────────────►│
   │  (Card data tokenized)        │
   │                               │
   │◄─────Success/Failure─────────│
   │                               │
```

#### Step 3: Confirm Payment with Backend
```
CLIENT                           BACKEND                         DB
   │                              │                               │
   │──POST /confirm-payment───────►│                               │
   │  {paymentIntentId}            │                               │
   │                               │─────Verify Payment Intent────►│
   │                               │◄─────Status: succeeded────────│
   │                               │                               │
   │                               │─────POST /subscriptions──────►│
   │                               │◄─────{subscriptionId}────────│
   │                               │                               │
   │                               │─────Update User Record───────►│
   │                               │◄─────Success───────────────│
   │◄──{success, redirect}────────│                               │
   │                               │                               │
   │  Redirect to Success Page     │                               │
   │                               │                               │
```

### 2. DOWNGRADE FLOW (UNCHANGED)

```
CLIENT                           BACKEND                         STRIPE
   │                              │                               │
   │──POST /create-checkout───────►│                               │
   │  {plan, isUpgrade: false}     │                               │
   │                               │─────GET /subscriptions───────►│
   │                               │◄─────Subscription data───────│
   │                               │                               │
   │                               │─────PATCH /subscriptions─────►│
   │                               │  (Update price)               │
   │                               │◄─────Updated sub──────────────│
   │                               │                               │
   │                               │─────Update User Record───────►│
   │◄──{success, message}──────────│                               │
   │                               │                               │
```

### 3. WEBHOOK SYNC FLOW

```
STRIPE                           BACKEND                         DB
   │                              │                               │
   │──POST /webhook───────────────►│                               │
   │  Subscription Event           │                               │
   │                               │─────Verify signature────────►│
   │                               │◄─────Webhook valid───────────│
   │                               │                               │
   │                               │─────Find User by customer───►│
   │                               │◄─────User data───────────────│
   │                               │                               │
   │                               │─────Update Subscription──────►│
   │                               │◄─────Updated──────────────────│
   │◄──{received: true}────────────│                               │
   │                               │                               │
```

---

## Database Schema Impact

### User Model (AuthUser)
```typescript
interface User {
  _id: ObjectId
  email: string
  
  // Stripe Fields
  stripeCustomerId?: string              // Stripe Customer ID
  subscriptionId?: string                // Stripe Subscription ID
  subscriptionPlan?: string              // "Free", "Basic", "Pro", "Enterprise"
  subscriptionStatus?: string            // "active", "past_due", "canceled", etc.
  subscriptionCurrentPeriodEnd?: Date    // When current billing period ends
}
```

---

## Error Handling Flows

### Payment Intent Creation Errors
```
CREATE PAYMENT INTENT
    │
    ├─ Invalid Plan ──────────► 400: Invalid plan selected
    ├─ No Customer ID ────────► Auto-create customer
    ├─ Stripe API Error ──────► 500: Message from Stripe
    └─ Success ───────────────► Return clientSecret
```

### Payment Confirmation Errors
```
CONFIRM PAYMENT
    │
    ├─ Missing paymentIntentId ──► 400: Missing required fields
    ├─ Payment not succeeded ────► 400: Payment was not successful
    ├─ Subscription creation fail ► 500: Failed to create subscription
    ├─ DB update fail ───────────► 500: Failed to update user
    └─ Success ──────────────────► Payment successful!
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. CLIENT SIDE                                          │
│     ├─ HTTPS only (TLS 1.2+)                            │
│     ├─ Stripe.js tokenization                           │
│     └─ No card data in DOM                              │
│                                                           │
│  2. STRIPE SIDE                                          │
│     ├─ PCI DSS Level 1 compliant                        │
│     ├─ Card tokenization                                │
│     ├─ Signature verification                           │
│     └─ Fraud detection                                  │
│                                                           │
│  3. SERVER SIDE                                          │
│     ├─ JWT authentication required                      │
│     ├─ Payment intent verification                      │
│     ├─ Webhook signature validation                     │
│     ├─ Stripe secret key (never exposed)                │
│     └─ Database update logging                          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Configuration Summary

### Environment Variables
```env
# Frontend (.env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend (.env)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

### API Endpoints
```
POST   /api/stripe/create-payment-intent    [NEW]
POST   /api/stripe/confirm-payment          [NEW]
POST   /api/stripe/create-checkout-session  [EXISTING]
GET    /api/stripe/status                   [EXISTING]
POST   /api/stripe/webhook                  [EXISTING]
```

---

## Performance Considerations

| Operation | Time | Notes |
|-----------|------|-------|
| Load pricing page | ~200ms | Server-side rendered |
| Redirect to checkout | <100ms | Client-side redirect |
| Create payment intent | ~500ms | Stripe API call |
| Process payment | ~1-2s | Depends on network & Stripe |
| Confirm payment | ~800ms | Subscription creation |
| Webhook delivery | ~2-3s | Stripe delivery time |

---

## Monitoring & Debugging

### Key Logs to Monitor
```
Backend Logs:
  - [Stripe] Creating payment intent for plan: Basic
  - [Stripe] Payment intent created: pi_xxxxx
  - [Stripe] Payment confirmed for user: user@example.com
  - [Stripe Webhook] subscription.created for customer: cus_xxxxx

Frontend Logs:
  - Checkout form mounted
  - Payment processing started
  - Payment completed, redirecting to success
```

### Debug Mode
Add to checkout page:
```javascript
const DEBUG = true;
if (DEBUG) console.log('Payment Intent:', paymentIntentId);
if (DEBUG) console.log('Stripe Response:', paymentIntent);
```

---

**Architecture Version**: 2.0 (with Custom Checkout)
**Last Updated**: March 17, 2026
