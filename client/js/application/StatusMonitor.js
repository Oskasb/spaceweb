"use strict";


define([
        'Events',
        'PipelineAPI'
    ],
    function(
        evt,
        PipelineAPI
    ) {

        var StatusMonitor = function() {

            var _this=this;

            var monitorStatus = function(e) {
                _this.registerStatus(evt.args(e))
            };

            evt.on(evt.list().MONITOR_STATUS, monitorStatus);
        };

        StatusMonitor.prototype.registerStatus = function(data) {
            PipelineAPI.setCategoryData('STATUS', data);
        };


        return StatusMonitor;

    });