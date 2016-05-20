"use strict";


define([
	'Events',
	'ui/DomElement'
],
	function(
		evt,
		DomElement
		) {

		var DomVector = function(parentElem) {
			this.vector = new DomElement(parentElem, 'connector');

			this.vecStyle = {};
			
			
		};

		DomVector.prototype.lineDistance = function(fromX, fromY, toX, toY) {
			return Math.sqrt((fromX - toX)*(fromX - toX) + (fromY - toY)*(fromY - toY));
		};

		DomVector.prototype.renderBetween = function(fromX, fromY, toX, toY) {
			var distance = this.lineDistance(fromX, fromY, toX, toY);
			var x =fromX  + (toX - fromX)*0.5;
			var y =fromY  + (toY - fromY)*0.5;

			var zrot = Math.atan2( toX - fromX, fromY - toY);
			this.vecStyle.height = distance+"px";
			this.vecStyle.top = -distance*0.5+"px";
			
			this.vector.applyStyleParams(this.vecStyle);
			
			var transform = "translate3d("+x+"px, "+y+"px, 0px) rotate3d(0,0,1, "+zrot+"rad)";
			this.vector.applyTransform(transform);
		};

		DomVector.prototype.renderRadial = function(distance, angle) {
			this.vecStyle.height = distance+"px";
			this.vector.applyStyleParams(this.vecStyle);
			var transform = "rotate3d(0,0,1, "+angle+"rad)";
			this.vector.applyTransform(transform);
		};


		DomVector.prototype.hideVector = function() {
			this.vecStyle.height = "0px";
			this.vecStyle.top = "0px";
			this.vector.applyStyleParams(this.vecStyle);
		};

		return DomVector;

	});