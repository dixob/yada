/**
 * EnemyData.js
 * Static data definitions for all enemies in FREQUENCY v0.1.
 * Each enemy has a fixed action pattern that cycles.
 */

import { EFFECT_TYPES, TARGET } from './CharacterData.js';

// ─── Enemy Action Types ───────────────────────────────────────────────────────
export const ENEMY_ACTION = {
  ATTACK:  'attack',   // Standard ATK damage to random ally
  SPECIAL: 'special',  // Named ability with custom effects
};

// ─── MERIDIAN AGENT ───────────────────────────────────────────────────────────
// The enemy for Chapter 01 — Meridian Contact.
// A corporate enforcement operative. Methodical. Reads threats, then eliminates them.
//
// Pattern: Attack → Attack → Special → Attack → Attack → Special → ...
// Special: "Asset Extraction" — heavy hit to lowest-HP ally + applies MARKED

export const ENEMIES = {
  meridian_agent: {
    id: 'meridian_agent',
    name: 'Meridian Agent',
    subtitle: 'Corporate Enforcement',
    maxHp: 400,
    baseAtk: 60,
    color: '#CC3333',
    glowColor: 0xCC3333,
    spriteKey: 'meridian-agent-sprite',  // placeholder — will use fallback if missing
    // Battle position (right side of 1280px canvas)
    battlePosition: { x: 960, y: 350 },

    // Turn pattern — cycles via index % pattern.length
    actionPattern: [
      ENEMY_ACTION.ATTACK,
      ENEMY_ACTION.ATTACK,
      ENEMY_ACTION.SPECIAL,
    ],

    // Standard attack definition
    actions: {
      [ENEMY_ACTION.ATTACK]: {
        name: 'Strike',
        description: 'A calculated strike against the weakest target.',
        // Deals baseAtk to a random ally (BattleManager handles targeting)
        target: TARGET.ALLY_LOW,
        damageMultiplier: 1.0,
        effects: [],
        animationKey: 'attack',
      },

      [ENEMY_ACTION.SPECIAL]: {
        name: 'Asset Extraction',
        description: 'The agent eliminates the most vulnerable target with extreme prejudice.',
        flavorText: '"Threat neutralized."',
        target: TARGET.ALLY_LOW,
        damageMultiplier: 1.5,   // 150% ATK
        effects: [
          {
            type: EFFECT_TYPES.MARKED,
            value: 1.2,           // target takes +20% damage while marked
            target: TARGET.ALLY_LOW,
            turnsLeft: 1,
          },
        ],
        animationKey: 'special',
        isSpecial: true,
      },
    },

    // Flavor text shown in CombatLog when enemy acts
    actionFlavor: {
      [ENEMY_ACTION.ATTACK]: [
        'The agent advances without hesitation.',
        'A precise, calculated strike.',
        'Movement economical, lethal.',
      ],
      [ENEMY_ACTION.SPECIAL]: [
        '"Asset Extraction in progress."',
        'The agent targets the weakest link.',
        '"Eliminating the liability."',
      ],
    },

    // Pre-battle intro text (shown in StageSelect / BattleScene entry)
    introText: 'A Meridian enforcement operative. Trained to identify and neutralize threats. Expect pattern, expect precision.',
  },
};

// ─── STAGE DEFINITIONS ───────────────────────────────────────────────────────
// Maps stage IDs to enemy encounters for v0.1.

export const STAGES = {
  ch01_meridian_contact: {
    id: 'ch01_meridian_contact',
    chapter: 1,
    name: 'MERIDIAN CONTACT',
    enemyId: 'meridian_agent',
    backgroundKey: 'bg-city-night',
    // Flavor text shown in StageSelect
    briefing: [
      'LOCATION: Meridian Tower, sublevel 3.',
      'OBJECTIVE: Breach corporate security and extract Vera\'s source.',
      'THREAT: One enforcement unit. Unknown capability tier.',
      'Do not engage unless necessary.',
      '...You already know that\'s not how this goes.',
    ],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Get enemy data by id.
 */
export function getEnemy(id) {
  return ENEMIES[id] ?? null;
}

/**
 * Get stage data by id.
 */
export function getStage(id) {
  return STAGES[id] ?? null;
}

/**
 * Get the enemy action for a given turn index.
 * Cycles through the pattern.
 */
export function getEnemyAction(enemy, turnIndex) {
  const pattern = enemy.actionPattern;
  const actionKey = pattern[turnIndex % pattern.length];
  return {
    key: actionKey,
    ...enemy.actions[actionKey],
  };
}

/**
 * Get random flavor text for an enemy action.
 */
export function getActionFlavor(enemy, actionKey) {
  const flavors = enemy.actionFlavor[actionKey] ?? [];
  if (!flavors.length) return '';
  return flavors[Math.floor(Math.random() * flavors.length)];
}
