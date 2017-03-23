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
}