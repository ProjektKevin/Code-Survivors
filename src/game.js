import Phaser from 'phaser';
// import BootScene from './scenes/Boot';
import MainMenu from './scenes/MainMenu';
import GameScene from './scenes/GameScene';

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
    scene: [MainMenu, GameScene]
};

new Phaser.Game(config);