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
			this.connection = new Connection(socketMessages);
			this.timeTracker = new TimeTracker(this.connection);
			this.clientWorld = new ClientWorld();


			this.gameMain = new GameMain(this.connection);

			var connectedCallback = function() {

				evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ServerWorld', data:'init'});

				_this.tick(0);
			};

			evt.on(evt.list().SERVER_MESSAGE, handleServerMessage);

			this.connection.setupSocket(connectedCallback, this.timeTracker);


			var ClientState = GAME.ENUMS.ClientStates.LOADING;
			var ClientReg;

			var requestPlayer = function() {

				if (ClientState == GAME.ENUMS.ClientStates.READY) {
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterClient', data:{clientId:ClientReg.clientId}});
					ClientState = GAME.ENUMS.ClientStates.PLAYER_REQUESTED;
					DEBUG_MONITOR(ClientState)
				}

			};



			var clientReady = function() {
				ClientState = GAME.ENUMS.ClientStates.READY;

				DEBUG_MONITOR(ClientState)
			};

			DEBUG_MONITOR(ClientState)

			evt.on(evt.list().CLIENT_READY, clientReady);
			evt.on(evt.list().CURSOR_LINE, requestPlayer);
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