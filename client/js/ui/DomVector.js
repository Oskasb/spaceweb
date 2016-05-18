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
			this.renderVector(fromX, fromY, toX, toY, distance, Math.atan2( toX - fromX, fromY - toY));
		};

		DomVector.prototype.renderVector = function(fromX, fromY, toX, toY, distance, zrot) {
			var x =fromX  + (toX - fromX)*0.5;
			var y =fromY  + (toY - fromY)*0.5;
			var w = distance;
			this.vector.style.height = w+"px";
			this.vector.style.top = -w*0.5+"px";
			var transform = "translate3d("+x+"px, "+y+"px, 0px) rotate3d(0,0,1, "+zrot+"rad)";
			DomUtils.applyElementTransform(this.vector, transform)
		};

		DomVector.prototype.hideVector = function() {
			this.vector.style.height = "0px";
			this.vector.style.top = "0px";
		};

		return DomVector;

	});