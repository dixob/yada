/**
 * src/main.js
 *
 * Phaser game entry point.
 * Creates the game instance and registers all scenes.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';

import Boot from './scenes/Boot.js';
import Preloader from './scenes/Preloader.js';
import MainMenu from './scenes/MainMenu.js';
import Game from './scenes/Game.js';
import GachaScreen from './ui/GachaScreen.js';
import ShopScreen from './ui/ShopScreen.js';
import HUD from './ui/HUD.js';

const config = {
  type: Phaser.AUTO,           // Use WebGL if available, fall back to Canvas
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0a0f',
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,    // Scale to fit window, maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    Boot,        // 1. Minimal boot — sets up scale, loads loading bar assets
    Preloader,   // 2. Full preload — loads all game assets with progress bar
    MainMenu,    // 3. Main menu — play, gacha, shop, settings
    Game,        // 4. Core gameplay scene
    HUD,         // 5. HUD overlay (gem count, stamina, back button) — runs alongside Game
    GachaScreen, // 6. Gacha pull UI
    ShopScreen,  // 7. IAP shop
  ],
};

const game = new Phaser.Game(config);

export default game;
