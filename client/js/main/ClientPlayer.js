"use strict";


define([
	'Events',
	'ui/DomPlayer',
	'PipelineAPI'

],
	function(
		evt,
		DomPlayer,
		PipelineAPI
		) {

		var ClientPlayer = function(serverState, pieceData, removeCallback) {

			this.isOwnPlayer = false;
			var piece = new GAME.Piece(serverState.playerId);
			this.piece = piece;
			this.playerId = serverState.playerId;

			this.spatial = new MODEL.Spatial();
			this.targetSpatial = new MODEL.Spatial();
			this.startSpatial = new MODEL.Spatial();
			this.temporal = new MODEL.Temporal();

			this.domPlayer = new DomPlayer(this.piece);
			this.removeCallback = removeCallback;

			serverState.state = GAME.ENUMS.PieceStates.TELEPORT;
			piece.applyNetworkState(serverState);


			this.attachModules(pieceData.modules);


		};

		ClientPlayer.prototype.attachModules = function(modules) {

			var serverState = this.piece.serverState;
			var _this = this;
			this.piece.modules = [];
			this.piece.moduleStates = {};

			for (var i = 0; i < modules.length; i++) {

				if (serverState.modules[modules[i].id]) {

					for (var j = 0; j < serverState.modules[modules[i].id].length; j++) {

						var moduleAppliedCallback = function(message) {
							_this.domPlayer.renderStateText(message);
						};

						var moduleState = serverState.modules[modules[i].id][j];

						var module = new GAME.PieceModule(modules[i].id, modules[i].data, this);

						module.setModuleState(moduleState.value);
						module.setAppliyCallback(moduleAppliedCallback);

						this.piece.registerModuleFromServerState(module);
					}

				}
			}
		};

		ClientPlayer.prototype.getPieceId = function() {
			return this.piece.id;
		};



		ClientPlayer.prototype.updatePlayer = function(tpf) {

			this.piece.updatePieceFrame(tpf);
			this.domPlayer.updateDomPlayer();
		};

		ClientPlayer.prototype.setIsOwnPlayer = function(bool) {

			this.domPlayer.setIsOwnPlayer(bool);
		};

		ClientPlayer.prototype.playerRemove = function() {
			this.removeCallback(this.piece.id);
			this.domPlayer.removeDomPlayer();
		};

		ClientPlayer.prototype.setServerState = function(serverState) {

			this.piece.processModules(serverState.modules);
			
			if (serverState.state == GAME.ENUMS.PieceStates.REMOVED) {
				this.domPlayer.renderStateText("Poof");
				this.playerRemove();
				return;
			}

			if (serverState.state == GAME.ENUMS.PieceStates.TIME_OUT) {
				this.domPlayer.renderStateText("Time Out");
				this.playerRemove();
				return;
			}
			
			this.piece.applyNetworkState(serverState);

			if (serverState.state == GAME.ENUMS.PieceStates.TELEPORT) {
				//	this.piece.notifyTrigger(true);
				this.domPlayer.renderStateText("Jump");
				this.domPlayer.updateDomPlayer();
				this.domPlayer.renderStateText("Teleport");
			}
		};


		return ClientPlayer;
	});