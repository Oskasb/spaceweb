"use strict";


define([
        'Events',
        'ui/GooFpsGraph',
        'ui/GooTrafficGraph',
        'goo/addons/linerenderpack/LineRenderSystem',
        'PipelineAPI',
        'goo/math/Vector3'
    ],
    function(
        evt,
        GooFpsGraph,
        GooTrafficGraph,
        LineRenderSystem,
        PipelineAPI,
        Vector3
    ) {

        var lineRenderSystem;
        var world;
        var cameraEntity;
        var gooFpsGraph;
        var gooTrafficGraph;

        var calcVec = new Vector3();
        var calcVec2 = new Vector3();
        var calcVec3 = new Vector3();
        var calcVec4 = new Vector3();

        var width = 10;
        var step = 0;
        var height = 3;
        var posLeft = -26;
        var posTop = 34;
        var padding = 0.3;


        var GooMonitor = function() {


        };


        function frameGraph() {

            calcVec.setDirect(posLeft-padding, posTop, 0);
            calcVec2.setDirect(posLeft+padding, posTop, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.GREY);

            calcVec.setDirect(posLeft, posTop-padding, 0);
            calcVec2.setDirect(posLeft, posTop+height+padding, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.GREY);

            calcVec.setDirect(posLeft-padding, posTop+height, 0);
            calcVec2.setDirect(posLeft+padding, posTop+height, 0);
            screenSpaceLine(calcVec, calcVec2, lineRenderSystem.GREY);
        }


        function drawGraph(dataArray, scale, color, offset, offsetY) {

            if (!offset) offset = 0;
            if (!offsetY) offsetY = 0;

            for (var i = 0; i < dataArray.length-1; i++) {
                step = width / dataArray.length;
                calcVec.setDirect(offsetY + posLeft+i*step, offset + posTop + dataArray[i][0]*height*scale, 0);
                calcVec2.setDirect(offsetY + posLeft+(i+1)*step, offset + posTop + dataArray[i+1][0]*height*scale, 0);
                screenSpaceLine(calcVec, calcVec2, lineRenderSystem[color]);
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

            calcVec3.setArray(evt.args(e).from.data);
            calcVec4.setArray(evt.args(e).to.data);
            if (anchors[evt.args(e).anchor]) {
                applyAnchor(calcVec3, evt.args(e).anchor);
                applyAnchor(calcVec4, evt.args(e).anchor);
            };

            screenSpaceLine(calcVec3, calcVec4, lineRenderSystem[evt.args(e).color]);
        }

        function drawWorldBounds() {
            calcVec.setDirect(0, 0, 0);
            calcVec2.setDirect(100, 0, 0);
            lineRenderSystem.drawLine(calcVec, calcVec2, lineRenderSystem.DARKPURP);

            calcVec.setDirect(100, 100, 0);
            lineRenderSystem.drawLine(calcVec2, calcVec, lineRenderSystem.DARKPURP);

            calcVec2.setDirect(0, 100, 0);
            lineRenderSystem.drawLine(calcVec, calcVec2, lineRenderSystem.DARKPURP);

            calcVec.setDirect(0, 0, 0);
            lineRenderSystem.drawLine(calcVec2, calcVec, lineRenderSystem.DARKPURP);
        }

        var anchors = {
            bottom_right:[18, -18, 0],
            top_left:[-16, 16, 0],
            center:[0, 0, 0]
        };

        function applyAnchor(vec, anchorKey) {
            vec.data[0] += anchors[anchorKey][0];
            vec.data[1] += anchors[anchorKey][1];
            vec.data[2] += anchors[anchorKey][2];
        };

        function drawRelativePosRad(e) {
            calcVec3.setDirect(evt.args(e).x, evt.args(e).y, 0);
            MATH.radialToVector(evt.args(e).angle, evt.args(e).distance, calcVec4);

            if (anchors[evt.args(e).anchor]) {
                applyAnchor(calcVec3, evt.args(e).anchor);
                applyAnchor(calcVec4, evt.args(e).anchor);
            }


            screenSpaceLine(calcVec3, calcVec4, lineRenderSystem[evt.args(e).color]);
        }


        function trackersEnable(DEBUG) {
            var trackFrames = DEBUG.graphPoints;


            gooFpsGraph.enableFpsTracker(trackFrames);
            gooTrafficGraph.enableTrafficTracker(trackFrames);


            //	this.physicsDebugRenderSystem.passive = !this.debugOn;
            //	this.lineRenderSystem.passive = !this.debugOn;
            //    window.lineRenderSystem = lineRenderSystem;

            var textStyle = {
                posx: 20,
                posy: 20,
                size: 0.5,
                particleConfig:'tpf_Letter',
                textConfig:'text_config'
            };

            var time = 0;
            var cooldown = 0;

            var draw = false;

            function clientTick(e) {

                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_SERVER')) {

                    PipelineAPI.setCategoryData('STATUS', {SERVER_IDLE:gooTrafficGraph.getServerIdle()});
                    PipelineAPI.setCategoryData('STATUS', {SERVER_BUSY:gooTrafficGraph.getServerBusy()});
                    PipelineAPI.setCategoryData('STATUS', {SERVER_PIECES:gooTrafficGraph.getServerPieces()});
                    PipelineAPI.setCategoryData('STATUS', {SERVER_PLAYERS:gooTrafficGraph.getServerPlayers()});

                }

                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_TRAFFIC')) {
                    PipelineAPI.setCategoryData('STATUS', {SEND_GRAPH:gooTrafficGraph.getSends()});
                    PipelineAPI.setCategoryData('STATUS', {RECIEVE_GRAPH:gooTrafficGraph.getRecieves()});

                }

                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_TPF')) {
                    PipelineAPI.setCategoryData('STATUS', {FPS_GRAPH:gooFpsGraph.progressBars});
                }

            }

            evt.removeListener(evt.list().CLIENT_TICK, clientTick);
            evt.on(evt.list().CLIENT_TICK, clientTick);
        }

        var goo;
        var linerendering = false;

        function enableLineRenderSys() {
            linerendering = true;
            if (lineRenderSystem.passive == true) {
                lineRenderSystem.passive = false
            } else {
                goo.setRenderSystem(lineRenderSystem);
            }
        };
        

        function diableLineRenderSys() {
            linerendering = false;
            lineRenderSystem.passive = true;
        };


        function handleCameraReady(e) {
            //    return
            world = evt.args(e).goo.world;
            cameraEntity = evt.args(e).camera;

            gooFpsGraph = new GooFpsGraph();
            gooTrafficGraph = new GooTrafficGraph();
            lineRenderSystem = new LineRenderSystem(world);
            goo = evt.args(e).goo
            
            

            function debugLoaded(key, setupData) {
                trackersEnable(setupData);
            }

            PipelineAPI.setCategoryData('GAME_DATA', {CAMERA:cameraEntity});
            PipelineAPI.subscribeToCategoryKey("setup", "DEBUG", debugLoaded);
            evt.fire(evt.list().MONITOR_STATUS, {CAMERA:'Cam'});
        }

        evt.fire(evt.list().MONITOR_STATUS, {CAMERA:'No Cam'});

        evt.on(evt.list().CAMERA_READY, handleCameraReady);

        return GooMonitor;

    });