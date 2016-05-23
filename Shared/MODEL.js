if(typeof(MODEL) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	MODEL = {};
}

(function(MODEL){
	
	var calcVec = new MATH.Vec3(0, 0, 0);
	
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

	MODEL.Spatial.prototype.interpolateTowards = function(start, target, fraction) {
		this.pos.interpolateFromTo(start.pos, target.pos, fraction);
		this.vel.interpolateFromTo(start.vel, target.vel, fraction);
		this.rot[0] = MATH.radialLerp(start.rot[0], target.rot[0], fraction);
		this.rotVel[0] = MATH.radialLerp(start.rotVel[0], target.rotVel[0], fraction);
	};
	
	
	MODEL.Spatial.prototype.setSendData = function(sendData) {
		this.pos.setXYZ(sendData.pos[0] , sendData.pos[1], sendData.pos[2]);
		this.vel.setXYZ(sendData.vel[0] , sendData.vel[1], sendData.vel[2]);
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

	MODEL.Spatial.prototype.applySteeringVector = function(steerVec, dt, rotVelClamp, radialLerp) {
		this.rotVel[0] = steerVec.data[2];
		this.rotVel[0]-= this.rot[0];

		this.rotVel[0] = MATH.radialClamp(this.rotVel[0], -rotVelClamp, rotVelClamp);

		this.rotVel[0] = MATH.radialLerp(this.rotVel[0], steerVec.data[2], dt*radialLerp);

	};

	MODEL.Spatial.prototype.getForwardVector = function(vec3) {
		vec3.setXYZ(Math.cos(this.rot[0] -Math.PI*0.5), Math.sin(this.rot[0] -Math.PI*0.5), 0);
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


	MODEL.Spatial.prototype.addVelVec = function(velVec) {
		this.vel.addVec(velVec);
	};

	MODEL.Spatial.prototype.update = function() {
		this.pos.addVec(this.vel);
		this.rot[0] += this.rotVel[0];
	};

	MODEL.Spatial.prototype.isWithin = function(xMin, xMax, yMin, yMax) {
		return this.pos.getX() < xMin || this.pos.getX() > xMax || this.pos.getY() < yMin || this.pos.getY() > yMax;
	};

	MODEL.Temporal = function(creationTime, lifeTime) {
		this.lifeTime = lifeTime || Number.MAX_VALUE;
		this.creationTime = creationTime;
		this.maxTickTime = 1;
		this.minTickTime = 0.001;
		this.timeDelta = 0.0001;
		this.tickCountUp = 0;
		this.fraction = 0.0001;
	};

	MODEL.Temporal.prototype.getFraction = function(tpf) {
		this.tickCountUp += tpf;
		this.fraction = (this.timeDelta / ( this.timeDelta / this.tickCountUp)) / this.timeDelta;
		return this.fraction;
	};

	MODEL.Temporal.prototype.predictUpdate = function(time) {
		this.lifeTime -= time;
		this.timeDelta = time;
		this.tickCountUp = 0;
	};


	MODEL.InputState = function() {
		this.steering = new MATH.Vec3(0, 0, 0);
		this.throttle = 0;
		this.trigger = false;
		this.initiate = true;
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

	MODEL.InputState.prototype.getSteeringAmplitude = function() {
		return this.steering.getLength();
	};

	MODEL.InputState.prototype.getSteering = function(vec) {
		vec.setVec(this.steering);
	};


})(MODEL);
