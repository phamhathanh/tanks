'use strict';

Array.prototype.remove = function (item) {
    this.splice(this.indexOf(item), 1);
}