"use strict";


define(['Events',
		'ui/DomElement',
	'ui/GameScreen'

],
	function(
		    evt,
			DomElement,
			GameScreen
		) {

		var ClientWorld = function() {
			this.stars = [];

		};


		ClientWorld.prototype.InitiateClientWorld = function(data) {

		};

		ClientWorld.prototype.ServerWorld = function(data) {
			
			this.addStars(data);

		};

		ClientWorld.prototype.addStars = function(starData) {
			for (var i = 0; i < starData.length; i++) {
				var pos = starData[i].pos;
				var element = new DomElement(GameScreen.getElement(), 'background_star');

				var distance = Math.floor(pos[2])*0.006;

				var params = {
					top : Math.floor(pos[0])+'%',
					left : Math.floor(pos[1])+'%',
					opacity:distance

				};

				element.applyStyleParams(params);
				element.scaleXYZ(distance*distance, distance*distance, 1);

				this.stars.push(element);
			}
		};

		ClientWorld.prototype.tick = function(frame) {

		};

		return ClientWorld;

	});