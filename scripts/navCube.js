/*jslint browser: true*/
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore'
], function(
  THREE,
  jQuery,
  PubSub,
  _
) { 

function NavCube( scene, latticeParams) {
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
    this.length =  (height/90)  ; 
    this.scene = scene ;
    this.angles = {'alpha':90, 'beta':90, 'gamma':90 }; 
    
    
    var materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/0.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/1.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/2.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/3.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/4.jpg' ) }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/5.jpg' ) }));    
    
    var cubeMats = new THREE.MeshFaceMaterial(materialArray);
    var cubeG = new THREE.BoxGeometry( this.length-1, this.length-1, this.length-1, 3,3,3, materialArray );
    this.cube = new THREE.Mesh( cubeG, cubeMats );
    this.cube.name = 'cube' ;
    this.cube.position.set(0,0,0);
    scene.add(this.cube);
     
    var geom =  new THREE.Geometry();
    var v1   =  new THREE.Vector3(2.8, -8.7,   0);
    var v2   =  new THREE.Vector3(5.2, -6.4,   0);
    var v3   =  new THREE.Vector3(2,   -6.7,   0);
 
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
  
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
     
    geom.computeFaceNormals();

    var arHead = new THREE.Mesh( geom, new THREE.MeshBasicMaterial({color : 0x8904B1 }));
    arHead.name = 'arrowHead';
      
    var CustomSinCurve = THREE.Curve.create(
      function ( scale ) {  
        this.scale = (scale === undefined) ? 1 : scale ;
      },
      
      function ( t ) {  
        var tx = 2*(t-2/3) * 2, ty = -3 + Math.sin( -1*Math.PI/1.3 + Math.PI * t/2 )  ; 
          
        return new THREE.Vector3(tx, ty, 0).multiplyScalar(this.scale);
      }
    );

    var path = new CustomSinCurve( 2 );

    var geometry = new THREE.TubeGeometry(
        path,  //path
        20,    //segments
        0.4,     //radius
        8,     //radiusSegments
        false  //closed
    );
    var arLine = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color : 0x8904B1 }));
    arLine.name = 'arrowLine' ;
    scene.add(arHead);
    scene.add(arLine);

};
function getTexture() {
  var texture = new THREE.ImageUtils.loadTexture("Images/rotationArrow.png");
  
  return texture;
}

NavCube.prototype.updateAngles = function(angle) {
    var l = this.arrowLength ;
    var _this = this; 
    var matrix;
 
    if(angle.alpha !== undefined) _this.angles.alpha = parseInt(angle.alpha);  
    if(angle.beta  !== undefined) _this.angles.beta  = parseInt(angle.beta);  
    if(angle.gamma !== undefined) _this.angles.gamma = parseInt(angle.gamma);  
   

}; 
var transformationMatrix = function(parameter) {
      
    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - (( parameter.alpha) || 90)) * Math.PI / 180);

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleY || 1;
    var sc = parameter.scaleZ || 1; 
    
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
    return m;
  };
   
  return NavCube;
  
});
