export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = 10;
    this.speed = 100;
    this.target = null;
    this.setCollideWorldBounds(true); // Set the enemy size and physics properties
    this.isInvulnerable = false;
    this.invulnerabilityDuration = 1000; // Adjust enemy invulnerability time (ms)
    this.setSize(32, 32); // You can adjust these values based on your enemy sprite
  }

  setTarget(target) {
    this.target = target;
  }

  takeDamage(amount, isWeaponActive) {
    if (this.isInvulnerable || !isWeaponActive) return;

    this.health -= amount;

    // Visual feedback
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });

    // Make invulnerable temporarily
    this.isInvulnerable = true;
    this.alpha = 0.5; // Visual indicator of invulnerability

    // Remove invulnerability after duration
    this.scene.time.delayedCall(this.invulnerabilityDuration, () => {
      this.isInvulnerable = false;
      this.alpha = 1;
    });

    if (this.health <= 0) {
      this.destroy();
    }
  }

  update() {
    if (!this.target) return;

    // Move towards player
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.target.x,
      this.target.y
    );

    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;

    this.setVelocity(velocityX, velocityY);
  }
}
