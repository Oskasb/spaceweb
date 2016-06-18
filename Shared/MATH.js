if(typeof(MATH) == "undefined"){
	MATH = {};
}

(function(){Math.clamp=function(a,b,c){return Math.max(b,Math.min(c,a));}})();

(function(MATH){

	MATH.TWO_PI = 2.0 * Math.PI;

	
	
	MATH.moduloPositive = function (value, size) {
		var wrappedValue = value % size;
		wrappedValue += wrappedValue < 0 ? size : 0;
		return wrappedValue;
	};

	MATH.lineDistance = function(fromX, fromY, toX, toY) {
		return Math.sqrt((fromX - toX)*(fromX - toX) + (fromY - toY)*(fromY - toY));
	};

	MATH.angleInsideCircle = function(angle) {
		if (angle < 0) angle+= MATH.TWO_PI;
		if (angle > MATH.TWO_PI) angle-= MATH.TWO_PI;
		return angle;
	};
	
	MATH.radialLerp = function(a, b, w) {
		var cs = (1-w)*Math.cos(a) + w*Math.cos(b);
		var sn = (1-w)*Math.sin(a) + w*Math.sin(b);
		return Math.atan2(sn,cs);
	};
	
	MATH.radialToVector = function(angle, distance, store) {
		store.data[0] = Math.cos(angle)*distance;
		store.data[1] = Math.sin(angle)*distance;
	};

	MATH.radialClamp = function(value, min, max) {

		var zero = (min + max)/2 + ((max > min) ? Math.PI : 0);
		var _value = MATH.moduloPositive(value - zero, MATH.TWO_PI);
		var _min = MATH.moduloPositive(min - zero, MATH.TWO_PI);
		var _max = MATH.moduloPositive(max - zero, MATH.TWO_PI);

		if (value < 0 && min > 0) { min -= MATH.TWO_PI; }
		else if (value > 0 && min < 0) { min += MATH.TWO_PI; }
		if (value > MATH.TWO_PI && max < MATH.TWO_PI) { max += MATH.TWO_PI; }

		return _value < _min ? min : _value > _max ? max : value;
	};

	

	MATH.Vec3 = function(x,y,z){
		this.data = new Float32Array([x,y,z]);
	};

	MATH.Vec3.prototype.setXYZ = function(x, y, z) {
		this.data[0] = x;
		this.data[1] = y;
		this.data[2] = z;
		return this;
	};

	MATH.Vec3.prototype.setX = function(x) {
		this.data[0] = x;
		return this;
	};

	MATH.Vec3.prototype.setY = function(y) {
		this.data[1] = y;
		return this;
	};

	MATH.Vec3.prototype.setZ = function(z) {
		this.data[2] = z;
		return this;
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
		return this;
	};

	MATH.Vec3.prototype.addVec = function(vec3) {
		this.data[0] += vec3.data[0];
		this.data[1] += vec3.data[1];
		this.data[2] += vec3.data[2];
		return this;
	};

	MATH.Vec3.prototype.subVec = function(vec3) {
		this.data[0] -= vec3.data[0];
		this.data[1] -= vec3.data[1];
		this.data[2] -= vec3.data[2];
		return this;
	};

	MATH.Vec3.prototype.interpolateFromTo = function(start, end, fraction) {
		calcVec3.setVec(end);
		calcVec3.subVec(start).scale(fraction);
		this.setVec(start).addVec(calcVec3);
		return this;
	};




	MATH.Vec3.prototype.radialLerp = function(start, end, frac) {
		this.data[0] = MATH.radialLerp(start.data[0], end.data[0], frac);
		this.data[1] = MATH.radialLerp(start.data[1], end.data[1], frac);
		this.data[2] = MATH.radialLerp(start.data[2], end.data[2], frac);
	};


	MATH.Vec3.prototype.scale = function(scale) {
		this.data[0] *= scale;
		this.data[1] *= scale;
		this.data[2] *= scale;
		return this;
	};

	MATH.Vec3.prototype.getLength = function() {
		return Math.sqrt((this.data[0] * this.data[0]) + (this.data[1] * this.data[1]) + (this.data[2] * this.data[2]));
	};

	var calcVec3 = new MATH.Vec3(0, 0, 0);

})(MATH);