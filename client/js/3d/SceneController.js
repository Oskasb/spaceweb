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

        var effectData = {
            color:[1, 1, 1, 1]
        };


        function clientTick(e) {

        //    particlePlayer.testSpawn();

            if (Math.random() < 0.8) {

                effectData.color[0] = 0.5 + Math.random()*0.5;
                effectData.color[1] = 0.5 + Math.random()*0.5;
                effectData.color[2] = 0.5 + Math.random()*0.5;

                evt.fire(evt.list().GAME_EFFECT, {effect:"space_spark", pos:{data:[200*(Math.random()-0.5), 200*(Math.random()-0.5), -10 - 80*Math.random()]}, vel:{data:[50*Math.random(), 50*Math.random(), 0]}, params:effectData});

            }

            if (Math.random() < 0.1) {

                effectData.color[0] = 0.5 + Math.random()*0.2;
                effectData.color[1] = 0.5 + Math.random()*0.3;
                effectData.color[2] = 0.5 + Math.random()*0.5;

                evt.fire(evt.list().GAME_EFFECT, {effect:"space_dust", pos:{data:[400*(Math.random()-0.5), 400*(Math.random()-0.5), -20 - 80*Math.random()]}, vel:{data:[0, 0, 0]}, params:effectData});
            }

            if (Math.random() < 0.03) {

                evt.fire(evt.list().GAME_EFFECT, {effect:"space_cloud", pos:{data:[1000*(Math.random()-0.5), 1000*(Math.random()-0.5), (Math.random()+0.3) * -2000]}, vel:{data:[0, 0, 0]}});

            }

        }

        evt.on(evt.list().CLIENT_TICK, clientTick);
    }
    
    

    SceneController.prototype.setup3dScene = function(clientTickCallback) {
        gooController.setupGooRunner(clientTickCallback);
    };

    
    return SceneController;

});