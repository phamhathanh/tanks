"use strict";

function Player(x, y, keys) {
    var player = this;

    this.SPEED = 0.09;

    this.position = { x: x, y: y };
    var sprite = game.add.sprite(0, 0, 'player');
    sprite.anchor.setTo(0.5, 0.5);
    sprite.scale.setTo(0.64);
    sprite.bringToTop();
    sprite.tint = Math.random() * 0xffffff;
    updatePosition();

    this.facing = Direction.DOWN;

    function face(direction) {
        player.facing = direction;
        sprite.rotation = -Math.PI / 2 + Math.atan2(direction.y, direction.x);
    };

    function updatePosition() {
        sprite.x = 2 * TILE_SIZE * (player.position.x + 0.5);
        sprite.y = 2 * TILE_SIZE * (player.position.y + 0.5);
    };

    keys.fire.onDown.add(function () {
        const SPEED = 10;
        const bullet = game.add.sprite(sprite.x, sprite.y, 'bullet');
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

    function updater() {
        if (keys.left.isDown)
            move(Direction.LEFT);
        else if (keys.right.isDown)
            move(Direction.RIGHT);
        else if (keys.up.isDown)
            move(Direction.UP);
        else if (keys.down.isDown)
            move(Direction.DOWN);
    }
    updaters.push(updater);

    function move(direction) {
        if (player.facing !== direction) {
            face(direction);
            snap();
        }

        const destination = {
            x: player.position.x + (player.SPEED + 0.25) * direction.x,
            y: player.position.y + (player.SPEED + 0.25) * direction.y
        };
        const destinationHalfTile = getHalfTile(destination);
        const destinationOccupied =  getTilesAt(destinationHalfTile).some(tile => isOccupied(tile.row, tile.col));
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

        updatePosition();
    }

    function snap() {
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
    
    function isOccupied(row, col) {
        if (col < 0 || col > MAP_WIDTH - 1
            || row < 0 || row > MAP_HEIGHT - 1)
            throw 'Argument out of range: ' + row + ' ' + col;
        if (map.hasTile(col, row, 'wall'))
            return true;
        for (let i = 0; i < players.length; i++) {
            const _player = players[i];
            if (_player === player)
                continue;
            const occupied = _player.getOccupyingTiles().some(tile => (tile.row === row && tile.col === col));
            if (occupied)
                return true;
        }
        return false;
    }

    this.getOccupyingTiles = function () {
        return getTilesAt(getHalfTile(player.position));
    };

    function getTilesAt(halfTile) {
        const left = halfTile.x * 2,
            right = halfTile.x * 2 + 1,
            top = halfTile.y * 2,
            bottom = halfTile.y * 2 + 1;
        return [{ row: top, col: left }, { row: top, col: right },
        { row: bottom, col: left }, { row: bottom, col: right }];
    }
}