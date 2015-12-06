 
define([
  'three',
  'explorer',
  'underscore'
], function(
  THREE,
  Explorer,
  _
) {

  function Grid(pointA, pointB, visibility) {

    var meshGeometry = new THREE.CylinderGeometry( 0.01, 0.01, 0.001, 8, 8 ); 
    var mesh = new THREE.Mesh( meshGeometry,  new THREE.MeshBasicMaterial( { color: 0xA19EA1 } ) ); 
    mesh.visible = visibility;
    mesh.name = 'grid';
    this.object3d = mesh; 
    Explorer.add(this);
    this.scale = 2;

  }

  Grid.prototype.destroy = function() {
    Explorer.remove(this);
  };
 
  Grid.prototype.setRadius = function( scale) {

    if(_.isUndefined(scale)) return;
    this.scale = scale; 
    this.object3d.scale.x = scale;
    this.object3d.scale.z = scale;

  };
  
  Grid.prototype.setVisible= function( x) { this.object3d.visible = x; };

  Grid.prototype.setColor = function(color) {

    if(_.isUndefined(color)) return; 
    this.object3d.material.color.setHex( "0x"+color );
    this.setRadius(this.scale);

  };

   return Grid;
});
