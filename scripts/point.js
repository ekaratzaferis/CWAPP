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
  //var globGeometry = new THREE.SphereGeometry(0.04, 16, 16);
  var globGeometry = new THREE.OctahedronGeometry(0.04,2);
  var material = new THREE.MeshBasicMaterial({color: 0xffffff});

  function Point(visible, position) {
     
    this.object3d = new THREE.Mesh(globGeometry,material); 
    this.object3d.name = 'point'; 
    this.object3d.visible = visible; 
    this.object3d.position.fromArray(position.toArray());
    Explorer.add(this);
  }

  Point.prototype.destroy = function() {
    Explorer.remove(this);
  };

  return Point;
});
