/**
 * playfab/economy.js
 *
 * Virtual economy operations — virtual currency (gems) and inventory management.
 *
 * PlayFab setup required:
 *   Economy → Currencies: add "GE" (Gems) with display name "Gems"
 *   Economy → Catalogs → Main: add items (gacha tickets, cosmetics, etc.)
 *
 * Currency codes are short (2 char). We use:
 *   GE = Gems (primary premium currency, purchased via IAP)
 *   ST = Stamina (free energy currency, regenerates over time)
 */

const { serverRequest } = require('./client');

const CATALOG_VERSION = process.env.PLAYFAB_CATALOG_VERSION || 'Main';

// ---------------------------------------------------------------------------
// Virtual Currency
// ---------------------------------------------------------------------------

/**
 * Get a player's current virtual currency balances.
 *
 * @param {string} playFabId
 * @returns {Promise<{ GE: number, ST: number, [key: string]: number }>}
 */
async function getCurrencyBalances(playFabId) {
  const data = await serverRequest('/Server/GetUserInventory', {
    PlayFabId: playFabId,
  });
  return data.VirtualCurrency || {};
}

/**
 * Add gems to a player's wallet (called after IAP purchase).
 *
 * @param {string} playFabId
 * @param {number} amount
 */
async function addGems(playFabId, amount) {
  return serverRequest('/Server/AddUserVirtualCurrency', {
    PlayFabId: playFabId,
    VirtualCurrency: 'GE',
    Amount: amount,
  });
}

/**
 * Subtract gems from a player's wallet (called when spending gems in-game).
 * Returns an error if the player has insufficient funds.
 *
 * @param {string} playFabId
 * @param {number} amount
 */
async function spendGems(playFabId, amount) {
  return serverRequest('/Server/SubtractUserVirtualCurrency', {
    PlayFabId: playFabId,
    VirtualCurrency: 'GE',
    Amount: amount,
  });
}

/**
 * Add stamina (free energy currency).
 *
 * @param {string} playFabId
 * @param {number} amount
 */
async function addStamina(playFabId, amount) {
  return serverRequest('/Server/AddUserVirtualCurrency', {
    PlayFabId: playFabId,
    VirtualCurrency: 'ST',
    Amount: amount,
  });
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

/**
 * Get a player's full inventory (items they own).
 *
 * @param {string} playFabId
 * @returns {Promise<Array>} - Array of inventory item objects
 */
async function getInventory(playFabId) {
  const data = await serverRequest('/Server/GetUserInventory', {
    PlayFabId: playFabId,
  });
  return data.Inventory || [];
}

/**
 * Grant one or more catalog items to a player (e.g. gacha pull results, gifts).
 *
 * @param {string}   playFabId
 * @param {string[]} itemIds    - PlayFab catalog item IDs
 */
async function grantItems(playFabId, itemIds) {
  return serverRequest('/Server/GrantItemsToUser', {
    PlayFabId: playFabId,
    ItemIds: itemIds,
    CatalogVersion: CATALOG_VERSION,
  });
}

/**
 * Remove an item instance from a player's inventory (e.g. consuming a ticket).
 *
 * @param {string} playFabId
 * @param {string} itemInstanceId - The specific instance ID (not the item ID)
 */
async function consumeItem(playFabId, itemInstanceId) {
  return serverRequest('/Server/RevokeInventoryItem', {
    PlayFabId: playFabId,
    ItemInstanceId: itemInstanceId,
  });
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

/**
 * Get all items in the game catalog (for client display, shop, etc.)
 *
 * @returns {Promise<Array>} - Array of catalog item objects
 */
async function getCatalog() {
  const data = await serverRequest('/Server/GetCatalogItems', {
    CatalogVersion: CATALOG_VERSION,
  });
  return data.Catalog || [];
}

module.exports = {
  getCurrencyBalances,
  addGems,
  spendGems,
  addStamina,
  getInventory,
  grantItems,
  consumeItem,
  getCatalog,
};
