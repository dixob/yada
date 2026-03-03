/**
 * scenes/Boot.js
 *
 * First scene to run. Extremely lightweight — just sets up the scale manager
 * and loads the minimal assets needed to display a loading bar in Preloader.
 *
 * Boot → Preloader → MainMenu
 */

import { SCENES } from '../config.js';

export default class Boot extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  preload() {
    // Load only what's needed to render the loading bar in Preloader.
    // Keep this as small as possible — it runs with no progress indicator.
    // this.load.image('loading-bg', 'assets/ui/loading-bg.png');
  }

  create() {
    this.scene.start(SCENES.PRELOADER);
  }
}
