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
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MainMenu, GameScene, RepairUIScene, GameOverScene]
};

new Phaser.Game(config);