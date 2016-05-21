
var fs = require('fs');

ConfigLoader = function(path) {
    this.path = path;
    this.configs = {};
};

ConfigLoader.prototype.registerConfigUrl = function(configUrl) {
    console.log("Reg Config Url: ", configUrl);

    this.configs[configUrl] = JSON.parse(fs.readFileSync(this.path+configUrl+'.json', 'utf8'));
    
    console.log(JSON.stringify(this.configs[configUrl][0].setup));

};


ConfigLoader.prototype.readConfig = function(configUrl) {
    return this.configs[configUrl];
};

