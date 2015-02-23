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
    ADD: 'motifExplorer.add',
    REMOVE: 'motifExplorer.remove'
  };

  function MotifExplorer(options) {
    options = options || {};

    this.object3d = new THREE.Scene();

    var _this = this;
    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });

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
     
    var mesh1 = new THREE.Line( geometry1, new THREE.LineBasicMaterial({ color: '#99FF33'   }) );
    var mesh2 = new THREE.Line( geometry2, new THREE.LineBasicMaterial({ color: '#0099FF' }) );
    var mesh3 = new THREE.Line( geometry3, new THREE.LineBasicMaterial({ color: '#FF7519' }) ); 

    this.object3d.add(mesh1);
    this.object3d.add(mesh2);
    this.object3d.add(mesh3);

  }

  MotifExplorer.prototype.add = function(object) {
    this.object3d.add(object.object3d);
  };

  MotifExplorer.prototype.remove = function(object) {
    this.object3d.remove(object.object3d);
  };

  return {
    getInstance: function(options) {
      return (instance = instance || new MotifExplorer(options));
    },
    add: function(object) {
      PubSub.publish(events.ADD, object);
    },
    remove: function(object) {
      PubSub.publish(events.REMOVE, object);
    }
  };
});
