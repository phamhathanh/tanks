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

var player;
var map;
var keys;
var updaters = [];

function create() {
    map = game.add.tilemap('map');
    map.addTilesetImage('floor', 'floor');
    map.addTilesetImage('wall', 'wall');
    map.addTilesetImage('block', 'block');

    map.layers.forEach(function (layer, index) {
        map.createLayer(index);
    });

    const playerSprite = game.add.sprite(0, 0, 'player');
    playerSprite.anchor.setTo(0.5, 0.5);
    playerSprite.scale.setTo(0.64);
    playerSprite.bringToTop();

    player = new Player(1, 1, playerSprite);
    player.updatePosition();

    keys = game.input.keyboard.addKeys({
        'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN,
        'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT,
        'fire': Phaser.KeyCode.Z
    });

    keys.fire.onDown.add(function () {
        const SPEED = 10;
        const bullet = game.add.sprite(playerSprite.x, playerSprite.y, 'bullet');
        bullet.anchor.setTo(0.5, 0.5);
        bullet.scale.setTo(0.64);
        const direction = player.facing;
        bullet.rotation = Math.PI / 2 + Math.atan2(direction.y, direction.x);
        var updater;
        updater = function () {
            bullet.x += SPEED * direction.x;
            bullet.y += SPEED * direction.y;

            const position = {
                x: bullet.x / (2 * TILE_SIZE) - 0.5,
                y: bullet.y / (2 * TILE_SIZE) - 0.5
            };
            const halfTile = getHalfTile(position);
            let hit = false;
            getTilesAt(halfTile).forEach(function (tile) {
                const tileObj = map.getTile(tile.col, tile.row, 'wall');
                if (tileObj !== null) {
                    hit = true;
                    if (tileObj.index === 2)
                        map.removeTile(tile.col, tile.row, 'wall');
                }
            });
            if (hit) {
                updaters.splice(updaters.indexOf(updater), 1);
                bullet.destroy();
            }
        };
        updaters.push(updater);
    });
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
    const destinationOccupied = isHittingTheWall(destinationHalfTile);
    if (destinationOccupied) {
        var isTouchingTheWall;
        const movingHorizontally = direction.y === 0;
        if (movingHorizontally) {
            isTouchingTheWall = Math.abs(player.position.x - destinationHalfTile.x) <= 0.5
            if (!isTouchingTheWall)
                player.position.x = destinationHalfTile.x - 0.5 * direction.x;
        }
        else {
            isTouchingTheWall = Math.abs(player.position.y - destinationHalfTile.y) <= 0.5
            if (!isTouchingTheWall)
                player.position.y = destinationHalfTile.y - 0.5 * direction.y;
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

function isHittingTheWall(halfTile) {
    function isOccupied(row, col) {
        if (col < 0 || col > MAP_WIDTH - 1
            || row < 0 || row > MAP_HEIGHT - 1)
            throw 'Argument out of range: ' + row + ' ' + col;
        return map.hasTile(col, row, 'wall');
    }
    return getTilesAt(halfTile).some(tile => isOccupied(tile.row, tile.col));
}

function getTilesAt(halfTile) {
    const left = halfTile.x * 2,
        right = halfTile.x * 2 + 1,
        top = halfTile.y * 2,
        bottom = halfTile.y * 2 + 1;
    return [{ row: top, col: left }, { row: top, col: right },
    { row: bottom, col: left }, { row: bottom, col: right }];
}

function render() {
}