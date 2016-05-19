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
			this.dtcount = 0;
			this.id = piece.id;
			this.piece = piece;
			this.vel = [];
			this.pos = [];
			this.rot = [];
			this.rotVel = [];
			this.domRoot = DomUtils.createDivElement(parent, this.id, '', 'point');

			this.domHull = DomUtils.createDivElement(this.domRoot, 'hull_'+this.id, this.id, 'dom_player');

			this.inputVector = new DomVector(GameScreen.getElement());
			this.rotVelVector = new DomVector(GameScreen.getElement());

			this.trafficPredictor = new DomProgress(this.domRoot);

			var _this = this;
			setTimeout(function() {
				_this.domRoot.appendChild(_this.domHull);
				_this.domRoot.appendChild(_this.inputVector.vector);
				_this.domHull.appendChild(_this.rotVelVector.vector);
				_this.domRoot.appendChild(_this.trafficPredictor.root);
			},1)

		};


		DomPlayer.prototype.removeDomPlayer = function() {
			DomUtils.removeElement(this.domRoot);
		};

		DomPlayer.prototype.setIsOwnPlayer = function(bool) {
			DomUtils.addElementClass(this.domHull, 'my_color');
		};


		DomPlayer.prototype.renderStateText = function(text) {
			this.dtcount++;
			var domText = DomUtils.createDivElement(parent, this.id+'_txt'+this.dtcount, text, 'piece_state_hint');
			      var posX = this.pos[0]*0.01*GameScreen.getWidth()-10 + Math.random()*20
			      var posY = this.pos[1]*0.01*GameScreen.getHeight()-20 + Math.random()*40


			var transform = "translate3d("+posX+"px, "+posY+"px, 0px)";
			DomUtils.applyElementTransform(domText, transform);
			setTimeout(function() {

				domText.style.color = "#0ff";
			}, 1);

			domText.innerHTML = text;

			setTimeout(function() {
				DomUtils.removeElement(domText);
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

			DomUtils.applyElementTransform(this.domRoot, transform);


			var rot = "rotate3d(0, 0, 1, "+this.rot[2]+"rad)";

			DomUtils.applyElementTransform(this.domHull, rot)


		};

		return DomPlayer;

	});


