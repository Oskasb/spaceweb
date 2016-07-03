
"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {

        var AttachmentPoint = function(apData, defaultModule) {
            this.slot = apData.slot;
            this.transform = apData.transform;
            this.data = {module:defaultModule};
        };

        AttachmentPoint.prototype.attachModule = function () {
            
        };

        AttachmentPoint.prototype.sampleModuleFrame = function () {

        };

        AttachmentPoint.prototype.removeClientModule = function () {
            
                        
        };
        
        return AttachmentPoint
    });