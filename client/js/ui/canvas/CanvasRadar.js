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
            height:128,
            width: 128
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
            return 128 - vec.data[1] * 1.28;
        };

        var vectorToY = function(vec) {
            return vec.data[0] * 1.28;
        };

        var vectorToCanvasX = function(vec) {
            return ((vectorToX(vec) - centerX)*size.height/rangeX)  +  pos.top  + size.height* 0.5 ;
        };

        var vectorToCanvasY = function(vec) {
            return ((vectorToY(vec) - centerY)*size.width/rangeY)  +  pos.left + size.width * 0.5;
        };

        var drawWorldBorders = function(ctx) {
            ctx.lineWidth = 1;
            var seed = (1+Math.random())*0.8;
            ctx.strokeStyle = toRgba([0.3+Math.sin(0.6)*0.2, 0.3+Math.cos(seed*0.5*seed)*0.5, 0.4+Math.cos(seed*0.4*seed)*0.3, 0.3+Math.random()*0.4]);

            ctx.beginPath();
            CustomGraphCallbacks.addPointToGraph(ctx, vectorToCanvasY(startVec) ,vectorToCanvasX(startVec) );
            CustomGraphCallbacks.addPointToGraph(ctx, vectorToCanvasY(sizeVec)  ,vectorToCanvasX(startVec) );
            CustomGraphCallbacks.addPointToGraph(ctx, vectorToCanvasY(sizeVec)  ,vectorToCanvasX(sizeVec) );
            CustomGraphCallbacks.addPointToGraph(ctx, vectorToCanvasY(startVec) ,vectorToCanvasX(sizeVec)  );
            CustomGraphCallbacks.addPointToGraph(ctx, vectorToCanvasY(startVec) ,vectorToCanvasX(startVec) );
            ctx.stroke();

        };




        var drawRaster = function(ctx) {

            var seed = (1+Math.random())*0.8;

            for (var i = 0; i < size.height/2; i++) {

                if (Math.random() < 0.02) {


                    ctx.lineWidth = 1.5+Math.sin(i*0.1*seed);

                    ctx.strokeStyle = toRgba([0.4+Math.sin(i*0.6)*0.2, 0.6+Math.cos(i*0.5*seed)*0.5, 0.6+Math.cos(i*0.4*seed)*0.4, Math.random()*0.2]);

                    CustomGraphCallbacks.startGraph(ctx, 0, i*2);

                    pathVec.data[0] = path[i]+centerX;
                    i++
                    pathVec.data[1] = path[i]+centerY;

                    CustomGraphCallbacks.addPointToGraph(ctx, size.width, i*2);
                    ctx.stroke();

                }
            }
        };


        CanvasRadar.drawRadarContent = function(gamePieces, ctx, camera) {



            ctx.strokeStyle = toRgba([0.6,0.7,0.9, 1]);
            ctx.lineWidth = 1;

            drawRaster(ctx);

            var curveCount = 0;

            centerX = vectorToX(camera.transformComponent.transform.translation);
            centerY = vectorToY(camera.transformComponent.transform.translation);





            1
            var pathPlotTO = setTimeout(function() {
                wait = false;
                zLine = true;
            }, 1500);

            var xMax = centerX+64;
            var xMin = centerX-64;
            var yMax = centerY+64;
            var yMin = centerY-64;

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
            tempRect.left 	= playerY -3;
            tempRect.top 	= playerX -3;
            tempRect.width 	= 6;
            tempRect.height = 6;
            //	tempRect[params.target] *= state * params.factor;

            drawWorldBorders(ctx);

            var entCount = 0;
            for (var index in gamePieces) {
                entCount += 1;

                var spat = gamePieces[index].piece.spatial;
                var age = gamePieces[index].piece.temporal.getAge();

                var top  = vectorToCanvasX(spat.pos);
                var left = vectorToCanvasY(spat.pos);


                var seed = (Math.random()+1)*0.8;


                if (gamePieces[index].gooPiece.entity) {
                    tempRect.left 	= left -2*seed;
                    tempRect.top 	= top -2*seed;
                    tempRect.width 	= 4*seed;
                    tempRect.height = 4*seed;


                    ctx.fillStyle = toRgba([0.8+Math.sin(age*51)*0.1, 0.8+Math.sin(100+age*1.15)*0.2, 0.8+Math.cos(age*125)*0.2, Math.random()*0.5+0.5]);
//
//
            //        ctx.strokeStyle =  toRgba([0.6+Math.sin(age*2)*0.4, 0.6+Math.sin(age*0.5*seed)*0.4, 0.6+Math.cos(age*0.25)*0.4, 1]);

                    /*
                    if (Math.random() < 0.1) {
                        ctx.font = "10px Russo One";
                        ctx.textAlign = "center";
                        ctx.fillText(
                            gamePieces[index].playerId,
                            tempRect.left,
                            tempRect.top - 6
                        );
                    }
                    */

                } else {
                    tempRect.left 	= left -1;
                    tempRect.top 	= top -1;
                    tempRect.width 	= 2;
                    tempRect.height = 2;
                    ctx.fillStyle = toRgba([0.9, 0.6, 0.4, 0.8]);
            //        ctx.strokeStyle = toRgba([0.9, 0.4, 0.3, 0.2]);
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

