"use strict";

define([
	'gui/CanvasGuiMain'
],
	function(
		CanvasGuiMain
		) {

		var defaultResolution = 1024;

		var CanvasGuiAPI = function(uiTxResolution) {
			this.canvasGuiMain = new CanvasGuiMain();
			this.uiTxResolution = uiTxResolution || defaultResolution;
		//	this.pointerCursor = this.canvasGuiMain.pointerCursor;

			this.is2d = false;
			this.is3d = false;
		};

		CanvasGuiAPI.prototype.init3dCanvasGui = function(cameraEntity, callbackMap, canvasGuiConfig) {
			this.canvasGuiMain.initGuiMain(cameraEntity, callbackMap, this.uiTxResolution, canvasGuiConfig);
			this.is3d = true;
		};

		CanvasGuiAPI.prototype.initDomCanvasGui = function(parentDiv, callbackMap) {
			this.canvasGuiMain.initGui2d(parentDiv, callbackMap, this.uiTxResolution);
			this.is2d = true;
		};
		
		CanvasGuiAPI.prototype.setUiToStateId = function(state) {
			this.canvasGuiMain.setMainUiState(state);
		};

		CanvasGuiAPI.prototype.adjustCanvasBlendMode = function(modeValue, callback) {
			this.canvasGuiMain.adjustCanvasBlendMode(modeValue, callback);
		};

		CanvasGuiAPI.prototype.attachUiSubstateId = function(state) {
			this.canvasGuiMain.addUiSubstateId(state);
		};

		CanvasGuiAPI.prototype.updateCanvasGui = function(tpf) {
			this.canvasGuiMain.tickGuiMain(tpf)
		};

		CanvasGuiAPI.prototype.getPointerCursor = function() {
			return this.pointerCursor;
		};

		CanvasGuiAPI.prototype.getCanvasContext = function() {
			return this.canvasGuiMain.canvasCalls.ctx;
		};
		
		CanvasGuiAPI.prototype.addGuiStateTransitionCallback = function(transitionId, callback) {
			this.canvasGuiMain.addGuiStateTransitionCallback(transitionId, callback)
		};

		CanvasGuiAPI.prototype.setGuiTextureScale = function(txScale) {
			this.canvasGuiMain.setGuiTextureScale(txScale)
		};

		CanvasGuiAPI.prototype.setGuiTextureResolution = function(res) {
			this.canvasGuiMain.setGuiTextureResolution(res)
		};

		CanvasGuiAPI.prototype.setGuiAttenuationRgba = function(rgba) {
			this.canvasGuiMain.setGuiAttenuationRgba(rgba)
		};
		
		CanvasGuiAPI.prototype.getPointerState = function() {
			return this.getPointerCursor().getPointerState();
		};

		CanvasGuiAPI.prototype.toggleGuiEnabled = function(bool) {
			this.canvasGuiMain.toggleEnabled(bool, this.is3d);
		};

		CanvasGuiAPI.prototype.removeCanvasGui = function() {
			this.canvasGuiMain.removeGuiMain()
		};
		
		return CanvasGuiAPI;

	});