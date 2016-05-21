
var fs = require('fs');

ConfigLoader = function(path) {
    this.path = path;
    this.configs = {};
    this.fileWatch = true;
};

ConfigLoader.prototype.setUpdateCallback = function(dataUpdated) {
    this.updateCallback = dataUpdated;
};

ConfigLoader.prototype.applyFileConfigs = function(configs) {

    for (var i = 0; i < configs.loadFiles.length; i++) {
        this.registerConfigUrl(configs.loadFiles[i])
    }

    this.fileWatch = configs.watchFiles;
};


ConfigLoader.prototype.registerConfigUrl = function(configUrl) {
    console.log("Reg Config Url: ", configUrl);
    var dataUpdated = this.updateCallback;
    var path = this.path;
    var data;
    var _this = this;

    try {
        data = JSON.parse(fs.readFileSync(path+configUrl+'.json', 'utf8'));
        for (var i = 0; i < data.length; i++) {
            _this.configs[data[i].id] = data[i];
            console.log("Config Updated:", data[i].id);
            dataUpdated(data[i]);
        }

    } catch (e) {
        console.error("json parse error", e);
    }


    function watchCallback(editType, file) {
        
        if (editType == 'change') {
            try {
                data = JSON.parse(fs.readFileSync(path+file, 'utf8'));
                for (var i = 0; i < data.length; i++) {
                    _this.configs[data[i].id] = data[i];
                    console.log("Config Updated:", data[i].id);
                    dataUpdated(data[i]);
                }

            } catch (e) {
                console.error("json parse error", e);
            }
        }

    }
    
    this.watchConfig(configUrl, watchCallback);
};


ConfigLoader.prototype.watchConfig = function(filename, callback) {
    fs.watch(this.path+filename+'.json', callback);
};

