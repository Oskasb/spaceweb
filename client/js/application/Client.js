"use strict";


define([
		'Events',
		'application/ClientRegistry',
		'io/Connection',
		'application/TimeTracker',
		'main/ClientWorld',
		'main/GameMain',
        'ui/GuiSetup',
		'ui/UiMessenger'
	],
	function(
		evt,
		ClientRegistry,
		Connection,
		TimeTracker,
		ClientWorld,
		GameMain,
        GuiSetup,
		UiMessenger
	) {


		var frame = 0;

		var Client = function(pointerCursor) {
			this.pointerCursor = pointerCursor;
			this.timeTracker = new TimeTracker();
			this.gameMain = new GameMain();
			var guiSetup = new GuiSetup();
			// var inputReady = function() {
			guiSetup.initMainGui();
			//     evt.removeListener(evt.list().INPUT_READY, inputReady);
			// };

			//  evt.on(evt.list().INPUT_READY, inputReady)

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
					_this[message.target][res.id](res.data);
				} else {
                    if (res.id == 'server_status') {
                    } else {
                        evt.fire(evt.list().MESSAGE_UI, {channel:'receive_error', message:'Unhandled message '+res.id});
                        console.log("unhandled message response:", res);
                    }
				}
			};
			
			var clientRegistry = new ClientRegistry();
			this.clientRegistry = clientRegistry;
			var connection = new Connection(socketMessages);
			this.clientWorld = new ClientWorld();
			
			var connectedCallback = function() {
                evt.fire(evt.list().MESSAGE_UI, {channel:'connection_status', message:'Connection Open'});
				evt.fire(evt.list().CLIENT_READY, {});
			};

			var errorCallback = function(error) {
				console.log("Socket Error", error);
			};

			var disconnectedCallback = function() {
				console.log("Socket Disconnected");
				ClientState = GAME.ENUMS.ClientStates.DISCONNECTED;
                evt.fire(evt.list().MESSAGE_UI, {channel:'connection_error', message:'Connection Lost'});
				evt.fire(evt.list().CONNECTION_CLOSED, {data:'closed'});
				evt.removeListener(evt.list().SEND_SERVER_REQUEST, handleSendRequest);
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
					evt.fire(evt.list().MESSAGE_POPUP, {configId:"select_name", callback:requestPlayer});
				}
			};
			
			var setClientState = function(state) {
				ClientState = state;
                evt.fire(evt.list().MESSAGE_UI, {channel:'client_state', message:'MAIN: '+state});
			};

			var clientReady = function() {
				setClientState(GAME.ENUMS.ClientStates.READY);
				requestClient();
				evt.removeListener(evt.list().CLIENT_READY, clientReady)
			};
			
			evt.on(evt.list().CLIENT_READY, clientReady);
		};

		Client.prototype.tick = function(tpf) {
			frame++;
			evt.fire(evt.list().CLIENT_TICK, {frame:frame, tpf:tpf});
			this.gameMain.tickClientGame(tpf);
		};
        
		return Client;

	});