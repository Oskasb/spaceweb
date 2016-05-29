"use strict";


define([
        'ui/DomMessage',
        'ui/GameScreen',
        'Events',
    'PipelineAPI',
        'ui/DomPopup'
    ],
    function(
        DomMessage,
        GameScreen,
        evt,
        PipelineAPI,
        DomPopup
    ) {
        
        var UiMessenger = function() {
            var listening = false;
            var channels;

            function createMessage(e) {
                var chan = channels[evt.args(e).channel];
                var message = new DomMessage(GameScreen.getElement(), evt.args(e).message, chan.style, 0, 0, chan.time);
                message.animateToXYZ(chan.anim[0], chan.anim[1], chan.anim[2]);
            }

            function createMessagePopup(e) {
                var popup = new DomPopup(evt.args(e).configId, evt.args(e).callback);
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

            evt.on(evt.list().MESSAGE_POPUP, createMessagePopup);
            
        };
        
        return UiMessenger;

    });