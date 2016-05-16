
define([], function() {


	var touchAction = [0];

	var touchOn = false;

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
			if (touchOn) {
				touchAction[0] = 1;
			} else {
				touchOn = true;
			}

		};

		var handleTouchEnd = function() {
			touchAction[0] = 0;
			touchOn = false;
		};

		element.addEventListener(events.touchstart, handleTouchStart);
		element.addEventListener(events.touchend, handleTouchEnd);
	};

	TouchActionListener.prototype.sampleTouchAction = function(mouseStore) {

		mouseStore.action[0] += touchAction[0];
		touchAction[0] = 0;
	};

	return TouchActionListener
});
