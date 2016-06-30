"use strict";


define([
    'PipelineAPI',
    'application/Settings',
    'Events',
    'goo/entities/GooRunner',
    'goo/renderer/Renderer',
    'goo/math/Vector3',
    'goo/renderer/Texture',
    'goo/math/Vector',
    '3d/GooCameraController',
    'ui/GooMonitor',
    'ui/dom/DomUtils',
    'ui/GameScreen'



], function(
    PipelineAPI,
    Settings,
    evt,
    GooRunner,
    Renderer,
    Vector3,
    Texture,
    Vector,
    GooCameraController,
    GooMonitor,
    DomUtils,
    GameScreen
) {

    var GooController = function() {
        this.cameraController = new GooCameraController();
        this.gooMonitor = new GooMonitor();
    };

    GooController.prototype.setupGooRunner = function(clientTickCallback) {
        
        var antialias = PipelineAPI.readCachedConfigKey('SETUP', 'ANTIALIAS');;
        
        var downscale = PipelineAPI.readCachedConfigKey('SETUP', 'PX_SCALE');
        

        var goo = new GooRunner({
            showStats:false,
            antialias:antialias,
            debug:false,
            manuallyStartGameLoop:true,
            tpfSmoothingCount:1,
            useTryCatch:false,
            logo:false,
            downScale:downscale
        });

        //	goo.renderer.downScale = downscale;

        var adjustPxScale = function(value) {
            console.log("Adjust Px Scale: ", value)
            goo.renderer.downScale = value;
        };

        Settings.addOnChangeCallback('display_pixel_scale', adjustPxScale);

        this.goo = goo;
        goo.renderer.setClearColor(0.05, 0.0, 0.09, 0.21);

        document.getElementById('game_window').appendChild(goo.renderer.domElement);
        goo.startGameLoop(clientTickCallback);

        var setupGooScene = function() {
            evt.fire(evt.list().ENGINE_READY, {goo:goo});
        };

        setupGooScene();

        var camEvt = {
            camTpf:0
        };
        
        var cameraTickEvent = function(tpf) {
            camEvt.camTpf = tpf;
            evt.fire(evt.list().CAMERA_TICK, camEvt);
        };
        
    //    this.registerGooUpdateCallback(cameraTickEvent);
        //	this.cameraController.setCameraPosition(0, 0, 0);

        var notifyRezize = function() {
            setTimeout(function() {
                goo.renderer.checkResize(goo.renderer.mainCamera);
            }, 100);

        };

        window.addEventListener('resize', notifyRezize);
        notifyRezize();
    };

    GooController.prototype.updateWorld = function(tpf) {
        this.gooCameraController.updateCamera()
    };

    GooController.prototype.registerGooUpdateCallback = function(callback) {
        this.goo.callbacksPreRender.push(callback);
        //	this.updateCallbacks.push(callback);
    };


    var monkeypatchCustomEngine = function() {

        //	Vector = function(size) {
        //		this.data = new Float64Array(size);
        //	};
    //    DomUtils.addElementClass(document.getElementById('game_window'), 'game_window_landscape');

        document.getElementById('game_window').style.left = '122em';
        document.getElementById('game_window').style.right = '122em';
        document.getElementById('game_window').style.top = '0em';
        document.getElementById('game_window').style.bottom = '0em';
        document.getElementById('game_window').style.width = 'auto';
        document.getElementById('game_window').style.height = 'auto';
        document.getElementById('game_window').style.position = 'fixed';

        var width = window.innerWidth;
        var height = window.innerHeight;
        var landscape = false;
        
        var handleResize = function() {
            width = window.innerWidth;
            height = window.innerHeight;
            

            if (width > height) {
                document.getElementById('game_window').style.left = '122em';
                document.getElementById('game_window').style.right = '122em';
                document.getElementById('game_window').style.top = '0em';
                document.getElementById('game_window').style.bottom = '0em';

                GameScreen.setLandscape(true);
                landscape = true;
                evt.fire(evt.list().SCREEN_CONFIG, {landscape:true})
            } else {
                document.getElementById('game_window').style.left = '0em';
                document.getElementById('game_window').style.right = '0em';
                document.getElementById('game_window').style.top = '122em';
                document.getElementById('game_window').style.bottom = '122em';


                GameScreen.setLandscape(false);
                landscape = false;
                evt.fire(evt.list().SCREEN_CONFIG, {landscape:false})
            }

            width = document.getElementById('game_window').offsetWidth;
            height = document.getElementById('game_window').offsetHeight;
            GameScreen.notifyResize();
            PipelineAPI.setCategoryData('SETUP', {SCREEN:[width, height], LANDSCAPE:landscape});
            
        };

        evt.once(evt.list().PARTICLES_READY, handleResize);

        window.addEventListener('resize', handleResize);

        window.addEventListener('load', function() {
            handleResize()
        });

        Renderer.prototype.checkResize = function (camera) {

            var devicePixelRatio = this.devicePixelRatio = this._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / this.svg.currentScale : 1;

            var adjustWidth = width * devicePixelRatio / this.downScale;
            var adjustHeight = height * devicePixelRatio / this.downScale;

            var fullWidth = adjustWidth;
            var fullHeight = adjustHeight;

            if (camera && camera.lockedRatio === true && camera.aspect) {
                adjustWidth = adjustHeight * camera.aspect;
            }

            var aspect = adjustWidth / adjustHeight;
            this.setSize(adjustWidth, adjustHeight, fullWidth, fullHeight);

            if (camera && camera.lockedRatio === false && camera.aspect !== aspect) {
                camera.aspect = aspect;
                if (camera.projectionMode === 0) {
                    camera.setFrustumPerspective();
                } else {
                    camera.setFrustum();
                }
                camera.onFrameChange();
            }
        };

        setTimeout(function() {
            handleResize();
        }, 1000);

    };

    monkeypatchCustomEngine();

    return GooController;

});