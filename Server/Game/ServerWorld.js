ServerWorld = function() {
	this.players = {};
	this.pieces = [];
	this.stars = [];
	this.actionHandlers
	this.pieceCount = 0;
};

ServerWorld.prototype.initWorld = function(actionHandlers) {
	this.spawnStars();
	this.actionHandlers = actionHandlers;
};

ServerWorld.prototype.pieceConfigsUpdated = function(config) {
	for (var key in this.players) {
		this.players[key].applyPieceConfig(config.player_ship);
	}
};


ServerWorld.prototype.spawnStars = function() {
	var Star = function(x, y, z) {
		this.pos = [x, y, z];
	};

	for (var i = 0; i < 10; i++) {
		this.stars.push(new Star(Math.random() * 100, Math.random() * 100,Math.random() * 100))
	}
};

ServerWorld.prototype.addBullet = function(sourcePiece, cannonModuleData) {
	var apply = cannonModuleData.applies
	this.pieceCount++;
	var bullet = new GAME.Piece('bullet_'+this.pieceCount, new Date().getTime() * 0.001, apply.lifeTime);
	bullet.spatial.setSpatial(sourcePiece.spatial);
	bullet.pieceControls.actions.applyForward = apply.exitVelocity;
	bullet.applyForwardControl(1);
	this.pieces.push(bullet);
	this.broadcastPieceState(bullet);
	// bullet.processTemporalState(bullet.temporal.timeDelta, bullet.temporal.creationTime);

	bullet.spatial.getRotVelVec().scale(0);

	return;
	this.updateWorldPiece(bullet, bullet.temporal.minTickTime);

	var _this = this;

	var futureTick = function(delay) {
		_this.updateWorldPiece(bullet, delay);

	};

	setTimeout(function() {
		futureTick(apply.lifeTime)
	}, bullet.temporal.maxTickTime * 1000);

};

ServerWorld.prototype.getPlayer = function(playerId) {
	return this.players[playerId];
};

ServerWorld.prototype.addPlayer = function(player) {
	this.players[player.id] = player;
};

ServerWorld.prototype.removePlayer = function(playerId) {
	delete this.players[playerId];
};

ServerWorld.prototype.removePiece = function(piece) {
	this.pieces.splice(this.pieces.indexOf(piece), 1);
	this.broadcastPieceState(piece);
};

ServerWorld.prototype.fetch = function(data) {
	return this.stars;
};

ServerWorld.prototype.broadcastPieceState = function(piece) {
	var packet = piece.makePacket();

	for (var key in this.players) {
		this.players[key].client.broadcastToAll(packet);
	}
};

ServerWorld.prototype.updateWorldPiece = function(piece, timeDelta) {
	piece.processTemporalState(timeDelta);

	if (piece.getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
		this.removePiece(piece);
	} else {
		piece.spatial.update();
		this.broadcastPieceState(piece);
	}

};

ServerWorld.prototype.tickWorld = function(timeDelta) {

		var timeouts = [];

	for (var i = 0; i < this.pieces.length; i++) {
		this.pieces[i].processTemporalState(timeDelta);
		
		if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
			timeouts.push(this.pieces[i]);
		} else {
			this.pieces[i].spatial.update();
			this.broadcastPieceState(this.pieces[i]);
		}
		
	}

	for (var i = 0; i < timeouts.length; i++) {
		this.removePiece(timeouts[i]);
	}

	for (var key in this.players) {
		this.players[key].piece.processTemporalState(timeDelta);
		this.players[key].piece.processModuleStates();
		this.players[key].piece.processSpatialState(timeDelta);
		this.broadcastPieceState(this.players[key].piece);
	}
};