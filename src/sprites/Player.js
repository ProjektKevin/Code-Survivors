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

    // Set Attack Properties
    this.isAttacking = false;
    this.canAttack = true;
    this.attackDuration = 500;
    this.attackCooldown = 1500;
    this.spinSpeed = 720;


    // Set physics properties
    this.setCollideWorldBounds(true);

    // Optional: Add drag to make movement more smooth
    this.setDrag(1000);
    this.setDamping(true);

    // Set the player's hit box (adjust values as needed)
    this.setSize(32, 32);

    // Initialize last movement direction for animations
    this.lastDirection = "down";
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

  update() {
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

    // --- Attack ---
    // Handle attack input first
    if (this.controls.attack.isDown && this.canAttack && !this.isAttacking) {
      this.startAttack();
    }

    // Only allow movement if not attacking
    if (!this.isAttacking) {
        this.handleMovement();
    }

    // Update attack rotation if attacking
    if (this.isAttacking) {
        this.updateAttackRotation();
    }

      // Set the velocity
      this.setVelocity(velocityX, velocityY);
    }

  startAttack() {
    if (this.malfunctions.attack) return;

    this.isAttacking = true;
    this.canAttack = false;

    // Store the initial rotation
    this.initialRotation = this.rotation;
    this.attackStartTime = this.scene.time.now;

    // Optional: Create a spinning effect circle
    this.createSpinEffect();

    // Set up attack end timer
    this.scene.time.delayedCall(this.attackDuration, () => {
      this.endAttack();
    });

    // Set up cooldown timer
    this.scene.time.delayedCall(this.attackCooldown, () => {
      this.canAttack = true;
    });
  }

  endAttack() {
    this.isAttacking = false;
    this.setRotation(this.initialRotation);
    if (this.spinEffect) {
      this.spinEffect.destroy();
      this.spinEffect = null;
    }
  }

  updateAttackRotation() {
    const elapsed = this.scene.time.now - this.attackStartTime;
    const progress = Math.min(elapsed / this.attackDuration, 1);

    // Calculate rotation based on progress
    const totalRotation =
      ((this.spinSpeed * Math.PI) / 180) * (this.attackDuration / 1000);
    this.setRotation(this.initialRotation + totalRotation * progress);

    // Update spin effect if it exists
    if (this.spinEffect) {
      this.spinEffect.setPosition(this.x, this.y);
    }
  }

  createSpinEffect() {
    // Create a circle graphic for the spin effect
    this.spinEffect = this.scene.add.graphics();
    this.spinEffect.clear();
    this.spinEffect.lineStyle(2, 0xffff00, 0.5);
    this.spinEffect.strokeCircle(0, 0, 40);

    // Add a simple rotation tween for the effect
    this.scene.tweens.add({
      targets: this.spinEffect,
      rotation: Math.PI * 2,
      duration: this.attackDuration,
      repeat: 0,
    });
  }


}
