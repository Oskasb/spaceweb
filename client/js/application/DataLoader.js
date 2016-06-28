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

        var client;
        var loadProgress;
        var filesLoadedOK = false;
        var clientInitiated = false;
        
        var path = './../../..';

        var loadUrls = [
            './../../../Shared/io/Message.js',
            './../../../Shared/io/SocketMessages.js',
            './../../../Shared/MATH.js',
            './../../../Shared/MODEL.js',
            './../../../Shared/GAME.js'
        ];

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

        var loadState = loadStates.SHARED_FILES;

        DataLoader.prototype.preloadImages = function() {
            
            var processStyleData = function(src, data) {
                console.log(src, data);
            };


            var styles = PipelineAPI.getCachedConfigs()['styles'];

        //    console.log(styles);

            var imageStore = [];

            for (var key in styles) {

                if (styles[key].backgroundImage) {
                    if (imageStore.indexOf(styles[key].backgroundImage)) {
                        imageStore.push(styles[key].backgroundImage);
                    }
                }
            }

        //    console.log("Image count: ", imageStore.length, imageStore)


        };

        DataLoader.prototype.getStates = function() {
            return loadStates;
        };
        
        DataLoader.prototype.setupPipelineCallback = function(loadStateChange) {

        };
        
        DataLoader.prototype.loadData = function(Client, PointerCursor, sceneController) {

            var _this = this;

            var initClient = function() {
                if (client) {
                    console.log("Multi Inits requested, bailing");
                    return;
                }
                client = new Client(new PointerCursor());

                client.setupSimulation(sceneController);

            };

            function connectionReady() {
                console.log('connectionReady')
                _this.notifyCompleted();
            }


            function connectClient() {
                console.log('connectClient')
                client.initiateClient(new SocketMessages(), connectionReady);
            }




            var loadStateChange = function(state) {
                console.log('loadStateChange', state)
                if (state == _this.getStates().IMAGES) {

                    setTimeout(function() {
                        initClient();
                    }, 10);

                    _this.preloadImages();
                }

                if (state == _this.getStates().COMPLETED) {

                    connectClient();
                }

            };

            evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:window.location.href});



            function pipelineCallback(started, remaining, loaded) {
            //    console.log("SRL", started, remaining, loaded);

                evt.fire(evt.list().MONITOR_STATUS, {FILE_CACHE:loaded});

                loadProgress.setProgress(loaded / started);

                if (loadState == loadStates.IMAGES && remaining == 0) {
                    loadState = loadStates.COMPLETED;
                    PipelineAPI.setCategoryData('STATUS', {PIPELINE:pipelineOn});
                    PipelineAPI.subscribeToCategoryKey('setup', 'DEBUG', setDebug);
                    setTimeout(function() {
                        loadStateChange(loadState);
                    }, 10);
                }

                if (loadState == loadStates.CONFIGS && remaining == 0) {
                    console.log( "json files loaded.. go for the heavy stuff next.")
                    loadState = loadStates.IMAGES;
                    setTimeout(function() {
                        loadStateChange(loadState);
                    }, 10);
                }

                if (loadState == loadStates.SHARED_FILES && remaining == 0) {
                    console.log( "shared loaded....")
                    loadState = loadStates.CONFIGS;
                    setTimeout(function() {
                        loadStateChange(loadState);
                    }, 10);


                }
            }

            PipelineAPI.addProgressCallback(pipelineCallback);


            var sharedFilesLoaded = function() {
                console.log('sharedFilesLoaded')
                function pipelineError(src, e) {
                    console.log("Pipeline error Ready", src, e);
                    evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Pipeline Error '+src+' '+e});
                }
                evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:"Request Worker Fetch"});
                PipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup, pipelineError);

            };


            var sharedLoaded = function() {
                console.log("Shared Loaded:", count, loadUrls.length, PipelineAPI.checkReadyState());
            //    count++;
            //    if (count == sharedUrls.length) {
                evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:"Shared Loaded"});
                setTimeout(function() {

                    _this.setupPipelineCallback(loadStateChange);
                    sharedFilesLoaded();
                }, 20);

            };


            var filesLoaded = function() {
                count++;
                console.log("Pipeline Ready State:", count, loadUrls.length, PipelineAPI.checkReadyState());
                if (count == loadUrls.length) {
                    //    count = 0;
                    setTimeout(function() {
                        sharedLoaded();
                    }, 20)

                }
            };




            var loadJS = function(url, implementationCode, location){

                var scriptTag = document.createElement('script');
                scriptTag.src = url;

                var scriptLoaded = function(e) {
                    console.log(e);
                    implementationCode();
                };


                scriptTag.addEventListener('load', scriptLoaded);
                location.appendChild(scriptTag);
            };

            var count = 0;

            var pipelineReady = function() {

                evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:"Pipeline Ready"});
                for (var i = 0; i < loadUrls.length; i++) {
                    loadJS(loadUrls[i], filesLoaded, document.body);
                }
            };






            PipelineAPI.addReadyCallback(pipelineReady);



        };


        DataLoader.prototype.notifyCompleted = function() {
            loadProgress.removeProgress();
        };        

        return DataLoader;

    });


