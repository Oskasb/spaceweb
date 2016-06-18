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

        var handlers = {
            TOGGLE_SHIELD:requestShields
        };

        
        var ControlStateDispatcher = function() {

            for (var key in handlers) {
                new PipelineObject('CONTROL_STATE', key, handlers[key], false);
            }
        };

        ControlStateDispatcher.prototype.serverControlState = function(e) {
            console.log("Server control state", e)
        };

        return ControlStateDispatcher;

    });