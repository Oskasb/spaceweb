
"use strict";


define([
        'Events',
        'ui/GooPiece',
        'io/InputSegmentRadial',
        'PipelineObject',
        'PipelineAPI'
    ],
    function(
        evt,
        GooPiece,
        InputSegmentRadial,
        PipelineObject,
        PipelineAPI
    ) {

        var ClientModule = function(gooPiece, moduleData, serverState) {

            this.id = moduleData.id;
            this.data = moduleData.data;
            this.state = serverState[0];
            this.lastValue = null;

            this.on = true;
            
            console.log("ClientModule", moduleData, serverState);
            this.gooModule = gooPiece.attachModule(this);
        };

        ClientModule.prototype.applyModuleServerState = function (serverState) {

            if (this.state.value != serverState[this.id][0].value) {
        //        console.log("update state", this.id);
            //    this.lastValue = this.state.value;
            }

            this.state.value = serverState[this.id][0].value;

            if (this.state.value) {
                this.on = true;
            } else {
                this.on = false;
            }
        };
        
        ClientModule.prototype.sampleModuleFrame = function () {
            if (this.state.value != this.lastValue) {
                this.lastValue = this.state.value;
            }
            this.gooModule.updateGooModule();
        };

        ClientModule.prototype.removeClientModule = function () {

            this.gooModule.removeModule();
                        
        };
        
        return ClientModule
    });