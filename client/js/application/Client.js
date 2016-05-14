"use strict";


define([
	"io/Connection",
	"application/TimeTracker"
],
	function(
		Connection,
		TimeTracker
		) {

	var Client = function() {

		this.connection = new Connection(this.timeTracker);
		this.timeTracker = new TimeTracker(this.connection);
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

		this.connection.send(frame);

		this.timeTracker.trackFrameTime(frame);

		var _this = this;
		requestAnimationFrame(function() {
			frame++;
			_this.tick(frame);
		});
	};

	return Client;

});