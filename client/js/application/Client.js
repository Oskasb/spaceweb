"use strict";


define([

],function(

	) {


	var Client = function() {

	};

	Client.prototype.initiateClient = function() {

		var host = location.origin.replace(/^http/, 'ws');


		var pings = 0;

		var socket = new WebSocket(host);
		console.log(host, socket);


		var content = document.getElementById('message');

		socket.onopen = function () {
			socket.send('hello from the client, url: '+host);
		};

		socket.onmessage = function (message) {
			pings++

			document.querySelector('#pings').innerHTML = message.data;

			setTimeout(function() {
				socket.send('ping: '+pings);

			}, 1000)

		};



		socket.onerror = function (error) {
			console.log('WebSocket error: ' + error);
		};

	};

	Client.prototype.tick = function() {

	};

	return Client;

});