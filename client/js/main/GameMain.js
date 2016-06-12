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
			this.lastPieceCount = 0;
			this.pieceCount = 0;
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
			

			if (this.pieces[data.playerId]) {
				console.log("Player already registered", data.playerId, this.pieces)
			} else {
				var player = this.registerPlayer(data);
				player.setIsOwnPlayer(true);
			//	player.setServerState(data);
				this.ownPlayer = player;

				var handleCursorLine = function(e) {
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'InputVector', data:{vector:evt.args(e).data, playerId:player.getPieceId()}});
				};

				var handleFastClick = function(e) {
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'InputVector', data:{fire:true, playerId:player.getPieceId()}});
				};

				evt.on(evt.list().CURSOR_RELEASE_FAST, handleFastClick);
				
				evt.on(evt.list().INPUT_PLAYER_CONTROL, handleCursorLine);

				var disconnect = function(e) {
					evt.removeListener(evt.list().INPUT_PLAYER_CONTROL, handleCursorLine);
					evt.removeListener(evt.list().CURSOR_RELEASE_FAST, handleFastClick);
				};

				evt.on(evt.list().CONNECTION_CLOSED, disconnect);
			}
		};

		GameMain.prototype.trackClientPieces = function(count) {
			if (this.lastPieceCount != count) {
				this.lastPieceCount = count;
				evt.fire(evt.list().MONITOR_STATUS, {CLIENT_PIECES:this.pieceCount});
			}
		};
		
		
		GameMain.prototype.tickClientGame = function(tpf) {
			this.pieceCount = 0;

			for (var key in this.pieces) {
				this.pieces[key].updatePlayer(tpf);
				this.pieceCount += 1;
			}
			this.trackClientPieces(this.pieceCount)
			evt.getFiredCount();
		};

		return GameMain;
	});