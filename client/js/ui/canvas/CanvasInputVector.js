"use strict";

define([
        'gui/functions/CustomGraphCallbacks'
    ],
    function(
        CustomGraphCallbacks
    ) {


        var rangeX;
        var rangeY;

        var centerX;
        var centerY;

        var toRgba = function(color) {
            var r = ""+Math.floor(color[0]*255);
            var g = ""+Math.floor(color[1]*255);
            var b = ""+Math.floor(color[2]*255);
            var a = ""+color[3];
            return 'rgba('+r+', '+g+', '+b+', '+a+')';
        };

        var CanvasInputVector = function() {

        };

        var tempRect = {
            left:0,
            top:0,
            width:0,
            height:0
        };

        var path = [];
        var wait = false;
        var zLine = zLine;


        var pos = {
            top: 0,
            left: 0
        };
        var size = {
            height:64,
            width: 64
        };

        var pathVec = {
            data:[0, 0]
        };

        var startVec = {
            data: [0, 0]
        };

        var sizeVec = {
            data: [100, 100]
        };


        var vectorToX = function(vec) {
            return size.height - vec.data[1] * size.height*0.01;
        };

        var vectorToY = function(vec) {
            return vec.data[0] * size.height*0.01;
        };

        var vectorToCanvasX = function(vec) {
            return ((vectorToX(vec) - centerX)*size.height/rangeX)  +  pos.top  + size.height* 0.5 ;
        };

        var vectorToCanvasY = function(vec) {
            return ((vectorToY(vec) - centerY)*size.width/rangeY)  +  pos.left + size.width * 0.5;
        };

        var randomizedColor = function(color, flicker) {
            return toRgba([
                color[0]*(1-flicker + Math.random()*flicker),
                color[1]*(1-flicker + Math.random()*flicker),
                color[2]*(1-flicker + Math.random()*flicker),
                color[3]*(1-flicker + Math.random()*flicker)
            ]);
        };


        var drawWorldBorders = function(ctx, worldSection) {

            if (Math.random() < worldSection.probability) {
                ctx.lineWidth = 2;

                ctx.strokeStyle = randomizedColor(worldSection.borderColor, worldSection.flicker);

                tempRect.left 	= vectorToCanvasY(startVec);
                tempRect.top 	= vectorToCanvasX(startVec);
                tempRect.width 	= vectorToCanvasY(sizeVec);
                tempRect.height = vectorToCanvasX(sizeVec);

                ctx.beginPath();
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left  ,tempRect.top );
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.width ,tempRect.top );
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.width ,tempRect.height);
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left  ,tempRect.height);
                CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left  ,tempRect.top );
                ctx.stroke();

                ctx.fillStyle = randomizedColor(worldSection.color, worldSection.flicker);
                ctx.fillRect(
                    tempRect.left+1 ,
                    tempRect.top-1  ,
                    tempRect.width - tempRect.left -1,
                    tempRect.height - tempRect.top +1
                );
            }

        };

        var drawElementBorders = function(ctx, elementBorder) {
            if (Math.random() > elementBorder.probability) {
                return;
            }

            ctx.lineWidth = elementBorder.width*(1-elementBorder.flicker + Math.random()*elementBorder.flicker);

            ctx.strokeStyle = randomizedColor(elementBorder.color, elementBorder.flicker);

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, elementBorder.margin , elementBorder.margin );
            CustomGraphCallbacks.addPointToGraph(ctx, size.width - elementBorder.margin  ,elementBorder.margin);
            CustomGraphCallbacks.addPointToGraph(ctx, size.width - elementBorder.margin  ,size.height - elementBorder.margin );
            CustomGraphCallbacks.addPointToGraph(ctx,  elementBorder.margin , size.height - elementBorder.margin  );
            CustomGraphCallbacks.addPointToGraph(ctx,  elementBorder.margin , elementBorder.margin );
            ctx.stroke();

        };


        var drawRaster = function(ctx, raster) {
            
            ctx.strokeStyle = randomizedColor(raster.color, raster.flicker);

            for (var i = 0; i < size.height/2; i++) {

                if (Math.random() < raster.probability) {

                    ctx.lineWidth = raster.width * Math.random();

                    CustomGraphCallbacks.startGraph(ctx, 0, i*2);

                    pathVec.data[0] = path[i]+centerX;
                    pathVec.data[1] = path[i]+centerY;

                    CustomGraphCallbacks.addPointToGraph(ctx, size.width, i*2);
                    ctx.stroke();
                    i++
                }
            }
        };


        var drawRadialRaster = function(ctx, raster) {

            ctx.strokeStyle = randomizedColor(raster.color, raster.flicker);

            for (var i = 0; i < size.height/2; i++) {

                if (Math.random() < raster.probability) {

                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.arc(
                        size.width*0.5,
                        size.height*0.5,
                        Math.sqrt(raster.width*i)+i * 1.2,
                        Math.PI*Math.random() + Math.PI * 0.6 * Math.random(),
                        Math.random() * Math.PI + 0.6 * Math.random()
                    );
                    ctx.stroke();
                    i++
                }
            }
        };


        var drawControlVectorArc = function(ctx, direction, angle, radius, color, width) {

            ctx.lineWidth = width;
            ctx.strokeStyle = toRgba(color);

            ctx.beginPath();
            ctx.arc(
                tempRect.left,
                tempRect.top,
                radius,
                direction,
                angle
            );
            ctx.stroke();

        };


        var plotRotationState = function(ctx, direction, angle, radius, color, width) {

            ctx.lineWidth = width;
            ctx.strokeStyle = randomizedColor(color, 0.5);

            direction -= Math.PI*0.5;

            var addx = radius * Math.cos(direction);
            var addy = radius * Math.sin(direction);

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left ,  tempRect.top );
            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left + addy  , tempRect.top + addx);
            ctx.stroke();

            var ang1 = -angle + Math.PI * 0.4;
            var ang2 = Math.PI-angle - Math.PI * 0.4;

            var ang1 = direction - Math.PI*0.5 + Math.max(angle , 0);

            var ang2 = direction - Math.PI*0.5 + Math.min(angle , 0);

            drawControlVectorArc(ctx, -ang1, -ang2, radius, color, width);

        };
7
        CanvasInputVector.drawInputVectors = function(gamePieces, ctx, camera, confData) {

            pos = confData.pos;
            size = confData.size;


            drawRadialRaster(ctx, confData.raster);

            ctx.strokeStyle = toRgba([0.6,0.7,0.9, 1]);
            ctx.lineWidth = 1;

            drawElementBorders(ctx, confData.elementBorder);
        //    drawWorldBorders(ctx, confData.worldSection);
        //    drawRaster(ctx, confData.raster);

            var curveCount = 0;

            centerX = vectorToX(camera.transformComponent.transform.translation);
            centerY = vectorToY(camera.transformComponent.transform.translation);



            var xMax = centerX+confData.zoom;
            var xMin = centerX-confData.zoom;
            var yMax = centerY+confData.zoom;
            var yMin = centerY-confData.zoom;

            /*256
             for (var index in gamePieces) {
             curveCount += 1;
             if (gamePieces[index].spatial.pos.data[0] > xMin)  {
             xMin = gamePieces[index].spatial.pos.data[0];
             }

             if (gamePieces[index].spatial.pos.data[0] < xMax)  {
             xMax = gamePieces[index].spatial.pos.data[0];
             }

             if (gamePieces[index].spatial.pos.data[1] > xMin)  {
             xMin = gamePieces[index].spatial.pos.data[1];
             }

             if (gamePieces[index].spatial.pos.data[1] < xMax)  {
             xMax = gamePieces[index].spatial.pos.data[1];
             }
             }

             yMax = xMax;
             yMin = xMin;
             */
            rangeX = xMax - xMin;
            rangeY = yMax - yMin;

            var playerX = pos.top + size.height*0.5;
            var playerY = pos.left + size.width*0.5;


            
            var entCount = 0;
            for (var index in gamePieces) {
                entCount += 1;

                var spat = gamePieces[index].piece.spatial;
                var target = gamePieces[index].piece.targetSpatial;
                var age = gamePieces[index].piece.temporal.getPacketAge();
                var networkTime = gamePieces[index].piece.temporal.networkTime;

                var top  = vectorToCanvasX(camera.transformComponent.transform.translation);
                var left = vectorToCanvasY(camera.transformComponent.transform.translation);


                if (gamePieces[index].piece.type == 'player_ship') {
                    tempRect.left 	= left -1;
                    tempRect.top 	= top -1;
                    tempRect.width 	= 2;
                    tempRect.height = 2;
                    
                    if (confData.playerNames.on && !gamePieces[index].isOwnPlayer) {
/*
                        var controls = gamePieces[index].piece.readServerModuleState('inputControls');

                        for (var i = 0; i < controls.length; i++) {

                            ctx.lineWidth = confData.serverRadial.width;

                            ctx.strokeStyle = randomizedColor(confData.serverRadial.color, confData.serverRadial.flicker);

                            var angle = MATH.TWO_PI / 32;
                            var radius = confData.serverRadial.range * (controls[i].value[1] + 1)* size.width / 3;
                            var addx = radius * Math.cos(angle*controls[i].value[0]  + 0.5*Math.PI);
                            var addy = radius * Math.sin(angle*controls[i].value[0]  + 0.5*Math.PI);

                            ctx.beginPath();
                            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left ,  tempRect.top );
                            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left + addy  , tempRect.top + addx);
                            ctx.stroke();
                        }
*/
                    } else {

                        var controls = gamePieces[index].piece.readServerModuleState('inputControls');

                        for (var i = 0; i < controls.length; i++) {

                            ctx.fillStyle = randomizedColor(confData.inputRadial.thrColor, confData.inputRadial.flicker);

                            ctx.font = confData.inputRadial.font;
                            ctx.textAlign = "center";
                            ctx.fillText(
                                'Thr:'+controls[i].value[1],
                                size.width * confData.inputRadial.left,
                                size.height * confData.inputRadial.top
                            );

                            ctx.lineWidth = confData.serverRadial.width;

                            ctx.strokeStyle = randomizedColor(confData.serverRadial.color, confData.serverRadial.flicker);

                            var angle = MATH.TWO_PI / gamePieces[index].inputSegmentRadial.configs.radialSegments;
                            var radius = confData.serverRadial.range * (controls[i].value[1] + 1)* size.width / gamePieces[index].inputSegmentRadial.configs.distanceSegments;
                            var addx = radius * Math.cos(angle*controls[i].value[0]  + 0.5*Math.PI);
                            var addy = radius * Math.sin(angle*controls[i].value[0]  + 0.5*Math.PI);

                            ctx.beginPath();
                            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left ,  tempRect.top );
                            CustomGraphCallbacks.addPointToGraph(ctx, tempRect.left + addy  , tempRect.top + addx);
                            ctx.stroke();

                         //   angle -= Math.PI*0.5;

                            drawControlVectorArc(ctx,  -angle*controls[i].value[0]  -0.1, -angle*controls[i].value[0]  +0.1 , radius, confData.serverRadial.color, confData.serverRadial.width);

                            var timeFraction = -Math.PI*0.5 + ((age / networkTime)) * MATH.TWO_PI

                            drawControlVectorArc(ctx,  timeFraction, timeFraction + confData.serverRadial.timeSize, confData.serverRadial.clockRadius, confData.serverRadial.timeColor, confData.serverRadial.timeWidth);


                        }

                    //    if (data.color) ctx.strokeStyle = toRgba(data.color);
                        var angle = gamePieces[index].inputSegmentRadial.line.zrot;

                        radius = confData.inputRadial.range * gamePieces[index].inputSegmentRadial.line.w * size.width * 0.01;

                      tempRect.left =     vectorToCanvasX(spat.pos);
                      tempRect.top 	=     vectorToCanvasY(spat.pos);

                        angle = spat.rot[0]+Math.PI*0.5;


                        plotRotationState(ctx, angle, spat.rotVel[0], radius*0.6, confData.inputRadial.spatialColor, 3);


                        tempRect.left 	= vectorToCanvasX(target.pos);
                        tempRect.top 	= vectorToCanvasY(target.pos);

                        angle = target.rot[0]+Math.PI*0.5;;

                        plotRotationState(ctx, angle, target.rotVel[0], radius * 0.4, confData.inputRadial.targetColor, 3);


                        


                    }

                }

            }


        };


        return CanvasInputVector

    });

