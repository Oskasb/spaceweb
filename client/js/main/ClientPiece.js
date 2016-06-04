"use strict";


define([
	'Events',
	'ui/DomPiece',
	'io/InputSegmentRadial',
	'PipelineAPI'
],
	function(
		evt,
		DomPiece,
		InputSegmentRadial,
		PipelineAPI
		) {



		var ClientPiece = function(serverState, pieceData, removeCallback) {

			this.isOwnPlayer = false;
			var piece = new GAME.Piece(serverState.playerId);
			piece.serverState = serverState;
			this.piece = piece;
			this.playerId = serverState.playerId;

			this.spatial = new MODEL.Spatial();
			this.targetSpatial = new MODEL.Spatial();
			this.startSpatial = new MODEL.Spatial();
			this.temporal = new MODEL.Temporal();

			this.domPlayer = new DomPiece(this.piece);
			this.removeCallback = removeCallback;
			this.attachModules(pieceData.modules);
			this.setServerState(serverState);
		};

		ClientPiece.prototype.attachModules = function(modules) {

			var serverState = this.piece.serverState;
			var _this = this;
			this.piece.modules = [];
			this.piece.moduleIndex = {};

			for (var i = 0; i < modules.length; i++) {

				if (serverState.modules[modules[i].id]) {

					for (var j = 0; j < serverState.modules[modules[i].id].length; j++) {

						var moduleAppliedCallback = function(message) {
					//		_this.domPlayer.renderStateText(message);
						};

						var moduleState = serverState.modules[modules[i].id][j];

						var module = new GAME.PieceModule(modules[i].id, modules[i].data, this);

						module.setModuleState(moduleState.value);
						module.setAppliyCallback(moduleAppliedCallback);
						this.domPlayer.attachModule(module);
						this.piece.registerModuleFromServerState(module);
					}

				}
			}
		};

		ClientPiece.prototype.getPieceId = function() {
			return this.piece.id;
		};



		ClientPiece.prototype.updatePlayer = function(tpf) {
			this.piece.updatePieceFrame(tpf);

			if (this.piece.state == GAME.ENUMS.PieceStates.TIME_OUT) {
				this.domPlayer.renderStateText("Client Timeout Pew!");
				this.playerRemove();
				return;
			} else {
				this.domPlayer.updateDomPiece();
			}

			if (this.isOwnPlayer) {
				evt.fire(evt.list().CONTROLLED_PIECE_UPDATED, this.piece)
			}


		};

		ClientPiece.prototype.setIsOwnPlayer = function(bool) {
			this.isOwnPlayer = bool;
			this.domPlayer.setIsOwnPlayer(bool);
			this.attachRadialControl();
		};

		ClientPiece.prototype.attachRadialControl = function() {
			var inputSegmentRadial = new InputSegmentRadial();
			inputSegmentRadial.registerControlledPiece(this.piece);

			var pieceModuleDataLoaded = function(src, data) {
				inputSegmentRadial.applyConfigs(data);
			};

			PipelineAPI.subscribeToCategoryKey('piece_data', 'controls', pieceModuleDataLoaded);
			
		};
		
		ClientPiece.prototype.playerRemove = function() {
			this.domPlayer.removeDomPiece();
			this.removeCallback(this.piece.id);
		};

		ClientPiece.prototype.setServerState = function(serverState) {

			this.piece.processModules(serverState.modules);

			this.piece.applyNetworkState(serverState);
			
			if (serverState.state == GAME.ENUMS.PieceStates.REMOVED) {
				this.domPlayer.renderStateText("Poof");
				this.playerRemove();
				return;
			}

			if (serverState.state == GAME.ENUMS.PieceStates.TIME_OUT) {
				this.domPlayer.renderEffect('effect_shockwave_light', 0.25, 1.4);
				this.playerRemove();
				return;
			}

            if (serverState.state == GAME.ENUMS.PieceStates.EXPLODE) {
                this.domPlayer.renderEffect('effect_explosion_bullet', 0.4, 1);
                this.domPlayer.renderEffect('effect_shockwave_heavy', 0.25, 1.4);
            }

            if (serverState.state == GAME.ENUMS.PieceStates.BURST) {
                this.domPlayer.renderEffect('effect_shockwave_light', 0.45, 0.6);
            }

			if (serverState.state == GAME.ENUMS.PieceStates.TELEPORT) {
				//	this.piece.notifyTrigger(true);
				this.domPlayer.renderStateText("Jump");
				this.domPlayer.updateDomPiece();
				this.domPlayer.renderStateText("Teleport");
			}

			if (serverState.state == GAME.ENUMS.PieceStates.SPAWN) {
				//	this.piece.notifyTrigger(true);
				this.domPlayer.updateDomPiece();
				this.domPlayer.renderEffect('effect_shockwave_light', 0.15, 0.4);
				var _this = this;

				var appear = function() {
					_this.domPlayer.renderStateText("pew");
				};

				setTimeout(function() {
			//		appear()
				}, 0);
			}

		};


		return ClientPiece;
	});