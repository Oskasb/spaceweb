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
		BURST:'BURST',
		EXPLODE:'EXPLODE',
		REMOVED:'REMOVED'
	};


	GAME.PieceModule = function(moduleId, data, piece) {
		this.id = moduleId;
		this.data = data;
		this.piece = piece;
		this.appliedCallback = function() {};
		this.state = {value:null};
		this.lastValue = 'noValue';
	};

	GAME.PieceModule.prototype.setModuleState = function(state) {

      if (this.id == 'shield')  {
      //    console.log("Set Shield module state: ", state)
      }

        if (state == undefined) {
            return;
            
        };

		this.state.value = state;
	};

	GAME.PieceModule.prototype.setApplyCallback = function(callback) {
		this.appliedCallback = callback;
	};

	GAME.PieceModule.prototype.processModuleState = function(serverState) {
		this.setModuleState(serverState.value);


		switch (this.data.applies.type) {
            case "toggle":
         //       console.log("Toggle type", this);
                if (this.state.value == this.data.applies.state) {
            //        this.appliedCallback(this.data.applies.message)
                }
                break;

			case "boolean":
				if (this.state.value == this.data.applies.state) {
					this.appliedCallback(this.data.applies.message)
				}
				break;
			case "array":
				this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value);
				break;
			case "string":
				this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value);
				break;
			case "float":
				this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value);
				break;
			default:
				if (this.state.value > Math.abs(this.data.applies.threshold)) {
					this.appliedCallback(this.data.applies.message+' _ '+this.id+' _ '+this.state.value)
				}
		}
	};

	GAME.PieceModule.prototype.updateControlConstants = function(controls, constants, onOff) {
		for (var key in constants) {
			this.modifyControlConstants(controls, key, constants[key], onOff);
		}
	};


	GAME.PieceModule.prototype.modifyControlConstants = function(controls, constant, modifier, onOff) {

		if (onOff) {

            if (this.lastValue === 'noValue' && onOff === false) {
                console.log("Add noValue", constant, modifier)
                return;
            }

            console.log("Add modifier", constant, modifier)
			controls.constants[constant] += modifier;
		} else {

            if (this.lastValue === 'noValue' && onOff === false) {
                console.log("Remove noValue", constant, modifier)
                return;
            }

            console.log("Remove modifier", constant, modifier)
			controls.constants[constant] -= modifier;
		}

        this.lastValue = onOff;

	};

	GAME.PieceModule.prototype.processInputState = function(controls, actionCallback) {

        if (this.data.applies.type === 'toggle') {
			if (this.state.value != this.lastValue) {

				if (this.data.applies.control_constants) {
                    if (this.state.value == false) console.log("is false")
					this.updateControlConstants(controls, this.data.applies.control_constants, this.state.value)
				}
			}


            // module controls itself...
        //    console.log(controls.inputState[this.data.source])
        //    if (this.id == 'shield')  console.log("Process Shield state: ", this.state.value)
			this.lastValue = this.state.value;
            return;
        }

		this.setModuleState(controls.inputState[this.data.source]);

		if (typeof(controls.actions[this.data.applies.action]) != undefined) {
			controls.actions[this.data.applies.action] = this.state.value;

			if (typeof(actionCallback) == 'function') {
				actionCallback(this.data.applies.action, this.state.value, this.data);
			}
		}

		this.lastValue = this.state.value;
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
	//	console.log("Set Control: ", moduleData.source, action, value)
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
        this.inputState.currentState[0] = state[0];
        this.inputState.currentState[1] = state[1];
	//	this.inputState.setSteeringX(Math.clamp((toX - fromX), -1, 1));
	//	this.inputState.setSteeringY(Math.clamp((toY - fromY), -1, 1));

	//	this.inputState.setThrottle(Math.min(MATH.lineDistance(fromX, fromY, toX, toY), this.constants.throttleLimit) * this.constants.throttleAmplitude);

		this.inputState.setThrottle((state[1] / this.constants.throttleSegments) * this.constants.throttleAmplitude);

		if (this.inputState.getThrottle() != 0) {
			this.currentDrag = 1;
		} else {
			this.currentDrag = this.constants.velocityDrag;
		}

		this.inputState.setSteeringZ( Math.PI*0.5 + MATH.TWO_PI * state[0] / this.constants.radialSegments);

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




	GAME.Piece = function(type, id, creationTime, lifeTime, broadcast) {
		this.id = id;
		this.type = type;
		this.broadcast = broadcast;
		this.pieceControls = new GAME.PieceControls();
		this.temporal = new MODEL.Temporal(creationTime, lifeTime);
		this.calcVec = new MATH.Vec3(0, 0, 0);
		this.spatial = new MODEL.Spatial();
		this.targetSpatial = new MODEL.Spatial();
		this.startSpatial = new MODEL.Spatial();
		this.modules = [];
		this.moduleStates = {};
        this.moduleIndex = {};
		this.serverState = {};
		this.config = null;
		
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
            this.moduleIndex[moduleConfigs[i].id] = module;
        }
	};

	GAME.Piece.prototype.registerParentPiece = function(piece) {
		this.parentPiece = piece;
	};



	GAME.Piece.prototype.registerModuleFromServerState = function(module) {
		this.modules.push(module);
	};
	
	GAME.Piece.prototype.applyConfig = function(pieceConfigs) {
		this.config = pieceConfigs;
		this.pieceControls.applyControlConfig(pieceConfigs.controls);
		if (pieceConfigs.modules) this.attachModules(pieceConfigs.modules);
	};

	GAME.Piece.prototype.getTimeoutEvent = function() {
		if (!this.config.controls) return;
		if (this.config.controls.actions) {
			if (this.config.controls.actions.timeoutEvent) {
				return this.config.controls.actions.timeoutEvent;
			}			
		}
	};
	
	GAME.Piece.prototype.setState = function(state) {
		this.state = state;
	};


    GAME.Piece.prototype.setModuleState = function(moduleId, value) {
        if (this.getModuleById(moduleId)) {
            console.log("Set Mod State: ", moduleId, value)
            this.getModuleById(moduleId).setModuleState(value);
        } else {
            console.log("No module gotten ", moduleId, this.moduleIndex)
        }
    };

	GAME.Piece.prototype.setName = function(name) {
		this.pieceControls.inputState.playerName = name;
        this.setModuleState('nameplate', name);
	};

	GAME.Piece.prototype.readServerModuleState = function(moduleId) {
		return this.serverState.modules[moduleId];
	};


    GAME.Piece.prototype.getModuleById = function(moduleId) {
        return this.moduleIndex[moduleId];
    };



    GAME.Piece.prototype.getModuleStates = function() {
		return this.moduleStates;
	};

	GAME.Piece.prototype.getState = function() {
		return this.state;
	};

	GAME.Piece.prototype.makePacket = function() {

		return {
			id:"playerUpdate",
			data:{
				playerId:this.id,
				type:this.type,
				spatial:this.spatial.getSendSpatial(),
				modules:this.getModuleStates(),
				trigger:this.pieceControls.getTriggerState(),
				temporal:this.temporal.getSendTemporal(),
				state:this.getState()
			}
		};
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

	//	if (this.posDiff*this.temporal.currentTime > this.temporal.stepTime*0.1) {
			this.spatial.interpolatePositions(this.spatial, this.targetSpatial, tpf);
	//	}

		this.spatial.interpolateRotational(this.spatial, this.targetSpatial, tpf);

	//	if (this.pieceControls.inputState.throttle != 0) {
			this.spatial.vel.scale(1 - (this.pieceControls.constants.velocityDrag*tpf*0.1));
	//		this.spatial.rotVel[0] *= (1 - (this.pieceControls.constants.radialDrag*tpf*0.5));
	//	}

	//	this.spatial.getVelVec().setVec(this.targetSpatial.getVelVec());
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
		return this.spatial.isWithin(-200, 300, -200, 300);
	};
	
	GAME.Piece.prototype.processSpatialState = function(tickDelta) {

		this.updateServerSpatial(tickDelta);
		this.setState(GAME.ENUMS.PieceStates.MOVING);
		if (this.checkBounds()) {
			this.teleportRandom();
			this.broadcast(this.makePacket());
		}
		
	};

	GAME.Piece.prototype.processServerState = function(currentTime) {
		this.temporal.stepTime = MODEL.SimulationTime;
		this.temporal.networkTime = MODEL.NetworkTime;
		this.processTemporalState(currentTime, MODEL.SimulationTime);
		this.processModuleStates();
		this.processSpatialState(MODEL.SimulationTime);

		if (this.networkDirty) {
			this.broadcast(this.makePacket());
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
