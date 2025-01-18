import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
      const centerX = 1380 / 2; // mid of the screen on X-axis
      const centerY = 650 / 2; // mid of the screen on Y-axis

        // Add title text
        this.add.text(centerX, centerY-100, 'Code Survivors', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create a simple start button
        const startButton = this.add.rectangle(centerX, centerY, 200, 50, 0x00ff00);
        const startText = this.add.text(centerX, centerY, 'Start Game', {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5);

        // Make button interactive
        startButton.setInteractive();
        
        // Add hover effect
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x006900);
            startText.setScale(1.1);
        });
        
        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x00ff00);
            startText.setScale(1);
        });

        // Start game on click
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}