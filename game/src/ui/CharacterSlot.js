/**
 * CharacterSlot.js
 * Phaser Container representing one character (party member or enemy) in battle.
 *
 * Displays:
 *  - Character portrait/sprite image
 *  - Name label
 *  - HP bar (animated on change)
 *  - Shield indicator
 *  - Active effect icons
 *  - Damage flash animation
 *  - Death overlay
 *
 * Usage:
 *   const slot = new CharacterSlot(scene, x, y, { character, isEnemy });
 *   scene.add.existing(slot);
 *   slot.updateHp(currentHp, maxHp);
 *   slot.playDamageFlash(amount);
 *   slot.playHealEffect(amount);
 */

export default class CharacterSlot extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} config
   * @param {Object} config.character   - CharacterData or enemy object
   * @param {boolean} config.isEnemy    - True for enemy slots
   */
  constructor(scene, x, y, { character, isEnemy = false }) {
    super(scene, x, y);

    this.character = character;
    this.isEnemy = isEnemy;
    this._currentHp = character.maxHp;
    this._maxHp = character.maxHp;

    // Slot size
    this.slotWidth  = isEnemy ? 260 : 240;
    this.slotHeight = isEnemy ? 320 : 190;

    this._build();
  }

  _build() {
    const s = this.scene;
    const w = this.slotWidth;
    const h = this.slotHeight;
    const color = Phaser.Display.Color.HexStringToColor(this.character.color).color;

    // ── Background card ─────────────────────────────────────────────────────
    this._bg = s.add.rectangle(0, 0, w, h, 0x0d1117, 0.85);
    this._bg.setStrokeStyle(1, color, 0.6);
    this.add(this._bg);

    // ── Accent glow line (top) ───────────────────────────────────────────────
    const glowLine = s.add.rectangle(0, -(h / 2) + 2, w - 2, 3, color, 0.8);
    this.add(glowLine);

    // ── Character image ──────────────────────────────────────────────────────
    const imgY = this.isEnemy ? -40 : -30;
    const imgH = this.isEnemy ? 220 : 100;

    if (s.textures.exists(this.character.spriteKey)) {
      this._charImage = s.add.image(0, imgY, this.character.spriteKey);
      const scale = imgH / this._charImage.height;
      this._charImage.setScale(scale);
    } else {
      // Fallback — colored silhouette placeholder
      this._charImage = s.add.rectangle(0, imgY, 80, imgH, color, 0.3);
    }
    this.add(this._charImage);

    // ── Name label ───────────────────────────────────────────────────────────
    const nameY = this.isEnemy ? (h / 2) - 70 : (h / 2) - 70;
    this._nameText = s.add.text(0, nameY, this.character.name.toUpperCase(), {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: this.isEnemy ? '18px' : '14px',
      color: Phaser.Display.Color.IntegerToRGB(Phaser.Display.Color.HexStringToColor(this.character.color).color32)
        ? this.character.color
        : '#ffffff',
      align: 'center',
      letterSpacing: 3,
    }).setOrigin(0.5, 0);
    this.add(this._nameText);

    // Role subtitle (party members only)
    if (!this.isEnemy && this.character.role) {
      this._roleText = s.add.text(0, nameY + 18, this.character.role, {
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: '10px',
        color: '#666688',
        align: 'center',
      }).setOrigin(0.5, 0);
      this.add(this._roleText);
    }

    // ── HP Bar ────────────────────────────────────────────────────────────────
    const barY     = (h / 2) - 30;
    const barW     = w - 24;
    const barH     = 8;

    // Background
    this._hpBarBg = s.add.rectangle(0, barY, barW, barH, 0x111111, 1);
    this._hpBarBg.setStrokeStyle(1, 0x333333);
    this.add(this._hpBarBg);

    // Fill
    this._hpBar = s.add.rectangle(-(barW / 2), barY, barW, barH, color, 1);
    this._hpBar.setOrigin(0, 0.5);
    this.add(this._hpBar);

    // HP text
    this._hpText = s.add.text(0, barY + 10, this._hpLabel(), {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '11px',
      color: '#aaaacc',
      align: 'center',
    }).setOrigin(0.5, 0);
    this.add(this._hpText);

    // ── Shield indicator ─────────────────────────────────────────────────────
    this._shieldText = s.add.text(-(w / 2) + 8, barY - 12, '', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '11px',
      color: '#66aaff',
    });
    this._shieldText.setVisible(false);
    this.add(this._shieldText);

    // ── Status effect icons area ──────────────────────────────────────────────
    this._statusArea = s.add.text(0, barY - 14, '', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#ffaa44',
      align: 'center',
    }).setOrigin(0.5, 0.5);
    this.add(this._statusArea);

    // ── Damage / heal number overlay ──────────────────────────────────────────
    // (created dynamically per-hit)

    // ── Death overlay ─────────────────────────────────────────────────────────
    this._deadOverlay = s.add.rectangle(0, 0, w, h, 0x000000, 0.65);
    this._deadText = s.add.text(0, 0, 'NEUTRALIZED', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '13px',
      color: '#cc3333',
      letterSpacing: 2,
    }).setOrigin(0.5, 0.5);
    this._deadOverlay.setVisible(false);
    this._deadText.setVisible(false);
    this.add(this._deadOverlay);
    this.add(this._deadText);
  }

  // ─── HP ─────────────────────────────────────────────────────────────────────

  _hpLabel() {
    return `${this._currentHp} / ${this._maxHp}`;
  }

  /**
   * Animate HP bar to new value.
   */
  updateHp(currentHp, maxHp) {
    this._currentHp = Math.max(0, currentHp);
    this._maxHp = maxHp;

    const ratio = this._currentHp / this._maxHp;
    const barW  = this.slotWidth - 24;

    this.scene.tweens.add({
      targets: this._hpBar,
      scaleX: Math.max(0.01, ratio),
      duration: 300,
      ease: 'Sine.easeOut',
    });

    this._hpText.setText(this._hpLabel());

    // Color shift: green → yellow → red
    let barColor;
    if (ratio > 0.5)      barColor = Phaser.Display.Color.HexStringToColor(this.character.color).color;
    else if (ratio > 0.25) barColor = 0xddaa22;
    else                   barColor = 0xcc2222;
    this._hpBar.setFillStyle(barColor);

    if (this._currentHp <= 0) {
      this._showDead();
    }
  }

  updateShield(shieldAmount) {
    if (shieldAmount > 0) {
      this._shieldText.setText(`🛡 ${shieldAmount}`);
      this._shieldText.setVisible(true);
    } else {
      this._shieldText.setVisible(false);
    }
  }

  updateEffects(activeEffects) {
    // Show a compact list of active effect type abbreviations
    const labels = activeEffects.map(e => {
      switch (e.type) {
        case 'atk_buff':      return `↑ATK(${e.turnsLeft})`;
        case 'atk_debuff':    return `↓DEF(${e.turnsLeft})`;
        case 'marked':        return `MARKED(${e.turnsLeft})`;
        case 'bonus_damage':  return `+DMG(${e.turnsLeft})`;
        case 'shield':        return null; // shown separately
        default:              return null;
      }
    }).filter(Boolean);

    this._statusArea.setText(labels.join(' '));
  }

  // ─── Animations ─────────────────────────────────────────────────────────────

  playDamageFlash(amount) {
    // Red flash on the slot
    this.scene.tweens.add({
      targets: this._bg,
      fillColor: { from: 0x440000, to: 0x0d1117 },
      duration: 300,
      ease: 'Sine.easeOut',
    });

    // Floating damage number
    this._floatNumber(`-${amount}`, '#ff4444');
  }

  playHealEffect(amount) {
    this._floatNumber(`+${amount}`, '#44ff88');
  }

  playAttackEffect() {
    // Brief scale punch
    this.scene.tweens.add({
      targets: this._charImage,
      scaleX: { from: this._charImage.scaleX * 1.12, to: this._charImage.scaleX },
      scaleY: { from: this._charImage.scaleY * 1.12, to: this._charImage.scaleY },
      duration: 150,
      ease: 'Bounce.easeOut',
    });
  }

  playSpecialEffect() {
    // Stronger flash + shake
    this.scene.tweens.add({
      targets: this,
      x: { from: this.x - 6, to: this.x + 6 },
      duration: 80,
      yoyo: true,
      repeat: 2,
    });
  }

  _floatNumber(text, color) {
    const floater = this.scene.add.text(this.x, this.y - 20, text, {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '22px',
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(100);

    this.scene.tweens.add({
      targets: floater,
      y: floater.y - 60,
      alpha: { from: 1, to: 0 },
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => floater.destroy(),
    });
  }

  _showDead() {
    this._deadOverlay.setVisible(true);
    this._deadText.setVisible(true);
    if (this._charImage) {
      this.scene.tweens.add({
        targets: this._charImage,
        alpha: 0.25,
        duration: 400,
      });
    }
  }

  // ─── Intent display (enemy only) ────────────────────────────────────────────

  showIntent(actionName, isSpecial = false) {
    if (!this.isEnemy) return;

    if (!this._intentText) {
      this._intentText = this.scene.add.text(0, -(this.slotHeight / 2) - 22, '', {
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: '12px',
        color: isSpecial ? '#ff6644' : '#cccccc',
        backgroundColor: '#111111cc',
        padding: { x: 6, y: 3 },
        align: 'center',
      }).setOrigin(0.5, 1);
      this.add(this._intentText);
    }

    this._intentText.setText(`▶ ${actionName}`);
    this._intentText.setColor(isSpecial ? '#ff6644' : '#aaaaaa');
    this._intentText.setVisible(true);
  }
}
