ServerPlayer = function(clientId, client) {
	this.id = 'player_'+clientId;
	this.client = client;
	this.clientId = clientId;

	this.inputVector = [0, 0, 0];

	this.spatial = {
		pos : [1000, 9999, 100],
		vel : [Math.random()*0.1, Math.random()*0.1, 0]
	};

	this.states = {
		MOVING:'MOVING',
		TELEPORT:'TELEPORT',
		KILLED:'KILLED',
		REMOVED:'REMOVED'
	};

	this.state = this.states.TELEPORT;

	this.inputCountdown = 5;

	this.creationTime = new Date().getTime();
	this.serverTime = this.creationTime;
	this.timeDelta = 0;
	this.timeSinceInput = 1;
};



ServerPlayer.prototype.makePacket = function() {
	return {id:"playerUpdate", data:{playerId:this.id, spatial:this.spatial, timeDelta:this.timeDelta, state:this.state}};
};

ServerPlayer.prototype.updatePlayerSpatial = function(dt) {
	this.timeDelta = dt;

	var timeFactor = Math.min(1, (1 / this.timeSinceInput*0.93));

	this.spatial.vel[0] *= timeFactor;
	this.spatial.vel[1] *= timeFactor;

	this.spatial.pos[0] += this.spatial.vel[0] * 15 * dt;
	this.spatial.pos[1] += this.spatial.vel[1] * 15 * dt;
};


ServerPlayer.prototype.setInputVector = function(fromX, fromY, toX, toY) {
	this.timeSinceInput = 0;
	this.inputVector[0] = toX - fromX;
	this.inputVector[1] = toY - fromY;

	this.spatial.vel[0] = Math.clamp(this.inputVector[0], -1, 1);
	this.spatial.vel[1] = Math.clamp(this.inputVector[1], -1, 1);
};


ServerPlayer.prototype.updatePlayer = function(dt, serverTime) {
	this.timeDelta = dt;
	this.timeSinceInput += dt;
	this.serverTime = serverTime;
	this.updatePlayerSpatial(dt);

	this.state = this.states.MOVING;
	if (this.spatial.pos[0] < 0 || this.spatial.pos[0] > 100 || this.spatial.pos[1] < 0 || this.spatial.pos[1] > 100) {

		this.state = this.states.TELEPORT;

		this.spatial.vel[0] = 0;
		this.spatial.vel[1] = 0;

		this.spatial.pos[0] = Math.random()*100;
		this.spatial.pos[1] = Math.random()*100;
	}

	this.client.sendToClient(this.makePacket());

};