"use strict";

function Player(xPosition, yPosition) {
    var player = this;
    
    this.SPEED = 0.12;

    this.position = { x: xPosition, y: yPosition };
    this.facing = Direction.DOWN;
    this.velocity = { x: 0, y: 0 };
    
    this.fireLength = 1;
    this.bombs = {
        normal: 2,
        fire: 0
    };
    this.punch = 0;
    // TODO: group with bombs.

    this.face = function (direction) {
        player.facing = direction;
        player.sprite.rotation = -Math.PI / 2 + Math.atan2(direction.y, direction.x);
    };
}