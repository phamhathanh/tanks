"use strict";

const TILE_SIZE = 32;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 22;

var game = new Phaser.Game(TILE_SIZE*MAP_WIDTH, TILE_SIZE*MAP_HEIGHT, Phaser.CANVAS, '',
    { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.baseURL = './';
    game.load.crossOrigin = 'anonymous';

    game.load.image('player', 'sprites/player.png');

    game.load.image('floor', 'sprites/tiles/floor.png');
    game.load.image('wall', 'sprites/tiles/wall.png');
    game.load.image('block', 'sprites/tiles/block.png');

    game.load.image('length', 'sprites/powerup/length.png');

    game.load.tilemap('map', 'sprites/tiles/map.json', null, Phaser.Tilemap.TILED_JSON);
}

var player;
var map; var powerupMap;

var keys;

var PowerUp = {
    LENGTH: { index: 0 }
};

function create() {
    map = game.add.tilemap('map');
    map.addTilesetImage('floor', 'floor');
    map.addTilesetImage('wall', 'wall');
    map.addTilesetImage('block', 'block');

    map.layers.forEach(function (layer, index) {
        map.createLayer(index);
    });

    powerupMap = game.add.tilemap();
    powerupMap.create('powerups', MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, TILE_SIZE);
    powerupMap.addTilesetImage('length', 'length');
    powerupMap.putTile(PowerUp.LENGTH.index, 5, 1);

    const playerSprite = game.add.sprite(0, 0, 'player');
    playerSprite.anchor.setTo(0.5, 0.5);
    playerSprite.scale.setTo(0.64);
    playerSprite.bringToTop();

    player = new Player(1, 1, playerSprite);
    player.updatePosition();

    keys = game.input.keyboard.addKeys({
        'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN,
        'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT,
        'A': Phaser.KeyCode.Z
    });

    //keys.A.onDown.add(dropBomb);
    // TODO: FIRE!
}

var Direction = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

function update() {
    if (keys.left.isDown)
        move(Direction.LEFT);
    else if (keys.right.isDown)
        move(Direction.RIGHT);
    else if (keys.up.isDown)
        move(Direction.UP);
    else if (keys.down.isDown)
        move(Direction.DOWN);
}

function move(direction) {
    if (player.facing !== direction) {
        player.face(direction);
        snap(player);
    }

    const destination = {
        x: player.position.x + (player.SPEED + 0.25) * direction.x,
        y: player.position.y + (player.SPEED + 0.25) * direction.y
    };
    const destinationHalfTile = getHalfTile(destination);
    const movingHorizontally = direction.y === 0;
    const destinationOccupied = isHittingTheWall(destinationHalfTile, movingHorizontally);
    if (destinationOccupied) {
        var isTouchingTheWall;
        if (movingHorizontally) {
            isTouchingTheWall = Math.abs(player.position.x - destinationHalfTile.x) <= 0.5
            if (!isTouchingTheWall)
                player.position.x = destinationHalfTile.x - 0.5*direction.x;
        }
        else {
            isTouchingTheWall = Math.abs(player.position.y - destinationHalfTile.y) <= 0.5
            if (!isTouchingTheWall)
                player.position.y = destinationHalfTile.y - 0.5*direction.y;
        }
    }
    else
        player.position = {
            x: player.position.x + player.SPEED * direction.x,
            y: player.position.y + player.SPEED * direction.y
        };

    player.updatePosition();
}

function snap(player) {
    const isHorizontal = player.facing.y === 0;
    if (isHorizontal)
        player.position.y = Math.round(player.position.y * 2) / 2;
    else
        player.position.x = Math.round(player.position.x * 2) / 2;
}

function getHalfTile(position, movingHorizontally) {
    return {
        x: Math.round(position.x * 2) / 2,
        y: Math.round(position.y * 2) / 2
    };
}

function isHittingTheWall(halfTile, movingHorizontally) {
    const left = halfTile.x * 2,
        right = halfTile.x * 2 + 1,
        top = halfTile.y * 2,
        bottom = halfTile.y * 2 + 1;

    function isOccupied(row, col) {
        if (col < 0 || col > MAP_WIDTH - 1
            || row < 0 || row > MAP_HEIGHT - 1)
            throw 'Argument out of range: ' + row + ' ' + col;
        return map.hasTile(col, row, 'wall');
    }
    return isOccupied(top, left) || isOccupied(top, right)
        || isOccupied(bottom, left) || isOccupied(bottom, right);
}

function render() {
}