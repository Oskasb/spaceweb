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