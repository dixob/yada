/**
 * playfab/routes.js
 *
 * Express routes for PlayFab-backed game API.
 * Mount at /api/game in server/index.js.
 *
 * All routes require a valid playFabId in the request body.
 * In production, add auth middleware to verify the player's session
 * before trusting the playFabId claim.
 *
 * Endpoints:
 *   POST /api/game/login          — login or register via custom ID
 *   GET  /api/game/profile/:id    — get player profile + currency balances
 *   POST /api/game/pull           — execute a gacha pull
 *   GET  /api/game/pity/:id/:bannerId — get pity state for a banner
 */

const express = require('express');
const router = express.Router();

const { loginWithCustomId, getProfile } = require('./player');
const { getCurrencyBalances } = require('./economy');
const { executePull, getPityState } = require('./gacha');
const BANNERS = require('./banner-config');

// ---------------------------------------------------------------------------
// POST /api/game/login
// ---------------------------------------------------------------------------
/**
 * Login or register a player.
 * In your real auth flow, validate the customId (JWT, session token, etc.)
 * before passing it to PlayFab.
 *
 * Body: { customId: string }
 * Response: { playFabId, sessionTicket, newlyCreated }
 */
router.post('/login', async (req, res) => {
  try {
    const { customId } = req.body;
    if (!customId) return res.status(400).json({ error: 'customId is required' });

    const result = await loginWithCustomId(customId);
    res.json(result);
  } catch (err) {
    console.error('[Game] Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/game/profile/:playFabId
// ---------------------------------------------------------------------------
/**
 * Get player profile + gem balance.
 *
 * Response: { profile, gems, stamina }
 */
router.get('/profile/:playFabId', async (req, res) => {
  try {
    const { playFabId } = req.params;
    const [profile, currencies] = await Promise.all([
      getProfile(playFabId),
      getCurrencyBalances(playFabId),
    ]);
    res.json({
      profile,
      gems: currencies.GE || 0,
      stamina: currencies.ST || 0,
    });
  } catch (err) {
    console.error('[Game] Profile error:', err.message);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/game/pull
// ---------------------------------------------------------------------------
/**
 * Execute a gacha pull.
 *
 * Body: { playFabId: string, bannerId: string, pullCount: 1 | 10 }
 * Response: { results: [{ itemId, rarity, isFeatured }], pityState }
 */
router.post('/pull', async (req, res) => {
  try {
    const { playFabId, bannerId, pullCount = 1 } = req.body;

    if (!playFabId || !bannerId) {
      return res.status(400).json({ error: 'playFabId and bannerId are required' });
    }

    const banner = BANNERS[bannerId];
    if (!banner) {
      return res.status(400).json({ error: `Unknown banner: "${bannerId}"` });
    }
    if (!banner.active) {
      return res.status(400).json({ error: `Banner "${bannerId}" is not currently active` });
    }

    const results = await executePull(playFabId, banner, pullCount);
    const pityState = await getPityState(playFabId, bannerId);

    res.json({ results, pityState });
  } catch (err) {
    // Surface insufficient funds as a 402 for the client to handle gracefully
    if (err.message?.includes('InsufficientFunds') || err.message?.includes('VirtualCurrency')) {
      return res.status(402).json({ error: 'Insufficient gems' });
    }
    console.error('[Game] Pull error:', err.message);
    res.status(500).json({ error: 'Pull failed' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/game/pity/:playFabId/:bannerId
// ---------------------------------------------------------------------------
/**
 * Get a player's pity state for a banner (for display in the UI).
 *
 * Response: { pityCount, isGuaranteed, pullsUntilSoftPity, pullsUntilHardPity }
 */
router.get('/pity/:playFabId/:bannerId', async (req, res) => {
  try {
    const { playFabId, bannerId } = req.params;
    const state = await getPityState(playFabId, bannerId);
    res.json(state);
  } catch (err) {
    console.error('[Game] Pity error:', err.message);
    res.status(500).json({ error: 'Failed to get pity state' });
  }
});

module.exports = router;
