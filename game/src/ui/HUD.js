/**
 * ui/HUD.js
 *
 * Persistent HUD overlay — runs on top of the Game scene.
 * Displays gem count, stamina, and player name.
 * Launched by Game.js via scene.launch(SCENES.HUD).
 */

import { SCENES, GAME_WIDTH } from '../config.js';

export default class HUD extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.HUD, active: false });
  }

  create() {
    const player = this.registry.get('player') || {};

    // Gem count (top right)
    this.gemText = this.add.text(GAME_WIDTH - 24, 24, `💎 ${(player.gems || 0).toLocaleString()}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#e2e8f0',
    }).setOrigin(1, 0);

    // Stamina (top right, below gems)
    this.staminaText = this.add.text(GAME_WIDTH - 24, 52, `⚡ ${player.stamina || 0}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#6b7280',
    }).setOrigin(1, 0);

    // Listen for registry changes (e.g. after IAP purchase grants gems)
    this.registry.events.on('changedata', this._onRegistryChange, this);
  }

  _onRegistryChange(parent, key, value) {
    if (key !== 'player') return;
    this.gemText?.setText(`💎 ${(value.gems || 0).toLocaleString()}`);
    this.staminaText?.setText(`⚡ ${value.stamina || 0}`);
  }

  destroy() {
    this.registry.events.off('changedata', this._onRegistryChange, this);
    super.destroy();
  }
}
