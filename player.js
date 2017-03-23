"use strict";

function Player(xPosition, yPosition, sprite) {
    var player = this;
    
    this.SPEED = 0.09;

    this.position = { x: xPosition, y: yPosition };
    this.sprite = sprite;

    this.facing = Direction.DOWN;
    
    this.face = function (direction) {
        player.facing = direction;
        player.sprite.rotation = -Math.PI / 2 + Math.atan2(direction.y, direction.x);
    };

    this.updatePosition = function () {
        player.sprite.x = 2*TILE_SIZE*(player.position.x + 0.5);
        player.sprite.y = 2*TILE_SIZE*(player.position.y + 0.5);
    };
}