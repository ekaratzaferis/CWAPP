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
    this.mutex = false;
    this.hidden = false;
  };

  KeyboardKeys.prototype.handleKeys = function(){
    var _this = this;
    if(this.dollmode){ 
      var delta = clock.getDelta(), helperVec;  
      var camPos = this.orbitCrystal.camera.position ;
      var cubePos = this.crystalScene.movingCube.position;
      var rotationDistance = 0.5 * delta;
      var moveDistance = 10 * delta ;
      
      var camToCubeVec = (cubePos.clone()).sub(camPos) ;

      camToCubeVec.setLength(camToCubeVec.length() + moveDistance);
     

      if ( this.keyboard.pressed("W") ){ 
        camPos.add(camToCubeVec);
        cubePos.add(camToCubeVec);    
      } 
      if ( this.keyboard.pressed("A") ){
        helperVec = (new THREE.Vector3(cubePos.x, camPos.y, cubePos.z)).sub(camPos);
        helperVec.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 ); 
        helperVec.setLength(camToCubeVec.length());
         
        camPos.add(helperVec);
        cubePos.add(helperVec);
      }
      if ( this.keyboard.pressed("S") ){
        camToCubeVec.negate();
        camPos.add(camToCubeVec);
        cubePos.add(camToCubeVec); 
      }
      if ( this.keyboard.pressed("D") ){
        helperVec = (new THREE.Vector3(cubePos.x, camPos.y, cubePos.z)).sub(camPos);
        helperVec.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / -2 ); 
        helperVec.setLength(camToCubeVec.length());
         
        camPos.add(helperVec);
        cubePos.add(helperVec); 
      }
      if ( this.keyboard.pressed("shift") ){
        camPos.y -= moveDistance ;
        cubePos.y -= moveDistance ; 
      }
      if ( this.keyboard.pressed("space") ){
        camPos.y += moveDistance ;
        cubePos.y += moveDistance ; 
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
      
      this.orbitCrystal.control.target =  cubePos;  
      this.orbitCrystal.control.rotateSpeed =  0.2;  
    } 
    if ( this.keyboard.pressed("P") ){
         
        if(this.mutex === false){ 
          this.mutex = true;
          if( this.hidden === true){
            $('#grainStats').show(); 
            this.hidden = false;
          }
          else{  
            $('#grainStats').hide();
            this.hidden = true;
          }
          setTimeout(function(){ _this.mutex = false;}, 200 );
        } 
      }
 
  };
  
  return KeyboardKeys;

});
