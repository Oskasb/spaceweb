"use strict";


define([
		'Events',
		'ui/GameScreen',
		'ui/DomUtils',
		'ui/DomVector',
		'ui/DomProgress',
		'ui/DomElement'
	],
	function(
		evt,
		GameScreen,
		DomUtils,
		DomVector,
		DomProgress,
		DomElement
	) {

		var parent = document.getElementById('game_window');

		var DomPlayer = function(piece) {
			this.dtcount = 0;
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

			this.trafficPredictor = new DomProgress(this.domRoot.element);

		};


		DomPlayer.prototype.removeDomPlayer = function() {
			DomUtils.removeElement(this.domRoot);
		};

		DomPlayer.prototype.setIsOwnPlayer = function(bool) {
			this.domHull.addStyleJsonId('ship_hull_friendly');
		};


		DomPlayer.prototype.renderStateText = function(text) {
			this.dtcount++;

			var domText = new DomElement(parent, 'piece_state_hint');
		//	domText.element.style.fontSize = "100px";
			domText.setText(text);
		//	var domText = DomUtils.createDivElement(parent, this.id+'_txt'+this.dtcount, text, 'piece_state_hint');
			var posX = this.pos[0]*0.01*GameScreen.getWidth()-10 + Math.random()*20
			var posY = this.pos[1]*0.01*GameScreen.getHeight()-20 + Math.random()*40

			var transform = "translate3d("+posX+"px, "+posY+"px, 0px)";

			domText.applyTransform(transform);

			domText.applyTransition("all 1s ease-out");
			
			setTimeout(function() {

				var transform = "translate3d("+posX+100+"px, "+posY+"px, 0px)";

				domText.applyTransform(transform);
		//		domText.style.color = "#0ff";
			}, 1);

			domText.innerHTML = text;

			setTimeout(function() {
				domText.removeElement();
			}, 500);
		};

		DomPlayer.prototype.updateDomPlayer = function() {



			this.piece.spatial.getVelArray(this.vel);
			this.piece.spatial.getPosArray(this.pos);
			this.piece.spatial.getRotArray(this.rot);
			this.piece.spatial.getRotVelArray(this.rotVel);
			//	DEBUG_MONITOR(this.rot)


			//	DEBUG_MONITOR(this.rot)

			this.inputVector.renderBetween(0, 0, this.vel[0]*30, this.vel[1]*30);

			this.rotVelVector.renderRadial(90, this.rotVel[2]);

			this.trafficPredictor.setProgress(this.piece.temporal.fraction);

			var transform = "translate3d("+this.pos[0]*0.01*GameScreen.getWidth()+"px, "+this.pos[1]*0.01*GameScreen.getHeight()+"px, 0px)";

			this.domRoot.applyTransform(transform);


			var rot = "rotate3d(0, 0, 1, "+this.rot[2]+"rad)";

			this.domHull.applyTransform(rot);


		};

		return DomPlayer;

	});


