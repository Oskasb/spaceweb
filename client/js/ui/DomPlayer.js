"use strict";


define([
	'Events',
	'ui/GameScreen',
	'ui/DomUtils',
	'ui/DomVector',
	'ui/DomProgress'
],
	function(
		evt,
		GameScreen,
		DomUtils,
		DomVector,
		DomProgress
		) {

		var parent = document.getElementById('game_window');

		var DomPlayer = function(piece) {
			this.id = piece.id;
			this.piece = piece;
			this.vel = [];
			this.pos = [];
			this.rot = [];
			this.domRoot = DomUtils.createDivElement(parent, this.id, '', 'point');
			this.domHull = DomUtils.createDivElement(this.domRoot, 'hull_'+this.id, this.id, 'dom_player');
			this.inputVector = new DomVector(GameScreen.getElement());

			this.trafficPredictor = new DomProgress(this.domRoot);

			var _this = this;
			setTimeout(function() {
				_this.domRoot.appendChild(_this.domHull);
				_this.domRoot.appendChild(_this.inputVector.vector);
				_this.domRoot.appendChild(_this.trafficPredictor.root);
			},1)

		};


		DomPlayer.prototype.removeDomPlayer = function() {
			DomUtils.removeElement(this.domRoot);
		};

		DomPlayer.prototype.setIsOwnPlayer = function(bool) {
			DomUtils.addElementClass(this.domHull, 'my_color');
		};

		DomPlayer.prototype.updateDomPlayer = function() {

			this.piece.spatial.getVelArray(this.vel);
			this.piece.spatial.getPosArray(this.pos);
			this.piece.spatial.getRotArray(this.rot);

			DEBUG_MONITOR(this.rot)

			this.inputVector.renderBetween(0, 0, this.vel[0]*30, this.vel[1]*30);

			this.trafficPredictor.setProgress(this.piece.temporal.fraction);




			var transform = "translate3d("+this.pos[0]*0.01*GameScreen.getWidth()+"px, "+this.pos[1]*0.01*GameScreen.getHeight()+"px, 0px)";

			DomUtils.applyElementTransform(this.domRoot, transform);


			var rot = "rotate3d(0, 0, 1, "+this.rot[2]+"rad)";

			DomUtils.applyElementTransform(this.domHull, rot)


		};

		return DomPlayer;

	});


