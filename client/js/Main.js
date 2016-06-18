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
    var dataLoader = new DataLoader();
    var client;

    console.log(window.location.href);

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

    function connectionReady() {
        dataLoader.notifyCompleted();
    }


    function connectClient() {
        client.initiateClient(new SocketMessages(), connectionReady);
    }




    var loadStateChange = function(state) {
        console.log('loadStateChange', state)
        if (state == dataLoader.getStates().IMAGES) {
            initClient();
            dataLoader.preloadImages();
        }

        if (state == dataLoader.getStates().COMPLETED) {
            connectClient();

        }

    };

    dataLoader.setupPipelineCallback(loadStateChange);

    dataLoader.loadData();



});
