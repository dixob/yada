/**
 * ui/GachaScreen.js
 *
 * Gacha pull interface.
 *
 * Shows:
 *   - Current banner (featured character + art)
 *   - Pull buttons (x1 and x10) with gem cost
 *   - Pity counter (pulls until soft pity / hard pity)
 *   - Pull results with rarity reveal animation
 *
 * Calls the backend /api/game/pull endpoint — all pull logic is
 * server-authoritative. The client only handles display.
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT, GACHA } from '../config.js';
import { executePull, getPityState } from '../api/client.js';

const ACTIVE_BANNER_ID = 'standard'; // TODO: load from server/CMS

export default class GachaScreen extends Phaser.Scene {
  constructor() {
    super(SCENES.GACHA);
  }

  async create() {
    this._drawBackground();
    this._drawHeader();
    this._drawBannerArt();
    await this._loadAndDrawPityState();
    this._drawPullButtons();
    this._drawBackButton();
  }

  // ---------------------------------------------------------------------------
  // UI layout
  // ---------------------------------------------------------------------------
  _drawBackground() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0d1a);
  }

  _drawHeader() {
    const player = this.registry.get('player') || {};

    this.add.text(GAME_WIDTH / 2, 48, 'SUMMON', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Gem balance
    this.gemText = this.add.text(GAME_WIDTH - 24, 24, `💎 ${(player.gems || 0).toLocaleString()}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#e2e8f0',
    }).setOrigin(1, 0);
  }

  _drawBannerArt() {
    // Placeholder until character art is created
    const bannerArea = this.add.graphics();
    bannerArea.fillStyle(0x1a1a2e, 1);
    bannerArea.fillRoundedRect(
      GAME_WIDTH / 2 - 280, 90, 560, 320, 12,
    );

    this.add.text(GAME_WIDTH / 2, 250, '[Banner Art]', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#3f3f5e',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 290, 'Art assets unlock after IP session', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#3f3f5e',
    }).setOrigin(0.5);
  }

  async _loadAndDrawPityState() {
    const player = this.registry.get('player');
    if (!player?.playFabId) return;

    try {
      const pity = await getPityState(player.playFabId, ACTIVE_BANNER_ID);
      this._drawPityInfo(pity);
    } catch (e) {
      console.warn('[Gacha] Could not load pity state:', e.message);
    }
  }

  _drawPityInfo(pity) {
    const cx = GAME_WIDTH / 2;
    const y = 430;

    const label = pity.isGuaranteed
      ? '✦ Next SSR is GUARANTEED featured'
      : `Next SSR in at most ${pity.pullsUntilHardPity} pulls`;

    this.pityLabel = this.add.text(cx, y, label, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: pity.isGuaranteed ? '#fbbf24' : '#6b7280',
    }).setOrigin(0.5);
  }

  _drawPullButtons() {
    const cx = GAME_WIDTH / 2;

    this._createPullButton(cx - 150, 510, 'x1 Pull', `💎 ${GACHA.PULL_COST}`, () =>
      this._doPull(1),
    );
    this._createPullButton(cx + 150, 510, 'x10 Pull', `💎 ${GACHA.PULL_COST_TEN}`, () =>
      this._doPull(10),
    );
  }

  _createPullButton(x, y, label, cost, onClick) {
    const w = 220, h = 72;

    const bg = this.add.graphics();
    const drawIdle = () => {
      bg.clear();
      bg.fillStyle(0x1e1e2e, 1);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      bg.lineStyle(1, 0x4f4f7e, 1);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    };
    const drawHover = () => {
      bg.clear();
      bg.fillStyle(0x2d2d5e, 1);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      bg.lineStyle(1, 0x818cf8, 1);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    };

    drawIdle();

    this.add.text(x, y - 12, label, {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(x, y + 16, cost, {
      fontFamily: 'monospace', fontSize: '14px', color: '#a5b4fc',
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, w, h).setInteractive({ useHandCursor: true });
    hit.on('pointerover', drawHover);
    hit.on('pointerout', drawIdle);
    hit.on('pointerdown', onClick);
  }

  _drawBackButton() {
    const btn = this.add.text(24, 24, '← Menu', {
      fontFamily: 'monospace', fontSize: '16px', color: '#6b7280',
    }).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#e2e8f0'));
    btn.on('pointerout', () => btn.setColor('#6b7280'));
    btn.on('pointerdown', () => this.scene.start(SCENES.MAIN_MENU));
  }

  // ---------------------------------------------------------------------------
  // Pull execution
  // ---------------------------------------------------------------------------
  async _doPull(count) {
    const player = this.registry.get('player');

    if (!player?.playFabId) {
      this._showMessage('Please log in to pull.', '#ef4444');
      return;
    }

    const cost = count === 10 ? GACHA.PULL_COST_TEN : GACHA.PULL_COST;
    if (player.gems < cost) {
      this._showMessage('Not enough gems!', '#ef4444');
      return;
    }

    this._showMessage('Summoning...', '#818cf8');

    try {
      const { results, pityState } = await executePull(player.playFabId, ACTIVE_BANNER_ID, count);

      // Deduct gems locally (server already deducted; this keeps UI in sync)
      const updatedPlayer = { ...player, gems: player.gems - cost };
      this.registry.set('player', updatedPlayer);
      this.gemText.setText(`💎 ${updatedPlayer.gems.toLocaleString()}`);

      // Update pity display
      if (this.pityLabel) {
        const label = pityState.isGuaranteed
          ? '✦ Next SSR is GUARANTEED featured'
          : `Next SSR in at most ${pityState.pullsUntilHardPity} pulls`;
        this.pityLabel.setText(label);
        this.pityLabel.setColor(pityState.isGuaranteed ? '#fbbf24' : '#6b7280');
      }

      this._showResults(results);
    } catch (err) {
      if (err.status === 402) {
        this._showMessage('Not enough gems!', '#ef4444');
      } else {
        this._showMessage('Pull failed — try again.', '#ef4444');
        console.error('[Gacha] Pull error:', err);
      }
    }
  }

  _showMessage(msg, color = '#e2e8f0') {
    if (this._msgText) this._msgText.destroy();
    this._msgText = this.add.text(GAME_WIDTH / 2, 600, msg, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color,
    }).setOrigin(0.5);

    this.time.delayedCall(2500, () => this._msgText?.destroy());
  }

  _showResults(results) {
    // TODO: replace with full pull reveal animation (card flip, rarity flash)
    // For now, show a simple text summary
    const summary = results
      .map((r) => `${r.rarity}${r.isFeatured ? ' ✦' : ''}: ${r.itemId}`)
      .join('\n');

    this._showMessage(summary, '#e2e8f0');
  }
}
