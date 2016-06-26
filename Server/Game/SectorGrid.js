SectorGrid = function() {

    this.minX = 0;
    this.maxX = 0;
    this.minY = 0;
    this.maxY = 0;
    this.sectorSize = 0;
    
    this.gridSectors = [];

    this.rows = [];
    
    
    this.gridData = null;

    this.worldConfigs = null;
    this.sectorConfigs = {};

    var handleWorldData = function(worldConfigs) {
        this.worldConfigs = worldConfigs;
        this.createSectorGrid();
    }.bind(this);

    var handleSectorData = function(sectorConfigs) {
        for (var key in sectorConfigs) {
            this.sectorConfigs[key] = sectorConfigs[key];
        }
        
        for (var i = 0; i < this.gridSectors.length; i++) {
            this.gridSectors[i].configsUpdated(sectorConfigs);
        }
        
    }.bind(this);
    
    this.dataHandlers = {
        WORLD_GRID:handleWorldData,
        GRID_SECTORS:handleSectorData
    }
};

SectorGrid.prototype.applyWorldConfig = function(config, dataType) {

    this.dataHandlers[dataType](config[dataType]);

    if (this.worldConfigs && this.sectorConfigs) {
        console.log("World Grid and Sectors ready");
    }
};


SectorGrid.prototype.createSectorGrid = function() {
    this.rows = [];

    this.gridSectors = [];
    this.gridData = this.worldConfigs.gridData;
    
    var size = this.gridData.sectorSize;
    this.sectorSize = size;
    
    this.minX = this.gridData.minX;
    this.minY = this.gridData.minY;
    
    for (var i = 0; i < this.gridData.rows; i++) {
        
        this.rows[i] = [];
        
        for (var j = 0; j < this.gridData.columns; j++) {
            
            var minX = this.minX + i * size;
            var maxX = this.minX + minX + size;
            
            var minY = this.minY + j * size;
            var maxY = this.minY + minY + size;
            
            var gridSector = new GridSector(minX, minY, maxX, maxY, i, j, this.gridSectors.length)
            
            this.gridSectors.push(gridSector);
            this.rows[i][j] = gridSector;
        }
    }
    
    this.maxX = maxX;
    this.maxY = maxY;
};


SectorGrid.prototype.getGridSectorForSpatial = function(spatial) {
    
    var row = Math.floor((spatial.pos.getX() - this.minX) / this.sectorSize);
    var column = Math.floor((spatial.pos.getY() - this.minY) / this.sectorSize)
    
    if (!this.rows[row]) {
        return false;
    }

    if (!this.rows[row][column]) {
        return false;
    }
    
    return this.rows[row][column];
};
