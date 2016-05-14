"use strict";


define([

],function(

	) {


	var Client = function() {

	};

	Client.prototype.initiateClient = function(url) {



		var socket = new WebSocket('ws://'+url);
		console.log(url, socket);


		var content = document.getElementById('message');

		socket.onopen = function () {
			socket.send('hello from the client, url: '+url);
		};

		socket.onmessage = function (message) {
			content.innerHTML = message.data;
		};

		socket.onerror = function (error) {
			console.log('WebSocket error: ' + error);
		};

	};

	Client.prototype.tick = function() {

	};

	return Client;

});