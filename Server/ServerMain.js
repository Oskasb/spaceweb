

ServerMain = function() {
	console.log("Construct Server Main");
	this.serverConnection = new ServerConnection();

};

ServerMain.prototype.initServerConnection = function(wss) {
	this.serverConnection.setupSocket(wss)

};

ServerMain.prototype.initServerMain = function() {
	console.log("Init Server Main")
};



