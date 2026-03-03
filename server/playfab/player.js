/**
 * playfab/player.js
 *
 * Player profile and user data operations.
 *
 * Covers:
 *   - Profile retrieval (display name, stats, linked accounts)
 *   - User data read/write (game progress, settings, entitlements)
 *   - Statistics (level, gacha pull count, pity tracking)
 *   - Login via custom ID (bridges our auth system to PlayFab)
 */

const { serverRequest } = require('./client');

// ---------------------------------------------------------------------------
// Login / Account
// ---------------------------------------------------------------------------

/**
 * Login or register a player using a custom ID (our own user ID / session token).
 * This is the bridge between Yada's auth system and PlayFab.
 *
 * CreateAccount: true means PlayFab will create the player if they don't exist.
 * Returns a SessionTicket for client-side PlayFab calls.
 *
 * @param {string} customId  - Your internal user ID
 * @returns {Promise<{ PlayFabId: string, SessionTicket: string, NewlyCreated: boolean }>}
 */
async function loginWithCustomId(customId) {
  const data = await serverRequest('/Server/LoginWithServerCustomId', {
    ServerCustomId: customId,
    CreateAccount: true,
    InfoRequestParameters: {
      GetUserAccountInfo: true,
      GetUserVirtualCurrency: true,
      GetUserData: true,
      GetPlayerStatistics: true,
    },
  });
  return {
    playFabId: data.PlayFabId,
    sessionTicket: data.SessionTicket,
    newlyCreated: data.NewlyCreated,
    accountInfo: data.InfoResultPayload,
  };
}

/**
 * Get a player's display name and account info.
 *
 * @param {string} playFabId
 */
async function getProfile(playFabId) {
  const data = await serverRequest('/Server/GetPlayerProfile', {
    PlayFabId: playFabId,
    ProfileConstraints: {
      ShowDisplayName: true,
      ShowCreated: true,
      ShowStatistics: true,
      ShowLinkedAccounts: true,
    },
  });
  return data.PlayerProfile;
}

/**
 * Set a player's display name.
 *
 * @param {string} playFabId
 * @param {string} displayName
 */
async function setDisplayName(playFabId, displayName) {
  return serverRequest('/Server/UpdateUserTitleDisplayName', {
    PlayFabId: playFabId,
    DisplayName: displayName,
  });
}

// ---------------------------------------------------------------------------
// User Data (private game state — not visible to other players)
// ---------------------------------------------------------------------------

/**
 * Read private user data keys for a player.
 * Use this for: battle pass status, settings, last login, onboarding progress.
 *
 * @param {string}   playFabId
 * @param {string[]} keys  - Specific keys to read (reads all if omitted)
 * @returns {Promise<object>} - Key/value pairs as strings
 */
async function getUserData(playFabId, keys = []) {
  const data = await serverRequest('/Server/GetUserData', {
    PlayFabId: playFabId,
    Keys: keys.length ? keys : undefined,
  });
  // Flatten the PlayFab format: { key: { Value, LastUpdated } } → { key: value }
  return Object.fromEntries(
    Object.entries(data.Data || {}).map(([k, v]) => [k, v.Value]),
  );
}

/**
 * Write private user data for a player.
 *
 * @param {string} playFabId
 * @param {object} dataMap  - Key/value pairs (values must be strings)
 */
async function setUserData(playFabId, dataMap) {
  return serverRequest('/Server/UpdateUserData', {
    PlayFabId: playFabId,
    Data: dataMap,
    Permission: 'Private',
  });
}

// ---------------------------------------------------------------------------
// Statistics (leaderboard-eligible numeric values)
// ---------------------------------------------------------------------------

/**
 * Read player statistics (level, total pulls, achievements, etc.)
 *
 * @param {string}   playFabId
 * @param {string[]} statNames
 * @returns {Promise<object>} - { statName: value }
 */
async function getStats(playFabId, statNames = []) {
  const data = await serverRequest('/Server/GetPlayerStatistics', {
    PlayFabId: playFabId,
    StatisticNames: statNames.length ? statNames : undefined,
  });
  return Object.fromEntries(
    (data.Statistics || []).map((s) => [s.StatisticName, s.Value]),
  );
}

/**
 * Update player statistics. Creates the stat if it doesn't exist.
 *
 * Common stats for Yada:
 *   player_level, total_pulls, pity_counter_standard, pity_counter_featured,
 *   total_spent_gems, highest_chapter_cleared
 *
 * @param {string} playFabId
 * @param {Array<{ StatisticName: string, Value: number }>} statistics
 */
async function updateStats(playFabId, statistics) {
  return serverRequest('/Server/UpdatePlayerStatistics', {
    PlayFabId: playFabId,
    Statistics: statistics,
  });
}

/**
 * Increment a statistic by a delta (convenience wrapper around updateStats).
 * Reads current value first, then writes the incremented value.
 *
 * @param {string} playFabId
 * @param {string} statName
 * @param {number} delta
 */
async function incrementStat(playFabId, statName, delta) {
  const current = await getStats(playFabId, [statName]);
  const newValue = (current[statName] || 0) + delta;
  return updateStats(playFabId, [{ StatisticName: statName, Value: newValue }]);
}

module.exports = {
  loginWithCustomId,
  getProfile,
  setDisplayName,
  getUserData,
  setUserData,
  getStats,
  updateStats,
  incrementStat,
};
