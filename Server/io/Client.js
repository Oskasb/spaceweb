Client = function(seed, socket, clients) {
	this.id = 'client_'+seed;
	this.socket = socket;
    this.clients = clients;
	socket.clientId = this.id;
};


Client.prototype.sendToClient = function(data) {
	this.socket.send(data);
};


Client.prototype.broadcastToAll = function(data) {
    this.clients.broadcastToAllClients(data);
};

Client.prototype.broadcastDisconnect = function(data) {
    this.clients.clientDisconnected(this.id);
    this.clients.broadcastToAllClients(data);
};

