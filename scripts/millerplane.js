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

  function MillerPlane( b , a, c, d, opacity, color) {

    var vertices = [];
    var faces = [];

    if(_.isUndefined(d)){
      vertices.push(new THREE.Vector3(a.x,a.y,a.z));
      vertices.push(new THREE.Vector3(b.x,b.y,b.z));
      vertices.push(new THREE.Vector3(c.x,c.y,c.z));
      faces.push(new THREE.Face3(0,2,1));
    }
    else{

      vertices.push(new THREE.Vector3(a.x,a.y,a.z));
      vertices.push(new THREE.Vector3(b.x,b.y,b.z));
      vertices.push(new THREE.Vector3(c.x,c.y,c.z));
      vertices.push(new THREE.Vector3(d.x,d.y,d.z));
      faces.push(new THREE.Face3(0,2,1));
      faces.push(new THREE.Face3(2,3,1));
    } 

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;

    geom.mergeVertices();

    var mesh = new THREE.Mesh( geom,new THREE.MeshBasicMaterial( { side:  THREE.DoubleSide, color: ("#"+color),opacity:opacity/10,  transparent: true } ) );

    this.object3d = mesh;
    Explorer.add(this);

  };

  MillerPlane.prototype.setVisible = function( x) {
      
    this.object3d.visible = x ;

  };
  MillerPlane.prototype.setOpacity = function( opacity) {
      
    if(_.isUndefined(opacity)) return;
    this.opacity = opacity;
    this.object3d.material.needsUpdate = true;
    this.object3d.material.opacity= opacity/10;

  };
  MillerPlane.prototype.setColor = function(color) {
    if(_.isUndefined(color)) return;
    this.color = color;
    this.object3d.material.needsUpdate = true;
    this.object3d.material.color.setHex( "0x"+color );
  };

  MillerPlane.prototype.destroy = function() {
    Explorer.remove(this);
  };



  return MillerPlane;

});
