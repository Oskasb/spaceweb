"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {

        var handlers;



        var sentStack = [];

        var receiveStack = [];

        var handleSendRequest = function() {
            sentStack[0][0] += 1;
        };


        var handleServerMessage = function() {
            receiveStack[0][0] += 1;
        };




        var GooTrafficGraph = function() {

        //    this.containerStyle = containerStyle;
            var  _this = this;

            this.barCount = 1;
            this.lastBar = 0;
            this.currentBar = 0;

            this.biggestValue = 0.2;
            this.smallestValue = 0.5;
            this.idealValue = 0.016;
            this.valueSum = 0;
            this.valueAverage = 0;

            this.progressBars = [];

            var trackCB = function(e) {
                _this.trackFrame(evt.args(e));
            };

            handlers = {
                trackCB:trackCB
            }

        };


        GooTrafficGraph.prototype.trackFrame = function() {

            var recycle = sentStack.pop();
            recycle[0] = 0.3;
            sentStack.unshift(recycle);

            var rec = receiveStack.pop();
            rec[0] = 0.3;
            receiveStack.unshift(rec);

        };

        GooTrafficGraph.prototype.enableTrafficTracker = function(barCount) {

            sentStack.length = 0;
            receiveStack.length = 0;

            this.barCount = barCount;

            for (var i = 0; i < this.barCount; i++) {
                var progress = [0];
                sentStack.push(progress);
                receiveStack.push(progress);
            }

            this.sentStack = sentStack;
            this.receiveStack = receiveStack;


            this.disableTracker();

            var _this = this;

            var setup = function() {
                _this.barCount = barCount;
                evt.on(evt.list().CLIENT_TICK, handlers.trackCB);
            };

            setTimeout(function() {
                setup();
            }, 100);


                evt.on(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
                evt.on(evt.list().SERVER_MESSAGE, handleServerMessage);


        };

        GooTrafficGraph.prototype.disableTracker = function() {
            evt.removeListener(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
            evt.removeListener(evt.list().SERVER_MESSAGE, handleServerMessage);

            evt.removeListener(evt.list().CLIENT_TICK, handlers.trackCB);
        };

        return GooTrafficGraph;

    });