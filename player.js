"use strict";

function Player(x, y, keys) {
    const player = this;

    const SPEED = 0.09;

    this.facing = Direction.DOWN;
    var position = { x: x, y: y };
    var isDead = false;

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
        if (isDead) return;
        new Bullet(sprite.x, sprite.y, player);
    });

    function update() {
        if (isDead) return;
        if (keys.left.isDown)
            move(Direction.LEFT);
        else if (keys.right.isDown)
            move(Direction.RIGHT);
        else if (keys.up.isDown)
            move(Direction.UP);
        else if (keys.down.isDown)
            move(Direction.DOWN);
    }
    updaters.push(update);

    function move(direction) {
        if (player.facing !== direction) {
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
            if (movingHorizontally) {
                const destinationTileX = Math.round(position.x * 2) / 2;
                const cannotAdvanceAnyFurther = Math.abs(position.x - destinationTileX) <= 0.5
                if (!cannotAdvanceAnyFurther)
                    position.x = destinationTileX - 0.5 * direction.x;
            }
            else {
                const destinationTileY = Math.round(position.y * 2) / 2;
                const cannotAdvanceAnyFurther = Math.abs(position.y - destinationTileY) <= 0.5
                if (!cannotAdvanceAnyFurther)
                    position.y = destinationTileY - 0.5 * direction.y;
            }
        }
        else {
            position.x += SPEED * direction.x;
            position.y += SPEED * direction.y;
        }

        updatePosition();
    }

    function face(direction) {
        player.facing = direction;
        sprite.rotation = -Math.PI / 2 + Math.atan2(direction.y, direction.x);
    };

    function snap() {
        const isHorizontal = player.facing.y === 0;
        if (isHorizontal)
            position.y = Math.round(position.y * 2) / 2;
        else
            position.x = Math.round(position.x * 2) / 2;
    }

    function isOccupied(row, col) {
        const occupier = map.getOccupier(col, row);
        return occupier !== Map.Tile.NONE && occupier !== player;
    }

    this.getOccupyingTiles = function () {
        return getOccupyingTiles(position);
    };

    this.destroy = function () {
        sprite.destroy();
        players.remove(player);
        isDead = true;
    };
}

function getOccupyingTiles(position) {
    const tileX = Math.round(position.x * 2) / 2,
        tileY = Math.round(position.y * 2) / 2,
        left = tileX * 2,
        right = tileX * 2 + 1,
        top = tileY * 2,
        bottom = tileY * 2 + 1;
    return [{ row: top, col: left }, { row: top, col: right },
    { row: bottom, col: left }, { row: bottom, col: right }];
}