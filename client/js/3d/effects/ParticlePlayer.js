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
        
        function ParticlePlayer(goo) {
            
            this.simpleParticles = new SimpleParticles(goo);
            this.simpleParticles.createSystems();
            
            
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

        ParticlePlayer.prototype.getEffectData = function(key) {
            return effectConfigs[key];
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

        ParticlePlayer.prototype.setupParticleData = function(effect, params) {

            if (params) {
                for (var key in params) {
                    this.getParticleData(this.getEffectData(effect).effect)[key] = params[key];
                }
            }

            return this.getParticleData(this.getEffectData(effect).effect);
        };

        ParticlePlayer.prototype.playGameEffect = function(args) {
            particleData.pos.data[0] = args.pos.data[0];
            particleData.pos.data[1] = args.pos.data[1];
            particleData.pos.data[2] = args.pos.data[2];

            particleData.vel.data[0] = args.vel.data[0];
            particleData.vel.data[1] = args.vel.data[1];
            particleData.vel.data[2] = args.vel.data[2];
            
            this.simpleParticles.spawn(this.getEffectData(args.effect).simulator, particleData.pos, particleData.vel, this.setupParticleData(args.effect, args.params), args.callbacks, this.getEffectData(args.effect).density);
        };



        ParticlePlayer.prototype.update = function(tpf) {
            this.simpleParticles.update(tpf);
        };

        return ParticlePlayer;
    });