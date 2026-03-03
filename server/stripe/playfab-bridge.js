/**
 * stripe/playfab-bridge.js
 *
 * Fulfillment bridge — called by the webhook handler after a successful
 * Stripe payment. Grants virtual currency and items to the player in PlayFab.
 *
 * Uses the PlayFab Server API (server-side secret key, never exposed to client).
 *
 * PlayFab setup required:
 *   - Virtual currency "GE" (Gems) configured in Economy → Currencies
 *   - Catalog items for bonus items (starter pack ticket, etc.)
 *   - PLAYFAB_TITLE_ID and PLAYFAB_SECRET_KEY set in .env
 */

const https = require('https');

const PLAYFAB_TITLE_ID = process.env.PLAYFAB_TITLE_ID;
const PLAYFAB_SECRET_KEY = process.env.PLAYFAB_SECRET_KEY;
const PLAYFAB_CATALOG_VERSION = process.env.PLAYFAB_CATALOG_VERSION || 'Main';

// ---------------------------------------------------------------------------
// Internal: raw PlayFab Server API request
// ---------------------------------------------------------------------------
function playfabRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: `${PLAYFAB_TITLE_ID}.playfabapi.com`,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SecretKey': PLAYFAB_SECRET_KEY,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.code === 200) {
            resolve(parsed.data);
          } else {
            reject(
              new Error(
                `PlayFab API error [${parsed.error}]: ${parsed.errorMessage}`,
              ),
            );
          }
        } catch (e) {
          reject(new Error(`PlayFab parse error: ${e.message} — raw: ${raw}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Public fulfillment methods
// ---------------------------------------------------------------------------

/**
 * Grant virtual currency (Gems) to a player.
 * Corresponds to virtual currency code "GE" in PlayFab Economy config.
 *
 * @param {string} playFabId
 * @param {number} amount
 */
async function grantGems(playFabId, amount) {
  console.log(`[PlayFab] Granting ${amount} gems → player ${playFabId}`);
  return playfabRequest('/Server/AddUserVirtualCurrency', {
    PlayFabId: playFabId,
    VirtualCurrency: 'GE',
    Amount: amount,
  });
}

/**
 * Grant catalog items (starter pack ticket, cosmetics, etc.) to a player.
 *
 * @param {string}   playFabId
 * @param {string[]} itemIds   - PlayFab catalog item IDs
 */
async function grantItems(playFabId, itemIds) {
  console.log(`[PlayFab] Granting items [${itemIds.join(', ')}] → player ${playFabId}`);
  return playfabRequest('/Server/GrantItemsToUser', {
    PlayFabId: playFabId,
    ItemIds: itemIds,
    CatalogVersion: PLAYFAB_CATALOG_VERSION,
  });
}

/**
 * Activate Battle Pass for a player.
 * Stored as private user data so the game client can read it after login.
 *
 * @param {string} playFabId
 */
async function grantBattlePass(playFabId) {
  console.log(`[PlayFab] Activating Battle Pass → player ${playFabId}`);
  return playfabRequest('/Server/UpdateUserData', {
    PlayFabId: playFabId,
    Data: {
      battle_pass_active: 'true',
      battle_pass_granted_at: new Date().toISOString(),
    },
    Permission: 'Private',
  });
}

/**
 * Deactivate Battle Pass for a player (subscription lapsed or cancelled).
 *
 * @param {string} playFabId
 */
async function revokeBattlePass(playFabId) {
  console.log(`[PlayFab] Revoking Battle Pass → player ${playFabId}`);
  return playfabRequest('/Server/UpdateUserData', {
    PlayFabId: playFabId,
    Data: {
      battle_pass_active: 'false',
      battle_pass_revoked_at: new Date().toISOString(),
    },
    Permission: 'Private',
  });
}

module.exports = { grantGems, grantItems, grantBattlePass, revokeBattlePass };
