define([], function() {


	var TimeTracker = function(connection) {
		this.connection = connection;
		this.startTime = new Date().getTime();
		this.lastFrameTime = 0;
		this.frameTime = 0;

		this.pingTime = 0;
		this.pingResponseTime = 0;

		this.pingInterval = 100;

	};

	TimeTracker.prototype.processFrameDuration = function(duration) {
		document.querySelector('#framesTime').innerHTML = 'Frame (ms):' +duration;
	};

	TimeTracker.prototype.processPingDuration = function(duration) {
		document.querySelector('#pingTime').innerHTML = 'Ping (ms):' +duration;
	};

	TimeTracker.prototype.trackFrameTime = function(frame) {
		this.frameTime = new Date().getTime();
		this.processFrameDuration(this.frameTime - this.lastFrameTime);
		this.lastFrameTime = this.frameTime;

		if (this.frameTime - this.pingTime > this.pingInterval) {
			this.pingSend()
		}

	};

	TimeTracker.prototype.pingSend = function(frame) {
		this.pingTime = this.frameTime;


		var _this = this;
		var responseCallback = function(message) {
			_this.trackPingRespond();
		};

		this.connection.send('ping', responseCallback);
	};

	TimeTracker.prototype.trackPingRespond = function(frame) {
		this.processPingDuration(this.pingTime - this.pingResponseTime);
		this.pingResponseTime = this.frameTime;
	};



	return TimeTracker;

});
