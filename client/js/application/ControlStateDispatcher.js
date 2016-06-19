"use strict";


define([
        'Events',
        'PipelineObject'
    ],
    function(
        evt,
        PipelineObject
    ) {

        var requestShields = function(src, data) {
            console.log("request shields", src, data);
            evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'InputVector', data:{shield:data}})
        };

        var requestHyperDrive = function(src, data) {
            console.log("request hyperdrive", src, data);
            evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'InputVector', data:{hyper_drive:data}})
        };


        var handlers = {
            TOGGLE_SHIELD:requestShields,
            TOGGLE_HYPER:requestHyperDrive
        };

        var modules = {
            hyper_drive:'TOGGLE_HYPER',
            shield:'TOGGLE_SHIELD'
        };
        
        var ControlStateDispatcher = function() {

            this.controlPipes = {};


            for (var key in handlers) {
                this.controlPipes[key] = new PipelineObject('CONTROL_STATE', key, handlers[key], false);
            }
            
            var handleModuleOnOff = function(e) {
                this.moduleToggled(evt.args(e))
            }.bind(this);
            
            evt.on(evt.list().NOTIFY_MODULE_ONOFF, handleModuleOnOff)
        };

        ControlStateDispatcher.prototype.moduleToggled = function(args) {
            if (!modules[args.id]) {
                console.log("No module toggle handle for ", args.id)
                return;
            }

            if (this.controlPipes[modules[args.id]].readData() != args.on) {
                this.controlPipes[modules[args.id]].setData(args.on);
            }
        };

        return ControlStateDispatcher;

    });