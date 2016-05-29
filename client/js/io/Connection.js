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


		Connection.prototype.setupSocket = function(connectedCallback, errorCallback, disconnectedCallback) {
			var host = location.origin.replace(/^http/, 'ws');
			var pings = 0;

			var _this = this;

			socket = new WebSocket(host);

			console.log(host, socket);
			socket.responseCallbacks = {};

			socket.onopen = function () {
				connectedCallback();
			};

			socket.onclose = function () {
				disconnectedCallback();
				evt.removeListener(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
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
				errorCallback(error);
			};


			var sendMessage = function(msg, args) {
                
                
				evt.fire(evt.list().MESSAGE_UI, {channel:'connection_send', message:'_'});

				if (!msg) {
					console.log("SEND REQUEST missing", msg, args);
				//	return;
				}

				socket.send(msg.make(args.data));
			};

			return sendMessage;

		};



		return Connection;

	});