var Player = function(clientId, client) {
	this.id = 'player_'+clientId;
	this.client = client;
	this.clientId = clientId;

	this.spatial = {
		pos : [Math.random()*100, Math.random()*100, 100],
		vel : [Math.random()*0.1, Math.random()*0.1, 0]
	};


	this.creationTime = new Date().getTime();
	this.serverTime = this.creationTime;
	this.timeDelta = 0;
};

Player.prototype.makePacket = function() {
	return {id:"playerUpdate", data:{playerId:this.id, spatial:this.spatial, timeDelta:this.timeDelta}};
};

Player.prototype.updatePlayerSpatial = function(dt) {
	this.timeDelta = dt;
	this.spatial.pos[0] += this.spatial.vel[0] * 90 * dt;
	this.spatial.pos[1] += this.spatial.vel[1] * 90 * dt;
};



Player.prototype.updatePlayer = function(dt, serverTime) {
	this.timeDelta = dt;
	this.serverTime = serverTime;
	this.updatePlayerSpatial(dt);





	if (this.spatial.pos[0] < 0 || this.spatial.pos[0] > 100 || this.spatial.pos[1] < 0 || this.spatial.pos[1] > 100) {
		console.log("Outod bounds")

		this.spatial.vel[0] = (Math.random()-0.5);
		this.spatial.vel[1] = (Math.random()-0.5);

		this.spatial.pos[0] = Math.random()*100;
		this.spatial.pos[1] = Math.random()*100;
	}

	this.client.sendToClient(this.makePacket());

};



ServerGameMain = function(clients) {
	this.serverTime = new Date().getTime();
	this.timeDelta = 0;
	this.players = {};
	this.clients = clients;

};

ServerGameMain.prototype.initGame = function(playerUpdateCallback) {
	var _this=this;

	setInterval(function() {
		_this.tickGame(playerUpdateCallback);
	}, 100);


};


ServerGameMain.prototype.addPlayer = function(player) {
	this.players[player.id] = player;
};

ServerGameMain.prototype.playerDicconected = function(clientId) {
	delete this.players['player_'+clientId];
};


ServerGameMain.prototype.registerPlayer = function(data) {

	var player = new Player(data.clientId, this.clients.getClientById(data.clientId));

	this.addPlayer(player);

	console.log("register player", JSON.stringify(data));

	return player.makePacket();

};

ServerGameMain.prototype.tickGame = function(playerUpdateCallback) {
	this.currentTime = new Date().getTime();

	this.timeDelta = (this.currentTime - this.serverTime) * 0.001;

	for (var key in this.players) {
		this.players[key].updatePlayer(this.timeDelta, this.serverTime, playerUpdateCallback);
	}

	this.serverTime = this.currentTime;
};

