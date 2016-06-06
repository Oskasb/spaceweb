define([
	'goo/math/Vector3',
	'goo/math/MathUtils',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/Material',
	'goo/renderer/TextureCreator'
],
function(
	Vector3,
	MathUtils,
	MeshData,
	Shader,
	Material,
	TextureCreator
) {

	var path = "./client/assets/images/effects/";
	
	function CheapParticles(goo) {
		this.goo = goo;
		this.simulators = {};
		this.groups = {};
	}

	function Particle() {
		this.position = new Vector3();
		this.velocity = new Vector3();
		this.alpha = 1;
		this.opacity = 1;
		this.gravity = 0;
		this.lifeSpan = 0;
		this.lifeSpanTotal = 0;
		this.dead = true;
	};



	function Simulator(goo, particleSettings) {

		this.ready = false;

		var cb = function() {
			this.ready = true;
		}.bind(this);

		var texture = new TextureCreator().loadTexture2D(path+particleSettings.texture, {
			wrapS: 'EdgeClamp',
			wrapT: 'EdgeClamp'
		}, cb);

		this.particleSettings = particleSettings;
		particleSettings.poolCount = particleSettings.poolCount !== undefined ? particleSettings.poolCount : 500;

		particleSettings.alpha = particleSettings.alpha !== undefined ? particleSettings.alpha : 1;

		particleSettings.size = particleSettings.size !== undefined ? particleSettings.size : [10, 10];
		particleSettings.growth = particleSettings.growth !== undefined ? particleSettings.growth : [0, 0];
		particleSettings.rotation = particleSettings.rotation !== undefined ? particleSettings.rotation : [0, 360];
		particleSettings.spin = particleSettings.spin !== undefined ? particleSettings.spin : [0, 0];

		particleSettings.gravity = particleSettings.gravity !== undefined ? particleSettings.gravity : -5;
		particleSettings.color = particleSettings.color !== undefined ? particleSettings.color : [1, 1, 1, 1];
		particleSettings.spread = particleSettings.spread !== undefined ? particleSettings.spread : 1;
		particleSettings.acceleration = particleSettings.acceleration !== undefined ? particleSettings.acceleration : 0.999;
		particleSettings.strength = particleSettings.strength !== undefined ? particleSettings.strength : 1;
		particleSettings.lifespan = particleSettings.lifespan !== undefined ? particleSettings.lifespan : [3, 3];
		particleSettings.count = particleSettings.count !== undefined ? particleSettings.count : 1;

		var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.COLOR]);
		attributeMap.DATA = MeshData.createAttribute(4, 'Float');
		var meshData = new MeshData(attributeMap, particleSettings.poolCount);
		meshData.vertexData.setDataUsage('DynamicDraw');
		meshData.indexModes = ['Points'];
		this.meshData = meshData;

		var material = new Material('ParticleMaterial', particleShader);
		material.setTexture('PARTICLE_MAP', texture);
		if ( particleSettings.blending === 'additive') {
			material.blendState.blending = 'AdditiveBlending';
		} else {
			material.blendState.blending = 'CustomBlending';
		}


		material.depthState.write = false;
		material.renderQueue = 3010;
		var entity = goo.world.createEntity(meshData, material);
		entity.name = 'Simulator';
		entity.meshRendererComponent.cullMode = 'Never';
		this.entity = entity;
	//	entity.addToWorld();

		this.particles = [];
		for (var i = 0; i < particleSettings.poolCount; i++) {
			var particle = new Particle();
			this.particles[i] = particle;
		}

		if (particleSettings.color === "inherit") {
			this.inheritColor = true;
		} else {
			this.inheritColor = false;
		}
		
		this.aliveParticles = 0;
		this.meshData.indexLengths = [0];
		this.meshData.indexCount = 0;
	}

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}

	Simulator.prototype.spawn = function(position, normal, effectData) {
		var col = this.meshData.getAttributeBuffer(MeshData.COLOR);
		var data = this.meshData.getAttributeBuffer('DATA');

		var color = this.particleSettings.color;
		var count = this.particleSettings.count;
		var alpha = this.particleSettings.alpha;
		var size = [this.particleSettings.size[0],this.particleSettings.size[1]];
		var growth = [this.particleSettings.growth[0],this.particleSettings.growth[1]];
		var strength = this.particleSettings.strength;
		var gravity = this.particleSettings.gravity;
		var spread = this.particleSettings.spread;
		var lifeSpan = [this.particleSettings.lifespan[0], this.particleSettings.lifespan[1]];

		if (effectData) {
			if (effectData.intensity) {
				count = Math.ceil(count*effectData.intensity);
			}
            if (effectData.color) {
				color = effectData.color;
			}

			if (effectData.opacity) {
				alpha = effectData.opacity;
			}

			if (effectData.lifeSpan) {
				lifeSpan[0] = effectData.lifeSpan * this.particleSettings.lifespan[0]+ this.particleSettings.lifespan[0]*0.5;
				lifeSpan[1] = effectData.lifeSpan * this.particleSettings.lifespan[1]+ this.particleSettings.lifespan[1]*0.5;
			}

			if (effectData.strength) {
				strength *= effectData.strength;
			}

			if (effectData.size) {
				size[0] = effectData.size * size[0];
				size[1] = effectData.size * size[1];
			}

			if (effectData.gravity) {
				gravity = effectData.gravity;
			}

			if (effectData.scale) {
				size[0] = size[0] * effectData.scale;
				size[1] = size[1] * effectData.scale;
				growth[0] = growth[0] * effectData.scale;
				growth[1] = growth[1] * effectData.scale;
				strength *= effectData.scale;
			}
			if (effectData.spread) {
				spread = effectData.spread;
			}
		}


		var rotation = this.particleSettings.rotation;
		var spin = this.particleSettings.spin;


		for (var i = 0, l = this.particles.length; i < l && count > 0; i++) {
			var particle = this.particles[i];

			if (particle.dead) {
				particle.lifeSpanTotal = particle.lifeSpan = randomBetween(lifeSpan[0], lifeSpan[1]);
				particle.position.setVector(position);

				particle.velocity.set(
					strength*((Math.random() -0.5) * (2*spread) + (1-spread)*normal.data[0]),
					strength*((Math.random() -0.5) * (2*spread) + (1-spread)*normal.data[1]),
					strength*((Math.random() -0.5) * (2*spread) + (1-spread)*normal.data[2])
				);

				particle.dead = false;
				this.aliveParticles++;
				particle.gravity = gravity;
				particle.opacity = alpha;
				count--;

				col[4 * i + 0] = color[0];
				col[4 * i + 1] = color[1];
				col[4 * i + 2] = color[2];

				data[4 * i + 0] = randomBetween(size[0], size[1]); // size
				data[4 * i + 1] = randomBetween(growth[0], growth[1]); // size change
				data[4 * i + 2] = randomBetween(rotation[0], rotation[1]) * MathUtils.DEG_TO_RAD; // rot
				data[4 * i + 3] = randomBetween(spin[0], spin[1]) * MathUtils.DEG_TO_RAD; // spin
			}
		}
	};

	Simulator.prototype.update = function(tpf) {
		var calcVec = new Vector3();
		var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
		var col = this.meshData.getAttributeBuffer(MeshData.COLOR);
		var data = this.meshData.getAttributeBuffer('DATA');
		var lastAlive = 0;
		var alpha = this.inheritColor ? 1.0 : this.particleSettings.color[3];
		var acceleration = this.particleSettings.acceleration;
		for (var i = 0, l = this.particles.length; i < l; i++) {
			var particle = this.particles[i];

			if (particle.dead) {
				continue;
			}

			particle.lifeSpan -= tpf;
			if (particle.lifeSpan <= 0) {
				particle.dead = true;
				particle.position.setDirect(0, 0, 0);
				pos[3 * i + 0] = 0;
				pos[3 * i + 1] = -1000;
				pos[3 * i + 2] = 0;
				this.aliveParticles--;
				continue;
			}

			calcVec.setVector(particle.velocity).mulDirect(tpf, tpf, tpf);
			particle.position.addVector(calcVec);
		//	var damping = 0.999;
			particle.velocity.mulDirect(acceleration, acceleration, acceleration);
			particle.velocity.addDirect(0, particle.gravity * tpf, 0);
			particle.alpha = particle.opacity * alpha * particle.lifeSpan / particle.lifeSpanTotal;

			pos[3 * i + 0] = particle.position.data[0];
			pos[3 * i + 1] = particle.position.data[1];
			pos[3 * i + 2] = particle.position.data[2];

			col[4 * i + 3] = particle.alpha;

			data[4 * i + 0] += data[4 * i + 1] * tpf;
			data[4 * i + 2] += data[4 * i + 3] * tpf;

			lastAlive = i;
		}

		this.meshData.indexLengths = [lastAlive];
		this.meshData.indexCount = lastAlive;

		this.meshData.setVertexDataUpdated();
	};


	CheapParticles.prototype.createSystem = function(id, particleSettings) {
		if (this.simulators[id]) {
			this.disableSimulator(this.simulators[id]);
		}
		this.simulators[id] = new Simulator(this.goo, particleSettings);
		this.simulators[id] .isEnabled = false;
	};

	CheapParticles.prototype.spawn = function(id, position, normal, effectData) {
		var simulator = this.simulators[id];
		if (simulator.ready) {
			simulator.spawn(position, normal, effectData);
		}
	};

	CheapParticles.prototype.enableSimulator = function(simulator) {
		if (simulator.isEnabled) return;
		simulator.isEnabled = true;
		simulator.entity.addToWorld();
	};

	CheapParticles.prototype.disableSimulator = function(simulator) {
		if (!simulator.isEnabled) return;
		simulator.isEnabled = false;
		simulator.entity.removeFromWorld();
	};


	CheapParticles.prototype.update = function(tpf) {
		for (var simulatorId in this.simulators) {
			var simulator = this.simulators[simulatorId];
			if (simulator.aliveParticles > 0) {
				this.enableSimulator(simulator);
				simulator.update(tpf);
			} else {
				this.disableSimulator(simulator);
			}
		}
	};

	var particleShader = {
		attributes: {
			vertexPosition: MeshData.POSITION,
			vertexColor: MeshData.COLOR,
			vertexData: 'DATA'
		},
		uniforms: {
			viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
			worldMatrix: Shader.WORLD_MATRIX,
			particleMap: 'PARTICLE_MAP',
			resolution: Shader.RESOLUTION
		},
		vshader: [
			'attribute vec3 vertexPosition;',
			'attribute vec4 vertexColor;',
			'attribute vec4 vertexData;',
			'uniform mat4 viewProjectionMatrix;',
			'uniform mat4 worldMatrix;',
			'uniform vec2 resolution;',

			'varying vec4 color;',
			'varying mat3 spinMatrix;',

			'void main(void) {',
				'gl_Position = viewProjectionMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
				'gl_PointSize = vertexData.x * resolution.x / 1000.0 / gl_Position.w;',
				'color = vertexColor;',
				'float c = cos(vertexData.z); float s = sin(vertexData.z);',
				'spinMatrix = mat3(c, s, 0.0, -s, c, 0.0, (s-c+1.0)*0.5, (-s-c+1.0)*0.5, 1.0);',
			'}'
		].join('\n'),
		fshader: [
			'uniform sampler2D particleMap;',

			'varying vec4 color;',
			'varying mat3 spinMatrix;',

			'void main(void)',
			'{',
				'vec2 coords = ((spinMatrix * vec3(gl_PointCoord, 1.0)).xy - 0.5) * 1.4142 + 0.5;',
				'vec4 col = color * texture2D(particleMap, coords);',
				'if (col.a <= 0.0) discard;',
				'gl_FragColor = col;',
			'}'
		].join('\n')
	};

	
	return CheapParticles;
});