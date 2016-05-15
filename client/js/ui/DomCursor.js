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

		var cursor;

		var handleCursorMove = function(e) {
			var pointer = evt.args(e).pointer;

			cursor = DomUtils.getElementById('cursor');

			var transform = "translate3d("+pointer.x*0.01*GameScreen.getWidth()+"px, "+pointer.y*0.01*GameScreen.getHeight()+"px, 0px)"

			DomUtils.applyElementTransform(cursor, transform)

		//	console.log(cursor, pointer)
		//	cursor.style.top = pointer.y + '%';
		//	cursor.style.left = pointer.x + '%';
		};

		var DomCursor = function(pointerCursor) {
			this.pointerCursor = pointerCursor;


		};



		var handleClientReady = function() {

			cursor = DomUtils.createDivElement(GameScreen.getElement(), 'cursor', "Cursor", 'pointer');

			evt.on(evt.list().CURSOR_MOVE, handleCursorMove);

		};

		evt.on(evt.list().CLIENT_READY, handleClientReady);

		return DomCursor;

	});





