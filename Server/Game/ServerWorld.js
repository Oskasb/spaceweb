ServerWorld = function() {
	this.players = {};
	this.pieces = [];
	this.stars = [];
	this.actionHandlers;
	this.pieceCount = 0;
	this.pieceConfigs;

    var _this = this;
    var broadcast = function(piece) {
        _this.broadcastPieceState(piece);
    };

    this.serverPieceProcessor = new ServerPieceProcessor(broadcast);
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


ServerWorld.prototype.applyControlModule = function(sourcePiece, moduleData, action, value) {
    sourcePiece.pieceControls.setControlState(moduleData, action, value);
    sourcePiece.networkDirty = true;

};


ServerWorld.prototype.addBullet = function(sourcePiece, cannonModuleData, now, dt, tpf) {
    var _this = this;

	var apply = cannonModuleData.applies;
	this.pieceCount++;
	var bullet = new GAME.Piece('bullet_'+this.pieceCount, now, apply.lifeTime);
    bullet.registerParentPiece(sourcePiece);
	bullet.applyConfig(this.pieceConfigs.cannon_bullet);
//	bullet.temporal.timeDelta = dt;
  //  bullet.spatial.setSpatial(sourcePiece.spatial);
    bullet.spatial.pos.setVec(sourcePiece.spatial.pos);

    bullet.setState(GAME.ENUMS.PieceStates.SPAWN);

    bullet.spatial.rotVel[0] = 0;
    bullet.spatial.rot[0] = sourcePiece.spatial.rot[0];

    bullet.pieceControls.actions.applyForward = apply.exitVelocity;
    bullet.applyForwardControl(MODEL.ReferenceTime);
    this.broadcastPieceState(bullet);

    bullet.setState(GAME.ENUMS.PieceStates.MOVING);
    bullet.spatial.vel.addVec(sourcePiece.spatial.vel);

	this.pieces.push(bullet);
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

    if (piece.getState() == GAME.ENUMS.PieceStates.EXPLODE) {
        piece.setState(GAME.ENUMS.PieceStates.TIME_OUT);
        this.removePiece(piece);
    }

};

ServerWorld.prototype.updateWorldPiece = function(piece, currentTime) {
	piece.processTemporalState(currentTime);
	piece.spatial.update(piece.temporal.stepTime);

    if (piece.networkDirty) {
        this.broadcastPieceState(piece);
        piece.networkDirty = false;

    }

};


ServerWorld.prototype.updatePieces = function(currentTime) {
	var timeouts = [];

	for (var i = 0; i < this.pieces.length; i++) {
		this.updateWorldPiece(this.pieces[i], currentTime);
		if (this.pieces[i].getState() == GAME.ENUMS.PieceStates.TIME_OUT) {
			timeouts.push(this.pieces[i]);
		}
	}

	for (var i = 0; i < timeouts.length; i++) {
		this.removePiece(timeouts[i]);
	}
};

ServerWorld.prototype.updatePlayers = function(currentTime) {
	for (var key in this.players) {
		this.players[key].piece.processServerState(currentTime);        
	}
};


ServerWorld.prototype.tickSimulationWorld = function(currentTime) {
    var _this  = this;

    this.updatePieces(currentTime);
    this.updatePlayers(currentTime);
    this.serverPieceProcessor.checkProximity(this.players, this.pieces);
    
};


ServerWorld.prototype.tickNetworkWorld = function() {

    for (var key in this.players) {
        if (this.players[key].piece.spatial.vel.getLength() + Math.abs(this.players[key].piece.spatial.rotVel) > 0.1) {
            this.broadcastPieceState(this.players[key].piece);
        }

    }

    for (var i = 0; i < this.pieces.length; i++) {
        if (this.pieces[i].spatial.vel.getLength() + Math.abs(this.pieces[i].spatial.rotVel) > 0.1) {
            this.broadcastPieceState(this.pieces[i]);
        }
    }

};