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
        gui:'./lib/canvas_gui/',
        particle_system:'./lib/particles',
        data_pipeline:'./lib/data_pipeline/src/'
    }
});

var meta = document.createElement('meta');
meta.name = "viewport";
meta.content = "initial-scale=1, maximum-scale=1";
document.getElementsByTagName('head')[0].appendChild(meta);


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
    'application/DevConfigurator',
    'application/SystemDetector',
    'application/ButtonEventDispatcher',
    'application/Client',
    'application/StatusMonitor',
    'ui/GameScreen',
    'io/PointerCursor',
    'Events',
    'PipelineAPI',
    'ui/dom/DomMessage',
    'ui/dom/DomProgress'
], function(
    SceneController,
    DevConfigurator,
    SystemDetector,
    ButtonEventDispatcher,
    Client,
    StatusMonitor,
    GameScreen,
    PointerCursor,
    evt,
    PipelineAPI,
    DomMessage,
    DomProgress
) {

    new StatusMonitor();
    new SystemDetector();
    new ButtonEventDispatcher();
    new DevConfigurator();


    GameScreen.registerAppContainer(document.getElementById('game_window'));


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
    evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:window.location.href});
    var pipelineOn = false;

    if (window.location.href == 'http://127.0.0.1:5000/' || window.location.href ==  'http://localhost:5000/' || window.location.href ==  'http://192.168.0.100:5000/') {
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
    var filesLoadedOK = false;
    var particles = false;
    var client;
    var loadProgress = new DomProgress(GameScreen.getElement(), 'load_progress');

    var initClient = function() {
        if (clientInitiated) {
            console.log("Multi Inits requested, bailing");
            return;
        }
        client = new Client(new PointerCursor());
        var clientTick = function(tpf) {
            client.tick(tpf)
        };
        sceneController.setup3dScene(clientTick);
    };


    var setDebug = function(key, data) {
        SYSTEM_SETUP.DEBUG = data;
    };
    
    var sharedFilesLoaded = function() {

        function pipelineError(src, e) {
            evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_error', message:'Pipeline Error '+src+' '+e});
        }
        
        
        PipelineAPI.dataPipelineSetup(jsonRegUrl, dataPipelineSetup, pipelineError);



        function pipelineCallback(started, remaining, loaded) {
            var spread = 150;
            evt.fire(evt.list().MONITOR_STATUS, {FILE_CACHE:loaded});

            loadProgress.setProgress(loaded / started);


            if (remaining == 0) {
                if (clientInitiated) return;
                filesLoadedOK = true;
                initClient();
                checkReady();
                clientInitiated = true;
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

    var particlesReady = function() {
        particles = true;
        checkReady();
    };

    function checkReady() {
        if (particles && filesLoadedOK) {
            loadProgress.removeProgress();
            client.initiateClient(new SocketMessages());

            evt.removeListener(evt.list().PARTICLES_READY, particlesReady);
        }
    }



    evt.on(evt.list().PARTICLES_READY, particlesReady);


});
