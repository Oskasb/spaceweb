"use strict";


define([
        '3d/GooEntityFactory',
        'Events'
    ],
    function(
        GooEntityFactory,
        evt
    ) {

        var GooModule = function(module, piece, gooParent) {

        //    this.entity = GooEntityFactory.buildRootEntity();
            this.entity = GooEntityFactory.addChildEntity(gooParent);


            this.tempSpatial = {
                pos:new MATH.Vec3(0, 0, 0),
                rot:new MATH.Vec3(0, 0, 0)
            };
            
            this.particles = [];
            this.piece = piece;
            this.module = module;
            this.applies = module.data.applies;
            this.flicker = 0;
            this.animate = this.applies.animate;
            this.animationState = {};

            if (this.applies) {
                if (this.applies.transform) {
                    GooEntityFactory.attachPrimitive(this.entity);
                    if (this.applies.transform.pos) {
                        GooEntityFactory.translateEntity(this.entity, this.applies.transform.pos);
                    }
                    if (this.applies.transform.rot) {
                        GooEntityFactory.rotateEntity(this.entity, this.applies.transform.rot);
                    }
                }
            }



            if (this.applies.game_effect) {
                this.attachGameEffect(piece.spatial, this.applies.game_effect)
            }

        };


        GooModule.prototype.attachGameEffect = function(spatial, game_effect) {

            var onParticleDead = function(particle) {
                this.particles.splice(this.particles.indexOf(particle), 1);
            }.bind(this);

            var onParticleAdded = function(particle) {
                this.particles.push(particle);
            }.bind(this);

            var particleUpdate = function(particle) {
                particle.lifeSpan = this.piece.temporal.lifeTime;
                particle.position.setArray(spatial.pos.data);
                particle.rotation = spatial.rot[0];
                particle.progress = 0.5 + Math.clamp(spatial.rotVel[0]*2, -0.49, 0.49);
            }.bind(this);

            this.callbacks = {
                particleUpdate:particleUpdate,
                onParticleAdded:onParticleAdded,
                onParticleDead:onParticleDead
            };

            evt.fire(evt.list().GAME_EFFECT, {effect:game_effect, pos:spatial.pos, vel:spatial.vel, callbacks:this.callbacks});
        };


        GooModule.prototype.removeModule = function() {

            this.callbacks.particleUpdate = null;

            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].lifeSpan = this.piece.temporal.lifeTime;
                this.particles[i].lifeSpanTotal = this.particles[i].lifeSpan
            }
            this.entity.removeFromWorld();
        };

        GooModule.prototype.removeGooModule = function() {
            this.entity.removeFromWorld();
            this.removeModuleParticles();
        };

        GooModule.prototype.populateAnimationState = function(state) {
            if (this.applies.flicker) {
                this.flicker = (Math.random()-0.5)*this.applies.flicker
            }
            for (var key in this.animate) {
                this.animationState[key] = this.animate[key]*state * (1-this.flicker);
            }
        };


        GooModule.prototype.updateDomModule = function() {

            if (this.applies) {

                this.entity.transformComponent.updateWorldTransform();
                this.tempSpatial.rot.setXYZ(0, -1, 0);

                this.tempSpatial.pos.data[0] = this.entity.transformComponent.worldTransform.translation.data[0];
                this.tempSpatial.pos.data[1] = this.entity.transformComponent.worldTransform.translation.data[1];
                this.tempSpatial.pos.data[2] = this.entity.transformComponent.worldTransform.translation.data[2];

                this.entity.transformComponent.worldTransform.rotation.applyPost(this.tempSpatial.rot);
                
                if (this.applies.emit_effect) {
                    evt.fire(evt.list().GAME_EFFECT, {effect:this.applies.emit_effect, pos:this.tempSpatial.pos, vel:this.tempSpatial.rot, params:{strength:this.module.state.value*2}});
                }

            }
        };



        return GooModule;

    });