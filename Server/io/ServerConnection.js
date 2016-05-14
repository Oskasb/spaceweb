
ServerConnection = function() {

};

ServerConnection.prototype.setupSocket = function(wss) {

	wss.on("connection", function(ws) {

		var sends = 0;

		ws.send("Connected:" + JSON.stringify(new Date()), function() {});

		console.log("websocket connection open");

		var respond = function(msg) {
			ws.send(msg)
		};


		ws.on("message", function(message) {

			if (message == "ping") {
				setTimeout(function() {
					respond("ping");
				}, 100 * Math.random())
			}

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
