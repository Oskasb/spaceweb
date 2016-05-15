
ServerConnection = function() {
	this.socketMessages = new SocketMessages();
};

ServerConnection.prototype.setupSocket = function(wss, dataHub, clients, removePlayerCallback) {

	var messages = this.socketMessages.messages;

	wss.on("connection", function(ws) {

		var sends = 0;



		console.log("websocket connection open");

		var respond = function(msg) {
			ws.send(msg)
		};

		clients.registerConnection(ws);

		ws.on("message", function(message) {
			console.log("JSON", message);
			if (typeof(message) != 'string') {
				console.log("not JSON", message);
				var msg = message;
			} else {
				var msg = JSON.parse(message);
			}


			if (messages[msg.id]) {
				messages[msg.id].call(respond, msg.data, dataHub);
			} else {
				console.log("undefined SocketMessage ", message);
			}

			sends++;
		});


		ws.on("close", function() {
			removePlayerCallback(ws.clientId);
			clients.clientDisconnected(ws.clientId);
			console.log("websocket connection close");

		})
	});

	console.log("Init Server Connection")
};

ServerConnection.prototype.broadcast = function(message, responseCallback) {

};
