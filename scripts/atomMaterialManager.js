
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore', 
  'dollExplorer'
], function(
  THREE,
  jQuery,
  PubSub,
  _, 
  DollExplorer 
  
) { 
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();  
  var yPosGearSlider = [-7.05, -5.7 , -4.35 , -3 , -1.65 , -0.30];
  var levelNames = [ '1. Lattice Points', '2. Motif', '3. Constructive Unit Cell', '4. Unit cell', '5. Cropped unit cell', '6. Crystal' ];
  
  function AtomMaterialManager(camera, crystalOrbit, lattice, animationMachine , keyboard, soundMachine, gearTour) {

    
  }

  AtomMaterialManager.prototype.getImage = function(elementName, callback){
    var textureLoader = new THREE.TextureLoader(); 
    textureLoader.load("Images/atoms/Be.png",
      function(tex){ 
        tex.mapping = THREE.SphericalReflectionMapping;
        callback(tex) ;
      }
    ); 
  }
  return AtomMaterialManager;
  
});  
