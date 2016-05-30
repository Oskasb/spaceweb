

	SocketMessages = function() {

        var Messages = {
            InputVector:{source:'InputVector', method:'playerInput', target:'gameMain', reflect:false},
            InputFire:{source:'InputFire', method:'playerInput', target:'gameMain', reflect:false},
            RegisterPlayer:{source:'ServerGameMain', method:'registerPlayer', target:'gameMain', reflect:true},


            playerUpdate:{source:'', method:'', target:'gameMain', reflect:false},

            clientConnected:{source:'Clients', method:'registerConnection', target:'clientRegistry', reflect:true},

            RegisterClient:{source:'Clients', method:'registerClient', target:'clientRegistry', reflect:true},
            RequestPlayer:{source:'Clients', method:'requestPlayer', target:'clientRegistry', reflect:true},


            ServerWorld:{source:'ServerWorld', method:'fetch', target:'clientWorld', reflect:true},
            ping:{source:'ping', method:'ping', target:'timeTracker', reflect:true}
        };


		this.messages = {};
		for (var key in Messages) {
			this.messages[key] = new Message(key, Messages[key])
		}

	};


	SocketMessages.prototype.getMessageById = function(id) {
		return this.messages[id];
	};


