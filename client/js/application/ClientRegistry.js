"use strict";


define(['Events'

],
	function(
		evt
		) {

		var ClientRegistry = function() {
			this.clientId;
			this.playerName = "Default Name"
		};

		ClientRegistry.prototype.RegisterClient = function(data) {
			data.clientId = this.clientId;
		};


		ClientRegistry.prototype.setName = function(name) {
			this.playerName = name;
		};

		ClientRegistry.prototype.getName = function(name) {
			return this.playerName;
		};
		
		ClientRegistry.prototype.clientConnected = function(data) {
			console.log("Client Connected", data);
			this.clientId = data.clientId;
		};

		return ClientRegistry;

	});