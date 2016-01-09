 
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
    mesh.scale.x = 2;
    mesh.scale.z = 2;
    this.object3d = mesh; 
    Explorer.add(this);
    this.scale = 2;
    this.color;
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
  
  Grid.prototype.setVisible= function(x) { 
    this.object3d.visible = x; 
  };

  Grid.prototype.setColor = function(color) {

    if(_.isUndefined(color)) return;
 
    color = validateColor(color);
 
    this.color = color;
    this.object3d.material.color.setHex( this.color );
    this.object3d.material.needsUpdate = true;

    this.setRadius(this.scale);

  };
  function validateColor(color){

    var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
  
    if(isOk === true){
      if(color.charAt(0) === '#'){
        color = color.slice(1,7);
        color = '0x' + color;
      }
      console.log(color);
      return color; 
    }
    else{
      if(color.charAt(0) !== '#' && (color.charAt(0) !== '0' || color.charAt(1) !== 'x' )){
        return ('0x'+color); 
      } 
      else { 
        return 0xffffff;
      } 
    }
     
  }
  
  return Grid;
});
