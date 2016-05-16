



var SetupServer = function() {

	require('./Server/io/ServerConnection');
	require('./Shared/io/SocketMessages');
	require('./Server/io/Clients');
	require('./Server/DataHub');
	require('./Server/Game/ServerWorld');
	require('./Server/Game/ServerGameMain');
	require('./Server/ServerMain');
	require('./Server/Game/ServerPlayer');

	var serverMain = new ServerMain();

	var WebSocketServer = require("ws").Server;
	var http = require("http");
	var express = require("express");
	var app = express();
	var port = process.env.PORT || 5000;

	app.use(express.static(__dirname + "/"));

	var server = http.createServer(app);
	server.listen(port);

	console.log("http server listening on %d", port) ;

	var wss = new WebSocketServer({server: server});
	console.log("websocket server created");



	serverMain.initServerMain(new DataHub());
	serverMain.initServerConnection(wss);

};

SetupServer();