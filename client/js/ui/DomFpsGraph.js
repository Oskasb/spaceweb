"use strict";


define([
        'Events',
        'ui/DomElement',
        'ui/DomProgress',
        'ui/GameScreen'
    ],
    function(
        evt,
        DomElement,
        DomProgress,
        GameScreen
    ) {

        var handlers;

        var DomFpsGraph = function(containerStyle) {

            this.containerStyle = containerStyle;
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

        DomFpsGraph.prototype.generateGraph = function() {

            this.container = new DomElement(GameScreen.getElement(), this.containerStyle);
            this.number =  new DomElement(this.container.element, 'fps_graph_average_number');
            this.container.element.style.width = this.barCount+"em";

            for (var i = 0; i < this.barCount; i++) {
                var progress = new DomProgress(this.container.element, 'fps_graph_progress_box', true)
                this.progressBars.push(progress);
                progress.root.applyStyleParams({left: i*(100 / (this.barCount)) + '%'});
            }

        };


        DomFpsGraph.prototype.trackFrame = function(args) {
            this.progressBars[this.currentBar].setLowlight();

            this.currentBar = args.frame % this.barCount;

            if (this.currentBar == 0) {
                this.valueSum = 0;
                this.biggestValue = args.tpf;
                this.smallestValue = args.tpf;
            }
            this.valueSum += args.tpf;
            this.valueAverage = this.valueSum / (this.currentBar+1);



            if (this.smallestValue > args.tpf) this.smallestValue = args.tpf;
            this.progressBars[this.currentBar].setProgress(this.idealValue / args.tpf );
            this.progressBars[this.currentBar].setHighlight();

            if (!SYSTEM_SETUP.DEBUG.trackTpfAverage) return;

                this.number.setText("TPF: "+Math.round(this.valueAverage*1000)+' ms');
        };

        DomFpsGraph.prototype.enableFpsTracker = function(barCount) {

            if (this.container) {
                this.disableFpsTracker();
            }

            var _this = this;

            var setup = function() {
                _this.barCount = barCount;
                _this.generateGraph();
                evt.on(evt.list().CLIENT_TICK, handlers.trackCB);
            };


            setTimeout(function() {
                setup();
            }, 100);

        };

        DomFpsGraph.prototype.disableFpsTracker = function() {
            if (this.container) this.container.removeElement();
            evt.removeListener(evt.list().CLIENT_TICK, handlers.trackCB);
        };




        return DomFpsGraph;

    });