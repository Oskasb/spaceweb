

ServerMain = function() {
	console.log("Construct Server Main");
	this.serverConnection = new ServerConnection();
	this.serverWorld = new ServerWorld();
	this.clients = new Clients();

	this.serverWorld.initWorld();

	var DataSource = function(id, system) {
		this.id = id;
		this.system = system
	};

	DataSource.prototype.fetch = function(method, args) {
		if (this.system[method]) {
			return JSON.stringify({id:this.id, data:this.system[method](args)});
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
		'Clients' : new DataSource('Clients', this.clients)
	};

}

ServerMain.prototype.initServerConnection = function(wss) {
	this.serverConnection.setupSocket(wss, this.dataHub)

};

ServerMain.prototype.initServerMain = function(dataHub) {
	this.dataHub = dataHub;

	for (var key in this.game) {
		this.dataHub.setSource(key, this.game[key]);
	}

};



