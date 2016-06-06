"use strict";


define(['Events',
	'ui/GooElement'
],
	function(
		    evt,
			GooElement
		) {

		var ClientWorld = function() {
			this.stars = [];

		};


		ClientWorld.prototype.InitiateClientWorld = function(data) {

		};

		ClientWorld.prototype.ServerWorld = function(data) {

			this.removeStars();
			this.addStars(data);

		};

		ClientWorld.prototype.addStars = function(starData) {
			
			var starTypes = ['blue_star', 'dim_star'];
			
			for (var i = 0; i < starData.length; i++) {
				var pos = starData[i].pos;
				
				var spatial = new MODEL.Spatial();
				spatial.setPosXYZ(pos[0], pos[1], pos[2]);
				
				var element = new GooElement(spatial, starTypes[Math.floor(Math.random()*starTypes.length)]);
				
				this.stars.push(element);
			}
		};

		ClientWorld.prototype.removeStars = function() {

			for (var i = 0; i < this.stars.length; i++) {
				this.stars[i].removeElement();
			}

			this.stars = [];

		};

		ClientWorld.prototype.tick = function(frame) {

		};

		return ClientWorld;

	});