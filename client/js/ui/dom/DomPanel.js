"use strict";


define([
        'Events',
        'PipelineAPI',
        'ui/dom/DomElement',
        'ui/dom/DomButton',
        'ui/dom/DomDataField',
        'ui/dom/DomDataLog',
        'ui/GameScreen'
    ],
    function(
        evt,
        PipelineAPI,
        DomElement,
        DomButton,
        DomDataField,
        DomDataLog,
        GameScreen
    ) {

        var styles = {};

        var DomPanel = function(parent, panelId, adaptiveLayout) {
            this.active = true;
            var _this = this;

            this.config = {};

            var callback = function(key, data) {
                _this.config = data;
                console.log("apply panel again")
                if (_this.active) {
                    _this.applyConfigs(parent, data);
                                    }
            };

            this.elements = {};

            PipelineAPI.subscribeToCategoryKey('ui_panels', panelId, callback);

            if (adaptiveLayout) {
                var orientationStyle = function(key, data) {
                    styles[key] = data;
                    _this.setLandscape();
                };

                PipelineAPI.subscribeToCategoryKey('styles', 'panel_portrait', orientationStyle);
                PipelineAPI.subscribeToCategoryKey('styles', 'panel_landscape', orientationStyle);
            }
            

        };

        DomPanel.prototype.applyButton = function(parent, elem, confData) {
            var button = new DomButton();

            var setupReady = function(src, data) {
                button.setupReady(parent, elem, confData.button)
            };

            if (PipelineAPI.readCachedConfigKey('SETUP', 'INPUT') == 'mouse' || PipelineAPI.readCachedConfigKey('SETUP', 'INPUT') == 'touch') {
                setupReady();
            } else {
                PipelineAPI.subscribeToCategoryKey('SETUP', 'INPUT', setupReady);
            }

        };
        
        
        DomPanel.prototype.applyConfigs = function(parent, config) {

            console.log("apply panel configs")

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

                if (conf.data.button) {
                    this.applyButton(this.elements[conf.data.parentId], elem, conf.data);
                    
                }

                if (conf.data.dataField) {
                    new DomDataField(elem, conf.data.dataField)
                }

                if (conf.data.dataLog) {
                    new DomDataLog(elem, conf.data.dataLog)
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

        DomPanel.prototype.setLandscape = function() {

            if (GameScreen.getLandscape()) {
                this.elements[this.config[0].id].applyStyleParams(styles.panel_landscape);
            } else {
                this.elements[this.config[0].id].applyStyleParams(styles.panel_portrait);
            }

        };

        DomPanel.prototype.removeGuiPanel = function() {
            this.active = false;
            this.elements[this.config[0].id].removeElement();
            delete this;
        };

        return DomPanel;

    });


