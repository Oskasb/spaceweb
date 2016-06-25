ServerWorld = function() {
	this.players = {};
	this.playerCount = 0;
	this.pieces = [];
	this.stars = [];
	this.actionHandlers;
	this.pieceCount = 0;

	this.calcVec = new MATH.Vec3(0, 0, 0);

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

ServerWorld.prototype.notifyConfigsUpdated = function(config) {
    console.log("Module data updated...", config)

    for (var key in this.players) {
    //    this.players[key].applyPieceConfig(config[this.players[key].piece.type]);
        this.players[key].client.sendToClient({id:'updateGameData', data:{clientId:this.players[key].client.id, gameData:config}});
        this.players[key].client.notifyDataFrame();
    }

};

ServerWorld.prototype.pieceConfigsUpdated = function(config) {
	for (var key in this.players) {
		this.players[key].applyPieceConfig(config[this.players[key].piece.type]);
	//	this.players[key].client.sendToClient({id:'clientConnected', data:{clientId:this.players[key].client.id, pieceData:config}});
		this.players[key].client.notifyDataFrame();
	}
};


ServerWorld.prototype.spawnStars = function() {
	var Star = function(x, y, z) {
		this.pos = [x, y, z];
	};

	for (var i = 0; i < 20; i++) {
		this.stars.push(new Star(800 * (Math.random()-0.5), (Math.random()-0.5) * 800, Math.random() * -1500))
	}
};


ServerWorld.prototype.applyControlModule = function(sourcePiece, moduleData, action, value) {
    sourcePiece.pieceControls.setControlState(moduleData, action, value);
    sourcePiece.networkDirty = true;

};

ServerWorld.prototype.attachModules = function(conf, gameConfigs) {

    for (var i = 0; i < conf.attachment_points.length; i++) {
        conf.modules.push(gameConfigs.MODULE_DATA[conf.attachment_points[i].module])
    }

};


ServerWorld.prototype.addBullet = function(sourcePiece, cannonModuleData, now, bulletConfig, gameConfigs) {
    var _this = this;

	var apply = cannonModuleData.applies;
	this.pieceCount++;
	var bullet = new GAME.Piece('cannon_bullet', 'bullet_'+this.pieceCount, now, apply.lifeTime);
    bullet.registerParentPiece(sourcePiece);

    var conf = {};

    for (var key in bulletConfig) {
        conf[key] = bulletConfig[key];
    }
    conf.modules = [];

    this.attachModules(conf, gameConfigs);

	bullet.applyConfig(conf);
//	bullet.temporal.timeDelta = dt;
    bullet.spatial.setSpatial(sourcePiece.spatial);

    this.calcVec.setVec(sourcePiece.spatial.vel);
    this.calcVec.scale(sourcePiece.temporal.stepTime * 3);

    bullet.spatial.pos.addVec(this.calcVec);

	this.calcVec.setArray(apply.transform.pos);

	this.calcVec.rotateZ(sourcePiece.spatial.rot[0]);

	bullet.spatial.pos.addVec(this.calcVec);

    bullet.setState(GAME.ENUMS.PieceStates.SPAWN);

    bullet.spatial.rotVel[0] = 0;
    bullet.spatial.rot[0] += sourcePiece.spatial.rotVel[0] * sourcePiece.temporal.stepTime * 3;

    bullet.pieceControls.actions.applyForward = apply.exitVelocity;
    bullet.applyForwardControl(MODEL.ReferenceTime);
    this.broadcastPieceState(bullet);

    bullet.setState(GAME.ENUMS.PieceStates.MOVING);
  //  bullet.spatial.vel.addVec(sourcePiece.spatial.vel);

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
	if (!packet) console.log("Bad Packet?", piece);
	this.clients.broadcastToAllClients(packet);

    if (piece.getState() == GAME.ENUMS.PieceStates.EXPLODE) {
        piece.setState(GAME.ENUMS.PieceStates.TIME_OUT);
        this.removePiece(piece);
    }

};

ServerWorld.prototype.updateWorldPiece = function(piece, currentTime) {
	piece.processTemporalState(currentTime);
	piece.spatial.updateSpatial(piece.temporal.stepTime);

/*
    if (piece.networkDirty) {
        this.broadcastPieceState(piece);
        piece.networkDirty = false;
    }
*/
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
	this.playerCount = 0;
	for (var key in this.players) {
		this.players[key].piece.processServerState(currentTime);
		this.players[key].client.notifyDataFrame();
		this.playerCount++;
	}
};


ServerWorld.prototype.tickSimulationWorld = function(currentTime) {

    this.updatePieces(currentTime);
    this.updatePlayers(currentTime);
    this.serverPieceProcessor.checkProximity(this.players, this.pieces);
    
};


ServerWorld.prototype.tickNetworkWorld = function() {

    for (var key in this.players) {
        if (this.players[key].piece.spatial.vel.getLength() + Math.abs(this.players[key].piece.spatial.rotVel) > 0.4) {
			this.players[key].piece.networkDirty = true;
    //        this.broadcastPieceState(this.players[key].piece);
        }

    }

    for (var i = 0; i < this.pieces.length; i++) {
        if (this.pieces[i].spatial.vel.getLength() + Math.abs(this.pieces[i].spatial.rotVel) > 0.1) {

   //        this.broadcastPieceState(this.pieces[i]);
        }
    }

};