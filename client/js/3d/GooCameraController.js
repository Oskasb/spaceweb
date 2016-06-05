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
    var goo;
    var camera;

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
        console.log("Setup Goo Camera");

        camera = new Camera(45, 1, 0.25, 45000);
        cameraEntity = goo.world.createEntity('ViewCameraEntity');
        var cameraComponent = new CameraComponent(camera);
        cameraEntity.setComponent(cameraComponent);
        cameraEntity.addToWorld();

        cameraEntity.transformComponent.transform.translation.setDirect(0, 0, 150);
        cameraEntity.transformComponent.setUpdated();

        console.log("Setup Goo Camera", cameraEntity);

        evt.fire(evt.list().CAMERA_READY, {goo:goo, camera:cameraEntity});
    };


    function controlledPieceUpdated(e) {
        cameraEntity.transformComponent.transform.translation.setDirect(evt.args(e).spatial.posX(), evt.args(e).spatial.posY(), 120);
        cameraEntity.transformComponent.setUpdated();
    }


	var updateCamera = function() {
		camScript.updateCam(cameraEntity)
	};

    evt.on(evt.list().ENGINE_READY, setupGooCamera);

    evt.on(evt.list().CONTROLLED_PIECE_UPDATED, controlledPieceUpdated);


	return GooCameraController

});