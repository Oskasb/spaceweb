"use strict";


define([
        'Events',
        'ui/DomElement',
    'ui/GameScreen'
    ],
    function(
        evt,
        DomElement,
        GameScreen
    ) {

        var DomModule = function(module, parentElem, piece) {
            this.piece = piece;
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


                if (this.applies.roll) {
                    var roll = this.applies.roll;
                    var rotVel = this.piece.spatial.rotVel[0];
           //         console.log(rotVel);
                    this.element.translateXYZ(GameScreen.percentX(Math.clamp(Math.round(Math.abs(rotVel)*rotVel*roll.gain), -roll.clamp, roll.clamp)*roll.width), 0, 0);
                }

                if (this.applies.render) {
                    if (this.applies.render.text) {
                        if (this.element.getText() != this.module.state.value) {
                            this.element.setText(this.module.state.value);
                        }
                    }
                }
            /*
                if (this.applies.random) {
                    var random = this.applies.random;
                    var value = Math.random();
                    //         console.log(rotVel);
                    this.element.translateXYZ(Math.clamp(Math.round(value*random.gain), -random.clamp, random.clamp)*random.width, 0, 0);
                }
            */

            }
        };



        return DomModule;

    });