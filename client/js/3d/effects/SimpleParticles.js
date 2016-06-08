define([
	'Events',
		'particle_system/ParticlesAPI',
		'particle_system/defaults/DefaultRendererConfigs',
		'particle_system/defaults/DefaultSpriteAtlas',
		'particle_system/defaults/DefaultSimulators',
		'particle_system/defaults/FontRendererConfigs',
		'particle_system/defaults/FontSimulators',
		'3d/effects/CheapParticles',
		'goo/renderer/TextureCreator'
	],
	function(
		evt,
		ParticlesAPI,
		DefaultRendererConfigs,
		DefaultSpriteAtlas,
		DefaultSimulators,
		FontRendererConfigs,
		FontSimulators,
		CheapParticles,
		TextureCreator
	) {

		var particlesAPI;
		var cheapParticles;

		function SimpleParticles(goo) {
			this.goo = goo;
			this.particlesAPI = new ParticlesAPI(goo);
			this.cheapParticles = new CheapParticles(goo);
			cheapParticles = this.cheapParticles;
			particlesAPI = this.particlesAPI;
			this.ready = false;
		}

		SimpleParticles.prototype.createSystems = function() {

			var atlases = {};

			for (var i = 0; i < DefaultSpriteAtlas.atlases.length; i++) {
				atlases[DefaultSpriteAtlas.atlases[i].id] = DefaultSpriteAtlas.atlases[i];
			}

			var fontsRdy = false;
			var spritesRdy = false;

			var checkReady = function() {
				if (fontsRdy && spritesRdy) {
					this.ready = true;
					evt.fire(evt.list().PARTICLES_READY, {});
				}
			}.bind(this);

			var fontTxLoaded = function() {
				this.particlesAPI.createParticleSystems(FontSimulators, FontRendererConfigs, DefaultSpriteAtlas.atlases[1], fontTexture);
				fontsRdy = true;
				checkReady();
			}.bind(this);

			var txLoaded = function() {
				this.particlesAPI.createParticleSystems(DefaultSimulators, DefaultRendererConfigs, DefaultSpriteAtlas.atlases[0], texture);
				spritesRdy = true;
				checkReady();
			}.bind(this);

			var textureCreator = new TextureCreator();

			var texture = textureCreator.loadTexture2D(atlases[DefaultSpriteAtlas.atlases[0].id].textureUrl.value, {
				minFilter:"NearestNeighborNoMipMaps",
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp'
			}, function() {
				txLoaded();
			});


			var fontTexture  = textureCreator.loadTexture2D(atlases[DefaultSpriteAtlas.atlases[1].id].textureUrl.value, {
				minFilter:"NearestNeighborNoMipMaps",
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp'
			}, function() {
				fontTxLoaded();
			});

		};


		SimpleParticles.prototype.applyCheapParticleConfigs = function(cheapParticleConfigs) {

			for (var key in cheapParticleConfigs) {
				this.cheapParticles.createSystem(key, cheapParticleConfigs[key]);
			}
		};

		SimpleParticles.prototype.spawn = function(simulatorId, position, normal, effectData, callbacks, particleDensity) {
			if (!this.ready) return;
				this.particlesAPI.spawnParticles(simulatorId, position, normal, effectData, callbacks, particleDensity);
		};

		SimpleParticles.prototype.spawnCheap = function(simulatorId, position, normal, effectData) {
			this.cheapParticles.spawn(simulatorId, position, normal, effectData)
		};



		SimpleParticles.prototype.update = function(tpf) {
			particlesAPI.requestFrameUpdate(tpf);
			cheapParticles.update(tpf);
		};

		return SimpleParticles;
	});