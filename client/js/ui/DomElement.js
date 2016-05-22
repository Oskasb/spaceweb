"use strict";


define([
        'Events',
        'ui/GameScreen',
        'ui/DomUtils',
        'PipelineAPI'
    ],
    function(
        evt,
        GameScreen,
        DomUtils,
        PipelineAPI
    ) {

        var count = 0;

        var DomElement = function(parentElem, styleId) {
            count++;
            
            var element = DomUtils.createDivElement(parentElem, count+'_'+Math.random(), '', 'point');
            this.element = element;
            var styleCallback = function(key, data) {
                DomUtils.applyElementStyleParams(element, data)
            };

            setTimeout(function() {
                parentElem.appendChild(element);
            },1);

            PipelineAPI.subscribeToCategoryKey('styles', styleId, styleCallback)

        };

        DomElement.prototype.setText = function(text) {
            this.element.innerHTML = text;
        };
        
        DomElement.prototype.setStyleParam = function(param, value) {
            this.element.style[param] = value;
        };
        
        DomElement.prototype.addStyleJsonId = function(styleId) {

            var element = this.element;

            var styleCallback = function(key, data) {
                DomUtils.applyElementStyleParams(element, data)
            };
            
            PipelineAPI.subscribeToCategoryKey('styles', styleId, styleCallback)
        };

        DomElement.prototype.applyStyleParams = function(params) {
            DomUtils.applyElementStyleParams(this.element, params);
        }

        DomElement.prototype.applyTransform = function(transform) {
            DomUtils.applyElementTransform(this.element, transform);
        };


        DomElement.prototype.scaleXYZ = function(x, y, z) {
            this.applyTransform("scale3d("+x+","+y+","+z+")");
        };

        DomElement.prototype.translateRotateXYZxyzw = function(tx, ty, tz, rx, ry, rz, w) {
            this.applyTransform("translate3d("+tx+"px,"+ty+"px,"+tz+"px) rotate3d("+rx+","+ry+","+rz+", "+w+"rad)");
        };


        DomElement.prototype.translateXYZ = function(x, y, z) {
            this.applyTransform("translate3d("+x+"px,"+y+"px,"+z+"px)");
        };

        DomElement.prototype.rotateXYZ = function(x, y, z, w) {
            this.applyTransform("rotate3d("+x+","+y+","+z+", "+w+"rad)");
        };

        DomElement.prototype.applyTransition = function(transition) {
            DomUtils.setElementTransition(this.element, transition);
        };


        DomElement.prototype.removeElement = function() {
            var element = this;
            element.scaleXYZ(0, 0, 0);
            element.element.style.opacity = 0;
            setTimeout(function() {
            //
                element.element.remove();
            }, 10);

        };



        return DomElement;

    });