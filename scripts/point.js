'use strict';

define([
  'three',
  'explorer',
  'underscore'
], function(
  THREE,
  Explorer,
  _
) {
  var geometry = new THREE.SphereGeometry(0.04, 16, 16);
  var material = new THREE.MeshBasicMaterial({color: 0xffffff});

  function Point(position) {
     
    this.object3d = new THREE.Mesh(geometry,material); 
    this.object3d.name = 'point'; 
    this.object3d.position.fromArray(position.toArray());
    Explorer.add(this);
  }

  Point.prototype.destroy = function() {
    Explorer.remove(this);
  };

  return Point;
});
