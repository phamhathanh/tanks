"use strict";

var game = new Phaser.Game(1088, 704, Phaser.CANVAS, '',
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

const TILE_SIZE = 64;
const MAP_WIDTH = 17;
const MAP_HEIGHT = 11;

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

    const playerSprite = game.add.sprite(TILE_SIZE * 1.5, TILE_SIZE * 1.5, 'player');
    playerSprite.anchor.setTo(0.5, 0.5);
    playerSprite.bringToTop();

    player = new Player(1, 1, playerSprite);

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
        x: player.position.x + (player.SPEED + 0.5) * direction.x,
        y: player.position.y + (player.SPEED + 0.5) * direction.y
    };
    const destinationTile = getTile(destination);

    const movingHorizontally = direction.y === 0;
    const destinationHalfTile = getHalfTile(destination, movingHorizontally);
    const destinationOccupied = isHittingTheWall(destinationHalfTile, movingHorizontally);
    if (destinationOccupied) {
        if (movingHorizontally)
            if (Math.abs(player.position.x - destination.x) > 1)
                player.position.x = destinationTile.x - direction.x;
        else
            if (Math.abs(player.position.y - destination.y) > 1)
                player.position.y = destinationTile.y - direction.y;
    }
    else {
        player.position.x += player.SPEED * direction.x;
        player.position.y += player.SPEED * direction.y;
        const newPosition = getTile(player.position);
        if (powerupMap.hasTile(newPosition.x, newPosition.y)) {
            powerupMap.removeTile(newPosition.x, newPosition.y);
            // Do stuffs.
        }
    }

    player.sprite.x = TILE_SIZE * (player.position.x + 0.5);
    player.sprite.y = TILE_SIZE * (player.position.y + 0.5);
}

function snap(player) {
    const isHorizontal = player.facing.y === 0;
    if (isHorizontal)
        player.position.y = Math.round(player.position.y * 2) / 2;
    else
        player.position.x = Math.round(player.position.x * 2) / 2;
}

function getTile(position) {
    return {
        x: Math.round(position.x),
        y: Math.round(position.y)
    };
}

function getHalfTile(position, movingHorizontally) {
    if (movingHorizontally)
        return {
            x: Math.round(position.x),
            y: Math.round(position.y * 2) / 2
        };
    else
        return {
            x: Math.round(position.x * 2) / 2,
            y: Math.round(position.y)
        };
}

function isHittingTheWall(halfTile, movingHorizontally) {
    if (halfTile.x < 0 || halfTile.x > MAP_WIDTH - 1
        || halfTile.y < 0 || halfTile.y > MAP_HEIGHT - 1)
        throw 'Argument out of range.';

    if (movingHorizontally) {
        if (!Number.isInteger(halfTile.x))
            throw 'Not expected.'
        if (Number.isInteger(halfTile.y))
            return isOccupied(halfTile);
        else {
            const leftTile = { x: halfTile.x, y: halfTile.y - 0.5 };
            const rightTile = { x: halfTile.x, y: halfTile.y + 0.5 };
            return isOccupied(leftTile) || isOccupied(rightTile);
        }
    }
    else {
        if (!Number.isInteger(halfTile.y))
            throw 'Not expected.'
        if (Number.isInteger(halfTile.x))
            return isOccupied(halfTile);
        else {
            const upperTile = { x: halfTile.x - 0.5, y: halfTile.y };
            const lowerTile = { x: halfTile.x + 0.5, y: halfTile.y };
            return isOccupied(upperTile) || isOccupied(lowerTile);
        }
    }
}

function isOccupied(tile) {
    return map.hasTile(tile.x, tile.y, 'wall')
        || map.hasTile(tile.x, tile.y, 'objects');
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