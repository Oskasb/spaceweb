if(typeof(GAME) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	GAME = {};
}

(function(GAME){

	GAME.ENUMS = {};

	GAME.ENUMS.ClientStates = {
		DISCONNECTED:'DISCONNECTED',
		LOADING:'LOADING',
		READY:'READY',
		PLAYING:'PLAYING',
		CLIENT_REQUESTED:'CLIENT_REQUESTED',
		CLIENT_REGISTERED:'CLIENT_REGISTERED',
		PLAYER_REQUESTED:'PLAYER_REQUESTED'
	};

	GAME.ENUMS.PieceStates = {
		MOVING:'MOVING',
		TELEPORT:'TELEPORT',
		KILLED:'KILLED',
		REMOVED:'REMOVED'
	};

	GAME.PieceControls = function() {
		this.inputState = new MODEL.InputState();
		this.calcVec = new MATH.Vec3(0, 0, 0);

		this.constants = {
			deceleration:0.6,
			radialVelocityClamp:0.2,
			radialLerpFactor:0.1,
			throttleLimit: 1,
			throttleAmplitude: 3
		};

	};

	GAME.PieceControls.prototype.applyInputVector = function(fromX, fromY, toX, toY) {

		this.inputState.setSteeringX(Math.clamp((toX - fromX), -1, 1));
		this.inputState.setSteeringY(Math.clamp((toY - fromY), -1, 1));
		this.inputState.setThrottle(Math.min(MATH.lineDistance(fromX, fromY, toX, toY), this.constants.throttleLimit) * this.constants.throttleAmplitude);

		if (this.inputState.getThrottle() > 0.1) {
			this.inputState.setSteeringZ(Math.atan2(toX - fromX, fromY - toY));
		}

	};

	GAME.PieceControls.prototype.getTimeFactor = function(timeSinceInput) {
		return Math.min(1, (1 / timeSinceInput*this.constants.deceleration));
	};

	GAME.PieceControls.prototype.getSteering = function(store) {
		this.inputState.getSteering(store, this.constants.radialVelocityClamp);
	};

	GAME.PieceControls.prototype.getTriggerState = function() {
		return this.inputState.getTrigger();
	};

	GAME.PieceControls.prototype.setTriggerState = function(bool) {
		this.inputState.setTrigger(bool);
	};

	GAME.Piece = function(id, creationTime) {
		this.id = id;
		this.pieceControls = new GAME.PieceControls();
		this.calcVec = new MATH.Vec3(0, 0, 0);
		this.spatial = new MODEL.Spatial();
		this.targetSpatial = new MODEL.Spatial();
		this.startSpatial = new MODEL.Spatial();
		this.temporal = new MODEL.Temporal(creationTime);

		this.timeSinceInput = 0;


	};

	GAME.Piece.prototype.applyConfig = function(pieceConfigs) {
		console.log("apply Config: ", JSON.stringify(pieceConfigs));
		for (var key in pieceConfigs.controls.constants) {
			this.pieceControls.constants[key] = pieceConfigs.controls.constants[key];
		}
		
		
	};
	
	GAME.Piece.prototype.setState = function(state) {
		if (!GAME.ENUMS.PieceStates[state]) {
			console.log("No such PieceState: "+state);
		}
		this.state = state;
	};

	GAME.Piece.prototype.getState = function() {
		return this.state;
	};

	GAME.Piece.prototype.makePacket = function() {
		return JSON.stringify({
			id:"playerUpdate",
			data:{
				playerId:this.id,
				spatial:this.spatial.getSendSpatial(),
				trigger:this.pieceControls.getTriggerState(),
				timeDelta:this.temporal.timeDelta,
				state:this.getState()
			}
		});
	};

	GAME.Piece.prototype.updatePieceFrame = function(tpf) {
		this.spatial.interpolateTowards(this.startSpatial, this.targetSpatial, this.temporal.getFraction(tpf));
	};

	GAME.Piece.prototype.setInputTrigger = function(bool) {
		this.pieceControls.setTriggerState(bool);
	};

	GAME.Piece.prototype.setInputVector = function(fromX, fromY, toX, toY) {
		this.timeSinceInput = 0;

		this.pieceControls.applyInputVector(fromX, fromY, toX, toY);

	};

	GAME.Piece.prototype.teleportRandom = function() {
		this.setState(GAME.ENUMS.PieceStates.TELEPORT);
		this.spatial.stop();
		this.spatial.setPosXYZ(Math.random()*100, Math.random()*100, 0);
	};



	GAME.Piece.prototype.updatePlayerSpatial = function(dt) {
		this.timeDelta = dt;
		this.timeSinceInput += dt;

		var timeFactor = this.pieceControls.getTimeFactor(this.timeSinceInput)

		this.pieceControls.getSteering(this.calcVec);

		this.spatial.applySteeringVector(this.calcVec, dt, this.pieceControls.constants.radialVelocityClamp, this.pieceControls.constants.radialLerpFactor);

		this.spatial.getForwardVector(this.calcVec);
		
		this.calcVec.scale(this.pieceControls.inputState.getThrottle() * 2 * dt * timeFactor);

		this.spatial.setVelVec(this.calcVec);
		this.spatial.update();
	};


	GAME.Piece.prototype.processTimeUpdated = function(dt, serverTime) {
		this.temporal.predictUpdate(dt);
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
