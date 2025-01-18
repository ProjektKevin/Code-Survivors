export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "robot");

    // Initialize the sprite in the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.health = 10;
    this.moveSpeed = 200;
    this.malfunctions = {
      movement: false,
      attack: false,
    };

    // Movement controls
    this.controls = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Set physics properties
    this.setCollideWorldBounds(true);
    this.setDrag(1000);
    this.setDamping(true);
    this.setSize(32, 32);
    this.setDrag(1000);
    this.setDamping(true);

    this.setSize(32, 32);    // Set the player's hit box (adjust values as needed)
    this.setDepth(10); // make sure the player is not underneath the 
    this.isInvulnerable = false;
    this.invulnerabilityDuration = 1000; // Adjust player invulnerability time (ms)

    // Initialize last movement direction for animations
    // this.lastDirection = "down";

    // Initialize weapon and start spinning
    this.createWeapon();
    this.startWeaponCycle();
    this.body.setAllowGravity(false);

    // --- add malware ---
    this.malfunctions = {
      movement: false,
      attack: false,
      controls: false,
      speed: false,
    };

    // Store original speed for reset
    this.originalMoveSpeed = this.moveSpeed;
  }

  update() {
    // Handle movement
    this.handleMovement();

    // Update weapon position to follow player
    if (this.weapon) {
      this.weapon.setPosition(this.x, this.y);
    }
  }

  // ========== Robot ==========
  handleMovement() {
    // --- Movement ---
    // Handle movement
    let velocityX = 0;
    let velocityY = 0;

    // Check for diagonal movement
    const movingDiagonally =
      (this.controls.up.isDown || this.controls.down.isDown) &&
      (this.controls.left.isDown || this.controls.right.isDown);

    // Adjust speed for diagonal movement
    const currentSpeed = movingDiagonally
      ? this.moveSpeed / Math.sqrt(2)
      : this.moveSpeed;

    // Handle horizontal movement
    if (this.controls.left.isDown) {
      velocityX = -currentSpeed;
      this.lastDirection = "left";
    } else if (this.controls.right.isDown) {
      velocityX = currentSpeed;
      this.lastDirection = "right";
    }

    // Handle vertical movement
    if (this.controls.up.isDown) {
      velocityY = -currentSpeed;
      if (!this.controls.left.isDown && !this.controls.right.isDown) {
        this.lastDirection = "up";
      }
    } else if (this.controls.down.isDown) {
      velocityY = currentSpeed;
      if (!this.controls.left.isDown && !this.controls.right.isDown) {
        this.lastDirection = "down";
      }
    }

    // Apply random movement glitches if malfunctioning
    if (this.malfunctions.movement) {
      velocityX *= Phaser.Math.FloatBetween(0.5, 1.5);
      velocityY *= Phaser.Math.FloatBetween(0.5, 1.5);
    }

    // Set the velocity
    this.setVelocity(velocityX, velocityY);
  }

  takeDamage(amount) {
    this.health -= amount;

    if (this.health <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    // Stop player movement and input
    // this.body.setVelocity(0);
    this.scene.input.keyboard.enabled = false;

    // Disable weapon and collisions
    if (this.weapon) {
      this.weapon.destroy();
    }
    
    // Play death animation if you have one
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        // Start GameOver scene
        this.scene.scene.start('GameOverScene', {
          score: this.scene.score || 0  // Pass any relevant data
        });
      }
    });
  }
  // ========== Weapon ==========
  createWeapon() {
    // Create the weapon sprite
    this.weapon = this.scene.add.sprite(this.x, this.y, "weapon");
    // If you don't have a weapon sprite, use a rectangle shape instead:
    if (!this.scene.textures.exists("weapon")) {
      const graphics = this.scene.add.graphics();
      graphics.lineStyle(4, 0xff0000);
      graphics.strokeRect(-20, -4, 40, 80);
      graphics.generateTexture("weapon", 40, 8);
      graphics.destroy();
      this.weapon = this.scene.add.sprite(this.x, this.y, "weapon");
    }

    // Set the weapon's pivot point
    this.weapon.setOrigin(0, 0.8);

    // Set initial position
    this.weapon.setPosition(this.x, this.y);
    this.weapon.setScale(2);

    // Add physics to the weapon
    this.scene.physics.add.existing(this.weapon);
    this.weapon.body.setAllowGravity(false);

    // If you want to prevent physics from affecting the weapon entirely:
    this.weapon.body.moves = false;
  }

  startWeaponCycle() {
    // Create the spinning tween
    this.createSpinTween();
  }

  createSpinTween() {
    // Define the spin animation with ease
    const spinTween = this.scene.tweens.add({
      targets: this.weapon,
      rotation: Math.PI * 2, // Full 360-degree rotation
      duration: 500, // Half a second for one spin
      ease: "Cubic.easeInOut", // Smooth easing in and out
      onComplete: () => {
        // Reset rotation
        this.weapon.setRotation(0);
        // Wait for 1.5 seconds before spinning again
        this.scene.time.delayedCall(1500, () => {
          this.createSpinTween();
        });
      },
    });
  }

  applyMalfunction(type) {
    if (this.isInvulnerable) return;
    // Reset any existing malfunctions first
    // this.resetMalfunctions();

    switch (type) {
      case "randomSpeed":
        this.malfunctions.speed = true;
        this.moveSpeed = Phaser.Math.Between(50, 400);
        break;

      case "invertControls":
        this.malfunctions.controls = true;
        const tempUp = this.controls.up;
        this.controls.up = this.controls.down;
        this.controls.down = tempUp;
        const tempLeft = this.controls.left;
        this.controls.left = this.controls.right;
        this.controls.right = tempLeft;
        break;

      case "noAttack":
        this.malfunctions.attack = true;
        break;

      case "randomMovement":
        this.malfunctions.movement = true;
        break;
    }

    // Clear malfunction after random time between 5-10 seconds
    this.scene.time.delayedCall(
      Phaser.Math.Between(5000, 10000),
      this.resetMalfunctions,
      [],
      this
    );
  }

  // ========== Enemy Collision ==========
  handleEnemyCollision(amount) {
    if (this.isInvulnerable) return;

    this.takeDamage(amount);

    // Flash while invulnerable
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0, to: 1 },
      duration: 100,
      yoyo: true,
      repeat: this.invulnerabilityDuration / 400
    })

    // Make player invulnerable
    this.isInvulnerable = true;
    this.alpha = 0.5;

    // Remove invulnerability after duration
    this.scene.time.delayedCall(this.invulnerabilityDuration, () => {
      this.isInvulnerable = false;
      this.alpha = 1;
    });
    
  }
}
