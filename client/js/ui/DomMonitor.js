"use strict";


define([
        'Events',
        'ui/DomFpsGraph'
    ],
    function(
        evt,
        DomFpsGraph
    ) {


        var handleSendRequest = function() {
            if (!SYSTEM_SETUP.DEBUG.trackTraffic) return;
            evt.fire(evt.list().MESSAGE_UI, {channel:'connection_send', message:'_'});
        };



        var handleServerMessage = function() {
            if (!SYSTEM_SETUP.DEBUG.trackTraffic) return;
            evt.fire(evt.list().MESSAGE_UI, {channel:'connection_receive', message:'_'});
        };
        
        

        var DomMonitor = function() {

            
        };

        DomMonitor.prototype.applyDebugSettings = function(debug) {
            
            if (debug.trackTpf) {
                if (this.fpsGraph) this.fpsGraph.disableFpsTracker();
                this.fpsGraph = new DomFpsGraph('fps_graph_container');
                this.fpsGraph.enableFpsTracker(debug.trackTpf);
            } else if (this.fpsGraph) {
                this.fpsGraph.disableFpsTracker();
            }


            if (debug.trackTraffic) {
                evt.on(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
                evt.on(evt.list().SERVER_MESSAGE, handleServerMessage);
            } else {
                evt.removeListener(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
                evt.removeListener(evt.list().SERVER_MESSAGE, handleServerMessage);
            }
            
            
        };

        

        
        return DomMonitor;

    });