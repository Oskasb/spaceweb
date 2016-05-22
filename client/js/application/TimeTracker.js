define(['Events'], function(evt) {

	var TimeTracker = function() {
		this.startTime = new Date().getTime();
		this.lastFrameTime = 0;
		this.frameTime = 0;

		this.pingTime = 0;
		this.pingResponseTime = 0;

		this.pingInterval = 2000;
		this.tpf = 1;


		var _this = this;

		var handleTick = function(e) {
			_this.trackFrameTime(evt.args(e).frame)
		};

		evt.on(evt.list().CLIENT_TICK, handleTick)
	};

	TimeTracker.prototype.processFrameDuration = function(duration) {
		this.tpf = duration * 0.001;

	};


	var pings = 0;

	TimeTracker.prototype.processPingDuration = function(duration) {
		pings++;
		evt.fire(evt.list().MESSAGE_UI, {channel: 'ping_tracker', message: 'Ping: ' + duration+' ms'});
	};

	TimeTracker.prototype.trackFrameTime = function(frame) {
		this.frameTime = new Date().getTime();
		this.processFrameDuration(this.frameTime - this.lastFrameTime);

		this.lastFrameTime = this.frameTime;


		if (this.frameTime - this.pingTime > this.pingInterval) {
			this.pingSend(frame)
		}

	};

	TimeTracker.prototype.pingSend = function(frame) {
		this.pingTime = this.frameTime;

		evt.fire(evt.list().SEND_SERVER_REQUEST, {id:'ping', data:frame});

	};

	TimeTracker.prototype.ping = function(data) {
		this.pingResponseTime = this.frameTime;
		this.processPingDuration(this.pingResponseTime - this.pingTime);
	};

	return TimeTracker;

});
