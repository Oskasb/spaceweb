
	var Message = function(key, config) {
		this.key = key;
		this.config = config;

		for (var key in config) {
			this[key] = config[key];
		}
	};

	Message.prototype.call = function(respond, dataHub) {
		respond(dataHub.readSource(this.source, this.config));
	};


	Message.prototype.response = function(res, messageCallback) {
		messageCallback(this.target, res);

	};

	Message.prototype.make = function() {
		return this.key;
	};


	var Messages = {
		RegisterClient:{source:'Clients', method:'registerClient', target:'clientRegistry', args:{}},
		ServerWorld:{source:'ServerWorld', method:'fetch', target:'clientWorld', args:{}},
		ping:{source:'ping', method:'ping', target:'timeTracker', args:{}}
	};


	SocketMessages = function() {

		this.messages = {};

		for (var key in Messages) {
			this.messages[key] = new Message(key, Messages[key])
		}

	};


	SocketMessages.prototype.setMessage = function(id, data) {

		this.message[id] = data;

	};


	SocketMessages.prototype.handleMessage = function(id, data) {

		console.log('handleMessage', id);

		this.message[id] = call(data);

	};




