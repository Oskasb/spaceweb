"use strict";

define(
	[
 './Socket.js'
	]

,function(
		Socket
	) {

	var ServerMain = function() {
		console.log("ServerMain Init");
		this.socket = new Socket();
	};

	ServerMain.prototype.initiateServerMain = function(io, msg) {

		this.socket.setIo(io);

		var tick = this.tick;
		var count = 0;

		setInterval(function() {
			tick(count);
			count++
		}, 100)

		console.log(msg)
	};

	ServerMain.prototype.tick = function(count) {

	//	console.log("tick", count)
	};

	return ServerMain;

});