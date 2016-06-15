"use strict";


define([
        'Events',
        'PipelineAPI',
        'gui/CanvasGuiAPI',
        'ui/GameScreen',
        'ui/canvas/CanvasRadar',
        'ui/canvas/CanvasInputVector',
        'ui/canvas/CanvasGraph'
    ],
    function(
        evt,
        PipelineAPI,
        CanvasGuiAPI,
        GameScreen,
        CanvasRadar,
        CanvasInputVector,
        CanvasGraph
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

                var callbacks = [];


                var radarCallback = function(tpf) {
                    CanvasRadar.drawRadarContent(pieces, ctx, camera, configs);
                };

                var inputVectorCallback = function(tpf) {
                    CanvasInputVector.drawInputVectors(pieces, ctx, camera, configs)
                };

                var tpfMonitorCallback = function(tpf) {


                    if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_SERVER')) {
                        CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_IDLE'), ctx, configs.idleGraph, configs.idleGraph.topValue);
                        CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_BUSY'), ctx, configs.busyGraph, configs.busyGraph.topValue);
                        CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_PIECES'), ctx, configs.piecesGraph, configs.piecesGraph.topValue);
                        CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SERVER_PLAYERS'), ctx, configs.playersGraph, configs.playersGraph.topValue);
                    }
                    

                    if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_TRAFFIC')) {
                        CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'SEND_GRAPH'), ctx, configs.sendGraph, configs.sendGraph.topValue);
                        CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'RECIEVE_GRAPH'), ctx, configs.recieveGraph, configs.recieveGraph.topValue);
                    }
                    
                    
                    if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_TPF')) {
                        CanvasGraph.drawGraph(PipelineAPI.readCachedConfigKey('STATUS', 'FPS_GRAPH'), ctx, configs.tpfGraph, 1/configs.tpfGraph.topValue);
                    }

                    
                };


                var canvasCallbacks = {
                    radarMap:radarCallback,
                    inputVector:inputVectorCallback,
                    tpfMonitor:tpfMonitorCallback
                };


                var setupCallbacks = function() {
                    for (var i = 0; i < canvasGuiConfig.callbacks.length; i++) {
                        callbacks.push(canvasCallbacks[canvasGuiConfig.callbacks[i]])
                    }
                };

                var callCallbacks = function(tpf) {
                    for (var i = 0; i < callbacks.length; i++) {
                        callbacks[i](tpf);
                    }
                };

                var callbackMap = {
                    processCallbacks:callCallbacks
                };


                var guiError = function(err) {
                    console.log("Gui Error", err)
                };

                var guiReady = function(src, data) {
                    ready = true;
                    console.log("Gui Ready", src, data, guiReady, guiError)
                };

                setupCallbacks();

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


