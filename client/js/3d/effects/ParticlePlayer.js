define([
    'Events',
        'particle_system/defaults/ExampleEffects',
    '3d/effects/SimpleParticles',
    'PipelineAPI',
        'goo/math/Vector3'
    ],
    function(
        evt,
        ExampleEffects,
        SimpleParticles,        
        PipelineAPI,
        Vector3
    ) {

        var particleData =	{
            pos:new Vector3(0, 0, 0),
            vel:new Vector3(0, 0, 0)
        };




        var particleConfigs = {};
        var effectConfigs = {};
        var cheapParticleConfigs = {};
        
        function ParticlePlayer(goo) {
            
            this.simpleParticles = new SimpleParticles(goo);
            this.simpleParticles.createSystems();
            var simpleParticles = this.simpleParticles;
            
            function applyParticleConfigs(key, data) {
                for (var i = 0; i < data.length; i++) {
                    particleConfigs[data[i].id] = data[i].effect_data;  
                }
            }
            
            PipelineAPI.subscribeToCategoryKey('effects', 'particles', applyParticleConfigs);

            function applyGameplayEffectConfigs(key, data) {
                for (var i = 0; i < data.length; i++) {
                    effectConfigs[data[i].id] = data[i].effect_data;
                }
            }

            PipelineAPI.subscribeToCategoryKey('effects', 'gameplay', applyGameplayEffectConfigs);


            function applyCheapParticleConfigs(key, data) {
                for (var i = 0; i < data.length; i++) {
                    cheapParticleConfigs[data[i].id] = data[i].effect_data;
                }
                simpleParticles.applyCheapParticleConfigs(cheapParticleConfigs);
            }

            PipelineAPI.subscribeToCategoryKey('effects', 'cheap_particles', applyCheapParticleConfigs);
            
            var _this = this;

            function playParticle(e) {
                _this.playParticleEffect(evt.args(e));
            }


            evt.on(evt.list().PLAY_PARTICLE, playParticle);

            function playGameEffect(e) {
                _this.playGameEffect(evt.args(e));
            }


            evt.on(evt.list().GAME_EFFECT, playGameEffect);

        }

        ParticlePlayer.prototype.getCheapEffectData = function(key) {
            return cheapParticleConfigs[key];
        };

        ParticlePlayer.prototype.getEffectData = function(key, idx) {
            return effectConfigs[key][idx];
        };

        ParticlePlayer.prototype.getParticleData = function(key) {
            return particleConfigs[key];
        };

        ParticlePlayer.prototype.playParticleEffect = function(args) {
            particleData.pos.data[0] = args.pos.data[0];
            particleData.pos.data[1] = args.pos.data[1];
            particleData.pos.data[2] = args.pos.data[2];

            particleData.vel.data[0] = args.vel.data[0];
            particleData.vel.data[1] = args.vel.data[1];
            particleData.vel.data[2] = args.vel.data[2];

            this.simpleParticles.spawn(args.simulator, particleData.pos, particleData.vel, this.getParticleData(args.effect), args.callbacks, args.density);
            
        };

        ParticlePlayer.prototype.setupParticleData = function(idx, effect, params) {

            if (params) {
                for (var key in params) {
                    this.getParticleData(this.getEffectData(effect, idx).effect)[key] = params[key];
                }
            }

            return this.getParticleData(this.getEffectData(effect, idx).effect);
        };

        ParticlePlayer.prototype.playGameEffect = function(args) {
            particleData.pos.data[0] = args.pos.data[0];
            particleData.pos.data[1] = args.pos.data[1];
            particleData.pos.data[2] = args.pos.data[2];

            particleData.vel.data[0] = args.vel.data[0];
            particleData.vel.data[1] = args.vel.data[1];
            particleData.vel.data[2] = args.vel.data[2];


            for (var i = 0; i < effectConfigs[args.effect].length; i++) {

                if (effectConfigs[args.effect][i].simulator == "CheapParticles") {
                    this.simpleParticles.spawnCheap(effectConfigs[args.effect][i].effect, particleData.pos, particleData.vel, args.params);
                } else {
                    this.spawnGameEffects(this.getEffectData(args.effect, i), particleData, this.setupParticleData(i, args.effect, args.params), args.callbacks, this.getEffectData(args.effect, i).density);
                }
            }

        //    this.simpleParticles.spawn(this.getEffectData(args.effect).simulator, particleData.pos, particleData.vel, this.setupParticleData(args.effect, args.params), args.callbacks, this.getEffectData(args.effect).density);
        };


        ParticlePlayer.prototype.spawnGameEffects = function(effectData, particleData, customEffectData, callbacks, density) {

            this.simpleParticles.spawn(effectData.simulator, particleData.pos, particleData.vel, customEffectData, callbacks, density);
        };


        ParticlePlayer.prototype.update = function(tpf) {
            this.simpleParticles.update(tpf);
        };

        return ParticlePlayer;
    });