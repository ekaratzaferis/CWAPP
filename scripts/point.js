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
 
  function Point(position, radius, color) {
     
    var radius = (_.isUndefined(radius)) ? 0.04 : radius;  
    var geometry = new THREE.SphereGeometry(radius,32, 32);
    this.material;
    // primary or secondary colors
    var color = (_.isUndefined(color)) ? 0xffffff : color;

    // origin
    if (position.x === 0 && position.y === 0 && position.z === 0) {
      color = 0xff00ff;
    }

    this.material = new THREE.MeshBasicMaterial({ color: color,transparent:true,opacity:1  });
    var sphere = new THREE.Mesh(geometry,this.material);

    this.object3d = sphere;
    this.object3d.position.fromArray(position.toArray());
    Explorer.add(this);
  }

  Point.prototype.destroy = function() {
    Explorer.remove(this);
  };
  Point.prototype.setMaterial = function(color) {
    var _this = this;
    _this.material = new THREE.MeshBasicMaterial({ color:color,side: THREE.DoubleSide  });
    _this.object3d.material = _this.material ;
  };
  Point.prototype.collided = function() {
    var _this = this;
    _this.object3d.material = new THREE.MeshBasicMaterial({ color:"#FF0000",side: THREE.DoubleSide  });
    setTimeout(function() { _this.object3d.material = _this.material;},200);
  };

  return Point;
});
