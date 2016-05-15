var Client = function(seed, socket) {
	this.id = 'client_'+seed;
	this.socket = socket;
	socket.clientId = this.id;
};


Client.prototype.sendToClient = function(data) {
	this.socket.send(JSON.stringify(data));
};



Clients = function() {
	this.clientCount = 0;
	this.clients = {};
};

Clients.prototype.registerConnection = function(socket) {
	this.clientCount++;
	var client = new Client(this.clientCount, socket);
	this.clients[client.id] = client;
	client.sendToClient({id:'clientConnected', data:{clientId:client.id}});

};

Clients.prototype.registerClient = function(data) {
	return data;
};

Clients.prototype.getClientById = function(id) {
	return this.clients[id];

};

Clients.prototype.clientDisconnected = function(clientId) {
	delete this.clients[clientId];
};