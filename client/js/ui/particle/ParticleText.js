"use strict";


define([
        'Events',
        'PipelineAPI',
        'goo/math/Vector3'
    ],
    function(
        evt,
        PipelineAPI,
        Vector3
    ) {

        var particleConfigs = {};
        var textConfig = {};

        var letterConfig;

        var particleData =	{
            pos:new Vector3(0, 0, 0),
            vel:new Vector3(0, 0, 0)
        };

        var TextMessage = function(text, textStyle) {
            this.text = text+'';
            this.age = 0;
            this.effectData = textStyle.particleConfig;
            this.config = textConfig[textStyle.textConfig];
            this.posx = textStyle.posx;
            this.posy = textStyle.posy;
            this.size = textStyle.size;
            this.printCount = 0;
        };




        var ParticleText = function(simpleParticles) {

            this.simpleParticles = simpleParticles;

            this.simId = 'TextParticle';
            var _this = this;

            this.messages = [];

            function applyTextParticleConfigs(key, data) {
                for (var i = 0; i < data.length; i++) {
                    particleConfigs[data[i].id] = data[i].effect_data;
                }
                letterConfig = particleConfigs['Particle_Letter']
            }



            function applyTextConfigs(key, data) {
                for (var i = 0; i < data.length; i++) {
                    textConfig[data[i].id] = data[i].config_data;
                }
            }


            PipelineAPI.subscribeToCategoryKey('effects', 'text_config', applyTextConfigs);
            PipelineAPI.subscribeToCategoryKey('effects', 'text_particles', applyTextParticleConfigs);


            var drawText = function(e) {
                _this.writeText(evt.args(e).text, evt.args(e).textStyle);
            };

            evt.on(evt.list().PARTICLE_TEXT, drawText);

            var textTick = function(e) {
                _this.tickTextRenderer(evt.args(e).tpf);
            };

            evt.on(evt.list().CLIENT_TICK, textTick);
        };

        ParticleText.prototype.writeText = function(textString, textStyle) {
            this.messages.push(new TextMessage(textString, textStyle));
        };


        ParticleText.prototype.printNextMessageLetter = function(textMessage) {

            particleData.vel.setDirect(0, 1, 0);

            letterConfig = particleConfigs[textMessage.effectData]

            letterConfig.sprite = textMessage.text[textMessage.printCount];

            letterConfig.size[0] = textMessage.size*textMessage.config.size;
            letterConfig.size[1] = textMessage.size*textMessage.config.size;

            particleData.pos.setDirect(textMessage.posx + textMessage.printCount * textMessage.config.spacing,textMessage.posy, 0);

            this.simpleParticles.spawn(this.simId, particleData.pos, particleData.vel, letterConfig, null, 1);
            textMessage.printCount++;
            if (textMessage.printCount >= textMessage.text.length) {
                this.messages.splice(this.messages.indexOf(textMessage), 1);
            }
            this.tickTextRenderer(0);

        };

        ParticleText.prototype.processMessageText = function(textMessage, tpf) {
            textMessage.age += tpf;
            if (textMessage.age > textMessage.config.writeSpeed * textMessage.printCount) {
                this.printNextMessageLetter(textMessage);
            }
        };


        ParticleText.prototype.tickTextRenderer = function(tpf) {
            for (var i = 0; i < this.messages.length; i++) {
                this.processMessageText(this.messages[i], tpf);
            }
        };


        return ParticleText;

    });

