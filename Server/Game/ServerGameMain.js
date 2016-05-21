

var SERVER_LOOP;

ServerGameMain = function(clients) {
	this.simulationTime = new Date().getTime();
	this.timeDelta = 0;
	this.players = {};
	this.clients = clients;
	this.pieceConfigs = {};
};



ServerGameMain.prototype.applyPieceConfigs = function(config) {
	console.log("Piece Configs: ", JSON.stringify(config));
	this.pieceConfigs = config.pieces;

	for (var key in this.players) {
		this.players[key].applyPieceConfig(this.pieceConfigs.player_ship);
	}
};


ServerGameMain.prototype.applySetupConfig = function(config) {
	console.log("Setup Loop: ", JSON.stringify(config));
	clearInterval(SERVER_LOOP);
	this.initGame(config.setup.system.tickTime);
};

ServerGameMain.prototype.initGame = function(tickDuration) {
	var _this=this;
	console.log("Setup Loop: ", tickDuration);
	SERVER_LOOP = setInterval(function() {
		_this.tickGame();
	}, tickDuration);
};


ServerGameMain.prototype.addPlayer = function(player) {
	player.applyPieceConfig(this.pieceConfigs.player_ship);
	this.players[player.id] = player;
};

ServerGameMain.prototype.playerDiconected = function(clientId) {
	var player = this.players['player_'+clientId];
	if (!player) return;

	player.piece.setState(GAME.ENUMS.PieceStates.REMOVED);
	var packet = player.makePacket();
	delete this.players['player_'+clientId];
	return packet;
};


ServerGameMain.prototype.playerInput = function(data) {

	var player =  this.players[data.playerId];

	if (data.vector) {
		player.setInputVector(data.vector.fromX, data.vector.fromY, data.vector.toX,data.vector.toY);
	}

	if (data.fire) {
		player.setInputTrigger(true);
		player.client.broadcastToAll(player.makePacket());
		player.setInputTrigger(false);
	}
};

ServerGameMain.prototype.registerPlayer = function(data) {

	if (this.players['player_'+data.clientId]) {
		console.log("Player Already Exists", data.clientId);
		return this.players['player_'+data.clientId].makePacket();
	}

	var player = new ServerPlayer(data.clientId, this.clients.getClientById(data.clientId), this.simulationTime);
	this.addPlayer(player);
	console.log("register player", JSON.stringify(data));
	return JSON.parse(player.makePacket());
};

ServerGameMain.prototype.tickGame = function() {
	this.currentTime = new Date().getTime();

	this.timeDelta = (this.currentTime - this.simulationTime) * 0.001;
	for (var key in this.players) {
		this.players[key].updatePlayer(this.timeDelta, this.simulationTime);
		this.players[key].client.broadcastToAll(this.players[key].makePacket());
	}
	this.simulationTime = this.currentTime;
};

