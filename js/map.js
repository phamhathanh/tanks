'use strict';

function Map() {
    const map = this;

    const tileMap = game.add.tilemap('map');
    tileMap.addTilesetImage('floor', 'floor');
    tileMap.addTilesetImage('wall', 'wall');
    tileMap.addTilesetImage('block', 'block');

    tileMap.layers.forEach(function (layer, index) {
        tileMap.createLayer(index);
    });


    Map.Tile = {
        NONE: { id: null },
        CONCRETE: { id: 1 },
        BRICK: { id: 2 }
    };

    this.getTileType = function (column, row) {
        const tile = tileMap.getTile(column, row, 'wall');
        if (tile === null)
            return Map.Tile.NONE;
        return Object.values(Map.Tile).find(tileType => tileType.id === tile.index);
    };

    this.removeTile = function (column, row) {
        tileMap.removeTile(column, row, 'wall');
    };

    this.getOccupier = function (column, row) {
        if (column < 0 || column > MAP_WIDTH - 1
            || row < 0 || row > MAP_HEIGHT - 1)
            throw 'Argument out of range: ' + column + ' ' + row;

        const occupier = players.find(player =>
            player.getOccupyingTiles().some(tile =>
                tile.row === row && tile.col === column)
        );
        if (occupier !== undefined)
            return occupier;

        return map.getTileType(column, row);
    };
}