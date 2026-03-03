/**
 * scenes/Game.js
 *
 * Core gameplay scene — placeholder until the flagship IP and
 * combat system are designed in the art direction session.
 *
 * This scene will eventually contain:
 *   - Map/dungeon rendering
 *   - Turn-based or action combat
 *   - Chapter/stage progression
 *   - Character party management
 *
 * For now it renders a "Coming Soon" state and provides the
 * navigation skeleton (HUD overlay, back to menu).
 */

import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class Game extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME);
  }

  create() {
    // v0.1: Game scene is a pass-through to the stage select.
    // The MainMenu "Play" button navigates here → we immediately redirect.
    this.scene.start(SCENES.STAGE_SELECT);
  }
}
