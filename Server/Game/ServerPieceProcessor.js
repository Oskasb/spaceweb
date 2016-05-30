ServerPieceProcessor = function(broadcast) {
    this.calcVec = new MATH.Vec3(0, 0, 0);
    this.calcVec2 = new MATH.Vec3(0, 0, 0);
    this.callbacks = {
        broadcast:broadcast
    };
    this.collissions = [];
};


ServerPieceProcessor.prototype.checkProximity = function(players, pieces) {

    for (var key in players) {
        this.playerAgainstPieces(players[key], pieces);
        this.playerAgainstPlayers(players[key], players);
    }


};

ServerPieceProcessor.prototype.playerAgainstPieces = function(player, pieces) {

    for (var i = 0; i < pieces.length; i++) {
        this.playerAgainstPiece(player.piece, pieces[i]);
    }

};

ServerPieceProcessor.prototype.playerAgainstPiece = function(playerPiece, piece) {

    this.calcVec.setVec(playerPiece.spatial.getPosVec());
    this.calcVec.subVec(piece.spatial.getPosVec());

    if (this.calcVec.getLength() < 7) {
        if (piece.parentPiece != playerPiece) {
            piece.setState(GAME.ENUMS.PieceStates.BURST);
            piece.setState(GAME.ENUMS.PieceStates.EXPLODE);

            this.calcVec.setVec(piece.spatial.getPosVec());
            this.calcVec.subVec(playerPiece.spatial.getPosVec());
        //    fastPiece.spatial.getVelVec().addVec(this.calcVec);

            this.calcVec.scale(-0.6);
            playerPiece.spatial.getVelVec().scale(0.5);
            playerPiece.spatial.getVelVec().addVec(this.calcVec);


            this.callbacks.broadcast(piece);
            this.callbacks.broadcast(playerPiece);
        }
    }
};

ServerPieceProcessor.prototype.playerAgainstPlayers = function(playerA, players) {
    for (var key in players) {
        if (players[key] != playerA) {
            this.playerAgainstPlayer(playerA.piece, players[key].piece);
        }

    }

    this.collissions.length = 0;

};

ServerPieceProcessor.prototype.playerAgainstPlayer = function(pieceA, pieceB) {

    this.calcVec.setVec(pieceA.spatial.getPosVec());
    this.calcVec.subVec(pieceB.spatial.getPosVec());

    if (this.calcVec.getLength() < 7) {
        if (this.collissions.indexOf(pieceA) != -1 && this.collissions.indexOf(pieceB) != -1) {
            return;
        }
        this.collissions.push(pieceA);
        this.collissions.push(pieceB);
            pieceA.setState(GAME.ENUMS.PieceStates.BURST);
            pieceB.setState(GAME.ENUMS.PieceStates.BURST);


            if (pieceA.spatial.getVelVec().getLength() > pieceB.spatial.getVelVec().getLength()) {
                this.collidePlayers(pieceA, pieceB)
            } else {
                this.collidePlayers(pieceB, pieceA)
            }


        this.callbacks.broadcast(pieceA);
        this.callbacks.broadcast(pieceB);

        }

};

ServerPieceProcessor.prototype.collidePlayers = function(fastPiece, slowPiece) {
    this.calcVec.setVec(fastPiece.spatial.getPosVec());
    this.calcVec.subVec(slowPiece.spatial.getPosVec());
    fastPiece.spatial.getVelVec().addVec(this.calcVec);

    this.calcVec.scale(-1);
    slowPiece.spatial.getVelVec().addVec(this.calcVec);
};