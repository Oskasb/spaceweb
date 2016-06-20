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
    var goo;
    var backgrounds = {};
    var configs = {};

    var effectIndex  = {
        hyper_drive:'hyper_space'
    };
    
    var SpaceFX = function() {
        var pipeObj;
        var bkPipe;
        this.time = 0;

        this.baseColor = [0.05, 0.0, 0.09, 0.2];
        this.flashColor = [0.04, 0.02, 0.12, 0.2];
        this.flashTime = 0.8;
        this.flashTime = 0;

        this.camPos = new Vector3();
        this.posVec = new Vector3();
        this.velVec = new Vector3();
        this.colorVec = new Vector3();

        this.effectData = {
            color:this.colorVec.data
        };

        function engineReady(e) {
            goo = evt.args(e).goo;
            evt.removeListener(evt.list().ENGINE_READY, engineReady);
        }

        function cameraReady(e) {
            camera = evt.args(e).camera;
            evt.removeListener(evt.list().CAMERA_READY, cameraReady);
        }

        evt.on(evt.list().CAMERA_READY, cameraReady);
        evt.on(evt.list().ENGINE_READY, engineReady);

        var fxConfig = function() {
            configs = pipeObj.buildConfig('effect_data');
        };

        var backgroundCfg = function() {
            backgrounds = bkPipe.buildConfig('data');
        };

        pipeObj = new PipelineObject('effects','environment', fxConfig);
        bkPipe = new PipelineObject('effects','background', backgroundCfg);
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

        this.processBackground(tpf);

    };

    SpaceFX.prototype.processBackground = function(tpf) {
        this.time += tpf;
        this.baseColor;
        this.flashColor;
        this.flashTime;

        goo.renderer.setClearColor(
            MATH.interpolateFromTo(this.baseColor[0], this.flashColor[0], 0.4 + Math.sin(this.time)*0.4    +Math.random()*0.2),
            MATH.interpolateFromTo(this.baseColor[1], this.flashColor[1], 0.4 + Math.cos(this.time)*0.4    +Math.random()*0.2),
            MATH.interpolateFromTo(this.baseColor[2], this.flashColor[2], 0.4 + Math.sin(this.time*1.2)*0.4+Math.random()*0.2),
            this.baseColor[3]
        );
    };

    SpaceFX.prototype.applyBackgroundFx = function(conf) {

        this.baseColor = conf.baseColor;
        this.flashColor = conf.flashColor;
        this.flashTime = conf.flashTime;

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



        var moduleTodggled = function(e) {
            this.handleToggledModule(evt.args(e))
        }.bind(this);


        evt.on(evt.list().NOTIFY_MODULE_ONOFF, moduleTodggled);
        
    };


    SpaceFX.prototype.handleToggledModule = function(args) {
        if (effectIndex[args.id]) {

            if (args.on) {
                if (configs[effectIndex[args.id]]) {

                    for (var i = 0; i < configs[effectIndex[args.id]].length; i++) {
                        configs[effectIndex[args.id]][i].frequency = 0.3;
                    }


                } else {
                    console.log("No SpaceFX for ", args.id);
                }

                if (backgrounds[effectIndex[args.id]]) {
                    this.applyBackgroundFx(backgrounds[effectIndex[args.id]])
                } else {
                    if (backgrounds.default) {
                        this.applyBackgroundFx(backgrounds.default)
                    }
                }
            } else {

                if (backgrounds.default) {
                    this.applyBackgroundFx(backgrounds.default)
                }

                if (configs[effectIndex[args.id]]) {
                    for (var i = 0; i < configs[effectIndex[args.id]].length; i++) {
                        configs[effectIndex[args.id]][i].frequency = 0;
                    }

                } else {
                    console.log("No SpaceFX for ", args.id);
                }
            }

        }
    };
    

    SpaceFX.prototype.setupSpaceFxScene = function() {
        this.enableSpaceFx();
    };


    return SpaceFX;

});