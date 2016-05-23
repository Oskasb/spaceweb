



var SetupServer = function() {

	require('./Shared/MATH');
	require('./Shared/GAME');
	require('./Shared/MODEL');
	require('./Shared/ACTIONS');


	require('./Shared/io/SocketMessages');

	
	require('./Server/io/ServerConnection');
	require('./Shared/io/SocketMessages');
	require('./Server/io/Clients');
	require('./Server/DataHub');
	require('./Server/Game/ServerWorld');
	require('./Server/Game/ServerGameMain');
	require('./Server/ServerMain');
	require('./Server/Game/ServerPlayer');
	require('./Server/io/ConfigLoader');
	
	var serverMain = new ServerMain();
	var WebSocketServer = require("ws").Server;
	var http = require("http");
	var express = require("express");
	var app = express();
	var port = process.env.PORT || 5000;

	var devMode = true;
	if (process.env.PORT) {
		devMode = false;
		console.log(process.env.PORT)
	}
	
	app.use(express.static(__dirname + "/"));

	var server = http.createServer(app);
	server.listen(port);

	console.log("http server listening on %d", port) ;

	var wss = new WebSocketServer({server: server});
	console.log("websocket server created");

	var configLoader = new ConfigLoader('./Server/json/');
	
	dataUpdated = function(configData) {
		serverMain.applyConfigData(configData, devMode);			
	};
	configLoader.setUpdateCallback(dataUpdated);
	
	serverMain.initServerMain(new DataHub());
	serverMain.initServerConnection(wss);

	serverMain.initConfigs(configLoader, 'server_setup', devMode);
};

SetupServer();