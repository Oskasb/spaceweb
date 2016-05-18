ServerPlayer = function(clientId, client) {

	this.id = 'player_'+clientId;
	this.client = client;
	this.clientId = clientId;

	this.piece = new GAME.Piece(this.id, new Date().getTime());
	this.piece.spatial.setPosXYZ(-100, 0, 0);
};


ServerPlayer.prototype.makePacket = function() {
	return this.piece.makePacket();
};

ServerPlayer.prototype.setInputVector = function(fromX, fromY, toX, toY) {
	this.piece.setInputVector(fromX, fromY, toX, toY)
};

ServerPlayer.prototype.updatePlayer = function(dt, serverTime) {
	this.piece.processTimeUpdated(dt, serverTime);
	this.client.sendToClient(this.makePacket());

};