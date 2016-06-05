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

			this.particles = [];

			this.piece = piece;
			this.pos = [];
			this.rot = [];


			this.entity = GooEntityFactory.buildRootEntity();
		//	GooEntityFactory.attachPrimitive(this.entity);
		//	this.entity = GooEntityFactory.buildPrimitive();
			
		//	this.domRoot = new DomElement(parent, 'point');
		//	this.domHull = new DomElement(this.domRoot.element, 'ship_root');

			this.attachTrailEffect(piece.spatial)
		};



		GooPiece.prototype.attachTrailEffect = function(spatial) {

			var onParticleDead = function(particle) {
				this.particles.splice(this.particles.indexOf(particle), 1);
			}.bind(this);

			var onParticleAdded = function(particle) {
				this.particles.push(particle);
			}.bind(this);

			var particleUpdate = function(particle) {
				particle.lifeSpan = this.piece.temporal.lifeTime;
				particle.position.setArray(spatial.pos.data);
				particle.rotation = spatial.rot[0];

				particle.progress = 0.5 + Math.clamp(spatial.rotVel[0]*2, -0.49, 0.49); //  = Math.clamp(spatial.rotVel[0], -1, 1);
			}.bind(this);

			this.callbacks = {
				particleUpdate:particleUpdate,
				onParticleAdded:onParticleAdded,
				onParticleDead:onParticleDead
			};

	//		evt.fire(evt.list().GAME_EFFECT, {effect:"ship_trails", pos:spatial.pos, vel:spatial.vel, callbacks:this.callbacks});
		};


		GooPiece.prototype.removePieceParticles = function() {

			this.callbacks.particleUpdate = null;

			for (var i = 0; i < this.particles.length; i++) {
				this.particles[i].lifeSpan = 1;
				this.particles[i].lifeSpanTotal = 1;
			}

		};

		GooPiece.prototype.removeGooPiece = function() {
			this.removePieceParticles();
			this.entity.removeFromWorld();

		};

		GooPiece.prototype.sampleSpatial = function(spatial) {
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


