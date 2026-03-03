/**
 * stripe/config.js
 *
 * Stripe client + IAP product catalog.
 * Price IDs come from your Stripe dashboard — fill them in via .env
 * after creating the products in test mode.
 */

const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------------------------------------------------------------
// IAP Catalog
// Each entry maps a product key to its Stripe price ID, payment type,
// and what to grant in PlayFab on successful purchase.
// ---------------------------------------------------------------------------
const PRODUCTS = {
  STARTER_PACK: {
    priceId: process.env.STRIPE_PRICE_STARTER_PACK,   // $4.99 one-time
    type: 'payment',
    gemsGranted: 600,
    bonusItems: ['character_selector_ticket_x1'],      // PlayFab catalog item IDs
    label: 'Starter Pack',
  },
  BATTLE_PASS: {
    priceId: process.env.STRIPE_PRICE_BATTLE_PASS,    // $9.99/mo recurring
    type: 'subscription',
    entitlement: 'battle_pass_active',
    label: 'Battle Pass',
  },
  GEM_PACK_SMALL: {
    priceId: process.env.STRIPE_PRICE_GEMS_SMALL,     // $9.99
    type: 'payment',
    gemsGranted: 1000,
    label: 'Gem Pack — 1,000',
  },
  GEM_PACK_MEDIUM: {
    priceId: process.env.STRIPE_PRICE_GEMS_MEDIUM,    // $24.99
    type: 'payment',
    gemsGranted: 2750,
    label: 'Gem Pack — 2,750',
  },
  GEM_PACK_LARGE: {
    priceId: process.env.STRIPE_PRICE_GEMS_LARGE,     // $49.99
    type: 'payment',
    gemsGranted: 5800,
    label: 'Gem Pack — 5,800',
  },
  GEM_PACK_WHALE: {
    priceId: process.env.STRIPE_PRICE_GEMS_WHALE,     // $99.99
    type: 'payment',
    gemsGranted: 12500,
    label: 'Gem Pack — 12,500',
  },
};

// Build a reverse lookup from priceId → product (used in webhook fulfillment)
const PRICE_LOOKUP = Object.entries(PRODUCTS).reduce((acc, [key, product]) => {
  if (product.priceId) acc[product.priceId] = { ...product, key };
  return acc;
}, {});

module.exports = { stripe, PRODUCTS, PRICE_LOOKUP };
