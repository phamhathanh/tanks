'use strict';

Array.prototype.remove = function (item) {
    this.splice(this.indexOf(item), 1);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}