"use strict";


define([
        'ui/DomMessage',
        'ui/GameScreen',
        'Events',
    'PipelineAPI'
    ],
    function(
        DomMessage,
        GameScreen,
        evt,
        PipelineAPI
    ) {
        
        var UiMessenger = function() {
            var listening = false;
            var channels;

            function createMessage(e) {
                var chan = channels[evt.args(e).channel];
                var message = new DomMessage(GameScreen.getElement(), evt.args(e).message, chan.style, 0, 0, chan.time);
                message.animateToXYZ(chan.anim[0], chan.anim[1], chan.anim[2]);
            }


            function setup(data) {
                channels = data;
                if (!listening) evt.on(evt.list().MESSAGE_UI, createMessage);
                listening = true;
            }


            function channelData(src, data) {
                setup(data);
            };

            PipelineAPI.subscribeToCategoryKey('messages', 'channels', channelData)
            
        };
        
        return UiMessenger;

    });