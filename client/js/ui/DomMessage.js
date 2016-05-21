"use strict";


define([
        'ui/DomElement'
    ],
    function(
        DomElement
    ) {

        var DomMessage = function(parentElem, text, style, posX, posY, duration) {
            var domText = new DomElement(parentElem, style);

            domText.setText(text);
            domText.translateXYZ(posX, posY, 0);
            domText.applyTransition("all "+duration+"s ease-in");
            domText.innerHTML = text;

            this.domText = domText;
            setTimeout(function() {
                domText.removeElement();
            }, duration*1000 + 100);
        };

        DomMessage.prototype.animateToXYZ = function(x, y, z) {
            var domText = this.domText;
            setTimeout(function() {
                domText.translateXYZ(x, y, z);
                domText.applyStyleParams({color : "rgba(255, 255, 255, 0)"});
            }, 60);
        };

        return DomMessage;

    });