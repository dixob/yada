/**
 * CharacterData.js
 * Static data definitions for all playable characters in FREQUENCY v0.1.
 * Cards are tactical augments — they modify auto-attack damage and apply
 * buffs/debuffs. The party auto-attacks every turn; cards amplify that.
 */

// ─── Card Effect Types ────────────────────────────────────────────────────────
export const EFFECT_TYPES = {
  ATK_BUFF:      'atk_buff',      // Multiply attacker's ATK by value
  ATK_DEBUFF:    'atk_debuff',    // Multiply target's incoming damage by value
  SHIELD:        'shield',        // Absorb flat damage
  BONUS_DAMAGE:  'bonus_damage',  // Add flat damage to next auto-attack
  HEAL:          'heal',          // Restore HP to target
  MARKED:        'marked',        // +20% incoming damage (enemy special applies this)
  CLEANSE:       'cleanse',       // Remove all debuffs from target
};

// ─── Card Target Types ────────────────────────────────────────────────────────
export const TARGET = {
  SELF:      'self',        // Card's owner character
  ALLY_LOW:  'ally_low',   // Ally with lowest current HP %
  ALLY_ALL:  'ally_all',   // All party members
  ENEMY:     'enemy',      // The active enemy
};

// ─── ASH CARDS ───────────────────────────────────────────────────────────────
// Ash Nakamura — signal analyst. Aggressive tempo + control.
// Color: #7B5CF0 (violet)

const ASH_CARDS = [
  {
    id: 'ash_overwatch',
    characterId: 'ash',
    name: 'OVERWATCH',
    apCost: 1,
    description: 'Ash reads the field. +40% ATK to all auto-attacks this turn.',
    flavorText: '"I already know what you\'re going to do."',
    effect: {
      type: EFFECT_TYPES.ATK_BUFF,
      value: 1.4,          // multiply ATK by 1.4
      target: TARGET.ALLY_ALL,
      turnsLeft: 1,
    },
    color: '#7B5CF0',
  },
  {
    id: 'ash_cold_read',
    characterId: 'ash',
    name: 'COLD READ',
    apCost: 2,
    description: 'Ash disrupts the target\'s defenses. Enemy takes +50% damage for 1 turn.',
    flavorText: '"Your tells are obvious."',
    effect: {
      type: EFFECT_TYPES.ATK_DEBUFF,
      value: 1.5,          // enemy takes 150% incoming damage
      target: TARGET.ENEMY,
      turnsLeft: 1,
    },
    color: '#7B5CF0',
  },
  {
    id: 'ash_extract',
    characterId: 'ash',
    name: 'EXTRACT',
    apCost: 1,
    description: 'Ash pulls intel, removing one status effect from the most vulnerable ally.',
    flavorText: '"Get it together."',
    effect: {
      type: EFFECT_TYPES.CLEANSE,
      value: 1,
      target: TARGET.ALLY_LOW,
      turnsLeft: 0,        // instant, no duration
    },
    color: '#7B5CF0',
  },
  {
    id: 'ash_endgame',
    characterId: 'ash',
    name: 'ENDGAME',
    apCost: 3,
    description: 'Ash commits fully. +100% ATK and +80 flat bonus damage this turn.',
    flavorText: '"This ends now."',
    effects: [
      {
        type: EFFECT_TYPES.ATK_BUFF,
        value: 2.0,        // double ATK
        target: TARGET.ALLY_ALL,
        turnsLeft: 1,
      },
      {
        type: EFFECT_TYPES.BONUS_DAMAGE,
        value: 80,         // +80 flat
        target: TARGET.ALLY_ALL,
        turnsLeft: 1,
      },
    ],
    color: '#7B5CF0',
    isPowerCard: true,
  },
];

// ─── VERA CARDS ───────────────────────────────────────────────────────────────
// Vera Okonkwo — surveillance specialist. Defensive + sustained pressure.
// Color: #D4820A (amber)

const VERA_CARDS = [
  {
    id: 'vera_surveillance',
    characterId: 'vera',
    name: 'SURVEILLANCE',
    apCost: 1,
    description: 'Vera observes enemy patterns. +25% ATK to all attacks this turn.',
    flavorText: '"I\'ve been watching you for three weeks."',
    effect: {
      type: EFFECT_TYPES.ATK_BUFF,
      value: 1.25,
      target: TARGET.ALLY_ALL,
      turnsLeft: 1,
    },
    color: '#D4820A',
  },
  {
    id: 'vera_pressure',
    characterId: 'vera',
    name: 'PRESSURE',
    apCost: 2,
    description: 'Vera applies sustained force. Shields the most vulnerable ally for 60 HP.',
    flavorText: '"Hold the line."',
    effect: {
      type: EFFECT_TYPES.SHIELD,
      value: 60,
      target: TARGET.ALLY_LOW,
      turnsLeft: 2,
    },
    color: '#D4820A',
  },
  {
    id: 'vera_extract',
    characterId: 'vera',
    name: 'EXTRACT',
    apCost: 1,
    description: 'Vera pulls a compromised ally clear. Heals the lowest-HP ally for 45 HP.',
    flavorText: '"You\'re no good to anyone dead."',
    effect: {
      type: EFFECT_TYPES.HEAL,
      value: 45,
      target: TARGET.ALLY_LOW,
      turnsLeft: 0,
    },
    color: '#D4820A',
  },
  {
    id: 'vera_cold_case',
    characterId: 'vera',
    name: 'COLD CASE',
    apCost: 3,
    description: 'Vera reopens every angle. Heals both allies for 50 HP and shields them for 40 HP.',
    flavorText: '"Nothing stays buried."',
    effects: [
      {
        type: EFFECT_TYPES.HEAL,
        value: 50,
        target: TARGET.ALLY_ALL,
        turnsLeft: 0,
      },
      {
        type: EFFECT_TYPES.SHIELD,
        value: 40,
        target: TARGET.ALLY_ALL,
        turnsLeft: 2,
      },
    ],
    color: '#D4820A',
    isPowerCard: true,
  },
];

// ─── CHARACTER DEFINITIONS ────────────────────────────────────────────────────

export const CHARACTERS = {
  ash: {
    id: 'ash',
    name: 'Ash',
    fullName: 'Ash Nakamura',
    role: 'Signal Analyst',
    maxHp: 280,
    baseAtk: 40,
    color: '#7B5CF0',
    glowColor: 0x7B5CF0,
    // Asset keys — loaded by Preloader.js
    spriteKey: 'ash-sprite',
    portraitKey: 'ash-portrait',
    cards: ASH_CARDS,
    // UI positioning in battle (relative to canvas)
    battlePosition: { x: 130, y: 220 },
  },
  vera: {
    id: 'vera',
    name: 'Vera',
    fullName: 'Vera Okonkwo',
    role: 'Surveillance Specialist',
    maxHp: 240,
    baseAtk: 35,
    color: '#D4820A',
    glowColor: 0xD4820A,
    spriteKey: 'vera-sprite',
    portraitKey: 'vera-portrait',
    cards: VERA_CARDS,
    battlePosition: { x: 130, y: 480 },
  },
};

// ─── STARTING PARTY ───────────────────────────────────────────────────────────
// For v0.1, the party is always Ash + Vera (locked roster).
export const STARTING_PARTY = ['ash', 'vera'];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Get all cards for a given party.
 * Returns a flat array of card objects (merged deck).
 */
export function getPartyDeck(partyIds) {
  const deck = [];
  for (const id of partyIds) {
    const char = CHARACTERS[id];
    if (char) {
      deck.push(...char.cards);
    }
  }
  return deck;
}

/**
 * Get character data by id.
 */
export function getCharacter(id) {
  return CHARACTERS[id] ?? null;
}
