/**
 * CardSystem.js
 * Manages the merged party deck, hand drawing, and discard.
 *
 * Rules (v0.1):
 * - One merged deck of all party member cards (Ash × 4 + Vera × 4 = 8 cards)
 * - Deck is shuffled at battle start
 * - Draw up to 5 cards per turn
 * - Played cards go to discard pile
 * - When draw pile is empty → shuffle discard into new draw pile, continue drawing
 * - Hand always has exactly 5 cards at start of player turn
 *   (unless fewer remain total — edge case in a short battle)
 */

import { getPartyDeck } from './CharacterData.js';

const HAND_SIZE = 5;

export default class CardSystem {
  /**
   * @param {Array} partyIds - Array of character id strings, e.g. ['ash', 'vera']
   */
  constructor(partyIds) {
    this.drawPile = [];
    this.discardPile = [];
    this.hand = [];        // Cards currently in hand: Array of card objects
    this._initDeck(partyIds);
  }

  // ─── Init ──────────────────────────────────────────────────────────────────

  _initDeck(partyIds) {
    const allCards = getPartyDeck(partyIds);
    this.drawPile = this._shuffle([...allCards]);
    this.discardPile = [];
    this.hand = [];
  }

  // ─── Shuffle ───────────────────────────────────────────────────────────────

  _shuffle(arr) {
    // Fisher-Yates in-place
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ─── Draw ──────────────────────────────────────────────────────────────────

  /**
   * Draw up to HAND_SIZE cards.
   * Cards remaining in hand from previous turn are NOT kept — hand is replaced.
   * (Discard leftover hand cards back first.)
   */
  drawHand() {
    // Discard any leftover hand cards from previous turn
    this._discardHand();

    // Draw up to HAND_SIZE
    const drawn = [];
    for (let i = 0; i < HAND_SIZE; i++) {
      const card = this._drawOne();
      if (!card) break; // somehow we have no cards at all
      drawn.push(card);
    }

    this.hand = drawn;
    return [...this.hand];
  }

  _drawOne() {
    // If draw pile is empty, reshuffle discard
    if (this.drawPile.length === 0) {
      if (this.discardPile.length === 0) return null; // truly empty
      this.drawPile = this._shuffle([...this.discardPile]);
      this.discardPile = [];
    }
    return this.drawPile.pop();
  }

  _discardHand() {
    this.discardPile.push(...this.hand);
    this.hand = [];
  }

  // ─── Play Card ─────────────────────────────────────────────────────────────

  /**
   * Remove a card from hand and move to discard.
   * Called by BattleManager after card effects are applied.
   */
  playCard(cardId) {
    const idx = this.hand.findIndex(c => c.id === cardId);
    if (idx === -1) return null;
    const [card] = this.hand.splice(idx, 1);
    this.discardPile.push(card);
    return card;
  }

  // ─── Queries ───────────────────────────────────────────────────────────────

  /**
   * Get a card object from hand by id (without removing it).
   */
  getCardInHand(cardId) {
    return this.hand.find(c => c.id === cardId) ?? null;
  }

  getHand() {
    return [...this.hand];
  }

  getDrawPileSize() {
    return this.drawPile.length;
  }

  getDiscardPileSize() {
    return this.discardPile.length;
  }

  getTotalCards() {
    return this.drawPile.length + this.discardPile.length + this.hand.length;
  }

  /**
   * Returns a summary snapshot useful for the UI (e.g. CombatLog or card counts).
   */
  getState() {
    return {
      handSize:    this.hand.length,
      drawSize:    this.drawPile.length,
      discardSize: this.discardPile.length,
      hand:        this.getHand(),
    };
  }
}
