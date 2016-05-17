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

			this.playerId = serverState.playerId;

			this.spatial = new MODEL.Spatial();
			this.serverSpatial = new MODEL.Spatial();
			this.startSpatial = new MODEL.Spatial();
			this.temporal = new MODEL.Temporal();

		//	this.setServerState(serverState);

			console.log("New Player Server State: ", serverState)



			this.tickCountUp = 1;

			this.timeDelta = 1;
			this.domPlayer = new DomPlayer(this);
			this.removeCallback = removeCallback;
			this.fraction = 1;
		};

		ClientPlayer.prototype.inputCursorVector = function(e) {
			var _this=this;
			var vector = {
				fromX:evt.args(e).fromX*0.01,
				fromY:evt.args(e).fromY*0.01,
				toX:evt.args(e).toX*0.01,
				toY:evt.args(e).toY*0.01
			};

			evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'InputVector', data:{vector:vector, playerId:_this.playerId}});
		};

		ClientPlayer.prototype.predictPlayerVelocity = function(tpf) {
			this.spatial.interpolateTowards(this.startSpatial, this.serverSpatial, this.temporal.getFraction(tpf));
		};


		ClientPlayer.prototype.updatePlayer = function(tpf) {

			this.predictPlayerVelocity(tpf);
			this.domPlayer.updateDomPlayer();
		};

		ClientPlayer.prototype.setIsOwnPlayer = function(bool) {

			this.domPlayer.setIsOwnPlayer(bool);
		};

		ClientPlayer.prototype.playerRemove = function() {
			this.removeCallback(this.playerId);

			this.domPlayer.removeDomPlayer();
		};

		ClientPlayer.prototype.setServerState = function(serverState) {
			this.temporal.predictUpdate(serverState.timeDelta);

			if (serverState.state == 'REMOVED') {
				this.playerRemove();
				return;
			}

			if (serverState.state == 'TELEPORT') {
				this.spatial.setSendData(serverState.spatial);
			}

			this.startSpatial.setSpatial(this.spatial);
			this.serverSpatial.setSendData(serverState.spatial);

		};







		return ClientPlayer;
	});