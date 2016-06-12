"use strict";


define([
    '3d/GooController',
    '3d/GooEntityFactory',
    '3d/effects/ParticlePlayer',
    '3d/effects/SpaceFX',
    'Events'

], function(
    GooController,
    GooEntityFactory,
    ParticlePlayer,
    SpaceFX,
    evt
) {
    
    var world;
    var gooController;
    var particlePlayer;
    var spaceFX;

    var SceneController = function() {
        gooController = new GooController();
        spaceFX = new SpaceFX();
        
        function rendererReady(e) {
            GooEntityFactory.setGoo(evt.args(e).goo);
            world = evt.args(e).goo.world;
            particlePlayer = new ParticlePlayer(evt.args(e).goo);
            evt.removeListener(evt.list().ENGINE_READY, rendererReady);
        }

        function drawReady() {
            gooController.registerGooUpdateCallback(particlePlayer.simpleParticles.update);
            tickListen();
            evt.removeListener(evt.list().PARTICLES_READY, drawReady);
        }

        evt.on(evt.list().ENGINE_READY, rendererReady);
        evt.on(evt.list().PARTICLES_READY, drawReady);

    };


    function tickListen() {

        spaceFX.setupSpaceFxScene();
      
    }
    
    

    SceneController.prototype.setup3dScene = function(clientTickCallback) {
        gooController.setupGooRunner(clientTickCallback);
    };

    
    return SceneController;

});