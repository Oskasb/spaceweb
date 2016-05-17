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
			console.log("Client Registered", data);
			document.querySelector('#user').innerHTML = 'User Data: '+JSON.stringify(data);

			data.clientId = this.clientId;

			evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterPlayer', data:data});
		};


		ClientRegistry.prototype.clientConnected = function(data) {
			console.log("Client Connected", data);

			this.clientId = data.clientId;



		};


		return ClientRegistry;

	});