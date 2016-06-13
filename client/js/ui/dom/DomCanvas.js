"use strict";


define([
        'Events',
        'PipelineAPI',
        'gui/CanvasGuiAPI',
        'ui/canvas/CanvasRadar'
    ],
    function(
        evt,
        PipelineAPI,
        CanvasGuiAPI,
        CanvasRadar
    ) {


        var configs = {};

        var DomCanvas = function(parent, canvasParams) {

            this.active = false;

            var pop;
            var threshold = 0.5;
            var canvasApi = new CanvasGuiAPI(parent.element, 64);

            var pieces = PipelineAPI.readCachedConfigKey('GAME_DATA', 'PIECES');
            var camera = PipelineAPI.readCachedConfigKey('GAME_DATA', 'CAMERA');
            var time = 0;
            var ready = false;

            var configLoaded = function(conf) {

                console.log("Radar: ", conf)




                var canvasCallback = function(tpf) {

                    CanvasRadar.drawRadarContent(pieces, ctx, camera, conf.data)

                };


                var callbackMap = {
                    processCallbacks:canvasCallback
                };


                var guiError = function(err) {
                    console.log("Gui Error", err)
                };

                var guiReady = function(src, data) {
                    console.log("Gui Ready", src, data)
                };


                canvasApi.initDomCanvasGui(callbackMap);
                var ctx = canvasApi.getCanvasContext();
                canvasApi.setGuiTextureResolution(conf.data.resolution);
                ready = true;

            };

            var clientTick = function(e) {
                if (!ready) return;
                time += evt.args(e).tpf;
                if (time > configs[canvasParams.id].data.tpf) {
                    canvasApi.updateCanvasGui(evt.args(e).tpf);
                    time = 0;
                }
            };


            var canvasConfigs = function(src, config) {
                console.log(config)
                for (var i = 0; i < config.length; i++) {
                    configs[config[i].id] = config[i];
                    console.log(configs[config[i].id])
                    if (configs[canvasParams.id]) {
                        console.log(configs[canvasParams.id])
                        configLoaded(configs[canvasParams.id])
                    }
                }
            };

            if (!this.active) {
                PipelineAPI.subscribeToCategoryKey('canvas', 'systems', canvasConfigs);

                evt.on(evt.list().CLIENT_TICK, clientTick);
            }
            this.active = true;


        };

        DomCanvas.prototype.setupReady = function(parent, domElem, buttonData) {

        };


        return DomCanvas;

    });


