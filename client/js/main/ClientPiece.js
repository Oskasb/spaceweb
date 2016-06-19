"use strict";


define([
	'Events',
	'ui/GooPiece',
	'io/InputSegmentRadial',
    'PipelineObject',
	'PipelineAPI',
    'game/ClientModule'
],
	function(
		evt,
		GooPiece,
		InputSegmentRadial,
        PipelineObject,
		PipelineAPI,
        ClientModule
		) {

		var textStyle = {
			posx: 20,
			posy: 20,
			size: 0.5,
			particleConfig:'tpf_Letter',
			textConfig:'text_config'
		};

		var ClientPiece = function(serverState, removeCallback) {

            var _this = this;

            this.clientModules = [];

			this.isOwnPlayer = false;
			var piece = new GAME.Piece(serverState.type, serverState.playerId);
			piece.serverState = serverState;
			this.piece = piece;
			this.playerId = serverState.playerId;
            this.name = this.playerId;

			this.spatial = new MODEL.Spatial();
			this.targetSpatial = new MODEL.Spatial();
			this.startSpatial = new MODEL.Spatial();
			this.temporal = new MODEL.Temporal();

			this.gooPiece = new GooPiece(this.piece);
			
			this.removeCallback = removeCallback;
			this.setServerState(serverState);

            var applyPieceData = function(src, data) {
                console.log("Attach pieceData", src, data)
                _this.pieceData = data;
                _this.attachModules(data.modules);
            };
            
            this.pipelineObject = new PipelineObject('PIECE_DATA', piece.type, applyPieceData);
		};



		ClientPiece.prototype.attachModules = function(modules) {

			var serverState = this.piece.serverState;

			for (var i = 0; i < modules.length; i++) {
                this.clientModules.push(new ClientModule(this.gooPiece, modules[i], serverState.modules[modules[i].id]));
			}

		};

		ClientPiece.prototype.detachModules = function() {
            
            for (var i= 0; i < this.clientModules.length; i++) {
                this.clientModules[i].removeClientModule()
            }
		};

		ClientPiece.prototype.getPieceId = function() {
			return this.piece.id;
		};

        ClientPiece.prototype.getPieceName = function() {
            if (this.piece.readServerModuleState('nameplate')) {
                var name = this.piece.readServerModuleState('nameplate')[0].value;
                if (this.name != name) {
                    if (this.isOwnPlayer) {
                        evt.fire(evt.list().MESSAGE_UI, {channel:"own_player_name", message:name});
                    }
                    if (name.length > 10) {
                        name = name.substring(0, 10);
                    }
                    this.name = name;
                }
                return name;
            }
        };

		ClientPiece.prototype.updatePlayer = function(tpf) {

            this.sampleClientModules(this.piece.serverState.modules);

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
				inputSegmentRadial.applyConfigs(data.controls.input);
			};
            this.inputSegmentRadial = inputSegmentRadial;
			new PipelineObject('PIECE_DATA', this.piece.type, pieceModuleDataLoaded);
		};
		
		ClientPiece.prototype.playerRemove = function() {
            this.pipelineObject.removePipelineObject();
			this.detachModules();
			this.gooPiece.removeGooPiece();
			this.removeCallback(this.piece.id);
		};

        ClientPiece.prototype.sampleClientModules = function(serverModules) {
            for (var i = 0; i < this.clientModules.length; i++) {
                this.clientModules[i].applyModuleServerState(serverModules);
                this.clientModules[i].sampleModuleFrame();
            }
        };

		ClientPiece.prototype.setServerState = function(serverState) {

			this.piece.processModules(serverState.modules);

			this.piece.applyNetworkState(serverState);

            this.getPieceName();
			
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