"use strict";


define([
        'Events',
        'PipelineAPI',
        'gui/CanvasGuiAPI',
        'ui/GameScreen',
        'ui/canvas/CanvasElement'
    ],
    function(
        evt,
        PipelineAPI,
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
            
            console.log("Canvas Params: ", canvasParams);
            
            var _this = this;
            this.canvasElement = new CanvasElement(canvasParams);

            this.ready = false;

            var configLoaded = function(src, conf) {
                console.log("Apply conf", conf)

                for (var i = 0; i < conf.length; i++) {
                    if (conf[i].id == _this.configId) {
                        console.log("Match conf", conf[i].data)
                        _this.canvasElement.applyElementConfig(_this.parent, conf[i].data);
                        _this.ready = true; 
                    }
                }

            };

            var clientTick = function(e) {
                _this.canvasElement.updateCanvasElement(evt.args(e).tpf);
            };


            if (!this.active) {
                PipelineAPI.subscribeToCategoryKey('canvas', 'systems', configLoaded);
                evt.on(evt.list().CLIENT_TICK, clientTick);
            }
            this.active = true;
            
            
        };

        DomCanvas.prototype.removeUiSystem = function() {
            this.canvasApi.removeCanvasGui();
        };

        return DomCanvas;

    });


