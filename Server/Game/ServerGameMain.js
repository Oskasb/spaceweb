



ServerGameMain = function(clients) {
	this.simulationTime = new Date().getTime();
	this.timeDelta = 0;
	this.players = {};
	this.clients = clients;

};

ServerGameMain.prototype.initGame = function(playerUpdateCallback) {
	var _this=this;

	setInterval(function() {
		_this.tickGame(playerUpdateCallback);
	}, 200);


};


ServerGameMain.prototype.addPlayer = function(player) {

	this.players[player.id] = player;
};

ServerGameMain.prototype.playerDiconected = function(clientId) {
	var player = this.players['player_'+clientId];
	if (!player) return;

	player.piece.setState(GAME.ENUMS.PieceStates.REMOVED);
	var packet =  player.makePacket();

	delete this.players['player_'+clientId];

	for (var index in this.players) {
		this.players[index].client.sendToClient(packet);
	}

};


ServerGameMain.prototype.playerInput = function(data) {

	var player =  this.players[data.playerId];



	if (data.vector) {
		player.setInputVector(data.vector.fromX, data.vector.fromY, data.vector.toX,data.vector.toY);
	}

	if (data.fire) {
		player.setInputTrigger(true);

	//	var timeDelta = (new Date().getTime() - this.simulationTime) * 0.001;
	//	player.updatePlayer(this.timeDelta, this.simulationTime);
		var packet = player.makePacket();
		for (var index in this.players) {
			this.players[index].client.sendToClient(packet);
		}

		player.setInputTrigger(false);

	}

//	return player.makePacket();

};

ServerGameMain.prototype.registerPlayer = function(data) {

	if (this.players['player_'+data.clientId]) {
		console.log("Player Already Exists", data.clientId);
		return this.players['player_'+data.clientId].makePacket();
	};

	var player = new ServerPlayer(data.clientId, this.clients.getClientById(data.clientId));


	this.addPlayer(player);


	console.log("register player", JSON.stringify(data));

	return player.makePacket();

};

ServerGameMain.prototype.tickGame = function() {
	this.currentTime = new Date().getTime();

	this.timeDelta = (this.currentTime - this.simulationTime) * 0.001;

	for (var key in this.players) {
		this.players[key].updatePlayer(this.timeDelta, this.simulationTime);

		for (var index in this.players) {
			this.players[index].client.sendToClient(this.players[key].makePacket());
		}
	}

	this.simulationTime = this.currentTime;
};

