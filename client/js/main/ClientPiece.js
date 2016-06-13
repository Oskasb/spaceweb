"use strict";


define([
	'Events',
	'ui/GooPiece',
	'io/InputSegmentRadial',
	'PipelineAPI'
],
	function(
		evt,
		GooPiece,
		InputSegmentRadial,
		PipelineAPI
		) {

		var textStyle = {
			posx: 20,
			posy: 20,
			size: 0.5,
			particleConfig:'tpf_Letter',
			textConfig:'text_config'
		};

		var ClientPiece = function(serverState, pieceData, removeCallback) {

			this.isOwnPlayer = false;
			var piece = new GAME.Piece(serverState.type, serverState.playerId);
			piece.serverState = serverState;
			this.piece = piece;
			this.playerId = serverState.playerId;

			this.spatial = new MODEL.Spatial();
			this.targetSpatial = new MODEL.Spatial();
			this.startSpatial = new MODEL.Spatial();
			this.temporal = new MODEL.Temporal();

			this.gooPiece = new GooPiece(this.piece);
			
			this.removeCallback = removeCallback;
			this.setServerState(serverState);
			this.attachModules(pieceData.modules);
			
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
						this.gooPiece.attachModule(module);
						this.piece.registerModuleFromServerState(module);
					}

				}
			}
		};

		ClientPiece.prototype.detachModules = function() {
			this.piece.modules = [];
			this.piece.moduleIndex = {};
		};

		ClientPiece.prototype.getPieceId = function() {
			return this.piece.id;
		};



		ClientPiece.prototype.updatePlayer = function(tpf) {
			this.piece.updatePieceFrame(tpf);

			if (this.piece.state == GAME.ENUMS.PieceStates.TIME_OUT) {
				this.playerRemove();
				return;
			} else {
				this.gooPiece.updateGooPiece();
			}

			if (this.isOwnPlayer) {
				evt.fire(evt.list().CONTROLLED_PIECE_UPDATED, this.piece)
			}

		};

		ClientPiece.prototype.setIsOwnPlayer = function(bool) {
			evt.fire(evt.list().MESSAGE_UI, {channel:'server_message', message:'Player Ready'});
			this.isOwnPlayer = bool;
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
			this.detachModules();
			this.gooPiece.removeGooPiece();
			this.removeCallback(this.piece.id);
		};

		ClientPiece.prototype.setServerState = function(serverState) {

			this.piece.processModules(serverState.modules);

			this.piece.applyNetworkState(serverState);
			
			if (serverState.state == GAME.ENUMS.PieceStates.REMOVED) {
		//		this.domPlayer.renderStateText("Poof");

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getY()+5;

				evt.fire(evt.list().PARTICLE_TEXT, {text:'POOF', textStyle:textStyle});

                evt.fire(evt.list().MESSAGE_UI, {channel:'system_status', message:this.piece.id+' has left the area' });

				this.playerRemove();
				return;
			}

			if (serverState.state == GAME.ENUMS.PieceStates.TIME_OUT) {
			//	evt.fire(evt.list().GAME_EFFECT, {effect:"despawn_pulse", pos:this.piece.spatial.pos, vel:{data:[0, 1, 0]}});
			//	this.domPlayer.renderEffect('effect_shockwave_light', 0.25, 1.4);
				this.playerRemove();
				return;
			}

            if (serverState.state == GAME.ENUMS.PieceStates.EXPLODE) {
            //    this.domPlayer.renderEffect('effect_explosion_bullet', 0.4, 1);
            //    this.domPlayer.renderEffect('effect_shockwave_heavy', 0.25, 1.4);

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getY()+5;

				evt.fire(evt.list().PARTICLE_TEXT, {text:'OUCH', textStyle:textStyle});


				evt.fire(evt.list().GAME_EFFECT, {effect:"explode", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});
				evt.fire(evt.list().GAME_EFFECT, {effect:"shockwave", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});
            }

            if (serverState.state == GAME.ENUMS.PieceStates.BURST) {
        //        this.domPlayer.renderEffect('effect_shockwave_light', 0.45, 0.6);

				evt.fire(evt.list().GAME_EFFECT, {effect:"collide", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});
            }

			if (serverState.state == GAME.ENUMS.PieceStates.TELEPORT) {
				//	this.piece.notifyTrigger(true);
			//	this.domPlayer.renderStateText("Jump");
				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getY()+5;

				evt.fire(evt.list().PARTICLE_TEXT, {text:'TELEPORT', textStyle:textStyle});
				this.gooPiece.updateGooPiece();
				evt.fire(evt.list().GAME_EFFECT, {effect:"teleport", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getY()+5;
				evt.fire(evt.list().PARTICLE_TEXT, {text:'TELEPORT', textStyle:textStyle});
                evt.fire(evt.list().MESSAGE_UI, {channel:'server_message', message:this.piece.id+' - Teleport' });
			}

			if (serverState.state == GAME.ENUMS.PieceStates.SPAWN) {
				//	this.piece.notifyTrigger(true);

				textStyle.posx = this.piece.spatial.pos.getX()-5;
				textStyle.posy = this.piece.spatial.pos.getY()+5;

				evt.fire(evt.list().PARTICLE_TEXT, {text:'POP', textStyle:textStyle});

				this.gooPiece.updateGooPiece();
			//	evt.fire(evt.list().GAME_EFFECT, {effect:"spawn_pulse", pos:this.piece.spatial.pos, vel:this.piece.spatial.vel});

			}

		};


		return ClientPiece;
	});