"use strict";


define([
        'ui/DomElement'
    ],
    function(
        DomElement
    ) {

        var DomEffect = function(parentElem, style, posX, posY, duration) {
            var fxElem = new DomElement(parentElem, style);
            this.fxElem = fxElem;
            fxElem.translateScaleXYZSize(posX, posY, 0, 0);
            fxElem.applyTransition("all "+duration+"s ease-in");

            this.fadeToOpacity(0);
            setTimeout(function() {
                fxElem.removeElement();
            }, duration*1000 + 50);
        };

        DomEffect.prototype.animateToXYZ = function(x, y, z) {
            var fxElem = this.fxElem;
            setTimeout(function() {
                fxElem.translateXYZ(x, y, z);
                fxElem.applyStyleParams({color : "rgba(255, 255, 255, 0)"});
            }, 10);
        };

        DomEffect.prototype.animateToXYZxyzw = function(x, y, z, xs, ys, zs, w) {
            var fxElem = this.fxElem;
            setTimeout(function() {
                fxElem.translateRotateXYZxyzw(x, y, z, xs, ys, zs, w);
                fxElem.applyStyleParams({color : "rgba(255, 255, 255, 0)"});
            }, 10);
        };


        DomEffect.prototype.fadeToOpacity = function(opacity) {
            var fxElem = this.fxElem;
            setTimeout(function() {
                fxElem.applyStyleParams({opacity : opacity});
            }, 100);
        };

        DomEffect.prototype.animateToXYZscale = function(x, y, z, scale) {
            var fxElem = this.fxElem;
            setTimeout(function() {
                fxElem.translateScaleXYZSize(x, y, z, scale);
                fxElem.applyStyleParams({color : "rgba(255, 255, 255, 0)"});
            }, 50);
        };
        
        return DomEffect;

    });