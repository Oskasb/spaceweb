Clients = function() {
	this.clientCount = 0;
	this.clients = {};
	

	
};

Clients.prototype.registerConnection = function(socket, dataHub) {
	this.clientCount++;
	var client = new Client(this.clientCount, socket, this);
	client.setState(client.clientStates.CONNECTED);
	this.clients[client.id] = client;
	client.sendToClient({id:'clientConnected', data:{clientId:client.id, pieceData:dataHub.configs.piece_data}});
	client.sendToClient({id:'updateGameData', data:{clientId:client.id, gameData:dataHub.configs}});
	client.notifyDataFrame();
};

Clients.prototype.requestPlayer = function(data, clientId) {
	console.log("Request Player", JSON.stringify(data), clientId);
	if (data.name) {
		this.getClientById(clientId).setPlayerName(data.name);
	}
	
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