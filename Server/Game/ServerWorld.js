ServerWorld = function() {
	this.players = {};
	this.pieces = [];
	this.stars = [];
	this.actionHandlers
	this.pieceCount = 0;
	this.pieceConfigs;
};

ServerWorld.prototype.initWorld = function(clients) {
	this.clients = clients;
	this.spawnStars();
};

ServerWorld.prototype.pieceConfigsUpdated = function(config) {
	this.pieceConfigs = config;
	for (var key in this.players) {
		this.players[key].applyPieceConfig(config.player_ship);
	}
};


ServerWorld.prototype.spawnStars = function() {
	var Star = function(x, y, z) {
		this.pos = [x, y, z];
	};

	for (var i = 0; i < 60; i++) {
		this.stars.push(new Star(Math.random() * 100, Math.random() * 100,Math.random() * 100))
	}
};

ServerWorld.prototype.addBullet = function(sourcePiece, cannonModuleData, now, dt, tpf) {

	var apply = cannonModuleData.applies;
	this.pieceCount++;
	var bullet = new GAME.Piece('bullet_'+this.pieceCount, now, apply.lifeTime);

	bullet.applyConfig(this.pieceConfigs.cannon_bullet);
	bullet.temporal.timeDelta = dt;

	bullet.spatial.interpolateTowards(sourcePiece.startSpatial, sourcePiece.targetSpatial, sourcePiece.temporal.getFraction(dt));
	
	bullet.spatial.rotVel[0] =  0;
	bullet.pieceControls.actions.applyForward = apply.exitVelocity;
	bullet.applyForwardControl(1);

	this.broadcastPieceState(bullet);

	this.pieces.push(bullet);
return
	if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
		timeouts.push(this.pieces[i]);
	} else {
		this.pieces[i].spatial.update();
		this.broadcastPieceState(this.pieces[i]);
	}
	// bullet.processTemporalState(bullet.temporal.timeDelta, bullet.temporal.creationTime);


	
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
	this.clients.broadcastToAllClients(packet);
};

ServerWorld.prototype.updateWorldPiece = function(piece, timeDelta) {
	piece.processTemporalState(timeDelta);
	piece.spatial.update();
};


ServerWorld.prototype.updatePieces = function(timeDelta) {
	var timeouts = [];

	for (var i = 0; i < this.pieces.length; i++) {
		this.updateWorldPiece(this.pieces[i], timeDelta);
		if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
			timeouts.push(this.pieces[i]);
		} else {
			this.broadcastPieceState(this.pieces[i]);
		}
	}

	for (var i = 0; i < timeouts.length; i++) {
		this.removePiece(timeouts[i]);
	}
};

ServerWorld.prototype.updatePlayers = function(timeDelta) {
	for (var key in this.players) {
		this.players[key].piece.processTemporalState(timeDelta);
		this.players[key].piece.processModuleStates();
		this.players[key].piece.processSpatialState(timeDelta);
		this.broadcastPieceState(this.players[key].piece);
	}
};


ServerWorld.prototype.tickWorld = function(timeDelta) {

	this.updatePieces(timeDelta);
	this.updatePlayers(timeDelta);

};