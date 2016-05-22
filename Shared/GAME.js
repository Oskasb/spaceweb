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
			deceleration:0.6,
			radialVelocityClamp:0.2,
			radialLerpFactor:0.1,
			throttleLimit: 1,
			throttleAmplitude: 3
		};
	};

	GAME.PieceControls.prototype.applyControlConfig = function(configs) {
		for (var key in configs.constants) {
			this.constants[key] = configs.constants[key];
		}
		for (key in configs.actions) {
			this.actions[key] = configs.actions[key];
		}
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




	GAME.Piece = function(id, creationTime, lifeTime) {
		this.id = id;
		this.pieceControls = new GAME.PieceControls();
		this.calcVec = new MATH.Vec3(0, 0, 0);
		this.spatial = new MODEL.Spatial();
		this.targetSpatial = new MODEL.Spatial();
		this.startSpatial = new MODEL.Spatial();
		this.temporal = new MODEL.Temporal(creationTime, lifeTime);
		this.timeSinceInput = 0;
		this.modules = [];
		this.moduleStates = {};
		this.serverState;
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
				timeDelta:this.temporal.timeDelta,
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
		this.spatial.interpolateTowards(this.startSpatial, this.targetSpatial, this.temporal.getFraction(tpf));
	};

	GAME.Piece.prototype.setInputTrigger = function(bool, actionCallback) {
		this.pieceControls.setTriggerState(bool);
		for (var i = 0; i < this.modules.length; i++) {
			this.modules[i].processInputState(this.pieceControls, actionCallback);
		}
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

	GAME.Piece.prototype.applyForwardControl = function(timeFactor) {
		this.spatial.getForwardVector(this.calcVec);
		this.calcVec.scale(this.pieceControls.actions.applyForward * timeFactor);
		this.spatial.addVelVec(this.calcVec);
	};

	GAME.Piece.prototype.updatePlayerSpatial = function(dt) {
		this.timeDelta = dt;
		this.timeSinceInput += dt;
		var timeFactor = this.pieceControls.getTimeFactor(this.timeSinceInput);

		if (typeof(this.pieceControls.actions.applyThrottle) != undefined) {
			this.pieceControls.inputState.setThrottle(this.pieceControls.inputState.getThrottle() * timeFactor);
		}

		if (typeof(this.pieceControls.actions.applySteering) != undefined) {
			this.pieceControls.getSteering(this.calcVec);
			this.spatial.applySteeringVector(this.calcVec, dt, this.pieceControls.constants.radialVelocityClamp, this.pieceControls.constants.radialLerpFactor);
		}

		if (typeof(this.pieceControls.actions.applyForward) != undefined) {
			this.applyForwardControl(dt * timeFactor);
		}

		this.spatial.getVelVec().scale(1-dt*timeFactor);
		this.spatial.update();
	};

	GAME.Piece.prototype.processTemporalState = function(dt) {
		this.temporal.predictUpdate(dt);
		if (this.temporal.lifeTime < 0) {
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
	
	GAME.Piece.prototype.processSpatialState = function(dt) {

		this.updatePlayerSpatial(dt);

		this.setState(GAME.ENUMS.PieceStates.MOVING);
		if (this.checkBounds()) {
			this.teleportRandom();
		}
	};
	
	

	GAME.Piece.prototype.applyNetworkState = function(networkState) {
		this.serverState = networkState;
		this.temporal.predictUpdate(networkState.timeDelta);

		if (networkState.state == GAME.ENUMS.PieceStates.TELEPORT) {
			this.spatial.setSendData(networkState.spatial);
		}

		this.startSpatial.setSpatial(this.spatial);
		this.targetSpatial.setSendData(networkState.spatial);
	};




})(GAME);
