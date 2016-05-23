

var SERVER_LOOP;

ServerGameMain = function(clients, serverWorld) {
	this.serverWorld = serverWorld;
	this.startTime = process.hrtime();
	this.processTime = process.hrtime();
	this.currentTime = 0;
	this.simulationTime = 0;
	this.timeDelta = 0;
	this.clients = clients;
	this.pieceConfigs = {};
};


ServerGameMain.prototype.applyPieceConfigs = function(config) {
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
	console.log("Setup Loop: ", tickDuration);
	SERVER_LOOP = setInterval(function() {
		_this.tickGame();
	}, tickDuration);
};

ServerGameMain.prototype.initGame = function() {
	var _this = this;

	function fireCannon(piece, action, value, moduleData) {

		var now = _this.getNow();
		var timeDelta = _this.timeDelta - (now - _this.simulationTime);
		
		_this.serverWorld.addBullet(piece, moduleData, now, timeDelta, _this.timeDelta);
	}

	this.actionHandlers = {
		fireCannon:fireCannon
	};
	
	this.serverWorld.initWorld(this.clients);
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

ServerGameMain.prototype.getNow = function() {
	this.processTime = process.hrtime(this.startTime);
	return ((this.processTime[0]*1000) + (this.processTime[1]/1000000))*0.001;
};

ServerGameMain.prototype.tickGame = function() {
	this.currentTime = this.getNow();
	this.timeDelta = (this.currentTime - this.simulationTime);
	this.serverWorld.tickWorld(this.timeDelta);
	this.simulationTime = this.currentTime;
};

