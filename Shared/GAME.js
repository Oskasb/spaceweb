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
		TIME_OUT:'TIME_OUT',
		MOVING:'MOVING',
		TELEPORT:'TELEPORT',
		SPAWN:'SPAWN',
		KILLED:'KILLED',
		REMOVED:'REMOVED'
	};


	GAME.PieceModule = function(moduleId, data, piece) {
		this.id = moduleId;
		this.data = data;
		this.piece = piece;
		this.appliedCallback = function() {};
		this.state = {value:null};
	};

	GAME.PieceModule.prototype.setModuleState = function(state) {
		this.state.value = state;
	};



	GAME.PieceModule.prototype.setAppliyCallback = function(callback) {
		this.appliedCallback = callback;
	};

	GAME.PieceModule.prototype.processModuleState = function(serverState) {
		this.setModuleState(serverState.value);

		if (this.data.applies.type == "boolean") {
			if (this.state.value == this.data.applies.state) {
				this.appliedCallback(this.data.applies.message)
			}
		} else {
			if (this.state.value > Math.abs(this.data.applies.threshold)) {
				this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value)
			}
		}

		
	};
	
	GAME.PieceModule.prototype.processInputState = function(controls, actionCallback) {
		this.state.value = controls.inputState[this.data.source];

		if (typeof(controls.actions[this.data.applies.action]) != undefined) {
			controls.actions[this.data.applies.action] = this.state.value;

			if (typeof(actionCallback) == 'function') {
				actionCallback(this.data.applies.action, this.state.value, this.data);
			}
		}
	};



	GAME.PieceControls = function() {
		this.inputState = new MODEL.InputState();

		this.actions = {};

		this.calcVec = new MATH.Vec3(0, 0, 0);
		this.constants = {
			radialDrag:0.9,
			velocityDrag:0.99,
			deceleration:0.6,
			radialVelocityClamp:0.2,
			radialLerpFactor:0.1,
			throttleLimit: 1,
			throttleAmplitude: 3
		};

		this.currentDrag = 1;
		this.currentRadialDrag = 1;
	};

	GAME.PieceControls.prototype.setControlState = function(moduleData, action, value) {
		console.log("Set Control: ", moduleData.source, action, value)
	};

	GAME.PieceControls.prototype.applyControlConfig = function(configs) {
		for (var key in configs.constants) {
			this.constants[key] = configs.constants[key];
		}
		for (key in configs.actions) {
			this.actions[key] = configs.actions[key];
		}
	};

	GAME.PieceControls.prototype.applyInputVector = function(state) {
	//	this.inputState.setSteeringX(Math.clamp((toX - fromX), -1, 1));
	//	this.inputState.setSteeringY(Math.clamp((toY - fromY), -1, 1));

	//	this.inputState.setThrottle(Math.min(MATH.lineDistance(fromX, fromY, toX, toY), this.constants.throttleLimit) * this.constants.throttleAmplitude);

		this.inputState.setThrottle((state[1] / this.constants.throttleSegments) * this.constants.throttleAmplitude);

		if (this.inputState.getThrottle() != 0) {
			this.currentDrag = 1;
		} else {
			this.currentDrag = this.constants.velocityDrag;
		}

		this.inputState.setSteeringZ(Math.PI + MATH.TWO_PI * state[0] / this.constants.radialSegments);

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




	GAME.Piece = function(id, creationTime, lifeTime, broadcast) {
		this.id = id;
		this.broadcast = broadcast;
		this.pieceControls = new GAME.PieceControls();
		this.temporal = new MODEL.Temporal(creationTime, lifeTime);
		this.calcVec = new MATH.Vec3(0, 0, 0);
		this.spatial = new MODEL.Spatial();
		this.targetSpatial = new MODEL.Spatial();
		this.startSpatial = new MODEL.Spatial();
		this.modules = [];
		this.moduleStates = {};
		this.serverState = {};

		this.posDiff = 0;
		this.rotDiff = 0;

	};

	GAME.Piece.prototype.attachModules = function(moduleConfigs) {
		this.modules = [];
		this.moduleStates = {};
		for (var i = 0; i < moduleConfigs.length; i++) {
			var module = new GAME.PieceModule(moduleConfigs[i].id, moduleConfigs[i].data, this);
			module.setModuleState(moduleConfigs[i].data.initState);
			this.modules.push(module);
			if (!this.moduleStates[moduleConfigs[i].id]) {
				this.moduleStates[moduleConfigs[i].id] = [];
			}
			this.moduleStates[moduleConfigs[i].id].push(module.state);
		}
	};

	GAME.Piece.prototype.registerModuleFromServerState = function(module) {
		this.modules.push(module);
	};
	
	GAME.Piece.prototype.applyConfig = function(pieceConfigs) {
		this.pieceControls.applyControlConfig(pieceConfigs.controls);
		if (pieceConfigs.modules) this.attachModules(pieceConfigs.modules);
	};

	GAME.Piece.prototype.setState = function(state) {
		this.state = state;
	};

	GAME.Piece.prototype.getModuleStates = function() {
	//	return [];
		return this.moduleStates;
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
				modules:this.getModuleStates(),
				trigger:this.pieceControls.getTriggerState(),
				temporal:this.temporal.getSendTemporal(),
				state:this.getState()
			}
		});
	};

	GAME.Piece.prototype.processModules = function(moduleStates) {

		for (var i = 0; i < this.modules.length; i++) {
			if (moduleStates[this.modules[i].id]) {
				this.modules[i].processModuleState(moduleStates[this.modules[i].id][0])
			}

		}
	};

	GAME.Piece.prototype.updatePieceFrame = function(tpf) {
		this.temporal.incrementTpf(tpf);
		if (this.temporal.lifeTime < this.temporal.getAge()) {
			console.log("Client Timeout", this.temporal.lifeTime , this.temporal.getAge())
			this.setState(GAME.ENUMS.PieceStates.TIME_OUT);
		}


/*
		this.calcVec.setVec(this.spatial.getVelVec());
		this.calcVec.scale(tpf * this.pieceControls.constants.velocityDrag);
		this.spatial.setVelVec(this.calcVec);
		this.spatial.update();
*/	//
	//	console.log(this.rotDiff, this.posDiff);

		if (this.posDiff*this.temporal.currentTime > this.temporal.stepTime*0.1) {
			this.spatial.interpolatePositions(this.spatial, this.targetSpatial, tpf);
		}

		this.spatial.interpolateRotational(this.spatial, this.targetSpatial, tpf);

	//	if (this.pieceControls.inputState.throttle != 0) {
			this.spatial.vel.scale(1 - (this.pieceControls.constants.velocityDrag*tpf*0.5));
	//		this.spatial.rotVel[0] *= (1 - (this.pieceControls.constants.radialDrag*tpf*0.5));
	//	}

		this.spatial.getVelVec().setVec(this.targetSpatial.getVelVec());
		this.spatial.update(tpf);

		// this.updateServerSpatial(tpf);
	};

	GAME.Piece.prototype.setInputTrigger = function(bool, actionCallback) {
		this.pieceControls.setTriggerState(bool);
		for (var i = 0; i < this.modules.length; i++) {
			this.modules[i].processInputState(this.pieceControls, actionCallback);
		}
	};

	GAME.Piece.prototype.setInputVector = function(state) {
		this.pieceControls.applyInputVector(state);
	};

	GAME.Piece.prototype.teleportRandom = function() {
		this.setState(GAME.ENUMS.PieceStates.TELEPORT);
		this.spatial.stop();
		this.spatial.setPosXYZ(Math.random()*100, Math.random()*100, 0);
	};

	GAME.Piece.prototype.applyForwardControl = function(timeFactor) {
		this.spatial.getForwardVector(this.calcVec);
		this.calcVec.scale(this.pieceControls.actions.applyForward * timeFactor);
		this.spatial.addVelVec(this.calcVec);
	};

	GAME.Piece.prototype.applyControlStates = function(tickDelta) {
		if (typeof(this.pieceControls.actions.applyThrottle) != undefined) {
		//	if ((Math.round((this.pieceControls.inputState.getThrottle() - this.pieceControls.inputState.getThrottle() * timeFactor)*0.3) != 0)) {
		//		this.networkDirty = true;
		//	}
	//		this.pieceControls.inputState.setThrottle(this.pieceControls.inputState.getThrottle()); //  * timeFactor);

		}

		if (typeof(this.pieceControls.actions.applySteering) != undefined) {
			this.pieceControls.getSteering(this.calcVec);
			this.spatial.applySteeringVector(this.calcVec, tickDelta, this.pieceControls.constants.radialVelocityClamp, this.pieceControls.constants.radialLerpFactor);
		}

		if (typeof(this.pieceControls.actions.applyForward) != undefined) {
			this.applyForwardControl(tickDelta);
		}
	};

	GAME.Piece.prototype.updateServerSpatial = function(tickDelta) {
	//	var timeFactor = this.pieceControls.getTimeFactor(this.timeSinceInput);
		this.applyControlStates(tickDelta);

	//	if (this.pieceControls.inputState.throttle == 0) {
			this.spatial.vel.scale(1 - (this.pieceControls.constants.velocityDrag*tickDelta));
			this.spatial.rotVel[0] *= (1 - (this.pieceControls.constants.radialDrag*tickDelta));
	//	}

		this.spatial.update(tickDelta);
	};

	GAME.Piece.prototype.processTemporalState = function(currentTime) {
		this.temporal.predictUpdate(currentTime);

		if (this.temporal.lifeTime < this.temporal.getAge()) {
			this.setState(GAME.ENUMS.PieceStates.TIME_OUT);
		}
	};

	GAME.Piece.prototype.processModuleStates = function() {
		for (var i = 0; i < this.modules.length; i++) {
			this.modules[i].processInputState(this.pieceControls);
		}
	};

	GAME.Piece.prototype.checkBounds = function() {
		return this.spatial.isWithin(0, 100, 0, 100);
	};
	
	GAME.Piece.prototype.processSpatialState = function(tickDelta) {

		this.updateServerSpatial(tickDelta);
		this.setState(GAME.ENUMS.PieceStates.MOVING);
		if (this.checkBounds()) {
			this.teleportRandom();
			this.broadcast();
		}
		
	};

	GAME.Piece.prototype.processServerState = function(currentTime) {
		this.temporal.stepTime = MODEL.SimulationTime;
		this.temporal.networkTime = MODEL.NetworkTime;
		this.processTemporalState(currentTime, MODEL.SimulationTime);
		this.processModuleStates();
		this.processSpatialState(MODEL.SimulationTime);

		if (this.networkDirty) {
			this.broadcast();
			this.networkDirty = false;
		}

	};

	GAME.Piece.prototype.applyNetworkState = function(networkState) {
		this.serverState = networkState;

		this.startSpatial.setSpatial(this.spatial);
		this.targetSpatial.setSendData(networkState.spatial);

		this.temporal.setSendTemporal(networkState.temporal);

		if (networkState.state == GAME.ENUMS.PieceStates.TELEPORT || networkState.state == GAME.ENUMS.PieceStates.SPAWN) {
			this.spatial.setSendData(networkState.spatial);
			this.startSpatial.setSendData(networkState.spatial);
		} else {
			this.posDiff = this.spatial.comparePositional(this.targetSpatial);
			this.rotDiff = this.spatial.compareRotational(this.targetSpatial);
		}

	};


})(GAME);
