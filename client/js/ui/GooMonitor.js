"use strict";


define([
        'Events',
        'ui/GooFpsGraph',
        'goo/addons/linerenderpack/LineRenderSystem',
        'goo/math/Vector3'
    ],
    function(
        evt,
        GooFpsGraph,
        LineRenderSystem,
        Vector3
    ) {

        var lineRenderSystem;
        var cameraEntity;
        var gooFpsGraph;
        
        var calcVec = new Vector3();
        var calcVec2 = new Vector3();
        var calcVec3 = new Vector3();
        var calcVec4 = new Vector3();


        var handleSendRequest = function() {
            if (!SYSTEM_SETUP.DEBUG.trackTraffic) return;
            evt.fire(evt.list().MESSAGE_UI, {channel:'connection_send', message:'_'});
        };


        var handleServerMessage = function() {
            if (!SYSTEM_SETUP.DEBUG.trackTraffic) return;
            evt.fire(evt.list().MESSAGE_UI, {channel:'connection_receive', message:'_'});
        };
        

        var GooMonitor = function() {
            
            
        };

        GooMonitor.prototype.applyDebugSettings = function(debug) {
            
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

        var width = 20;
        var step = 0;
        var height = 6;
        var posLeft = -40;
        var posTop = 30;
        var padding = 1;

        function drawGraph(dataArray) {

            width = 20;
            step = 0;
            height = 6;
            posLeft = -40;
            posTop = 30;
            padding = 1;

            calcVec.setDirect(posLeft-padding, posTop, 0);
            calcVec2.setDirect(posLeft+width+padding, posTop, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.AQUA);

            calcVec.setDirect(posLeft, posTop-padding, 0);
            calcVec2.setDirect(posLeft, posTop+height+padding, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.AQUA);

            calcVec.setDirect(posLeft, posTop+height, 0);
            calcVec2.setDirect(posLeft+width+padding, posTop+height, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.BLUE);

            for (var i = 0; i < dataArray.length-1; i++) {

                step = width / dataArray.length;

                calcVec.setDirect(posLeft+i*step, posTop + dataArray[i][0]*height, 0);
                calcVec2.setDirect(posLeft+(i+1)*step, posTop + dataArray[i+1][0]*height, 0);

                screenSpaceLine(calcVec, calcVec2, lineRenderSystem.YELLOW);

            }

        }
        
        function screenSpaceLine(from, to, color) {
            calcVec.setArray(from.data);
            calcVec2.setArray(to.data);

            calcVec.addVector(cameraEntity.transformComponent.transform.translation);
            calcVec2.addVector(cameraEntity.transformComponent.transform.translation);

            calcVec.data[2] = 0;
            calcVec2.data[2] = 0;

            lineRenderSystem.drawLine(calcVec, calcVec2, color);
        }
        
        function drawRelativeLine(e) {
            screenSpaceLine(evt.args(e).from, evt.args(e).to, lineRenderSystem[evt.args(e).color]);
        }

        function drawWorldBounds() {
            calcVec.setDirect(0, 0, 0);
            calcVec2.setDirect(100, 0, 0);
            lineRenderSystem.drawLine(calcVec, calcVec2, lineRenderSystem.MAGENTA);

            calcVec.setDirect(100, 100, 0);
            lineRenderSystem.drawLine(calcVec2, calcVec, lineRenderSystem.MAGENTA);

            calcVec2.setDirect(0, 100, 0);
            lineRenderSystem.drawLine(calcVec, calcVec2, lineRenderSystem.MAGENTA);

            calcVec.setDirect(0, 0, 0);
            lineRenderSystem.drawLine(calcVec2, calcVec, lineRenderSystem.MAGENTA);
        }


        function handleCameraReady(e) {
            gooFpsGraph = new GooFpsGraph();

            gooFpsGraph.enableFpsTracker(40);
            
            cameraEntity = evt.args(e).camera;
            lineRenderSystem = new LineRenderSystem(evt.args(e).goo.world);

            evt.args(e).goo.setRenderSystem(lineRenderSystem);
            //	this.physicsDebugRenderSystem.passive = !this.debugOn;
            //	this.lineRenderSystem.passive = !this.debugOn;
        //    window.lineRenderSystem = lineRenderSystem;

            function clientTick() {
                drawWorldBounds();
                drawGraph(gooFpsGraph.progressBars);
            }

            evt.on(evt.list().DRAW_RELATIVE_LINE, drawRelativeLine);
            evt.on(evt.list().CLIENT_TICK, clientTick);
        }

        
        
        evt.on(evt.list().CAMERA_READY, handleCameraReady);
        
        return GooMonitor;

    });