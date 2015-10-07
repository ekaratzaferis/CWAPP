 /*jshint unused:false*/
'use strict';

define([
  'three',
  'jquery',
  'threejs-controls/OrbitControls', // no AMD module
  'threejs-controls/OrbitAndPanControls' // no AMD module
], function(
  THREE,
  jQuery
) {
  var mutualCamPosParam = new THREE.Vector3();

  function Orbit(camera, domElement, type, deactivate, camName, syncedCamera, hudCameras ) {
    var $rendererContainer = jQuery(domElement);
    this.sync = false;
    this.camera = camera; 
    this.camName = camName; 
    this.hudCameras = hudCameras; 
    this.theta = 0; 
    this.phi = 0; 
    this.syncedCamera = syncedCamera; 
    this.currPos = new THREE.Vector3(0,0,0); 
    this.disableUpdate = false;

    if(type == "perspective" ) {
      if( camName=== 'hud') { 
        this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate, 1);
      } 
      else if( camName === 'motif'){
        this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate);
      }
      else{
        this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate);
      }
    }
    else if (type == "orthographic"){
      this.control = new THREE.OrbitAndPanControls(camera, $rendererContainer[0]);
    }
  };
  Orbit.prototype.dollOnDocumentMouseDown = function(onDocumentMouseDown){ 
    this.control.dollOnDocumentMouseDown(onDocumentMouseDown);
  };
  Orbit.prototype.getCamName = function(){
    return this.camName ;
  };
  Orbit.prototype.setThetaPhi = function(theta,phi) {
    // these are for constant rotate not direct values for setting the camera
    this.theta = theta;
    this.phi = phi;
    this.control.myTheta = this.theta ;
    this.control.myPhi = this.phi ; 
    
    this.control.makeMovement = true ;

  }
  Orbit.prototype.leap_zoom = function(distFromCenter){
    this.control.leap_zoom(distFromCenter);
  }
  Orbit.prototype.getAutoRotate = function(){
    return this.control.autoRotate ;
  };
  Orbit.prototype.autoRotate = function(bool){
 
    this.control.autoRotate = bool;
      
  };
  Orbit.prototype.getCamPosition = function(){
    return this.control.object.position ;
  };
  Orbit.prototype.getTarget = function(){
    return this.control.target ;
  };
  Orbit.prototype.setRotationManually = function(theta,phi){
    this.control.setRotationManually(theta,phi);
  };
  Orbit.prototype.update = function() {

    if(this.disableUpdate === true){
      return;
    }
    
    this.control.update(); 
     
    var dx = this.camera.position.x - this.currPos.x ;
    var dy = this.camera.position.y - this.currPos.y ;
    var dz = this.camera.position.z - this.currPos.z ;
 
    if(this.sync && (this.camName === 'cell' || this.camName ==='crystal') && (dx!=0) && (dy!=0) && (dz!=0) ) {  
      this.syncedCamera.position.x = this.camera.position.x ;
      this.syncedCamera.position.y = this.camera.position.y ;
      this.syncedCamera.position.z = this.camera.position.z ;
      this.currPos.x = this.camera.position.x ;
      this.currPos.y = this.camera.position.y ;
      this.currPos.z = this.camera.position.z ; 
    }
     
    if( this.camName =='crystal'){
       
      for (var i = this.hudCameras.length - 1; i >= 0; i--) { 
 
        var offset = this.getCamPosition().clone();  
        var targ = this.getTarget() ; 
        offset.sub( targ );

        var theta = Math.atan2( offset.x, offset.z );  
        var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );
        phi = Math.max( 0.01, Math.min( Math.PI - 0.01, phi ) );
        var r = this.hudCameras[i].position.length() ;
        var newOffset = new THREE.Vector3();

        newOffset.x = r * Math.sin( phi ) * Math.sin( theta );
        newOffset.y = r * Math.cos( phi );
        newOffset.z = r * Math.sin( phi ) * Math.cos( theta );

        var quat = new THREE.Quaternion().setFromUnitVectors( this.hudCameras[i].up, new THREE.Vector3( 0, 1, 0 ) );
        var quatInverse = quat.clone().inverse();

        newOffset.applyQuaternion( quatInverse );
     
        this.hudCameras[i].position.copy( new THREE.Vector3(0,0,0) ).add( newOffset ); 

        this.hudCameras[i].lookAt( new THREE.Vector3(0,0,0) );

      }; 
    }
  }; 
  return Orbit;
});
