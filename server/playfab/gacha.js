/**
 * playfab/gacha.js
 *
 * Server-authoritative gacha pull system.
 *
 * All pulls are resolved on the backend — the client NEVER determines outcomes.
 * This prevents cheating and ensures our Fair Play Pledge odds are accurate.
 *
 * Pull mechanics (aligned with Yada Fair Play Pledge):
 *   - Base SSR rate: 0.6% per pull
 *   - Soft pity: rate up begins at pull 74 (linear increase)
 *   - Hard pity: guaranteed SSR at pull 90
 *   - Rate-up (50/50): first SSR has 50% chance of being the featured unit
 *   - Guaranteed rate-up: if previous SSR was not the featured unit, next SSR is guaranteed featured
 *
 * Pity state is stored in PlayFab player statistics:
 *   pity_counter_standard   — current pity count on standard banner
 *   pity_counter_featured   — current pity count on featured banner
 *   guaranteed_featured      — 1 if next SSR is guaranteed featured (stored in user data)
 */

const { serverRequest } = require('./client');
const { spendGems, grantItems } = require('./economy');
const { getStats, updateStats, getUserData, setUserData } = require('./player');

// ---------------------------------------------------------------------------
// Pull rates and costs
// ---------------------------------------------------------------------------
const PULL_COST_GEMS = 160;       // Cost per single pull
const PULL_COST_TEN = 1600;       // Cost per 10-pull (no discount at launch — revisit)

const BASE_SSR_RATE = 0.006;      // 0.6%
const BASE_SR_RATE = 0.051;       // 5.1%
// R rate = remainder (~94.3%)

const SOFT_PITY_START = 74;       // Pull index where soft pity begins
const HARD_PITY = 90;             // Guaranteed SSR at this pull count

// ---------------------------------------------------------------------------
// Internal: resolve a single pull with pity
// ---------------------------------------------------------------------------

/**
 * Compute the effective SSR rate given the current pity counter.
 * Soft pity linearly scales from base rate at pull 74 to ~100% at pull 90.
 *
 * @param {number} pityCount  - Pulls since last SSR
 * @returns {number} - Effective SSR probability for this pull
 */
function getEffectiveSsrRate(pityCount) {
  if (pityCount >= HARD_PITY - 1) return 1.0; // Hard pity — guaranteed
  if (pityCount >= SOFT_PITY_START) {
    // Linear interpolation from base rate to 1.0 over 16 pulls
    const softPityPulls = pityCount - SOFT_PITY_START;
    const softPityRange = HARD_PITY - SOFT_PITY_START;
    return BASE_SSR_RATE + (1.0 - BASE_SSR_RATE) * (softPityPulls / softPityRange);
  }
  return BASE_SSR_RATE;
}

/**
 * Resolve a single pull rarity using weighted random selection.
 *
 * @param {number} pityCount
 * @returns {'SSR' | 'SR' | 'R'}
 */
function resolvePullRarity(pityCount) {
  const ssrRate = getEffectiveSsrRate(pityCount);
  const roll = Math.random();
  if (roll < ssrRate) return 'SSR';
  if (roll < ssrRate + BASE_SR_RATE) return 'SR';
  return 'R';
}

/**
 * Select a specific unit from the banner pool for the resolved rarity.
 * Featured SSRs use the 50/50 / guaranteed mechanic.
 *
 * @param {'SSR'|'SR'|'R'} rarity
 * @param {object}         banner       - Banner config object
 * @param {boolean}        isGuaranteed - Whether the next SSR is guaranteed featured
 * @returns {{ itemId: string, rarity: string, isFeatured: boolean }}
 */
function selectUnit(rarity, banner, isGuaranteed) {
  const pool = banner.pools[rarity];
  if (!pool || pool.length === 0) {
    throw new Error(`Banner "${banner.id}" has no pool for rarity ${rarity}`);
  }

  let isFeatured = false;

  if (rarity === 'SSR') {
    // 50/50 mechanic: if guaranteed, always pick featured; otherwise 50% chance
    if (isGuaranteed || Math.random() < 0.5) {
      const featuredPool = pool.filter((u) => u.featured);
      if (featuredPool.length > 0) {
        const unit = featuredPool[Math.floor(Math.random() * featuredPool.length)];
        return { itemId: unit.itemId, rarity, isFeatured: true };
      }
    }
  }

  // Pick from full pool (standard units or non-SSR)
  const unit = pool[Math.floor(Math.random() * pool.length)];
  return { itemId: unit.itemId, rarity, isFeatured };
}

// ---------------------------------------------------------------------------
// Public: execute pulls
// ---------------------------------------------------------------------------

/**
 * Execute a multi-pull (1 or 10) on a banner for a player.
 * Server-authoritative: deducts gems, resolves rarity + units, grants items, updates pity.
 *
 * @param {string} playFabId
 * @param {object} banner     - Banner config (see banner-config.js)
 * @param {number} pullCount  - 1 or 10
 * @returns {Promise<Array<{ itemId, rarity, isFeatured }>>}
 */
async function executePull(playFabId, banner, pullCount = 1) {
  if (![1, 10].includes(pullCount)) {
    throw new Error('pullCount must be 1 or 10');
  }

  const gemCost = pullCount === 10 ? PULL_COST_TEN : PULL_COST_GEMS;

  // 1. Deduct gems (will throw if insufficient)
  await spendGems(playFabId, gemCost);

  // 2. Load current pity state
  const pityStatName = `pity_counter_${banner.id}`;
  const stats = await getStats(playFabId, [pityStatName]);
  const userData = await getUserData(playFabId, [`guaranteed_featured_${banner.id}`]);

  let pityCount = stats[pityStatName] || 0;
  let isGuaranteed = userData[`guaranteed_featured_${banner.id}`] === 'true';

  // 3. Resolve pulls
  const results = [];
  const itemsToGrant = [];

  for (let i = 0; i < pullCount; i++) {
    const rarity = resolvePullRarity(pityCount);
    const { itemId, isFeatured } = selectUnit(rarity, banner, isGuaranteed);

    results.push({ itemId, rarity, isFeatured });
    itemsToGrant.push(itemId);

    if (rarity === 'SSR') {
      // Reset pity on SSR
      pityCount = 0;
      // Update guarantee tracker: if SSR was NOT featured, next SSR is guaranteed
      isGuaranteed = !isFeatured;
    } else {
      pityCount += 1;
    }
  }

  // 4. Grant items to player
  await grantItems(playFabId, itemsToGrant);

  // 5. Persist updated pity state
  await Promise.all([
    updateStats(playFabId, [{ StatisticName: pityStatName, Value: pityCount }]),
    setUserData(playFabId, {
      [`guaranteed_featured_${banner.id}`]: String(isGuaranteed),
    }),
  ]);

  // 6. Track total pulls for analytics
  await serverRequest('/Server/UpdatePlayerStatistics', {
    PlayFabId: playFabId,
    Statistics: [
      {
        StatisticName: 'total_pulls',
        Value: (await getStats(playFabId, ['total_pulls'])).total_pulls + pullCount || pullCount,
      },
    ],
  });

  return results;
}

/**
 * Get a player's current pity state for a given banner.
 *
 * @param {string} playFabId
 * @param {string} bannerId
 * @returns {Promise<{ pityCount: number, isGuaranteed: boolean }>}
 */
async function getPityState(playFabId, bannerId) {
  const [stats, userData] = await Promise.all([
    getStats(playFabId, [`pity_counter_${bannerId}`]),
    getUserData(playFabId, [`guaranteed_featured_${bannerId}`]),
  ]);
  return {
    pityCount: stats[`pity_counter_${bannerId}`] || 0,
    isGuaranteed: userData[`guaranteed_featured_${bannerId}`] === 'true',
    pullsUntilSoftPity: Math.max(0, SOFT_PITY_START - (stats[`pity_counter_${bannerId}`] || 0)),
    pullsUntilHardPity: Math.max(0, HARD_PITY - (stats[`pity_counter_${bannerId}`] || 0)),
  };
}

module.exports = { executePull, getPityState, PULL_COST_GEMS, PULL_COST_TEN, HARD_PITY };
