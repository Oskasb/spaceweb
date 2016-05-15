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


		GameMain.prototype.registerPlayer = function(player) {
			console.log("Register Player: ", player);
			this.players[player.playerId] = player;
		};

		GameMain.prototype.playerUpdate = function(data) {
			var data = data;

			if (this.players[data.playerId]) {
				this.players[data.playerId].setServerState(data);
			} else {
				console.log("No player", data.playerId, this.players)
			}
		};

		GameMain.prototype.RegisterPlayer = function(msg) {
			var data = msg.data;
			console.log("Server Player: ", data);

			if (this.players[data.playerId]) {
				console.log("Player already registered", data.playerId, this.players)
			} else {
				this.registerPlayer(new Player(data));
			}
		};

		GameMain.prototype.tick = function(tpf) {
			for (var key in this.players) {
				this.players[key].updatePlayer(tpf);
			}
		};

		return GameMain;

	});