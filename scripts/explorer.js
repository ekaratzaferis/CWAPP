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
    ADD: 'explorer.add',
    REMOVE: 'explorer.remove'
  };

  function Explorer(options) {
    options = options || {};

    this.object3d = new THREE.Scene();

    var _this = this;
    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });

    var dirLight = new THREE.DirectionalLight( 0xF5F6CE, 1 );
    dirLight.color.setHSL( 0.1, 3, 0.95 );
    dirLight.castShadow = true;
    dirLight.shadowDarkness = 0.7; 
    dirLight.position.set( 10, 10, 2 ); 
    dirLight.position.multiplyScalar( 50 );
    dirLight.shadowCameraRight     =  100;
    dirLight.shadowCameraLeft     = -100;
    dirLight.shadowCameraTop      =  100;
    dirLight.shadowCameraBottom   = -100;
    this.object3d.add( dirLight );

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
     
    var mesh1 = new THREE.Line( geometry1, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) );
    var mesh2 = new THREE.Line( geometry2, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) );
    var mesh3 = new THREE.Line( geometry3, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) ); 
    
    this.object3d.add(mesh1);
    this.object3d.add(mesh2);
    this.object3d.add(mesh3);

  }

  Explorer.prototype.add = function(object) {
    this.object3d.add(object.object3d);
  };

  Explorer.prototype.remove = function(object) {
    this.object3d.remove(object.object3d);
  };

  return {
    getInstance: function(options) {
      return (instance = instance || new Explorer(options));
    },
    add: function(object) {
      PubSub.publish(events.ADD, object);
    },
    remove: function(object) {
      PubSub.publish(events.REMOVE, object);
    }
  };
});
