/**
 * src/config.js
 *
 * Phaser game configuration and global constants.
 */

// ---------------------------------------------------------------------------
// Game dimensions
// Target a 16:9 canvas that scales to fill the browser window.
// ---------------------------------------------------------------------------
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// ---------------------------------------------------------------------------
// Scene keys — use these constants everywhere instead of raw strings
// ---------------------------------------------------------------------------
export const SCENES = {
  BOOT:         'Boot',
  PRELOADER:    'Preloader',
  MAIN_MENU:    'MainMenu',
  GAME:         'Game',
  GACHA:        'GachaScreen',
  SHOP:         'ShopScreen',
  HUD:          'HUD',
  // ── Battle flow (v0.1) ─────────────────────────────────────────────────
  STAGE_SELECT: 'StageSelect',
  BATTLE:       'BattleScene',
  RESULT:       'ResultScreen',
};

// ---------------------------------------------------------------------------
// Gacha constants (must match server/playfab/gacha.js)
// ---------------------------------------------------------------------------
export const GACHA = {
  PULL_COST: 160,       // Gems per single pull
  PULL_COST_TEN: 1600,  // Gems per 10-pull
  HARD_PITY: 90,
  SOFT_PITY_START: 74,
  RARITY_COLORS: {
    SSR: 0xffd700, // Gold
    SR:  0xc084fc, // Purple
    R:   0x60a5fa, // Blue
  },
};

// ---------------------------------------------------------------------------
// API base URL — proxied to backend in dev, real URL in production
// ---------------------------------------------------------------------------
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
