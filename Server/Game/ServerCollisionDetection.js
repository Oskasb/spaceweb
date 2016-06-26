ServerCollisionDetection = function() {

    this.calcVec = new MATH.Vec3(0, 0, 0);
    this.calcVec2 = new MATH.Vec3(0, 0, 0);
    this.calcVec3 = new MATH.Vec3(0, 0, 0);
    this.calcVec4 = new MATH.Vec3(0, 0, 0);
    this.calcVec5 = new MATH.Vec3(0, 0, 0);
    this.calcVec6 = new MATH.Vec3(0, 0, 0);
};

ServerCollisionDetection.prototype.checkIntersection = function(pieceA, pieceB, storePos, storeNorm) {

    if (pieceA.spatial.vel.getLengthSquared() < pieceB.spatial.vel.getLengthSquared()) {
        return this.fastPieceAgainstSlowPiece(pieceB, pieceA, storePos, storeNorm);
    } else {
        return this.fastPieceAgainstSlowPiece(pieceA, pieceB, storePos, storeNorm);
    }
};


ServerCollisionDetection.prototype.fastPieceAgainstSlowPiece = function(fastPiece, slowPiece,  storePos, storeNorm) {

    this.calcVec.setVec(fastPiece.spatial.getVelVec());
    this.calcVec2.setVec(fastPiece.spatial.getPosVec());
    this.calcVec3.setVec(slowPiece.spatial.getPosVec());

    this.calcVec.scale(fastPiece.temporal.stepTime);

    var r = slowPiece.getCollisionShape().size;

    if (this.calcVec2.getDistanceSquared(this.calcVec3) > this.calcVec.getLengthSquared() + r*r*5) {
        // too far apart to intersect this frame;
        return;
    }



    var steps = Math.ceil(this.calcVec.getLength() / r)*20;
    this.calcVec.scale(1/steps);

    var distSquared = 0;
    var lastDist = Number.MAX_VALUE;

    for (var i = 0; i < steps*2; i++) {

        this.calcVec2.addVec(this.calcVec);

        distSquared = this.calcVec2.getDistanceSquared(this.calcVec3);

        if (lastDist < distSquared) {
            return false;
        }

        if (Math.sqrt(distSquared) < r) {
            console.log("Hit distance: ", Math.round(Math.sqrt(distSquared)*10)*0.1, r);
            storePos.setVec(this.calcVec2);
            fastPiece.spatial.getForwardVector(storeNorm);

            return true;
        }

        lastDist = distSquared;
    }

};

