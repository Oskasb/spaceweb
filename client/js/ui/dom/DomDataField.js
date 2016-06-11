"use strict";


define([
        'Events',
        'PipelineAPI'
    ],
    function(
        evt,
        PipelineAPI
    ) {

        var DomDataField = function(domElem, fieldData) {
            
            var text = '';
            var msgs = {};

            function writeText(txt) {
                text += txt+'\n';
                domElem.setText(text);
            }
            
            var callback = function(src, data) {
                text = '';
                msgs[src] = data;
                for (var key in msgs) {
                    writeText('| '+msgs[key])
                };
            };

            for (var i = 0; i < fieldData.dataKeys.length; i++) {
                PipelineAPI.subscribeToCategoryKey(fieldData.dataCategory, fieldData.dataKeys[i], callback);
            }
            
        };
        
        return DomDataField;

    });


