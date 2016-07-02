"use strict";


define(['Events'
], function(
    evt

    ) {

    var Camera = goo.Camera;
    var CameraComponen = goo.CameraComponent;
    var EntityUtils = goo.EntityUtils;
    var Vector3 = goo.Vector3;
    var Matrix3x3 = goo.Matrix3x3;
    
    var camScript;
    var cameraEntity;
    var playerPiece;
    var g00;
    var camera;
    var forVec;
    var calcVec = new Vector3();

	var GooCameraController = function() {

	};

	GooCameraController.prototype.updateCamera = function() {
		updateCamera()
	};

	GooCameraController.prototype.getCamera = function() {
		return camera;
	};

    GooCameraController.prototype.getCameraEntity = function() {
        return cameraEntity;
    };

    GooCameraController.prototype.setCameraPosition = function(x, y, z) {
        cameraEntity.transformComponent.transform.translation.setDirect(x, y, z);
        cameraEntity.transformComponent.setUpdated();
    };


    var cameraOffset = new Vector3(0, 0.82, 0);

    var cameras = {

    };


    var setupGooCamera = function(e) {
        g00 = evt.args(e).goo;

        camera = new Camera(45, 1, 0.25, 45000);
        cameraEntity = g00.world.createEntity('ViewCameraEntity');
        var cameraComponent = new goo.CameraComponent(camera);
        cameraEntity.setComponent(cameraComponent);
        cameraEntity.addToWorld();

        cameraEntity.transformComponent.transform.translation.setDirect(0, 0, 120);
        cameraEntity.transformComponent.setUpdated();

        evt.fire(evt.list().CAMERA_READY, {goo:goo, camera:cameraEntity});

        lastPos = new MATH.Vec3(0, 0, 0);
        forVec = new MATH.Vec3(0, 0, 0);
        evt.on(evt.list().CLIENT_TICK, updateCamera);

        var camTick = function() {
            cameraEntity.transformComponent.updateTransform();
            cameraComponent.updateCamera(cameraEntity.transformComponent.transform);
        };
        
        
        evt.on(evt.list().CAMERA_TICK, camTick);
        
    };


    var lastPos;


	var updateCamera = function(e) {
        if (!on) return;

        playerPiece.spatial.getForwardVector(forVec);

        calcVec.setDirect(playerPiece.spatial.vel.getX(), playerPiece.spatial.vel.getY(), playerPiece.spatial.vel.getZ());

    //    calcVec.subVector(lastPos);
        forVec.scale(3);

    //    calcVec.mulDirect(40, 40, 0);
        calcVec.addDirect(forVec.data[0], forVec.data[1], forVec.data[2]);
        calcVec.addDirect(playerPiece.spatial.pos.getX(), playerPiece.spatial.pos.getY(), playerPiece.spatial.pos.getZ());
    //    lastPos.addVec(playerPiece.spatial.pos);

    //    lastPos.interpolateFromTo(lastPos, calcVec, 0.02);

    //    calcVec.addVector(playerPiece.spatial.pos);

        cameraEntity.transformComponent.transform.translation.x = calcVec.x;
        cameraEntity.transformComponent.transform.translation.y = calcVec.y;
        cameraEntity.transformComponent.setUpdated();
    //    lastPos.setVec(playerPiece.spatial.pos);
	};

    evt.on(evt.list().ENGINE_READY, setupGooCamera);

    var on = false;


    var controlledPieceUpdated = function(e) {
        on=true;
        playerPiece = evt.args(e);
    //    updateCamera(e)
    //    evt.on(evt.list().CAMERA_TICK, updateCamera);
    //    evt.removeListener(evt.list().CLIENT_TICK, updateCamera);
    };

    evt.once(evt.list().CONTROLLED_PIECE_UPDATED, controlledPieceUpdated);


	return GooCameraController

});