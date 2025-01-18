// src/scenes/RepairUI.js
export default class RepairUI extends Phaser.Scene {
  constructor() {
    super({ key: "RepairUI" });
  }

  preload() {
    this.scene.get("GameScene").scene.pause();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create semi-transparent background overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(100);
    overlay.setScrollFactor(0);

    // Create popup container
    const popupWidth = 700;
    const popupHeight = 500;
    const x = (this.cameras.main.width - popupWidth) / 2;
    const y = (this.cameras.main.height - popupHeight) / 2;

    // Popup background
    const popup = this.add.rectangle(x, y, popupWidth, popupHeight, 0x333333);
    popup.setOrigin(0);
    popup.setDepth(101);

    // Add title
    const title = this.add.text(
      x + popupWidth / 2,
      y + 30,
      "Repair Functions",
      {
        fontSize: "32px",
        fill: "#ffffff",
        fontFamily: "Arial",
      }
    );
    title.setOrigin(0.5, 0);
    title.setDepth(102);

    // Get broken functions from game scene
    const gameScene = this.scene.get("GameScene");
    const brokenFunctions = Object.entries(gameScene.player.malfunctions)
      .filter(([_, isBroken]) => isBroken)
      .map(([funcName, _]) => funcName);

    // Add function buttons
    brokenFunctions.forEach((func, index) => {
      const buttonY = y + 100 + index * 70;

      // Button background
      const button = this.add.rectangle(
        x + popupWidth / 2,
        buttonY,
        popupWidth - 100,
        50,
        0x444444
      );
      button.setDepth(102);
      button.setInteractive();

      // Button text
      const text = this.add.text(
        x + popupWidth / 2,
        buttonY,
        `Fix ${func} function`,
        {
          fontSize: "24px",
          fill: "#ffffff",
          fontFamily: "Arial",
        }
      );
      text.setOrigin(0.5);
      text.setDepth(103);

      // Hover effects
      button.on("pointerover", () => {
        button.setFillStyle(0x666666);
      });
      button.on("pointerout", () => {
        button.setFillStyle(0x444444);
      });

      // Click handler
      button.on("pointerdown", () => {
        this.repairFunction(func);
      });
    });

    // Add close button
    const closeButton = this.add.text(x + popupWidth - 30, y + 10, "X", {
      fontSize: "24px",
      fill: "#ffffff",
      fontFamily: "Arial",
    });
    closeButton.setDepth(102);
    closeButton.setInteractive();
    closeButton.on("pointerover", () => {
      closeButton.setStyle({ fill: "#ff0000" });
    });
    closeButton.on("pointerout", () => {
      closeButton.setStyle({ fill: "#ffffff" });
    });
    closeButton.on("pointerdown", () => {
      console.log("Close button clicked");
      this.closeRepairUI();
    });

    // If no broken functions, show message
    if (brokenFunctions.length === 0) {
      const message = this.add.text(
        x + popupWidth / 2,
        y + popupHeight / 2,
        "No functions need repair!",
        {
          fontSize: "24px",
          fill: "#ffffff",
          fontFamily: "Arial",
        }
      );
      message.setOrigin(0.5);
      message.setDepth(102);
    }
  }

  repairFunction(funcName) {
    console.log(`Repairing function: ${funcName}`);
    try {
      const gameScene = this.scene.get("GameScene");
      if (gameScene && gameScene.player) {
        gameScene.player.malfunctions[funcName] = false;
        gameScene.player.health += 10; // Heal
        this.closeUI();
      } else {
        console.error("Could not find GameScene or player");
      }
    } catch (error) {
      console.error("Error in repairFunction:", error);
    }
  }

  closeRepairUI() {
    console.log("Attempting to close RepairUI");
    try {
      // Get reference to GameScene
      const gameScene = this.scene.get("GameScene");

      if (gameScene) {
        // Resume GameScene first
        console.log("Resuming GameScene");
        this.scene.resume("GameScene");

        // Then stop this UI scene
        console.log("Stopping RepairUI");
        this.scene.stop("RepairUI");
      } else {
        console.error("Could not find GameScene");
      }
    } catch (error) {
      console.error("Error in closeUI:", error);
    }
  }
}
