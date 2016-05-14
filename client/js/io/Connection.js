"use strict";


define([

],
	function(

		) {

		var socket;

		var Connection = function() {



		};

		Connection.prototype.setupSocket = function(connectedCallback) {
			var host = location.origin.replace(/^http/, 'ws');

			var pings = 0;

			socket = new WebSocket(host);

			console.log(host, socket);
			socket.responseCallbacks = {};

			socket.onopen = function () {
				socket.send('client connection ping, url: '+host);
				connectedCallback();
			};

			socket.onmessage = function (message) {
				pings++;

				if (socket.responseCallbacks[message.data]) {
					socket.responseCallbacks[message.data]();
				}

				document.querySelector('#pings').innerHTML = message.data +' '+ pings;

			};

			socket.onerror = function (error) {
				console.log('WebSocket error: ' + error);
			};

		};



		Connection.prototype.send = function(message, responseCallback) {

			if (responseCallback) {
				socket.responseCallbacks[message] = responseCallback;
			}

			socket.send(message);
		};

		return Connection;

	});