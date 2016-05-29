"use strict";


define([
        'ui/DomElement',
        'ui/GameScreen',
    "PipelineAPI"
    ],
    function(
        DomElement,
        GameScreen,
        PipelineAPI
    ) {

        var DomPopup = function(configId, closeCallback) {
        
            var _this = this;
            
            this.selection = "Name_"+Math.floor(1+Math.random()*1000);
            this.closeCallback = closeCallback;
            
            this.input = null;

            var callback = function(key, data) {
                _this.config = data;
                _this.applyPopupConfigs(data);
            };

            this.elements = {};
            
            PipelineAPI.subscribeToCategoryKey('popups', 'select_name', callback);

        //    if (SYSTEM_SETUP.DEBUG) {
                setTimeout(function() {
                    if (_this.input) {
                        _this.selection = _this.input;
                    }
                    closeCallback(_this.selection);
                    _this.removePopup();
                }, 2000 + 100);
        //    }


        };

        DomPopup.prototype.applyPopupConfigs = function(config) {
            var _this = this;

            var dataSource;
            var dataSample;

            var inputCallback = function() {
                _this.inputChanged(dataSource.element.value);
                dataSample.setText(dataSource.element.value);
            };

            var parent = GameScreen.getElement()
            for (var i = 0; i < config.length; i++) {
                var conf = config[i];
                if (conf.data.parentId) parent = this.elements[conf.data.parentId].element;


                var elem = new DomElement(parent, conf.data.style, conf.data.input);

                if (conf.data.data_sample) {
                    dataSample = elem;
                    elem.setText(this.selection);
                }

                if (conf.data.input) {
                    elem.element.onchange = inputCallback;
                    elem.element.placeholder = conf.data.input.placeholder;
                    dataSource = elem;
                }

                if (conf.data.text) {
                    elem.setText(conf.data.text)
                }
                this.elements[conf.id] = elem;
            }
            

        };

        DomPopup.prototype.inputChanged = function(value) {
            this.input = value;
            var _this = this;

            setTimeout(function() {
                if (_this.input) {
                    _this.selection = _this.input;
                }
                _this.closeCallback(_this.selection);
                _this.removePopup();
            }, 300); 

        };

        DomPopup.prototype.removePopup = function() {
            this.elements[this.config[0].id].removeElement();
            delete this;
        };
        
        return DomPopup;

    });