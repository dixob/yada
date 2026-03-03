/**
 * scenes/Game.js
 *
 * Core gameplay scene — placeholder until the flagship IP and
 * combat system are designed in the art direction session.
 *
 * This scene will eventually contain:
 *   - Map/dungeon rendering
 *   - Turn-based or action combat
 *   - Chapter/stage progression
 *   - Character party management
 *
 * For now it renders a "Coming Soon" state and provides the
 * navigation skeleton (HUD overlay, back to menu).
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class Game extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME);
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0d1a);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'Core Gameplay', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 12, 'Coming after art direction session', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#6b7280',
      })
      .setOrigin(0.5);

    // Start the HUD overlay on top of this scene
    this.scene.launch(SCENES.HUD);

    this._createBackButton();
  }

  _createBackButton() {
    const btn = this.add
      .text(24, 24, '← Menu', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#6b7280',
      })
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#e2e8f0'));
    btn.on('pointerout', () => btn.setColor('#6b7280'));
    btn.on('pointerdown', () => {
      this.scene.stop(SCENES.HUD);
      this.scene.start(SCENES.MAIN_MENU);
    });
  }
}
