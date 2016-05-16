"use strict";


define([
	'Events',
	'ui/DomPlayer'

],
	function(
		evt,
		DomPlayer
		) {

		var Player = function(serverState, removeCallback) {

			this.isOwnPlayer = false;

			for (var key in serverState) {
				this[key] = serverState[key];
			}

			console.log("New Player Server State: ", serverState)


			this.tickCountdown = 1;
			this.spatial.target = [0.5, 0.5, 1];
			this.spatial.diff = [0.5, 0.5, 1];


			this.timeDelta = 1;
			this.domPlayer = new DomPlayer(this);
			this.removeCallback = removeCallback;

		};

		Player.prototype.inputCursorVector = function(e) {
			var _this=this;
			var vector = {
				fromX:evt.args(e).fromX*0.01,
				fromY:evt.args(e).fromY*0.01,
				toX:evt.args(e).toX*0.01,
				toY:evt.args(e).toY*0.01
			};

			evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'InputVector', data:{vector:vector, playerId:_this.playerId}});
		};

		Player.prototype.predictPlayerVelocity = function(spatial, tpf) {
			this.tickCountdown -= tpf;
			var fraction = this.tickCountdown / this.timeDelta;

			spatial.pos[0] = this.spatial.target[0] - spatial.diff[0] * fraction;
			spatial.pos[1] = this.spatial.target[1] - spatial.diff[1] * fraction;

		};

		Player.prototype.updatePlayerSpatial = function(spatial) {
			spatial.pos[0] += spatial.vel[0];
			spatial.pos[1] += spatial.vel[1];
		};

		Player.prototype.updatePlayer = function(tpf) {

			this.predictPlayerVelocity(this.spatial, tpf);
		//	this.updatePlayerSpatial(this.spatial, tpf);
			this.domPlayer.updateDomPlayer();
		};

		Player.prototype.setIsOwnPlayer = function(bool) {

			this.domPlayer.setIsOwnPlayer(bool);
		};

		Player.prototype.playerRemove = function() {
			this.removeCallback(this.playerId);

			this.domPlayer.removeDomPlayer();
		};

		Player.prototype.setServerState = function(serverState) {

			if (serverState.state == 'REMOVED') {
				this.playerRemove();
				return;
			}


			this.timeDelta = serverState.timeDelta;
			this.tickCountdown = this.timeDelta;

			if (serverState.state == 'TELEPORT') {
				this.spatial.pos[0] = serverState.spatial.pos[0];
				this.spatial.pos[1] = serverState.spatial.pos[1];
				this.spatial.pos[2] = serverState.spatial.pos[2];
			}

			this.serverState = serverState;

			this.spatial.vel[0] = serverState.spatial.vel[0];
			this.spatial.vel[1] = serverState.spatial.vel[1];

			this.spatial.target[0] = serverState.spatial.pos[0];
			this.spatial.target[1] = serverState.spatial.pos[1];
			this.spatial.target[2] = serverState.spatial.pos[2];

			this.spatial.diff[0] =  this.spatial.target[0]-this.spatial.pos[0]
			this.spatial.diff[1] =  this.spatial.target[1]-this.spatial.pos[1]

		};







		return Player;
	});