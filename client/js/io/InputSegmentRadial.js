"use strict";

define([
        'ui/GameScreen',
        'ui/DomCursor',
        'ui/DomElement',
        'ui/DomVector',
        'ui/DomMessage',
        'Events'
    ],
    function(
        GameScreen,
        DomCursor,
        DomElement,
        DomVector,
        DomMessage,
        evt
    ) {

        var InputSegmentRadial = function() {

            this.root = new DomElement(GameScreen.getElement(), 'segment_pointer');

            this.currentState = [0, 0];
            this.lastSensState = [0, 0];
            this.dirty = true;
            this.lastSendTime = 0;

            this.active = false;

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
            this.distance = [
                new DomVector(GameScreen.getElement()),
                new DomVector(GameScreen.getElement()),
                new DomVector(GameScreen.getElement()),
                new DomVector(GameScreen.getElement())
            ];
            this.selectionIndex = 0;

            var _this = this;

            function tickInput(e) {
                _this.tickInputFrame(evt.args(e).tpf);
            }

            evt.on(evt.list().CLIENT_TICK, tickInput);

        };


        InputSegmentRadial.prototype.applyConfigs = function(configs) {
            for (var i = 0; i < this.vectors; i++) {
                this.vectors[i].removeVector();
            }

            console.log("Register config", configs);
            this.configs = configs.data;

            for (var i = 0; i < this.configs.radialSegments; i++) {
                this.vectors.push(new DomVector(GameScreen.getElement()));
            };
            

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

            for (var i = 0; i < this.vectors.length; i++) {
                this.setDisabled(this.vectors[i]);
            }

            for (var i = 0; i < this.distance.length; i++) {
                this.setDisabled(this.distance[i]);
            }

            var message = new DomMessage(GameScreen.getElement(), 'Release', 'ui_state_hint_off', this.pointer.x, this.pointer.y, 0.3);
            message.animateToXYZscale(this.pointer.x, this.pointer.y + 30, 0, 1.5);

            this.root.hideElement();

            if (this.line != undefined) {
                this.line.toX = this.line.fromX;
                this.line.toY = this.line.fromY;
            }

            this.sendState();

        };

        InputSegmentRadial.prototype.enableSegments = function(mouse) {
            this.active = true;
            this.pointer = {
                x:mouse.x,
                y:mouse.y
            };

            var message = new DomMessage(GameScreen.getElement(), 'Control', 'ui_state_hint_on', this.pointer.x, this.pointer.y, 0.3);
            message.animateToXYZscale(this.pointer.x, this.pointer.y - 30, 0, 1.5);

            this.root.showElement();
            this.root.translateXYZ(this.pointer.x, this.pointer.y, 0);
            this.renderSegments(this.configs.radialSegments, this.configs.radius);
        };

        InputSegmentRadial.prototype.setActiveSectorColor = function(vectors) {
            vectors.setColorRGBA(0.2, 0.4, 0.5, 0.9);
        };

        InputSegmentRadial.prototype.setNeutralSectorColor = function(vectors) {
            vectors.setColorRGBA(0.2, 0.4, 0.7, 0.2);
        };

        InputSegmentRadial.prototype.setDisabled = function(vector) {
            this.active = false;
            vector.vector.translateScaleXYZSize(-100, -100, 0, 0);
        };

        InputSegmentRadial.prototype.determineSelectedSegment = function(line) {

            this.line = line;
            
            var distanceSegment = Math.min(this.configs.distanceSegments, Math.floor(this.configs.distanceSegments * line.w / this.configs.radius));

            if (this.currentState[1]!=distanceSegment) {
                this.currentState[1] = distanceSegment;
                var message = new DomMessage(GameScreen.getElement(), "Length "+distanceSegment, 'ui_state_hint_on', this.pointer.x+50, this.pointer.y-30, 0.4);
                message.animateToXYZscale(this.pointer.x+50, this.pointer.y-51, 0, 1.1);
                this.dirty = true;
            }
            
            var segmentAngle = (MATH.TWO_PI / this.configs.radialSegments);

            var radians = ((line.zrot + Math.PI) * (this.configs.radialSegments) / MATH.TWO_PI);
        //    if (radians > Math.PI) radians -= 2;

            var selection = MATH.moduloPositive(Math.clamp(Math.round(radians), 0 ,this.configs.radialSegments), this.configs.radialSegments) ;
            if (selection != this.selectionIndex) {
                var message = new DomMessage(GameScreen.getElement(), "Sector "+selection, 'ui_state_hint_on', this.pointer.x-50, this.pointer.y+30, 0.4);
                message.animateToXYZscale(this.pointer.x-50, this.pointer.y+51, 0, 1.1);
                this.dirty = true;
                this.currentState[0] = selection;
                
                this.setNeutralSectorColor(this.vectors[this.selectionIndex]);
                this.setActiveSectorColor(this.vectors[selection]);
                this.selectionIndex = selection;
            }

            var width = segmentAngle * (1+distanceSegment) * this.configs.radius *0.25;
            var width2 = segmentAngle * distanceSegment * this.configs.radius * 0.25;

            var addx = ((1+distanceSegment) * this.configs.radius / this.configs.distanceSegments) * Math.cos(segmentAngle*selection+ Math.PI * 0.5);
            var addy = ((1+distanceSegment) * this.configs.radius / this.configs.distanceSegments) * Math.sin(segmentAngle*selection+ Math.PI * 0.5);

            this.distance[0].renderPosRadial(this.pointer.x + addx, this.pointer.y +addy, width/2, segmentAngle*selection + Math.PI * 0.5);
            this.distance[1].renderPosRadial(this.pointer.x + addx, this.pointer.y +addy, width/2, segmentAngle*selection - Math.PI * 0.5);


            var addx2 = (distanceSegment * this.configs.radius / this.configs.distanceSegments) * Math.cos(segmentAngle*selection+ Math.PI * 0.5);
            var addy2 = (distanceSegment * this.configs.radius / this.configs.distanceSegments) * Math.sin(segmentAngle*selection+ Math.PI * 0.5);

            this.distance[2].renderPosRadial(this.pointer.x + addx2, this.pointer.y +addy2, width2/2, segmentAngle*selection + Math.PI * 0.5);
            this.distance[3].renderPosRadial(this.pointer.x + addx2, this.pointer.y +addy2, width2/2, segmentAngle*selection - Math.PI * 0.5);

            this.root.setStyleParam('width',  ((1+distanceSegment) * (this.configs.radius / this.configs.distanceSegments)*2));
            this.root.setStyleParam('height', ((1+distanceSegment) * (this.configs.radius / this.configs.distanceSegments)*2));
            this.root.setStyleParam('top',   -((1+distanceSegment) * (this.configs.radius / this.configs.distanceSegments)));
            this.root.setStyleParam('left',  -((1+distanceSegment) * (this.configs.radius / this.configs.distanceSegments)));

            for (var i = 0; i < this.distance.length; i++) {
                this.setActiveSectorColor(this.distance[i]);
            }

            if (this.dirty) {
                this.segmentSelected();
                this.dirty = false;
            }

        };


        InputSegmentRadial.prototype.segmentSelected = function() {

            var message = new DomMessage(GameScreen.getElement(), this.currentState, 'ui_state_hint_on', this.pointer.x, this.pointer.y, 0.3);
            message.animateToXYZscale(this.pointer.x, this.pointer.y - 30, 0, 1.5);

        };


        InputSegmentRadial.prototype.sendState = function() {

            if (this.lastSensState[0] == this.currentState[0] && this.lastSensState[1] == this.currentState[1]) {
                return;
            }

            var vector = {
                state:this.currentState
            };

            evt.fire(evt.list().INPUT_PLAYER_CONTROL, {id:'InputVector', data:vector});
            var message = new DomMessage(GameScreen.getElement(), "Send Input", 'ui_state_hint_on', 50, 45, 0.3);
            message.animateToXYZscale(50, 40, 0, 1.5);

            this.lastSensState[0] = this.currentState[0];
            this.lastSensState[1] = this.currentState[1];
        };

        InputSegmentRadial.prototype.renderSegments = function(count, radius) {
            var angle = MATH.TWO_PI / count;

            for (var i = 0; i < this.vectors.length; i++) {
                var addx = (radius / this.configs.distanceSegments) * Math.cos(angle*i + Math.PI * 0.5);
                var addy = (radius / this.configs.distanceSegments) * Math.sin(angle*i + Math.PI * 0.5);
                this.vectors[i].renderPosRadial(this.pointer.x + addx, this.pointer.y + addy, radius, angle*i);
           //    this.vectors[i].vecStyle.width = '1px';
                this.setNeutralSectorColor(this.vectors[i]);
            }
        };


        InputSegmentRadial.prototype.tickInputFrame = function(tpf) {

            if (this.active && this.lastSendTime > this.configs.streamTimeout) {
                this.sendState();
                this.lastSendTime = 0;
            } else {
                this.lastSendTime += tpf;
            }

        };

        return InputSegmentRadial;

    });