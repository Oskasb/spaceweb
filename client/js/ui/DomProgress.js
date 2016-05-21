"use strict";


define([
		'Events',
		'ui/GameScreen',
		'ui/DomUtils',
		'ui/DomElement'
	],
	function(
		evt,
		GameScreen,
		DomUtils,
		DomElement
	) {

		var DomProgress = function(parentElem, style) {
			this.root = new DomElement(parentElem, 'progress_box');
			this.progress = new DomElement(this.root.element, 'progress');
		};

		DomProgress.prototype.setProgress = function(fraction) {
			this.progress.element.style.width = 100 * fraction + '%';
		};


		return DomProgress;

	});