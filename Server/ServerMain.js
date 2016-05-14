
var requirejs = require ('requirejs');

requirejs.config({
	//Pass the top-level main.js/index.js require
	//function to requirejs so that node modules
	//are loaded relative to the top-level JS file.
	nodeRequire: require
});



ServerMain = function() {
	console.log("Construct Server Main")
};

ServerMain.prototype.initServerConnection = function(wss) {

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

ServerMain.prototype.initServerMain = function() {
	console.log("Init Server Main")
};



