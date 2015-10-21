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
 
    this.fogActive = false ;
    this.object3d.fog = new THREE.FogExp2( '#000000', 0); //0.0125 );

    this.light = new THREE.DirectionalLight( 0xFFFFFF, 1 );
    this.light.position.set( 300, 300, 60 );
    this.light.castShadow = true;
    this.light.shadowMapWidth = 1024;    // power of 2
    this.light.shadowMapHeight = 1024;

    this.light.shadowCameraNear = 350;   // keep near and far planes as tight as possible
    this.light.shadowCameraFar = 450;    // shadows not cast past the far plane
    this.light.shadowCameraFov = 20;
    this.light.shadowBias = -0.00022;    // a parameter you can tweak if there are artifacts
    this.light.shadowDarkness = 0.3;

    this.AmbLight = new THREE.AmbientLight( 0x4D4D4C );

    //light.shadowCameraVisible = true;
    this.object3d.add(this.light);
    this.object3d.add(this.AmbLight);

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
     
    var mesh1 = new THREE.Line( geometry1, new THREE.LineBasicMaterial({ color: '#6F6299' }) );
    var mesh2 = new THREE.Line( geometry2, new THREE.LineBasicMaterial({ color: '#6F6299' }) );
    var mesh3 = new THREE.Line( geometry3, new THREE.LineBasicMaterial({ color: '#6F6299' }) ); 

    this.object3d.add(mesh1);
    this.object3d.add(mesh2);
    this.object3d.add(mesh3);

    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });
    
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
