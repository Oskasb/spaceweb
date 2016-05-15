
	var Message = function(key, config) {
		this.key = key;
		this.config = config;

		for (var key in config) {
			this[key] = config[key];
		}
	};

	Message.prototype.call = function(respond, data, dataHub) {
		respond(dataHub.readSource(this.source, this.config, data));
	};


	Message.prototype.response = function(res, messageCallback) {
		messageCallback(this.target, res);

	};

	Message.prototype.make = function(data) {
		return JSON.stringify({id:this.key, data:data});
	};


	var Messages = {
		RegisterPlayer:{source:'ServerGameMain', method:'registerPlayer', target:'gameMain', args:{}},
		playerUpdate:{source:'', method:'', target:'gameMain', args:{}},
		clientConnected:{source:'Clients', method:'registerConnection', target:'clientRegistry', args:{}},
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




