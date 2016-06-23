
"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {

        var ClientModule = function(clientPiece, moduleData, serverState) {

            this.clientPiece = clientPiece;
            this.id = moduleData.id;
            this.data = moduleData.data;
            this.state = serverState[0];
            this.lastValue = null;

            this.on = true;
            
    //        console.log("ClientModule", moduleData, serverState);
            this.gooModule = clientPiece.gooPiece.attachModule(this);
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

            this.gooModule.removeModule();
                        
        };
        
        return ClientModule
    });