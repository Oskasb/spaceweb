ServerPlayer = function(clientId, client, simTime) {

	this.id = clientId;
	this.client = client;
	this.clientId = clientId;

	var piece;

	function broadcast() {
		client.broadcastToAll(piece.makePacket());
	}
	
	piece = new GAME.Piece(this.id, simTime, Number.MAX_VALUE, broadcast);
	this.piece = piece;
	this.piece.teleportRandom();

	this.piece.networkDirty = true;
	this.piece.setName(clientId);
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




//	console.log("handlers: ", JSON.stringify(actionHandlers))




};

ServerPlayer.prototype.applyPieceConfig = function(configs) {
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