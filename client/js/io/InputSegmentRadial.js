"use strict";

define([
        'ui/GameScreen',
        'ui/DomCursor',
        'ui/DomElement',
        'ui/DomVector',
        'Events'
    ],
    function(
        GameScreen,
        DomCursor,
        DomElement,
        DomVector,
        evt
    ) {

        var InputSegmentRadial = function() {

            this.root = new DomElement(GameScreen.getElement(), 'pointer');

            this.pointer = {
                x:0,
                y:0
            };


            this.configs = {
                radialSegments:8,
                distanceSegments:3,
                radius: 50
            };

            this.vectors = [];
            this.selectionIndex = 0;
        };


        InputSegmentRadial.prototype.applyConfigs = function(configs) {
            for (var i = 0; i < this.vectors; i++) {
                this.vectors[i].removeVector();
            }

            console.log("Register config", configs);
            this.configs = configs.data;

            for (var i = 0; i < this.configs.radialSegments; i++) {
                this.vectors.push(new DomVector(GameScreen.getElement()));

            }
            this.currentVector = this.vectors[0];

        };

        InputSegmentRadial.prototype.registerControlledPiece = function(piece) {
            console.log("Register Control", piece);
            this.piece = piece;
            var _this = this;

            var handlers = {

            };

            var cursorLine = function(e) {
                _this.determineSelectedSegment(evt.args(e));
            };

         //   evt.on(evt.list().CURSOR_MOVE, cursorMove);


            var cursorRelease = function(e) {
                _this.disableSegments(evt.args(e));
            };

            evt.on(evt.list().CURSOR_RELEASE, cursorRelease);

            var cursorPress = function(e) {
                _this.enableSegments(evt.args(e));
            };

            evt.on(evt.list().CURSOR_PRESS, cursorPress);

            evt.on(evt.list().CURSOR_LINE, cursorLine);
            
        };


        InputSegmentRadial.prototype.cursorLine = function(line) {

    //        this.root.hideElement();
        };

        InputSegmentRadial.prototype.disableSegments = function() {
            console.log("hide", this.pointer.x, this.pointer.y)
            this.root.hideElement();
        };

        InputSegmentRadial.prototype.enableSegments = function(mouse) {
            console.log("enable", mouse, this.pointer.x, this.pointer.y)
            this.pointer = {
                x:mouse.x,
                y:mouse.y
            };

            this.root.showElement();
            this.root.translateXYZ(this.pointer.x, this.pointer.y, 0);
            this.renderSegments(this.configs.radialSegments, this.configs.radius);
        };


        InputSegmentRadial.prototype.determineSelectedSegment = function(line) {

            var distanceSegment = Math.min(this.configs.distanceSegments, Math.floor(this.configs.distanceSegments * line.w / this.configs.radius));

            var halfSegment = (Math.PI / this.configs.radialSegments);

            var radians = MATH.TWO_PI + ((line.zrot ) * (this.configs.radialSegments) / MATH.TWO_PI);


            var selection = Math.clamp(Math.floor(radians), 0 ,this.configs.radialSegments-1) ;
            console.log(selection, distanceSegment);
            if (selection != this.selectionIndex) {
                this.vectors[this.selectionIndex].setColorRGBA(0.2, 0.4, 0.4, 0.2);
                this.vectors[selection].setColorRGBA(.2, 0.4, 0.4, 0.7);
                this.selectionIndex = selection;
            }



        };
        
        
        InputSegmentRadial.prototype.renderSegments = function(count, radius) {
            var angle = MATH.TWO_PI / count;

            for (var i = 0; i < this.vectors.length; i++) {
                this.vectors[i].renderPosRadial(this.pointer.x, this.pointer.y, radius, angle*i)
            }

        };

        return InputSegmentRadial;

    });