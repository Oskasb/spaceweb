"use strict";


define([
	'Events',
	'ui/GameScreen',
	'ui/DomUtils',
	'ui/DomVector',
	'ui/DomElement'
],
	function(
		evt,
		GameScreen,
		DomUtils,
		DomVector,
		DomElement
		) {

		var cursor;
		var connector;

		var pos = {
			x:0,
			y:0
		};

		var vector = false;

		var handleCursorMove = function(e) {

			if (!SYSTEM_SETUP.DEBUG.renderCursor) return;

			var pointer = evt.args(e).pointer;

			if (vector) {

			} else {
				connector.hideVector();
				pos.x = pointer.x;
				pos.y = pointer.y;
			}

			var action = (evt.args(e).action[0]+evt.args(e).action[1])*0.4  + 1;

	//		var transform = "translate3d("+pos.x+"px, "+pos.y+"px, 0px) scale3d("+action+","+action+", 1)";

			cursor.translateScaleXYZSize(pos.x, pos.y, 0, action, action, 0);

		//	cursor.applyTransform(transform);
			vector = false;
		};


		var handleCursorVector = function(e) {
			if (!SYSTEM_SETUP.DEBUG.renderCursor) return;
			vector = true;
			var args = evt.args(e);
			pos.x = args.fromX;
			pos.y = args.fromY;
			connector.renderBetween(args.fromX, args.fromY, args.toX, args.toY);
		};

		var DomCursor = function(pointerCursor) {
			this.pointerCursor = pointerCursor;

		};

		DomCursor.prototype.getCursorElement = function() {
			return cursor;	
		};

		var handleClientReady = function() {
			if (cursor) return;
			cursor = new DomElement(GameScreen.getElement(), 'pointer'); //   DomUtils.createDivElement(GameScreen.getElement(), 'cursor', '', 'pointer');
			connector = new DomVector(GameScreen.getElement());
			setTimeout(function() {
				evt.on(evt.list().CURSOR_MOVE, handleCursorMove);
				evt.on(evt.list().CURSOR_LINE, handleCursorVector);
			}, 1);

		};

		
		
		evt.on(evt.list().CLIENT_READY, handleClientReady);

		return DomCursor;

	});





