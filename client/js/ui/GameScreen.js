"use strict";

define([

],
	function(
		) {

		var gameScreen;
		var width;
		var height;
		var resolution;
		var element;
		var scalePercentToX;
		var scalePercentToY;
		var sizeFactor;

		var percentZoom = 900;

		var registerAppContainer = function(elem) {

			element = elem;
			element.oncontextmenu = function() { return false; };
			gameScreen = element;
			gameScreen.style.pointerEvents = 'auto';
			window.addEventListener('resize', function(){
				handleResize()
			});
			handleResize();
		};

		var getResolution = function(width, height) {
		//	if (width < height) return height;
			return width;
		};

		var handleResize = function() {
			width = gameScreen.offsetWidth;
			height = gameScreen.offsetHeight;
			resolution = getResolution(width, height);
			sizeFactor = resolution / percentZoom;
			element.style.fontSize = sizeFactor+"px";
		//	scalePercentToX = (1/percentZoom);// * width * ( resolution / width);
		//	scalePercentToY = (1/percentZoom);// * height* ( resolution / height);

			scalePercentToX = (1/percentZoom) * width * ( resolution / width);
			scalePercentToY = (1/percentZoom) * height* ( resolution / height);

		};

		var getElement = function() {
			return gameScreen;
		};

		var getWidth = function() {
			return width;
		};

		var getHeight = function() {
			return height;
		};

		var pxToPercentX = function(px) {
			return px/scalePercentToX;
		};

		var pxToPercentY = function(px) {
			return px/scalePercentToY;
		};

		var percentX = function(percent) {
			return  (width / resolution) *percent*scalePercentToX;
		};

		var percentY = function(percent) {
			return (height / resolution) *percent*scalePercentToY;
		};

		var widthRatio = function(percentx) {
			return percentx * width / percentZoom;
		};

		var heightRatio = function(percenty) {
			return percenty * height / percentZoom;
		};


		var percentToX = function(percent) {
			return (width / resolution) *percent*scalePercentToX * (percentZoom/100);
		};

		var percentToY = function(percent) {
			return (height / resolution) *percent*scalePercentToY * (percentZoom/100);
		};

		var pxToX = function(px) {
			return this.getPxFactor() * px;
		};

		var getPxFactor = function() {
			return (resolution / 1024) * scalePxToX
		};

		var getZoom = function() {
			return percentZoom;
		};


		var setZoomFactor = function(factor) {
			return percentZoom = 100*factor;
		};

		return {
			registerAppContainer:registerAppContainer,
			getElement:getElement,
			getWidth:getWidth,
			getHeight:getHeight,
			getZoom:getZoom,
			percentX:percentX,
			percentY:percentY,
			widthRatio:widthRatio,
			heightRatio:heightRatio,
			pxToPercentX:pxToPercentX,
			pxToPercentY:pxToPercentY,
			percentToX:percentToX,
			percentToY:percentToY
		}

	});