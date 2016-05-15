"use strict";


define([

],
	function(

		) {

		var socket;

		var Connection = function() {
			this.socketMessages;
		};

		Connection.prototype.setSocketMessages = function(socketMessage, messageCallback) {
			this.messageCallback = messageCallback;
			this.socketMessages = socketMessage;
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

				if (_this.socketMessages) {

					_this.socketMessages.messages[res.id].response(res, _this.messageCallback);

				} else {
					console.log("Socket Messages not yet ready to handle", message)
				}

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