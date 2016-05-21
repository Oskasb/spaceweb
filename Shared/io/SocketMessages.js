
	var Message = function(key, config) {
		this.key = key;
		this.config = config;

		for (var key in config) {
			this[key] = config[key];
		}
	};

	Message.prototype.call = function(respond, data, dataHub) {
		if (this.reflect) {
			respond(dataHub.readSource(this.source, this.config, data));
		} else {
			dataHub.readSource(this.source, this.config, data)
		}
	};

	Message.prototype.response = function(res, messageCallback) {
		messageCallback(this.target, res);
	};

	Message.prototype.make = function(data) {
		return JSON.stringify({id:this.key, data:data});
	};


	var Messages = {
		InputVector:{source:'InputVector', method:'playerInput', target:'gameMain', reflect:false},
		InputFire:{source:'InputFire', method:'playerInput', target:'gameMain', reflect:false},
		RegisterPlayer:{source:'ServerGameMain', method:'registerPlayer', target:'gameMain', reflect:true},
		
		
		playerUpdate:{source:'', method:'', target:'gameMain', reflect:true},
		
		clientConnected:{source:'Clients', method:'registerConnection', target:'clientRegistry', reflect:true},
		
		RegisterClient:{source:'Clients', method:'registerClient', target:'clientRegistry', reflect:true},
		RequestPlayer:{source:'Clients', method:'requestPlayer', target:'clientRegistry', reflect:true},

		
		ServerWorld:{source:'ServerWorld', method:'fetch', target:'clientWorld', reflect:true},
		ping:{source:'ping', method:'ping', target:'timeTracker', reflect:true}
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




