

var SERVER_LOOP;

ServerGameMain = function(clients, serverWorld) {
	this.serverWorld = serverWorld;
	this.simulationTime = new Date().getTime();
	this.timeDelta = 0;
	this.clients = clients;
	this.pieceConfigs = {};
};


ServerGameMain.prototype.applyPieceConfigs = function(config) {
	console.log("Piece Configs: ", JSON.stringify(config));
	this.pieceConfigs = config.pieces;
	this.serverWorld.pieceConfigsUpdated(this.pieceConfigs);
};


ServerGameMain.prototype.applySetupConfig = function(config) {
	console.log("Setup Loop: ", JSON.stringify(config));
	clearInterval(SERVER_LOOP);
	this.setupLoop(config.setup.system.tickTime);
};

ServerGameMain.prototype.setupLoop = function(tickDuration) {
	var _this=this;
	this.serverWorld.initWorld();
	console.log("Setup Loop: ", tickDuration);
	SERVER_LOOP = setInterval(function() {
		_this.tickGame();
	}, tickDuration);
};

ServerGameMain.prototype.initGame = function() {

	var _this = this;

	function fireCannon(piece, action, value, moduleData) {
		_this.serverWorld.addBullet(piece, moduleData);
	}

	this.actionHandlers = {
		fireCannon:fireCannon
	};
	
	this.serverWorld.initWorld();
};


ServerGameMain.prototype.addPlayer = function(player) {
	player.applyPieceConfig(this.pieceConfigs.player_ship);
	this.serverWorld.addPlayer(player);
};

ServerGameMain.prototype.playerDiconected = function(clientId) {
	var player = this.serverWorld.getPlayer(clientId);
	if (!player) return;

	player.piece.setState(GAME.ENUMS.PieceStates.REMOVED);
	var packet = player.makePacket();
	this.serverWorld.removePlayer(player.id);
	return packet;
};


ServerGameMain.prototype.playerInput = function(data) {
	var player =  this.serverWorld.getPlayer(data.playerId);
	player.processPlayerInputUpdate(data, this.actionHandlers);
};

ServerGameMain.prototype.registerPlayer = function(data) {

	var player = new ServerPlayer(data.clientId, this.clients.getClientById(data.clientId), this.simulationTime);
	this.addPlayer(player);
	console.log("register player", JSON.stringify(data));
	return JSON.parse(player.makePacket());
};

ServerGameMain.prototype.tickGame = function() {
	this.currentTime = new Date().getTime() * 0.001;

	this.timeDelta = (this.currentTime - this.simulationTime);
	this.serverWorld.tickWorld(this.timeDelta);
	this.simulationTime = this.currentTime;
};

