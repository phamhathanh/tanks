"use strict";

function Bullet(x, y, owner) {
    const bullet = this;
    const direction = owner.facing;
    
    const SPEED = 10;

    var position = { x: x, y: y };
    var sprite = game.add.sprite(x, y, 'bullet');
    sprite.anchor.setTo(0.5, 0.5);
    sprite.scale.setTo(0.64);
    sprite.rotation = Math.PI / 2 + Math.atan2(direction.y, direction.x);

    function update() {
        sprite.x += SPEED * direction.x;
        sprite.y += SPEED * direction.y;
        
        const position = {
            x: sprite.x / (2 * TILE_SIZE) - 0.5,
            y: sprite.y / (2 * TILE_SIZE) - 0.5
        };
        let hit = false;
        getOccupyingTiles(position).forEach(tile => {
            const occupier = map.getOccupier(tile.col, tile.row);
            if (occupier !== Map.Tile.NONE && occupier !== owner) {
                hit = true;
                if (occupier === Map.Tile.BRICK)
                    map.removeTile(tile.col, tile.row);
                    // Implement tile.destroy();

                if (players.includes(occupier)) {
                    occupier.destroy();
                }
            }
        });
        if (hit) {
            updaters.splice(updaters.indexOf(update), 1);
            sprite.destroy();
        }
    }
    updaters.push(update);
}