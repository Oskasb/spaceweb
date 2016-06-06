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

		var isAndroid = !!navigator.userAgent.match(/Android/i);

		var downscale = 1;
		var antialias = true;
		if (isAndroid){
			downscale = 0.5;
		//	antialias = false;
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
		goo.renderer.setClearColor(0.03, 0.0, 0.05, 0.01);




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