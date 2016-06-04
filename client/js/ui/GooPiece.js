"use strict";


define([
		'3d/GooEntityFactory',
	'Events'
	],
	function(
		GooEntityFactory,
		evt
	) {

		var GooPiece = function(piece) {
			
			this.piece = piece;
			this.pos = [];
			this.rot = [];

			this.entiy = GooEntityFactory.buildPrimitive();
			
		//	this.domRoot = new DomElement(parent, 'point');
		//	this.domHull = new DomElement(this.domRoot.element, 'ship_root');

		};




		GooPiece.prototype.removeGooPiece = function() {
			this.entiy.removeFromWorld();
		};

		GooPiece.prototype.sampleSpatial = function(spatial) {
			spatial.getPosArray(this.entiy.transformComponent.transform.translation.data);
			spatial.getRotArray(this.rot);
			this.entiy.transformComponent.transform.rotation.fromAngles(0, 0, this.rot[0]);
		};
		

		GooPiece.prototype.updateGooPiece = function() {

			this.sampleSpatial(this.piece.spatial);
			

		//	this.domRoot.translateCnvXYZ(GameScreen.percentToX(this.pos[0]), GameScreen.percentToY(this.pos[1]), 0);
		//	this.domHull.rotateXYZ(0, 0, 1, this.rot[0]);

			this.entiy.transformComponent.setUpdated();
			
		};


		return GooPiece;

	});


