/**
 * scenes/MainMenu.js
 *
 * Main menu — entry point after loading.
 * Handles login, then offers: Play, Gacha, Shop.
 *
 * Player state (playFabId, gems, displayName) is stored on the
 * Phaser registry so all scenes can access it:
 *   this.registry.get('player')
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { loginPlayer, getProfile } from '../api/client.js';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super(SCENES.MAIN_MENU);
  }

  async create() {
    this._drawBackground();
    this._drawTitle();

    // Attempt silent login using a stored custom ID (or generate a new guest ID)
    await this._login();

    this._drawMenu();
  }

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------
  async _login() {
    let customId = localStorage.getItem('yada_custom_id');
    if (!customId) {
      // Generate a guest ID for new players
      customId = 'guest_' + Math.random().toString(36).slice(2, 11);
      localStorage.setItem('yada_custom_id', customId);
    }

    try {
      const { playFabId, newlyCreated } = await loginPlayer(customId);
      const { gems, stamina, profile } = await getProfile(playFabId);

      this.registry.set('player', {
        playFabId,
        customId,
        displayName: profile?.DisplayName || 'Traveler',
        gems,
        stamina,
        newlyCreated,
      });

      console.log(
        `[Menu] Logged in as ${profile?.DisplayName || 'new player'} (${playFabId}) | Gems: ${gems}`,
      );
    } catch (err) {
      console.warn('[Menu] Login failed — running in offline mode:', err.message);
      // Set a fallback player state so the game is still playable offline
      this.registry.set('player', {
        playFabId: null,
        customId,
        displayName: 'Traveler',
        gems: 0,
        stamina: 100,
        offline: true,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  _drawBackground() {
    // Solid background — replace with parallax art after IP is locked
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a0f);
  }

  _drawTitle() {
    this.add
      .text(GAME_WIDTH / 2, 180, 'YADA', {
        fontFamily: 'monospace',
        fontSize: '72px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 248, 'browser-native gacha RPG', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#6b7280',
      })
      .setOrigin(0.5);
  }

  _drawMenu() {
    const player = this.registry.get('player');
    const cx = GAME_WIDTH / 2;

    // Player info
    this.add
      .text(cx, 310, `Welcome back, ${player.displayName}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#a5b4fc',
      })
      .setOrigin(0.5);

    // Menu buttons
    const buttons = [
      { label: '▶  Play', scene: SCENES.GAME, y: 400 },
      { label: '✦  Gacha', scene: SCENES.GACHA, y: 468 },
      { label: '◈  Shop', scene: SCENES.SHOP, y: 536 },
    ];

    buttons.forEach(({ label, scene, y }) => {
      this._createMenuButton(cx, y, label, () => {
        this.scene.start(scene);
      });
    });

    // Gem counter
    this.add
      .text(GAME_WIDTH - 24, 24, `💎 ${player.gems.toLocaleString()}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#e2e8f0',
      })
      .setOrigin(1, 0);

    if (player.offline) {
      this.add
        .text(cx, GAME_HEIGHT - 24, 'Offline mode — progress will not be saved', {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ef4444',
        })
        .setOrigin(0.5, 1);
    }
  }

  _createMenuButton(x, y, label, onClick) {
    const width = 280;
    const height = 52;

    const bg = this.add.graphics();
    const drawIdle = () => {
      bg.clear();
      bg.fillStyle(0x1e1e2e, 1);
      bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      bg.lineStyle(1, 0x3f3f5e, 1);
      bg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    };
    const drawHover = () => {
      bg.clear();
      bg.fillStyle(0x2d2d4e, 1);
      bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);
      bg.lineStyle(1, 0x818cf8, 1);
      bg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);
    };

    drawIdle();

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5);

    // Hit area
    const hit = this.add
      .rectangle(x, y, width, height)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => { drawHover(); text.setColor('#ffffff'); });
    hit.on('pointerout', () => { drawIdle(); text.setColor('#e2e8f0'); });
    hit.on('pointerdown', onClick);
  }
}
