import Phaser from 'phaser';
// import BootScene from './scenes/Boot';
import MainMenu from './scenes/MainMenu';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';
import RepairUIScene from './scenes/RepairUI';

const config = {
    type: Phaser.AUTO,
    width: 1380,
    height: 650,
    parent: 'game',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MainMenu, GameScene, RepairUIScene, GameOverScene]
};

// Create game instance
window.addEventListener('load', () => {
    new Phaser.Game(config);
});