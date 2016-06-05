"use strict";

var SYSTEM_SETUP = {
    DEBUG:{
        on:false
    }
};

require.config({
    paths: {
        goo:'./lib/goo',
        shared:'./../../../Shared',
        PipelineAPI:'./lib/data_pipeline/src/PipelineAPI',
        particle_system:'./lib/particles',
        data_pipeline:'./lib/data_pipeline/src/'
    }
});

var meta = document.createElement('meta');
meta.name = "viewport";
meta.content = "initial-scale=1, maximum-scale=1";
// document.getElementsByTagName('head')[0].appendChild(meta);


Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

require([
    '3d/SceneController',
    'application/Client',
    'ui/GameScreen',
    'io/InputState',
    'io/PointerCursor',
    'Events',
    'PipelineAPI',
    'ui/DomMessage',
    'ui/DomProgress',
    'ui/DomMonitor'
], function(
    SceneController,
    Client,
    GameScreen,
    InputState,
    PointerCursor,
    evt,
    PipelineAPI,
    DomMessage,
    DomProgress,
    DomMonitor
) {

    GameScreen.registerAppContainer(document.body);

    var domMonitor = new DomMonitor();
    var sceneController = new SceneController();
    
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
    window.jsonConfigUrls = 'client/json/';


    console.log(window.location.href);

    var pipelineOn = false;

    if (window.location.href == 'http://127.0.0.1:5000/' ||  'http://localhost:5000/') {
        pipelineOn = true;
    }

    var dataPipelineSetup = {
        "jsonPipe":{
            "polling":{
                "enabled":pipelineOn,
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

    var clientInitiated = false;

    var initClient = function() {
        if (clientInitiated) {
            console.log("Multi Inits requested, bailing");
            return;
        }
        var client = new Client(new PointerCursor(new InputState()));
        client.initiateClient(new SocketMessages());

        var clientTick = function(tpf) {
            client.tick(tpf)
        };

        sceneController.setup3dScene(clientTick);
    };


    var setDebug = function(key, data) {
        console.log("Set Debug: ", data);
        SYSTEM_SETUP.DEBUG = data;
        domMonitor.applyDebugSettings(data);
    };
    
    var sharedFilesLoaded = function() {

        function pipelineError(src, e) {
            evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Pipeline Error '+src+' '+e});
        }
        
        
        PipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup, pipelineError);

        var loadProgress = new DomProgress(GameScreen.getElement(), 'load_progress');

        function pipelineCallback(started, remaining, loaded) {
            var spread = 150;

            var x = 50*0.01*GameScreen.getWidth()-spread*0.5 + Math.random()*spread;
            var y = 50*0.01*GameScreen.getHeight()-spread*0.5 + Math.random()*spread;
            var message = new DomMessage(GameScreen.getElement(), loaded, 'piece_state_hint', x, y, 0.8);
            message.animateToXYZ(x, y-2, 0);
            
            loadProgress.setProgress(loaded / started);


            if (remaining == 0) {
        //        console.log("client ready: ", clientInitiated, remaining, loaded, started);
                initClient();
                clientInitiated = true;
                loadProgress.removeProgress();
            }

        }

        PipelineAPI.addProgressCallback(pipelineCallback);
        PipelineAPI.subscribeToCategoryKey('setup', 'DEBUG', setDebug);
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
  //      console.log("Pipeline Ready State:", PipelineAPI.checkReadyState());

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




});
