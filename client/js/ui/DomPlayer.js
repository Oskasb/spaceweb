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

		var DomPlayer = function(player) {
			this.id = player.playerId;
			this.player = player;
			this.vel = player.spatial.vel;
			this.pos = player.spatial.pos;
			this.domRoot = DomUtils.createDivElement(GameScreen.getElement(), this.id, '', 'point');
			this.domHull = DomUtils.createDivElement(this.domRoot, 'hull_'+this.id, this.id, 'dom_player');
			this.inputVector = new DomVector(GameScreen.getElement());

			var _this = this;
			setTimeout(function() {
				_this.domRoot.appendChild(_this.domHull);
				_this.domRoot.appendChild(_this.inputVector.vector);

			},1)

		};


		DomPlayer.prototype.removeDomPlayer = function() {
			DomUtils.removeElement(this.domHull);
		};

		DomPlayer.prototype.setIsOwnPlayer = function(bool) {
			DomUtils.addElementClass(this.domHull, 'my_color');
		};

		DomPlayer.prototype.updateDomPlayer = function() {

			var vel = this.player.spatial.vel;
			var pos = this.player.spatial.pos;
			this.inputVector.renderBetween(0, 0, vel[0]*100, vel[1]*100)

			var transform = "translate3d("+pos[0]*0.01*GameScreen.getWidth()+"px, "+pos[1]*0.01*GameScreen.getHeight()+"px, 0px)"

			DomUtils.applyElementTransform(this.domRoot, transform)

		};

		return DomPlayer;

	});


