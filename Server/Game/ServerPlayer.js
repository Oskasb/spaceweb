ServerPlayer = function(clientId, client) {

	this.calcVec = new MATH.Vec3(0, 0, 0);

	this.id = 'player_'+clientId;
	this.client = client;
	this.clientId = clientId;

	this.inputVector = new MATH.Vec3(0, 0, 0);

	this.spatial = new MODEL.Spatial();


	this.state = MODEL.ENUMS.PieceStates.TELEPORT;

	this.inputCountdown = 5;

	this.creationTime = new Date().getTime();
	this.serverTime = this.creationTime;
	this.timeDelta = 0;
	this.timeSinceInput = 1;

	this.spatial.setPosXYZ(-100, 0, 0);

};

ServerPlayer.prototype.teleportRandom = function() {
	this.state = MODEL.ENUMS.PieceStates.TELEPORT;
	this.spatial.stop();
	this.spatial.setPosXYZ(Math.random()*100, Math.random()*100, 0);
};


ServerPlayer.prototype.makePacket = function() {
	return {id:"playerUpdate", data:{playerId:this.id, spatial:this.spatial.getSendSpatial(), timeDelta:this.timeDelta, state:this.state}};
};

ServerPlayer.prototype.updatePlayerSpatial = function(dt) {
	this.timeDelta = dt;

	var timeFactor = Math.min(1, (1 / this.timeSinceInput*0.93));

	this.calcVec.setVec(this.inputVector);

	this.calcVec.scale(timeFactor);
	this.calcVec.scale(15 * dt);
	this.spatial.setVelVec(this.calcVec);
	this.spatial.update();
};


ServerPlayer.prototype.setInputVector = function(fromX, fromY, toX, toY) {
	this.timeSinceInput = 0;
	this.inputVector.setX(Math.clamp((toX - fromX), -1, 1));
	this.inputVector.setY(Math.clamp((toY - fromY), -1, 1));
};


ServerPlayer.prototype.updatePlayer = function(dt, serverTime) {
	this.timeDelta = dt;
	this.timeSinceInput += dt;
	this.serverTime = serverTime;
	this.updatePlayerSpatial(dt);

	this.state = MODEL.ENUMS.PieceStates.MOVING;
	if (this.spatial.isWithin(0, 100, 0, 100)) {
		 this.teleportRandom();
	}

	this.client.sendToClient(this.makePacket());

};