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

  function Orbit(camera, domElement, type, deactivate, camName, syncedCamera ) {
    var $rendererContainer = jQuery(domElement);
    this.sync = false;
    this.camera = camera; 
    this.camName = camName; 
    this.syncedCamera = syncedCamera; 
    this.currPos = new THREE.Vector3(0,0,0); 
    if(type == "perspective" ) {
      if( camName=== 'hud') {
        this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate, 1);
      } 
      else{
        this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate);
      }
    }
    else if (type == "orthographic"){
      this.control = new THREE.OrbitAndPanControls(camera, $rendererContainer[0]);
    }
  }

  Orbit.prototype.update = function() {

    this.control.update(); 
    var dx = Math.abs(this.camera.position.x - this.currPos.x ) ;
    var dy = Math.abs(this.camera.position.y - this.currPos.y ) ;
    var dz = Math.abs(this.camera.position.z - this.currPos.z ) ;
 
    if(this.sync && (this.camName === 'cell' || this.camName ==='crystal') && (dx!=0) && (dy!=0) && (dz!=0) ) {  
      this.syncedCamera.position.x = this.camera.position.x ;
      this.syncedCamera.position.y = this.camera.position.y ;
      this.syncedCamera.position.z = this.camera.position.z ;
      this.currPos.x = this.camera.position.x ;
      this.currPos.y = this.camera.position.y ;
      this.currPos.z = this.camera.position.z ; 
    }
  }; 
  return Orbit;
});
