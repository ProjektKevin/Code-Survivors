// src/scenes/GameOverScene.js
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data) {
    // Get final score or any other data passed from GameScene
    this.finalScore = data.score || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Add dark semi-transparent background
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);

    // Add Game Over text
    this.add
      .text(width / 2, height / 3, "GAME OVER", {
        fontFamily: "Arial Black",
        fontSize: "64px",
        color: "#FF0000",
        stroke: "#000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // Add score if you're tracking it
    this.add
      .text(width / 2, height / 2, `Score: ${this.finalScore}`, {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#FFFFFF",
        align: "center",
      })
      .setOrigin(0.5);

    // Add "Play Again" button
    const playAgainButton = this.add
      .text(width / 2, height * 0.6, "Play Again", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#FFFFFF",
        backgroundColor: "#444444",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    // Add "Main Menu" button
    const menuButton = this.add
      .text(width / 2, height * 0.7, "Main Menu", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#FFFFFF",
        backgroundColor: "#444444",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    // Make buttons interactive
    [playAgainButton, menuButton].forEach((button) => {
      button
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () =>
          button.setStyle({ backgroundColor: "#666666" })
        )
        .on("pointerout", () =>
          button.setStyle({ backgroundColor: "#444444" })
        );
    });

    // Add button functionality
    playAgainButton.on("pointerup", () => {
      this.scene.start("GameScene");
    });

    menuButton.on("pointerup", () => {
      this.scene.start("MainMenu");
    });
  }
}
