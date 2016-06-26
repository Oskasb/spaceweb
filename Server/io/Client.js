Client = function(seed, socket, clients) {
	this.id = 'client_'+seed;
	this.socket = socket;
    this.clients = clients;
	socket.clientId = this.id;
    this.dataBuffer = [];

    this.visiblePlayers = [];
    
    this.player;
    
    this.clientStates = {
        CONSTRUCTED:'CONSTRUCTED',
        DISCONNECTED:'DISCONNECTED',
        CONNECTED:'CONNECTED',
        PLAYING:'PLAYING'
    };
    this.setState(this.clientStates.CONSTRUCTED);
};

Client.prototype.setPlayerName = function(name) {
    this.player.piece.setName(name);
};

Client.prototype.setState = function(state) {
    console.log("Set Client state: ", state);
    this.state = this.clientStates[state];
};

Client.prototype.getState = function() {
    return this.state;
};

Client.prototype.attachPlayer = function(serverPlayer) {
    this.player = serverPlayer;
};


Client.prototype.setVisiblePlayers = function(visiblePlayers) {
    this.visiblePlayers.length = 0;
    for (var i = 0; i < visiblePlayers.length; i++) {
        this.visiblePlayers.push(visiblePlayers[i]);
    }
    
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
    if (!data) {
        return;
    }
    this.dataBuffer.push(data);
};


Client.prototype.broadcastToVisible = function(data) {
    for (var i = 0; i < this.visiblePlayers.length; i++) {
        this.visiblePlayers[i].client.sendToClient(data);
    }
    this.sendToClient(data);
};


Client.prototype.broadcastToAll = function(data) {
    if (!data) console.log("Bad broadcast all", data);
    this.clients.broadcastToAllClients(data);
};

