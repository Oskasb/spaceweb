define(['Events'], function(evt) {

	var TimeTracker = function(connection) {
		this.connection = connection;
		this.startTime = new Date().getTime();
		this.lastFrameTime = 0;
		this.frameTime = 0;

		this.pingTime = 0;
		this.pingResponseTime = 0;

		this.pingInterval = 400;


		var _this = this;

		var handleTick = function(args) {
			_this.trackFrameTime(args)
		};

		evt.on(evt.list().CLIENT_TICK, handleTick)
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

		this.connection.send('ping');
	};

	TimeTracker.prototype.ping = function(data) {
		this.pingResponseTime = this.frameTime;
		this.processPingDuration(this.pingResponseTime - this.pingTime);
	};

	return TimeTracker;

});
