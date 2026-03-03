/**
 * playfab/banner-config.js
 *
 * Gacha banner definitions.
 *
 * Each banner defines:
 *   - id: unique identifier (used for pity tracking in PlayFab stats)
 *   - name: display name
 *   - active: whether the banner is currently available
 *   - pools: unit pools by rarity, each unit has itemId + featured flag
 *
 * To add a new banner: copy the template, fill in item IDs from PlayFab catalog,
 * set active: true, and add it to the exports.
 *
 * Item IDs must match exactly what's in your PlayFab Economy → Catalog → Main.
 *
 * NOTE: This will eventually be pulled from a CMS / PlayFab title data
 * rather than hardcoded here. For now it's hardcoded for the MVP.
 */

const BANNERS = {

  // ---------------------------------------------------------------------------
  // Standard banner — always available, no featured unit
  // ---------------------------------------------------------------------------
  standard: {
    id: 'standard',
    name: 'Standard Banner',
    active: true,
    pools: {
      SSR: [
        // Add your standard SSR characters here once catalog is set up
        // { itemId: 'char_standard_ssr_001', featured: false },
      ],
      SR: [
        // { itemId: 'char_standard_sr_001', featured: false },
        // { itemId: 'char_standard_sr_002', featured: false },
      ],
      R: [
        // { itemId: 'char_standard_r_001', featured: false },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Featured character banner — limited time, 50/50 mechanic
  // ---------------------------------------------------------------------------
  featured_char_01: {
    id: 'featured_char_01',
    name: 'Featured Character Banner #1',
    active: false, // Set to true when the banner is live
    startDate: null, // ISO date string
    endDate: null,
    pools: {
      SSR: [
        // Featured unit (50/50 target):
        // { itemId: 'char_featured_ssr_001', featured: true },
        // Standard SSR units (lose the 50/50 to these):
        // { itemId: 'char_standard_ssr_001', featured: false },
      ],
      SR: [
        // { itemId: 'char_featured_sr_001', featured: true },
        // { itemId: 'char_standard_sr_001', featured: false },
      ],
      R: [
        // { itemId: 'char_standard_r_001', featured: false },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Weapon banner — separate pity pool for equipment
  // ---------------------------------------------------------------------------
  weapon_01: {
    id: 'weapon_01',
    name: 'Weapon Banner #1',
    active: false,
    pools: {
      SSR: [
        // { itemId: 'weapon_ssr_001', featured: true },
      ],
      SR: [
        // { itemId: 'weapon_sr_001', featured: false },
      ],
      R: [
        // { itemId: 'weapon_r_001', featured: false },
      ],
    },
  },

};

module.exports = BANNERS;
