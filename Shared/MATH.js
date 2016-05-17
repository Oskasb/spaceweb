if(typeof(MATH) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	MATH = {};
}

(function(MATH){


	MATH.Vec2 = function(x, y) {
		this.data = new Float32Array([x, y]);
	};

	MATH.Vec2.prototype.setXY = function(x, y) {
		this.data[0] = x;
		this.data[1] = y;
	};

	MATH.Vec2.prototype.setX = function(x) {
		this.data[0] = x;
	};

	MATH.Vec2.prototype.setY = function(y) {
		this.data[1] = y;
	};

	MATH.Vec2.prototype.setVec = function(vec2) {
		this.data[0] = vec2.data[0];
		this.data[1] = vec2.data[1];
	};

	MATH.Vec2.prototype.getArray = function(array) {
		array[0] = this.data[0];
		array[1] = this.data[1];
	};

	MATH.Vec2.prototype.addVec = function(vec2) {
		this.data[0] += vec2.data[0];
		this.data[1] += vec2.data[1];
	};

	MATH.Vec2.prototype.subVec = function(vec2) {
		this.data[0] -= vec2.data[0];
		this.data[1] -= vec2.data[1];
	};

	MATH.Vec2.prototype.scale = function(scale) {
		this.data[0] *= scale;
		this.data[1] *= scale;
	};

	MATH.Vec2.prototype.getLength = function() {
		return Math.sqrt((this.data[0] * this.data[0]) + (this.data[1] * this.data[1]));
	};

	MATH.Vec2.prototype.normalize = function() {
		var iLen = 1 / this.getLength();
		this.data[0] *=  iLen;
		this.data[1] *=  iLen;
	};

	MATH.Vec3 = function(x,y,z){
		this.data = new Float32Array([x,y,z]);
	};

	MATH.Vec3.prototype.setXYZ = function(x, y, z) {
		this.data[0] = x;
		this.data[1] = y;
		this.data[2] = z;
	};

	MATH.Vec3.prototype.setX = function(x) {
		this.data[0] = x;
	};

	MATH.Vec3.prototype.setY = function(y) {
		this.data[1] = y;
	};

	MATH.Vec3.prototype.setZ = function(z) {
		this.data[2] = z;
	};

	MATH.Vec3.prototype.getX = function() {
		return this.data[0];
	};

	MATH.Vec3.prototype.getY = function() {
		return this.data[1];
	};

	MATH.Vec3.prototype.getZ = function() {
		return this.data[2];
	};

	MATH.Vec3.prototype.getArray = function(array) {
		array[0] = this.data[0];
		array[1] = this.data[1];
		array[2] = this.data[2];
	};

	MATH.Vec3.prototype.setVec = function(vec3) {
		this.data[0] = vec3.data[0];
		this.data[1] = vec3.data[1];
		this.data[2] = vec3.data[2];
	};

	MATH.Vec3.prototype.addVec = function(vec3) {
		this.data[0] += vec3.data[0];
		this.data[1] += vec3.data[1];
		this.data[2] += vec3.data[2];
	};

	MATH.Vec3.prototype.subVec = function(vec3) {
		this.data[0] -= vec3.data[0];
		this.data[1] -= vec3.data[1];
		this.data[2] -= vec3.data[2];
	};

	MATH.Vec3.prototype.scale = function(scale) {
		this.data[0] *= scale;
		this.data[1] *= scale;
		this.data[2] *= scale;
	};

	MATH.Vec3.prototype.getLength = function() {
		return Math.sqrt((this.data[0] * this.data[0]) + (this.data[1] * this.data[1]) + (this.data[2] * this.data[2]));
	};


})(MATH);