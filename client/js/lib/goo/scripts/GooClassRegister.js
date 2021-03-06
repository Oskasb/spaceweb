define([
	'goo/scripts/Scripts',
	'goo/entities/Entity',
	'goo/entities/EntitySelection',
	'goo/entities/EntityUtils',
	'goo/entities/Selection',
	'goo/entities/SystemBus',
	'goo/entities/World',
	'goo/entities/components/CSSTransformComponent',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/Component',
	'goo/entities/components/HtmlComponent',
	'goo/entities/components/LightComponent',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/entities/components/MovementComponent',
	'goo/entities/components/ParticleComponent',
	'goo/entities/components/PortalComponent',
	'goo/entities/components/ScriptComponent',
	'goo/entities/components/SoundComponent',
	'goo/entities/components/TextComponent',
	'goo/entities/components/TransformComponent',
	'goo/entities/managers/EntityManager',
	'goo/entities/managers/Manager',
	'goo/entities/systems/BoundingUpdateSystem',
	'goo/entities/systems/CSSTransformSystem',
	'goo/entities/systems/CameraSystem',
	'goo/entities/systems/GridRenderSystem',
	'goo/entities/systems/HtmlSystem',
	'goo/entities/systems/LightingSystem',
	'goo/entities/systems/MovementSystem',
	'goo/entities/systems/ParticlesSystem',
	'goo/entities/systems/PickingSystem',
	'goo/entities/systems/PortalSystem',
	'goo/entities/systems/RenderSystem',
	'goo/entities/systems/SoundSystem',
	'goo/entities/systems/System',
	'goo/entities/systems/TextSystem',
	'goo/entities/systems/TransformSystem',
	'goo/loaders/DynamicLoader',
	'goo/math/MathUtils',
	'goo/math/Matrix',
	'goo/math/Matrix2x2',
	'goo/math/Matrix3x3',
	'goo/math/Matrix4x4',
	'goo/math/Plane',
	'goo/math/Quaternion',
	'goo/math/Ray',
	'goo/math/Transform',
	'goo/math/Vector',
	'goo/math/Vector2',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/noise/Noise',
	'goo/noise/ValueNoise',
	'goo/particles/Particle',
	'goo/particles/ParticleEmitter',
	'goo/particles/ParticleInfluence',
	'goo/particles/ParticleLib',
	'goo/particles/ParticleUtils',
	'goo/picking/BoundingTree',
	'goo/picking/PrimitivePickLogic',
	'goo/renderer/BufferData',
	'goo/renderer/BufferUtils',
	'goo/renderer/Camera',
	'goo/renderer/Capabilities',
	'goo/renderer/Material',
	'goo/renderer/MeshData',
	'goo/renderer/RenderQueue',
	'goo/renderer/Renderer',
	'goo/renderer/RendererRecord',
	'goo/renderer/Shader',
	'goo/renderer/ShaderCall',
	'goo/renderer/SimplePartitioner',
	'goo/renderer/Texture',
	'goo/renderer/TextureCreator',
	'goo/renderer/Util', // this needs to go
	'goo/renderer/RendererUtils',
	'goo/renderer/bounds/BoundingBox',
	'goo/renderer/bounds/BoundingSphere',
	'goo/renderer/bounds/BoundingVolume',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/Light',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/SpotLight',

	'goo/renderer/pass/Composer',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/pass/RenderTarget',

	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/shaders/ShaderFragment',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/shadow/ShadowHandler',
	'goo/scripts/ScriptUtils',
	'goo/shapes/Box',
	'goo/shapes/Cone',
	'goo/shapes/Cylinder',
	'goo/shapes/Disk',
	'goo/shapes/Grid',
	'goo/shapes/Quad',
	'goo/shapes/SimpleBox',
	'goo/shapes/Sphere',
	'goo/shapes/TextureGrid',
	'goo/shapes/Torus',
	'goo/sound/AudioContext',
	'goo/sound/OscillatorSound',
	'goo/sound/Sound',
	'goo/util/Ajax',
	'goo/util/ArrayUtil',
	'goo/util/CanvasUtils',
	'goo/util/GameUtils',
	'goo/util/MeshBuilder',
	'goo/util/ObjectUtil',
	'goo/util/ParticleSystemUtils',
	'goo/util/PromiseUtil',
	'goo/util/Rc4Random',
	'goo/util/ShapeCreatorMemoized',
	'goo/util/Skybox',
	'goo/util/Snow',
	'goo/util/SoundCreator',
	'goo/util/Stats',
	'goo/util/StringUtil',
	'goo/util/TangentGenerator',
	'goo/util/combine/AtlasNode',
	'goo/util/combine/EntityCombiner',
	'goo/util/combine/Rectangle',
	'goo/util/rsvp'
], function (Scripts) {
	'use strict';

	//! AT: have to duplicate this for now until nicer way is found
	// minifier cannot handle any expressions or statements other than a simple array of strings
	var defines = [
		'Scripts',
		'Entity',
		'EntitySelection',
		'EntityUtils',
		'Selection',
		'SystemBus',
		'World',
		'CSSTransformComponent',
		'CameraComponent',
		'Component',
		'HtmlComponent',
		'LightComponent',
		'MeshDataComponent',
		'MeshRendererComponent',
		'MovementComponent',
		'ParticleComponent',
		'PortalComponent',
		'ScriptComponent',
		'SoundComponent',
		'TextComponent',
		'TransformComponent',
		'EntityManager',
		'Manager',
		'BoundingUpdateSystem',
		'CSSTransformSystem',
		'CameraSystem',
		'GridRenderSystem',
		'HtmlSystem',
		'LightingSystem',
		'MovementSystem',
		'ParticlesSystem',
		'PickingSystem',
		'PortalSystem',
		'RenderSystem',
		'SoundSystem',
		'System',
		'TextSystem',
		'TransformSystem',
		'DynamicLoader',
		'MathUtils',
		'Matrix',
		'Matrix2x2',
		'Matrix3x3',
		'Matrix4x4',
		'Plane',
		'Quaternion',
		'Ray',
		'Transform',
		'Vector',
		'Vector2',
		'Vector3',
		'Vector4',
		'Noise',
		'ValueNoise',
		'Particle',
		'ParticleEmitter',
		'ParticleInfluence',
		'ParticleLib',
		'ParticleUtils',
		'BoundingTree',
		'PrimitivePickLogic',
		'BufferData',
		'BufferUtils',
		'Camera',
		'Capabilities',
		'Material',
		'MeshData',
		'RenderQueue',
		'Renderer',
		'RendererRecord',
		'Shader',
		'ShaderCall',
		'SimplePartitioner',
		'Texture',
		'TextureCreator',
		'Util', // this needs to go
		'RendererUtils',
		'BoundingBox',
		'BoundingSphere',
		'BoundingVolume',
		'DirectionalLight',
		'Light',
		'PointLight',
		'SpotLight',

		'Composer',
		'FullscreenPass',
		'FullscreenUtil',
		'RenderPass',
		'RenderTarget',

		'ShaderBuilder',
		'ShaderFragment',
		'ShaderLib',
		'ShadowHandler',
		'ScriptUtils',
		'Box',
		'Cone',
		'Cylinder',
		'Disk',
		'Grid',
		'Quad',
		'SimpleBox',
		'Sphere',
		'TextureGrid',
		'Torus',
		'AudioContext',
		'OscillatorSound',
		'Sound',
		'Ajax',
		'ArrayUtil',
		'CanvasUtils',
		'GameUtils',
		'MeshBuilder',
		'ObjectUtil',
		'ParticleSystemUtils',
		'PromiseUtil',
		'Rc4Random',
		'ShapeCreatorMemoized',
		'Skybox',
		'Snow',
		'SoundCreator',
		'Stats',
		'StringUtil',
		'TangentGenerator',
		'AtlasNode',
		'EntityCombiner',
		'Rectangle',
		'rsvp'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});