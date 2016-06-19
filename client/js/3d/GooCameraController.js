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
    var playerSpatial;
    var goo;
    var camera;
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



        evt.on(evt.list().CLIENT_TICK, updateCamera);
    };



    var lastPos = new Vector3(0, 0, 0);

	var updateCamera = function() {
        if (!on) return;



        calcVec.setVector(playerSpatial.pos);

        calcVec.subVector(lastPos);


        calcVec.mulDirect(0.95, 0.95, 0);

        lastPos.subVector(calcVec);

    //    calcVec.addVector(playerSpatial.pos);

        cameraEntity.transformComponent.transform.translation.data[0] = playerSpatial.pos.data[0];
        cameraEntity.transformComponent.transform.translation.data[1] = playerSpatial.pos.data[1];
        cameraEntity.transformComponent.setUpdated();
        lastPos.setVector(playerSpatial.pos);
	};

    evt.on(evt.list().ENGINE_READY, setupGooCamera);

    var on = false;

    function controlledPieceUpdated(e) {
        on=true;
        playerSpatial = evt.args(e).spatial;
    };


    evt.on(evt.list().CONTROLLED_PIECE_UPDATED, controlledPieceUpdated);


	return GooCameraController

});