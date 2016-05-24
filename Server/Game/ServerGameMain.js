
var SIMULATION_LOOP;
var NETWORK_LOOP;

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
	clearInterval(SIMULATION_LOOP);
    clearInterval(NETWORK_LOOP);
	this.setupLoop(config.setup.system.tickSimulationTime, config.setup.system.tickNetworkTime);
};

ServerGameMain.prototype.setupLoop = function(tickSim, tickNet) {
	var _this = this;
    MODEL.SimulationTime = tickSim * 0.001;
    MODEL.NetworkTime = tickNet * 0.001;
	console.log("Setup Loop: ", tickSim, tickNet);
    
    SIMULATION_LOOP = setInterval(function() {
		_this.tickGameSimulation();
	}, tickSim);

    NETWORK_LOOP = setInterval(function() {
        _this.tickGameNetwork();
    }, tickNet);
};

ServerGameMain.prototype.endServerGame = function() {
	console.log("End Server Game:");
	clearInterval(SERVER_LOOP);
    this.removeAllPlayers()
};

ServerGameMain.prototype.removeAllPlayers = function() {
    for (var key in this.clients.clients) {
       this.playerDiconected(key);
    }

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

ServerGameMain.prototype.tickGameSimulation = function() {
	this.currentTime = this.getNow();
    this.serverWorld.tickSimulationWorld(this.currentTime);
};

ServerGameMain.prototype.tickGameNetwork = function() {
    this.currentTime = this.getNow();
    this.serverWorld.tickNetworkWorld(this.currentTime);
};
