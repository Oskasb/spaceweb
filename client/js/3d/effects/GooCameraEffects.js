"use strict";


define([
        '3d/GooEntityFactory',
        'goo/math/Vector3',
        'Events'
    ],
    function(
        GooEntityFactory,
        Vector3,
        evt
    ) {


        var effectIndex  = {
            hyper_drive:{vector:new Vector3(0, 0, 220)},
            shield:{vector:new Vector3(0, 0, 70)}
        };

        var GooCameraEffects = function() {

            this.cameraDefault = new Vector3(0, 0, 120);
            this.effectVector = new Vector3(0, 0, 100);
            this.calcVec = new Vector3(0, 0, 0);

            var camReady = function(e) {
                this.camera = evt.args(e).camera;
                this.cameraDefault.setVector(this.camera.transformComponent.transform.translation);
                this.setupCameraEffects();
            }.bind(this);

            var tickCamEffects = function(e) {
                this.tickCameraEffects(evt.args(e).tpf);
            }.bind(this);

            evt.on(evt.list().CAMERA_READY, camReady);
            evt.on(evt.list().CLIENT_TICK, tickCamEffects);
        };

        GooCameraEffects.prototype.setupCameraEffects = function() {

            var moduleTodggled = function(e) {
                console.log("Mod Toggle", e)
                this.handleToggledModule(evt.args(e))
            }.bind(this);


            evt.on(evt.list().NOTIFY_MODULE_ONOFF, moduleTodggled);
        };

        GooCameraEffects.prototype.handleToggledModule = function(args) {
            if (effectIndex[args.id]) {
                this.applyEffectState(effectIndex[args.id], args.on)
            }
        };

        GooCameraEffects.prototype.applyEffectState = function(effect, onOff) {
            console.log("FX", effect, onOff)
            if (onOff) {
                this.setEffectVector(effect.vector)
            } else {
                this.setEffectVector(this.cameraDefault)
            }

        };

        GooCameraEffects.prototype.addEffectVector = function(vector) {
            this.effectVector.setVector(this.cameraDefault);
            this.effectVector.addVector(vector);
        };

        GooCameraEffects.prototype.setEffectVector = function(vector) {
            this.effectVector.setVector(vector);
        };

        GooCameraEffects.prototype.tickCameraEffects = function(tpf) {

            this.calcVec.setVector(this.effectVector);
            this.calcVec.subVector(this.camera.transformComponent.transform.translation);

            this.calcVec.mulDirect(1, 1, 0.03);

            this.camera.transformComponent.transform.translation.addVector(this.calcVec);

            this.camera.transformComponent.setUpdated()

        };



        return GooCameraEffects;

    });