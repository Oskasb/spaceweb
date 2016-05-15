"use strict";


define([

],
	function(

		) {



		var GameMain = function(connection) {
			this.connection = connection;
		};


		GameMain.prototype.initiateClientWorld = function(socketMessages, messageCallback) {
			this.connection.setSocketMessages(socketMessages, messageCallback);
			this.connection.send(socketMessages.messages.ServerWorld.make())
		};

		GameMain.prototype.tick = function(frame) {

		};

		return GameMain;

	});