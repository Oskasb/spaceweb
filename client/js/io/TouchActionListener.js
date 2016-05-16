
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

		var isFullscreen = false;

		function enterFullscreen() {
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
				if (document.requestFullscreen) {
					document.requestFullscreen();
				} else if (document.msRequestFullscreen) {
					document.msRequestFullscreen();
				} else if (document.mozRequestFullScreen) {
					document.mozRequestFullScreen();
				} else if (document.webkitRequestFullscreen) {
					document.webkitRequestFullscreen();
				}
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.msExitFullscreen) {
					document.msExitFullscreen();
				} else if (document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
			}
			return false;
		}



	var handleTouchStart = function() {
		if (!isFullscreen) enterFullscreen();

			touchAction[0] = 1;

		};

		var handleTouchEnd = function() {
			touchAction[0] = 0;
		};

		element.addEventListener(events.touchstart, handleTouchStart);
		element.addEventListener(events.touchend, handleTouchEnd);
	};

	TouchActionListener.prototype.sampleTouchAction = function(mouseStore) {
		mouseStore.action[0] += touchAction[0];
	//	touchAction[0] = 0;
	};

	return TouchActionListener
});
