"use strict";


define(['Events'

],
	function(
		     evt
		) {

		var socket;
		var messages;

		var Connection = function(socketMessage) {
			this.socketMessages = socketMessage;
			messages = this.socketMessages.messages
		};


		Connection.prototype.setupSocket = function(connectedCallback) {
			var host = location.origin.replace(/^http/, 'ws');
			var pings = 0;

			var _this = this;

			socket = new WebSocket(host);

			console.log(host, socket);
			socket.responseCallbacks = {};

			socket.onopen = function () {
				socket.send('RegisterClient');
				connectedCallback();
			};

			socket.onmessage = function (message) {
				pings++;

				var res = JSON.parse(message.data);

				if (socket.responseCallbacks[res.id]) {
					socket.responseCallbacks[res.id]();
				}

				evt.fire(evt.list().SERVER_MESSAGE, res);

				document.querySelector('#pings').innerHTML = 'Message Data:' +message.data +' '+ pings;

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