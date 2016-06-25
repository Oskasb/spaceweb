if(typeof(MODEL) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	MODEL = {};
}

(function(MODEL){
	
	var calcVec = new MATH.Vec3(0, 0, 0);

    MODEL.ReferenceTime = 1;
    MODEL.NetworkTime = 1;
    MODEL.SimulationTime = 1;
    MODEL.NetworkFPS = 1;
    MODEL.SimulationFPS = 1;
    
    
	MODEL.Spatial = function() {
		this.sendData = {
			pos:[0, 0, 0],
			vel:[0, 0, 0],
			rot:[0],
			rotVel:[0]
		};
		this.pos = new MATH.Vec3(0, 0, 0.1);
		this.vel = new MATH.Vec3(0, 0, 0);
		this.rot = [0];
		this.rotVel = [0];
	};

    MODEL.Spatial.prototype.comparePositional = function(spatial) {
        return Math.abs(this.pos.data[0] - spatial.pos.data[0]) +
            Math.abs(this.pos.data[1] - spatial.pos.data[1]) +
            Math.abs(this.pos.data[2] - spatial.pos.data[2]) +
            Math.abs(this.vel.data[0] - spatial.vel.data[0]) +
            Math.abs(this.vel.data[1] - spatial.vel.data[1]) +
            Math.abs(this.vel.data[2] - spatial.vel.data[2]) 
    };

    MODEL.Spatial.prototype.compareRotational = function(spatial) {
        return Math.abs(this.rot[0] - spatial.rot[0]) +
            Math.abs(this.rotVel[0] - spatial.rotVel[0])
    };

    MODEL.Spatial.prototype.interpolateFraction = function(start, target, fraction) {
        this.interpolatePositions( start, target, fraction);
        this.interpolateVelocity(  start, target, Math.min(fraction, 1));
        this.interpolateRotational(start, target, Math.min(fraction, 1));
        this.interpolateRotVel(start, target, Math.min(fraction, 1));
    };
    
	MODEL.Spatial.prototype.interpolateVelocity = function(start, target, fraction) {
		this.vel = this.vel.interpolateFromTo(start.vel, target.vel, fraction);
	};

    MODEL.Spatial.prototype.interpolateRotVel = function(start, target, fraction) {
        this.rotVel[0] = MATH.radialLerp(start.rotVel[0], target.rotVel[0], fraction);
    };


    MODEL.Spatial.prototype.interpolatePositions = function(start, target, fraction) {
        this.pos = this.pos.interpolateFromTo(start.pos, target.pos, fraction);
    };

	MODEL.Spatial.prototype.interpolateRotational = function(start, target, fraction) {
		this.rot[0] = MATH.radialLerp(start.rot[0], target.rot[0], fraction);
	};
	
	MODEL.Spatial.prototype.setSendData = function(sendData) {
        this.pos.setArray(sendData.pos);
        this.vel.setArray(sendData.vel);
        this.rot[0] = sendData.rot[0];
        this.rotVel[0] = sendData.rotVel[0];
    };

    MODEL.Spatial.prototype.getSendSpatial = function() {
        this.pos.getArray(this.sendData.pos);
        this.vel.getArray(this.sendData.vel);
        this.sendData.rot[0] = this.rot[0];
        this.sendData.rotVel[0] = this.rotVel[0];
        return this.sendData;
    };

	MODEL.Spatial.prototype.setSpatial = function(spatial) {
		this.pos.setVec(spatial.pos);
		this.vel.setVec(spatial.vel);
		this.rot[0] = spatial.rot[0];
		this.rotVel[0] = spatial.rotVel[0];
	};

	MODEL.Spatial.prototype.stop = function() {
		this.vel[0] = 0;
		this.rotVel[0] = 0;
	};

	MODEL.Spatial.prototype.applySteeringVector = function(steerVec, dt,  rotVelClamp, radialLerp) {
		this.rotVel[0] = steerVec.data[2];
		this.rotVel[0]-= this.rot[0];

		this.rotVel[0] = MATH.radialClamp(this.rotVel[0], -rotVelClamp, rotVelClamp);

		this.rotVel[0] = MATH.radialLerp(this.rotVel[0], steerVec.data[2], dt*radialLerp);
	};

	MODEL.Spatial.prototype.getForwardVector = function(vec3) {
		vec3.setXYZ(Math.cos(this.rot[0] -Math.PI*0.5), Math.sin(this.rot[0] -Math.PI*0.5), 0);
        return vec3;
	};

    MODEL.Spatial.prototype.getOffsetVector = function(vec3, store) {
        vec3.setXYZ(Math.cos(this.rot[0] -Math.PI*0.5), Math.sin(this.rot[0] -Math.PI*0.5), 0);
        return store;
    };
    

	MODEL.Spatial.prototype.setPosXYZ = function(x, y, z) {
		this.pos.setXYZ(x, y, z);
	};

	MODEL.Spatial.prototype.getPosArray = function(array) {
		this.pos.getArray(array);
	};

	MODEL.Spatial.prototype.posX = function() {
		return this.pos.getX();
	};

	MODEL.Spatial.prototype.posY = function() {
		return this.pos.getY();
	};
	
	MODEL.Spatial.prototype.getRotArray = function(array) {
		array[0] = this.rot[0];
	};

	MODEL.Spatial.prototype.getRotVelArray = function(array) {
		array[0] = this.rotVel[0];
	};
	
	MODEL.Spatial.prototype.getVelArray = function(array) {
		this.vel.getArray(array);
	};

	MODEL.Spatial.prototype.getVelVec = function() {
		return this.vel;
	};

    MODEL.Spatial.prototype.getPosVec = function() {
        return this.pos;
    };
    
	MODEL.Spatial.prototype.addVelVec = function(velVec) {
		this.vel.addVec(velVec);
	};

	MODEL.Spatial.prototype.updateSpatial = function(tpf) {
        calcVec.setVec(this.vel);
        calcVec.scale(tpf);
		this.pos.addVec(calcVec);
		this.rot[0] = MATH.angleInsideCircle(this.rot[0] + this.rotVel[0] * tpf);
	};

	MODEL.Spatial.prototype.isWithin = function(xMin, xMax, yMin, yMax) {
		return this.pos.getX() < xMin || this.pos.getX() > xMax || this.pos.getY() < yMin || this.pos.getY() > yMax;
	};

	MODEL.Temporal = function(creationTime, lifeTime) {

        this.sendData = {
            lifeTime:0,
            creationTime:0,
            currentTime:0,
            lastUpdate:0,
            stepTime:MODEL.SimulationTime,
            networkTime:MODEL.NetworkTime
        };
        
        this.stepTime = MODEL.SimulationTime;
        this.networkTime = MODEL.NetworkTime;
		this.lifeTime = lifeTime || Number.MAX_VALUE;
        this.currentTime = creationTime;
		this.creationTime = creationTime;
        this.lastUpdate = creationTime;
        this.packetAge = 0;
		this.timeDelta = 1;
		this.fraction = 1;
        this.tickDelta = 0;
	};

    MODEL.Temporal.prototype.setSendTemporal = function(sendData) {
        this.lifeTime =       sendData.lifeTime;
        this.creationTime =   sendData.creationTime;
        this.currentTime =    0;
        this.lastUpdate =     sendData.lastUpdate;
        this.stepTime =       sendData.stepTime;
        this.networkTime =    sendData.networkTime;
        this.packetAge = 0;
    };

    MODEL.Temporal.prototype.getSendTemporal = function() {
        
        this.sendData.lifeTime = this.lifeTime;
        this.sendData.creationTime = this.creationTime;
        this.sendData.currentTime = this.currentTime;
        this.sendData.lastUpdate = this.lastUpdate;
        this.sendData.stepTime = this.stepTime;
        this.sendData.networkTime = this.networkTime;
        
        return this.sendData;
    };

    
    MODEL.Temporal.prototype.incrementTpf = function(tpf) {
        this.packetAge += tpf;
        this.tickDelta = tpf;
        this.currentTime += tpf;
    };
    
	MODEL.Temporal.prototype.getAge = function() {
        return this.currentTime - this.creationTime;
	};

    MODEL.Temporal.prototype.getPacketAge = function() {
        return this.packetAge;
    };

    MODEL.Temporal.prototype.getIdealTimeSlice = function() {
        return 1 / Math.min(this.networkTime, this.lifeTime)
    };

    MODEL.Temporal.prototype.getPacketTimeFraction = function() {
        return this.getPacketAge() * this.getIdealTimeSlice()
    };

    MODEL.Temporal.prototype.getOverdue = function() {
        return Math.floor(this.packetAge / this.networkTime)
    };

	MODEL.Temporal.prototype.predictUpdate = function(time) {
		this.timeDelta = time - this.lastUpdate;
        this.lastUpdate = this.currentTime;
		this.currentTime = time;

	};


	MODEL.InputState = function() {
        this.currentState = [0, 0]; // radial and distance sectors
		this.steering = new MATH.Vec3(0, 0, 0);
        this.yaw = 0;
		this.throttle = 0;
		this.trigger = false;
		this.triggerShield = false;
		this.playerName = "init";
	};

	MODEL.InputState.prototype.setTrigger = function(trigger) {
		this.trigger = trigger;
	};

	MODEL.InputState.prototype.getTrigger = function() {
		return this.trigger;
	};

	MODEL.InputState.prototype.setThrottle = function(throttle) {
		this.throttle = throttle;
	};

	MODEL.InputState.prototype.getThrottle = function() {
		return this.throttle;
	};

	MODEL.InputState.prototype.setSteeringX = function(x) {
		this.steering.setX(x);
	};

	MODEL.InputState.prototype.setSteeringY = function(y) {
		this.steering.setY(y);
	};

	MODEL.InputState.prototype.setSteeringZ = function(z) {
		this.steering.setZ(z);
	};
    

	MODEL.InputState.prototype.getSteering = function(vec) {
		vec.setVec(this.steering);
	};


})(MODEL);
