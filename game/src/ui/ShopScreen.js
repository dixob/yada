/**
 * ui/ShopScreen.js
 *
 * IAP shop — displays gem packs and the battle pass.
 * Initiates Stripe Checkout by calling the backend /api/stripe/checkout,
 * then redirects the player's browser to the Stripe-hosted checkout page.
 *
 * On return from Stripe (success URL), the webhook has already fired and
 * granted gems in PlayFab. The shop refreshes the gem balance on focus.
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { startCheckout } from '../api/client.js';
import { getProfile } from '../api/client.js';

const PRODUCTS = [
  { key: 'STARTER_PACK',    label: 'Starter Pack',        price: '$4.99',  gems: '600 💎 + character ticket', highlight: true },
  { key: 'BATTLE_PASS',     label: 'Battle Pass',          price: '$9.99/mo', gems: 'Season rewards + daily bonuses', highlight: true },
  { key: 'GEM_PACK_SMALL',  label: '1,000 Gems',           price: '$9.99',  gems: '1,000 💎' },
  { key: 'GEM_PACK_MEDIUM', label: '2,750 Gems',           price: '$24.99', gems: '2,750 💎  (+10% bonus)' },
  { key: 'GEM_PACK_LARGE',  label: '5,800 Gems',           price: '$49.99', gems: '5,800 💎  (+16% bonus)' },
  { key: 'GEM_PACK_WHALE',  label: '12,500 Gems',          price: '$99.99', gems: '12,500 💎 (+25% bonus)' },
];

export default class ShopScreen extends Phaser.Scene {
  constructor() {
    super(SCENES.SHOP);
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d0d1a);

    this._drawHeader();
    this._drawProducts();
    this._drawBackButton();
    this._drawFairPlayNote();

    // Refresh gem balance when the player returns from Stripe checkout
    this.events.on('resume', this._refreshGems, this);
  }

  _drawHeader() {
    const player = this.registry.get('player') || {};

    this.add.text(GAME_WIDTH / 2, 48, 'SHOP', {
      fontFamily: 'monospace', fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);

    this.gemText = this.add.text(GAME_WIDTH - 24, 24, `💎 ${(player.gems || 0).toLocaleString()}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#e2e8f0',
    }).setOrigin(1, 0);
  }

  _drawProducts() {
    const startX = 80;
    const startY = 100;
    const cols = 3;
    const cardW = 360;
    const cardH = 100;
    const padX = 40;
    const padY = 20;

    PRODUCTS.forEach((product, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + padX);
      const y = startY + row * (cardH + padY);

      this._createProductCard(x, y, cardW, cardH, product);
    });
  }

  _createProductCard(x, y, w, h, product) {
    const bg = this.add.graphics();
    const borderColor = product.highlight ? 0xfbbf24 : 0x3f3f5e;
    const fillColor = product.highlight ? 0x1e1a08 : 0x1e1e2e;

    const draw = (isHover) => {
      bg.clear();
      bg.fillStyle(isHover ? (product.highlight ? 0x2e2808 : 0x2d2d4e) : fillColor, 1);
      bg.fillRoundedRect(x, y, w, h, 10);
      bg.lineStyle(1, isHover ? 0x818cf8 : borderColor, 1);
      bg.strokeRoundedRect(x, y, w, h, 10);
    };
    draw(false);

    // Label
    this.add.text(x + 16, y + 18, product.label, {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    });

    // Gem description
    this.add.text(x + 16, y + 44, product.gems, {
      fontFamily: 'monospace', fontSize: '13px', color: '#9ca3af',
    });

    // Price button (right side)
    this.add.text(x + w - 16, y + h / 2, product.price, {
      fontFamily: 'monospace', fontSize: '16px', color: '#a5b4fc',
    }).setOrigin(1, 0.5);

    const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => draw(true));
    hit.on('pointerout', () => draw(false));
    hit.on('pointerdown', () => this._purchase(product.key));
  }

  _drawBackButton() {
    const btn = this.add.text(24, 24, '← Menu', {
      fontFamily: 'monospace', fontSize: '16px', color: '#6b7280',
    }).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#e2e8f0'));
    btn.on('pointerout', () => btn.setColor('#6b7280'));
    btn.on('pointerdown', () => this.scene.start(SCENES.MAIN_MENU));
  }

  _drawFairPlayNote() {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, '✦ Fair Play Pledge — all content completable F2P · transparent odds · hard pity at 90', {
      fontFamily: 'monospace', fontSize: '11px', color: '#374151',
    }).setOrigin(0.5, 1);
  }

  // ---------------------------------------------------------------------------
  // Purchase
  // ---------------------------------------------------------------------------
  async _purchase(productKey) {
    const player = this.registry.get('player');

    if (!player?.playFabId) {
      this._showMessage('Please log in to purchase.', '#ef4444');
      return;
    }

    try {
      this._showMessage('Opening checkout...', '#818cf8');
      const { url } = await startCheckout(productKey, player.playFabId);
      // Redirect to Stripe Checkout (hosted page)
      window.location.href = url;
    } catch (err) {
      this._showMessage('Could not open checkout — try again.', '#ef4444');
      console.error('[Shop] Checkout error:', err);
    }
  }

  async _refreshGems() {
    const player = this.registry.get('player');
    if (!player?.playFabId) return;
    try {
      const { gems } = await getProfile(player.playFabId);
      this.registry.set('player', { ...player, gems });
      this.gemText?.setText(`💎 ${gems.toLocaleString()}`);
    } catch (e) {
      // Silent fail — gem count will refresh on next full login
    }
  }

  _showMessage(msg, color = '#e2e8f0') {
    if (this._msg) this._msg.destroy();
    this._msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 48, msg, {
      fontFamily: 'monospace', fontSize: '15px', color,
    }).setOrigin(0.5);
    this.time.delayedCall(3000, () => this._msg?.destroy());
  }
}
