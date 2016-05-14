"use strict";


define([
	"io/Connection"
],
	function(
		Connection
		) {

	var socket;

	var Client = function() {
		this.connection = new Connection();
	};


	Client.prototype.initiateClient = function() {
		var _this = this;

		var connectedCallback = function() {
			_this.tick(0);
		};

		this.connection.setupSocket(connectedCallback);
	};

	Client.prototype.tick = function(frame) {

		document.querySelector('#frames').innerHTML = frame;

		this.connection.send(frame);

		var _this = this;
		requestAnimationFrame(function() {
			frame++;
			_this.tick(frame);
		});
	};

	return Client;

});