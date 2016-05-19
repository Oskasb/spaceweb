"use strict";


define([
	'Events',
	'application/ClientRegistry',
	'io/Connection',
	'application/TimeTracker',
	'main/ClientWorld',
	'main/GameMain'
],
	function(
		evt,
		ClientRegistry,
		Connection,
		TimeTracker,
		ClientWorld,
		GameMain
		) {




		var Client = function(pointerCursor) {
			this.pointerCursor = pointerCursor;
		};


		Client.prototype.initiateClient = function(socketMessages) {
			var _this = this;
			var messages = socketMessages.messages;
			var ClientState = GAME.ENUMS.ClientStates.LOADING;

			var handleServerMessage = function(e) {
				var res = evt.args(e);
				if (messages[res.id]) {
					//	console.log("Message Recieved: ", messages[res.id], res)
					_this[messages[res.id].target][res.id](res.data);
				} else {
					console.log("unhandled message response:", res);
				}
			};

			this.clientRegistry = new ClientRegistry();
			var ClientReg = this.clientRegistry;
			var connection = new Connection(socketMessages);
			this.timeTracker = new TimeTracker();
			this.clientWorld = new ClientWorld();


			this.gameMain = new GameMain();

			var connectedCallback = function() {
				console.log("Reconnected?")
				clientReady();
				evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ServerWorld', data:'init'});
				_this.tick(0);
			};

			var errorCallback = function(error) {
				console.log("Socket Error", error);
			};

			var disconnectedCallback = function() {
				console.log("Socket Disconnected");
				ClientState = GAME.ENUMS.ClientStates.DISCONNECTED;
				evt.fire(evt.list().CONNECTION_CLOSED, {data:'closed'});

				setTimeout(function() {
					connect();
				}, 1000)

			};

			var connect = function() {
				connection.setupSocket(connectedCallback, errorCallback, disconnectedCallback);
			};

			connect();

			evt.on(evt.list().SERVER_MESSAGE, handleServerMessage);

			var ClientReg;

			var count = 0;
			var requestPlayer = function() {
				console.log("reqCOunt: ", count);

				if (ClientState == GAME.ENUMS.ClientStates.READY) {
					count++
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterClient', data:{clientId:ClientReg.clientId}});
					setClientState(GAME.ENUMS.ClientStates.PLAYER_REQUESTED);
					evt.removeListener(evt.list().CURSOR_PRESS, requestPlayer);
				}
			};

			var setClientState = function(state) {
				ClientState = state;
				DEBUG_MONITOR("CLIENT STATE: "+state)
			};

			var clientReady = function() {
				evt.on(evt.list().CURSOR_PRESS, requestPlayer);
				setClientState(GAME.ENUMS.ClientStates.READY);
			};

			DEBUG_MONITOR(ClientState);

			evt.on(evt.list().CLIENT_READY, clientReady);

		};

		Client.prototype.tick = function(frame) {
			evt.fire(evt.list().CLIENT_TICK, {frame:frame});

			this.pointerCursor.tick();
			this.gameMain.tick(this.timeTracker.tpf);


			document.querySelector('#frames').innerHTML = 'Frame# '+frame;

			//	this.timeTracker.trackFrameTime(frame);

			var _this = this;
			requestAnimationFrame(function() {
				frame++;
				_this.tick(frame);
			});
		};






		return Client;

	});