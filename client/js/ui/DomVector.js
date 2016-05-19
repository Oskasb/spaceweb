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

		var DomVector = function(parentElem) {
			this.vector = DomUtils.createDivElement(parentElem, parentElem.id+'_vector', '', 'connector');
		};

		DomVector.prototype.lineDistance = function(fromX, fromY, toX, toY) {
			return Math.sqrt((fromX - toX)*(fromX - toX) + (fromY - toY)*(fromY - toY));
		};

		DomVector.prototype.renderBetween = function(fromX, fromY, toX, toY) {
			var distance = this.lineDistance(fromX, fromY, toX, toY);
			var x =fromX  + (toX - fromX)*0.5;
			var y =fromY  + (toY - fromY)*0.5;

			var zrot = Math.atan2( toX - fromX, fromY - toY);
			this.vector.style.height = distance+"px";
			this.vector.style.top = -distance*0.5+"px";
			var transform = "translate3d("+x+"px, "+y+"px, 0px) rotate3d(0,0,1, "+zrot+"rad)";
			DomUtils.applyElementTransform(this.vector, transform)
		};

		DomVector.prototype.renderRadial = function(distance, angle) {

		//	this.renderVector(0, 0, distance, degrees);
			this.vector.style.height = distance+"px";
		//	this.vector.style.top = "0px" // -distance*0.5+"px";
			var transform = "rotate3d(0,0,1, "+angle+"rad)";
			DomUtils.applyElementTransform(this.vector, transform)
		};

		DomVector.prototype.renderVector = function(x, y, w, zrot) {

		};

		DomVector.prototype.hideVector = function() {
			this.vector.style.height = "0px";
			this.vector.style.top = "0px";
		};

		return DomVector;

	});