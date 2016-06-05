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

    var particlePlayer;

    var SceneController = function() {
        this.gooController = new GooController();

        this.particlesAPI = null;

        function rendererReady(e) {
            console.log("Renderer Ready: ", evt.args(e).goo);
            GooEntityFactory.setGoo(evt.args(e).goo);
            world = evt.args(e).goo.world;

            particlePlayer = new ParticlePlayer(evt.args(e).goo);


            tickListen();

        }

        evt.on(evt.list().ENGINE_READY, rendererReady);

    };


    function tickListen() {


        function clientTick(e) {

        //    particlePlayer.testSpawn();

            evt.fire(evt.list().PLAY_PARTICLE, {effect:"background_star", simulator:"AdditiveParticle", pos:{data:[100*Math.random(), 100*Math.random(), -20]}, vel:{data:[5*Math.random(), 5*Math.random(), 12]}, callbacks:{}, density:100});

    //        evt.fire(evt.list().GAME_EFFECT, {effect:"burst", pos:{data:[100*Math.random(), 100*Math.random(), -20]}, vel:{data:[5*Math.random(), 5*Math.random(), 12]}, callbacks:{}});


            particlePlayer.update(evt.args(e).tpf);

        }

        evt.on(evt.list().CLIENT_TICK, clientTick);
    }
    
    

    SceneController.prototype.setup3dScene = function() {
        this.gooController.setupGooRunner();

    };

    
    return SceneController;

});