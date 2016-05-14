SocketMessages = function() {

	this.messages = {

		registerClient:{
			call:function(data) {

			}
		},

		fetchWorld:{
			call:function(data) {

			}
		}

	};

};


SocketMessages.prototype.setMessage = function(id, data) {

	this.message[id] = data;

};


SocketMessages.prototype.handleMessage = function(id, data) {

	this.message[id] = call(data);

};




