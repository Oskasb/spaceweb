"use strict";


define([
	'Events',
	'ui/GameScreen',
	'ui/DomUtils',
	'ui/DomVector'
],
	function(
		evt,
		GameScreen,
		DomUtils,
		DomVector
		) {

		var parent = document.getElementById('game_window');

		var DomPlayer = function(player) {
			this.id = player.playerId;
			this.player = player;
			this.vel = [];
			this.pos = [];
			this.domRoot = DomUtils.createDivElement(parent, this.id, '', 'point');
			this.domHull = DomUtils.createDivElement(this.domRoot, 'hull_'+this.id, this.id, 'dom_player');
			this.inputVector = new DomVector(GameScreen.getElement());
			this.trafficPredictor = DomUtils.createDivElement(GameScreen.getElement(), this.id+'_prg', '', 'progress');

			var _this = this;
			setTimeout(function() {
				_this.domRoot.appendChild(_this.domHull);
				_this.domRoot.appendChild(_this.inputVector.vector);
				_this.domHull.appendChild(_this.trafficPredictor);
			},1)

		};


		DomPlayer.prototype.removeDomPlayer = function() {
			DomUtils.removeElement(this.domRoot);
		};

		DomPlayer.prototype.setIsOwnPlayer = function(bool) {
			DomUtils.addElementClass(this.domHull, 'my_color');
		};

		DomPlayer.prototype.updateDomPlayer = function() {

			this.player.spatial.getVelArray(this.vel);
			this.player.spatial.getPosArray(this.pos);

			this.inputVector.renderBetween(0, 0, this.vel[0]*30, this.vel[1]*30);
			this.trafficPredictor.style.width = 100 * this.player.temporal.fraction + '%';


			var transform = "translate3d("+this.pos[0]*0.01*GameScreen.getWidth()+"px, "+this.pos[1]*0.01*GameScreen.getHeight()+"px, 0px)";

			DomUtils.applyElementTransform(this.domRoot, transform)

		};

		return DomPlayer;

	});


