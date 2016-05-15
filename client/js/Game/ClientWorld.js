"use strict";


define([

],
	function(

		) {

		var ClientWorld = function() {

		};


		ClientWorld.prototype.InitiateClientWorld = function(data) {

		};

		ClientWorld.prototype.ServerWorld = function(data) {
			console.log("Star Data ", data)

			var time = 100;

			var append = function(pos) {

					var top = Math.floor(pos[0]);
					var left = Math.floor(pos[1]);
					var distance = Math.floor(pos[2])

					document.getElementById('game_window').innerHTML += '<div style="top:'+top+'%;left:'+left+'%;position:absolute;width:2%;height:2%;opacity:'+0.01*distance+';z-index:100;background:#fff;"></div>';
			};

			for (var i = 0; i < data.length; i++) {

				append(data[i].pos);

			}

		};

		ClientWorld.prototype.tick = function(frame) {

		};

		return ClientWorld;

	});