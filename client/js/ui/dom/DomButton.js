"use strict";


define([
        'Events',
        'PipelineAPI',
        'ui/dom/DomElement',
    'ui/GameScreen'
    ],
    function(
        evt,
        PipelineAPI,
        DomElement,
        GameScreen
    ) {

        var DomButton = function(domElem, buttonData) {
            
            var callback = function(key, data) {
                domElem.setHover(data.hover.style);
                domElem.setPress(data.press.style);
            };
            

            PipelineAPI.subscribeToCategoryKey('ui_buttons', buttonData.id, callback);
        };
        
        return DomButton;

    });


