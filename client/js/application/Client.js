"use strict";


define([
	'io/Connection',
	'application/TimeTracker',
	'game/ClientWorld',
	'game/GameMain'
],
	function(
		Connection,
		TimeTracker,
		ClientWorld,
		GameMain
		) {




	var Client = function() {

		this.connection = new Connection(this.timeTracker);
		this.timeTracker = new TimeTracker(this.connection);
		this.clientWorld = new ClientWorld();

		var _this = this;

		var socketMessages;

		var socketMsgUrl = './../../../Shared/io/SocketMessages.js';

		var loadJS = function(url, implementationCode, location){
			//url is URL of external file, implementationCode is the code
			//to be called from the file, location is the location to
			//insert the <script> element

			var scriptTag = document.createElement('script');
			scriptTag.src = url;

			scriptTag.onload = implementationCode;
			scriptTag.onreadystatechange = implementationCode;

			location.appendChild(scriptTag);
		};

		var clientWorldReadyCallback = function() {

		};

		var messageCallback = function(target, res) {

			if (!_this[target]) {
				console.log("unhandled message response:", target, res);
			} else {
				_this[target][res.id](res.data);
			}


		};

		var yourCodeToBeCalled = function(){
			socketMessages = new SocketMessages();
			_this.gameMain = new GameMain(_this.connection);
			_this.gameMain.initiateClientWorld(socketMessages, messageCallback);
		};

		loadJS(socketMsgUrl, yourCodeToBeCalled, document.body);

	};


	Client.prototype.initiateClient = function() {
		var _this = this;





		var connectedCallback = function() {
			_this.tick(0);
		};

		this.connection.setupSocket(connectedCallback, this.timeTracker);
	};

	Client.prototype.tick = function(frame) {

		document.querySelector('#frames').innerHTML = 'Frame# '+frame;

		this.timeTracker.trackFrameTime(frame);

		var _this = this;
		requestAnimationFrame(function() {
			frame++;
			_this.tick(frame);
		});
	};

	return Client;

});