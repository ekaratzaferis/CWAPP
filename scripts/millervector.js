/*global define*/
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

  function MillerVector(start , end, color) {

    var length =  start.distanceTo(end) ; 
    var direction = new THREE.Vector3().subVectors( end,  start).normalize();
    var arrow = new THREE.ArrowHelper( direction , start, length , "#"+color, 0.4, 0.15);

    this.object3d = arrow;
    Explorer.add(this);

  };

  MillerVector.prototype.setVisible = function( x) {     
    this.object3d.visible = x ;
  };
 
  MillerVector.prototype.setColor = function(color) {
    if(_.isUndefined(color)) return;
    this.color = color;
    this.object3d.material.needsUpdate = true;
    this.object3d.material.color.setHex( "0x"+color );
  };

  MillerVector.prototype.destroy = function() {
    Explorer.remove(this);
  }; 

  return MillerVector;

});
