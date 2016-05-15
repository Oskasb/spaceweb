
ServerConnection = function() {
	this.socketMessages = new SocketMessages();
};

ServerConnection.prototype.setupSocket = function(wss, dataHub) {

	var messages = this.socketMessages.messages;

	wss.on("connection", function(ws) {

		var sends = 0;

		console.log("websocket connection open");

		var respond = function(msg) {
			ws.send(msg)
		};


		ws.on("message", function(message) {

			if (messages[message]) {
				messages[message].call(respond, dataHub);
			} else {
				console.log("undefined SocketMessage ", message);
			}
		 /*
			if (message == "ping") {
				setTimeout(function() {
					respond("ping");
				}, 100 * Math.random())
			}

			if (message == "fetchWorld") {
				console.log("Got fetchWorld")
				setTimeout(function() {
					respond("fetchWorld");
				}, 100 * Math.random())
			}
         */
			sends++;
		});


		ws.on("close", function() {
			console.log("websocket connection close");

		})
	});

	console.log("Init Server Connection")
};

ServerConnection.prototype.send = function(message, responseCallback) {

};
