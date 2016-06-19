"use strict";


define([
		'3d/GooEntityFactory',
		'ui/GooModule',
	'Events'
	],
	function(
		GooEntityFactory,
		GooModule,
		evt
	) {

		var GooPiece = function(piece) {

			this.id = piece.id;
			this.piece = piece;
			this.vel = [];
			this.pos = [];
			this.rot = [];
			this.rotVel = [];
			this.entity = GooEntityFactory.buildRootEntity();

		};

		GooPiece.prototype.attachModule = function(module) {
			return new GooModule(module, this.piece, this.entity);
		};


		GooPiece.prototype.removeGooPiece = function() {
			this.entity.removeFromWorld();
		};


		GooPiece.prototype.sampleSpatial = function(spatial) {

			spatial.getVelArray(this.vel);
			spatial.getPosArray(this.pos);
			spatial.getRotArray(this.rot);
			spatial.getRotVelArray(this.rotVel);
			
			
			spatial.getPosArray(this.entity.transformComponent.transform.translation.data);
			spatial.getRotArray(this.rot);
			this.entity.transformComponent.transform.rotation.fromAngles(0, 0, this.rot[0]);
		};
		

		GooPiece.prototype.updateGooPiece = function() {

			this.sampleSpatial(this.piece.spatial);

		//	this.domRoot.translateCnvXYZ(GameScreen.percentToX(this.pos[0]), GameScreen.percentToY(this.pos[1]), 0);
		//	this.domHull.rotateXYZ(0, 0, 1, this.rot[0]);

			this.entity.transformComponent.setUpdated();
			
		};


		return GooPiece;

	});


