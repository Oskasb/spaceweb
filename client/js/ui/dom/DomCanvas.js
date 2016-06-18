"use strict";


define([
        'Events',
        'PipelineObject',
        'gui/CanvasGuiAPI',
        'ui/GameScreen',
        'ui/canvas/CanvasElement'
    ],
    function(
        evt,
        PipelineObject,
        CanvasGuiAPI,
        GameScreen,
        CanvasElement
    ) {


        var DomCanvas = function(parent, confId) {
            this.configId = confId;
            this.active = false;
            this.parent = parent;
        };

        DomCanvas.prototype.initCanvasSystem = function(canvasParams) {
            
        //    console.log("Canvas Params: ", canvasParams);
            
            var _this = this;
            this.canvasElement = new CanvasElement(canvasParams);

            this.ready = false;

            var configLoaded = function(src, conf) {
                _this.canvasElement.applyElementConfig(_this.parent, _this.pipelineObject.buildConfig()[_this.configId]);
                _this.ready = true;
            };

            var clientTick = function(e) {
                _this.canvasElement.updateCanvasElement(evt.args(e).tpf);
            };


            if (!this.active) {
                this.pipelineObject = new PipelineObject('canvas', 'systems');
                this.pipelineObject.subscribe(configLoaded);
                evt.on(evt.list().CLIENT_TICK, clientTick);
            }
            this.active = true;
            
        };

        DomCanvas.prototype.removeUiSystem = function() {
            this.canvasApi.removeCanvasGui();
        };

        return DomCanvas;

    });


