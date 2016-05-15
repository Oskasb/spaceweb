"use strict";


define([
	     'main/Player'
],
	function(
			Player
		) {



		var GameMain = function() {
			this.players = {};

		};

		GameMain.prototype.registerPlayer = function(data) {
			console.log("Register Player: ", data);

			var _this = this;

			var removeCallback = function(playerId) {
				delete _this.players[playerId];
			};

			this.players[data.playerId] = new Player(data, removeCallback);
		};

		GameMain.prototype.playerUpdate = function(data) {
			var data = data;

			if (this.players[data.playerId]) {
				this.players[data.playerId].setServerState(data);
			} else {
				console.log("Register New Player from update", data.playerId, this.players)
				this.registerPlayer(data);
				this.players[data.playerId].setServerState(data);
			}
		};

		GameMain.prototype.RegisterPlayer = function(msg) {
			var data = msg.data;
			console.log("Server Player: ", data);

			if (this.players[data.playerId]) {
				console.log("Player already registered", data.playerId, this.players)
			} else {
				this.registerPlayer(data);
				this.players[data.playerId].setIsOwnPlayer(true);
				this.players[data.playerId].setServerState(data);
			}
		};

		GameMain.prototype.tick = function(tpf) {
			for (var key in this.players) {
				this.players[key].updatePlayer(tpf);
			}
		};

		return GameMain;

	});