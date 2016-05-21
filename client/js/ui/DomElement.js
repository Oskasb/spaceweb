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
            
            var element = DomUtils.createDivElement(parentElem, 'element_'+count, '', 'point');
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
            DomUtils.removeElement(this.element);
        };



        return DomElement;

    });