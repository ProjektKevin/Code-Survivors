// src/scenes/RepairUI.js
export default class RepairUI extends Phaser.Scene {
  constructor() {
      super({ key: 'RepairUI' });
  }

  create() {
      // Create semi-transparent background overlay
      const overlay = this.add.rectangle(
          0, 0, 
          this.cameras.main.width,
          this.cameras.main.height,
          0x000000, 0.7
      );
      overlay.setOrigin(0);
      overlay.setDepth(100);
      overlay.setScrollFactor(0);

      // Create popup container
      const popupWidth = 600;
      const popupHeight = 400;
      const x = (this.cameras.main.width - popupWidth) / 2;
      const y = (this.cameras.main.height - popupHeight) / 2;

      // Popup background
      const popup = this.add.rectangle(x, y, popupWidth, popupHeight, 0x333333);
      popup.setOrigin(0);
      popup.setDepth(101);

      // Add title
      const title = this.add.text(x + popupWidth/2, y + 30, 'Repair Functions', {
          fontSize: '32px',
          fill: '#ffffff',
          fontFamily: 'Arial'
      });
      title.setOrigin(0.5, 0);
      title.setDepth(102);

      // Get broken functions from game scene
      const gameScene = this.scene.get('GameScene');
      const brokenFunctions = Object.entries(gameScene.player.malfunctions)
          .filter(([_, isBroken]) => isBroken)
          .map(([funcName, _]) => funcName);

      // Add function buttons
      brokenFunctions.forEach((func, index) => {
          const buttonY = y + 100 + (index * 70);
          
          // Button background
          const button = this.add.rectangle(
              x + popupWidth/2,
              buttonY,
              popupWidth - 100,
              50,
              0x444444
          );
          button.setDepth(102);
          button.setInteractive();

          // Button text
          const text = this.add.text(
              x + popupWidth/2,
              buttonY,
              `Fix ${func} function`,
              {
                  fontSize: '24px',
                  fill: '#ffffff',
                  fontFamily: 'Arial'
              }
          );
          text.setOrigin(0.5);
          text.setDepth(103);

          // Hover effects
          button.on('pointerover', () => {
              button.setFillStyle(0x666666);
          });
          button.on('pointerout', () => {
              button.setFillStyle(0x444444);
          });

          // Click handler
          button.on('pointerdown', () => {
              this.startRepair(func);
          });
      });

      // Add close button
      const closeButton = this.add.text(
          x + popupWidth - 40,
          y + 20,
          'X',
          {
              fontSize: '24px',
              fill: '#ffffff',
              fontFamily: 'Arial'
          }
      );
      closeButton.setDepth(102);
      closeButton.setInteractive();
      closeButton.on('pointerover', () => {
          closeButton.setStyle({ fill: '#ff0000' });
      });
      closeButton.on('pointerout', () => {
          closeButton.setStyle({ fill: '#ffffff' });
      });
      closeButton.on('pointerdown', () => {
          this.closeRepairUI();
      });

      // If no broken functions, show message
      if (brokenFunctions.length === 0) {
          const message = this.add.text(
              x + popupWidth/2,
              y + popupHeight/2,
              'No functions need repair!',
              {
                  fontSize: '24px',
                  fill: '#ffffff',
                  fontFamily: 'Arial'
              }
          );
          message.setOrigin(0.5);
          message.setDepth(102);
      }
  }

  startRepair(functionName) {
      console.log(`Starting repair for: ${functionName}`);
      // Here you would implement your code repair interface
      // For now, let's just fix the function immediately
      const gameScene = this.scene.get('GameScene');
      gameScene.player.malfunctions[functionName] = false;
      this.closeRepairUI();
  }

  closeRepairUI() {
      // Resume the game scene
      const gameScene = this.scene.get('GameScene');
      gameScene.scene.resume();
      // Close this scene
      this.scene.stop();
  }
}