GridSector = function(minX, minY, maxX, maxY, row, column, gridIndex) {

    this.sectorConfig = null;

    this.sectorData = {
        minX : minX,
        maxX : maxX,
        minY : minY,
        maxY : maxY,
        config:this.sectorConfig,
        presentPlayers:0
    };

    this.row = row;
    this.column = column;
    this.gridIndex = gridIndex;
    
    this.activeSectorPlayers = [];
    
    this.neighborSectors = [];

    this.visiblePlayers = [];

};

GridSector.prototype.addNeighborSector = function(neightborSector) {

    this.neighborSectors.push(neightborSector);
};


GridSector.prototype.notifyPlayerLeave = function(player) {
    
    this.activeSectorPlayers.splice(this.activeSectorPlayers.indexOf(player), 1);
    this.sectorData.presentPlayers = this.activeSectorPlayers.length;
};

GridSector.prototype.getVisiblePlayers = function(store) {

    for (var i = 0; i < this.neighborSectors.length; i++) {
        for (var j = 0; j < this.neighborSectors[i].activeSectorPlayers.length; j++) {
            if (store.indexOf(this.neighborSectors[i].activeSectorPlayers[j]) == -1) {
                store.push(this.neighborSectors[i].activeSectorPlayers[j]);
            }

        }
    }

    for (var j = 0; j < this.activeSectorPlayers.length; j++) {
        if (store.indexOf(this.activeSectorPlayers[j]) == -1) {
            store.push(this.activeSectorPlayers[j]);
        }
    }
    
};

GridSector.prototype.notifyPlayerEnter = function(player) {
    
    this.activeSectorPlayers.push(player);
    this.sectorData.presentPlayers = this.activeSectorPlayers.length;
};


GridSector.prototype.sendPacketToVisiblePlayers = function(packet, recipients) {

    for (var i = 0; i < recipients.length; i++) {
        recipients[i].client.sendToClient(packet);
    }
};

GridSector.prototype.sectorBasedBroadcast = function(packet, recipients) {

    this.getVisiblePlayers(recipients);
    this.sendPacketToVisiblePlayers(packet, recipients);
};


GridSector.prototype.configsUpdated = function(sectorConfigs) {

    this.sectorConfig = sectorConfigs.data[Math.floor(Math.random()*sectorConfigs.data.length)]
    this.sectorData.sectorConfig = this.sectorConfig;
};






