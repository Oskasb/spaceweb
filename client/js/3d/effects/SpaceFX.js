"use strict";

define([
    'Events',
    'goo/math/Vector3',
    'PipelineAPI',
    'PipelineObject'

], function(
    evt,
    Vector3,
    PipelineAPI,
    PipelineObject
) {

    var camera;
    var configs = {};
    
    var SpaceFX = function() {
        var pipeObj;
        this.camPos = new Vector3();
        this.posVec = new Vector3();
        this.velVec = new Vector3();
        this.colorVec = new Vector3();

        this.effectData = {
            color:this.colorVec.data
        };
        
        function cameraReady(e) {
            camera = evt.args(e).camera;
            evt.removeListener(evt.list().CAMERA_READY, cameraReady);
        }

        evt.on(evt.list().CAMERA_READY, cameraReady);
        
        var fxConfig = function() {
            configs = pipeObj.buildConfig('effect_data');
        };

        pipeObj = new PipelineObject('effects','environment', fxConfig);
    };


    SpaceFX.prototype.applyFXVector = function(confData, vec3) {
        vec3.addDirect(confData[0]*(Math.random()-0.5), confData[1]*(Math.random()-0.5), confData[2]*Math.random());
    };

    SpaceFX.prototype.updateColorFX = function(confMin, confMax, vec3) {
        vec3.setDirect(
            confMin[0] + (confMax[0] - confMin[0])*Math.random(),
            confMin[1] + (confMax[1] - confMin[1])*Math.random(),
            confMin[2] + (confMax[2] - confMin[2])*Math.random()
        );
    };

    SpaceFX.prototype.spawnConfigureSpaceFX = function(conf, time) {

        this.posVec.setVector(this.camPos);
        this.posVec.data[2] -= conf.distance;
        this.applyFXVector(conf.volume, this.posVec);
        this.applyFXVector(conf.speed, this.velVec);
        this.updateColorFX(conf.colorMin, conf.colorMax, this.colorVec);

        evt.fire(evt.list().GAME_EFFECT, {effect:conf.game_effect, pos:this.posVec, vel:this.velVec, params:this.effectData});
    };

    SpaceFX.prototype.processConfFX = function(conf, time, tpf) {
        for (var i = 0; i < conf.length; i++) {

            if (Math.random() < conf[i].frequency) {
                this.spawnConfigureSpaceFX(conf[i], time);
            }
        }
    };




    SpaceFX.prototype.updateSpaceFX = function(time, tpf) {

        this.camPos.setVector(camera.transformComponent.transform.translation);

        for (var key in configs) {
            this.processConfFX(configs[key], time, tpf);
        }

    };

    var sysTime = 0;
    SpaceFX.prototype.enableSpaceFx = function() {

        var _this = this;
        
        function clientTick(e) {
            sysTime += evt.args(e).tpf;
            _this.updateSpaceFX(sysTime, evt.args(e).tpf);
        }

        evt.on(evt.list().CLIENT_TICK, clientTick);
    };



    SpaceFX.prototype.setupSpaceFxScene = function() {
        this.enableSpaceFx();
    };


    return SpaceFX;

});