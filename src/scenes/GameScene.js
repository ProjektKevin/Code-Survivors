import Phaser from "phaser";
import Player from "../sprites/Player.js";
import groundImage from '../../assets/spritesheets/grassLand.png';
import robotImage from '../../assets/sprites/test.png';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.player = null;
    this.backgroundContainer = null;
    this.lastRepeatX = 0;
    this.lastRepeatY = 0;
    this.greyOverlay = null;
    this.worldBounds = { x: -2000, y: -2000, width: 4000, height: 4000 };
  }

  preload() {
    // Add error handling for asset loading
    this.load.on("loaderror", (file) => {
      console.error("Error loading asset:", file.src);
    });

    // Load assets relative to the public directory
    this.load.image("ground", groundImage);
    this.load.image("robot", robotImage);
  }

  create() {
    // Create infinite Background to move on
    this.createInfiniteBackground();

    // Create player using the Player class
    this.player = new Player(
      this,
      this.cameras.main.centerX,
      this.cameras.main.centerY
    );

    // Set up camera to follow player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setFollowOffset(-this.player.width, -this.player.height);

    // Set up world bounds (optional - adjust values as needed)
    this.physics.world.setBounds(
      this.worldBounds.x,
      this.worldBounds.y,
      this.worldBounds.width,
      this.worldBounds.height
    );

    // Create the grey overlay
    this.createGreyOverlay();
  }

  update() {
    // Game loop
    if (!this.player) return;

    // Update player
    this.player.update();

    // Update background based on player position
    this.updateInfiniteBackground();
  }


  // ========== Functions ==========
  createInfiniteBackground() {
    const tileSize = 64;
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Create a container for the background
    this.backgroundContainer = this.add.container(0, 0);

    // Calculate number of tiles needed
    const tilesX = Math.ceil(screenWidth / tileSize) + 2;
    const tilesY = Math.ceil(screenHeight / tileSize) + 2;

    // Create initial background tiles
    for (let x = -1; x <= tilesX; x++) {
      for (let y = -1; y <= tilesY; y++) {
        const tile = this.add
          .image(x * tileSize, y * tileSize, "ground")
          .setOrigin(0);
        this.backgroundContainer.add(tile);
      }
    }
  }

  updateInfiniteBackground() {
    const tileSize = 64;
    const camX = this.cameras.main.scrollX;
    const camY = this.cameras.main.scrollY;

    // Update container position to follow camera
    this.backgroundContainer.setPosition(
      Math.floor(camX / tileSize) * tileSize,
      Math.floor(camY / tileSize) * tileSize
    );
  }

  createGreyOverlay() {
    const { x, y, width, height } = this.worldBounds;
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Create a graphics object for the overlay
    this.greyOverlay = this.add.graphics();
    this.greyOverlay.fillStyle(0x000000, 0.5); // Grey color with 50% opacity

    // Draw overlay rectangles around the world bounds
    this.greyOverlay.fillRect(x - screenWidth, y - screenHeight, width + 2 * screenWidth, screenHeight); // Top
    this.greyOverlay.fillRect(x - screenWidth, y, screenWidth, height); // Left
    this.greyOverlay.fillRect(x + width, y, screenWidth, height); // Right
    this.greyOverlay.fillRect(x - screenWidth, y + height, width + 2 * screenWidth, screenHeight); // Bottom

    this.greyOverlay.setScrollFactor(0); // Ensure the overlay moves with the camera
    this.greyOverlay.setDepth(10); // Ensure the overlay is on top of the background
  }
}
