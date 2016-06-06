Client = function(seed, socket, clients) {
	this.id = 'client_'+seed;
	this.socket = socket;
    this.clients = clients;
	socket.clientId = this.id;
    this.dataBuffer = [];
};


Client.prototype.notifyDataFrame = function() {

//    for (var i = 0; i < this.dataBuffer.length; i++) {
    if (this.dataBuffer.length) {
//        console.log("Data Buffer Length; ", this.dataBuffer.length);
        this.socket.send(JSON.stringify(this.dataBuffer));
    }

//    }
    this.dataBuffer = [];
};


Client.prototype.sendToClient = function(data) {
    this.dataBuffer.push(data);
};


Client.prototype.broadcastToAll = function(data) {
    this.clients.broadcastToAllClients(data);
};

Client.prototype.broadcastDisconnect = function(data) {
    this.clients.clientDisconnected(this.id);
    this.clients.broadcastToAllClients(data);
};

