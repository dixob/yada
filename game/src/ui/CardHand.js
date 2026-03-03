/**
 * CardHand.js
 * Phaser Container that renders the player's hand of cards.
 *
 * Layout: 5 cards in a horizontal row at the bottom of the screen.
 * - Cards are grayed out if AP is insufficient
 * - Clicking a card with enough AP plays it immediately (no confirm)
 * - Hovered card shows detail tooltip (name, cost, description)
 * - Played cards animate off screen
 *
 * Events emitted via callbacks:
 *   onCardPlayed(cardId) — called when player clicks a playable card
 */

const CARD_W = 110;
const CARD_H = 140;
const CARD_GAP = 14;

export default class CardHand extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x          - Center X of the hand row
   * @param {number} y          - Y of the card row
   * @param {Object} config
   * @param {Function} config.onCardPlayed - Called with cardId when a card is clicked
   */
  constructor(scene, x, y, { onCardPlayed }) {
    super(scene, x, y);

    this.onCardPlayed = onCardPlayed;
    this._cards = [];        // Array of { cardData, container, elements }
    this._currentAp = 3;
    this._disabled = false;  // True when not in PLAYER_TURN phase

    this._buildBackground();
    this._buildTooltip();
  }

  _buildBackground() {
    // Subtle panel behind card row
    const totalW = (CARD_W + CARD_GAP) * 5 - CARD_GAP + 40;
    this._panelBg = this.scene.add.rectangle(0, 0, totalW, CARD_H + 20, 0x070c10, 0.7);
    this.add(this._panelBg);
  }

  _buildTooltip() {
    // Detail tooltip — shown on hover, hidden by default
    this._tooltip = this.scene.add.container(0, -CARD_H - 30);

    const tipBg = this.scene.add.rectangle(0, 0, 220, 80, 0x0d1117, 0.95);
    tipBg.setStrokeStyle(1, 0x334466);
    this._tooltipBg = tipBg;

    this._tooltipTitle = this.scene.add.text(-100, -30, '', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '13px',
      color: '#ffffff',
      wordWrap: { width: 200 },
    });

    this._tooltipDesc = this.scene.add.text(-100, -14, '', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#aaaacc',
      wordWrap: { width: 200 },
    });

    this._tooltip.add([tipBg, this._tooltipTitle, this._tooltipDesc]);
    this._tooltip.setVisible(false);
    this.add(this._tooltip);
  }

  // ─── Set hand ──────────────────────────────────────────────────────────────

  /**
   * Render a new hand of cards.
   * @param {Array} cards - Array of card data objects
   * @param {number} ap   - Current AP
   */
  setHand(cards, ap) {
    this._clearHand();
    this._currentAp = ap;

    const totalW = cards.length * (CARD_W + CARD_GAP) - CARD_GAP;
    const startX = -(totalW / 2) + CARD_W / 2;

    cards.forEach((card, i) => {
      const cx = startX + i * (CARD_W + CARD_GAP);
      const cardObj = this._buildCard(card, cx, 0);
      this._cards.push(cardObj);
      this.add(cardObj.container);

      // Entrance animation
      cardObj.container.setAlpha(0);
      cardObj.container.y = 40;
      this.scene.tweens.add({
        targets: cardObj.container,
        alpha: 1,
        y: 0,
        duration: 200,
        delay: i * 40,
        ease: 'Sine.easeOut',
      });
    });

    this._refreshAffordability();
  }

  _buildCard(cardData, cx, cy) {
    const s = this.scene;
    const container = s.add.container(cx, cy);

    const charColor = Phaser.Display.Color.HexStringToColor(cardData.color ?? '#7777aa').color;
    const canAfford = this._currentAp >= (cardData.apCost ?? 1);

    // Background
    const bg = s.add.rectangle(0, 0, CARD_W, CARD_H, 0x0d1a2a, 1);
    bg.setStrokeStyle(1, charColor, canAfford ? 0.8 : 0.25);
    container.add(bg);

    // Top color bar
    const topBar = s.add.rectangle(0, -(CARD_H / 2) + 3, CARD_W - 2, 5, charColor, canAfford ? 0.9 : 0.2);
    container.add(topBar);

    // AP cost pip
    const apColor = canAfford ? 0xffffaa : 0x555555;
    const apCircle = s.add.circle(-(CARD_W / 2) + 14, -(CARD_H / 2) + 14, 11, apColor, canAfford ? 0.9 : 0.4);
    container.add(apCircle);
    const apText = s.add.text(-(CARD_W / 2) + 14, -(CARD_H / 2) + 14, String(cardData.apCost ?? 1), {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '13px',
      color: canAfford ? '#111111' : '#666666',
    }).setOrigin(0.5, 0.5);
    container.add(apText);

    // Character indicator dot
    const charDot = s.add.circle((CARD_W / 2) - 12, -(CARD_H / 2) + 14, 6, charColor, canAfford ? 0.8 : 0.2);
    container.add(charDot);

    // Card name
    const nameText = s.add.text(0, -(CARD_H / 2) + 30, cardData.name, {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '12px',
      color: canAfford ? '#ffffff' : '#555566',
      align: 'center',
      letterSpacing: 1,
    }).setOrigin(0.5, 0.5);
    container.add(nameText);

    // Divider line
    const divider = s.add.rectangle(0, -(CARD_H / 2) + 44, CARD_W - 20, 1, charColor, canAfford ? 0.3 : 0.1);
    container.add(divider);

    // Description (abbreviated)
    const descText = s.add.text(0, -(CARD_H / 2) + 60, cardData.description ?? '', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '9px',
      color: canAfford ? '#9999bb' : '#333344',
      align: 'center',
      wordWrap: { width: CARD_W - 16 },
    }).setOrigin(0.5, 0);
    container.add(descText);

    // ── Interaction ─────────────────────────────────────────────────────────
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      if (this._disabled) return;
      if (canAfford) {
        this.scene.tweens.add({ targets: container, y: -10, duration: 100, ease: 'Sine.easeOut' });
      }
      this._showTooltip(cardData, cx);
    });

    bg.on('pointerout', () => {
      if (this._disabled) return;
      this.scene.tweens.add({ targets: container, y: 0, duration: 100, ease: 'Sine.easeOut' });
      this._hideTooltip();
    });

    bg.on('pointerdown', () => {
      if (this._disabled) return;
      if (!canAfford) {
        // Shake to indicate can't afford
        this.scene.tweens.add({
          targets: container,
          x: { from: cx - 5, to: cx + 5 },
          duration: 60,
          yoyo: true,
          repeat: 2,
        });
        return;
      }
      this._playCard(cardData, container);
    });

    return { cardData, container, bg };
  }

  _playCard(cardData, container) {
    // Animate card flying up and fading
    this.scene.tweens.add({
      targets: container,
      y: -120,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 250,
      ease: 'Sine.easeIn',
      onComplete: () => container.destroy(),
    });

    // Remove from internal array
    this._cards = this._cards.filter(c => c.cardData.id !== cardData.id);

    // Notify BattleScene
    if (this.onCardPlayed) {
      this.onCardPlayed(cardData.id);
    }
  }

  // ─── AP update ─────────────────────────────────────────────────────────────

  updateAP(ap) {
    this._currentAp = ap;
    this._refreshAffordability();
  }

  _refreshAffordability() {
    // Rebuild is expensive — instead just update opacity on each card container
    for (const cardObj of this._cards) {
      const canAfford = this._currentAp >= (cardObj.cardData.apCost ?? 1);
      this.scene.tweens.add({
        targets: cardObj.container,
        alpha: canAfford ? 1 : 0.45,
        duration: 150,
      });
    }
  }

  // ─── Enable / Disable ──────────────────────────────────────────────────────

  setEnabled(enabled) {
    this._disabled = !enabled;
    for (const cardObj of this._cards) {
      cardObj.container.setAlpha(enabled ? 1 : 0.4);
    }
  }

  // ─── Tooltip ───────────────────────────────────────────────────────────────

  _showTooltip(cardData, cx) {
    this._tooltipTitle.setText(`${cardData.name}  [${cardData.apCost} AP]`);
    this._tooltipDesc.setText(cardData.description ?? '');
    this._tooltip.x = cx;
    this._tooltip.setVisible(true);
  }

  _hideTooltip() {
    this._tooltip.setVisible(false);
  }

  // ─── Clear ─────────────────────────────────────────────────────────────────

  _clearHand() {
    for (const cardObj of this._cards) {
      cardObj.container.destroy();
    }
    this._cards = [];
  }

  clearHand() {
    this._clearHand();
  }
}
