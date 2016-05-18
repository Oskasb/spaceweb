"use strict";


define([
	'Events',
	'ui/DomPlayer'

],
	function(
		evt,
		DomPlayer
		) {

		var ClientPlayer = function(serverState, removeCallback) {

			this.isOwnPlayer = false;
			this.piece = new GAME.Piece(serverState.playerId);
			this.playerId = serverState.playerId;

			this.spatial = new MODEL.Spatial();
			this.targetSpatial = new MODEL.Spatial();
			this.startSpatial = new MODEL.Spatial();
			this.temporal = new MODEL.Temporal();

			this.domPlayer = new DomPlayer(this.piece);
			this.removeCallback = removeCallback;

		};

		ClientPlayer.prototype.getPieceId = function() {
			return this.piece.id;
		};

		ClientPlayer.prototype.predictPlayerVelocity = function(tpf) {
			this.piece.updatePieceFrame(tpf);
		};

		ClientPlayer.prototype.updatePlayer = function(tpf) {

			this.predictPlayerVelocity(tpf);
			this.domPlayer.updateDomPlayer();
		};

		ClientPlayer.prototype.setIsOwnPlayer = function(bool) {

			this.domPlayer.setIsOwnPlayer(bool);
		};

		ClientPlayer.prototype.playerRemove = function() {
			DEBUG_MONITOR("Remove:"+this.piece.id )
			this.removeCallback(this.piece.id);

			this.domPlayer.removeDomPlayer();
		};

		ClientPlayer.prototype.setServerState = function(serverState) {

			if (serverState.state == GAME.ENUMS.PieceStates.REMOVED) {
				this.playerRemove();
				return;
			}

			this.piece.applyNetworkState(serverState);

		};


		return ClientPlayer;
	});