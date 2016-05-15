"use strict";


define(['Events'

],
	function(
		    evt
		) {

		var ClientWorld = function() {


		};


		ClientWorld.prototype.InitiateClientWorld = function(data) {

		};

		ClientWorld.prototype.ServerWorld = function(data) {

			var append = function(pos) {

					var top = Math.floor(pos[0]);
					var left = Math.floor(pos[1]);
					var distance = Math.floor(pos[2])*0.01;

					var w = distance * 1.5;

					document.getElementById('game_window').innerHTML += '<div style="top:'+top+'%;left:'+left+'%;position:absolute;width:'+w+'%;height:'+w+'%;opacity:'+distance+';z-index:100;background:#fff;"></div>';
			};

			for (var i = 0; i < data.length; i++) {

				append(data[i].pos);

			}

		};

		ClientWorld.prototype.tick = function(frame) {

		};

		return ClientWorld;

	});