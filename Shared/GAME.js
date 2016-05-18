if(typeof(GAME) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	GAME = {};
}

(function(GAME){

	GAME.ENUMS = {};

	GAME.ENUMS.ClientStates = {
		LOADING:'LOADING',
		READY:'READY',
		PLAYING:'PLAYING',
		PLAYER_REQUESTED:'PLAYER_REQUESTED'
	};

	GAME.ENUMS.PieceStates = {
		MOVING:'MOVING',
		TELEPORT:'TELEPORT',
		KILLED:'KILLED',
		REMOVED:'REMOVED'
	};

	GAME.Piece = function(id, creationTime) {
		this.id = id;
		this.inputState = new MODEL.InputState();
		this.inputVector = new MATH.Vec3(0, 0, 0);
		this.calcVec = new MATH.Vec3(0, 0, 0);
		this.spatial = new MODEL.Spatial();
		this.targetSpatial = new MODEL.Spatial();
		this.startSpatial = new MODEL.Spatial();
		this.temporal = new MODEL.Temporal(creationTime);
	};

	GAME.Piece.prototype.setPos = function(x, y, z) {
		this.spatial.setPosXYZ(x, y, z);
	};

	GAME.Piece.prototype.setVel = function(x, y, z) {
		this.spatial.setVelXYZ(x, y, z);
	};

	GAME.Piece.prototype.getPos = function() {
		this.spatial.getPosArray();
	};

	GAME.Piece.prototype.getVel = function() {
		this.spatial.getVelArray();
	};

	GAME.Piece.prototype.setState = function(state) {
		if (!GAME.ENUMS.PieceStates[state]) {
			console.log("No such PieceState: "+state);
		}
		this.state = state;
	};

	GAME.Piece.prototype.getState = function(state) {
		return this.state;
	};

	GAME.Piece.prototype.makePacket = function() {
		return {id:"playerUpdate", data:{playerId:this.id, spatial:this.spatial.getSendSpatial(), timeDelta:this.temporal.timeDelta, state:this.state}};
	};

	GAME.Piece.prototype.updatePieceFrame = function(tpf) {
		this.spatial.interpolateTowards(this.startSpatial, this.targetSpatial, this.temporal.getFraction(tpf));
	};

	GAME.Piece.prototype.setInputVector = function(fromX, fromY, toX, toY) {
		this.timeSinceInput = 0;
		this.inputState.setSteeringX(Math.clamp((toX - fromX), -1, 1));
		this.inputState.setSteeringY(Math.clamp((toY - fromY), -1, 1));
		if (this.inputState.getSteeringAmplitude() > 0.1) {
			this.inputState.setSteeringZ(Math.atan2(toX - fromX, fromY - toY));
		}

	};

	GAME.Piece.prototype.teleportRandom = function() {
		this.setState(GAME.ENUMS.PieceStates.TELEPORT);
		this.spatial.stop();
		this.spatial.setPosXYZ(Math.random()*100, Math.random()*100, 0);
	};


	GAME.Piece.prototype.updatePlayerSpatial = function(dt) {
		this.timeDelta = dt;

		var timeFactor = Math.min(1, (1 / this.timeSinceInput*0.93));

		this.inputState.getSteering(this.calcVec);
		this.spatial.setRotVec(this.calcVec);

		this.calcVec.scale(timeFactor);
		this.calcVec.scale(15 * dt);
		this.spatial.setVelVec(this.calcVec);

		this.spatial.update();
	};


	GAME.Piece.prototype.processTimeUpdated = function(dt, serverTime) {
		this.temporal.predictUpdate(dt);
		this.timeDelta = dt;
		this.timeSinceInput += dt;
		this.simulationTime = serverTime;
		this.updatePlayerSpatial(dt);

		this.setState(GAME.ENUMS.PieceStates.MOVING);
		if (this.spatial.isWithin(0, 100, 0, 100)) {
			this.teleportRandom();
		}
	};

	GAME.Piece.prototype.applyNetworkState = function(networkState) {
		this.temporal.predictUpdate(networkState.timeDelta);


		if (networkState.state == GAME.ENUMS.PieceStates.TELEPORT) {
			this.spatial.setSendData(networkState.spatial);
		}

		this.startSpatial.setSpatial(this.spatial);
		this.targetSpatial.setSendData(networkState.spatial);
	};




})(GAME);
