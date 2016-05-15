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

				connectedCallback();
			};

			socket.onmessage = function (message) {
				pings++;

				var res = JSON.parse(message.data);

				if (socket.responseCallbacks[res.id]) {
					socket.responseCallbacks[res.id]();
				}

				evt.fire(evt.list().SERVER_MESSAGE, res);

			};

			socket.onerror = function (error) {
				console.log('WebSocket error: ' + error);
			};


			var handleSendRequest = function(e) {
			    var args = evt.args(e);

				var msg = messages[args.id];

				if (!msg) {
					console.log("SEND REQUEST missing", args.id);
				}

				socket.send(msg.make(args.data));


			};

			evt.on(evt.list().SEND_SERVER_REQUEST, handleSendRequest);

		};



		return Connection;

	});