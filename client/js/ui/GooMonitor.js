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


            var draw = false;

            function clientTick(e) {

                draw = false;
                drawWorldBounds();

                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_SERVER')) {
                    draw = true;
                    //    drawGraph(gooTrafficGraph.getServerTime(), 20,  'PEA', -6);
                    drawGraph(gooTrafficGraph.getServerIdle(), 20,  'CYAN', 0, 11);
                    drawGraph(gooTrafficGraph.getServerBusy(), 100,'PINK', 0, 11);
                    drawGraph(gooTrafficGraph.getServerPieces(), 0.05,'GREEN', 0, 22);
                    drawGraph(gooTrafficGraph.getServerPlayers(), -0.1,'PURPLE', 0, 22);
                }

                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_TRAFFIC')) {
                    draw = true;
                    drawGraph(gooTrafficGraph.getSends(), 0.2, 'ORANGE');
                    drawGraph(gooTrafficGraph.getRecieves(), -0.2,  'PEA');
                }

                if (PipelineAPI.readCachedConfigKey('STATUS', 'MON_TPF')) {
                    draw = true;
                    drawGraph(gooFpsGraph.progressBars, 1, 'YELLOW');
                    calcVec.setDirect(-14, 19, 0);
                    calcVec.addVector(cameraEntity.transformComponent.transform.translation);
                    applyAnchor(calcVec, 'top_left');
                    textStyle.posx = calcVec.data[0];
                    textStyle.posy = calcVec.data[1];

                    time += evt.args(e).tpf;

                    if (time > 0.5) {

                        var text = ''+Math.round(evt.args(e).tpf*1000);
                        evt.fire(evt.list().PARTICLE_TEXT, {text:text, textStyle:textStyle});
                        time = 0;
                    }
                }

                if (draw) {
                    frameGraph();
                }

            }

            evt.removeListener(evt.list().DRAW_RELATIVE_POS_RAD, drawRelativePosRad);
            evt.removeListener(evt.list().DRAW_RELATIVE_LINE, drawRelativeLine);
            evt.removeListener(evt.list().CLIENT_TICK, clientTick);

            evt.on(evt.list().DRAW_RELATIVE_POS_RAD, drawRelativePosRad);
            evt.on(evt.list().DRAW_RELATIVE_LINE, drawRelativeLine);
            evt.on(evt.list().CLIENT_TICK, clientTick);
        }



        function handleCameraReady(e) {
            //    return
            world = evt.args(e).goo.world;
            cameraEntity = evt.args(e).camera;

            gooFpsGraph = new GooFpsGraph();
            gooTrafficGraph = new GooTrafficGraph();
            lineRenderSystem = new LineRenderSystem(world);

            evt.args(e).goo.setRenderSystem(lineRenderSystem);

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