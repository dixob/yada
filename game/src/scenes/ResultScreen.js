/**
 * ResultScreen.js
 * Victory / defeat screen shown after a battle ends.
 *
 * Scene data:
 *   { result: 'victory' | 'defeat', turnNumber, stageId }
 */

import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../config.js';

const W = GAME_WIDTH;
const H = GAME_HEIGHT;

export default class ResultScreen extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.RESULT ?? 'ResultScreen' });
  }

  init(data) {
    this.result     = data?.result      ?? 'defeat';
    this.turnNumber = data?.turnNumber  ?? 0;
    this.stageId    = data?.stageId     ?? 'ch01_meridian_contact';
  }

  create() {
    const isVictory = this.result === 'victory';

    // ── Background ─────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x030608);

    if (isVictory) {
      // Subtle violet bloom
      this.add.rectangle(W / 2, H / 2, W, H, 0x7B5CF0, 0.07);
    } else {
      // Red tint
      this.add.rectangle(W / 2, H / 2, W, H, 0xcc1111, 0.07);
    }

    // Scan lines
    for (let y = 0; y < H; y += 8) {
      this.add.rectangle(W / 2, y, W, 1, 0x111122, 0.1);
    }

    // Center panel
    const panelColor = isVictory ? 0x0a1520 : 0x120a0a;
    this.add.rectangle(W / 2, H / 2, 680, 440, panelColor, 0.95)
      .setStrokeStyle(1, isVictory ? 0x334466 : 0x442222, 0.8);

    // Top accent
    this.add.rectangle(W / 2, H / 2 - 220, 680, 3, isVictory ? 0x7B5CF0 : 0xcc3333, 0.8);

    // ── Result header ──────────────────────────────────────────────────────
    const resultLabel = isVictory ? 'MISSION COMPLETE' : 'MISSION FAILED';
    const resultColor = isVictory ? '#7B5CF0' : '#cc3333';

    const headerText = this.add.text(W / 2, H / 2 - 185, resultLabel, {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '36px',
      color: resultColor,
      letterSpacing: 8,
    }).setOrigin(0.5, 0.5).setAlpha(0);

    this.tweens.add({
      targets: headerText,
      alpha: 1,
      duration: 600,
      ease: 'Sine.easeOut',
    });

    // ── Chapter label ──────────────────────────────────────────────────────
    this.add.text(W / 2, H / 2 - 145, 'CHAPTER 01 — MERIDIAN CONTACT', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '13px',
      color: '#445566',
      letterSpacing: 3,
    }).setOrigin(0.5, 0.5);

    this.add.rectangle(W / 2, H / 2 - 120, 600, 1, 0x223344, 0.5);

    // ── Flavor text ────────────────────────────────────────────────────────
    const flavor = isVictory
      ? [
          '"Asset secured. Meridian doesn\'t know what they lost yet."',
          'Ash lights a cigarette. Vera is already on the next lead.',
          'The city swallows them whole.',
        ]
      : [
          '"Abort. Abort now."',
          'The Meridian agent doesn\'t look back.',
          'You\'ll know better next time. If there is one.',
        ];

    flavor.forEach((line, i) => {
      const isQuote = line.startsWith('"');
      const txt = this.add.text(W / 2, H / 2 - 90 + i * 28, line, {
        fontFamily: isQuote ? 'Georgia, serif' : '"Share Tech Mono", "Courier New", monospace',
        fontSize: isQuote ? '14px' : '12px',
        color: isQuote ? '#ccccdd' : '#556677',
        fontStyle: isQuote ? 'italic' : 'normal',
        align: 'center',
        wordWrap: { width: 580 },
      }).setOrigin(0.5, 0.5).setAlpha(0);

      this.time.delayedCall(400 + i * 250, () => {
        this.tweens.add({ targets: txt, alpha: 1, duration: 400 });
      });
    });

    // ── Stats ──────────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2 + 50, 600, 1, 0x223344, 0.4);

    const statsY = H / 2 + 75;
    this.add.text(W / 2 - 260, statsY, 'TURNS SURVIVED', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#334455',
      letterSpacing: 2,
    });
    this.add.text(W / 2 - 260, statsY + 18, String(this.turnNumber), {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '22px',
      color: '#aaaacc',
    });

    if (isVictory) {
      this.add.text(W / 2 + 60, statsY, 'OUTCOME', {
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: '10px',
        color: '#334455',
        letterSpacing: 2,
      });
      this.add.text(W / 2 + 60, statsY + 18, 'OPERATIVE', {
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: '22px',
        color: '#7B5CF0',
      });
    }

    // ── Buttons ────────────────────────────────────────────────────────────
    const btnY = H / 2 + 160;

    if (isVictory) {
      this._buildButton(W / 2 - 120, btnY, 'RETRY', '#556677', 0x0d1220, 0x334466, () => {
        this._goToBattle();
      });
      this._buildButton(W / 2 + 120, btnY, 'MAIN MENU', '#aaaacc', 0x0d1a2a, 0x7B5CF0, () => {
        this._goToMenu();
      });
    } else {
      this._buildButton(W / 2 - 120, btnY, 'RETRY', '#D4820A', 0x1a1000, 0xD4820A, () => {
        this._goToBattle();
      });
      this._buildButton(W / 2 + 120, btnY, 'MAIN MENU', '#556677', 0x0d1220, 0x334466, () => {
        this._goToMenu();
      });
    }
  }

  _buildButton(x, y, label, textColor, bgColor, strokeColor, onClick) {
    const bg = this.add.rectangle(x, y, 190, 44, bgColor, 1)
      .setStrokeStyle(1, strokeColor, 0.7)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '14px',
      color: textColor,
      letterSpacing: 3,
    }).setOrigin(0.5, 0.5);

    bg.on('pointerover', () => bg.setFillStyle(bgColor + 0x0a0a0a));
    bg.on('pointerout',  () => bg.setFillStyle(bgColor));
    bg.on('pointerdown', onClick);
  }

  _goToBattle() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.STAGE_SELECT ?? 'StageSelect');
    });
  }

  _goToMenu() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.MAIN_MENU);
    });
  }
}
