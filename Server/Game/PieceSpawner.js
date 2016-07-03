PieceSpawner = function(serverWorld) {
    this.serverWorld = serverWorld;
    this.pieceData = null;
    this.pieceCount = 0;
    this.calcVec = new MATH.Vec3(0, 0, 0);
    this.gameConfigs;
};


PieceSpawner.prototype.setupPieceConfigs = function(pieceData) {
    this.pieceData = pieceData;
};

PieceSpawner.prototype.notifyConfigsUpdated = function(gameConfigs, players) {
    //   console.log("Module data updated...", gameConfigs.PIECE_DATA);

    for (var key in players) {

        if (gameConfigs.PIECE_DATA) {
            players[key].applyPieceConfig(this.buildPieceData(players[key].piece.type, gameConfigs));
        }

        console.log("Notify player...", key)
        players[key].client.sendToClient({id:'updateGameData', data:{clientId:players[key].client.id, gameData:gameConfigs}});
        players[key].client.notifyDataFrame();
    }
};

PieceSpawner.prototype.buildPieceData = function(pieceType, gameConfigs) {

    var config = {};

    for (var key in gameConfigs.PIECE_DATA[pieceType]) {
        config[key] = gameConfigs.PIECE_DATA[pieceType][key];
    }

    config.modules = [];

    return config;
};



PieceSpawner.prototype.addAttachmentPoints = function(piece, conf, gameConfigs) {
    for (var i = 0; i < conf.attachment_points.length; i++) {
        new ServerAttachmentPoint(piece, conf.attachment_points[i], i, conf, gameConfigs)
    }
};



PieceSpawner.prototype.spawnPlayerPiece = function(client, data, clients, simulationTime, gameConfigs) {
    this.pieceCount++;
    this.gameConfigs = gameConfigs;
    
    var player = this.serverWorld.getPlayer(data.clientId);
    if (player) {
        console.log("Player already registered", data.clientId);
    } else {
        player = new ServerPlayer('player_ship', data.clientId, clients.getClientById(data.clientId), simulationTime);
    }
    player.piece.setName(data.name);
    
    var config = this.buildPieceData(player.piece.type, gameConfigs);

    player.applyPieceConfig(config);
    player.piece.applyConfig(config);


    this.addAttachmentPoints(player.piece, config, gameConfigs);

    return player;
};


PieceSpawner.prototype.spawnWorldPiece = function(pieceType, posx, posy, rot, rotVel) {
    this.pieceCount++;
    
    var piece = new GAME.Piece(pieceType, pieceType+' '+this.pieceCount, new Date().getTime(), Number.MAX_VALUE);
    var config = this.buildPieceData(pieceType, this.gameConfigs);

    piece.applyConfig(config);

    this.addAttachmentPoints(piece, config, this.gameConfigs);

    piece.setState(GAME.ENUMS.PieceStates.SPAWN);
    piece.spatial.pos.setXYZ(posx, posy, 0);
    piece.spatial.rot[0] = rot;
    piece.spatial.rotVel[0] = rotVel;
    return piece;
    
};



PieceSpawner.prototype.spawnBullet = function(sourcePiece, cannonModuleData, now, pieceData, gameConfigs) {
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


    bullet.applyConfig(conf);

    this.addAttachmentPoints(bullet, conf, gameConfigs);


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
    return bullet;

};


