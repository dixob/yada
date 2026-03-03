/**
 * StageSelect.js
 * Mission briefing screen before entering battle.
 *
 * Shows:
 *  - Chapter header
 *  - Mission name + briefing lines (typewriter effect)
 *  - Party preview (portraits + names)
 *  - Enemy intel teaser
 *  - "BEGIN MISSION" button
 *
 * Scene data: none required (defaults to ch01)
 */

import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../config.js';
import { CHARACTERS, STARTING_PARTY } from '../systems/CharacterData.js';
import { STAGES, ENEMIES } from '../systems/EnemyData.js';

const W = GAME_WIDTH;
const H = GAME_HEIGHT;

const STAGE_ID = 'ch01_meridian_contact';

export default class StageSelect extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.STAGE_SELECT ?? 'StageSelect' });
  }

  create() {
    const stage = STAGES[STAGE_ID];
    const enemy = stage ? ENEMIES[stage.enemyId] : ENEMIES['meridian_agent'];

    this._buildBackground();
    this._buildChapterHeader(stage);
    this._buildBriefing(stage);
    this._buildPartyPreview();
    this._buildEnemyIntel(enemy);
    this._buildBeginButton(stage);
  }

  _buildBackground() {
    // Dark atmospheric background
    this.add.rectangle(W / 2, H / 2, W, H, 0x040810);

    // Horizontal scan lines (decorative)
    for (let y = 0; y < H; y += 8) {
      this.add.rectangle(W / 2, y, W, 1, 0x111122, 0.15);
    }

    // Center panel
    this.add.rectangle(W / 2, H / 2, 860, 580, 0x0a1020, 0.9)
      .setStrokeStyle(1, 0x223344, 0.8);

    // Accent border top
    this.add.rectangle(W / 2, H / 2 - 290, 860, 3, 0x7B5CF0, 0.7);
    this.add.rectangle(W / 2, H / 2 + 290, 860, 1, 0x223344, 0.5);
  }

  _buildChapterHeader(stage) {
    // System label
    this.add.text(W / 2, H / 2 - 270, 'FREQUENCY // MISSION BRIEF', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '11px',
      color: '#334455',
      letterSpacing: 4,
    }).setOrigin(0.5, 0.5);

    // Chapter + mission name
    const missionName = stage?.name ?? 'MERIDIAN CONTACT';
    this.add.text(W / 2, H / 2 - 240, `CHAPTER 01 — ${missionName}`, {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '24px',
      color: '#7B5CF0',
      letterSpacing: 5,
    }).setOrigin(0.5, 0.5);

    // Divider
    this.add.rectangle(W / 2, H / 2 - 218, 800, 1, 0x334466, 0.5);
  }

  _buildBriefing(stage) {
    const lines = stage?.briefing ?? [
      'LOCATION: Meridian Tower, sublevel 3.',
      'OBJECTIVE: Extract the source before corporate enforcement arrives.',
      'THREAT: One enforcement unit. Pattern: methodical.',
      'Do not engage unless necessary.',
      '...You already know that\'s not how this goes.',
    ];

    const startY = H / 2 - 195;
    const lineH  = 24;

    this.add.text(W / 2 - 380, startY - 10, '// INTEL BRIEF', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#556677',
      letterSpacing: 2,
    });

    lines.forEach((line, i) => {
      const isLast = i === lines.length - 1;
      const col = isLast ? '#D4820A' : '#aaaacc';
      const prefix = isLast ? '> ' : '  ';

      const txt = this.add.text(W / 2 - 370, startY + 16 + i * lineH, prefix + line, {
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: '13px',
        color: '#00000000', // start invisible for typewriter
        alpha: 0,
      });

      // Staggered fade in
      this.time.delayedCall(200 + i * 180, () => {
        txt.setColor(col).setAlpha(0);
        this.tweens.add({ targets: txt, alpha: 1, duration: 300, ease: 'Sine.easeOut' });
      });
    });
  }

  _buildPartyPreview() {
    const sectionY = H / 2 + 50;

    this.add.text(W / 2 - 380, sectionY, '// SQUAD', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#556677',
      letterSpacing: 2,
    });

    const positions = [
      { id: 'ash',  x: W / 2 - 280 },
      { id: 'vera', x: W / 2 - 110 },
    ];

    positions.forEach(({ id, x }) => {
      const char = CHARACTERS[id];
      if (!char) return;

      const charColor = Phaser.Display.Color.HexStringToColor(char.color).color;

      // Card bg
      const card = this.add.rectangle(x, sectionY + 55, 130, 90, 0x0d1a2a, 1)
        .setStrokeStyle(1, charColor, 0.5);

      // Portrait
      if (this.textures.exists(char.portraitKey)) {
        const img = this.add.image(x, sectionY + 40, char.portraitKey);
        img.setDisplaySize(60, 60);
      } else {
        this.add.rectangle(x, sectionY + 40, 50, 50, charColor, 0.2)
          .setStrokeStyle(1, charColor, 0.5);
      }

      // Name
      this.add.text(x, sectionY + 80, char.name.toUpperCase(), {
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: '12px',
        color: char.color,
        letterSpacing: 2,
      }).setOrigin(0.5, 0.5);

      // Role
      this.add.text(x, sectionY + 94, char.role ?? '', {
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: '9px',
        color: '#556677',
      }).setOrigin(0.5, 0.5);
    });
  }

  _buildEnemyIntel(enemy) {
    const sectionY = H / 2 + 50;
    const enemyX   = W / 2 + 180;

    this.add.text(W / 2 + 50, sectionY, '// THREAT', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#556677',
      letterSpacing: 2,
    });

    // Threat card
    this.add.rectangle(enemyX, sectionY + 55, 200, 90, 0x1a0a0a, 1)
      .setStrokeStyle(1, 0xcc3333, 0.4);

    const enemyName = enemy?.name ?? 'UNKNOWN';
    this.add.text(enemyX, sectionY + 35, enemyName.toUpperCase(), {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '14px',
      color: '#cc3333',
      letterSpacing: 2,
    }).setOrigin(0.5, 0.5);

    const subtitle = enemy?.subtitle ?? '';
    this.add.text(enemyX, sectionY + 52, subtitle, {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#664444',
    }).setOrigin(0.5, 0.5);

    // Stats
    if (enemy) {
      this.add.text(enemyX, sectionY + 68, `HP: ${enemy.maxHp}  ATK: ${enemy.baseAtk}`, {
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
        fontSize: '11px',
        color: '#886655',
      }).setOrigin(0.5, 0.5);
    }

    // Intel note
    this.add.text(enemyX, sectionY + 82, 'Pattern: ATK × 2 → SPECIAL', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '9px',
      color: '#445566',
    }).setOrigin(0.5, 0.5);
  }

  _buildBeginButton(stage) {
    const btnY = H / 2 + 230;

    const btnBg = this.add.rectangle(W / 2, btnY, 220, 48, 0x0d1a2a, 1)
      .setStrokeStyle(1, 0x7B5CF0, 0.8)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(W / 2, btnY, 'BEGIN MISSION', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '16px',
      color: '#7B5CF0',
      letterSpacing: 4,
    }).setOrigin(0.5, 0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x1a2a3a);
      this.tweens.add({ targets: btnText, scaleX: 1.04, scaleY: 1.04, duration: 80 });
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x0d1a2a);
      this.tweens.add({ targets: btnText, scaleX: 1, scaleY: 1, duration: 80 });
    });

    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.BATTLE ?? 'BattleScene', { stageId: STAGE_ID });
      });
    });

    // Back to menu link
    const backText = this.add.text(W / 2, btnY + 38, '← RETURN TO MENU', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '11px',
      color: '#334455',
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    backText.on('pointerover', () => backText.setColor('#556677'));
    backText.on('pointerout',  () => backText.setColor('#334455'));
    backText.on('pointerdown', () => {
      this.scene.start(SCENES.MAIN_MENU);
    });

    // Fade in the button
    btnBg.setAlpha(0);
    btnText.setAlpha(0);
    this.time.delayedCall(1500, () => {
      this.tweens.add({ targets: [btnBg, btnText], alpha: 1, duration: 400 });
    });
  }
}
