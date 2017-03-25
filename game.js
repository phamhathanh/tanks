"use strict";

const TILE_SIZE = 32;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 22;

var game = new Phaser.Game(TILE_SIZE * MAP_WIDTH, TILE_SIZE * MAP_HEIGHT, Phaser.CANVAS, '',
    { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.baseURL = './';
    game.load.crossOrigin = 'anonymous';

    game.load.image('player', 'sprites/player.png');
    game.load.image('bullet', 'sprites/bullet.png');

    game.load.image('floor', 'sprites/tiles/floor.png');
    game.load.image('wall', 'sprites/tiles/wall.png');
    game.load.image('block', 'sprites/tiles/block.png');

    game.load.tilemap('map', 'sprites/tiles/map.json', null, Phaser.Tilemap.TILED_JSON);
}

var map;
const updaters = [];
const players = [];

function create() {
    map = new Map();

    const keys1 = game.input.keyboard.addKeys({
        'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN,
        'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT,
        'fire': Phaser.KeyCode.NUMPAD_0
    });
    const player1 = new Player(1, 3, keys1);

    const keys2 = game.input.keyboard.addKeys({
        'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S,
        'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D,
        'fire': Phaser.KeyCode.J
    });
    const player2 = new Player(1, 2, keys2);
    players.push(player1);
    players.push(player2);
}

var Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

function update() {
    for (let i = 0; i < updaters.length; i++)
        updaters[i]();
}

function render() {
}