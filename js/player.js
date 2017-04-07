'use strict';

function Player(x, y, keys) {
    const player = this;

    const SPEED = 0.09;

    this.facing = Direction.DOWN;
    let position = { x: x, y: y };
    let isDead = false;
    let canFire = true;

    const sprite = game.add.sprite(0, 0, 'player');
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
        if (!canFire) return;
        canFire = false;
        const bullet = new Bullet(sprite.x, sprite.y, player);
        bullet.onDestroy(function () {
            canFire = true;
        });
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
        updatePosition();
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
        const destinationOccupied = getOccupyingTiles(destination)
                                        .some(tile => isOccupied(tile.row, tile.column));
        if (!destinationOccupied) {
            position.x += SPEED * direction.x;
            position.y += SPEED * direction.y;
            return;
        }
        
        const destinationTile = {
            x: Math.round(position.x * 2) / 2,
            y: Math.round(position.y * 2) / 2
        };
        const dimension = direction.y === 0 ? 'x' : 'y';
        const cannotAdvanceAnyFurther = Math.abs(position[dimension] - destinationTile[dimension]) <= 0.5
        if (!cannotAdvanceAnyFurther)
            position[dimension] = destinationTile[dimension] - 0.5 * direction[x];
    }

    function face(direction) {
        player.facing = direction;
        sprite.rotation = -Math.PI / 2 + Math.atan2(direction.y, direction.x);
    }

    function snap() {
        const dimension = player.facing.y === 0 ? 'y' : 'x';
        position[dimension] = Math.round(position[dimension] * 2) / 2;
    }

    function isOccupied(row, column) {
        const occupier = map.getOccupier(column, row);
        return occupier !== null && occupier !== player;
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
    return [{ row: top, column: left }, { row: top, column: right },
    { row: bottom, column: left }, { row: bottom, column: right }];
}