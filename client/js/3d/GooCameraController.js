"use strict";


define(['Events',
    'goo/renderer/Camera',
    'goo/entities/components/CameraComponent',
    'goo/entities/EntityUtils',
    'goo/math/Vector3',
    'goo/math/Matrix3x3'
], function(
    evt,
    Camera,
    CameraComponent,
    EntityUtils,
    Vector3,
    Matrix3x3
    ) {

    var camScript;
    var cameraEntity;
    var playerPiece;
    var goo;
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
        goo = evt.args(e).goo;

        camera = new Camera(45, 1, 0.25, 45000);
        cameraEntity = goo.world.createEntity('ViewCameraEntity');
        var cameraComponent = new CameraComponent(camera);
        cameraEntity.setComponent(cameraComponent);
        cameraEntity.addToWorld();

        cameraEntity.transformComponent.transform.translation.setDirect(0, 0, 120);
        cameraEntity.transformComponent.setUpdated();

        evt.fire(evt.list().CAMERA_READY, {goo:goo, camera:cameraEntity});

        lastPos = new MATH.Vec3(0, 0, 0);
        forVec = new MATH.Vec3(0, 0, 0);
        evt.on(evt.list().CLIENT_TICK, updateCamera);


    };



    var lastPos;



	var updateCamera = function(e) {
        if (!on) return;


        playerPiece.spatial.getForwardVector(forVec);

        calcVec.setVector(playerPiece.spatial.vel);

    //    calcVec.subVector(lastPos);
        forVec.scale(6);


        calcVec.mulDirect(20, 20, 0);

        lastPos.interpolateFromTo(lastPos, calcVec, evt.args(e).tpf);

        lastPos.addVec(forVec);

    //    calcVec.addVector(playerSpatial.pos);

        cameraEntity.transformComponent.transform.translation.data[0] = lastPos.data[0];
        cameraEntity.transformComponent.transform.translation.data[1] = lastPos.data[1];
        cameraEntity.transformComponent.setUpdated();
        lastPos.setVec(playerPiece.spatial.pos);
	};

    evt.on(evt.list().ENGINE_READY, setupGooCamera);

    var on = false;

    function controlledPieceUpdated(e) {
        on=true;
        playerPiece = evt.args(e);
    }

    evt.on(evt.list().CONTROLLED_PIECE_UPDATED, controlledPieceUpdated);


	return GooCameraController

});