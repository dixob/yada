/**
 * CombatLog.js
 * A scrolling text log that shows battle events in real time.
 *
 * Rendered as a Phaser Container with a masked text list.
 * New entries appear at the bottom; old ones scroll up and fade out.
 *
 * Usage:
 *   const log = new CombatLog(scene, x, y, { width, height });
 *   scene.add.existing(log);
 *   log.addEntry('Ash attacks for 52 damage.', 'attack');
 */

const MAX_ENTRIES = 12;

const TYPE_COLORS = {
  system:       '#555577',
  card:         '#aaaaff',
  attack:       '#ffcc66',
  enemy_attack: '#ff6644',
  enemy:        '#cc4422',
  heal:         '#44cc88',
  cleanse:      '#66ddcc',
  buff:         '#ccaaff',
  info:         '#888899',
};

export default class CombatLog extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} config
   * @param {number} config.width
   * @param {number} config.height
   */
  constructor(scene, x, y, { width = 280, height = 160 }) {
    super(scene, x, y);

    this.logWidth  = width;
    this.logHeight = height;
    this._entries  = [];   // Array of Phaser.Text objects

    this._build();
  }

  _build() {
    const s = this.scene;

    // Panel background
    this._bg = s.add.rectangle(0, 0, this.logWidth, this.logHeight, 0x040810, 0.75);
    this._bg.setStrokeStyle(1, 0x223344, 0.6);
    this.add(this._bg);

    // Header
    const header = s.add.text(-(this.logWidth / 2) + 8, -(this.logHeight / 2) + 6, 'COMBAT LOG', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '9px',
      color: '#334455',
      letterSpacing: 2,
    });
    this.add(header);

    // Entry start Y (top of usable area)
    this._entryStartY = -(this.logHeight / 2) + 22;
    this._lineHeight  = 13;
  }

  // ─── Add Entry ─────────────────────────────────────────────────────────────

  /**
   * @param {string} text
   * @param {string} type - key from TYPE_COLORS
   */
  addEntry(text, type = 'info') {
    const s   = this.scene;
    const col = TYPE_COLORS[type] ?? '#888899';
    const x   = -(this.logWidth / 2) + 10;
    const maxLines = Math.floor((this.logHeight - 28) / this._lineHeight);

    // Scroll existing entries up
    for (const entry of this._entries) {
      entry.y -= this._lineHeight;
    }

    // Remove entries that scrolled above the panel
    while (this._entries.length >= MAX_ENTRIES) {
      const old = this._entries.shift();
      s.tweens.add({
        targets: old,
        alpha: 0,
        duration: 200,
        onComplete: () => old.destroy(),
      });
    }

    // Fade out old entries
    this._entries.forEach((entry, i) => {
      const ratio = i / this._entries.length;
      entry.setAlpha(0.3 + ratio * 0.7);
    });

    // New entry — starts at bottom
    const entryY = this._entryStartY + (maxLines - 1) * this._lineHeight;
    const newEntry = s.add.text(x, entryY, `> ${text}`, {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: col,
      wordWrap: { width: this.logWidth - 16 },
    }).setAlpha(0);

    this.add(newEntry);
    this._entries.push(newEntry);

    // Fade in
    s.tweens.add({
      targets: newEntry,
      alpha: 1,
      duration: 200,
      ease: 'Sine.easeOut',
    });
  }

  // ─── Clear ─────────────────────────────────────────────────────────────────

  clear() {
    for (const e of this._entries) e.destroy();
    this._entries = [];
  }
}
