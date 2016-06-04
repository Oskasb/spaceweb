"use strict";


define([
    '3d/GooController',
    '3d/GooEntityFactory',
    '3d/effects/SimpleParticles',
    'Events'

], function(
    GooController,
    GooEntityFactory,
    SimpleParticles,
    evt
) {
    
    var world;

    var simpleParticles;

    var SceneController = function() {
        this.gooController = new GooController();

        this.particlesAPI = null;

        function rendererReady(e) {
            console.log("Renderer Ready: ", evt.args(e).goo);
            GooEntityFactory.setGoo(evt.args(e).goo);
            world = evt.args(e).goo.world;

            simpleParticles = new SimpleParticles(evt.args(e).goo);
            simpleParticles.createSystems();

            debugBox(100);

        }

        evt.on(evt.list().ENGINE_READY, rendererReady);

    };

    var boxes = [];

    function debugBox(count) {



        for (var i = 0; i < count; i++) {
            var box = GooEntityFactory.buildPrimitive();
            boxes.push(box);
            box.transformComponent.transform.translation.setDirect(Math.random()*100, Math.random()*100, 0);
            box.transformComponent.setUpdated();
        }


        function clientTick(e) {

            simpleParticles.testSpawn();
            simpleParticles.update(evt.args(e).tpf);


            for (var i = 0; i < boxes.length; i++) {
                boxes[i].transformComponent.transform.translation.data[2] = (Math.sin(i + evt.args(e).frame*0.05)*0.2*i) -150;
                boxes[i].transformComponent.setUpdated();
            }

        }

        evt.on(evt.list().CLIENT_TICK, clientTick);
    }
    
    

    SceneController.prototype.setup3dScene = function() {
        this.gooController.setupGooRunner();

    };

    
    return SceneController;

});