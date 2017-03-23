"use strict";

var game = new Phaser.Game(1088, 704, Phaser.AUTO, '',
    { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.baseURL = './';
    game.load.crossOrigin = 'anonymous';

    game.load.image('player', 'sprites/player.png');
    game.load.image('bomb', 'sprites/bomb.png');
    game.load.image('fire', 'sprites/fire.png');

    game.load.image('floor', 'sprites/tiles/floor.png');
    game.load.image('wall', 'sprites/tiles/wall.png');
    game.load.image('block', 'sprites/tiles/block.png');

    game.load.image('length', 'sprites/powerup/length.png');

    game.load.tilemap('map', 'sprites/tiles/map.json', null, Phaser.Tilemap.TILED_JSON);
}

const TILE_SIZE = 64;
const MAP_WIDTH = 17;
const MAP_HEIGHT = 11;

var player;
var map; var powerupMap;

var directionKeys;
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

    player = game.add.sprite(TILE_SIZE * 1.5, TILE_SIZE * 1.5, 'player');
    player.anchor.setTo(0.5, 0.5);
    player.bringToTop();

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

function face(direction) {
    player.rotation = -Math.PI / 2 + Math.atan2(direction.y, direction.x);
}

var playerPosition = { x: 1, y: 1 };
const SPEED = 0.12;

function move(direction) {
    face(direction);

    const currentTile = getTile(playerPosition);
    const destination = {
        x: playerPosition.x + (SPEED + 0.5) * direction.x,
        y: playerPosition.y + (SPEED + 0.5) * direction.y
    };
    const destinationTile = getTile(destination);

    const horizontal = direction.y === 0;
    const destinationOccupied = isOccupied(destinationTile);
    const currentTileOccupied = isOccupied(currentTile);
    const theFollowingTile = {
        x: currentTile.x + direction.x,
        y: currentTile.y + direction.y
    };
    const theFollowingTileOccupied = isOccupied(theFollowingTile);
    if (destinationOccupied && (!currentTileOccupied || theFollowingTileOccupied)) {
        if (horizontal) {
            if (Math.abs(playerPosition.x - destination.x) > 1)
                playerPosition.x = destinationTile.x - direction.x;
        }
        else {
            if (Math.abs(playerPosition.y - destination.y) > 1)
                playerPosition.y = destinationTile.y - direction.y;
        }
    }
    else {
        if (horizontal)
            playerPosition.y = snap(playerPosition.y, destinationTile.y);
        else {
            playerPosition.x = snap(playerPosition.x, destinationTile.x);
        }

        playerPosition.x += SPEED * direction.x;
        playerPosition.y += SPEED * direction.y;

        const newPosition = getTile(playerPosition);
        if (powerupMap.hasTile(newPosition.x, newPosition.y)) {
            powerupMap.removeTile(newPosition.x, newPosition.y);
            fireLength++;
        }
    }

    player.x = TILE_SIZE * (playerPosition.x + 0.5);
    player.y = TILE_SIZE * (playerPosition.y + 0.5);
}

function face(direction) {
    player.rotation = -Math.PI / 2 + Math.atan2(direction.y, direction.x);
}

function getTile(position) {
    return {
        x: Math.round(position.x),
        y: Math.round(position.y)
    };
}

function isOccupied(tile) {
    if (tile.x < 0 || tile.x > MAP_WIDTH - 1
        || tile.y < 0 || tile.y > MAP_HEIGHT - 1)
        throw 'Argument out of range.';

    return map.hasTile(tile.x, tile.y, 'wall')
        || map.hasTile(tile.x, tile.y, 'objects');
}

function snap(value, target) {
    var diff = value - target;
    if (Math.abs(diff) < SPEED)
        return target;
    return value - SPEED * Math.sign(diff);
}

function getNextTile(tile, direction) {
    return {
        x: tile.x + direction.x,
        y: tile.y + direction.y
    }
}

function startCoroutine(delay, callback) {
    var timer = game.time.create();
    timer.add(delay, callback);
    timer.start();
    return timer;
}

function render() {
}