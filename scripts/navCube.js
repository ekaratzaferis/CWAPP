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
var counter = 0;

function NavCube( scene, latticeParams) {
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
    this.length =  (height + width)/260; 
    this.scene = scene ;
    this.angles = {'alpha':90, 'beta':90, 'gamma':90 }; 
    this.cubeMats;
    this.texts = [];
    var _this = this;

    this.cube;

    this.materialArray = [];

    var textureLoader = new THREE.TextureLoader(); 
    textureLoader.load("Images/0.jpg",
      function(tex){  
        _this.addMaterial(tex,0) ;
      }
    );
    textureLoader.load("Images/1.jpg",
      function(tex){  
        _this.addMaterial(tex,1) ;
      }
    );
    textureLoader.load("Images/2.jpg",
      function(tex){  
        _this.addMaterial(tex,2) ;
      }
    );
    textureLoader.load("Images/3.jpg",
      function(tex){  
        _this.addMaterial(tex,3) ;
      }
    );
    textureLoader.load("Images/4.jpg",
      function(tex){  
        _this.addMaterial(tex,4) ;
      }
    );
    textureLoader.load("Images/5.jpg",
      function(tex){  
        _this.addMaterial(tex,5) ;
      }
    );
 
    var geom =  new THREE.Geometry();
    var v1   =  new THREE.Vector3(3, -9.5,   0);
    var v2   =  new THREE.Vector3(5.2, -7.4,   0);
    var v3   =  new THREE.Vector3(2,   -7.7,   0);
 
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
  
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
     
    geom.computeFaceNormals();

    this.arHead = new THREE.Mesh( geom, new THREE.MeshBasicMaterial({color : 0x8904B1 }));
    this.arHead.name = 'arrowHead';
      
    var CustomSinCurve = THREE.Curve.create(
      function ( scale ) {  
        this.scale = (scale === undefined) ? 1 : scale ;
      },
      
      function ( t ) {  
        var tx = 2*(t-2/3) * 2, ty = -3.5 + Math.sin( -1*Math.PI/1.3 + Math.PI * t/2 )  ; 
          
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
    this.arLine = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color : 0x8904B1 }));
    this.arLine.name = 'arrowLine' ;
    scene.add(this.arHead);
    scene.add(this.arLine);

};
NavCube.prototype.setVisibility = function(bool){
  this.cube.visible = bool;
  this.arHead.visible = bool;
  this.arLine.visible = bool; 
};  
NavCube.prototype.addMaterial = function(text, index) {
  var _this = this ; 
  this.texts[index] = text;
  this.materialArray[index] = new THREE.MeshBasicMaterial( { map: text });  
  
  if(
    this.materialArray[0] !== undefined &&
    this.materialArray[1] !== undefined &&
    this.materialArray[2] !== undefined &&
    this.materialArray[3] !== undefined &&
    this.materialArray[4] !== undefined &&
    this.materialArray[5] !== undefined
    ){ 
      this.cubeMats = new THREE.MeshFaceMaterial(this.materialArray);
      var cubeG = new THREE.BoxGeometry( this.length-1, this.length-1, this.length-1, 3,3,3 );
      this.cube = new THREE.Mesh( cubeG, this.cubeMats );
      this.cube.name = 'cube' ;  
      
      this.scene.add(this.cube);
      counter = undefined;
    }   
};
NavCube.prototype.resetMat = function() {
  
  for (var i = 0; i<6; i++) {
    this.cube.material.materials[i] = new THREE.MeshBasicMaterial( { map: this.texts[i] });
  };  
}
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
