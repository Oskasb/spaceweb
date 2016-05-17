if(typeof(GAME) == "undefined"){
	/**
	 * @namespace Holds the functionality of the library
	 */
	GAME = {};
}

(function(GAME){

	GAME.ENUMS = {};

	GAME.ENUMS.ClientStates = {
		LOADING:'LOADING',
		READY:'READY',
		PLAYING:'PLAYING',
		PLAYER_REQUESTED:'PLAYER_REQUESTED'
	};

	GAME.Piece = function() {
		this.spatial = new MODEL.Spatial();
		this.targetSpatial = new MODEL.Spatial();
	};

	GAME.Piece.prototype.setPos = function(x, y, z) {
		this.spatial.setPosXYZ(x, y, z);
	};

	GAME.Piece.prototype.setVel = function(x, y, z) {
		this.spatial.setVelXYZ(x, y, z);
	};

	GAME.Piece.prototype.getPos = function() {
		this.spatial.getPosArray();
	};

	GAME.Piece.prototype.getVel = function() {
		this.spatial.getVelArray();
	};

})(GAME);
