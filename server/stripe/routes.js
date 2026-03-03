/**
 * stripe/routes.js
 *
 * Express router for all Stripe-related endpoints.
 * Mount this in server/index.js at /api/stripe.
 *
 * IMPORTANT: The /webhook route uses express.raw() and must be registered
 * BEFORE any global express.json() middleware, or the raw body will be lost
 * and signature verification will fail. See server/index.js for correct setup.
 *
 * Endpoints:
 *   POST /api/stripe/checkout  — create a Checkout session (IAP or Battle Pass)
 *   POST /api/stripe/portal    — create a Customer Portal session (manage subscription)
 *   POST /api/stripe/webhook   — receive Stripe webhook events (raw body)
 */

const express = require('express');
const router = express.Router();
const { PRODUCTS } = require('./config');
const {
  createOneTimeCheckout,
  createSubscriptionCheckout,
  createPortalSession,
} = require('./checkout');
const { constructEvent, handleWebhookEvent } = require('./webhooks');

// ---------------------------------------------------------------------------
// POST /api/stripe/checkout
// ---------------------------------------------------------------------------
/**
 * Initiates a purchase for any product in the catalog.
 *
 * Request body:
 *   {
 *     productKey: string,   // e.g. "GEM_PACK_MEDIUM", "BATTLE_PASS"
 *     playFabId:  string,   // PlayFab player ID — used for fulfillment
 *     playerEmail?: string  // Optional — pre-fills email on checkout page
 *   }
 *
 * Response:
 *   { url: string }  — Redirect the player's browser to this URL
 */
router.post('/checkout', async (req, res) => {
  try {
    const { productKey, playFabId, playerEmail } = req.body;

    if (!productKey || !playFabId) {
      return res.status(400).json({ error: 'productKey and playFabId are required' });
    }

    const product = PRODUCTS[productKey];
    if (!product) {
      return res.status(400).json({ error: `Unknown product: "${productKey}"` });
    }
    if (!product.priceId) {
      return res.status(500).json({
        error: `Price ID for "${productKey}" is not configured. Set the env var in .env.`,
      });
    }

    let session;
    if (product.type === 'subscription') {
      session = await createSubscriptionCheckout({ priceId: product.priceId, playFabId, playerEmail });
    } else {
      session = await createOneTimeCheckout({ priceId: product.priceId, playFabId, playerEmail });
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] Checkout error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/stripe/portal
// ---------------------------------------------------------------------------
/**
 * Creates a Stripe Customer Portal session so the player can manage
 * or cancel their Battle Pass subscription without custom UI.
 *
 * Request body:
 *   { stripeCustomerId: string }
 *
 * Response:
 *   { url: string }  — Redirect the player's browser to this URL
 */
router.post('/portal', async (req, res) => {
  try {
    const { stripeCustomerId } = req.body;
    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'stripeCustomerId is required' });
    }

    const session = await createPortalSession({ stripeCustomerId });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] Portal error:', err.message);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/stripe/webhook
// ---------------------------------------------------------------------------
/**
 * Stripe webhook receiver.
 *
 * Uses express.raw() so the body is available as a Buffer for signature
 * verification. This MUST come before express.json() in the middleware chain.
 *
 * Set your webhook endpoint in Stripe dashboard → Developers → Webhooks:
 *   URL: https://your-domain.com/api/stripe/webhook
 *   Events: checkout.session.completed, customer.subscription.deleted,
 *           payment_intent.succeeded, payment_intent.payment_failed
 *
 * For local testing: use `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = constructEvent(req.body, sig);
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await handleWebhookEvent(event);
      res.json({ received: true });
    } catch (err) {
      console.error('[Webhook] Handler error:', err.message);
      // Return 200 anyway — Stripe retries on non-2xx, which could cause
      // double-grants. Log the error and handle idempotency separately.
      res.json({ received: true, warning: 'Handler encountered an error — check server logs' });
    }
  },
);

module.exports = router;
