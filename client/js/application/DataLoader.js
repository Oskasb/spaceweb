"use strict";


define([
        'Events',
        'PipelineAPI',
        'PipelineObject',
        'ui/dom/DomLoadScreen',
        'ui/GameScreen'
    ],
    function(
        evt,
        PipelineAPI,
        PipelineObject,
        DomLoadScreen,
        GameScreen
    ) {
        var loadProgress;
        var filesLoadedOK = false;
        var clientInitiated = false;
        
        var path = './../../..';

        var loadUrls = [
            './../../../Shared/io/Message.js',
            './../../../Shared/io/SocketMessages.js',
            './../../../Shared/MATH.js'

        ];

        var sharedUrls = [
            './../../../Shared/MODEL.js',
            './../../../Shared/GAME.js'
        ];

        var pipelineOn = false;
        window.jsonConfigUrls = 'client/json/';
        if (window.location.href == 'http://127.0.0.1:5000/' || window.location.href ==  'http://localhost:5000/' || window.location.href ==  'http://192.168.0.100:5000/') {
            pipelineOn = true;
        }

        var jsonRegUrl = './client/json/config_urls.json';

        var setDebug = function(key, data) {
            SYSTEM_SETUP.DEBUG = data;
        };


        var DataLoader = function() {

            loadProgress = new DomLoadScreen(GameScreen.getElement());

        };

        var loadStates= {
            SHARED_FILES:'SHARED_FILES',
            CONFIGS:'CONFIGS',
            IMAGES:'IMAGES',
            COMPLETED:'COMPLETED'
        };

        var loadState = loadStates.CONFIGS;

        DataLoader.prototype.preloadImages = function() {
            
            var processStyleData = function(src, data) {
                console.log(src, data);
            };


            var styles = PipelineAPI.getCachedConfigs()['styles'];

            console.log(styles);

            var imageStore = [];

            for (var key in styles) {

                if (styles[key].backgroundImage) {
                    if (imageStore.indexOf(styles[key].backgroundImage)) {
                        imageStore.push(styles[key].backgroundImage);
                    }
                }
            }

            console.log("Image count: ", imageStore.length, imageStore)


        };

        DataLoader.prototype.getStates = function() {
            return loadStates;
        };
        
        DataLoader.prototype.setupPipelineCallback = function(loadStateChange) {
            function pipelineCallback(started, remaining, loaded) {
                console.log("SRL", started, remaining, loaded);
                evt.fire(evt.list().MONITOR_STATUS, {FILE_CACHE:loaded});

                loadProgress.setProgress(loaded / started);

                if (loadState == loadStates.IMAGES && remaining == 0) {
                    loadState = loadStates.COMPLETED;
                    PipelineAPI.setCategoryData('STATUS', {PIPELINE:pipelineOn});
                    PipelineAPI.subscribeToCategoryKey('setup', 'DEBUG', setDebug);
                    loadStateChange(loadState);
                }

                if (loadState == loadStates.CONFIGS && remaining == 0) {
                    // json files loaded.. go for the heavy stuff next.
                    loadState = loadStates.IMAGES;
                    loadStateChange(loadState);
                }

            }

            PipelineAPI.addProgressCallback(pipelineCallback);
        };
        
        DataLoader.prototype.loadData = function() {

            var _this = this;

            evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:window.location.href});



            var dataPipelineSetup = {
                "jsonPipe":{
                    "polling":{
                        "enabled":false,
                        "frequency":10
                    }
                },
                "svgPipe":{
                    "polling":{
                        "enabled":false,
                        "frequency":2
                    }
                },
                "imagePipe":{
                    "polling":{
                        "enabled":false,
                        "frequency":2
                    }
                }
            };



            var sharedFilesLoaded = function() {

                console.log("Shared Ready", PipelineAPI.checkReadyState());

                function pipelineError(src, e) {
                    console.log("Pipeline error Ready", src, e);
                    evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Pipeline Error '+src+' '+e});
                }

                PipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup, pipelineError);

            };




            var loadJS = function(url, implementationCode, location){

                var scriptTag = document.createElement('script');
                scriptTag.src = url;
                scriptTag.onload = implementationCode;

                location.appendChild(scriptTag);
            };

            var count = 0;

            var sharedLoaded = function() {
                count++;
                if (count == sharedUrls.length) {
                    PipelineAPI.addReadyCallback(sharedFilesLoaded);
                }
            };

            var filesLoaded = function() {
                count++;
                console.log("Pipeline Ready State:", PipelineAPI.checkReadyState());
                if (count == loadUrls.length) {
                    count = 0;
                    for (var i = 0; i < sharedUrls.length; i++) {
                        loadJS(sharedUrls[i], sharedLoaded, document.body);
                    }

                }
            };

            for (var i = 0; i < loadUrls.length; i++) {
                loadJS(loadUrls[i], filesLoaded, document.body);
            }

        };


        DataLoader.prototype.notifyCompleted = function() {
            loadProgress.removeProgress();
        };        

        return DataLoader;

    });


