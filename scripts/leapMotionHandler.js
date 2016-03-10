"use strict";

define([
  "three", 
  "underscore", 
  "leapMotion"
], function(
  THREE, 
  _ 
) {
  
  var zoomSpeed = 0.5 ;
  var stillHandFactor = 100 ; // increasing it results to more stability in hand
  var rotSpeed = 0.005 ; // increasing it results to quicker rotation

  function LeapMotionHandler( lattice, motifeditor, crystalOrbit, soundMachine, dollEditor, keyboard ,explorer, camera) { 
    
    this.lattice = lattice;
    this.motifeditor = motifeditor; 
    this.keyboard = keyboard; 
    this.controller;
    this.crystalOrbit = crystalOrbit;
    this.soundMachine = soundMachine;
    this.active = false;
    this.explorer = explorer;
    this.camera = camera;
    this.dollEditor = dollEditor;
    this.trackingSystem = 'grab';
    this.leapVars = {
      rightGrab : false, 
      initCameraDist : undefined, 
      initHandPos : undefined, 
      bothGrab : undefined, 
      bothHandsInitPos : new THREE.Vector3(), 
      initCamTheta : undefined, 
      initCamPhi : undefined};
    this.toggle(false);
  };

  LeapMotionHandler.prototype.selectTS = function(arg) {
    this.trackingSystem = arg ;
  };
  LeapMotionHandler.prototype.toggle = function(bool) {
     
    var _this = this;
   
    this.active = bool ;
    //this.crystalOrbit.control.enabled = !this.active;

    if(bool === true){ 
      
      // reposition movingCube
  
      var MCpos = this.camera.position.clone(); // reconstruct : global init file
      MCpos.setLength(MCpos.length()-1); 
      this.explorer.movingCube.position.copy(MCpos);
    
      if( this.controller === undefined){
        
        var frameString = "", handString = "", fingerString = "";
        var hand, finger, isAlreadyGrabing = false;
        
        // Leap.loop uses browser's requestAnimationFrame
        var options = { 
          enableGestures: false,
          loopWhileDisconnected: false 
        };
        
        // Main Leap Loop
        this.controller = Leap.loop(options, function(frame) { 

          var leftHand, rightHand; 
          var numOfHands = frame.hands.length ;
          
          if(numOfHands === 1){ 
 
            _this.leapVars.bothGrab = false; // deactivate
            var hand = frame.hands[0];
            var palmNormal = new THREE.Vector3(hand.palmNormal[0], hand.palmNormal[1], hand.palmNormal[2]);
            var pos = new THREE.Vector3(hand.palmPosition[0],hand.palmPosition[1],hand.palmPosition[2] );


            // palm position workable limits : 
            //    -250 < x < 250
            //      40 < y < 400
            //    -200 < z < 200
            

            // WASD using open palm
            if( hand.grabStrength >= 0.7){

              // ORBITAL mode

              if(isAlreadyGrabing === false){
                var focalPoint = _this.explorer.movingCube.position.clone();
                
                var ray = new THREE.Ray(_this.camera.position.clone(), focalPoint.sub((_this.camera.position.clone())).normalize());
                var closestDist = 10000000000;
                var closestAtomPos ;
                for (var i = _this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
                  var d = ray.distanceToPoint(_this.lattice.actualAtoms[i].object3d.position.clone());

                  if( d < closestDist){
                    closestDist = d;
                    closestAtomPos = _this.lattice.actualAtoms[i].object3d.position.clone();
                  }
                };
                _this.explorer.movingCube.position.copy(closestAtomPos);
 
                isAlreadyGrabing = true;
              }
              

              if(pos.y < 170){
                var rFact = Math.abs((pos.y-240)*(pos.y-240)/200000);
                 
                _this.keyboard.handleKeys({orbitRreduce : rFact}, rFact, true);
              }
              else if(pos.y > 250){
                var rFact = Math.abs((pos.y-170)*(pos.y-170)/200000);
               
                _this.keyboard.handleKeys({orbitRincrease : rFact}, rFact, true);
              } 

              var rotFact = Math.abs(pos.z/100); 
              if(pos.z < -50){ 
                _this.keyboard.handleKeys({rotUp : rotFact}, rotFact, true);
              }
              else if(pos.z > 50){ 
                _this.keyboard.handleKeys({rotDown : rotFact}, rotFact, true);
              } 

              var rotFact = Math.abs(pos.x/100); 
              if(pos.x < -60){ 
                _this.keyboard.handleKeys({rotRight : rotFact}, rotFact, true);
              }
              else if(pos.x > 60){ 
                _this.keyboard.handleKeys({rotLeft : rotFact}, rotFact, true);
              }  

            }
            else if( hand.grabStrength < 0.7){  
                
              if(isAlreadyGrabing === true){

                var newPosOfFP = (_this.explorer.movingCube.position.clone()).sub(_this.camera.position.clone() );
                newPosOfFP.setLength(0.1);

                _this.explorer.movingCube.position.copy(newPosOfFP.add(_this.camera.position.clone()));

                isAlreadyGrabing = false;
              }
              

              // WASD mode

              // camera rotations 

              var xFact = palmNormal.x*palmNormal.x*palmNormal.x/0.75;
              var zFact = palmNormal.z*palmNormal.z*palmNormal.z/0.75;

              if(palmNormal.x <-0.2){
                _this.keyboard.handleKeys({rotLeft : true}, xFact*-1, true);
              } 
              else if(palmNormal.x >0.2){
                _this.keyboard.handleKeys({rotRight : true}, xFact, true);
              }
              if(palmNormal.z <-0.2){
                _this.keyboard.handleKeys({ rotDown : true}, zFact*-1, true);
              } 
              else if(palmNormal.z >0.2){
                _this.keyboard.handleKeys({ rotUp : true}, zFact, true);
              }

              // camera translations 

              if( hand.grabStrength < 0.4 && Math.abs(palmNormal.x) < 0.4 && palmNormal.y < -0.6 && Math.abs(palmNormal.z) < 0.4 ){
      
                // forth and back
                var fbSpeed =  Math.abs(pos.z*pos.z/3000);
                if(fbSpeed > 4){
                  fbSpeed = 4;
                }
               
                if(pos.z < -40){
                  _this.keyboard.handleKeys({ forth: true}, fbSpeed, true);
                } 
                else if(pos.z > 40){
                  _this.keyboard.handleKeys({ back : true}, fbSpeed, true);
                } 

                // right left 
                var rlFactor =  Math.abs(pos.x*pos.x/10000);
                if(pos.x < -35){
                  _this.keyboard.handleKeys({ left: true}, rlFactor, true);
                } 
                else if(pos.x > 35){
                  _this.keyboard.handleKeys({ right : true}, rlFactor, true);
                }
   
                // up down 
                var udFactor;
                if(pos.y < 190){
                  udFactor = Math.abs((pos.y - 190)/100);
                  _this.keyboard.handleKeys({ down: true}, udFactor, true);
                } 
                else if(pos.y > 230){
                  udFactor = (pos.y - 230)/100;
                  _this.keyboard.handleKeys({ up : true}, udFactor, true);
                } 
              }
            } 
            
          } 
          else{
            _this.leapVars.rightGrab = false;
            _this.leapVars.bothGrab = false;
          }
          
 
        }); 
        this.controller.loopWhileDisconnected = false;
      }
      this.controller.connect(); 
    }
    else{
  
      if(this.controller !== undefined){
        this.controller.disconnect();
      } 
      this.crystalOrbit.control.target = new THREE.Vector3( 0, 0, 0 );
    }
     
  }; 

  function concatData(id, data) {
    return id + ": " + data + "<br>";
  }
  
  function getFingerName(fingerType) {
    switch(fingerType) {
      case 0:
        return 'Thumb';
      break;
  
      case 1:
        return 'Index';
      break;
  
      case 2:
        return 'Middle';
      break;
  
      case 3:
        return 'Ring';
      break;
  
      case 4:
        return 'Pinky';
      break;
    }
  }
  
  function concatJointPosition(id, position) {
    return id + ": " + position[0] + ", " + position[1] + ", " + position[2] + "<br>";
  }
  return LeapMotionHandler;
});
