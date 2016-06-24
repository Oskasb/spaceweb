"use strict";


define([
        '3d/GooEntityFactory',
        '3d/effects/GooGameEffect',
        'Events'
    ],
    function(
        GooEntityFactory,
        GooGameEffect,
        evt
    ) {

        var GooModule = function(module, piece, gooParent) {
            
            this.tempSpatial = {
                pos:new MATH.Vec3(0, 0, 0),
                rot:new MATH.Vec3(0, 0, 0)
            };

            var _this = this;
    //        console.log(module.data)

            this.particles = [];
            this.piece = piece;
            this.module = module;
            this.applies = module.data.applies;
            this.flicker = 0;
            this.animate = this.applies.animate;
            this.animationState = {};

            this.gameEffect = new GooGameEffect();

            this.effectData = {
                params:{},
                state:{}
            };

            this.callbacks = {};

            if (this.applies) {

                if (this.applies.effect_data) {
                    this.setupEffectData(this.applies.effect_data, this.applies.state_factor || 1);
                }

                if (this.applies.transform) {
                    //    this.entity = GooEntityFactory.buildRootEntity();
                    this.entity = GooEntityFactory.addChildEntity(gooParent);
        //            GooEntityFactory.attachPrimitive(this.entity);
                    if (this.applies.transform.pos) {
                        GooEntityFactory.translateEntity(this.entity, this.applies.transform.pos);
                    }
                    if (this.applies.transform.rot) {
                        GooEntityFactory.rotateEntity(this.entity, this.applies.transform.rot);
                    }
                } else {
                    this.entity = gooParent;
                }
            }

            
            
            if (this.applies.game_effect) {

                var getRotation = function() {
                    return piece.spatial.rot[0]
                };

                var getPosition = function() {

                    if  (_this.applies.transform) {
                        return _this.tempSpatial.pos.data;
                    } else {
                        return piece.spatial.pos.data;
                    }

                };



                if (this.applies.animate) {

                    var spread = this.applies.animate.spread * (Math.random()-0.5) || 0;
                    var diffusion = this.applies.animate.diffusion || 0;
                    var speed = this.applies.animate.speed || 1;
                    var size = this.applies.animate.size || 1;

                    var diffuse = function() {
                        return 1 - (Math.random()*diffusion)
                    };

                    if (this.applies.animate.rotation) {
                        var rot = this.applies.animate.rotation;
                        getRotation = function(particle, tpf) {
                            return particle.rotation + (rot*tpf * (1-spread) + tpf*(1-diffuse()));
                        };
                    }
                    
                    
                    var pos = [0, 0, 0];

                    if (this.applies.animate.oscillate) {

                        var osc = this.applies.animate.oscillate;
                        var time = 0;
                        
                        var posX = function() {
                            return Math.sin(1-spread * time * speed*diffuse())*osc*size;
                        };

                        var posY = function() {
                            return Math.cos(1-spread * time * speed)*diffuse()*osc*size;
                        };
                        
                        getPosition = function(particle, tpf) {

                            time += tpf;

                         //   pos[0] = _this.tempSpatial.rot.data[0];
                         //   pos[1] = _this.tempSpatial.rot.data[1];
//
                            pos[0] = _this.tempSpatial.pos.data[0];
                            pos[1] = _this.tempSpatial.pos.data[1];
                            pos[2] = _this.tempSpatial.pos.data[2];

                            pos[0] = pos[0] + posX() + Math.cos(time*spread+diffuse())*size;
                            pos[1] = pos[1] + posY() + Math.sin(time*spread)*size+diffuse();
                            return pos;
                        };
                    }
                };

                var particleUpdate = function(particle, tpf) {
                    particle.lifeSpan = piece.temporal.lifeTime;
                    particle.position.setArray(getPosition(particle, tpf));
                    particle.rotation = getRotation(particle, tpf);
                    particle.progress = 0.5 + Math.clamp(piece.spatial.rotVel[0]*2, -0.49, 0.49);
                };

                this.attachGameEffect(piece.spatial, this.applies.game_effect, particleUpdate)
            }


            if (this.applies.transform) {
                this.readWorldTransform(this.applies.transform.pos, this.applies.transform.rot)
            }

            if (this.applies.spawn_effect) {

           //     setTimeout(function() {
                    evt.fire(evt.list().GAME_EFFECT, {effect:module.data.applies.spawn_effect, pos:piece.spatial.pos, vel:piece.spatial.vel});
           //     }, 100);

            }
        };


        GooModule.prototype.attachGameEffect = function(spatial, game_effect, particleUpdate) {
            this.gameEffect.attachGameEffect(spatial, game_effect, particleUpdate)
        };


        GooModule.prototype.removeModule = function() {


            if (this.applies.remove_effect) {
                this.tempSpatial.rot.setXYZ(0, 0, 0);
                evt.fire(evt.list().GAME_EFFECT, {effect:this.applies.remove_effect, pos:this.piece.spatial.pos, vel:this.tempSpatial.rot});
            }

            this.gameEffect.removeGooEffect();

            this.entity.removeFromWorld();
        };

        GooModule.prototype.setupEffectData = function(effectData, factor) {
            for (var key in effectData) {
                this.effectData.params[key] = effectData[key] / factor;
                this.effectData.state[key] = 0;
            }
        };

        GooModule.prototype.populateEffectData = function(amplitude) {
            for (var key in this.effectData.params) {
                this.effectData.state[key] = this.effectData.params[key] * amplitude;
            }
        };

        GooModule.prototype.populateAnimationState = function(state) {
            if (this.applies.flicker) {
                this.flicker = (Math.random()-0.5)*this.applies.flicker
            }
            for (var key in this.animate) {
                this.animationState[key] = this.animate[key]*state * (1-this.flicker);
            }
        };


        GooModule.prototype.readWorldTransform = function(pos, rot) {

            this.entity.transformComponent.updateWorldTransform();
            this.tempSpatial.rot.setXYZ(rot[0], rot[1], rot[2]);

            this.entity.transformComponent.worldTransform.rotation.applyPost(this.tempSpatial.rot);

            this.tempSpatial.pos.setXYZ(pos[0], pos[1], pos[2]);

            this.entity.transformComponent.worldTransform.rotation.applyPost(this.tempSpatial.pos);

            this.tempSpatial.pos.data[0] = this.entity.transformComponent.worldTransform.translation.data[0];
            this.tempSpatial.pos.data[1] = this.entity.transformComponent.worldTransform.translation.data[1];
            this.tempSpatial.pos.data[2] = this.entity.transformComponent.worldTransform.translation.data[2];

    //        evt.fire(evt.list().DRAW_POINT_AT, {pos:this.entity.transformComponent.worldTransform.translation, color:"YELLOW"})
        };


        GooModule.prototype.updateGooModule = function() {

            if (this.applies) {

                if (this.applies.transform) {
                    this.readWorldTransform(this.applies.transform.pos, this.applies.transform.rot)
                } else {
                    this.tempSpatial.pos.setVec(this.piece.spatial.pos);
                    this.tempSpatial.rot.setXYZ(0, 0, this.piece.spatial.rot);
                }
                
                   if (this.module.on) {
                        
                        if (this.gameEffect.started) {
                            if (this.gameEffect.paused) {
                                this.gameEffect.startGooEffect();
                            }
                        }
                        
                        if (this.module.state.value > 0 && this.applies.emit_effect) {
                            if (typeof(this.module.state.value) == 'number') {                              
                                this.populateEffectData(this.module.state.value);
                            } else {
                                var intensity = this.applies.effect_data.intensity || 0.5;
                                this.populateEffectData(Math.random()*intensity);
                            }
                            
                            evt.fire(evt.list().GAME_EFFECT, {effect:this.applies.emit_effect, pos:this.tempSpatial.pos, vel:this.tempSpatial.rot, params:this.effectData.state});
                        }
                        
                    } else {
                        if (this.gameEffect.started) {
                            if (!this.gameEffect.paused) {
                                this.gameEffect.pauseGooEffect();
                            }
                        }
                    }
                        



                    //         evt.fire(evt.list().GAME_EFFECT, {effect:this.applies.emit_effect, pos:this.tempSpatial.pos, vel:this.tempSpatial.rot, params:{strength:this.module.state.value*2, count:1}});
                }
            
        };



        return GooModule;

    });