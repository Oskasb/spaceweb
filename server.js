
var fs = require('fs');
var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");

var path = './';
var servers = [];

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

var wss = new WebSocketServer({server: server});

var SetupServer = function() {

    console.log("http server listening on %d", port) ;

    console.log("websocket server created");

	function start() {
		servers.push(initServerMain(devMode));
	}

	var files = [
		'Shared/MATH',
		'Shared/GAME',
		'Shared/MODEL',
		'Shared/ACTIONS',
		'Shared/io/SocketMessages',
		'Server/io/ServerConnection',
		'Shared/io/Message',
		'Shared/io/SocketMessages',
		'Server/io/Client',
		'Server/io/Clients',
		'Server/DataHub',
		'Server/Game/ServerWorld',
		'Server/Game/ServerGameMain',
        'Server/Game/ServerPieceProcessor',
		'Server/ServerMain',
		'Server/Game/ServerPlayer',
		'Server/io/ConfigLoader'
	];


    var attachFile = function(file) {
        require(path+file);
    };

	for (var i = 0; i < files.length; i++) {
        attachFile(files[i]);
	}

	start();


};


var initServerMain = function(devMode) {

    var serverMain = new ServerMain();
	var configLoader = new ConfigLoader('./Server/json/');

	dataUpdated = function(configData) {
		serverMain.applyConfigData(configData, devMode);
	};

	configLoader.setUpdateCallback(dataUpdated);
	serverMain.initServerMain(new DataHub());
	serverMain.initServerConnection(wss);
	serverMain.initConfigs(configLoader, 'server_setup', devMode);
	return serverMain;
};


SetupServer();

