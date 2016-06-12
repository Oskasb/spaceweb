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

		SimpleParticles.prototype.createSystems = function(readyCallback) {

			var atlases = {};

			for (var i = 0; i < DefaultSpriteAtlas.atlases.length; i++) {
				atlases[DefaultSpriteAtlas.atlases[i].id] = DefaultSpriteAtlas.atlases[i];
			}

			var fontsRdy = false;
			var spritesRdy = false;

			var checkReady = function() {
				if (fontsRdy && spritesRdy) {
					this.ready = true;
					readyCallback();
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



        var lastFancyParticles = 0;
        var lastfancySims = 0;
        var lastCheapParticles = 0;
        var lastCheapSims = 0;
        var lastMatCount= 0;


		var monitorParticleStatus = function() {

            var count = particlesAPI.getParticleCount();

            if (count != lastFancyParticles) {
                lastFancyParticles = count;
                evt.fire(evt.list().MONITOR_STATUS, {FANCY_PARTICLES:lastFancyParticles});
            }

            count = particlesAPI.getParticleSimCount();

            if (count != lastfancySims) {
                lastfancySims = count;
                evt.fire(evt.list().MONITOR_STATUS, {FANCY_SIMULATIONS:lastfancySims});
            }

            count = cheapParticles.getCheapParticleCount();

            if (count != lastCheapParticles) {
                lastCheapParticles = count;
                evt.fire(evt.list().MONITOR_STATUS, {CHEAP_PARTICLES:lastCheapParticles});
            }

            count = cheapParticles.getCheapParticleSimCount();

            if (count != lastCheapSims) {
                lastCheapSims = count;
                evt.fire(evt.list().MONITOR_STATUS, {CHEAP_SIMULATORS:lastCheapSims});
            }

            var matCount = particlesAPI.getParticleMaterialCount();
            matCount += cheapParticles.getCheapMaterialCount();

            if (matCount != lastMatCount) {
                lastMatCount = matCount;
                evt.fire(evt.list().MONITOR_STATUS, {MATERIALS:lastMatCount});
            }

		};

        SimpleParticles.prototype.monitorParticleStatus = function() {
            monitorParticleStatus();
        };

		SimpleParticles.prototype.update = function(tpf) {
			particlesAPI.requestFrameUpdate(tpf);
			cheapParticles.update(tpf);
            monitorParticleStatus();
		};

		return SimpleParticles;
	});