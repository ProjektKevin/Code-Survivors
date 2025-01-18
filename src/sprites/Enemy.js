export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
      super(scene, x, y, 'enemy');
      
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      this.health = 10;
      this.speed = 100;
      this.target = null;
      
      // Set the enemy size and physics properties
      this.setCollideWorldBounds(true);
      
      // You can adjust these values based on your enemy sprite
      this.setSize(32, 32);
  }

  setTarget(target) {
      this.target = target;
  }

  takeDamage(amount) {
      this.health -= amount;
      
      // Optional: Add damage visual feedback
      this.scene.tweens.add({
          targets: this,
          alpha: 0.5,
          duration: 100,
          yoyo: true
      });
      
      if (this.health <= 0) {
          this.destroy();
      }
  }

  update() {
      if (!this.target) return;
      
      // Move towards player
      const angle = Phaser.Math.Angle.Between(
          this.x, this.y,
          this.target.x, this.target.y
      );
      
      const velocityX = Math.cos(angle) * this.speed;
      const velocityY = Math.sin(angle) * this.speed;
      
      this.setVelocity(velocityX, velocityY);
  }
}