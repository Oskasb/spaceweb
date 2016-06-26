ServerPlayer = function(pieceType, clientId, client, simTime) {

	if (!client) {
		console.log("Bad Client!", clientId);
		return;
	}

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
		client.broadcastToAll(piecePacket);
	};
	
	piece = new GAME.Piece(pieceType, this.id, simTime, Number.MAX_VALUE, broadcast);
	this.piece = piece;
	this.piece.teleportRandom();

	this.piece.networkDirty = true;
	this.piece.setName(clientId);
	client.attachPlayer(this);
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
    
	this.piece.applyConfig(this.configs);
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