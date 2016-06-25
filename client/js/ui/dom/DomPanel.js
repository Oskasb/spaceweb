"use strict";


define([
        'Events',
        'PipelineAPI',
        'ui/dom/DomElement',
        'ui/dom/DomButton',
        'ui/dom/DomDataField',
        'ui/dom/DomDataLog',
    'ui/dom/DomCanvas',
        'ui/GameScreen'
    ],
    function(
        evt,
        PipelineAPI,
        DomElement,
        DomButton,
        DomDataField,
        DomDataLog,
        DomCanvas,
        GameScreen
    ) {

        var styles = {};

        var DomPanel = function(parentElem, panelId, adaptiveLayout) {
            this.active = true;
            this.ready = false;
            var _this = this;

            var parent = {
                element:parentElem
            };

            this.config = {};

            this.uiSystems = [];
            
            var callback = function(key, data) {
                _this.config = data;
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

        DomPanel.prototype.applyCanvas = function(elem, confData) {
            var domCanvas = new DomCanvas(elem, confData);
            this.uiSystems.push(domCanvas);

            var setupReady = function(data) {
    //            console.log("Config for 3d canvas:", data);
                domCanvas.initCanvasSystem(data);
            };

            var confLoaded = function(src, conf) {
                for (var i = 0; i < conf.length; i++) {
                    if (conf[i].id == confData.configId) {
                        setupReady(conf[i].data);
                        return;
                    }
                }
                console.log("Config Missing for 3d canvas:", confData);
            };

            PipelineAPI.subscribeToCategoryKey('canvas2d', 'elements', confLoaded);
        };


        DomPanel.prototype.applyCanvas3d = function(elem, confData) {

            var _this = this;
            var domCanvas = new DomCanvas(elem, confData);
            this.uiSystems.push(domCanvas);

            var setupReady = function(data) {
                domCanvas.initCanvasSystem(data);
            };

            var confLoaded = function(src, conf) {
                for (var i = 0; i < conf.length; i++) {
                    if (conf[i].id == confData.configId) {
                        setupReady(conf[i].data);
                        return;
                    }
                }
                console.log("Config Missing for 3d canvas:", confData);
            };

            PipelineAPI.subscribeToCategoryKey('canvas3d', 'elements', confLoaded);

        };




        DomPanel.prototype.applyConfigs = function(parent, config) {

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
                if (conf.data.parentId) parent = this.elements[conf.data.parentId];

                
                if (conf.data.style) {
                    var elem = new DomElement(parent.element, conf.data.style, conf.data.input);
                }else {
                    elem = parent;
                }
                

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
                    new DomDataLog(elem, conf.data.dataLog);
                }

                if (conf.data.canvas) {
                    this.applyCanvas(elem, conf.data.canvas)
                }

                if (conf.data.canvas3d) {
                    this.applyCanvas3d(elem, conf.data.canvas3d)

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
            this.ready = true;
        };

        DomPanel.prototype.setLandscape = function() {

            if (!this.ready) return;

            if (GameScreen.getLandscape()) {
                this.elements[this.config[0].id].applyStyleParams(styles.panel_landscape);
            } else {
                this.elements[this.config[0].id].applyStyleParams(styles.panel_portrait);
            }

        };

        DomPanel.prototype.removeGuiPanel = function() {
            
            for (var i = 0; i < this.uiSystems.length; i++) {
                this.uiSystems.removeUiSystem();
            }
            
            this.active = false;
            this.elements[this.config[0].id].removeElement();
            delete this;
        };

        return DomPanel;

    });


