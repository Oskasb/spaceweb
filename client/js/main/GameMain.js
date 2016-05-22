"use strict";


define([
	'main/ClientPiece',
	'Events',
	'PipelineAPI'
],
	function(
		ClientPiece,
		evt,
		PipelineAPI
		) {


		var GameMain = function() {
			this.pieces = {};
			this.ownPlayer;

			var pieces = this.pieces;
			var removeAllPieces = function() {
				for (var key in pieces) {
                    pieces[key].playerRemove();
				}
			};

			evt.on(evt.list().CONNECTION_CLOSED, removeAllPieces);

			this.pieceData = {}; 
			var _this = this;
			
			
			
			var pieceModuleDataLoaded = function(src, data) {
				_this.pieceData[src]=data;
				_this.pieceDataUpdated(_this.pieceData);
			};

			PipelineAPI.subscribeToCategoryKey('piece_data', 'modules', pieceModuleDataLoaded);
			
		};

		GameMain.prototype.pieceDataUpdated = function(pieceData) {
			for (var index in this.pieces) {
				this.pieces[index].attachModules(pieceData.modules);
			}
			
		};

		GameMain.prototype.registerPlayer = function(data) {

			var _this = this;

			var removeCallback = function(playerId) {
                setTimeout(function() {
                    delete _this.pieces[playerId];
                }, 20)

        };

			this.pieces[data.playerId] = new ClientPiece(data, this.pieceData, removeCallback);
		//	this.pieces[data.playerId].startSpatial.setSendData(data.spatial);
			return this.pieces[data.playerId];
		};

		GameMain.prototype.InputVector = function(msg) {
			this.pieces[msg.data.playerId].setServerState(msg.data);
		};

		GameMain.prototype.playerUpdate = function(data) {
			if (this.pieces[data.playerId]) {

				this.pieces[data.playerId].setServerState(data);
			} else {
			//	console.log("Register New Player from update", data.playerId, this.pieces);
				this.registerPlayer(data);
			}
		};

		GameMain.prototype.RegisterPlayer = function(msg) {
			var data = msg.data;
			console.log("Server Player: ", data);
			var _this = this;

			if (this.pieces[data.playerId]) {
				console.log("Player already registered", data.playerId, this.pieces)
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
			for (var key in this.pieces) {
				this.pieces[key].updatePlayer(tpf);
			}
		};

		return GameMain;
	});