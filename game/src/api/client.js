/**
 * api/client.js
 *
 * HTTP client for the Yada game backend.
 * All calls go through the /api proxy defined in vite.config.js (dev)
 * or directly to the production API URL (set via VITE_API_URL env var).
 */

import { API_BASE } from '../config.js';

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Player / Auth
// ---------------------------------------------------------------------------

/**
 * Login or register a player via custom ID.
 * @param {string} customId
 */
export function loginPlayer(customId) {
  return post('/game/login', { customId });
}

/**
 * Get player profile + gem/stamina balances.
 * @param {string} playFabId
 */
export function getProfile(playFabId) {
  return get(`/game/profile/${playFabId}`);
}

// ---------------------------------------------------------------------------
// Gacha
// ---------------------------------------------------------------------------

/**
 * Execute a gacha pull (server-authoritative).
 * @param {string} playFabId
 * @param {string} bannerId
 * @param {1|10}   pullCount
 */
export function executePull(playFabId, bannerId, pullCount) {
  return post('/game/pull', { playFabId, bannerId, pullCount });
}

/**
 * Get pity state for a banner (for display only).
 * @param {string} playFabId
 * @param {string} bannerId
 */
export function getPityState(playFabId, bannerId) {
  return get(`/game/pity/${playFabId}/${bannerId}`);
}

// ---------------------------------------------------------------------------
// Shop / IAP
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Checkout session and return the redirect URL.
 * @param {string} productKey  - Key from the PRODUCTS catalog (e.g. 'GEM_PACK_MEDIUM')
 * @param {string} playFabId
 * @param {string} [playerEmail]
 */
export function startCheckout(productKey, playFabId, playerEmail) {
  return post('/stripe/checkout', { productKey, playFabId, playerEmail });
}

/**
 * Create a Stripe Customer Portal session (for managing Battle Pass subscription).
 * @param {string} stripeCustomerId
 */
export function openBillingPortal(stripeCustomerId) {
  return post('/stripe/portal', { stripeCustomerId });
}
