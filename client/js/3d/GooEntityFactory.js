"use strict";


define([
	'goo/shapes/Sphere',
	'goo/shapes/Box',
	'Events',
	'goo/renderer/Material',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/shaders/ShaderLib'
], function(
		Sphere,
		Box,
    event,
	Material,
	MeshDataComponent,
	MeshRendererComponent,
	ShaderLib
    ) {

    var world;
    var goo;
    

    var setGoo = function(goo0) {
        goo = goo0;
        world = goo.world;
    };


    var applyMaterial = function(entity, material) {
        entity.meshRendererComponent.materials.push(material);
    };

    var addEntityMesh = function(entity, mesh) {
        var meshDataComponent = new MeshDataComponent(mesh);
        entity.setComponent(meshDataComponent);

        // Create meshrenderer component with material and shader
        var meshRendererComponent = new MeshRendererComponent();
        entity.setComponent(meshRendererComponent);
        return entity;
    };


    var handleBuildPrimitive = function() {
    //    var parentGooEntity = event.eventArgs(e).parentGooEntity;
    //    var pos = event.eventArgs(e).pos.clone();
    //    var rot = event.eventArgs(e).rot.toAngles();
    //    var size = event.eventArgs(e).size.clone();
    var     size = {data:[2, 2, 2]};
    //    var shape = event.eventArgs(e).shape;
     var    shape = 'Box';
    //    var color = event.eventArgs(e).color;

        var primitive = world.createEntity("primitive");

        switch (shape) {
            case "Box":
                var meshData = new Box(size.data[0], size.data[1], size.data[2]);
            break;
            case "Sphere":
                var meshData = new Sphere(8, 8, size.data[0]);
            break;
            case "Cylinder":
                var meshData = new Box(size.data[0], size.data[1], size.data[2]);
            break;
        }

        var material = new Material(ShaderLib.simpleColored, 'PrimitiveMaterial');

    //    if (color != undefined) material.uniforms.color = color;

        addEntityMesh(primitive, meshData);
        applyMaterial(primitive, material);
    //    parentGooEntity.transformComponent.attachChild(primitive.transformComponent);
    //    primitive.meshRendererComponent.isReflectable = false;
        primitive.addToWorld();
    //    primitive.transformComponent.transform.translation.setArray(pos.data);
    //    primitive.transformComponent.transform.setRotationXYZ(rot.data[0], rot.data[1], rot.data[2]) // = rot // .toAngles());
    //    event.eventArgs(e).callback(primitive);
        return primitive;
    };
    
        
    
    return {
        setGoo:setGoo,
        buildPrimitive:handleBuildPrimitive
    }

});