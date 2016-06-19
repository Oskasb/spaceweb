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

        var CanvasRadar = function() {

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


        CanvasRadar.drawRadarContent = function(gamePieces, ctx, camera, confData) {

            pos = confData.pos;
            size = confData.size;


            ctx.strokeStyle = toRgba([0.6,0.7,0.9, 1]);
            ctx.lineWidth = 1;

            drawWorldBorders(ctx, confData.worldSection);

            drawElementBorders(ctx, confData.elementBorder);

            drawRaster(ctx, confData.raster);

            var curveCount = 0;

            centerX = vectorToX(camera.transformComponent.transform.translation);
            centerY = vectorToY(camera.transformComponent.transform.translation);

            var pathPlotTO = setTimeout(function() {
                wait = false;
                zLine = true;
            }, 1500);

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

            /*
             if (!wait) {
             path.push(centerX, centerY);
             wait = true;
             }


             if (path.length > 6) {
             ctx.beginPath();
             ctx.strokeStyle = toRgba([0.4, 0.8, 1, 1]);

             pathVec.data[0] = path[0]+centerX;
             pathVec.data[1] = path[1]+centerY;

             for (var i = 0; i < path.length; i++) {
             ctx.lineWidth = 1.5+Math.sin(i*0.01);

             ctx.strokeStyle = toRgba([0.5+Math.sin(i*0.01)*0.4, 0.5+Math.cos(i*0.1)*0.4, 0.5+Math.cos(i*0.04)*0.4,0.5+Math.cos(1 - i*0.04)*0.5]);
             CustomGraphCallbacks.startGraph(ctx, vectorToCanvasY(pathVec), vectorToCanvasX(pathVec));

             pathVec.data[0] = path[i]+centerX;
             i++
             pathVec.data[1] = path[i]+centerY;

             CustomGraphCallbacks.addPointToGraph(ctx, vectorToCanvasY(pathVec), vectorToCanvasX(pathVec));
             ctx.stroke();
             }

             if (path.length > 200) {
             path.shift();
             path.shift()
             }
             }


             */
            tempRect.left 	= playerY -122;
            tempRect.top 	= playerX -122;
            tempRect.width 	= 22;
            tempRect.height = 22;
            //	tempRect[params.target] *= state * params.factor;

            
            var entCount = 0;
            for (var index in gamePieces) {
                entCount += 1;

                var spat = gamePieces[index].piece.spatial;
                var age = gamePieces[index].piece.temporal.getAge();

                var top  = vectorToCanvasX(spat.pos)-1;
                var left = vectorToCanvasY(spat.pos)-1;
                
                var seed = (Math.random()+1)*0.8;

                if (gamePieces[index].piece.type == 'player_ship') {
                    tempRect.left 	= left - confData.playerBlips.size*seed;
                    tempRect.top 	= top - confData.playerBlips.size*seed;
                    tempRect.width 	= 2*seed*confData.playerBlips.size;
                    tempRect.height = 2*seed*confData.playerBlips.size;

                    ctx.fillStyle = randomizedColor(confData.playerBlips.colorSelf, 0.3);

                    if (confData.playerNames.on && !gamePieces[index].isOwnPlayer) {
              //          ctx.strokeStyle = toRgba(confData.playerNames.color);

                        ctx.fillStyle = randomizedColor(confData.playerNames.color, 0.3);

                        ctx.font = confData.playerNames.font;
                        ctx.textAlign = "center";
                        ctx.fillText(
                            gamePieces[index].name,
                            tempRect.left,
                            tempRect.top - 4
                        );

                        ctx.fillStyle = randomizedColor(confData.playerBlips.colorOther, 0.3);

                    }
                    


                } else {
                    tempRect.left 	= left -1;
                    tempRect.top 	= top -1;
                    tempRect.width 	= 2;
                    tempRect.height = 2;
                    ctx.fillStyle = randomizedColor([0.5, 1, 0.4, 0.4], 0.2);
                }

                ctx.fillRect(
                    tempRect.left ,
                    tempRect.top  ,
                    tempRect.width,
                    tempRect.height
                );

            }


        };


        return CanvasRadar

    });

