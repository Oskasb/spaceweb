"use strict";

define([
	'data_pipeline/pipes/JsonPipe',
	'data_pipeline/pipes/SvgPipe',
	'data_pipeline/pipes/ImagePipe'
],
	function(
		JsonPipe,
		SvgPipe,
		ImagePipe
		) {

		var GameDataPipeline = function() {

		};

		GameDataPipeline.loadConfigFromUrl = function(url, dataUpdated, fail) {
			JsonPipe.loadJsonFromUrl(url, dataUpdated, fail)
		};


		GameDataPipeline.loadSvgFromUrl = function(url, dataUpdated, fail) {
			SvgPipe.loadSvg(url, dataUpdated, fail)
		};

		GameDataPipeline.loadImageFromUrl = function(url, dataUpdated, fail) {
			ImagePipe.loadImage(url, dataUpdated, fail)
		};


		GameDataPipeline.tickDataLoader = function(tpf) {
			JsonPipe.tickJsonPipe(tpf);
			SvgPipe.tickSvgPipe(tpf);
			ImagePipe.tickImagePipe(tpf);
		};

		GameDataPipeline.applyPipelineOptions = function(opts) {
			JsonPipe.setJsonPipeOpts(opts.jsonPipe);
			SvgPipe.setSvgPipeOpts(opts.svgPipe);
			ImagePipe.setImagePipeOpts(opts.imagePipe);
		};

		setInterval(function() {
			GameDataPipeline.tickDataLoader(0.03)
		}, 30)

		return GameDataPipeline
	});