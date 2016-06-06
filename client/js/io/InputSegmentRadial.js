"use strict";

define([
        'ui/GameScreen',
        'ui/DomElement',
        'ui/DomVector',
        'ui/DomMessage',
        'Events'
    ],
    function(
        GameScreen,
        DomElement,
        DomVector,
        DomMessage,
        evt
    ) {

        var InputSegmentRadial = function() {

        //    this.root = new DomElement(GameScreen.getElement(), 'segment_pointer');

            this.currentState = [0, 0];
            this.lastSensState = [0, 0];
            this.dirty = true;
            this.lastSendTime = 0;

            this.active = false;

            this.offsetX = 20;
            this.offsetY = 20;

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
            this.distance = [0, 0, 0, 0];
            this.selectionIndex = 0;

            var _this = this;

            function tickInput(e) {
                _this.tickInputFrame(evt.args(e).tpf);
            }

            evt.on(evt.list().CLIENT_TICK, tickInput);

        };


        InputSegmentRadial.prototype.applyConfigs = function(configs) {
            this.configs = configs.data;

            for (var i = 0; i < this.configs.radialSegments; i++) {
                this.vectors.push(0);
            }
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

            if (SYSTEM_SETUP.DEBUG.renderInput) {
                var message = new DomMessage(GameScreen.getElement(), 'Release', 'ui_state_hint_off', this.pointer.x, this.pointer.y, 0.3);
                message.animateToXYZscale(this.pointer.x, this.pointer.y + 30, 0, 1.5);    
            }


        //    this.root.hideElement();

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

            if (SYSTEM_SETUP.DEBUG.renderInput) {
                var message = new DomMessage(GameScreen.getElement(), 'Control', 'ui_state_hint_on', this.pointer.x, this.pointer.y, 0.3);
                message.animateToXYZscale(this.pointer.x, this.pointer.y - 30, 0, 1.5);
            }


        //    if (SYSTEM_SETUP.DEBUG.renderSegments) {
        //        this.root.showElement();
        //        this.root.translateXYZ(this.pointer.x, this.pointer.y, 0);
    //            this.renderSegments(this.configs.radialSegments, this.configs.radius);
        //    }


        };



        InputSegmentRadial.prototype.setDisabled = function() {
            this.active = false;
        };

        InputSegmentRadial.prototype.determineSelectedSegment = function(line) {

            this.line = line;
            
            var distanceSegment = Math.min(this.configs.distanceSegments, Math.floor(this.configs.distanceSegments * line.w / this.configs.radius));

            if (this.currentState[1]!=distanceSegment) {
                this.currentState[1] = distanceSegment;
                if (SYSTEM_SETUP.DEBUG.renderInput) {

                    var message = new DomMessage(GameScreen.getElement(), "Length " + distanceSegment, 'ui_state_hint_on', this.pointer.x + 50, this.pointer.y - 30, 0.4);
                    message.animateToXYZscale(this.pointer.x + 50, this.pointer.y - 51, 0, 1.1);
                }
                    this.dirty = true;
            }
            
            var segmentAngle = (MATH.TWO_PI / this.configs.radialSegments);

            var radians = ((line.zrot + Math.PI) * (this.configs.radialSegments) / MATH.TWO_PI);
        //    if (radians > Math.PI) radians -= 2;

            var selection = MATH.moduloPositive(Math.clamp(Math.round(radians), 0 ,this.configs.radialSegments), this.configs.radialSegments) ;
            if (selection != this.selectionIndex) {
                if (SYSTEM_SETUP.DEBUG.renderInput) {
                    var message = new DomMessage(GameScreen.getElement(), "Sector " + selection, 'ui_state_hint_on', this.pointer.x - 50, this.pointer.y + 30, 0.4);
                    message.animateToXYZscale(this.pointer.x - 50, this.pointer.y + 51, 0, 1.1);
                }
                this.dirty = true;
                this.currentState[0] = selection;

                this.selectionIndex = selection;
            }


        //    if (SYSTEM_SETUP.DEBUG.renderDistanceSegments) {

                var color = 'YELLOW';

            var width = segmentAngle * (1+distanceSegment) * this.configs.radius *0.05;
            var width2 = segmentAngle * distanceSegment * this.configs.radius * 0.05;

            var addx = ((1+distanceSegment) * this.configs.radius*0.07 / this.configs.distanceSegments) * Math.cos(segmentAngle*selection);
            var addy = ((1+distanceSegment) * this.configs.radius*0.07 / this.configs.distanceSegments) * Math.sin(segmentAngle*selection);

            //    this.distance[0].renderPosRadial(this.pointer.x + addx, this.pointer.y +addy, width/2, segmentAngle*selection + Math.PI * 0.5);
            //    this.distance[1].renderPosRadial(this.pointer.x + addx, this.pointer.y +addy, width/2, segmentAngle*selection - Math.PI * 0.5);

            evt.fire(evt.list().DRAW_RELATIVE_POS_RAD, {x:addx, y:addy, distance:width*2, angle:segmentAngle*selection + Math.PI * 0.5, color:color, anchor:'bottom_right'});
            evt.fire(evt.list().DRAW_RELATIVE_POS_RAD, {x:addx, y:addy, distance:width*2, angle:segmentAngle*selection - Math.PI * 0.5, color:color, anchor:'bottom_right'});


            var addx2 = (distanceSegment * this.configs.radius*0.07 / this.configs.distanceSegments) * Math.cos(segmentAngle*selection);
            var addy2 = (distanceSegment * this.configs.radius*0.07 / this.configs.distanceSegments) * Math.sin(segmentAngle*selection);

            //    this.distance[2].renderPosRadial(this.pointer.x + addx2, this.pointer.y +addy2, width2/2, segmentAngle*selection + Math.PI * 0.5);
            //    this.distance[3].renderPosRadial(this.pointer.x + addx2, this.pointer.y +addy2, width2/2, segmentAngle*selection - Math.PI * 0.5);

            evt.fire(evt.list().DRAW_RELATIVE_POS_RAD, {x:addx2, y:addy2, distance:width2*1.5, angle:segmentAngle*selection + Math.PI * 1.5, color:color, anchor:'bottom_right'});
            evt.fire(evt.list().DRAW_RELATIVE_POS_RAD, {x:addx2, y:addy2, distance:width2*1.5, angle:segmentAngle*selection - Math.PI * 1.5, color:color, anchor:'bottom_right'});


        //        this.root.setStyleParam('width',  ((1+distanceSegment) * (this.configs.radius / this.configs.distanceSegments)*2));
        //        this.root.setStyleParam('height', ((1+distanceSegment) * (this.configs.radius / this.configs.distanceSegments)*2));
        //        this.root.setStyleParam('top',   -((1+distanceSegment) * (this.configs.radius / this.configs.distanceSegments)));
        //        this.root.setStyleParam('left',  -((1+distanceSegment) * (this.configs.radius / this.configs.distanceSegments)));
//
        //        for (var i = 0; i < this.distance.length; i++) {
        //            this.setActiveSectorColor(this.distance[i]);
        //        }
        //    }

            

            if (this.dirty) {
                this.segmentSelected();
                this.dirty = false;
            }

        };


        InputSegmentRadial.prototype.segmentSelected = function() {
            if (SYSTEM_SETUP.DEBUG.renderInput) {
                var message = new DomMessage(GameScreen.getElement(), this.currentState, 'ui_state_hint_on', this.pointer.x, this.pointer.y, 0.3);
                message.animateToXYZscale(this.pointer.x, this.pointer.y - 30, 0, 1.5);
            }
        };


        InputSegmentRadial.prototype.sendState = function() {

            if (this.lastSensState[0] == this.currentState[0] && this.lastSensState[1] == this.currentState[1]) {
                return;
            }

            var vector = {
                state:this.currentState
            };

            evt.fire(evt.list().INPUT_PLAYER_CONTROL, {id:'InputVector', data:vector});
            if (SYSTEM_SETUP.DEBUG.renderInput) {
                var message = new DomMessage(GameScreen.getElement(), "Send Input", 'ui_state_hint_on', 50, 45, 0.3);
                message.animateToXYZscale(50, 40, 0, 1.5);
            }
            this.lastSensState[0] = this.currentState[0];
            this.lastSensState[1] = this.currentState[1];
        };

        InputSegmentRadial.prototype.renderSegments = function(count, radius) {
            var angle = MATH.TWO_PI / count;

            for (var i = 0; i < this.vectors.length; i++) {
                var addx = (radius*0.2 / this.configs.distanceSegments) * Math.cos(angle*i);
                var addy = (radius*0.2 / this.configs.distanceSegments) * Math.sin(angle*i);
            //    this.vectors[i].renderPosRadial(this.pointer.x + addx, this.pointer.y + addy, radius, angle*i);

                var color = 'MAGENTA';

                if (i == this.currentState[0]) {
                    color = 'YELLOW';
                    evt.fire(evt.list().DRAW_RELATIVE_POS_RAD, {x:addx, y:addy, distance:radius*0.03, angle:angle*i, color:color, anchor:'bottom_right'});
                } else {
            //        evt.fire(evt.list().DRAW_RELATIVE_POS_RAD, {x:addx, y:addy, distance:radius*0.03, angle:angle*i, color:color, anchor:'bottom_right'});
                }


            }
        };


        InputSegmentRadial.prototype.tickInputFrame = function(tpf) {

            if (this.active) {
                this.renderSegments(this.configs.radialSegments, this.configs.radius);
            }


            if (this.active && this.lastSendTime > this.configs.streamTimeout) {

                this.sendState();
                this.lastSendTime = 0;
            } else {
                this.lastSendTime += tpf;
            }

        };

        return InputSegmentRadial;

    });