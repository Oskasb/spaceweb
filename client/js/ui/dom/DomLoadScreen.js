"use strict";


define([
		'Events',
		'ui/GameScreen',
		'ui/dom/DomUtils'
	],
	function(
		evt,
		GameScreen,
		DomUtils
	) {

		var DomLoadScreen = function(parentElem) {
			this.root = DomUtils.createDivElement(document.body, 'load_screen', '', 'point');

			var rootStyle = {
				width: '100%',
				height: '100%',
                zIndex: 2000,
                backgroundColor: 'rgb(20, 0, 32)',
                transition: 'all 0.5s ease-in-out'
			};

			DomUtils.applyElementStyleParams(this.root, rootStyle);

            var hStyle = {
                width: '100%',
                height: '50%',
                top: '25%',
                textAlign: 'center',
                fontSize: '60em',
                zIndex: 100,
                color: 'rgba(255, 155, 45, 1)',
                transition: 'all 1.6s ease-in-out'
            };

            this.progHeader = DomUtils.createDivElement(this.root, 'phead', 'twinkio.com', 'point');

            DomUtils.applyElementStyleParams(this.progHeader, hStyle);

			var cStyle = {
				width: '100%',
				height: '30em',
				bottom: '0%',
			    backgroundColor: 'rgb(120, 50, 12)',
				transformOrigin: "0% 0%",
                transition: 'all 0.7s ease-in-out'
			};

			this.progContainer = DomUtils.createDivElement(this.root, 'pcont', '', 'point');

			DomUtils.applyElementStyleParams(this.progContainer, cStyle);

			var pStyle = {
				width: '100%',
				height: '100%',
				left: '0%',
				backgroundColor: 'rgb(255, 150, 22)',
				transformOrigin: "0% 0%",
                transform: 'scale3d(0, 1, 1)'
			};
			
			this.progress = DomUtils.createDivElement(this.progContainer, 'progress', '', 'point');



			DomUtils.applyElementStyleParams(this.progress, pStyle);

            var countStyle = {
                width: '100%',
                height: '100%',
                top: "auto",
                left: '0%',
                textAlign: 'center',
                fontSize: '25em',
                zIndex: 100,
                color: 'rgb(255, 255, 195)'

            };

            this.progCounter = DomUtils.createDivElement(this.progContainer, 'pcounter', 'Relaod to wake Server', 'point');

            DomUtils.applyElementStyleParams(this.progCounter, countStyle);

            this.setProgress(0);
		};

		DomLoadScreen.prototype.setProgress = function(fraction) {
            this.progCounter.innerHTML = Math.round(fraction*100)+'%';
			// this.progress.element.style.width = 100 * fraction + '%';
            var style = {
                transform: 'scale3d('+fraction+', 1, 2)'
            };
            DomUtils.applyElementStyleParams(this.progress, style);

		};

		DomLoadScreen.prototype.setLowlight = function() {
			this.progress.deFlashElement();
		};

		DomLoadScreen.prototype.setHighlight = function() {
			this.progress.flashElement();
		};

		DomLoadScreen.prototype.removeProgress = function() {
            var style = {
                transform: 'translate3d(0px, 40px, 0px)'
            };
            DomUtils.applyElementStyleParams(this.progContainer, style);

            var _this = this;


            setTimeout(function() {

                style = {
                    backgroundColor: 'rgba(0, 0, 0, 0)'
                };


                DomUtils.applyElementStyleParams(_this.root, style);


                style = {
                    transform: 'translate3d(0px, -140px, 0px) scale3d(0.2, 0.2, 2)',
                    color: 'rgba(0, 255, 0, 0)'
                };

                DomUtils.applyElementStyleParams(_this.progHeader, style);


                setTimeout(function() {
                    DomUtils.removeElement(_this.root);
                }, 1500)


            },400);
	//		DomUtils.removeElement(this.root);
		};

		return DomLoadScreen;

	});