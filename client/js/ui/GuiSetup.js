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
        
        var GuiSetup = function() {
            this.active = true;
            var parent = document.body;
            var _this = this;

            this.config = {};

            var callback = function(key, data) {
                _this.config = data;
                if (_this.active) {
                    _this.applyConfigs(parent, data);
                }
            };

            this.elements = {};

            PipelineAPI.subscribeToCategoryKey('main_navigation', 'right_panel', callback);
        };

        GuiSetup.prototype.applyConfigs = function(parent, config) {
            var _this = this;

            if (this.elements[this.config[0].id]) {
                this.elements[this.config[0].id].removeElement();
            }

            var dataSource;
            var dataSample;

            var submitCallback = function() {
                _this.submitValue(dataSource.element.value);
            };

            var inputValueCallback = function() {
                dataSample.setText(dataSource.element.value);
                _this.inputChanged(dataSource.element.value);
            };

            
            for (var i = 0; i < config.length; i++) {
                var conf = config[i];
                if (conf.data.parentId) parent = this.elements[conf.data.parentId].element;
                
                var elem = new DomElement(parent, conf.data.style, conf.data.input);

                if (conf.data.data_sample) {
                    dataSample = elem;
                    elem.setText(this.selection);
                }

                if (conf.data.input) {

                    var startCB = function(e) {
                        e.stopPropagation();
                        //    elem.element.focus();
                    };

                    var endCB = function(e) {
                        e.stopPropagation();
                        elem.element.focus();
                    };

                    elem.element.addEventListener('touchstart', startCB);
                    elem.element.addEventListener('touchend', endCB);

                    elem.element.addEventListener('click', startCB);

                    elem.enableInteraction(startCB, endCB);
                    elem.element.onchange = submitCallback;
                    elem.element.oninput = inputValueCallback;
                    elem.element.placeholder = conf.data.input.placeholder;
                    dataSource = elem;
                }

                if (conf.data.text) {
                    elem.setText(conf.data.text)
                }
                this.elements[conf.id] = elem;
            }


        };

        GuiSetup.prototype.removeMainGui = function() {
            this.active = false;
            this.elements[this.config[0].id].removeElement();
            delete this;
        };

        GuiSetup.prototype.tickTextRenderer = function(tpf) {

        };


        return GuiSetup;

    });


