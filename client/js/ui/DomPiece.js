"use strict";


define([
		'Events',
		'ui/GameScreen',
		'ui/DomUtils',
		'ui/DomVector',
		'ui/DomProgress',
		'ui/DomMessage',
		'ui/DomElement',
		'ui/DomModule'
	],
	function(
		evt,
		GameScreen,
		DomUtils,
		DomVector,
		DomProgress,
		DomMessage,
		DomElement,
		DomModule
	) {

		var debug = false;

		var parent = document.getElementById('game_window');

		var DomPiece = function(piece) {
			this.modules = [];
			this.id = piece.id;
			this.piece = piece;
			this.vel = [];
			this.pos = [];
			this.rot = [];
			this.rotVel = [];
			this.domRoot = new DomElement(parent, 'point');
			this.domHull = new DomElement(this.domRoot.element, 'ship_root');

			if (debug) this.attachDebugElements();
		};



		DomPiece.prototype.attachModule = function(module) {
			this.modules.push(new DomModule(module, this.domHull.element, this.piece));
		};

		DomPiece.prototype.attachNameplate = function() {
			this.nameplate = new DomElement(this.domRoot.element, 'point');
			this.nameplate.setText(this.id);
		};


		DomPiece.prototype.removeModules = function() {
			for (var i = 0; i < this.modules.length; i++) {
				this.modules[i].element.removeElement();
			}
		};


		DomPiece.prototype.removeDomPiece = function() {
			this.domRoot.removeElement();
		};

		DomPiece.prototype.setIsOwnPlayer = function() {
			this.domHull.addStyleJsonId('ship_hull_friendly');
		};


		DomPiece.prototype.renderStateText = function(text) {
			var x = this.pos[0]*0.01*GameScreen.getWidth()-10 + Math.random()*20;
			var y = this.pos[1]*0.01*GameScreen.getHeight()-20 + Math.random()*40;
			var message = new DomMessage(parent, text, 'piece_state_hint', x, y, 0.3);
			message.animateToXYZscale(x, y-10, 0, 1.5);
		};

		DomPiece.prototype.sampleSpatial = function(spatial) {
			spatial.getVelArray(this.vel);
			spatial.getPosArray(this.pos);
			spatial.getRotArray(this.rot);
			spatial.getRotVelArray(this.rotVel);
		};

		DomPiece.prototype.updateModules = function() {
			for (var i = 0; i < this.modules.length; i++) {
				this.modules[i].updateDomModule();
			}
		};

		DomPiece.prototype.updateDomPiece = function() {

			this.sampleSpatial(this.piece.spatial);



			this.domRoot.translateXYZ(this.pos[0]*0.01*GameScreen.getWidth(), this.pos[1]*0.01*GameScreen.getHeight(), 0);
			this.domHull.rotateXYZ(0, 0, 1, this.rot[0]);
			this.updateModules();

			if (debug) this.renderDebugElements();
		};


		DomPiece.prototype.attachDebugElements = function() {
			this.inputVector = new DomVector(this.domRoot.element);
			this.rotVelVector = new DomVector(this.domHull.element);
			this.rotVelVector.vector.element.style.left = '22px';
			this.rotVelVector.vector.element.style.zIndex = '150';
			this.trafficPredictor = new DomProgress(this.domRoot.element, 'progress_box');
			this.attachNameplate();
		};


		DomPiece.prototype.renderDebugElements = function() {
			this.sampleSpatial(this.piece.targetSpatial);
			this.inputVector.renderBetween(0, 0, this.vel[0]*5, this.vel[1]*5);
			this.rotVelVector.renderRadial(50, this.rot[0]);
			this.trafficPredictor.setProgress(this.piece.temporal.getFraction());
		};

		return DomPiece;

	});


