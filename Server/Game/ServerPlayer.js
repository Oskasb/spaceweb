ServerPlayer = function(clientId, client, simTime) {

	this.id = 'player_'+clientId;
	this.client = client;
	this.clientId = clientId;

	this.piece = new GAME.Piece(this.id, simTime);
	this.piece.teleportRandom();
};

ServerPlayer.prototype.applyPieceConfig = function(configs) {
	this.piece.applyConfig(configs);
};

ServerPlayer.prototype.makePacket = function() {
	return this.piece.makePacket();
};

ServerPlayer.prototype.setInputTrigger = function(bool) {
	this.piece.setInputTrigger(bool)
};

ServerPlayer.prototype.setInputVector = function(fromX, fromY, toX, toY) {
	this.piece.setInputVector(fromX, fromY, toX, toY)
};

ServerPlayer.prototype.updatePlayer = function(dt, serverTime) {
	this.piece.processTimeUpdated(dt, serverTime);
//	this.client.sendToClient(this.makePacket());

};