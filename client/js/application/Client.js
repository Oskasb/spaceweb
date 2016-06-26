"use strict";


define([
		'Events',
		'application/ClientRegistry',
		'io/Connection',
		'application/TimeTracker',
		'main/ClientWorld',
		'main/GameMain',
        'ui/GuiSetup',
		'ui/UiMessenger',
		'PipelineAPI'
	],
	function(
		evt,
		ClientRegistry,
		Connection,
		TimeTracker,
		ClientWorld,
		GameMain,
        GuiSetup,
		UiMessenger,
		PipelineAPI
	) {


		var frame = 0;

		var Client = function(pointerCursor) {
			this.pointerCursor = pointerCursor;
			this.timeTracker = new TimeTracker();
			this.gameMain = new GameMain();
			this.guiSetup = new GuiSetup();
            new UiMessenger();
            this.connection = new Connection();

            this.handlers = {};

			// var inputReady = function() {

			//     evt.removeListener(evt.list().INPUT_READY, inputReady);
			// };

			//  evt.on(evt.list().INPUT_READY, inputReady)

            this.handlers.clientRegistry = new ClientRegistry();
            this.handlers.gameMain = this.gameMain;
            this.handlers.timeTracker = this.timeTracker;
            this.handlers.clientWorld = new ClientWorld();

		};

        Client.prototype.handleServerMessage = function(res) {
            var message = this.socketMessages.getMessageById(res.id);
            if (message) {
                this.handlers[message.target][res.id](res.data);
            } else {
                if (res.id == 'server_status') {
                } else {
                    evt.fire(evt.list().MESSAGE_UI, {channel:'receive_error', message:'Unhandled message '+res.id});
                    console.log("unhandled message response:", res);
                }
            }
        };


		Client.prototype.initiateClient = function(socketMessages,connectionReady) {


            this.guiSetup.initMainGui();
            var connection = this.connection;

			var _this = this;
            this.socketMessages = socketMessages;

			var ClientState = GAME.ENUMS.ClientStates.LOADING;

			var handleServerMessage = function(e) {
				var res = evt.args(e);
                _this.handleServerMessage(res);
			};
			


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

			var requestPlayer = function(e) {
				console.log("Request Player", e);
                
                if (!name) name = 'NoName';
                
                evt.fire(evt.list().MESSAGE_UI, {channel:'own_player_name', message:name});
				PipelineAPI.setCategoryData('REGISTRY', {PLAYER_NAME:name});

				if (ClientState == GAME.ENUMS.ClientStates.CLIENT_REQUESTED) {
					var clientId = PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID')
					console.log(clientId)
					evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterPlayer', data:{clientId:clientId, name:name}});
					setClientState(GAME.ENUMS.ClientStates.PLAYER_REQUESTED);

					evt.removeListener(evt.list().CURSOR_PRESS, requestPlayer);
				}
			};

            var requestClient = function() {
                console.log("Request Client");

                if (ClientState == GAME.ENUMS.ClientStates.READY) {
                    count++;

                    var clientId = PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID');
                    if (clientId == 'CLIENT_ID') {
                        evt.fire(evt.list().MESSAGE_UI, {channel:'system_status', message:'Request ID'});
                        clientReady();
                        return;
                    }

                    evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'RegisterClient', data:{clientId:clientId}});

                    evt.fire(evt.list().MESSAGE_UI, {channel:'system_status', message:'ID: '+PipelineAPI.readCachedConfigKey('REGISTRY', 'CLIENT_ID')});
                    setClientState(GAME.ENUMS.ClientStates.CLIENT_REQUESTED);

                    connectionReady();
                    evt.on(evt.list().CURSOR_PRESS, requestPlayer);
                //    evt.fire(evt.list().MESSAGE_POPUP, {configId:"select_name", callback:requestPlayer});
                }
            };
			
			var setClientState = function(state) {
				ClientState = state;
                evt.fire(evt.list().MESSAGE_UI, {channel:'client_state', message:' - '+state});
			};

			var clientReady = function() {
				setClientState(GAME.ENUMS.ClientStates.READY);
				setTimeout(function() {
					requestClient();
				}, 100);


				evt.removeListener(evt.list().CLIENT_READY, clientReady)
			};
			
			evt.on(evt.list().CLIENT_READY, clientReady);
		};

        var aggDiff = 0;

        var tickEvent = {frame:0, tpf:1};


        Client.prototype.setupSimulation = function(sceneController) {
            var _this = this;

            var clientTick = function(tpf) {
                _this.tick(tpf)
            };

            sceneController.setup3dScene(clientTick);
        };

        Client.prototype.processResponseStack = function(responseStack) {

            if (responseStack.length > 2) {
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
            }

            if (responseStack.length) {
                this.handleServerMessage(responseStack.shift());
            }

            if (responseStack.length) {
                this.handleServerMessage(responseStack.shift());
            }


            if (responseStack.length > 5) {
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
                this.handleServerMessage(responseStack.shift());
            }

        };

        
        Client.prototype.tick = function(tpf) {
			frame++;

            var responseStack = this.connection.processTick();

            this.processResponseStack(responseStack);

			var exactTpf = this.timeTracker.trackFrameTime(frame);

            if (exactTpf < 0.01) {
                console.log("superTiny TPF");
                return;
            }

		//	console.log(tpf - exactTpf, tpf, this.timeTracker.tpf);

            aggDiff += tpf-exactTpf;

            if (Math.abs(tpf-exactTpf) < 0.01) {
                tpf = exactTpf;

            } else {
        //        console.log("Big DT", tpf, exactTpf, aggDiff);
            }
            tickEvent.frame = frame;
            tickEvent.tpf = tpf;

            evt.fire(evt.list().CLIENT_TICK, tickEvent);

            this.gameMain.tickClientGame(tpf);
        //    evt.fire(evt.list().CAMERA_TICK, {frame:frame, tpf:tpf});
		};

		return Client;

	});