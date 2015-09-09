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

  function KeyboardKeys(keyboard, crystalScene, orbitCrystal, meTemporal) { 

    this.keyboard = keyboard;  
    this.crystalScene = crystalScene;  
    this.orbitCrystal = orbitCrystal;  
    this.dollmode = false;  
    this.mutex = false;
    this.hidden = true;
    this.meTemporal = meTemporal; 
  };

  KeyboardKeys.prototype.handleKeys = function(leapArg, speed){  
    var _this = this;
     
    if(this.dollmode === true){ 
 
      speed = (speed === undefined) ? 1 : speed ;

      var delta = clock.getDelta(), helperVec;  
      var distToCenter = (this.orbitCrystal.camera.position).distanceTo(new THREE.Vector3(0,0,0)) ;

      var camPos = this.orbitCrystal.camera.position ;
      var cubePos = this.crystalScene.movingCube.position;
      var rotationDistance = 0.2 * delta * speed ;

      // algorithm to smoothly move camera
      var par = Math.exp(distToCenter/100);
      var distFactor = par ; 

      if( (leapArg !== undefined) && (leapArg.forth === undefined) && (leapArg.back === undefined) && (distFactor > 5)){
        distFactor = 5 ;
      }
      else{
        if(distFactor > 30 && distFactor < 50){
          distFactor = 30 + (distFactor - 30)/2 ;
        }
        else if(distFactor > 50 && distFactor < 70){
          distFactor = 40 + (distFactor - 50)/3 ;
        }
        else if(distFactor > 70 && distFactor < 80){
          distFactor = 45 + (distFactor - 70)/5 ;
        } 
      }
      
      if(distFactor > 80){
        distFactor = 50 ;
      }
      //

      leapArg = (leapArg === undefined) ? {} : leapArg ;
  
      var moveDistance = 10 * delta * speed * distFactor;
       
      var camToCubeVec = (cubePos.clone()).sub(camPos) ;

      camToCubeVec.setLength(camToCubeVec.length() + moveDistance);
     

      if ( this.keyboard.pressed("W") || (leapArg.forth !== undefined) ){ 
        camPos.add(camToCubeVec);
        cubePos.add(camToCubeVec);    
      } 
      if ( this.keyboard.pressed("A") || (leapArg.left !== undefined)){
        helperVec = (new THREE.Vector3(cubePos.x, camPos.y, cubePos.z)).sub(camPos);
        helperVec.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 ); 
        helperVec.setLength(camToCubeVec.length()/2);
         
        camPos.add(helperVec);
        cubePos.add(helperVec); 
      }
      if ( this.keyboard.pressed("S") || (leapArg.back !== undefined)){
        camToCubeVec.negate();
        camPos.add(camToCubeVec);
        cubePos.add(camToCubeVec);  
      }
      if ( this.keyboard.pressed("D") || (leapArg.right !== undefined)){
        helperVec = (new THREE.Vector3(cubePos.x, camPos.y, cubePos.z)).sub(camPos);
        helperVec.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / -2 ); 
        helperVec.setLength(camToCubeVec.length()/2);
         
        camPos.add(helperVec);
        cubePos.add(helperVec); 
      }
      if ( this.keyboard.pressed("shift") || (leapArg.down !== undefined)){
        camPos.y -= moveDistance/2 ;
        cubePos.y -= moveDistance/2 ;  
      }
      if ( this.keyboard.pressed("space") || (leapArg.up !== undefined)){
        camPos.y += moveDistance/2 ;
        cubePos.y += moveDistance/2 ;  
      }

      // rotations
      if ( this.keyboard.pressed("down") || (leapArg.rotUp !== undefined)){
        this.orbitCrystal.control.rotateUp(rotationDistance);   
      } 
      if ( this.keyboard.pressed("left") || (leapArg.rotLeft !== undefined)){
        this.orbitCrystal.control.rotateLeft(-1 * rotationDistance);  
      }
      if ( this.keyboard.pressed("up") || (leapArg.rotDown !== undefined)){
        this.orbitCrystal.control.rotateUp(-1 *rotationDistance);  
      }
      if ( this.keyboard.pressed("right") || (leapArg.rotRight !== undefined)){
        this.orbitCrystal.control.rotateLeft(  rotationDistance);  
      }
      
      this.orbitCrystal.control.target =  cubePos;  
      this.orbitCrystal.control.rotateSpeed =  0.2;  
    } 

    /////

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
    if ( this.keyboard.pressed("B") ){
         
      if(this.mutex === false){ 
        this.mutex = true;
        if( this.meTemporal.box3.bool === true){ 
          this.meTemporal.box3.bool = false;
        }
        else{   
          this.meTemporal.box3.bool = true;
        }
        setTimeout(function(){ _this.mutex = false;}, 200 );
      } 
    }
 
  };
  
  return KeyboardKeys;

});
