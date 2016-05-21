var Client = function(seed, socket, clients) {
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


Clients = function() {
	this.clientCount = 0;
	this.clients = {};
};

Clients.prototype.registerConnection = function(socket) {
	this.clientCount++;
	var client = new Client(this.clientCount, socket, this);
	this.clients[client.id] = client;
	client.sendToClient(JSON.stringify({id:'clientConnected', data:{clientId:client.id}}));

};

Clients.prototype.requestPlayer = function(data) {
	console.log("Request Player", JSON.stringify(data));

};

Clients.prototype.broadcastToAllClients = function(data) {
    for (var key in this.clients) {
        this.clients[key].sendToClient(data);
    }
};

Clients.prototype.registerClient = function(data) {
	return data;
};

Clients.prototype.getClientById = function(id) {
	return this.clients[id];

};

Clients.prototype.clientDisconnected = function(clientId, packet) {
	delete this.clients[clientId];
    this.broadcastToAllClients(packet);
};