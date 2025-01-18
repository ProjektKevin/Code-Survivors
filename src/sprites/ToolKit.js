// src/sprites/Toolkit.js
export default class Toolkit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "toolkit");

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.setCollideWorldBounds(true);
    this.body.setAllowGravity(false);

    // Set the size of the physics body (adjust these numbers based on your sprite)
    this.setSize(32, 32);

    // Add visual effects
    // 1. Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 2. Gentle rotation
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 6000,
      repeat: -1,
      ease: "Linear",
    });

    // 3. Glowing effect using alpha
    scene.tweens.add({
      targets: this,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

  }

  update() {
    // Any per-frame updates can go here if needed
  }

  collect() {
    // Play collection animation before destroying
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
