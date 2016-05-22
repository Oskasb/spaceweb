"use strict";


define(['Events'

],
	function(
		evt
		) {

		var ClientRegistry = function() {
			this.clientId;
		};

		ClientRegistry.prototype.RegisterClient = function(data) {
			data.clientId = this.clientId;
		};


		ClientRegistry.prototype.clientConnected = function(data) {
			console.log("Client Connected", data);
			this.clientId = data.clientId;
		};

		return ClientRegistry;

	});