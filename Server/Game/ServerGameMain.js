
var SIMULATION_LOOP;
var NETWORK_LOOP;

ServerGameMain = function(clients, serverWorld) {
	this.serverWorld = serverWorld;
	this.startTime = process.hrtime();
	this.processTime = process.hrtime();
	this.currentTime = 0;
    this.tickComputeTime = 0;
    this.headroom = 0;
	this.simulationTime = 0;
	this.timeDelta = 0;
	this.clients = clients;
	this.pieceConfigs = {};

	this.healthData = [];
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
    MODEL.NetworkFPS = 1 / MODEL.NetworkTime;
    MODEL.SimulationFPS = 1 / MODEL.SimulationTime;
    
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
        _this.serverWorld.addBullet(piece, moduleData, _this.getNow());
	}

    function applyControl(piece, action, value, moduleData) {
        _this.serverWorld.applyControlModule(piece, moduleData, action, value);
    }


	this.actionHandlers = {
		fireCannon:fireCannon,
        applyControl:applyControl
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

	var client = this.clients.getClientById(data.clientId);
	if (client) {
		console.log("Client present, state:", client.getState());
		if (client.getState() == client.clientStates.CONNECTED) {

			var player = this.serverWorld.getPlayer(data.clientId);
			if (player) {
				console.log("Player already registered", data.clientId);
			} else {
				player = new ServerPlayer(data.clientId, this.clients.getClientById(data.clientId), this.simulationTime);
			}
			player.piece.setName(data.name);
			
			this.addPlayer(player);
			client.broadcastToAll(player.makePacket());
		} else {
			console.log("ERR - suspect client state:", client.getState(), data.clientId);
			return;
		}
	} else {
		console.log("ERR - No client for request:", data.clientId)
		return;
	}
	
//	console.log("register player", JSON.stringify(data));
	
};

ServerGameMain.prototype.getNow = function() {
	this.processTime = process.hrtime(this.startTime);
	return ((this.processTime[0]*1000) + (this.processTime[1]/1000000))*0.001;
};



ServerGameMain.prototype.tickGameSimulation = function() {
    this.headroom = this.getNow() - this.currentTime;
	this.currentTime = this.getNow();

    this.serverWorld.tickSimulationWorld(this.currentTime);
    this.tickComputeTime = this.getNow() - this.currentTime;
    if (Math.random() < 0.01) console.log("Load: ", this.headroom / this.tickComputeTime);

	this.healthData.push({time:this.currentTime, idle:this.headroom, busy:this.tickComputeTime, pieces:this.serverWorld.pieces.length,players:this.serverWorld.playerCount});
};

ServerGameMain.prototype.tickGameNetwork = function() {
//    this.currentTime = this.getNow();
    this.serverWorld.tickNetworkWorld(this.currentTime);

	var sendData = [];

	for (var i = 0; i < this.healthData.length; i++) {
		sendData.push(this.healthData[i]);
	}

	this.clients.broadcastToAllClients({id:"server_status", data:sendData});
	this.healthData = [];
};
