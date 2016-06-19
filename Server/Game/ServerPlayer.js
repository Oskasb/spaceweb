ServerPlayer = function(clientId, client, simTime) {

	if (!client) {
		console.log("Bad Client!", clientId);
		return;
	}

	this.id = clientId;
	this.client = client;
	this.clientId = clientId;

	var piece;

	var broadcast = function(piecePacket) {
		if (!client) {
			console.log("Bad Client!", piece.id, piecePacket);
			return;
		}
		client.broadcastToAll(piecePacket);
	};
	
	piece = new GAME.Piece('player_ship', this.id, simTime, Number.MAX_VALUE, broadcast);
	this.piece = piece;
	this.piece.teleportRandom();

	this.piece.networkDirty = true;
	this.piece.setName(clientId);
	client.attachPlayer(this);
};


ServerPlayer.prototype.processPlayerInputUpdate = function(data, actionHandlers) {
	var _this = this;
	var fireActionCallback = function(action, value, moduleData) {
		if (typeof(actionHandlers[action]) == 'function') actionHandlers[action](_this.piece, action, value, moduleData);
		//	if (typeof(actionHandlers[action]) != 'function') console.log("No Handler:", action, value)
	};

	if (data.fire) {
		this.setInputTrigger(true, fireActionCallback);
		this.setInputTrigger(false);
		return;
	}


	if (data.vector) {
		this.setInputVector(data.vector.state);
		this.piece.networkDirty = true;
	}

    for (var key in data) {
        if (key == 'shield') {
            console.log("Apply shields", data.shield)
            this.piece.setModuleState(key, data[key]);
            this.piece.networkDirty = true;
        }
    }


//	console.log("handlers: ", JSON.stringify(actionHandlers))


};

ServerPlayer.prototype.applyPieceConfig = function(configs) {
    if(!this.piece) {
        console.log('Bad Server Player');
        return
    }
	this.piece.applyConfig(configs);
};

ServerPlayer.prototype.makePacket = function() {
	return this.piece.makePacket();
};

ServerPlayer.prototype.setInputTrigger = function(bool, actionCallback) {
	this.piece.setInputTrigger(bool, actionCallback)
};

ServerPlayer.prototype.setInputVector = function(state) {
	this.piece.setInputVector(state)
};

ServerPlayer.prototype.updatePlayer = function(currentTime) {
	this.piece.processServerState(currentTime);

};