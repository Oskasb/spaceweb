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
        //    element.style.fontSize = "16px";
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

        DomElement.prototype.applyTransition = function(transition) {
            DomUtils.setElementTransition(this.element, transition);
        };


        DomElement.prototype.removeElement = function() {
            DomUtils.removeElement(this.element);
        };



        return DomElement;

    });