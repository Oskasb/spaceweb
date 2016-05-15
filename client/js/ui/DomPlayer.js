"use strict";


define([
	'Events',
	'ui/GameScreen',
	'ui/DomUtils'
],
	function(
		evt,
		GameScreen,
		DomUtils
		) {

		var DomPlayer = function(player) {
			this.id = player.playerId;
			this.player = player;
			this.pos = player.spatial.pos;
			this.domRoot = DomUtils.createDivElement(GameScreen.getElement(), this.id, this.id, 'dom_player');
		};


		DomPlayer.prototype.removeDomPlayer = function() {
			DomUtils.removeElement(this.domRoot);
		};

		DomPlayer.prototype.updateDomPlayer = function() {


			var transform = "translate3d("+this.pos[0]*0.01*GameScreen.getWidth()+"px, "+this.pos[1]*0.01*GameScreen.getHeight()+"px, 0px)"

			DomUtils.applyElementTransform(this.domRoot, transform)

		};

		return DomPlayer;

	});


