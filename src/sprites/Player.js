export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "robot");

    // Initialize the sprite in the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
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

    // // Set Attack Properties
    // this.attackStartTime = 0;
    // this.spinSpeed = 360; // Degrees per second (1 full rotation)

    // Optional: Add drag to make movement more smooth
    this.setDrag(1000);
    this.setDamping(true);

    // Set the player's hit box (adjust values as needed)
    this.setSize(32, 32);
    this.setDepth(10);

    // Initialize last movement direction for animations
    // this.lastDirection = "down";

    // Initialize weapon and start spinning
    this.createWeapon();
    this.startWeaponCycle();
  }

  update() {
    // Handle movement
    this.handleMovement();

    // Update weapon position to follow player
    if (this.weapon) {
      this.weapon.setPosition(this.x, this.y);
    }
  }

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
    switch (type) {
      case "invertControls":
        // Invert movement controls
        const temp = this.controls.left;
        this.controls.left = this.controls.right;
        this.controls.right = temp;
        break;
      case "randomSpeed":
        // Make speed inconsistent
        this.moveSpeed = Phaser.Math.Between(50, 300);
        break;
      case "noAttack":
        this.malfunctions.attack = true;
        break;
    }
  }

  // ===============================================================
  // startSpinning() {
  //   this.attackStartTime = this.scene.time.now;
  //   this.createSpinEffect();
  // }

  // updateSpinRotation() {
  //   // Calculate time since spinning started
  //   const elapsed = this.scene.time.now - this.attackStartTime;

  //   // Calculate rotation based on time
  //   const rotationSpeed = (this.spinSpeed * Math.PI) / 180; // Convert to radians per second
  //   this.setRotation((elapsed * rotationSpeed) / 1000);
  // }

  // createSpinEffect() {
  //   // Create a circle graphic for the spin effect
  //   this.spinEffect = this.scene.add.graphics();
  //   this.spinEffect.clear();
  //   this.spinEffect.lineStyle(2, 0xffff00, 0.5);
  //   this.spinEffect.strokeCircle(0, 0, 100);

  //   // Add a continuous rotation tween for the effect
  //   this.scene.tweens.add({
  //     targets: this.spinEffect,
  //     rotation: Math.PI * 2,
  //     duration: 2000,
  //     repeat: -1, // -1 means infinite repeat
  //   });
  // }
}
