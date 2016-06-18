"use strict";


define([
        'Events',
        'PipelineObject'
    ],
    function(
        evt,
        PipelineObject
    ) {

        var count = 0;

        var GooElement = function(spatial, gooElementId) {
            count++;

            this.particles = [];
            this.callbacks = {};

            this.spatial = spatial;
            var _this = this;

            var elementCallback = function(key, data) {
                _this.removeElement();
                _this.attachGameEffect(spatial, data.game_effect);
            };

            new PipelineObject('goo_elements', gooElementId, elementCallback)
        };


        GooElement.prototype.attachGameEffect = function(spatial, game_effect) {

            var onParticleDead = function(particle) {
                this.particles.splice(this.particles.indexOf(particle), 1);
            }.bind(this);

            var onParticleAdded = function(particle) {
                this.particles.push(particle);
            }.bind(this);

            var particleUpdate = function(particle) {
                particle.lifeSpan = 1;
                particle.position.setArray(spatial.pos.data);
                particle.rotation = spatial.rot[0];
        //        particle.progress = 0.5 + Math.clamp(spatial.rotVel[0]*2, -0.49, 0.49);
            }.bind(this);

            this.callbacks = {
                particleUpdate:particleUpdate,
                onParticleAdded:onParticleAdded,
                onParticleDead:onParticleDead
            };

            evt.fire(evt.list().GAME_EFFECT, {effect:game_effect, pos:spatial.pos, vel:spatial.vel, callbacks:this.callbacks});
        };


        GooElement.prototype.scaleXYZ = function(x, y, z) {
            this.applyTransform("scale3d("+x+","+y+","+z+")");
        };

        GooElement.prototype.setBackgroundColorRGBA = function(r, g, b, a) {
            this.setStyleParam('backgroundColor', "rgba("+Math.floor(r * 255)+","+ Math.floor(g * 255)+","+ Math.floor(b * 255)+","+ a+")");
        };

        GooElement.prototype.translateRotateXYZxyzw = function(tx, ty, tz, rx, ry, rz, w) {
            this.applyTransform("translate3d("+tx+"px,"+ty+"px,"+tz+"px) rotate3d("+rx+","+ry+","+rz+", "+w+"rad)");
        };

        GooElement.prototype.translateScaleXYZSize = function(tx, ty, tz, scale) {
            this.applyTransform("translate3d("+tx+"px,"+ty+"px,"+tz+"px) scale3d("+scale+","+scale+","+scale+")");
        };


        GooElement.prototype.translateXYZ = function(x, y, z) {
            this.applyTransform("translate3d("+x+"px,"+y+"px,"+z+"px)");
        };

        GooElement.prototype.setTransformOrigin = function(x, y) {
            this.element.transformOrigin = x*100+'% '+y*100+'%';
        };

        GooElement.prototype.translateCnvRotateXYZxyzw = function(tx, ty, tz, rx, ry, rz, w) {
            this.applyTransform("translate3d("+GameScreen.pxToPercentX(tx)+"em,"+GameScreen.pxToPercentY(ty)+"em,"+tz+"em) rotate3d("+rx+","+ry+","+rz+", "+w+"rad)");
        };

        GooElement.prototype.translateCnvScaleXYZSize = function(tx, ty, tz, scale) {
            this.applyTransform("translate3d("+GameScreen.pxToPercentX(tx)+"em,"+GameScreen.pxToPercentY(ty)+"em,"+tz+"em) scale3d("+scale+","+scale+","+scale+")");
        };


        GooElement.prototype.translateCnvXYZ = function(x, y, z) {
            this.applyTransform("translate3d("+GameScreen.pxToPercentX(x)+"em,"+GameScreen.pxToPercentY(y)+"em,"+z+"em)");
        };


        GooElement.prototype.rotateXYZ = function(x, y, z, w) {
            this.applyTransform("rotate3d("+x+","+y+","+z+", "+w+"rad)");
        };



        GooElement.prototype.removeElement = function() {
            this.callbacks.particleUpdate = null;

            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].lifeSpan = 1;
                this.particles[i].lifeSpanTotal = 1
            }
        };

        return GooElement;

    });