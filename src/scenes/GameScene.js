import Phaser from "phaser";
import Player from "../sprites/Player.js";
import Enemy from "../sprites/Enemy.js";
import groundImage from "../../assets/spritesheets/grassLand.png";
import robotImage from "../../assets/sprites/Robot.png";
import weaponImage from "../../assets/sprites/Weapon.png";
import enemyImage from "../../assets/sprites/Enemy.png";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
    this.player = null;
    this.enemies = null;
    this.spawnTimer = null;
    this.backgroundContainer = null;
    this.lastRepeatX = 0;
    this.lastRepeatY = 0;
    this.greyOverlay = null;
    this.score = 0;
    this.scoreText = null;
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
    this.load.image("weapon", weaponImage);
    this.load.image("enemy", enemyImage);

    // Reset score
    this.score = 0;
    if (this.scoreText) {
      this.scoreText.destroy();
    }
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 4
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(11);

    // Make sure input is enabled
    this.input.keyboard.enabled = true;
  }

  create() {
    // Create infinite Background to move on
    this.createInfiniteBackground();

    // ----- Create Player -----
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

    // ----- Create Enemy -----
    this.enemies = this.physics.add.group();

    // Spawn enemies periodically
    this.spawnTimer = this.time.addEvent({
      delay: 2000, // Spawn every 2 seconds
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    // ------ Add Collisions ------
    // Add collision between player and enemies
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyCollision,
      null,
      this
    );

    // Add collision between weapon and enemies
    this.physics.add.overlap(
      this.player.weapon,
      this.enemies,
      this.handleWeaponEnemyCollision,
      null,
      this
    );

    // Create the grey overlay
    this.createGreyOverlay();
  }

  update() {
    // Game loop
    if (!this.player) return;

    // Update player
    this.player.update();
    // Update enemies
    this.enemies.getChildren().forEach(enemy => {
      enemy.update();
    });

    // Update background based on player position
    this.updateInfiniteBackground();
  }

  shutdown() {
    // Clean up any existing timers
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    
    // Clean up existing enemies
    if (this.enemies) {
      this.enemies.clear(true, true);
    }
  }

  // ========== Functions ==========
  spawnEnemy() {
    // Spawn enemy at random position outside the screen
    const padding = 50;
    let x, y;

    if (Math.random() < 0.5) {
      // Spawn on left or right
      x = Math.random() < 0.5 ? -padding : this.cameras.main.width + padding;
      y = Phaser.Math.Between(0, this.cameras.main.height);
    } else {
      // Spawn on top or bottom
      x = Phaser.Math.Between(0, this.cameras.main.width);
      y = Math.random() < 0.5 ? -padding : this.cameras.main.height + padding;
    }

    const enemy = new Enemy(this, x, y);
    this.enemies.add(enemy);
    enemy.setTarget(this.player);
  }

  handlePlayerEnemyCollision(player, enemy) {
    // Destroy the enemy
    enemy.destroy();

    // Apply random malware effect
    const effects = [
      "randomSpeed",
      "invertControls",
      // "noAttack",
      "randomMovement",
    ];

    const randomEffect = Phaser.Math.RND.pick(effects);
    player.applyMalfunction(randomEffect);
    player.handleEnemyCollision(10);
  }

  handleWeaponEnemyCollision(weapon, enemy) {
    if (!this.player.malfunctions.attack) {
      enemy.takeDamage(5);
      if (enemy.health <= 0) {
        this.score += 10;  // Add points for killing enemy
        this.scoreText.setText('Score: ' + this.score);
      }
    }
  }

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
    this.greyOverlay.fillRect(
      x - screenWidth,
      y - screenHeight,
      width + 2 * screenWidth,
      screenHeight
    ); // Top
    this.greyOverlay.fillRect(x - screenWidth, y, screenWidth, height); // Left
    this.greyOverlay.fillRect(x + width, y, screenWidth, height); // Right
    this.greyOverlay.fillRect(
      x - screenWidth,
      y + height,
      width + 2 * screenWidth,
      screenHeight
    ); // Bottom

    this.greyOverlay.setScrollFactor(0); // Ensure the overlay moves with the camera
    this.greyOverlay.setDepth(10); // Ensure the overlay is on top of the background
  }
}
