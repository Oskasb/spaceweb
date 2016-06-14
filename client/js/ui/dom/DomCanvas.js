"use strict";


define([
        'Events',
        'PipelineAPI',
        'gui/CanvasGuiAPI',
    'ui/GameScreen',
        'ui/canvas/CanvasRadar'
    ],
    function(
        evt,
        PipelineAPI,
        CanvasGuiAPI,
        GameScreen,
        CanvasRadar
    ) {

        
        var pieces;
        var camera;
        var renderModel;
        var canvasApi;
        var canvasApi3d;
        
        var configs = {};
        var canvasGuiConfig = {
            element:{
                pos:[70, 70],
                size:[20, 20],
                blendMode:'color_add'
            }
        };

        var DomCanvas = function(parent, canvasParams) {

            var renderModel = canvasParams.renderModel;
            if (renderModel == 'canvas3d') {
                parent = GameScreen.getElement();
            }
            

            this.active = false;

            for (var key in canvasParams.config) {
                canvasGuiConfig[key] = canvasParams.config[key];
            }


            pieces = PipelineAPI.readCachedConfigKey('GAME_DATA', 'PIECES');
            camera = PipelineAPI.readCachedConfigKey('GAME_DATA', 'CAMERA');
            var time = 0;
            var ready = false;

            var configLoaded = function(conf) {

                console.log("Radar: ", conf);



                var radarCallback = function(tpf) {
                    CanvasRadar.drawRadarContent(pieces, ctx, camera, configs);
                };


                var canvasCallbacks = {
                    radarMap:radarCallback
                };


                var callbackMap = {
                    processCallbacks:canvasCallbacks[canvasGuiConfig.callback]
                };


                var guiError = function(err) {
                    console.log("Gui Error", err)
                };

                var guiReady = function(src, data) {
                    ready = true;
                    console.log("Gui Ready", src, data, guiReady, guiError)
                };

                if (!ready) {

                    if (renderModel == 'canvas3d') {
                        canvasApi.init3dCanvasGui(camera, callbackMap, canvasGuiConfig);
                    } else {
                        canvasApi.initDomCanvasGui(callbackMap);
                    }

                    var ctx = canvasApi.getCanvasContext();
                }

                canvasApi.setGuiTextureResolution(configs.resolution);
                canvasApi.setGuiAttenuationRgba(configs.attenuation);
                ready = true;

            };

            var clientTick = function(e) {
                if (!ready) return;
                time += evt.args(e).tpf;
                if (time > configs.tpf) {
                    canvasApi.updateCanvasGui(evt.args(e).tpf);
                    time = 0;
                }
            };


            var canvasConfigs = function(src, config) {
                console.log(config)
                for (var i = 0; i < config.length; i++) {
                    if (config[i].id == canvasParams.id) {
                        console.log(configs = config[i].data);
                        configLoaded()
                    }
                }
            };

            if (!this.active) {
                canvasApi = new CanvasGuiAPI(parent.element, 64);
                PipelineAPI.subscribeToCategoryKey('canvas', 'systems', canvasConfigs);
                evt.on(evt.list().CLIENT_TICK, clientTick);
            }
            this.active = true;


        };

        DomCanvas.prototype.removeUiSystem = function(parent, domElem, buttonData) {
            canvasApi.removeCanvasGui();
        };


        return DomCanvas;

    });


