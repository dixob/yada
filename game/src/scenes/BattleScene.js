/**
 * BattleScene.js
 * Main battle scene for FREQUENCY v0.1.
 *
 * Layout (1280 × 720):
 *   Top bar (50px)  — Chapter / stage label + turn counter + phase indicator
 *   Left panel (260px wide) — Party slots (Ash top, Vera bottom)
 *   Center/Right   — Enemy slot
 *   Bottom (160px) — Card hand + AP indicator + End Turn button
 *   Right sidebar  — Combat log
 *
 * Receives scene data:
 *   { stageId }  from StageSelect → used to look up enemy + stage flavor
 */

import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../config.js';
import { CHARACTERS, STARTING_PARTY } from '../systems/CharacterData.js';
import { ENEMIES, STAGES, getEnemy, getStage } from '../systems/EnemyData.js';
import BattleManager, { PHASE } from '../systems/BattleManager.js';
import CardSystem from '../systems/CardSystem.js';
import CharacterSlot from '../ui/CharacterSlot.js';
import CardHand from '../ui/CardHand.js';
import CombatLog from '../ui/CombatLog.js';

const W = GAME_WIDTH;   // 1280
const H = GAME_HEIGHT;  // 720

// Layout constants
const PARTY_PANEL_X   = 130;    // center X of party slots
const ENEMY_X         = 900;    // center X of enemy slot
const ENEMY_Y         = 320;
const HAND_Y          = H - 80; // center Y of card hand row
const LOG_X           = W - 160;
const LOG_Y           = H - 220;
const AP_LABEL_X      = 60;
const AP_LABEL_Y      = H - 80;
const END_BTN_X       = W - 330;
const END_BTN_Y       = H - 80;

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BATTLE ?? 'BattleScene' });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  init(data) {
    this.stageId = data?.stageId ?? 'ch01_meridian_contact';
  }

  // ─── Create ────────────────────────────────────────────────────────────────

  create() {
    // ── Data setup ───────────────────────────────────────────────────────────
    const stageData  = getStage(this.stageId);
    const enemyData  = getEnemy(stageData?.enemyId ?? 'meridian_agent');
    const partyData  = STARTING_PARTY.map(id => CHARACTERS[id]);

    // ── Systems ───────────────────────────────────────────────────────────────
    this._cardSystem    = new CardSystem(STARTING_PARTY);
    this._battleManager = new BattleManager({
      party: partyData,
      enemy: enemyData,
      cardSystem: this._cardSystem,
    });

    // ── Background ────────────────────────────────────────────────────────────
    this._buildBackground(stageData);

    // ── UI ────────────────────────────────────────────────────────────────────
    this._buildTopBar(stageData);
    this._buildPartySlots(partyData);
    this._buildEnemySlot(enemyData);
    this._buildCardHand();
    this._buildAPIndicator();
    this._buildEndTurnButton();
    this._buildCombatLog();
    this._buildPhaseIndicator();

    // ── Wire up BattleManager events ──────────────────────────────────────────
    this._wireEvents();

    // ── Start battle ─────────────────────────────────────────────────────────
    // Small delay for dramatic entry
    this.time.delayedCall(300, () => {
      this._battleManager.start();
    });
  }

  // ─── Background ────────────────────────────────────────────────────────────

  _buildBackground(stageData) {
    if (this.textures.exists('bg-city-night')) {
      this.add.image(W / 2, H / 2, 'bg-city-night').setDisplaySize(W, H);
    } else {
      // Fallback: atmospheric gradient via rectangles
      this.add.rectangle(W / 2, H / 2, W, H, 0x050a12);

      // City silhouette bands (impressionistic)
      const buildingColor = 0x0a1020;
      const heights = [80, 120, 95, 140, 100, 110, 130, 85, 115, 90, 125, 100, 80, 140, 120];
      const bldW = W / heights.length;
      heights.forEach((bh, i) => {
        this.add.rectangle(i * bldW + bldW / 2, H - bh / 2, bldW - 2, bh, buildingColor, 1);
      });

      // Ground glow
      this.add.rectangle(W / 2, H - 10, W, 20, 0x1a2a3a, 0.5);

      // Accent fog
      this.add.rectangle(W / 2, H * 0.65, W, H * 0.7, 0x050810, 0.4);
    }

    // Divider: party panel from battlefield
    this.add.rectangle(265, H / 2, 1, H - 160, 0x223344, 0.4);
  }

  // ─── Top Bar ───────────────────────────────────────────────────────────────

  _buildTopBar(stageData) {
    // Top bar bg
    this.add.rectangle(W / 2, 25, W, 50, 0x040810, 0.9);
    this.add.rectangle(W / 2, 50, W, 1, 0x223344, 0.5);

    // Chapter label
    const chapLabel = stageData
      ? `CH.01 — ${stageData.name}`
      : 'CH.01 — MERIDIAN CONTACT';

    this.add.text(20, 14, chapLabel, {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '15px',
      color: '#7B5CF0',
      letterSpacing: 3,
    });

    // Turn counter
    this._turnText = this.add.text(W - 20, 14, 'TURN 1', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '13px',
      color: '#556677',
    }).setOrigin(1, 0);

    // Phase label
    this._phaseText = this.add.text(W / 2, 14, '', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '11px',
      color: '#334455',
      letterSpacing: 2,
    }).setOrigin(0.5, 0);
  }

  // ─── Party Slots ───────────────────────────────────────────────────────────

  _buildPartySlots(partyData) {
    this._partySlots = {};

    const positions = [
      { id: 'ash',  y: 200 },
      { id: 'vera', y: 480 },
    ];

    for (const pos of positions) {
      const char = partyData.find(c => c.id === pos.id);
      if (!char) continue;

      const slot = new CharacterSlot(this, PARTY_PANEL_X, pos.y, {
        character: char,
        isEnemy: false,
      });
      this.add.existing(slot);
      this._partySlots[pos.id] = slot;
    }
  }

  // ─── Enemy Slot ────────────────────────────────────────────────────────────

  _buildEnemySlot(enemyData) {
    this._enemySlot = new CharacterSlot(this, ENEMY_X, ENEMY_Y, {
      character: enemyData,
      isEnemy: true,
    });
    this.add.existing(this._enemySlot);
  }

  // ─── Card Hand ─────────────────────────────────────────────────────────────

  _buildCardHand() {
    this._cardHand = new CardHand(this, W / 2 - 40, HAND_Y, {
      onCardPlayed: (cardId) => this._onCardPlayed(cardId),
    });
    this.add.existing(this._cardHand);
    this._cardHand.setEnabled(false);
  }

  // ─── AP Indicator ──────────────────────────────────────────────────────────

  _buildAPIndicator() {
    // Label
    this.add.text(AP_LABEL_X, HAND_Y - 50, 'AP', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#556677',
      letterSpacing: 2,
    }).setOrigin(0.5, 0.5);

    // AP pips container
    this._apPips = [];
    for (let i = 0; i < 3; i++) {
      const pip = this.add.circle(AP_LABEL_X - 16 + i * 18, HAND_Y - 28, 7, 0xffffaa, 0.9);
      this._apPips.push(pip);
    }

    this._apText = this.add.text(AP_LABEL_X, HAND_Y - 8, '3 / 3', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '10px',
      color: '#ffffaa',
    }).setOrigin(0.5, 0.5);
  }

  _updateAPDisplay(ap) {
    const maxAp = 3;
    this._apText.setText(`${ap} / ${maxAp}`);
    this._apPips.forEach((pip, i) => {
      pip.setFillStyle(i < ap ? 0xffffaa : 0x334455, i < ap ? 0.9 : 0.4);
    });
  }

  // ─── End Turn Button ───────────────────────────────────────────────────────

  _buildEndTurnButton() {
    const btnW = 160;
    const btnH = 44;

    this._endBtnBg = this.add.rectangle(END_BTN_X, END_BTN_Y, btnW, btnH, 0x0d1a2a, 1);
    this._endBtnBg.setStrokeStyle(1, 0x7B5CF0, 0.8);
    this._endBtnBg.setInteractive({ useHandCursor: true });

    this._endBtnText = this.add.text(END_BTN_X, END_BTN_Y, 'END TURN', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '14px',
      color: '#7B5CF0',
      letterSpacing: 3,
    }).setOrigin(0.5, 0.5);

    this._endBtnBg.on('pointerover', () => {
      if (!this._endBtnEnabled) return;
      this._endBtnBg.setFillStyle(0x1a2a3a);
    });

    this._endBtnBg.on('pointerout', () => {
      this._endBtnBg.setFillStyle(0x0d1a2a);
    });

    this._endBtnBg.on('pointerdown', () => {
      if (!this._endBtnEnabled) return;
      this._battleManager.endTurn();
    });

    this._endBtnEnabled = false;
    this._setEndButtonEnabled(false);
  }

  _setEndButtonEnabled(enabled) {
    this._endBtnEnabled = enabled;
    this._endBtnBg.setStrokeStyle(1, enabled ? 0x7B5CF0 : 0x223344, enabled ? 0.8 : 0.3);
    this._endBtnText.setColor(enabled ? '#7B5CF0' : '#334455');
    this._endBtnBg.input.cursor = enabled ? 'pointer' : 'default';
  }

  // ─── Phase Indicator ───────────────────────────────────────────────────────

  _buildPhaseIndicator() {
    this._phaseIndicator = this.add.text(W / 2, H / 2, '', {
      fontFamily: '"Share Tech Mono", "Courier New", monospace',
      fontSize: '28px',
      color: '#ffffff',
      letterSpacing: 6,
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#00000088',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5, 0.5).setDepth(50).setAlpha(0);
  }

  _flashPhaseText(text, color = '#ffffff') {
    this._phaseIndicator.setText(text);
    this._phaseIndicator.setColor(color);
    this._phaseIndicator.setAlpha(1);

    this.tweens.add({
      targets: this._phaseIndicator,
      alpha: 0,
      delay: 800,
      duration: 400,
      ease: 'Sine.easeOut',
    });
  }

  // ─── Combat Log ────────────────────────────────────────────────────────────

  _buildCombatLog() {
    this._combatLog = new CombatLog(this, LOG_X, LOG_Y, {
      width: 280,
      height: 180,
    });
    this.add.existing(this._combatLog);
  }

  // ─── Next Enemy Intent ─────────────────────────────────────────────────────

  _updateEnemyIntent() {
    const next = this._battleManager.getNextEnemyAction();
    if (this._enemySlot && next) {
      this._enemySlot.showIntent(next.name, next.isSpecial ?? false);
    }
  }

  // ─── Event Wiring ──────────────────────────────────────────────────────────

  _wireEvents() {
    const bm = this._battleManager;

    bm.on('phase_change', ({ phase }) => {
      this._onPhaseChange(phase);
    });

    bm.on('draw_hand', ({ cards, turnNumber, ap }) => {
      this._turnText.setText(`TURN ${turnNumber}`);
      this._cardHand.setHand(cards, ap);
      this._updateAPDisplay(ap);
    });

    bm.on('player_turn_start', ({ ap }) => {
      this._cardHand.setEnabled(true);
      this._setEndButtonEnabled(true);
      this._updateAPDisplay(ap);
      this._updateEnemyIntent();
    });

    bm.on('card_played', ({ card, ap }) => {
      this._cardHand.updateAP(ap);
      this._updateAPDisplay(ap);
      // Refresh character slot effects display
      this._refreshAllSlots();
    });

    bm.on('hp_change', ({ entity, currentHp }) => {
      this._updateEntityHp(entity, currentHp);
    });

    bm.on('heal', ({ target, amount }) => {
      const slot = this._getSlotForEntity(target);
      if (slot) slot.playHealEffect(amount);
    });

    bm.on('party_attack', ({ attacker, damage }) => {
      const slot = this._partySlots[attacker.id];
      if (slot) slot.playAttackEffect();
      if (this._enemySlot) this._enemySlot.playDamageFlash(damage);
    });

    bm.on('enemy_attack', ({ target, damage, isSpecial }) => {
      const slot = this._getSlotForEntity(target);
      if (slot) {
        slot.playDamageFlash(damage);
        if (isSpecial) slot.playSpecialEffect();
      }
      if (isSpecial) {
        this._flashPhaseText('ASSET EXTRACTION', '#ff4422');
      }
    });

    bm.on('effects_ticked', () => {
      this._refreshAllSlots();
    });

    bm.on('effect_applied', () => {
      this._refreshAllSlots();
    });

    bm.on('character_defeated', ({ character }) => {
      const slot = this._partySlots[character.id];
      if (slot) slot.updateHp(0, character.maxHp);
    });

    bm.on('shield', ({ target, amount }) => {
      const slot = this._getSlotForEntity(target);
      if (slot) slot.updateShield(target.shield);
    });

    bm.on('log', ({ text, type }) => {
      this._combatLog.addEntry(text, type);
    });

    bm.on('battle_end', ({ result }) => {
      this._onBattleEnd(result);
    });
  }

  // ─── Phase handler ─────────────────────────────────────────────────────────

  _onPhaseChange(phase) {
    const label = {
      [PHASE.DRAW]:         'DRAW',
      [PHASE.PLAYER_TURN]:  'YOUR TURN',
      [PHASE.PARTY_ATTACK]: 'ATTACK',
      [PHASE.ENEMY_TURN]:   'ENEMY TURN',
      [PHASE.TICK_EFFECTS]: '',
      [PHASE.VICTORY]:      'VICTORY',
      [PHASE.DEFEAT]:       'DEFEAT',
    }[phase] ?? '';

    this._phaseText.setText(label);

    if (phase === PHASE.PARTY_ATTACK) {
      this._cardHand.setEnabled(false);
      this._setEndButtonEnabled(false);
    }

    if (phase === PHASE.ENEMY_TURN) {
      this._flashPhaseText('ENEMY TURN', '#cc4422');
    }
  }

  // ─── Card played ───────────────────────────────────────────────────────────

  _onCardPlayed(cardId) {
    const result = this._battleManager.playCard(cardId);
    if (!result.success) {
      // The CardHand already handles the shake animation
      console.warn('Card play failed:', result.reason);
    }
  }

  // ─── HP Update ─────────────────────────────────────────────────────────────

  _updateEntityHp(entity, currentHp) {
    const slot = this._getSlotForEntity(entity);
    if (slot) {
      slot.updateHp(currentHp, entity.maxHp);
    }
  }

  _getSlotForEntity(entity) {
    // Check if it's a party member
    if (this._partySlots[entity.id]) return this._partySlots[entity.id];
    // Check if it's the enemy
    if (entity.id === this._battleManager.enemy.id) return this._enemySlot;
    return null;
  }

  _refreshAllSlots() {
    // Sync all slots with current BattleManager state
    for (const char of this._battleManager.party) {
      const slot = this._partySlots[char.id];
      if (slot) {
        slot.updateHp(char.currentHp, char.maxHp);
        slot.updateShield(char.shield);
        slot.updateEffects(char.activeEffects);
      }
    }
    const enemy = this._battleManager.enemy;
    if (this._enemySlot) {
      this._enemySlot.updateHp(enemy.currentHp, enemy.maxHp);
      this._enemySlot.updateEffects(enemy.activeEffects);
    }
  }

  // ─── Battle End ─────────────────────────────────────────────────────────────

  _onBattleEnd(result) {
    this._cardHand.setEnabled(false);
    this._setEndButtonEnabled(false);
    this._cardHand.clearHand();

    const isVictory = result === 'victory';

    // Big result flash
    this._flashPhaseText(isVictory ? 'MISSION COMPLETE' : 'MISSION FAILED', isVictory ? '#44ff88' : '#ff4444');

    // Transition to ResultScreen after delay
    this.time.delayedCall(2000, () => {
      this.scene.start(SCENES.RESULT ?? 'ResultScreen', {
        result,
        turnNumber: this._battleManager.getTurnNumber(),
        stageId: this.stageId,
      });
    });
  }
}
