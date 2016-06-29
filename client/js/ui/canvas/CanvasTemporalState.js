"use strict";

define([
        'gui/functions/CustomGraphCallbacks',
    'goo/math/Vector3'
    ],
    function(
        CustomGraphCallbacks,
        Vector3
    ) {


        var rangeX;
        var rangeY;

        var centerX;
        var centerY;

        var calcVec = new Vector3(0, 0, 0);
        var calcVec2 = new Vector3(0, 0, 0);
        
        var toRgba = function(color) {
            var r = ""+Math.floor(color[0]*255);
            var g = ""+Math.floor(color[1]*255);
            var b = ""+Math.floor(color[2]*255);
            var a = ""+color[3];
            return 'rgba('+r+', '+g+', '+b+', '+a+')';
        };

        var CanvasTemporalState = function() {

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
        var tmpColor = [0, 0, 0, 0];
        

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
            return (((vectorToX(vec) - centerX)*size.height/rangeX)  +  pos.top  + size.height* 0.5) ;
        };

        var vectorToCanvasY = function(vec) {
            return (((vectorToY(vec) - centerY)*size.width/rangeY)  +  pos.left + size.width * 0.5);
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
        CanvasTemporalState.drawTemporal = function(gamePiece, ctx, camera, confData, widgetConfigs) {

            calcVec.setVector(camera.transformComponent.transform.translation);
            
            pos = confData.pos;
            size = confData.size;


        //    drawRadialRaster(ctx, confData.raster);

            ctx.strokeStyle = toRgba([0.6,0.7,0.9, 1]);
            ctx.lineWidth = 1;

       //     drawElementBorders(ctx, confData.elementBorder);
        //    drawWorldBorders(ctx, confData.worldSection);
            drawRaster(ctx, confData.raster);

            var curveCount = 0;
                        
            centerX = vectorToX(calcVec);
            centerY = vectorToY(calcVec);



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

                entCount += 1;

                var tmp = gamePiece.piece.temporal
                
                var spat = gamePiece.piece.spatial;
                var target = gamePiece.piece.frameCurrentSpatial;
                var extrap = gamePiece.piece.frameNextSpatial;
                
                var idealTimeSlice = tmp.getIdealTimeSlice();
                var timeProgress = tmp.getPacketTimeFraction();
                var totalTime = tmp.getAge();
                var overdue = tmp.getOverdue();
                
                var top  = vectorToCanvasX(calcVec);
                var left = vectorToCanvasY(calcVec);


                    tempRect.left 	= left -1;
                    tempRect.top 	= size.height +1;
                    tempRect.width 	= 2;
                    tempRect.height = 2;

                        var controls = gamePiece.piece.readServerModuleState('inputControls');

                        for (var i = 0; i < controls.length; i++) {


                            var green = 0;
                            if (timeProgress > idealTimeSlice) {
                                green =1;
                            }


                            tmpColor[0] = overdue + 0.2*green; // confData.serverRadial.timeColor[0];
                            tmpColor[1] = widgetConfigs.serverRadial.timeColor[1] * (1-overdue);
                            tmpColor[2] = widgetConfigs.serverRadial.timeColor[2] * (0.5-overdue); // * 1/(1+timeProgress);
                            tmpColor[3] = widgetConfigs.serverRadial.timeColor[3];


                            var timeAngle = - Math.PI * 0.5 + (timeProgress) * MATH.TWO_PI;

                            var timeAngle = - Math.PI * 0.5 + (totalTime) * MATH.TWO_PI;

                            timeAngle = 0.5*Math.sin(timeAngle) - Math.PI * 0.5;

                            var radius = widgetConfigs.serverRadial.clockRadius ;

                            var w = widgetConfigs.serverRadial.timeWidth; // - widgetConfigs.serverRadial.timeWidth*(timeProgress*timeProgress);

                            w += overdue*radius*0.05;

                            drawControlVectorArc(ctx,  timeAngle, timeAngle + widgetConfigs.serverRadial.timeSize * idealTimeSlice, radius, tmpColor, w);


                        }
            tmpColor[0] = 0.6*timeProgress;
            tmpColor[1] = 0.1*timeProgress;
            tmpColor[2] = 1-timeProgress;
            tmpColor[3] *= (1-timeProgress);
            ctx.strokeStyle = randomizedColor(tmpColor, widgetConfigs.serverRadial.flicker);

            ctx.lineWidth = widgetConfigs.inputRadial.width;

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, - 2 + (size.width-2) * (1-timeProgress) ,  size.height - 4 );
            CustomGraphCallbacks.addPointToGraph(ctx, 2 + (size.width-2) * timeProgress, size.height - 4);
            ctx.stroke();

            


        };


        return CanvasTemporalState

    });

