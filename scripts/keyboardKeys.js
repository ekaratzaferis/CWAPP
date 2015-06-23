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
  
  var clock = new THREE.Clock();

  function KeyboardKeys(keyboard, crystalScene, orbitCrystal) { 

    this.keyboard = keyboard;  
    this.crystalScene = crystalScene;  
    this.orbitCrystal = orbitCrystal;  
    this.dollmode = false;  
 
  };

  KeyboardKeys.prototype.handleKeys = function(){

    if(this.dollmode){ 
      var delta = clock.getDelta();  

      var rotationDistance = 0.5 * delta;
      var moveDistance = 7 * delta ;

      if ( this.keyboard.pressed("W") ){ 
        this.orbitCrystal.camera.position.z -= moveDistance ;
        this.crystalScene.movingCube.position.z -= moveDistance ; 
      } 
      if ( this.keyboard.pressed("A") ){
        this.orbitCrystal.camera.position.x -= moveDistance ;
        this.crystalScene.movingCube.position.x -= moveDistance ; 
      }
      if ( this.keyboard.pressed("S") ){
        this.orbitCrystal.camera.position.z += moveDistance ;
        this.crystalScene.movingCube.position.z += moveDistance ; 
      }
      if ( this.keyboard.pressed("D") ){
        this.orbitCrystal.camera.position.x += moveDistance ;
        this.crystalScene.movingCube.position.x += moveDistance ; 
      }
      if ( this.keyboard.pressed("shift") ){
        this.orbitCrystal.camera.position.y -= moveDistance ;
        this.crystalScene.movingCube.position.y -= moveDistance ; 
      }
      if ( this.keyboard.pressed("space") ){
        this.orbitCrystal.camera.position.y += moveDistance ;
        this.crystalScene.movingCube.position.y += moveDistance ; 
      }

      if ( this.keyboard.pressed("up") ){
        this.orbitCrystal.control.rotateUp(rotationDistance);   
      }
      if ( this.keyboard.pressed("left") ){
        this.orbitCrystal.control.rotateLeft(-1 * rotationDistance);  
      }
      if ( this.keyboard.pressed("down") ){
        this.orbitCrystal.control.rotateUp(-1 *rotationDistance);  
      }
      if ( this.keyboard.pressed("right") ){
        this.orbitCrystal.control.rotateLeft(  rotationDistance);  
      }
  
      this.orbitCrystal.control.target =  this.crystalScene.movingCube.position.clone();  
      this.orbitCrystal.control.rotateSpeed =  0.2;  
    } 
 
 
  };
  
  return KeyboardKeys;

});
