

ServerMain = function() {
	console.log("Construct Server Main");
	this.serverConnection = new ServerConnection();
	this.serverWorld = new ServerWorld();
	this.clients = new Clients();
	this.serverGameMain = new ServerGameMain(this.clients);

	this.serverWorld.initWorld();

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
		'InputVector' : new DataSource('InputVector', this.serverGameMain),
		'ServerGameMain' : new DataSource('RegisterPlayer', this.serverGameMain),
		'Clients' : new DataSource('RegisterClient', this.clients)
	};

};

ServerMain.prototype.initServerConnection = function(wss) {
	var serverGameMain = this.serverGameMain;

	var removePlayerCallback = function(clientId) {
		serverGameMain.playerDicconected(clientId);
	};

	this.serverConnection.setupSocket(wss, this.dataHub, this.clients, removePlayerCallback);


	var playerUpdateCallback = function(playerPacket) {

	};

	this.serverGameMain.initGame(playerUpdateCallback);
};

ServerMain.prototype.initServerMain = function(dataHub) {
	this.dataHub = dataHub;

	for (var key in this.game) {
		this.dataHub.setSource(key, this.game[key]);
	}



};



