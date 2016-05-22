ServerPlayer = function(clientId, client, simTime) {

	this.id = clientId;
	this.client = client;
	this.clientId = clientId;

	
	this.piece = new GAME.Piece(this.id, simTime);
	this.piece.teleportRandom();



};


ServerPlayer.prototype.processPlayerInputUpdate = function(data, actionHandlers) {
	if (data.vector) {
		this.setInputVector(data.vector.fromX, data.vector.fromY, data.vector.toX,data.vector.toY);
	}

	var _this = this;

//	console.log("handlers: ", JSON.stringify(actionHandlers))

	var fireActionCallback = function(action, value, moduleData) {
		if (typeof(actionHandlers[action]) == 'function') actionHandlers[action](_this.piece, action, value, moduleData);
	//	if (typeof(actionHandlers[action]) != 'function') console.log("No Handler:", action, value)
	};

	if (data.fire) {
		this.setInputTrigger(true, fireActionCallback);
		this.client.broadcastToAll(this.makePacket());
		this.setInputTrigger(false);
	}
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

ServerPlayer.prototype.setInputVector = function(fromX, fromY, toX, toY) {
	this.piece.setInputVector(fromX, fromY, toX, toY)
};

ServerPlayer.prototype.updatePlayer = function(dt) {
	this.piece.processTimeUpdated(dt);
//	this.client.sendToClient(this.makePacket());

};