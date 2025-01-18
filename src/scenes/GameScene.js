import Phaser from "phaser";
import Player from "../sprites/Player.js";
import Enemy from "../sprites/Enemy.js";
import Toolkit from "../sprites/ToolKit.js";
import groundImage from "../../assets/spritesheets/grassLand.png";
import robotImage from "../../assets/sprites/Robot.png";
import weaponImage from "../../assets/sprites/Weapon.png";
import enemyImage from "../../assets/sprites/Enemy.png";
import toolkitImage from "../../assets/sprites/ToolKit.png";
import arrorwIndicatorImage from "../../assets/sprites/ArrowIndicator.png";

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

    // Toolkit spawn properties
    this.toolkits = null;
    this.lastToolkitSpawn = 0;
    this.toolkitSpawnInterval = 5000; // 5 seconds
    this.baseSpawnChance = 0.2; // 20% base chance
    this.currentSpawnChance = 0.2; // Current chance that will increase
    this.spawnChanceIncrease = 0.1; // 10% increase each failed attempt
    this.maxSpawnChance = 0.8; // Maximum 80% chance

    // Toolkit navigation arrow
    this.arrowOffset = 50; // Distance of arrow from toolkit
    this.arrow = null;
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
    this.load.image("toolkit", toolkitImage);
    this.load.image("arrowIndicator", arrorwIndicatorImage);

    // Reset score
    this.score = 0;
    if (this.scoreText) {
      this.scoreText.destroy();
    }
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#fff",
      stroke: "#000",
      fontFamily: "jetbrains mono",
      // strokeThickness: 4
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(11);

    // Make sure input is enabled
    this.input.keyboard.enabled = true;
  }

  create() {
    // Create infinite Background to move on
    this.createInfiniteBackground();

    // Create the grey overlay
    this.createGreyOverlay();

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

    // Initialize toolkit group
    this.toolkits = this.physics.add.group();

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
      (weapon, enemy) => {
        this.handleWeaponEnemyCollision(weapon, enemy);
      },
      null,
      this
    );

    // Add toolkit collision
    this.physics.add.overlap(
      this.player,
      this.toolkits,
      this.handleToolkitCollision,
      null,
      this
    );

    // Create a timer for toolkit spawn checks
    this.time.addEvent({
      delay: this.toolkitSpawnInterval,
      callback: this.trySpawnToolkit,
      callbackScope: this,
      loop: true,
    });

    // Create the arrow sprite
    this.arrow = this.add.sprite(0, 0, "arrowIndicator");
    this.arrow.setDepth(100);
    this.arrow.setScale(0.5);
    this.arrow.setVisible(false);
  }

  update() {
    // Game loop
    if (!this.player) return;

    // Update background based on player position
    this.updateInfiniteBackground();

    // Update player
    this.player.update();

    // Update enemies
    this.enemies.getChildren().forEach((enemy) => {
      enemy.update();
    });

    // Update Arrow Indicator
    this.updateArrowIndicator();
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
  // --- Toolkit ---
  trySpawnToolkit() {
    // Only proceed if player is damaged
    if (this.player.health >= 40) {
      console.log("❌ Spawn canceled: Player at full health");
      return;
    }

    // Format spawn chance as percentage for clearer logging
    const currentChancePercent = (this.currentSpawnChance * 100).toFixed(1);
    console.log(`🎲 Spawn attempt: ${currentChancePercent}% chance`);

    // Roll for spawn
    const roll = Math.random();
    console.log(`🎲 Rolled: ${(roll * 100).toFixed(1)}%`);

    if (roll < this.currentSpawnChance) {
      // Get camera bounds
      const cam = this.cameras.main;
      const camBounds = {
        left: cam.scrollX,
        right: cam.scrollX + cam.width,
        top: cam.scrollY,
        bottom: cam.scrollY + cam.height,
      };

      // Calculate spawn position just outside camera view
      let x, y;
      const padding = 100; // Distance from screen edge

      if (Math.random() < 0.5) {
        // Spawn left or right of screen
        x =
          Math.random() < 0.5
            ? camBounds.left - padding
            : camBounds.right + padding;
        y = Phaser.Math.Between(
          camBounds.top + padding,
          camBounds.bottom - padding
        );
      } else {
        // Spawn top or bottom of screen
        x = Phaser.Math.Between(
          camBounds.left + padding,
          camBounds.right - padding
        );
        y =
          Math.random() < 0.5
            ? camBounds.top - padding
            : camBounds.bottom + padding;
      }

      // Create the toolkit
      const toolkit = new Toolkit(this, x, y);
      this.toolkits.add(toolkit);

      // Log successful spawn
      console.log(
        `✅ Toolkit spawned successfully at (${x.toFixed(0)}, ${y.toFixed(0)})`
      );
      console.log(
        `📊 Current toolkit count: ${this.toolkits.getChildren().length}`
      );

      // Reset spawn chance
      this.currentSpawnChance = this.baseSpawnChance;
      console.log(
        `🔄 Chance reset to ${(this.baseSpawnChance * 100).toFixed(1)}%`
      );
    } else {
      // Failed spawn logic...
      const oldChance = this.currentSpawnChance;
      this.currentSpawnChance = Math.min(
        this.currentSpawnChance + this.spawnChanceIncrease,
        this.maxSpawnChance
      );
      console.log(`❌ Spawn failed`);
      console.log(
        `📈 Chance increased: ${(oldChance * 100).toFixed(1)}% -> ${(
          this.currentSpawnChance * 100
        ).toFixed(1)}%`
      );
    }
  }

  // --- Toolkit Arrow ---
  // Add method to create and manage arrow indicator
  createArrowIndicator() {
    // Create arrow sprite if it doesn't exist
    if (!this.toolkitArrow) {
      this.toolkitArrow = this.add.sprite(0, 0, "arrow");
      this.toolkitArrow.setDepth(100);
      this.toolkitArrow.setScale(0.5);
    }
  }

  // Add method to update arrow position
  updateArrowIndicator() {
    // If no arrow or no toolkits, hide arrow and return
    if (!this.arrow || this.toolkits.getChildren().length === 0) {
      if (this.arrow) this.arrow.setVisible(false);
      return;
    }

    const toolkit = this.toolkits.getChildren()[0];

    // Get camera bounds
    const cam = this.cameras.main;
    const padding = 50;

    // Check if toolkit is on screen
    const isOnScreen =
      toolkit.x >= cam.scrollX - padding &&
      toolkit.x <= cam.scrollX + cam.width + padding &&
      toolkit.y >= cam.scrollY - padding &&
      toolkit.y <= cam.scrollY + cam.height + padding;

    if (isOnScreen) {
      // Put arrow above toolkit
      this.arrow.setPosition(toolkit.x, toolkit.y - this.arrowOffset);
      this.arrow.setRotation(Math.PI);
      this.arrow.setVisible(true);
      console.log("📍 Arrow on toolkit");
    } else {
      // Calculate toolkit direction relative to screen center
      const screenCenterX = cam.scrollX + cam.width / 2;
      const screenCenterY = cam.scrollY + cam.height / 2;

      const angle = Phaser.Math.Angle.Between(
        screenCenterX,
        screenCenterY,
        toolkit.x,
        toolkit.y
      );

      // Position arrow at screen edge
      const radius = Math.min(cam.width, cam.height) * 0.4;
      const arrowX = screenCenterX + Math.cos(angle) * radius;
      const arrowY = screenCenterY + Math.sin(angle) * radius;

      this.arrow.setPosition(arrowX, arrowY);
      this.arrow.setRotation(angle + Math.PI/2);
      this.arrow.setVisible(true);

      console.log("🎯 Arrow pointing to off-screen toolkit", {
        arrowPos: { x: arrowX.toFixed(0), y: arrowY.toFixed(0) },
        angle: ((angle * 180) / Math.PI).toFixed(1) + "°",
      });
    }
  }

  // Update collision handler with debug logs
  handleToolkitCollision(player, toolkit) {
    console.log("🔧 Toolkit collected!");

    // Hide arrow
    if (this.arrow) {
      this.arrow.setVisible(false);
    }

    // Rest of your collision handling code...
    toolkit.destroy();

    // Reset spawn chance
    this.currentSpawnChance = this.baseSpawnChance;

    // Add a small delay before pausing and showing UI
    this.time.delayedCall(200, () => {
      this.scene.pause();
      this.scene.launch("RepairUI");
    });
  }

  // --- Enemy ---
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

  // --- Weapon ---
  handleWeaponEnemyCollision(weapon, enemy) {
    // Debug log to check weapon state
    console.log("Weapon active state:", this.player.weaponActive);

    // Only process collision if weapon is active and no attack malfunction
    if (this.player.weaponActive && !this.player.malfunctions.attack) {
      enemy.takeDamage(5);

      if (enemy.health <= 0) {
        this.score += 10;
        this.scoreText.setText("Score: " + this.score);
      }
    }
  }

  // --- Background ---
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
