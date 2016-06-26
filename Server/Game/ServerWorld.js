ServerWorld = function(sectorGrid) {
    this.sectorGrid = sectorGrid;
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

ServerWorld.prototype.buildPieceData = function(pieceType, gameConfigs) {

    var config = {};

    for (var key in gameConfigs.PIECE_DATA[pieceType]) {
        config[key] = gameConfigs.PIECE_DATA[pieceType][key];
    }

    config.modules = [];

    this.attachModules(config, gameConfigs);

    return config;
};


ServerWorld.prototype.notifyConfigsUpdated = function(gameConfigs) {
 //   console.log("Module data updated...", gameConfigs.PIECE_DATA);

    for (var key in this.players) {

        if (gameConfigs.PIECE_DATA) {
            this.players[key].applyPieceConfig(this.buildPieceData(this.players[key].piece.type, gameConfigs));
        }

        console.log("Notify player...", key)
        this.players[key].client.sendToClient({id:'updateGameData', data:{clientId:this.players[key].client.id, gameData:gameConfigs}});
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
        var module = {};
        var ap = conf.attachment_points[i];
        var config = gameConfigs.MODULE_DATA[ap.module];

        for (var key in config) {
            module[key] = config[key];
        }

        for (key in ap) {
            module[key] = ap[key];
        }

        conf.modules.push(module);
    }

};


ServerWorld.prototype.addBullet = function(sourcePiece, cannonModuleData, now, pieceData, gameConfigs) {
    this.pieceCount++;

	var apply = cannonModuleData.applies;
    var bulletConfig = pieceData[apply.bullet];


	var bullet = new GAME.Piece(apply.bullet, apply.bullet+' '+this.pieceCount, now, apply.lifeTime);
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

	this.calcVec.setArray(cannonModuleData.transform.pos);

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
    this.players[playerId].currentGridSector.notifyPlayerLeave(this.players[playerId]);
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

    if (!piece.recipients) {
        piece.recipients = [];
    }
    
    this.sectorGrid.broadcastToGridSector(piece.spatial, packet, piece.recipients);

//	this.clients.broadcastToAllClients(packet);

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


ServerWorld.prototype.updateSectorStatus = function(player) {
    var sector = player.notifyCurrentGridSector(this.sectorGrid.getGridSectorForSpatial(player.piece.spatial));

    if (sector) {
        console.log("Sector change", sector.row, sector.column);
    }

};

ServerWorld.prototype.updatePlayers = function(currentTime) {
	this.playerCount = 0;
	for (var key in this.players) {
		this.players[key].piece.processServerState(currentTime);

        this.updateSectorStatus(this.players[key]);

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
    //    if (this.players[key].piece.spatial.vel.getLength() + Math.abs(this.players[key].piece.spatial.rotVel) > 0.01) {
			this.players[key].piece.networkDirty = true;
    //    }
    }

    for (var i = 0; i < this.pieces.length; i++) {
        if (this.pieces[i].spatial.vel.getLength() + Math.abs(this.pieces[i].spatial.rotVel) > 0.1) {

        }
    }

};