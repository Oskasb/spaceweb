"use strict";


define(['Events'

],
	function(
		evt
		) {

		var ClientRegistry = function() {

		};


		ClientRegistry.prototype.RegisterClient = function(data) {
			         console.log("Client Registered", data)
		};



		return ClientRegistry;

	});