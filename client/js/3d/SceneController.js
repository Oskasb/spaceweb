"use strict";


define([
    '3d/GooController',
    '3d/GooEntityFactory',
    '3d/effects/ParticlePlayer',
    'Events'

], function(
    GooController,
    GooEntityFactory,
    ParticlePlayer,
    evt
) {
    
    var world;
    var gooController;
    var particlePlayer;

    var SceneController = function() {
        gooController = new GooController();


        function rendererReady(e) {
            console.log("Renderer Ready: ", evt.args(e).goo);
            GooEntityFactory.setGoo(evt.args(e).goo);
            world = evt.args(e).goo.world;

            particlePlayer = new ParticlePlayer(evt.args(e).goo);


            gooController.registerGooUpdateCallback(particlePlayer.simpleParticles.update);

            tickListen();

        }

        evt.on(evt.list().ENGINE_READY, rendererReady);

    };


    function tickListen() {


        function clientTick(e) {

        //    particlePlayer.testSpawn();

            if (Math.random() < 0.2) {

                evt.fire(evt.list().PLAY_PARTICLE, {effect:"dust_speck", simulator:"AdditiveParticle", pos:{data:[500*(Math.random()-0.5), 500*(Math.random()-0.5), -20 - 100*Math.random()]}, vel:{data:[50*Math.random(), 50*Math.random(), 0]}, callbacks:{}, density:1});

            }

            if (Math.random() < 0.05) {

                evt.fire(evt.list().PLAY_PARTICLE, {effect:"space_cloud", simulator:"AdditiveParticle", pos:{data:[1000*(Math.random()-0.5), 1000*(Math.random()-0.5), -200 - 500*Math.random()]}, vel:{data:[0, 0, 0]}, callbacks:{}, density:1});

            }

            if (Math.random() < 0.03) {

                evt.fire(evt.list().PLAY_PARTICLE, {effect:"thick_space_cloud", simulator:"AdditiveParticle", pos:{data:[2000*(Math.random()-0.5), 2000*(Math.random()-0.5), -400 - 800*Math.random()]}, vel:{data:[0, 0, 0]}, callbacks:{}, density:1});

            }


    //        evt.fire(evt.list().GAME_EFFECT, {effect:"burst", pos:{data:[100*Math.random(), 100*Math.random(), -20]}, vel:{data:[5*Math.random(), 5*Math.random(), 12]}, callbacks:{}});


        }

        evt.on(evt.list().CLIENT_TICK, clientTick);
    }
    
    

    SceneController.prototype.setup3dScene = function(clientTickCallback) {
        gooController.setupGooRunner(clientTickCallback);

    };

    
    return SceneController;

});