/**
 * stripe/checkout.js
 *
 * Creates Stripe Checkout sessions for one-time IAP purchases
 * and Battle Pass subscriptions.
 *
 * The playFabId is stored in session metadata so the webhook handler
 * knows which player to fulfill the purchase for.
 */

const { stripe } = require('./config');

/**
 * Create a Checkout session for a one-time purchase (gem packs, starter pack).
 *
 * @param {string} priceId     - Stripe price ID
 * @param {string} playFabId   - PlayFab player ID (for fulfillment)
 * @param {string} [playerEmail] - Pre-fill email on checkout page (optional)
 * @param {string} [successUrl]
 * @param {string} [cancelUrl]
 * @returns {Promise<Stripe.Checkout.Session>}
 */
async function createOneTimeCheckout({ priceId, playFabId, playerEmail, successUrl, cancelUrl }) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { playFabId },
    customer_email: playerEmail || undefined,
    success_url:
      successUrl ||
      `${process.env.APP_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.APP_URL}/purchase/cancelled`,
    // Enable Stripe Tax once configured in dashboard
    automatic_tax: { enabled: false },
  });
  return session;
}

/**
 * Create a Checkout session for the Battle Pass subscription.
 *
 * @param {string} priceId
 * @param {string} playFabId
 * @param {string} [playerEmail]
 * @param {string} [successUrl]
 * @param {string} [cancelUrl]
 * @returns {Promise<Stripe.Checkout.Session>}
 */
async function createSubscriptionCheckout({
  priceId,
  playFabId,
  playerEmail,
  successUrl,
  cancelUrl,
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    // Store playFabId on both the session and the subscription so webhooks can
    // resolve the player regardless of which event fires.
    metadata: { playFabId },
    subscription_data: {
      metadata: { playFabId },
    },
    customer_email: playerEmail || undefined,
    success_url:
      successUrl ||
      `${process.env.APP_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.APP_URL}/purchase/cancelled`,
  });
  return session;
}

/**
 * Create a Stripe Customer Portal session.
 * Lets players manage or cancel their Battle Pass without custom UI.
 *
 * @param {string} stripeCustomerId - The player's Stripe customer ID
 * @returns {Promise<Stripe.BillingPortal.Session>}
 */
async function createPortalSession({ stripeCustomerId }) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.APP_URL}/account`,
  });
  return session;
}

module.exports = { createOneTimeCheckout, createSubscriptionCheckout, createPortalSession };
