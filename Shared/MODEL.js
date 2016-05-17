if(typeof(MODEL) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	MODEL = {};
}

(function(MODEL){

	MODEL.ENUMS = {};

	MODEL.ENUMS.PieceStates = {
		MOVING:'MOVING',
		TELEPORT:'TELEPORT',
		KILLED:'KILLED',
		REMOVED:'REMOVED'
	};

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

	MODEL.Spatial.prototype.getSendSpatial = function() {
		this.pos.getArray(this.sendData.pos);
		this.vel.getArray(this.sendData.vel);
		this.rot.getArray(this.sendData.rot);
		return this.sendData;
	};

	MODEL.Spatial.prototype.setRotZ = function(z) {
		this.rot[2] = z;
	};

	MODEL.Spatial.prototype.getRotZ = function() {
		return this.rot[2];
	};

	MODEL.Spatial.prototype.setPosXYZ = function(x, y, z) {
		this.pos[0] = x;
		this.pos[1] = y;
		this.pos[2] = z;
	};

	MODEL.Spatial.prototype.getPosArray = function() {
		return this.pos;
	};

	MODEL.Spatial.prototype.setRotXYZ = function(x, y, z) {
		this.rot[0] = x;
		this.rot[1] = y;
		this.rot[2] = z;
	};

	MODEL.Spatial.prototype.getRotArray = function() {
		return this.rot;
	};

	MODEL.Spatial.prototype.setVelXYZ = function(x, y, z) {
		this.vel[0] = x;
		this.vel[1] = y;
		this.vel[2] = z;
	};

	MODEL.Spatial.prototype.getVelArray = function() {
		return this.vel;
	};


})(MODEL);
