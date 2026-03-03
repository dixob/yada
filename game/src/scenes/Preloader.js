/**
 * scenes/Preloader.js
 *
 * Loads all game assets and displays a progress bar.
 * Once complete, transitions to MainMenu.
 *
 * Asset loading is grouped by type for clarity.
 * Add new assets here as the game grows.
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOADER);
  }

  preload() {
    this._createLoadingBar();

    // -----------------------------------------------------------------------
    // UI Assets
    // -----------------------------------------------------------------------
    // this.load.image('btn-primary', 'assets/ui/btn-primary.png');
    // this.load.image('panel-bg', 'assets/ui/panel-bg.png');
    // this.load.image('gem-icon', 'assets/ui/gem-icon.png');

    // -----------------------------------------------------------------------
    // Characters (add after art direction session locks the IP)
    // -----------------------------------------------------------------------
    // this.load.image('char-portrait-001', 'assets/characters/char_001_portrait.png');

    // -----------------------------------------------------------------------
    // Audio
    // -----------------------------------------------------------------------
    // this.load.audio('bgm-menu', 'assets/audio/bgm_menu.ogg');
    // this.load.audio('sfx-pull', 'assets/audio/sfx_pull.ogg');
  }

  create() {
    this.scene.start(SCENES.MAIN_MENU);
  }

  // ---------------------------------------------------------------------------
  // Internal: draw a simple loading bar using Phaser graphics primitives.
  // Replace with a real sprite-based loader once UI assets are ready.
  // ---------------------------------------------------------------------------
  _createLoadingBar() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const barWidth = 400;
    const barHeight = 12;
    const barRadius = 6;

    // Background track
    const track = this.add.graphics();
    track.fillStyle(0x1e1e2e, 1);
    track.fillRoundedRect(cx - barWidth / 2, cy - barHeight / 2, barWidth, barHeight, barRadius);

    // Fill bar
    const fill = this.add.graphics();

    // "Loading..." label
    this.add.text(cx, cy + 28, 'Loading...', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#6b7280',
    }).setOrigin(0.5);

    // Game title placeholder
    this.add.text(cx, cy - 60, 'YADA', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ffffff',
      alpha: 0.9,
    }).setOrigin(0.5);

    // Update fill as assets load
    this.load.on('progress', (value) => {
      fill.clear();
      fill.fillStyle(0x818cf8, 1); // Indigo
      fill.fillRoundedRect(
        cx - barWidth / 2,
        cy - barHeight / 2,
        barWidth * value,
        barHeight,
        barRadius,
      );
    });

    this.load.on('complete', () => {
      fill.clear();
      fill.fillStyle(0x818cf8, 1);
      fill.fillRoundedRect(cx - barWidth / 2, cy - barHeight / 2, barWidth, barHeight, barRadius);
    });
  }
}
