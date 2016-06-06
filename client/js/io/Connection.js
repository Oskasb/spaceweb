"use strict";


define(['Events'

],
	function(
		     evt
		) {

		var socket;
		var messages;
		var frameStack = [];


		var Connection = function(socketMessage) {
			this.socketMessages = socketMessage;
			messages = this.socketMessages.messages
		};


		Connection.prototype.setupSocket = function(connectedCallback, errorCallback, disconnectedCallback) {
			var host = location.origin.replace(/^http/, 'ws');
			var pings = 0;

			socket = new WebSocket(host);

			console.log(host, socket);
			socket.responseCallbacks = {};

			socket.onopen = function () {
				connectedCallback();
			};

			socket.onclose = function () {
				disconnectedCallback();
				
			};

			socket.onmessage = function (message) {
				pings++;
				frameStack.push(message.data);
			};

			socket.onerror = function (error) {
				console.log('WebSocket error: ' + error);
				errorCallback(error);
			};


			var sendMessage = function(msg, args) {


				if (!msg) {
					console.log("SEND REQUEST missing", msg, args);
				//	return;
				}

				socket.send(msg.make(args.data));
			};

			return sendMessage;

		};


		var responseStack = [];

		function processResponseStackEntry(stackEntry) {
			evt.fire(evt.list().SERVER_MESSAGE, stackEntry);
		}

		function processStackedMessage(messageData) {
			var resBuffer = JSON.parse(messageData);

			if (!resBuffer.length) {
				 console.log("No Length Type", resBuffer);
				//		evt.fire(evt.list().SERVER_MESSAGE, resBuffer);
				responseStack.push(resBuffer);
			} else {
				for (var i = 0; i < resBuffer.length; i++) {

					if (!resBuffer[i]) {
						console.log("Empty Message",i, resBuffer);
					} else {
						responseStack.push(resBuffer[i]);
					}
				}
			}
		}


		function processTick() {

			for (var i = 0; i < frameStack.length; i++) {
				processStackedMessage(frameStack[i]);
			}


			if (responseStack.length) {
				processResponseStackEntry(responseStack.shift());
			}

			if (responseStack.length > 2) {
				processResponseStackEntry(responseStack.shift());
			}

			if (responseStack.length > 3) {
				processResponseStackEntry(responseStack.shift());
				processResponseStackEntry(responseStack.shift());
			}

			if (responseStack.length > 5) {
				processResponseStackEntry(responseStack.shift());
				processResponseStackEntry(responseStack.shift());
				processResponseStackEntry(responseStack.shift());
			}

			frameStack = [];
		}


		evt.on(evt.list().CLIENT_TICK, processTick);

		return Connection;

	});