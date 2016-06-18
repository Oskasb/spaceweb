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
    'application/DataLoader',
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
    DataLoader,
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




    function checkReady() {
        console.log("Check Ready");
        initClient();
        if (particles && dataLoader.checkReady()) {
            console.log("Check Ready");

            
            client.initiateClient(new SocketMessages());

            evt.removeListener(evt.list().PARTICLES_READY, particlesReady);
        }
    }
    

    var dataLoader = new DataLoader();

    dataLoader.loadData(dataPipelineSetup, checkReady);
    


    var particles = false;
    var client;
    

    var initClient = function() {
        if (client) {
            console.log("Multi Inits requested, bailing");
            return;
        }
        client = new Client(new PointerCursor());
        var clientTick = function(tpf) {
            client.tick(tpf)
        };
        sceneController.setup3dScene(clientTick);
    };


    var particlesReady = function() {
        console.log("particlesReady");
        particles = true;
        checkReady();
    };


    evt.on(evt.list().PARTICLES_READY, particlesReady);


});
