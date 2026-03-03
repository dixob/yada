/**
 * stripe/webhooks.js
 *
 * Stripe webhook event handler.
 *
 * Flow:
 *   1. Express route receives raw POST body + stripe-signature header
 *   2. constructEvent() verifies the signature (rejects tampered requests)
 *   3. handleWebhookEvent() routes to the appropriate fulfillment logic
 *   4. Fulfillment calls playfab-bridge to grant gems/items/battle pass
 *
 * Events handled:
 *   - checkout.session.completed     → one-time IAP fulfillment OR subscription activation
 *   - customer.subscription.deleted  → revoke battle pass
 *   - payment_intent.succeeded       → logging
 *   - payment_intent.payment_failed  → logging / future player notification
 */

const { stripe, PRICE_LOOKUP } = require('./config');
const { grantGems, grantItems, grantBattlePass, revokeBattlePass } = require('./playfab-bridge');

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

/**
 * Verify a raw Stripe webhook payload against its signature.
 * Must be called with the raw (un-parsed) request body.
 *
 * @param {Buffer} rawBody
 * @param {string} signature  - Value of the stripe-signature header
 * @returns {Stripe.Event}
 */
function constructEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

/**
 * checkout.session.completed
 *
 * Fires when the player completes checkout (both payment and subscription modes).
 * For one-time purchases: grant gems + any bonus items immediately.
 * For subscriptions: activate Battle Pass.
 */
async function handleCheckoutCompleted(session) {
  const playFabId = session.metadata?.playFabId;
  if (!playFabId) {
    console.error(
      `[Webhook] checkout.session.completed — missing playFabId in metadata (session ${session.id})`,
    );
    return;
  }

  if (session.mode === 'payment') {
    // Retrieve the session with line_items expanded to get the price ID
    const expanded = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });
    const priceId = expanded.line_items?.data?.[0]?.price?.id;
    const product = PRICE_LOOKUP[priceId];

    if (!product) {
      console.error(`[Webhook] Unknown priceId "${priceId}" in checkout session ${session.id}`);
      return;
    }

    if (product.gemsGranted) {
      await grantGems(playFabId, product.gemsGranted);
    }
    if (product.bonusItems?.length) {
      await grantItems(playFabId, product.bonusItems);
    }

    console.log(
      `[Webhook] Fulfilled "${product.label}" (+${product.gemsGranted ?? 0} gems) for player ${playFabId}`,
    );
  } else if (session.mode === 'subscription') {
    await grantBattlePass(playFabId);
    console.log(`[Webhook] Battle Pass activated for player ${playFabId}`);
  }
}

/**
 * customer.subscription.deleted
 *
 * Fires when a subscription lapses or is cancelled (immediately or at period end).
 * Revokes the player's Battle Pass entitlement in PlayFab.
 */
async function handleSubscriptionDeleted(subscription) {
  const playFabId = subscription.metadata?.playFabId;
  if (!playFabId) {
    console.error(
      `[Webhook] subscription.deleted — missing playFabId in metadata (sub ${subscription.id})`,
    );
    return;
  }
  await revokeBattlePass(playFabId);
  console.log(`[Webhook] Battle Pass revoked for player ${playFabId}`);
}

/**
 * payment_intent.payment_failed
 *
 * Log failed payments. Extend this to send an in-game notification
 * via PlayFab or email via Stripe when the game is live.
 */
async function handlePaymentFailed(paymentIntent) {
  const reason = paymentIntent.last_payment_error?.message ?? 'unknown reason';
  console.warn(`[Webhook] Payment failed — ${paymentIntent.id}: ${reason}`);
  // TODO: notify player via PlayFab push notification or email
}

// ---------------------------------------------------------------------------
// Main event router
// ---------------------------------------------------------------------------

/**
 * Route a verified Stripe event to the appropriate handler.
 *
 * @param {Stripe.Event} event
 */
async function handleWebhookEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'payment_intent.succeeded':
      console.log(`[Webhook] payment_intent.succeeded — ${event.data.object.id}`);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}

module.exports = { constructEvent, handleWebhookEvent };
