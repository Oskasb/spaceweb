ServerWorld = function() {
	this.stars = [];
};

ServerWorld.prototype.initWorld = function() {

	var Star = function(x, y, z) {
		this.pos = [x, y, z];
	};


	for (var i = 0; i < 100; i++) {
		this.stars.push(new Star(Math.random() * 100, Math.random() * 100,Math.random() * 100))
	}
};

ServerWorld.prototype.fetch = function(data) {
	console.log("returning stars")
	return this.stars;
};