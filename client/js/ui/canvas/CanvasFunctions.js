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

        var CanvasFunctions = function() {
            
            this.configs = {};

            pieces = PipelineAPI.readCachedConfigKey('GAME_DATA', 'PIECES');
            camera = PipelineAPI.readCachedConfigKey('GAME_DATA', 'CAMERA');
            
        };


        CanvasFunctions.prototype.setupCallbacks = function(id, conf, callbackNames) {

            this.callbacks = [];

            var configs = conf;
            
            var radarCallback = function(tpf, ctx) {
                CanvasRadar.drawRadarContent(pieces, ctx, camera, configs);
            };

            var inputVectorCallback = function(tpf, ctx) {
                CanvasInputVector.drawInputVectors(pieces, ctx, camera, configs)
            };

            var tpfMonitorCallback = function(tpf, ctx) {

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

            for (var i = 0; i < callbackNames.length; i++) {
                this.callbacks.push(canvasCallbacks[callbackNames[i]])
            }


        };

        CanvasFunctions.prototype.callCallbacks = function(tpf, ctx) {
            for (var i = 0; i < this.callbacks.length; i++) {
                this.callbacks[i](tpf, ctx);
            }
        };
        

        return CanvasFunctions;

    });


