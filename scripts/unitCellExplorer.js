'use strict';

define([
  'three',
  'pubsub'
], function(
  THREE,
  PubSub
) {
  // singleton
  var instance;

  var events = {
    ADD: 'unitCellExplorer.add',
    REMOVE: 'unitCellExplorer.remove'
  };

  function UnitCellExplorer(options) {
    options = options || {};

    this.object3d = new THREE.Scene();

    var _this = this;

    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });
    var light = new THREE.DirectionalLight( 0xFFFFFF, 1 );
    light.position.set( 300, 300, 60 );
    light.castShadow = true;
    light.shadowMapWidth = 1024;    // power of 2
    light.shadowMapHeight = 1024;

    light.shadowCameraNear = 350;   // keep near and far planes as tight as possible
    light.shadowCameraFar = 450;    // shadows not cast past the far plane
    light.shadowCameraFov = 20;
    light.shadowBias = -0.00022;    // a parameter you can tweak if there are artifacts
    light.shadowDarkness = 0.3;

    var AmbLight = new THREE.AmbientLight( 0x20211F );

    light.shadowCameraVisible = true;
    this.object3d.add(light);
    this.object3d.add(AmbLight);

    var geometry1 = new THREE.Geometry();
    geometry1.vertices.push(
      new THREE.Vector3( 1000,0,0 ),
      new THREE.Vector3(-1000,0,0)
    );
   
    var geometry2 = new THREE.Geometry();
    geometry2.vertices.push(
      new THREE.Vector3( 0,1000,0 ),
      new THREE.Vector3(0,-1000,0)
    );

    var geometry3 = new THREE.Geometry();
    geometry3.vertices.push(
      new THREE.Vector3( 0,0,1000 ),
      new THREE.Vector3( 0,0,-1000 )
    );
     
    var mesh1 = new THREE.Line( geometry1, new THREE.LineBasicMaterial({ color: '#99FF33' }) );
    var mesh2 = new THREE.Line( geometry2, new THREE.LineBasicMaterial({ color: '#0099FF' }) );
    var mesh3 = new THREE.Line( geometry3, new THREE.LineBasicMaterial({ color: '#FF7519' }) ); 

    this.object3d.add(mesh1);
    this.object3d.add(mesh2);
    this.object3d.add(mesh3);

  };

  UnitCellExplorer.prototype.add = function(object) { 
    this.object3d.add(object.object3d);
  };

  UnitCellExplorer.prototype.remove = function(object) {
    this.object3d.remove(object.object3d);
  };

  return {
    getInstance: function(options) {
      return (instance = instance || new UnitCellExplorer(options));
    },
    add: function(object) {
      PubSub.publish(events.ADD, object);
    },
    remove: function(object) {
      PubSub.publish(events.REMOVE, object);
    }
  };
});
