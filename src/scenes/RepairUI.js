import fetch from "node-fetch";

export default class RepairUI extends Phaser.Scene {
  constructor() {
    super({ key: "RepairUI" });
    this.codeInput = null;
    this.codeQuestions = {
      randomSpeed: {
        title: "Speed Control Malfunction",
        description: "Speed regulation system is unstable",
        question:
          "The robot's speed control is malfunctioning. Fix the speed normalization function:",
        template: `function fixRobotSpeed(currentSpeed) {
            /**
             * Instructions:
             * - The robot's normal speed should be 10 units/second.
             * - If the current speed is less than 10, return 10.
             * - Otherwise, return the current speed (no changes are needed if it's already normal or higher).
             */
            // Your code here
            return currentSpeed; // Replace this line
        }`,
        testCases: [
          { input: 5, expected: 10 },
          { input: 15, expected: 15 },
          { input: 0, expected: 10 },
        ],
      },

      invertControls: {
        title: "Control System Malfunction",
        description: "Directional input processing corrupted",
        question:
          "The robot's controls are inverted. Fix the control mapping function:",
        template: `function fixControls(input) {
          /**
           * Instructions:
           * - The input is a string representing the key pressed: 'W', 'A', 'S', 'D'.
           * - Inverted controls mapping:
           *   - 'W' (up) is inverted to 'S' (down).
           *   - 'A' (left) is inverted to 'D' (right).
           *   - 'S' (down) is inverted to 'W' (up).
           *   - 'D' (right) is inverted to 'A' (left).
           * - Map the input back to its original direction.
           */
          // Your code here
          return input; // Replace this line
        }`,
        testCases: [
          { input: "W", expected: "S" },
          { input: "A", expected: "D" },
          { input: "S", expected: "W" },
          { input: "D", expected: "A" },
        ],
      },

      noAttack: {
        title: "Attack System Malfunction",
        description: "Damage calculation module error",
        question:
          "The robot's attack system is malfunctioning. Fix the damage calculation:",
        template: `function fixAttackDamage(damage, enemyHealth) {
              /**
               * Instructions:
               * - The function takes in the damage dealt by the robot and the enemy's current health.
               * - Subtract the damage from the enemy's health.
               * - Ensure that health doesn't go below 0 (minimum health is 0).
               * - Return the updated enemy health.
               */
              // Your code here
              return enemyHealth; // Replace this line
          }`,
        testCases: [
          { input: [10, 30], expected: 20 },
          { input: [20, 15], expected: 0 },
          { input: [5, 3], expected: 0 },
        ],
      },

      randomMovement: {
        title: "Movement System Malfunction",
        description: "Direction control system compromised",
        question:
          "The robot's movement system is malfunctioning. Fix the direction control:",
        template: `function fixRandomMovement(targetDirection) {
              /**
               * Instructions:
               * - The robot should move in the specified target direction only.
               * - The targetDirection is a string: 'up', 'down', 'left', 'right'.
               * - Return the correct direction based on the given targetDirection.
               */
              // Your code here
              return targetDirection; // Replace this line
          }`,
        testCases: [
          { input: "up", expected: "up" },
          { input: "down", expected: "down" },
          { input: "left", expected: "left" },
          { input: "right", expected: "right" },
        ],
      },
    };
  }

  preload() {
    const gameScene = this.scene.get("GameScene");
    this.scene.get("GameScene").scene.pause();
    // Disable the player controls specifically
    gameScene.player.controls.up.enabled = false;
    gameScene.player.controls.down.enabled = false;
    gameScene.player.controls.left.enabled = false;
    gameScene.player.controls.right.enabled = false;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create semi-transparent background overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(100);
    overlay.setScrollFactor(0);

    // Create main popup container
    const popupWidth = 800;
    const popupHeight = 600;
    const x = (width - popupWidth) / 2;
    const y = (height - popupHeight) / 2;

    // Create popup background with a terminal-like appearance
    this.createPopup(x, y, popupWidth, popupHeight);

    // Get current malfunctions
    const gameScene = this.scene.get("GameScene");
    const brokenFunctions = Object.entries(gameScene.player.malfunctions)
      .filter(([_, isBroken]) => isBroken)
      .map(([funcName, _]) => funcName);

    if (brokenFunctions.length > 0) {
      if (this.selectedMalfunction) {
        this.createRepairInterface(
          x,
          y,
          popupWidth,
          popupHeight,
          this.selectedMalfunction
        );
      } else {
        this.createMalfunctionSelector(
          x,
          y,
          popupWidth,
          popupHeight,
          brokenFunctions
        );
      }
    } else {
      this.createNoMalfunctionsMessage(x, y, popupWidth, popupHeight);
    }

    this.createCloseButton(x, y, popupWidth);
  }

  repairFunction(funcName) {
    console.log(`Repairing function: ${funcName}`);
    try {
      const gameScene = this.scene.get("GameScene");
      if (gameScene && gameScene.player) {
        // Reset only the specific malfunction
        gameScene.player.resetMalfunction(funcName);
        
        // Heal the player
        gameScene.player.health += 10;
        gameScene.updateHealthDisplay();
        
        this.closeRepairUI();
      } else {
        console.error("Could not find GameScene or player");
      }
    } catch (error) {
      console.error("Error in repairFunction:", error);
    }
  }
  

  // --- Popup ---
  createPopup(x, y, width, height) {
    // Terminal-like background
    const popup = this.add.rectangle(x, y, width, height, 0x1e1e1e);
    popup.setOrigin(0);
    popup.setDepth(101);

    // Add subtle border glow
    const border = this.add.rectangle(x, y, width, height);
    border.setStrokeStyle(2, 0x3c3c3c);
    border.setOrigin(0);
    border.setDepth(101);
  }

  closeRepairUI() {
    console.log("Attempting to close RepairUI");
    try {
      // Get reference to GameScene
      const gameScene = this.scene.get("GameScene");

      if (gameScene && gameScene.player) {
        console.log("I am here");
        gameScene.input.keyboard.enabled = true;
        // Re-enable the player controls specifically
        gameScene.player.controls.up.enabled = true;
        gameScene.player.controls.down.enabled = true;
        gameScene.player.controls.left.enabled = true;
        gameScene.player.controls.right.enabled = true;

        if (this.codeInput) {
          this.codeInput.destroy(); // Properly destroy the DOM element
          this.codeInput = null;
        }

        // Resume GameScene first
        console.log("Resuming GameScene");
        this.scene.resume("GameScene");

        // Then stop this UI scene
        console.log("Stopping RepairUI");
        this.scene.stop("RepairUI");
      } else {
        console.log("I am over here");
        console.error("Could not find GameScene");
      }
    } catch (error) {
      console.error("Error in closeUI:", error);
    }
  }

  // --- Overlay ---
  createOverlay(width, height) {
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setOrigin(0);
    overlay.setDepth(100);
    overlay.setScrollFactor(0);
  }

  // --- Repair Interface ---
  createRepairInterface(x, y, popupWidth, popupHeight, malfunctionType) {
    const padding = 20;
    console.log("Malfunction type:", malfunctionType); // Log the malfunction type
    console.log("Available questions:", Object.keys(this.codeQuestions)); // Log available questions

    const questionData = this.codeQuestions[malfunctionType];
    console.log("Question data:", questionData);

    // Back button
    const backButton = this.add.text(x + padding, y + padding, "< BACK", {
      fontSize: "16px",
      fill: "#888888",
      fontFamily: "monospace",
    });
    backButton.setDepth(102);
    backButton.setInteractive();
    backButton.on("pointerover", () => {
      backButton.setStyle({ fill: "#ffffff" });
    });
    backButton.on("pointerout", () => {
      backButton.setStyle({ fill: "#888888" });
    });
    backButton.on("pointerdown", () => {
      this.selectedMalfunction = null;
      this.scene.restart();
    });

    // Title
    this.add
      .text(
        x + padding,
        y + padding + 40,
        `> ${malfunctionType.toUpperCase()} REPAIR`,
        {
          fontSize: "24px",
          fill: "#00ff00",
          fontFamily: "monospace",
        }
      )
      .setDepth(102);

    // Question
    this.add
      .text(x + padding, y + padding + 80, `> ${questionData.question}`, {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "monospace",
        wordWrap: { width: popupWidth - padding * 2 },
      })
      .setDepth(102);

    // Create a wrapper div for the code input with correct positioning
    const codeWrapper = document.createElement("div");
    codeWrapper.style.width = `${popupWidth - padding * 2}px`;
    codeWrapper.style.height = "300px";
    codeWrapper.style.backgroundColor = "#2D2D2D";
    codeWrapper.style.border = "1px solid #3C3C3C";
    codeWrapper.style.padding = "10px";
    codeWrapper.style.position = "relative";

    // Create the textarea
    const textarea = document.createElement("textarea");
    textarea.value = questionData.template;
    textarea.style.width = "100%";
    textarea.style.height = "100%";
    textarea.style.backgroundColor = "#2D2D2D";
    textarea.style.color = "#D4D4D4";
    textarea.style.fontFamily = "Consolas, monospace";
    textarea.style.fontSize = "14px";
    textarea.style.border = "none";
    textarea.style.resize = "none";
    textarea.style.outline = "none";
    textarea.style.whiteSpace = "pre";
    textarea.style.overflowWrap = "normal";
    textarea.style.overflowX = "auto";
    textarea.spellcheck = false;

    // Add the textarea to the wrapper
    codeWrapper.appendChild(textarea);

    // Create and position the DOM element in the center of the popup
    const codeInput = this.add.dom(
      x + popupWidth / 2,
      y + padding + 140,
      codeWrapper
    );
    codeInput.setOrigin(0.5, 0);
    codeInput.setDepth(103);

    // Store reference for later use
    this.codeInput = codeInput;

    // Submit button
    const submitButton = this.add.rectangle(
      x + popupWidth / 2,
      y + popupHeight - padding - 50,
      200,
      40,
      0x2c974b
    );
    submitButton.setInteractive();
    submitButton.setDepth(102);

    const submitText = this.add
      .text(
        x + popupWidth / 2,
        y + popupHeight - padding - 50,
        "> EXECUTE REPAIR",
        {
          fontSize: "16px",
          fill: "#ffffff",
          fontFamily: "monospace",
        }
      )
      .setOrigin(0.5)
      .setDepth(103);

    // Button interactions
    submitButton.on("pointerover", () => {
      submitButton.setFillStyle(0x3cad5b);
      submitText.setText("> [EXECUTE REPAIR]");
    });

    submitButton.on("pointerout", () => {
      submitButton.setFillStyle(0x2c974b);
      submitText.setText("> EXECUTE REPAIR");
    });

    // In createRepairInterface, when handling the submit button click:
    submitButton.on("pointerdown", () => {
      const textarea = codeInput.node.querySelector("textarea");
      if (!textarea) {
        console.error("Textarea not found");
        return;
      }
      const code = textarea.value;
      this.validateAndRepair(malfunctionType, code);
    });

    // Add cleanup in the scene's shutdown method

    this.events.once("shutdown", () => {
      const gameScene = this.scene.get("GameScene");
      // Re-enable keyboard input when closing the repair UI
      if (gameScene) {
        gameScene.input.keyboard.enabled = true;
      }
    });
  }

  // --- No Malfunction ---
  createNoMalfunctionsMessage(x, y, popupWidth, popupHeight) {
    const message = this.add.text(
      x + popupWidth / 2,
      y + popupHeight / 2,
      "> DIAGNOSTIC COMPLETE\n> ALL SYSTEMS OPERATIONAL",
      {
        fontSize: "24px",
        fill: "#00ff00",
        fontFamily: "monospace",
        align: "center",
      }
    );
    message.setOrigin(0.5);
    message.setDepth(102);
  }

  // --- creation ---
  createCloseButton(x, y, popupWidth) {
    const closeButton = this.add.text(x + popupWidth - 40, y + 20, "[X]", {
      fontSize: "18px",
      fill: "#888888",
      fontFamily: "monospace",
    });
    closeButton.setDepth(102);
    closeButton.setInteractive();
    closeButton.on("pointerover", () => {
      closeButton.setStyle({ fill: "#ff0000" });
    });
    closeButton.on("pointerout", () => {
      closeButton.setStyle({ fill: "#888888" });
    });
    closeButton.on("pointerdown", () => {
      this.closeRepairUI();
    });
  }

  // --- code validation ---
  async validateAndRepair(malfunctionType, code) {
    try {
      // Get test cases for this malfunction
      const testCases = this.codeQuestions[malfunctionType].testCases;

      // First validate syntax by trying to create the function
      let fn;
      try {
        fn = new Function("return " + code)();
        if (typeof fn !== "function") {
          throw new Error("Submitted code did not evaluate to a function");
        }
      } catch (syntaxError) {
        this.showValidationError("> SYNTAX ERROR\n> " + syntaxError.message);
        return false;
      }

      // Run through all test cases
      for (const test of testCases) {
        try {
          // Prepare input (handle both single values and arrays)
          const input = Array.isArray(test.input) ? test.input : [test.input];

          // Run the function with a timeout
          const result = await Promise.race([
            Promise.resolve(fn(...input)),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Execution timeout")), 1000)
            ),
          ]);

          // Check if result matches expected
          if (result !== test.expected) {
            const inputStr = Array.isArray(test.input)
              ? test.input.join(", ")
              : test.input;

            const errorMsg =
              `> TEST FAILED\n` +
              `> Input: ${inputStr}\n` +
              `> Expected: ${test.expected}\n` +
              `> Got: ${result}`;

            this.showValidationError(errorMsg);
            return false;
          }
        } catch (testError) {
          this.showValidationError("> RUNTIME ERROR\n> " + testError.message);
          
          this.closeRepairUI();

          return false;
        }
      }

      // If we get here, all tests passed
      console.log("malfunction type:", malfunctionType);

      // Get reference to GameScene
      const gameScene = this.scene.get("GameScene");
      if (!gameScene || !gameScene.player) {
        throw new Error("Could not find GameScene or player");
      }

      // Apply the repair
      gameScene.player.resetMalfunction(malfunctionType);
      gameScene.player.malfunctions[malfunctionType] = false;

      // Heal the player
      const healAmount = 10;
      gameScene.player.health = Math.min(
        gameScene.player.health + healAmount,
        gameScene.player.maxHealth || 40 // Use maxHealth if defined
      );
      

      // Update the health display in GameScene
      if (gameScene.updateHealthDisplay) {
        gameScene.updateHealthDisplay();
      }

      // Show success message
      this.showSuccessMessage();

      // Close the repair UI after a delay
      this.time.delayedCall(1500, () => {
        this.closeRepairUI();
      });

      return true;
    } catch (error) {
      console.error("Error in validation:", error);
      this.showValidationError("> SYSTEM ERROR\n> Please try again");

      // Close the repair UI after a delay
      this.time.delayedCall(1500, () => {
        this.closeRepairUI();
      });

      return false;
    }
  }

  showSuccessMessage() {
    // Create the success text
    const successText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 200,
      "> REPAIR SUCCESSFUL\n> SYSTEMS RESTORED",
      {
        fontSize: "24px",
        fill: "#00ff00",
        fontFamily: "monospace",
        align: "center",
      }
    );
    successText.setOrigin(0.5);
    successText.setDepth(105);

    // Add a fade out effect
    this.tweens.add({
      targets: successText,
      alpha: 0,
      duration: 1500,
      ease: "Power2",
      onComplete: () => successText.destroy(),
    });
  }

  showValidationError(message = "> ERROR: Invalid solution. Try again!") {
    // Create the error text
    const errorText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 200,
      message,
      {
        fontSize: "18px",
        fill: "#ff0000",
        fontFamily: "monospace",
        align: "center",
      }
    );
    errorText.setOrigin(0.5);
    errorText.setDepth(105);

    // Add a fade out effect
    this.tweens.add({
      targets: errorText,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => errorText.destroy(),
    });

    // Close the repair UI after a delay
    this.closeRepairUI();
  }

  async validateCode(code, testCases) {
    try {
      // First, evaluate the user's code
      const fn = new Function("return " + code)();

      // Run through test cases
      for (const test of testCases) {
        const input = Array.isArray(test.input) ? test.input : [test.input];
        const result = fn(...input);

        if (result !== test.expected) {
          // If test case fails, prepare detailed error message
          const inputStr = Array.isArray(test.input)
            ? test.input.join(", ")
            : test.input;

          const errorMsg =
            `> TEST FAILED\n` +
            `> Input: ${inputStr}\n` +
            `> Expected: ${test.expected}\n` +
            `> Got: ${result}`;

          this.showValidationError(errorMsg);
          return false;
        }
      }

      // If planning to use AI validation, add here:
      // const aiValidation = await this.validateWithAI(code);
      // if (!aiValidation.isValid) {
      //   this.showValidationError(aiValidation.feedback);
      //   return false;
      // }

      return true;
    } catch (error) {
      // Handle syntax errors in user code
      const errorMsg = `> SYNTAX ERROR\n` + `> ${error.message}`;

      this.showValidationError(errorMsg);
      return false;
    }
  }

  showValidationError(message = "> ERROR: Invalid solution. Try again!") {
    const errorText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 200,
        message,
        {
          fontSize: "18px",
          fill: "#ff0000",
          fontFamily: "monospace",
        }
      )
      .setOrigin(0.5)
      .setDepth(105);

    this.tweens.add({
      targets: errorText,
      alpha: 0,
      duration: 2000,
      ease: "Power2",
      onComplete: () => errorText.destroy(),
    });
  }

  createMalfunctionSelector(x, y, popupWidth, popupHeight, malfunctions) {
    const padding = 20;

    // Title
    this.add
      .text(x + padding, y + padding, "> SYSTEM DIAGNOSTIC", {
        fontSize: "24px",
        fill: "#00ff00",
        fontFamily: "monospace",
      })
      .setDepth(102);

    // Subtitle
    this.add
      .text(
        x + padding,
        y + padding + 40,
        `> ${malfunctions.length} MALFUNCTIONS DETECTED`,
        {
          fontSize: "18px",
          fill: "#ff0000",
          fontFamily: "monospace",
        }
      )
      .setDepth(102);

    // Instructions
    this.add
      .text(x + padding, y + padding + 80, "> SELECT MALFUNCTION TO REPAIR:", {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "monospace",
      })
      .setDepth(102);

    // Create selectable buttons for each malfunction
    malfunctions.forEach((malfunction, index) => {
      const buttonY = y + padding + 140 + index * 80;
      const questionData = this.codeQuestions[malfunction];

      // Button background
      const button = this.add.rectangle(
        x + padding,
        buttonY,
        popupWidth - padding * 2,
        60,
        0x2d2d2d
      );
      button.setOrigin(0);
      button.setInteractive();
      button.setDepth(102);

      // Malfunction name instead of title
      this.add
        .text(
          x + padding + 20,
          buttonY + 10,
          `> ${malfunction.toUpperCase()}`,
          {
            fontSize: "18px",
            fill: "#ff9900",
            fontFamily: "monospace",
          }
        )
        .setDepth(103);

      // Brief description of the malfunction
      this.add
        .text(x + padding + 20, buttonY + 35, `> System requires repair`, {
          fontSize: "14px",
          fill: "#888888",
          fontFamily: "monospace",
        })
        .setDepth(103);

      // Button interactions stay the same
      button.on("pointerover", () => {
        button.setFillStyle(0x3d3d3d);
      });
      button.on("pointerout", () => {
        button.setFillStyle(0x2d2d2d);
      });
      button.on("pointerdown", () => {
        this.selectedMalfunction = malfunction;
        this.scene.restart();
      });
    });
  }
}
