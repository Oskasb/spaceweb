


DataHub = function() {
	this.sources = {};
	this.configs = {};
};


DataHub.prototype.readSource = function(sourceId, config, data, clientId) {

	if (!this.sources[sourceId]) {
		 console.log("No Set Source", sourceId)
	} else {
		return this.sources[sourceId].fetch(config.method, config.args, data, clientId);
	}

};

DataHub.prototype.setConfig = function(config) {

	// var config = JSON.parse(jsonConfig);
	
		for (var key in config) {
			if (!this.configs[config.id]) {
				this.configs[config.id] = {};
				console.log("set config key", key)
			}

			if (typeof(config[key]) != 'string') {
				for (var dataType in config[key]) {
					this.configs[config.id][dataType] = config[key][dataType];
				}
			}
		}

};


DataHub.prototype.setSource = function(sourceId, object) {
	this.sources[sourceId] = object;
};



DataHub.prototype.handleMessage = function(id, data) {


};