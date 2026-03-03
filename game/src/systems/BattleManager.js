/**
 * BattleManager.js
 * Core combat state machine for FREQUENCY v0.1.
 *
 * Turn flow:
 *   DRAW → PLAYER_TURN → PARTY_ATTACK → ENEMY_TURN → TICK_EFFECTS → CHECK_END → (loop)
 *
 * BattleManager is framework-agnostic (no Phaser imports).
 * It emits events via registered callbacks so BattleScene can drive the UI.
 *
 * Usage:
 *   const bm = new BattleManager({ party, enemy, cardSystem });
 *   bm.on('phase_change', handler);
 *   bm.on('damage', handler);
 *   // etc.
 *   bm.start();
 */

import { EFFECT_TYPES, TARGET } from './CharacterData.js';
import { ENEMY_ACTION, getEnemyAction, getActionFlavor } from './EnemyData.js';

// ─── Phase Constants ──────────────────────────────────────────────────────────
export const PHASE = {
  IDLE:          'idle',
  DRAW:          'draw',
  PLAYER_TURN:   'player_turn',
  PARTY_ATTACK:  'party_attack',
  ENEMY_TURN:    'enemy_turn',
  TICK_EFFECTS:  'tick_effects',
  CHECK_END:     'check_end',
  VICTORY:       'victory',
  DEFEAT:        'defeat',
};

const AP_PER_TURN = 3;

export default class BattleManager {
  /**
   * @param {Object} config
   * @param {Array}  config.party      - Array of character data objects (from CharacterData.js)
   * @param {Object} config.enemy      - Enemy data object (from EnemyData.js)
   * @param {Object} config.cardSystem - CardSystem instance
   */
  constructor({ party, enemy, cardSystem }) {
    // ── State ──────────────────────────────────────────────────────────────
    this.party = party.map(char => ({
      ...char,
      currentHp: char.maxHp,
      shield: 0,
      activeEffects: [],    // [{ type, value, target, turnsLeft, sourceCard }]
      isDead: false,
    }));

    this.enemy = {
      ...enemy,
      currentHp: enemy.maxHp,
      activeEffects: [],
      isDead: false,
      turnIndex: 0,        // cycles through actionPattern
    };

    this.cardSystem = cardSystem;

    this.phase = PHASE.IDLE;
    this.turnNumber = 0;
    this.ap = 0;
    this.cardsPlayedThisTurn = [];
    this.battleLog = [];    // Array of { turn, text, type } for CombatLog display

    // ── Event Callbacks ───────────────────────────────────────────────────
    this._handlers = {};
  }

  // ─── Event System ───────────────────────────────────────────────────────────

  on(event, fn) {
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(fn);
    return this; // chainable
  }

  off(event, fn) {
    if (!this._handlers[event]) return;
    this._handlers[event] = this._handlers[event].filter(h => h !== fn);
  }

  emit(event, data) {
    if (!this._handlers[event]) return;
    for (const fn of this._handlers[event]) fn(data);
  }

  // ─── Battle Start ───────────────────────────────────────────────────────────

  start() {
    this.log('Battle started.', 'system');
    this._setPhase(PHASE.DRAW);
    this._doDraw();
  }

  // ─── Phase Transitions ──────────────────────────────────────────────────────

  _setPhase(phase) {
    this.phase = phase;
    this.emit('phase_change', { phase });
  }

  // ─── DRAW PHASE ─────────────────────────────────────────────────────────────

  _doDraw() {
    this.turnNumber++;
    this.ap = AP_PER_TURN;
    this.cardsPlayedThisTurn = [];

    const drawn = this.cardSystem.drawHand();
    this.emit('draw_hand', { cards: drawn, turnNumber: this.turnNumber, ap: this.ap });
    this.log(`Turn ${this.turnNumber} — Draw phase. AP: ${this.ap}.`, 'system');

    this._setPhase(PHASE.PLAYER_TURN);
    this.emit('player_turn_start', { ap: this.ap, turnNumber: this.turnNumber });
  }

  // ─── PLAYER TURN ────────────────────────────────────────────────────────────

  /**
   * Called by BattleScene when the player plays a card.
   * Returns { success, reason } so the UI can give feedback.
   */
  playCard(cardId) {
    if (this.phase !== PHASE.PLAYER_TURN) {
      return { success: false, reason: 'Not player turn' };
    }

    const card = this.cardSystem.getCardInHand(cardId);
    if (!card) {
      return { success: false, reason: 'Card not in hand' };
    }

    // Check AP
    const apCost = card.apCost ?? 1;
    if (this.ap < apCost) {
      return { success: false, reason: `Not enough AP (need ${apCost}, have ${this.ap})` };
    }

    // Deduct AP
    this.ap -= apCost;

    // Apply card effects
    const effects = card.effects ?? (card.effect ? [card.effect] : []);
    for (const eff of effects) {
      this._applyEffect(eff, card);
    }

    // Discard the card
    this.cardSystem.playCard(cardId);
    this.cardsPlayedThisTurn.push(card);

    this.log(`Played ${card.name} (${apCost} AP). AP remaining: ${this.ap}.`, 'card');
    this.emit('card_played', { card, ap: this.ap });

    return { success: true };
  }

  /**
   * Apply a single card effect to the battle state.
   * Instant effects (HEAL, CLEANSE) resolve immediately.
   * Duration effects are pushed to activeEffects for the target.
   */
  _applyEffect(eff, sourceCard) {
    const targets = this._resolveTargets(eff.target);

    for (const target of targets) {
      switch (eff.type) {
        case EFFECT_TYPES.HEAL: {
          const healed = this._heal(target, eff.value);
          this.log(`${target.name} healed for ${healed} HP.`, 'heal');
          this.emit('heal', { target, amount: healed });
          break;
        }

        case EFFECT_TYPES.CLEANSE: {
          const removed = this._cleanse(target);
          this.log(`${target.name}: ${removed} debuff(s) cleared.`, 'cleanse');
          this.emit('cleanse', { target, removed });
          break;
        }

        case EFFECT_TYPES.SHIELD: {
          target.shield += eff.value;
          this.log(`${target.name} shielded for ${eff.value}.`, 'buff');
          this.emit('shield', { target, amount: eff.value });
          // Also add as duration effect so UI can show it
          target.activeEffects.push({ ...eff, sourceCard: sourceCard?.id });
          break;
        }

        // Duration effects — stored, resolved during attack phase
        case EFFECT_TYPES.ATK_BUFF:
        case EFFECT_TYPES.ATK_DEBUFF:
        case EFFECT_TYPES.BONUS_DAMAGE:
        case EFFECT_TYPES.MARKED: {
          target.activeEffects.push({ ...eff, sourceCard: sourceCard?.id });
          this.log(`${target.name}: ${eff.type} applied (${eff.turnsLeft} turn(s)).`, 'buff');
          this.emit('effect_applied', { target, effect: eff });
          break;
        }
      }
    }
  }

  /**
   * Called by BattleScene when player clicks "End Turn".
   */
  endTurn() {
    if (this.phase !== PHASE.PLAYER_TURN) return;
    this.log('Player ends turn.', 'system');
    this._setPhase(PHASE.PARTY_ATTACK);
    this._doPartyAttack();
  }

  // ─── PARTY ATTACK PHASE ─────────────────────────────────────────────────────

  _doPartyAttack() {
    const alive = this.party.filter(c => !c.isDead);
    for (const char of alive) {
      if (this.enemy.isDead) break;

      let atk = char.baseAtk;

      // Collect ATK_BUFF multipliers for this character (from all sources)
      const atkBuffs = this._getEffectsOfType(char.activeEffects, EFFECT_TYPES.ATK_BUFF);
      for (const buff of atkBuffs) {
        atk = Math.round(atk * buff.value);
      }

      // Collect global ATK_BUFF from ally_all effects
      // (already applied above since they were added to the char's effects on play)

      // Add BONUS_DAMAGE flat adds
      const bonuses = this._getEffectsOfType(char.activeEffects, EFFECT_TYPES.BONUS_DAMAGE);
      for (const b of bonuses) {
        atk += b.value;
      }

      // Apply enemy ATK_DEBUFF (debuff on enemy increases incoming damage)
      const enemyDebuffs = this._getEffectsOfType(this.enemy.activeEffects, EFFECT_TYPES.ATK_DEBUFF);
      for (const debuff of enemyDebuffs) {
        atk = Math.round(atk * debuff.value);
      }

      // Apply MARKED on enemy if present
      const marked = this._getEffectsOfType(this.enemy.activeEffects, EFFECT_TYPES.MARKED);
      for (const m of marked) {
        atk = Math.round(atk * m.value);
      }

      const dealt = this._dealDamageToEnemy(atk);
      this.log(`${char.name} attacks for ${dealt} damage.`, 'attack');
      this.emit('party_attack', { attacker: char, target: this.enemy, damage: dealt });
    }

    if (this.enemy.isDead) {
      this._checkEnd();
      return;
    }

    this._setPhase(PHASE.ENEMY_TURN);
    this._doEnemyTurn();
  }

  // ─── ENEMY TURN ─────────────────────────────────────────────────────────────

  _doEnemyTurn() {
    const action = getEnemyAction(this.enemy, this.enemy.turnIndex);
    const flavor = getActionFlavor(this.enemy, action.key);

    this.log(flavor || `${this.enemy.name} acts.`, 'enemy');
    this.emit('enemy_action_start', { action, flavor });

    // Resolve target
    const targets = this._resolveTargets(action.target);
    const target = targets[0]; // single target for now

    if (target && !target.isDead) {
      let dmg = Math.round(this.enemy.baseAtk * action.damageMultiplier);

      // Check if target has MARKED
      const markedEffects = this._getEffectsOfType(target.activeEffects, EFFECT_TYPES.MARKED);
      for (const m of markedEffects) {
        dmg = Math.round(dmg * m.value);
      }

      const dealt = this._dealDamageToPartyMember(target, dmg);
      this.log(`${this.enemy.name} uses ${action.name} on ${target.name} for ${dealt} damage.`, 'enemy_attack');
      this.emit('enemy_attack', {
        attacker: this.enemy,
        target,
        damage: dealt,
        action,
        isSpecial: action.isSpecial ?? false,
      });

      // Apply any status effects from the action
      for (const eff of (action.effects ?? [])) {
        this._applyEffect(eff, null);
      }
    }

    this.enemy.turnIndex++;

    this._setPhase(PHASE.TICK_EFFECTS);
    this._tickEffects();
  }

  // ─── TICK EFFECTS ───────────────────────────────────────────────────────────

  _tickEffects() {
    // Decrement turnsLeft on all active effects, remove expired ones
    const tick = (entity) => {
      const before = entity.activeEffects.length;
      entity.activeEffects = entity.activeEffects
        .map(eff => ({ ...eff, turnsLeft: eff.turnsLeft - 1 }))
        .filter(eff => eff.turnsLeft > 0);
      const removed = before - entity.activeEffects.length;
      if (removed > 0) {
        this.emit('effects_ticked', { entity, removed });
      }
    };

    for (const char of this.party) tick(char);
    tick(this.enemy);

    this._checkEnd();
  }

  // ─── CHECK END ──────────────────────────────────────────────────────────────

  _checkEnd() {
    if (this.enemy.isDead) {
      this.log('Enemy defeated! Victory!', 'system');
      this._setPhase(PHASE.VICTORY);
      this.emit('battle_end', { result: 'victory', turnNumber: this.turnNumber });
      return;
    }

    const allDead = this.party.every(c => c.isDead);
    if (allDead) {
      this.log('Party defeated. Mission failed.', 'system');
      this._setPhase(PHASE.DEFEAT);
      this.emit('battle_end', { result: 'defeat', turnNumber: this.turnNumber });
      return;
    }

    // Next turn
    this._setPhase(PHASE.DRAW);
    this._doDraw();
  }

  // ─── Damage / Heal Helpers ───────────────────────────────────────────────────

  _dealDamageToEnemy(amount) {
    const actual = Math.max(0, amount);
    this.enemy.currentHp = Math.max(0, this.enemy.currentHp - actual);
    if (this.enemy.currentHp <= 0) {
      this.enemy.isDead = true;
    }
    this.emit('hp_change', { entity: this.enemy, currentHp: this.enemy.currentHp, delta: -actual });
    return actual;
  }

  _dealDamageToPartyMember(char, amount) {
    let remaining = Math.max(0, amount);

    // Absorb shield first
    if (char.shield > 0) {
      const absorbed = Math.min(char.shield, remaining);
      char.shield -= absorbed;
      remaining -= absorbed;
      this.emit('shield_absorb', { target: char, absorbed });
    }

    const actual = remaining;
    char.currentHp = Math.max(0, char.currentHp - actual);
    if (char.currentHp <= 0) {
      char.isDead = true;
      this.log(`${char.name} has been defeated.`, 'system');
      this.emit('character_defeated', { character: char });
    }

    this.emit('hp_change', { entity: char, currentHp: char.currentHp, delta: -actual });
    return actual;
  }

  _heal(char, amount) {
    const before = char.currentHp;
    char.currentHp = Math.min(char.maxHp, char.currentHp + amount);
    const healed = char.currentHp - before;
    this.emit('hp_change', { entity: char, currentHp: char.currentHp, delta: healed });
    return healed;
  }

  _cleanse(char) {
    const debuffTypes = [EFFECT_TYPES.MARKED, EFFECT_TYPES.ATK_DEBUFF];
    const before = char.activeEffects.length;
    char.activeEffects = char.activeEffects.filter(eff => !debuffTypes.includes(eff.type));
    return before - char.activeEffects.length;
  }

  // ─── Target Resolution ───────────────────────────────────────────────────────

  _resolveTargets(targetType) {
    const alive = this.party.filter(c => !c.isDead);

    switch (targetType) {
      case TARGET.SELF:
        // Not used in v0.1 but safe to fall through to ALLY_LOW
        // fall through
      case TARGET.ALLY_LOW: {
        if (!alive.length) return [];
        const lowest = alive.reduce((prev, cur) =>
          (cur.currentHp / cur.maxHp) < (prev.currentHp / prev.maxHp) ? cur : prev
        );
        return [lowest];
      }

      case TARGET.ALLY_ALL:
        return [...alive];

      case TARGET.ENEMY:
        return this.enemy.isDead ? [] : [this.enemy];

      default:
        return [];
    }
  }

  // ─── Effect Query Helpers ────────────────────────────────────────────────────

  _getEffectsOfType(effects, type) {
    return effects.filter(e => e.type === type && e.turnsLeft > 0);
  }

  // ─── State Getters ───────────────────────────────────────────────────────────

  getPartyMember(id) {
    return this.party.find(c => c.id === id) ?? null;
  }

  getAP() { return this.ap; }
  getTurnNumber() { return this.turnNumber; }
  getPhase() { return this.phase; }

  /**
   * Preview what the enemy will do next turn (for UI intent display).
   */
  getNextEnemyAction() {
    return getEnemyAction(this.enemy, this.enemy.turnIndex);
  }

  // ─── Log ─────────────────────────────────────────────────────────────────────

  log(text, type = 'info') {
    const entry = { turn: this.turnNumber, text, type };
    this.battleLog.push(entry);
    this.emit('log', entry);
  }
}
