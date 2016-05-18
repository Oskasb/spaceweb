"use strict";


define([
	'Events',
	'ui/GameScreen',
	'ui/DomUtils',
	'ui/DomVector'
],
	function(
		evt,
		GameScreen,
		DomUtils,
		DomVector
		) {

		var cursor;
		var connector;

		var pos = {
			x:0,
			y:0
		};

		var vector = false;

		var handleCursorMove = function(e) {

			var pointer = evt.args(e).pointer;

			if (vector) {

			} else {
				connector.hideVector();
				pos.x = pointer.x;
				pos.y = pointer.y;
			}

			var action = (evt.args(e).action[0]+evt.args(e).action[1])*0.4  + 1;

			var transform = "translate3d("+pos.x+"px, "+pos.y+"px, 0px) scale3d("+action+","+action+", 1)";
			DomUtils.applyElementTransform(cursor, transform);
			vector = false;
		};


		var handleCursorVector = function(e) {
			vector = true;
			var args = evt.args(e);
			pos.x = args.fromX;
			pos.y = args.fromY;

			connector.renderVector(args.fromX, args.fromY, args.toX, args.toY, args.w, args.zrot)
		};

		var DomCursor = function(pointerCursor) {
			this.pointerCursor = pointerCursor;

		};

		var handleClientReady = function() {
			cursor = DomUtils.createDivElement(GameScreen.getElement(), 'cursor', '', 'pointer');
			connector = new DomVector(GameScreen.getElement());
			setTimeout(function() {
				evt.on(evt.list().CURSOR_MOVE, handleCursorMove);
				evt.on(evt.list().CURSOR_LINE, handleCursorVector);
			}, 1);

		};

		evt.on(evt.list().CLIENT_READY, handleClientReady);

		return DomCursor;

	});





