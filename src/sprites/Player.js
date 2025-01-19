export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "robot");

    // Initialize the sprite in the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.health = 40;
    this.moveSpeed = 200;

    // Movement controls
    this.controls = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Set physics properties
    this.setCollideWorldBounds(true);
    this.setSize(32, 32);
    this.setDrag(1000);
    this.setDamping(true);

    this.setSize(32, 32); // Set the player's hit box (adjust values as needed)
    this.setDepth(10); // make sure the player is not underneath the
    this.isInvulnerable = false;
    this.invulnerabilityDuration = 1000; // Adjust player invulnerability time (ms)

    // Initialize last movement direction for animations
    // this.lastDirection = "down";

    // Initialize weapon and start spinning
    this.createWeapon();
    this.startWeaponCycle();
    this.weaponActive = false; // default false
    this.body.setAllowGravity(false);

    // --- add malware ---
    this.malfunctions = {
      randomMovement: false,
      randomSpeed: false,
      invertControls: false,
      noAttack: false,
    };

    // Store original settings for each malfunction type
    this.originalSettings = {
      moveSpeed: 200,  // Store the default move speed
      weaponDamage: 5, // Store the default weapon damage
      controls: {
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      }
    };

    // Initialize properties with default values
    this.moveSpeed = this.originalSettings.moveSpeed;
    this.weaponDamage = this.originalSettings.weaponDamage;
  }

  update() {
    // Handle movement
    this.handleMovement();

    // Update weapon position to follow player
    this.updateWeapon();
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
      this.setFlipX(true);
    } else if (this.controls.right.isDown) {
      velocityX = currentSpeed;
      this.lastDirection = "right";
      this.setFlipX(false);
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
    if (this.malfunctions.randomMovement) {
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

  resetMalfunction(type) {
    if (!this.malfunctions[type]) return; // If it's not malfunctioning, do nothing

    switch (type) {
      case "randomSpeed":
        this.moveSpeed = this.originalSettings.moveSpeed;
        break;

      case "invertControls":
        // Reset controls to original configuration
        this.controls = {
          up: this.scene.input.keyboard.addKey(
            this.originalSettings.controls.up
          ),
          down: this.scene.input.keyboard.addKey(
            this.originalSettings.controls.down
          ),
          left: this.scene.input.keyboard.addKey(
            this.originalSettings.controls.left
          ),
          right: this.scene.input.keyboard.addKey(
            this.originalSettings.controls.right
          ),
        };
        break;

      case "noAttack":
        this.weaponDamage = this.originalSettings.weaponDamage;
        break;

      case "randomMovement":
        this.moveSpeed = this.originalSettings.moveSpeed;
        break;
    }

    // Update the malfunction status
    this.malfunctions[type] = false;

    // Log the reset for debugging
    console.log(`Reset malfunction: ${type}`, {
      moveSpeed: this.moveSpeed,
      weaponDamage: this.weaponDamage,
      malfunctions: {...this.malfunctions}
    });
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
      ease: "Power2",
      onComplete: () => {
        // Start GameOver scene
        this.scene.scene.start("GameOverScene", {
          score: this.scene.score || 0, // Pass any relevant data
        });
      },
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

  // In Player.js
  // Replace the createSpinTween method with this fixed version

  createSpinTween() {
    this.weapon.setVisible(true);
    this.weaponActive = true;

    // Reset rotation
    this.weapon.setRotation(0);

    // Set scale for weapon flipping
    this.weapon.setScale(2 * (this.flipX ? -1 : 1), 2);

    // Determine spin direction based on player facing
    const rotationAmount = this.flipX ? -Math.PI * 2 : Math.PI * 2; // Counter-clockwise if facing left

    const spinTween = this.scene.tweens.add({
      targets: this.weapon,
      rotation: rotationAmount,
      duration: 500,
      ease: "Cubic.easeInOut",
      onComplete: () => {
        this.weapon.setVisible(false);
        this.weaponActive = false;
        this.weapon.setRotation(0);

        this.scene.time.delayedCall(800, () => {
          this.createSpinTween();
        });
      },
    });
  }

  // Add this method to ensure weapon follows player correctly
  updateWeapon() {
    // Check if weapon exists and has a valid body
    if (!this.weapon || !this.weapon.body) {
      return;
    }

    const offsetX = this.flipX ? -20 : 20;
    
    // Update sprite position
    this.weapon.setPosition(this.x + offsetX, this.y);
    this.weapon.setScale(2 * (this.flipX ? -1 : 1), 2);
    
    // Safely update physics body
    if (this.weapon.body) {
      // Update physics body position
      this.weapon.body.x = this.x + offsetX - (this.weapon.body.width || 0) / 2;
      this.weapon.body.y = this.y - (this.weapon.body.height || 0) / 2;
      
      // Update physics body angle to match sprite rotation
      this.weapon.body.angle = Phaser.Math.RadToDeg(this.weapon.rotation);
      
      // Optional: Adjust hitbox based on rotation
      const absRotation = Math.abs(this.weapon.rotation % Math.PI);
      if (absRotation > Math.PI / 4 && absRotation < (3 * Math.PI) / 4) {
        this.weapon.body.setSize(6, 30);  // More vertical
      } else {
        this.weapon.body.setSize(30, 6);  // More horizontal
      }
    }
  }


  applyMalfunction(type) {
    if (this.isInvulnerable) return;

    switch (type) {
      case "randomSpeed":
        this.malfunctions.randomSpeed = true;
        this.moveSpeed = Phaser.Math.Between(50, 400);
        break;

      case "invertControls":
        this.malfunctions.invertControls = true;
        const tempUp = this.controls.up;
        this.controls.up = this.controls.down;
        this.controls.down = tempUp;
        const tempLeft = this.controls.left;
        this.controls.left = this.controls.right;
        this.controls.right = tempLeft;
        break;

      case "noAttack":
        this.malfunctions.noAttack = true;
        this.weaponDamage = 0; // Set damage to 0 when attack is disabled
        break;

      case "randomMovement":
        this.malfunctions.randomMovement = true;
        break;
    }
    

    // Log the applied malfunction for debugging
    console.log(`Applied malfunction: ${type}`, {
      moveSpeed: this.moveSpeed,
      weaponDamage: this.weaponDamage,
      malfunctions: {...this.malfunctions}
    });
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
      repeat: this.invulnerabilityDuration / 400,
    });

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
