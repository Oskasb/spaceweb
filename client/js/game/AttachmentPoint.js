
"use strict";


define([
        'Events'
    ],
    function(
        evt
    ) {

        var AttachmentPoint = function(apData) {
            this.name = apData.name;
            this.transform = apData.transform;
            this.data = apData;
        };

        AttachmentPoint.prototype.attachModule = function () {
            
        };

        AttachmentPoint.prototype.sampleModuleFrame = function () {

        };

        AttachmentPoint.prototype.removeClientModule = function () {
            
                        
        };
        
        return AttachmentPoint
    });