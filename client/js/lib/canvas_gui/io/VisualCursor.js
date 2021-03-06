"use strict";

define([
	'gui/io/GameScreen'
],
	function(
		GameScreen
		) {

		var SystemBus = goo.SystemBus;
		
		var VisualCursor = function() {
			this.x = 0;
			this.y = 0;
			this.vectorColor = [0.3, 0.9, 0.8, 1];
			this.renderPointer = {
				pointer:{
					x:0,
					y:0,
					hidden:false
				}
			}
		};

		VisualCursor.prototype.pxXtoPercentX = function(x) {
			return 100*x/GameScreen.getWidth()
		};

		VisualCursor.prototype.pxYtoPercentY = function(y) {
			return 100*y/GameScreen.getHeight();
		};


		VisualCursor.prototype.moveTo = function(x, y, hoverCount) {
			this.renderPointer.pointer.x = this.pxXtoPercentX(x);
			this.renderPointer.pointer.y = this.pxYtoPercentY(y);
			this.renderPointer.pointer.hidden = hoverCount;
			SystemBus.emit('pointerGuiState', this.renderPointer);
			return this.renderPointer.pointer;
		};

		VisualCursor.prototype.transformConnector = function(x1, y1, x2, y2, distance) {
			var width = GameScreen.getWidth();
			var height = GameScreen.getHeight();
			SystemBus.emit('guiFlash', {
				renderData:{
					line:{
						fromX:x1*100/width,
						fromY:y1*100/height,
						toX:x2*100/width,
						toY:y2*100/height,
						w: 2*1+(distance+0.4),
						color:this.vectorColor
					},
					zIndex:10000}
			});
		};

		VisualCursor.prototype.showDragToPoint = function(x, y, distance, angle) {
			var width = GameScreen.getWidth();
			var height = GameScreen.getHeight();
			SystemBus.emit('guiFlash', {
				renderData:{
					arc:{
						x:this.renderPointer.pointer.x,
						y:this.renderPointer.pointer.y,
						radius:8+12*(distance),
						start:-Math.PI*0.5+angle+(Math.PI*distance),
						end:-Math.PI*0.5+angle-(Math.PI*distance),
						w: 2*1+(distance+0.4),
						color:this.vectorColor
					},
					zIndex:10000}

			});
		};

		VisualCursor.prototype.showStartDragPoint = function(x, y, distance, angle) {

			var width = GameScreen.getWidth();
			var height = GameScreen.getHeight();

			SystemBus.emit('guiFlash', {
				renderData:{
					arc:{
						x:100*x/width,
						y:100*y/height,
						radius:4/(distance+0.1),
						start:-Math.PI*0.5+angle+(Math.PI*distance),
						end:-Math.PI*0.5+angle-(Math.PI*distance),
						w: 2+(distance+0.4),
						color:this.vectorColor
					},
					line:{
						x:100*x/width,
						y:100*y/height,
						toX:100*x/width+20*distance,
						toY:100*y/height,
						w: 2+(distance+0.4),
						color:this.vectorColor
					},
					zIndex:10000}
			});
			SystemBus.emit('guiFlash', {
				renderData:{
					line:{
						x:100*x/width,
						y:100*y/height,
						toX:100*x/width,
						toY:100*y/height+20*distance,
						w: 2+(distance+0.4),
						color:this.vectorColor
					},
					zIndex:10000}
			});
		};

		VisualCursor.prototype.showPressPoint = function(state) {
			SystemBus.emit('guiFlash', {
				renderData:{
					arc:{
						x:this.renderPointer.pointer.x,
						y:this.renderPointer.pointer.y,
						radius:5+4*state,
						start:2*Math.PI,
						end:0,
						w: 5+2*state,
						color:this.vectorColor
					},
					zIndex:10000}
			});
		};

		VisualCursor.prototype.visualizeMouseAction = function(action) {
			//	console.log("mouse:", action, xy);
			this.vectorColor[0]=0.5+action[0]*0.5;
			this.vectorColor[1]=0.5+action[1]*0.5;

			this.showPressPoint(action[0]+action[1]);

		};


		VisualCursor.prototype.lineDistance = function(fromX, fromY, toX, toY) {
			return Math.sqrt((fromX - toX)*(fromX - toX) + (fromY - toY)*(fromY - toY));
		};

		VisualCursor.prototype.visualizeVector = function(fromX, fromY, toX, toY) {
			var distance = 0.008*this.pxXtoPercentX(this.lineDistance(fromX, fromY, toX, toY));
			this.vectorColor[0]=0.5+distance*0.5;
			this.vectorColor[1]=1-distance*0.5;
			this.vectorColor[2]=1-distance*0.5;
			this.showStartDragPoint(fromX, fromY, distance, Math.atan2( toX - fromX, fromY - toY));
			this.transformConnector(fromX, fromY, toX, toY, distance);
			this.showDragToPoint(toX, toY, distance , Math.atan2(fromX - toX, toY - fromY) );
		};

		return VisualCursor;

	});