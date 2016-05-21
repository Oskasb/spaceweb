"use strict";


define([
		'Events',
		'ui/GameScreen',
		'ui/DomUtils',
		'ui/DomVector',
		'ui/DomProgress',
		'ui/DomMessage',
		'ui/DomElement'
	],
	function(
		evt,
		GameScreen,
		DomUtils,
		DomVector,
		DomProgress,
		DomMessage,
		DomElement
	) {

		var parent = document.getElementById('game_window');

		var DomPlayer = function(piece) {
			this.id = piece.id;
			this.piece = piece;
			this.vel = [];
			this.pos = [];
			this.rot = [];
			this.rotVel = [];
			this.domRoot = new DomElement(parent, 'point');
			
			this.domHull = new DomElement(this.domRoot.element, 'ship_hull');
			this.domHull.setText(this.id);
			this.inputVector = new DomVector(this.domRoot.element);
			this.rotVelVector = new DomVector(this.domHull.element);
			this.trafficPredictor = new DomProgress(this.domRoot.element, 'progress_box');

		};


		DomPlayer.prototype.removeDomPlayer = function() {
			this.domRoot.removeElement();
		};

		DomPlayer.prototype.setIsOwnPlayer = function() {
			this.domHull.addStyleJsonId('ship_hull_friendly');
		};


		DomPlayer.prototype.renderStateText = function(text) {
			var x = this.pos[0]*0.01*GameScreen.getWidth()-10 + Math.random()*20;
			var y = this.pos[1]*0.01*GameScreen.getHeight()-20 + Math.random()*40;
			var message = new DomMessage(parent, text, 'piece_state_hint', x, y, 0.8);
			message.animateToXYZ(x, y-100, 0);
		};

		DomPlayer.prototype.sampleSpatial = function(spatial) {
			spatial.getVelArray(this.vel);
			spatial.getPosArray(this.pos);
			spatial.getRotArray(this.rot);
			spatial.getRotVelArray(this.rotVel);
		};


		DomPlayer.prototype.updateDomPlayer = function() {

			this.sampleSpatial(this.piece.spatial);
			this.inputVector.renderBetween(0, 0, this.vel[0]*30, this.vel[1]*30);
			this.rotVelVector.renderRadial(90, this.rotVel[2]);
			this.trafficPredictor.setProgress(this.piece.temporal.fraction);
			this.domRoot.translateXYZ(this.pos[0]*0.01*GameScreen.getWidth(), this.pos[1]*0.01*GameScreen.getHeight(), 0);
			this.domHull.rotateXYZ(0, 0, 1, this.rot[2]);

		};

		return DomPlayer;

	});


