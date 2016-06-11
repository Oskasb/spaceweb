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

        var standalone = window.navigator.standalone,
            userAgent = window.navigator.userAgent.toLowerCase(),
            safari = /safari/.test( userAgent ),
            ios = /iphone|ipod|ipad/.test( userAgent ),
            chrome = /chrome/.test( userAgent ),
            android = /android/.test( userAgent );

        var isAndroid = !!navigator.userAgent.match(/Android/i);

        var downscale = 1;
        var antialias = true;
        if (isAndroid){
            downscale = 0.5;
            //	antialias = false;
            PipelineAPI.setCategoryData('SETUP', {CLIENT_OS:'Android'});
        }

        var times = 0;

        if (standalone) {
            PipelineAPI.setCategoryData('SETUP', {BROWSER:'Standalone'});
        }
        if (chrome) {
            PipelineAPI.setCategoryData('SETUP', {BROWSER:'Chrome'});
        }

        if (safari) {
            PipelineAPI.setCategoryData('SETUP', {BROWSER:'Safari'});
        }


        evt.fire(evt.list().MESSAGE_UI, {channel:'pipeline_message', message:window.location.href});


        if (ios) {
            SYSTEM_SETUP.ios = true;
            downscale = 4;
            antialias = false;

            PipelineAPI.setCategoryData('SETUP', {CLIENT_OS:'IOS'});

        }






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
        goo.startGameLoop();

        var setupGooScene = function() {
            console.log("Setup Goo Scene");

            evt.fire(evt.list().ENGINE_READY, {goo:goo});
        };

        setupGooScene();
        this.registerGooUpdateCallback(clientTickCallback);
        //	this.cameraController.setCameraPosition(0, 0, 0);
    };

    GooController.prototype.updateWorld = function(tpf) {
        this.gooCameraController.updateCamera()
    };

    GooController.prototype.registerGooUpdateCallback = function(callback) {
        this.goo.callbacksPreRender.push(callback);
        //	this.updateCallbacks.push(callback);
    };


    var monkeypatchCustomEngine = function() {

        console.log("Monkeypatch Engine");

        //	Vector = function(size) {
        //		this.data = new Float64Array(size);
        //	};
        DomUtils.addElementClass(document.getElementById('game_window'), 'game_window_landscape');

        var width = window.innerWidth;
        var height = window.innerHeight;

        var handleResize = function() {
            width = window.innerWidth;
            height = window.innerHeight;


            if (width > height) {
                DomUtils.addElementClass(document.getElementById('game_window'), 'game_window_landscape');
                DomUtils.removeElementClass(document.getElementById('game_window'), 'game_window_portrait');
                GameScreen.setLandscape(true);
                evt.fire(evt.list().SCREEN_CONFIG, {landscape:true})

            } else {
                DomUtils.addElementClass(document.getElementById('game_window'), 'game_window_portrait');
                DomUtils.removeElementClass(document.getElementById('game_window'), 'game_window_landscape');
                GameScreen.setLandscape(false);
                evt.fire(evt.list().SCREEN_CONFIG, {landscape:false})
            }

            width = document.getElementById('game_window').offsetWidth;
            height = document.getElementById('game_window').offsetHeight;

        };

        window.addEventListener('resize', handleResize);

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

        setTimeout(function() {
            handleResize();
        }, 300);

        setTimeout(function() {
            handleResize();
        }, 100);

        setTimeout(function() {
            handleResize();
        }, 20)

    };

    monkeypatchCustomEngine();

    return GooController;

});