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
  
  function Orbit(camera, domElement, type, deactivate ) {
    var $rendererContainer = jQuery(domElement);
    
    if(type == "perspective" ) {
      this.control = new THREE.OrbitControls(camera, $rendererContainer[0], deactivate);
    }
    else if (type == "orthographic"){
      this.control = new THREE.OrbitAndPanControls(camera, $rendererContainer[0]);
    }
  }

  Orbit.prototype.update = function() {
    this.control.update();
  };

  return Orbit;
});
