"use strict";


define([
        'Events',
        'ui/DomElement'
    ],
    function(
        evt,
        DomElement
    ) {

        var DomModule = function(module, parentElem) {

            this.module = module;
            this.applies = module.data.applies;
            this.flicker = 0;
            this.animate = this.applies.animate;
            this.animationState = {};

            this.element = new DomElement(parentElem, module.data.applies.style);
        };

        DomModule.prototype.populateAnimationState = function(state) {
            if (this.applies.flicker) {
                this.flicker = (Math.random()-0.5)*this.applies.flicker
            }
            for (var key in this.animate) {
                this.animationState[key] = this.animate[key]*state * (1-this.flicker);
            }
        };

        DomModule.prototype.updateDomModule = function() {
            if (this.applies) {
                this.populateAnimationState(this.module.state.value);
                this.element.applyStyleParams(this.animationState);
            }
        };



        return DomModule;

    });