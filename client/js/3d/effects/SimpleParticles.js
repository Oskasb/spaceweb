define([
	'Events',
		'particle_system/ParticlesAPI',
		'particle_system/defaults/DefaultRendererConfigs',
		'particle_system/defaults/DefaultSpriteAtlas',
		'particle_system/defaults/DefaultSimulators',
		'goo/renderer/TextureCreator'
	],
	function(
		evt,
		ParticlesAPI,
		DefaultRendererConfigs,
		DefaultSpriteAtlas,
		DefaultSimulators,
		TextureCreator
	) {

		var particlesAPI;

		function SimpleParticles(goo) {
			this.goo = goo;
			this.particlesAPI = new ParticlesAPI(goo);
			particlesAPI = this.particlesAPI;
			this.ready = false;
		}

		SimpleParticles.prototype.createSystems = function() {

			var atlases = {};

			for (var i = 0; i < DefaultSpriteAtlas.atlases.length; i++) {
				atlases[DefaultSpriteAtlas.atlases[i].id] = DefaultSpriteAtlas.atlases[i];
			}

			var txLoaded = function() {
				this.particlesAPI.createParticleSystems(DefaultSimulators, DefaultRendererConfigs, DefaultSpriteAtlas.atlases[0], texture);
				this.ready = true;
				evt.fire(evt.list().PARTICLES_READY, {});
			}.bind(this);

			var textureCreator = new TextureCreator();

			var texture = textureCreator.loadTexture2D(atlases[DefaultSpriteAtlas.atlases[0].id].textureUrl.value, {
				minFilter:"NearestNeighborNoMipMaps",
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp'
			}, function() {
				txLoaded();
			});

		};

		SimpleParticles.prototype.spawn = function(simulatorId, position, normal, effectData, callbacks, particleDensity) {
			if (!this.ready) return;
			this.particlesAPI.spawnParticles(simulatorId, position, normal, effectData, callbacks, particleDensity);

		};

		SimpleParticles.prototype.update = function(tpf) {
			particlesAPI.requestFrameUpdate(tpf);
		};

		return SimpleParticles;
	});