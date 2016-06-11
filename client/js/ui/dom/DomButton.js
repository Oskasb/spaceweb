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


        var DomButton = function(parent, domElem, buttonData) {

            var state = {
                pressed:false,
                active:PipelineAPI.readCachedConfigKey(buttonData.event.category, buttonData.event.key),
                value:true
            };

            var data = {};
            data[buttonData.event.key] = state.value;

            var onHover = function() {

            };

            var onPress = function() {

            };

            var onActive = function() {

            };

            var onClick = function() {

                if (buttonData.event.type == 'toggle') {
                    state.active = !state.active;
                    parent.setActive(state.active);
                    state.value = state.active;
                }
                data[buttonData.event.key] = state.value;
                evt.fire(evt.list().BUTTON_EVENT, {category:buttonData.event.category, data:data});
            };

            
            var callback = function(key, data) {
                domElem.setHover(data.hover.style, onHover);
                domElem.setPress(data.press.style, onPress);
                domElem.setClick(onClick);
                parent.enableActive(data.active.style, onActive);
                parent.setActive(state.active);
            };

            PipelineAPI.subscribeToCategoryKey('ui_buttons', buttonData.id, callback);
        };
        
        return DomButton;

    });


