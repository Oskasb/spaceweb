Clients = function() {
	this.clientCount = 0;
	this.clients = {};
	

	
};

Clients.prototype.registerConnection = function(socket) {
	this.clientCount++;
	var client = new Client(this.clientCount, socket, this);
	client.setState(client.clientStates.CONNECTED);
	this.clients[client.id] = client;
	client.sendToClient({id:'clientConnected', data:{clientId:client.id}});
	client.notifyDataFrame();
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
	if (!packet) console.log("Bad DC?", clientId);
    this.broadcastToAllClients(packet);
};