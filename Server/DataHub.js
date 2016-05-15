


DataHub = function() {
	this.sources = {};
};


DataHub.prototype.readSource = function(sourceId, data) {

	if (!this.sources[sourceId]) {
		 console.log("No Set Source", sourceId)
	} else {
		return this.sources[sourceId].fetch(data.method, data.args);
	}


};

DataHub.prototype.setSource = function(sourceId, object) {
	this.sources[sourceId] = object;
};



DataHub.prototype.handleMessage = function(id, data) {


};