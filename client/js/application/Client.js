"use strict";


define([
	'Events',
	'application/ClientRegistry',
	'io/Connection',
	'application/TimeTracker',
	'main/ClientWorld',
	'main/GameMain',
        'ui/UiMessenger'
],
	function(
		evt,
		ClientRegistry,
		Connection,
		TimeTracker,
		ClientWorld,
		GameMain,
        UiMessenger
		) {




		var Client = function(pointerCursor) {
			this.pointerCursor = pointerCursor;
		};


		Client.prototype.initiateClient = function(socketMessages) {
            new UiMessenger();
			var _this = this;
			var messages = socketMessages.messages;
			var ClientState = GAME.ENUMS.ClientStates.LOADING;

			var handleServerMessage = function(e) {

				var res = evt.args(e);
				var message = socketMessages.getMessageById(res.id)
				if (message) {
					//	console.log("Message Recieved: ", messages[res.id], res)
					_this[message.target][res.id](res.data);
                    evt.fire(evt.list().MESSAGE_UI, {channel:'connection_receive', message:'_'});
				} else {
					console.log("unhandled message response:", res);
                    evt.fire(evt.list().MESSAGE_UI, {channel:'receive_error', message:'Unhandled message '+res.id});
				}



			};

			var clientRegistry = new ClientRegistry();
			this.clientRegistry = clientRegistry;
			var connection = new Connection(socketMessages);
			this.timeTracker = new TimeTracker();
			this.clientWorld = new ClientWorld();


			this.gameMain = new GameMain();

			var connectedCallback = function() {
                evt.fire(evt.list().MESSAGE_UI, {channel:'connection_status', message:'Connection Open'});
				evt.fire(evt.list().CLIENT_READY, {});
				evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ServerWorld', data:'init'});
				_this.tick(0);
			};

			var errorCallback = function(error) {
				console.log("Socket Error", error);
			};

			var disconnectedCallback = function() {
				console.log("Socket Disconnected");
				ClientState = GAME.ENUMS.ClientStates.DISCONNECTED;
                evt.fire(evt.list().MESSAGE_UI, {channel:'connection_error', message:'Connection Lost'});
				evt.fire(evt.list().CONNECTION_CLOSED, {data:'closed'});

				setTimeout(function() {
					connect();
				}, 100)

			};

			var sendMessage = function() {};
			
			
			var connect = function() {
				sendMessage = connection.setupSocket(connectedCallback, errorCallback, disconnectedCallback);
			};

			connect();

			var handleSendRequest = function(e) {
				var msg = socketMessages.getMessageById(evt.args(e).id);
				var args = evt.args(e);
				sendMessage(msg, args);
			};

			evt.on(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
			
			
			evt.on(evt.list().SERVER_MESSAGE, handleServerMessage);


			var count = 0;

			var requestPlayer = function(name) {
				console.log("Request Player", name);
				clientRegistry.setName(name);
				
				if (ClientState == GAME.ENUMS.ClientStates.CLIENT_REQUESTED) {
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterPlayer', data:{clientId:clientRegistry.clientId, name:clientRegistry.getName()}});
					setClientState(GAME.ENUMS.ClientStates.PLAYER_REQUESTED);
					evt.removeListener(evt.list().CURSOR_PRESS, requestPlayer);
				}
			};

			var requestClient = function() {
				console.log("Request Client");
				
				if (ClientState == GAME.ENUMS.ClientStates.READY) {
					count++;
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterClient', data:{clientId:clientRegistry.clientId}});
					setClientState(GAME.ENUMS.ClientStates.CLIENT_REQUESTED);
                    setTimeout(function() {
						
						evt.fire(evt.list().MESSAGE_POPUP, {configId:"select_name", callback:requestPlayer});
						
                      //  evt.on(evt.list().CURSOR_PRESS, requestPlayer);
                    }, 10);

				}
			};


			var setClientState = function(state) {
				ClientState = state;
                evt.fire(evt.list().MESSAGE_UI, {channel:'client_state', message:'MAIN: '+state});
			};

			var clientReady = function() {
				setClientState(GAME.ENUMS.ClientStates.READY);
				requestClient();
			};
            
			evt.on(evt.list().CLIENT_READY, clientReady);

		};

		Client.prototype.tick = function(frame) {
			evt.fire(evt.list().CLIENT_TICK, {frame:frame, tpf:this.timeTracker.tpf});

			this.pointerCursor.tick();
			this.gameMain.tickClientGame(this.timeTracker.tpf);
            
			var _this = this;
			requestAnimationFrame(function() {
				frame++;
				_this.tick(frame);
			});
		};
        
		return Client;

	});