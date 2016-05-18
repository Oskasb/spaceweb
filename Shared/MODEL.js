if(typeof(MODEL) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	MODEL = {};
}

(function(MODEL){

	MODEL.Spatial = function() {
		this.sendData = {
			pos:[0, 0, 0],
			vel:[0, 0, 0],
			rot:[0, 0, 0]
		};
		this.pos = new MATH.Vec3(0, 0, 0);
		this.vel = new MATH.Vec3(0, 0, 0);
		this.rot = new MATH.Vec3(0, 0, 0);
	};

	MODEL.Spatial.prototype.interpolateTowards = function(start, target, fraction) {
		this.pos.interpolateFromTo(start.pos, target.pos, fraction);
		this.vel.interpolateFromTo(start.vel, target.vel, fraction);
		this.rot.radialLerp(start.rot, target.rot, fraction);
	};

	MODEL.Spatial.prototype.setSendData = function(sendData) {
		this.pos.setXYZ(sendData.pos[0] , sendData.pos[1], sendData.pos[2]);
		this.vel.setXYZ(sendData.vel[0] , sendData.vel[1], sendData.vel[2]);
		this.rot.setXYZ(sendData.rot[0] , sendData.rot[1], sendData.rot[2]);
	};

	MODEL.Spatial.prototype.getSendSpatial = function() {
		this.pos.getArray(this.sendData.pos);
		this.vel.getArray(this.sendData.vel);
		this.rot.getArray(this.sendData.rot);
		return this.sendData;
	};

	MODEL.Spatial.prototype.setSpatial = function(spatial) {
		this.pos.setVec(spatial.pos);
		this.vel.setVec(spatial.vel);
		this.rot.setVec(spatial.rot);
	};

	MODEL.Spatial.prototype.stop = function() {
		this.vel.scale(0);
	};

	MODEL.Spatial.prototype.accelerate = function(factor) {
		this.vel.scale(factor);
	};

	MODEL.Spatial.prototype.setRotVec = function(vec) {
		this.rot.setVec(vec);
	};

	MODEL.Spatial.prototype.setRotZ = function(z) {
		this.rot[2] = z;
	};

	MODEL.Spatial.prototype.getRotZ = function() {
		return this.rot[2];
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

	MODEL.Spatial.prototype.posZ = function() {
		return this.pos.getZ();
	};

	MODEL.Spatial.prototype.setRotXYZ = function(x, y, z) {
		this.rot.setXYZ(x, y, z);
	};

	MODEL.Spatial.prototype.getRotArray = function(array) {
		this.rot.getArray(array);
	};

	MODEL.Spatial.prototype.setVelXYZ = function(x, y, z) {
		this.vel.setXYZ(x, y, z);
	};

	MODEL.Spatial.prototype.getVelArray = function(array) {
		this.vel.getArray(array);
	};

	MODEL.Spatial.prototype.setVelVec = function(velVec) {
		this.vel.setVec(velVec);
	};

	MODEL.Spatial.prototype.addVelVec = function(velVec) {
		this.vel.addVec(velVec);
	};

	MODEL.Spatial.prototype.update = function() {
		this.pos.addVec(this.vel);
	};

	MODEL.Spatial.prototype.isWithin = function(xMin, xMax, yMin, yMax) {
		return this.pos.getX() < xMin || this.pos.getX() > xMax || this.pos.getY() < yMin || this.pos.getY() > yMax;
	};

	MODEL.Temporal = function(creationTime) {
		this.creationTime = creationTime;
		this.simulationTime = this.creationTime;
		this.timeDelta = 1;
		this.tickCountUp = 1;
		this.fraction = 1;
	};

	MODEL.Temporal.prototype.getFraction = function(tpf) {
		this.tickCountUp += tpf;
		this.fraction = (this.timeDelta / ( this.timeDelta / this.tickCountUp)) / this.timeDelta;
		return this.fraction;
	};

	MODEL.Temporal.prototype.predictUpdate = function(time) {
		this.simulationTime += time;
		this.timeDelta = time;
		this.tickCountUp = 0;
	};


	MODEL.InputState = function() {
		this.steering = new MATH.Vec3(0, 0, 0);
		this.throttle = 0;
		this.turnTarget = 0;
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
