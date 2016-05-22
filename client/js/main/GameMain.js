"use strict";


define([
	'main/ClientPlayer',
	'Events',
	'PipelineAPI'
],
	function(
		ClientPlayer,
		evt,
		PipelineAPI
		) {


		var GameMain = function() {
			this.players = {};
			this.ownPlayer;

			var players = this.players;
			var removeAllPlayers = function() {
				for (var key in players) {
					players[key].playerRemove();
				}
			};

			evt.on(evt.list().CONNECTION_CLOSED, removeAllPlayers);

			this.pieceData = {}; 
			var _this = this;
			
			
			
			var pieceModuleDataLoaded = function(src, data) {
				_this.pieceData[src]=data;
				_this.pieceDataUpdated(_this.pieceData);
			};

			PipelineAPI.subscribeToCategoryKey('piece_data', 'modules', pieceModuleDataLoaded);
			
		};

		GameMain.prototype.pieceDataUpdated = function(pieceData) {
			for (var index in this.players) {
				this.players[index].attachModules(pieceData.modules);
			}
			
		};

		GameMain.prototype.registerPlayer = function(data) {
			console.log("Register Player: ", data);

			var _this = this;

			var removeCallback = function(playerId) {
				delete _this.players[playerId];
			};

			this.players[data.playerId] = new ClientPlayer(data, this.pieceData, removeCallback);
		//	this.players[data.playerId].startSpatial.setSendData(data.spatial);
			return this.players[data.playerId];
		};

		GameMain.prototype.InputVector = function(msg) {
			this.players[msg.data.playerId].setServerState(msg.data);
		};

		GameMain.prototype.playerUpdate = function(data) {
			if (this.players[data.playerId]) {

				this.players[data.playerId].setServerState(data);
			} else {
				console.log("Register New Player from update", data.playerId, this.players);
				this.registerPlayer(data);
			//	this.players[data.playerId].setServerState(data);


			}
		};

		GameMain.prototype.RegisterPlayer = function(msg) {
			var data = msg.data;
			console.log("Server Player: ", data);
			var _this = this;

			if (this.players[data.playerId]) {
				console.log("Player already registered", data.playerId, this.players)
			} else {
				var player = this.registerPlayer(data);
				player.setIsOwnPlayer(true);
			//	player.setServerState(data);
				this.ownPlayer = player;

				var handleCursorLine = function(e) {

					var vector = {
						fromX:evt.args(e).fromX*0.01,
						fromY:evt.args(e).fromY*0.01,
						toX:evt.args(e).toX*0.01,
						toY:evt.args(e).toY*0.01
					};

					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'InputVector', data:{vector:vector, playerId:player.getPieceId()}});
				};


				var handleFastClick = function(e) {

					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'InputVector', data:{fire:true, playerId:player.getPieceId()}});
				};

				evt.on(evt.list().CURSOR_RELEASE_FAST, handleFastClick);


				evt.on(evt.list().CURSOR_LINE, handleCursorLine);

				var disconnect = function(e) {
					evt.removeListener(evt.list().CURSOR_LINE, handleCursorLine);
					evt.removeListener(evt.list().CURSOR_RELEASE_FAST, handleFastClick);
				};

				evt.on(evt.list().CONNECTION_CLOSED, disconnect);
			}
		};

		GameMain.prototype.tick = function(tpf) {
			for (var key in this.players) {
				this.players[key].updatePlayer(tpf);
			}
		};

		return GameMain;
	});