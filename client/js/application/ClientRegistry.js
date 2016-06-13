"use strict";


define([
	'PipelineAPI'
],
	function(
		PipelineAPI
		) {

		var ClientRegistry = function() {
			this.playerName = "Default Name"
            this.data = {}
		};

		ClientRegistry.prototype.RegisterClient = function(data) {
			data.clientId = PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID');
		};

		ClientRegistry.prototype.setName = function(name) {
			this.playerName = name;
		};

		ClientRegistry.prototype.getName = function(name) {
			return this.playerName;
		};
		
		ClientRegistry.prototype.clientConnected = function(data) {
            console.log("Connected Data: ", data)
            this.data.CLIENT_ID = data.clientId;
			PipelineAPI.setCategoryData('REGISTRY', this.data)
		};

		return ClientRegistry;

	});