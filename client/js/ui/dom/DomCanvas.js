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

        var DomCanvas = function(parent, configId) {
            var canvasApi = new CanvasGuiAPI(parent.element, 128);

        //    var canvasRadar = new CanvasRadar();

            var pieces = PipelineAPI.readCachedConfigKey('GAME_DATA', 'PIECES');
            var camera = PipelineAPI.readCachedConfigKey('GAME_DATA', 'CAMERA');

            var canvasCallback = function(tpf) {
                CanvasRadar.drawRadarContent(pieces, ctx, camera)
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
            
            
            var clientTick = function(e) {
                canvasApi.updateCanvasGui(evt.args(e).tpf);
            };


            evt.on(evt.list().CLIENT_TICK, clientTick);

        };
        
        DomCanvas.prototype.setupReady = function(parent, domElem, buttonData) {

        };
         
        
        return DomCanvas;

    });


