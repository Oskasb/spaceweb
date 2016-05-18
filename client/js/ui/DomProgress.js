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

		var DomProgress = function(parentElem) {
			this.root = DomUtils.createDivElement(parentElem, parentElem.id+'_progress_box', '', 'progress_box');
			this.progress = DomUtils.createDivElement(this.root, this.root.id+'_bar', '', 'progress');
		};

		DomProgress.prototype.setProgress = function(fraction) {
			this.progress.style.width = 100 * fraction + '%';
		};


		return DomProgress;

	});