"use strict";


define([
        'Events',
        'PipelineAPI',
        'PipelineObject',
        'ui/dom/DomProgress',
        'ui/GameScreen',
    ],
    function(
        evt,
        PipelineAPI,
        PipelineObject,
        DomProgress,
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
        
        var jsonRegUrl = './client/json/config_urls.json';
        
        var DataLoader = function() {

            loadProgress = new DomProgress(GameScreen.getElement(), 'load_progress');

        };

        DataLoader.prototype.loadData = function(dataPipelineSetup, onLoadComplete) {

            var setDebug = function(key, data) {
                SYSTEM_SETUP.DEBUG = data;
            };

            var sharedFilesLoaded = function() {

                console.log("Shared Ready", PipelineAPI.checkReadyState());

                function pipelineError(src, e) {
                    console.log("Pipeline error Ready", src, e);
                    evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Pipeline Error '+src+' '+e});
                }


                PipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup, pipelineError);



                function pipelineCallback(started, remaining, loaded) {
                    console.log("SRL", started, remaining, loaded);
                    evt.fire(evt.list().MONITOR_STATUS, {FILE_CACHE:loaded});

                    loadProgress.setProgress(loaded / started);


                    if (remaining == 0 && started > 5) {
                        if (clientInitiated) return;
                        filesLoadedOK = true;
                        PipelineAPI.subscribeToCategoryKey('setup', 'DEBUG', setDebug);
                        onLoadComplete();
                        clientInitiated = true;
                    }

                }

                PipelineAPI.addProgressCallback(pipelineCallback);

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


        DataLoader.prototype.checkReady = function() {
            if (filesLoadedOK) {
                loadProgress.removeProgress();
            }
            return filesLoadedOK;

        };        

        return DataLoader;

    });


