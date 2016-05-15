Clients = function() {
	this.clientCount = 0;


};

Clients.prototype.registerClient = function() {
	this.clientCount++;
	return {clientNumber:this.clientCount};
};

Clients.prototype.fetch = function(data) {


};