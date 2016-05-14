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

			socket.onopen = function () {
				socket.send('client connection ping, url: '+host);
				connectedCallback();
			};

			socket.onmessage = function (message) {
				pings++;

				document.querySelector('#pings').innerHTML = message.data;

			};

			socket.onerror = function (error) {
				console.log('WebSocket error: ' + error);
			};

		};



		Connection.prototype.send = function(message) {
			socket.send(message);
		};

		return Connection;

	});