"use strict";

function Player(x, y, keys) {
    const player = this;

    const SPEED = 0.09;

    var facing = Direction.DOWN;
    var position = { x: x, y: y };

    var sprite = game.add.sprite(0, 0, 'player');
    sprite.anchor.setTo(0.5, 0.5);
    sprite.scale.setTo(0.64);
    sprite.bringToTop();
    sprite.tint = Math.random() * 0xffffff;
    updatePosition();

    function updatePosition() {
        sprite.x = 2 * TILE_SIZE * (position.x + 0.5);
        sprite.y = 2 * TILE_SIZE * (position.y + 0.5);
    };

    keys.fire.onDown.add(function () {
        const SPEED = 10;
        const bullet = game.add.sprite(sprite.x, sprite.y, 'bullet');
        bullet.anchor.setTo(0.5, 0.5);
        bullet.scale.setTo(0.64);
        const direction = facing;
        bullet.rotation = Math.PI / 2 + Math.atan2(direction.y, direction.x);
        var updater;
        updater = function () {
            bullet.x += SPEED * direction.x;
            bullet.y += SPEED * direction.y;

            const position = {
                x: bullet.x / (2 * TILE_SIZE) - 0.5,
                y: bullet.y / (2 * TILE_SIZE) - 0.5
            };
            let hit = false;
            getOccupyingTiles(position).forEach(function (tile) {
                const tileType = map.getTileType(tile.col, tile.row);
                if (tileType !== Map.Tile.NONE) {
                    hit = true;
                    if (tileType === Map.Tile.BRICK)
                        map.removeTile(tile.col, tile.row);
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
        if (facing !== direction) {
            face(direction);
            snap();
        }

        const destination = {
            x: position.x + (SPEED + 0.25) * direction.x,
            y: position.y + (SPEED + 0.25) * direction.y
        };
        const destinationOccupied = getOccupyingTiles(destination).some(tile => isOccupied(tile.row, tile.col));
        if (destinationOccupied) {
            const movingHorizontally = direction.y === 0;
            const destinationHalfTile = getHalfTile(destination);
            if (movingHorizontally) {
                const cannotAdvanceAnyFurther = Math.abs(position.x - destinationHalfTile.x) <= 0.5
                if (!cannotAdvanceAnyFurther)
                    position.x = destinationHalfTile.x - 0.5 * direction.x;
            }
            else {
                const cannotAdvanceAnyFurther = Math.abs(position.y - destinationHalfTile.y) <= 0.5
                if (!cannotAdvanceAnyFurther)
                    position.y = destinationHalfTile.y - 0.5 * direction.y;
            }
        }
        else {
            position.x += SPEED * direction.x;
            position.y += SPEED * direction.y;
        }

        updatePosition();
    }

    function face(direction) {
        facing = direction;
        sprite.rotation = -Math.PI / 2 + Math.atan2(direction.y, direction.x);
    };

    function snap() {
        const isHorizontal = facing.y === 0;
        if (isHorizontal)
            position.y = Math.round(position.y * 2) / 2;
        else
            position.x = Math.round(position.x * 2) / 2;
    }

    function getHalfTile(position, movingHorizontally) {
        return {
            x: Math.round(position.x * 2) / 2,
            y: Math.round(position.y * 2) / 2
        };
    }

    function isOccupied(row, col) {
        const occupier = map.getOccupier(col, row);
        return occupier !== Map.Tile.NONE && occupier !== player;
    }

    this.getOccupyingTiles = function () {
        return getOccupyingTiles(position);
    };

    function getOccupyingTiles(position) {
        const halfTile = getHalfTile(position);
        const left = halfTile.x * 2,
            right = halfTile.x * 2 + 1,
            top = halfTile.y * 2,
            bottom = halfTile.y * 2 + 1;
        return [{ row: top, col: left }, { row: top, col: right },
        { row: bottom, col: left }, { row: bottom, col: right }];
    }
}