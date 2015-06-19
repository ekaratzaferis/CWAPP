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
    ADD: 'dollExplorer.add',
    REMOVE: 'dollExplorer.remove'
  };

  function dollExplorer(options) {
    options = options || {};
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
      
    this.doll = new THREE.Mesh( new THREE.PlaneBufferGeometry(0.2,0.2), new THREE.MeshBasicMaterial( { transparent : true, map: (THREE.ImageUtils.loadTexture( 'Images/doll.png' )) }) );  
    this.doll.name = 'doll';
    this.doll.position.set(width/-1150,0,0);  

    var _this = this;
    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });

    this.object3d = new THREE.Scene();
    this.object3d.add( this.doll );

  }  
  dollExplorer.prototype.add = function(object) {
    this.object3d.add(object.object3d);
  };

  dollExplorer.prototype.remove = function(object) {  
    this.object3d.remove(object.object3d);
  }; 
  return {
    getInstance: function(options) {
      return (instance = instance || new dollExplorer(options));
    },
    add: function(object) {
      PubSub.publish(events.ADD, object);
    },
    remove: function(object) {
      PubSub.publish(events.REMOVE, object);
    }
  };
});
