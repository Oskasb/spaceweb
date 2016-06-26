GridSector = function(minX, minY, maxX, maxY, row, column, gridIndex) {

    this.sectorConfig = null;

    this.sectorData = {
        minX : minX,
        maxX : maxX,
        minY : minY,
        maxY : maxY,
        config:this.sectorConfig
    };

    this.row = row;
    this.column = column;
    this.gridIndex = gridIndex;
    
    this.activeSectorPlayers = [];
    
};


GridSector.prototype.notifyPlayerLeave = function(player) {
    this.activeSectorPlayers.splice(this.activeSectorPlayers.indexOf(player), 1);
};

GridSector.prototype.notifyPlayerEnter = function(player) {
    this.activeSectorPlayers.push(player);
};

GridSector.prototype.sectorBasedBroadcast = function(packet) {

    
};


GridSector.prototype.configsUpdated = function(sectorConfigs) {

    this.sectorConfig = sectorConfigs.data[Math.floor(Math.random()*sectorConfigs.data.length)]

    this.sectorData.sectorConfig = this.sectorConfig;
    
};






