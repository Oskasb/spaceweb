
"use strict";


define([
        'Events',
    'PipelineObject'
    ],
    function(
        evt,
        PipelineObject
    ) {

        var ClientModule = function(clientPiece, moduleId, serverState) {

            this.clientPiece = clientPiece;
            this.id = moduleId;
            this.state = serverState[0];
            this.on = false;
            this.lastValue = null;
            
            var applyModuleData = function(src, data) {
            //    console.log("Module data", src, data);
                this.data = data;
                
                if (this.on) {
                    console.log("Module already on", this);
                    return;
                }

                this.gooModule = clientPiece.gooPiece.attachModule(this);
                this.gooModule.activateGooModule();
                clientPiece.registerModule(this);
                this.on = true;
            //    moduleReadyCb(this);
            }.bind(this);

            this.pipeObj = new PipelineObject('MODULE_DATA', this.id, applyModuleData)
        };




        ClientModule.prototype.applyModuleServerState = function (serverState) {

            if (this.state.value != serverState[this.id][0].value) {
        //        console.log("update state", this.id);
            //    this.lastValue = this.state.value;
            }

            this.state.value = serverState[this.id][0].value;

            if (this.state.value) {

                if (!this.on && this.clientPiece.isOwnPlayer) {
                    evt.fire(evt.list().NOTIFY_MODULE_ONOFF, {id:this.id, on:true})
                }

                this.on = true;
            } else {

                if (this.on && this.clientPiece.isOwnPlayer) {
                    evt.fire(evt.list().NOTIFY_MODULE_ONOFF, {id:this.id, on:false})
                }

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
            this.pipeObj.removePipelineObject();
            this.gooModule.removeModule();
                        
        };
        
        return ClientModule
    });