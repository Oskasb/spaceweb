"use strict";


define([
        'Events',
        'PipelineAPI',
        'ui/dom/DomElement'
    ],
    function(
        evt,
        PipelineAPI,
        DomElement
    ) {

        var logChannels = {
            pipeline_message:"#cfc",
            connection_status:"#9fd",
            button_update:"ff0",
            pipeline_error:"#f66",
            ping_tracker:"af6",
            receive_error:"f33",
            connection_error:"fa2",
            undefined:"#aaf"
        };


        var DomDataLog = function(domElem, logData) {
            this.addDataField(domElem, logData);

            this.active = false;


        };

        DomDataLog.prototype.addDataField = function(domElem, logData) {

            var logElem = new DomElement(domElem.element, logData.style);

            var texts = [];

            var text = ''

            var renderTexts = function() {

                text = '';

                for (var i = 0; i < texts.length; i++) {
                    text += texts[i]+'\n';
                    logElem.setText(text)
                }
                if (texts.length > 18) {
                    texts.shift();
                }
            };


            var logMessage = function(msg, color) {
                texts.push("<span style='color:"+color+"'>"+ msg +"</span>");
                renderTexts(texts)
            };
            
            
            var callback = function(e) {
                logMessage(evt.args(e)[logData.argument], logChannels[evt.args(e).channel]);
            };

            if (this.active) return;
            evt.on(evt.list()[logData.eventId], callback)
            this.active = true;
        };
        
        return DomDataLog;

    });


