ServerPlayer = function(pieceType, clientId, client, simTime) {

	if (!client) {
		console.log("Bad Client!", clientId);
		return;
	}

	this.currentGridSector = null;
	
	this.id = clientId;
	this.client = client;
	this.clientId = clientId;

	this.configs = {};

	var piece;

	var broadcast = function(piecePacket) {
		if (!client) {
			console.log("Bad Client!", piece.id, piecePacket);
			return;
		}
		client.broadcastToVisible(piecePacket);
	};
	
	piece = new GAME.Piece(pieceType, this.id, simTime, Number.MAX_VALUE, broadcast);
	this.piece = piece;
	this.piece.teleportRandom();

	this.piece.networkDirty = true;
	this.piece.setName(clientId);
	client.attachPlayer(this);

    this.actionTimeout;

};


ServerPlayer.prototype.processPlayerInputUpdate = function(data, actionHandlers) {
	var _this = this;
	var fireActionCallback = function(action, value, moduleData) {
		if (typeof(actionHandlers[action]) == 'function') actionHandlers[action](_this.piece, action, value, moduleData);
		//	if (typeof(actionHandlers[action]) != 'function') console.log("No Handler:", action, value)
	};

	if (data.fire) {
		this.setInputTrigger(true, fireActionCallback);
		this.setInputTrigger(false);

		this.piece.setModuleState('hyper_drive', false);
		this.piece.processModuleStates();

		return;
	}




	if (data.vector) {
		this.setInputVector(data.vector.state);
		this.piece.networkDirty = true;
	}


    clearTimeout(this.actionTimeout);
    this.piece.setModuleState('warp_drive', false);


    for (var key in data) {
        if (key == 'shield') {
            console.log("Apply shields", data.shield);
            this.piece.setModuleState(key, data[key]);

            if (data[key] == true) {
                this.piece.setModuleState('hyper_drive', false);
				this.piece.processModuleStates();
            }

            this.piece.networkDirty = true;
        }

        if (key == 'hyper_drive') {
            console.log("Apply hyperDrive", data.hyper_drive);
            this.piece.setModuleState(key, data[key]);
            if (data[key] == true) {
                this.piece.setModuleState('shield', false);
            }
			this.piece.processModuleStates();
            this.piece.networkDirty = true;
        }

        if (key == 'warp_drive') {
            console.log("Apply warp_drive", data.warp_drive);
            this.piece.setModuleState(key, data[key]);
            if (data[key] != true) {

                clearTimeout(this.actionTimeout);

            } else {
                this.piece.setModuleState('hyper_drive', false);
                this.piece.setModuleState('shield', false);
                var piece = this.piece;

                this.actionTimeout = setTimeout(function () {


                piece.requestTeleport();
                piece.setModuleState('warp_drive', false);

                }, 2000);// Get data from module here

            }
            this.piece.processModuleStates();
            this.piece.networkDirty = true;

        }
        
    }


//	console.log("handlers: ", JSON.stringify(actionHandlers))
};

ServerPlayer.prototype.attachModule = function(attachmentPoint, moduleConfigs) {
	this.configs.modules.push(moduleConfigs[attachmentPoint.module]);
};

ServerPlayer.prototype.applyPieceConfig = function(pieceTypeConfigs) {
    if(!this.piece) {
        console.log('Bad Server Player');
        return
    }

	this.configs = pieceTypeConfigs;
};

ServerPlayer.prototype.makeAppearPacket = function() {
    var iAppearPacket = this.piece.makePacket();
    iAppearPacket.data.state = GAME.ENUMS.PieceStates.APPEAR;
    return iAppearPacket;
};

ServerPlayer.prototype.makeHidePacket = function() {
    var iHidePacket = this.piece.makePacket();
    iHidePacket.data.state = GAME.ENUMS.PieceStates.HIDE;
    return iHidePacket;

};

ServerPlayer.prototype.notifyCurrentGridSector = function(gridSector) {
    var visiblePre = [];
    var visiblePost = [];

    var playersAppear = [];
    var playersRemove = [];

	if (!gridSector) {
		this.piece.requestTeleport();
        return;
	}

	if (this.currentGridSector != gridSector) {
        gridSector.addPlayerToSector(this);

        if (this.currentGridSector) {
            this.currentGridSector.notifyPlayerLeave(this);
            this.currentGridSector.getVisiblePlayers(visiblePre);
        }

		this.currentGridSector = gridSector;
        this.currentGridSector.getVisiblePlayers(visiblePost);
        this.currentGridSector.notifyPlayerEnter(this);

        for (var i = 0; i < visiblePre.length; i++) {
            if (visiblePost.indexOf(visiblePre[i]) == -1) {
                playersRemove.push(visiblePre[i]);
            }
        }

        for (var i = 0; i < visiblePost.length; i++) {
            if (visiblePre.indexOf(visiblePost[i]) == -1) {
                if (visiblePost[i] != this) {
                    playersAppear.push(visiblePost[i]);
                }
            }
        }
        
        var iHidePacket = this.makeHidePacket();
        var iAppearPacket = this.makeHidePacket();

        for (var i = 0; i < playersRemove.length; i++) {
            playersRemove[i].client.sendToClient(iHidePacket);
            this.client.sendToClient(playersRemove[i].makeHidePacket());
        }

        for (var i = 0; i < playersAppear.length; i++) {
            playersAppear[i].client.sendToClient(iAppearPacket);
            this.client.sendToClient(playersAppear[i].makeAppearPacket());
        }

        this.client.setVisiblePlayers(visiblePost);

 //       console.log("Player diff APP, REM", playersAppear.length, playersRemove.length);

		return gridSector;
	}
    
};

ServerPlayer.prototype.makePacket = function() {
	return this.piece.makePacket();
};

ServerPlayer.prototype.setInputTrigger = function(bool, actionCallback) {
	this.piece.setInputTrigger(bool, actionCallback)
};

ServerPlayer.prototype.setInputVector = function(state) {
	this.piece.setInputVector(state)
};

ServerPlayer.prototype.updatePlayer = function(currentTime) {
	this.piece.processServerState(currentTime);

};