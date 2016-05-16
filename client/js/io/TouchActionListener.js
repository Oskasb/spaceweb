
define([], function() {

	var touchAction = [0];

	var events = {
		touchstart:'touchstart',
		touchend:'touchend',
		touchmove:'touchmove'
	};

	var inputIsTouch = 'ontouchstart' in document.documentElement;

	var TouchActionListener = function() {
		this.enabled = inputIsTouch;
	};

	TouchActionListener.prototype.setupElementTouchListener = function(element) {

		var handleTouchStart = function() {
			touchAction[0] = 1;
			document.querySelector('#touch').innerHTML = 'touch: handleTouchStart';
		};

		var handleTouchEnd = function() {
			touchAction[0] = 0;
			document.querySelector('#touch').innerHTML = 'touch: handleTouchEnd';
		};

		element.addEventListener(events.touchstart, handleTouchStart);
		element.addEventListener(events.touchend, handleTouchEnd);
	};

	TouchActionListener.prototype.sampleTouchAction = function(mouseStore) {
		document.querySelector('#touch').innerHTML = 'touch: sample '+ touchAction;
		mouseStore.action[0] += touchAction[0];
	//	touchAction[0] = 0;
	};

	return TouchActionListener
});
