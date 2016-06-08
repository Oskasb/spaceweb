"use strict"


define([
	'application/Settings',
	'Events',
	'goo/entities/GooRunner',
	'goo/renderer/Renderer',
	'goo/math/Vector3',
	'goo/renderer/Texture',
	'goo/math/Vector',
	'3d/GooCameraController',
	'ui/GooMonitor'



], function(
	Settings,
	event,
	GooRunner,
	Renderer,
	Vector3,
	Texture,
	Vector,
	GooCameraController,
	GooMonitor
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
			chrome = /chrome/.test( userAgent );

		var isAndroid = !!navigator.userAgent.match(/Android/i);

		var downscale = 1;
		var antialias = true;
		if (isAndroid){
			downscale = 0.5;
		//	antialias = false;
		}

		var times = 0;

		var notifyAgent =  setInterval(function() {
			times ++;
			if (standalone) {
				event.fire(event.list().MESSAGE_UI, {channel:'pipeline_error', message:'STANDALONE'});
			}
			if (chrome) {
				event.fire(event.list().MESSAGE_UI, {channel:'pipeline_message', message:'CHROME'});
			}

			if (isAndroid) {
				event.fire(event.list().MESSAGE_UI, {channel:'pipeline_error', message:'ANDROID'});
			}

		if (ios) {
			SYSTEM_SETUP.ios = true;
			downscale = 4;
			antialias = false;

				event.fire(event.list().MESSAGE_UI, {channel:'pipeline_error', message:'DEVICE: IOS'});

			} else {

			}

			if (times == 15) clearInterval(notifyAgent);
		}, 1000);



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
		goo.renderer.setClearColor(0.04, 0.0, 0.08, 0.21);


		goo.startGameLoop();

		var setupGooScene = function() {
			console.log("Setup Goo Scene");

			document.getElementById('game_window').appendChild(goo.renderer.domElement);


			setTimeout(function() {
				event.fire(event.list().ENGINE_READY, {goo:goo});
				goo.startGameLoop();

			},30)
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


		var width = window.innerWidth;
		var height = window.innerHeight;

		var handleResize = function() {
			width = window.innerWidth;
			height = window.innerHeight;
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

	};

	monkeypatchCustomEngine();

	return GooController;

});