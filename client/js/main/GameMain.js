"use strict";


define([
	     'main/Player',
	'Events'
],
	function(
			Player,
			evt
		) {



		var GameMain = function() {
			this.players = {};
			this.ownPlayer;
		};

		GameMain.prototype.registerPlayer = function(data) {
			console.log("Register Player: ", data);

			var _this = this;

			var removeCallback = function(playerId) {
				delete _this.players[playerId];
			};



			this.players[data.playerId] = new Player(data, removeCallback);
			return this.players[data.playerId];
		};

		GameMain.prototype.InputVector = function(msg) {
			this.players[msg.data.playerId].setServerState(msg.data);
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
				var player = this.registerPlayer(data);
				player.setIsOwnPlayer(true);
				player.setServerState(data);
				this.ownPlayer = player;

				var handleCursorLine = function(e) {
					player.inputCursorVector(e)
				};
				evt.on(evt.list().CURSOR_LINE, handleCursorLine);
			}
		};

		GameMain.prototype.tick = function(tpf) {
			for (var key in this.players) {
				this.players[key].updatePlayer(tpf);
			}
		};

		return GameMain;

	});