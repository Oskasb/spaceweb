
ServerMain = function() {

	console.log("Construct Server Main");


	this.configLoader;
	this.serverConnection = new ServerConnection();
	this.serverWorld = new ServerWorld();
	this.clients = new Clients();
	this.serverGameMain = new ServerGameMain(this.clients, this.serverWorld);

	

	var _this = this;
	function serverSetup(config) {
		_this.serverGameMain.applySetupConfig(config);
	}

	function configFiles(config) {
		_this.configLoader.applyFileConfigs(config);
	}

	function pieceData(config) {
		_this.serverGameMain.applyPieceConfigs(config);
	}
	
	this.dataHandlers = {
		server_setup:serverSetup,
		config_files:configFiles,
		piece_data:pieceData
	};


	var DataSource = function(id, system) {
		this.id = id;
		this.system = system
	};

	DataSource.prototype.fetch = function(method, args, data) {
		if (this.system[method]) {
			return JSON.stringify({id:this.id, data:this.system[method](data)});
		} else {
			return JSON.stringify({id:this.id, data:"No Data to fetch for "+this.id});
		}
	};

	var Ping = function() {

	};

	Ping.prototype.ping = function() {
		return 'ping';
	};

	this.game = {
		'ping':  new DataSource('ping', new Ping()),
		'ServerWorld' : new DataSource('ServerWorld', this.serverWorld),
		'InputFire' : new DataSource('InputFire', this.serverGameMain),
		'InputVector' : new DataSource('InputVector', this.serverGameMain),
		'ServerGameMain' : new DataSource('RegisterPlayer', this.serverGameMain),
		'Clients' : new DataSource('RegisterClient', this.clients)
	};

};

ServerMain.prototype.initServerConnection = function(wss) {
	var serverGameMain = this.serverGameMain;

	var removePlayerCallback = function(clientId) {
		return serverGameMain.playerDiconected(clientId);
	};

	this.serverConnection.setupSocket(wss, this.dataHub, this.clients, removePlayerCallback);
	this.serverGameMain.initGame();
};

ServerMain.prototype.initServerMain = function(dataHub) {
	this.dataHub = dataHub;

	for (var key in this.game) {
		this.dataHub.setSource(key, this.game[key]);
	}
};

ServerMain.prototype.shutdownServerMain = function() {
	this.serverConnection.shutdownSocket();
	this.serverGameMain.endServerGame();
};

ServerMain.prototype.applyConfigData = function(updatedData) {

	if (this.dataHandlers[updatedData.id]) {
		this.dataHandlers[updatedData.id](updatedData)
	} else {
		console.log("No handler fo config key: ", updatedData.id)
	}
};


ServerMain.prototype.initConfigs = function(configLoader, sourceUrl, devMode) {
	this.configLoader = configLoader;
	this.configLoader.registerConfigUrl(sourceUrl, devMode);
};

