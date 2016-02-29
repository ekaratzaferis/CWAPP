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
        var hand, finger;
        
        // Leap.loop uses browser's requestAnimationFrame
        var options = { 
          enableGestures: false,
          loopWhileDisconnected: false 
        };
        
        // Main Leap Loop
        this.controller = Leap.loop(options, function(frame) { 

          var leftHand, rightHand; 
          var numOfHands = frame.hands.length ;
           
          /*if(_this.dollEditor.dollOn === true){  
            if(_this.trackingSystem === 'palm'){ 
              if(numOfHands === 2){
                // rotate camera 
                if(frame.hands[0].type === 'right') {
                  rightHand = frame.hands[0] ;
                  leftHand = frame.hands[1] ;
                }
                else{
                  leftHand = frame.hands[0] ;
                  rightHand = frame.hands[1] ;
                }

                if(_this.leapVars.bothGrab === true){ 
                  if((rightHand.grabStrength < 0.90) || (leftHand.grabStrength < 0.90) ){
                    _this.leapVars.bothGrab = false;
                    _this.soundMachine.play('leapNoGrab');
                  }
                  else{  
                    var xOffs = (-1*(rightHand.palmPosition[0] + leftHand.palmPosition[0])/2 - _this.leapVars.bothHandsInitPos.x)  ;  
                    var yOffs = ((rightHand.palmPosition[1] + leftHand.palmPosition[1])/2 - _this.leapVars.bothHandsInitPos.y)  ; 
                     
                    if(xOffs > 50 && yOffs < xOffs){
                      _this.keyboard.handleKeys({rotLeft : true}, 3);
                    }
                    else if(xOffs < -50 && yOffs > xOffs){
                      _this.keyboard.handleKeys({rotRight : true}, 3);
                    } 
                    if(yOffs > 50 && yOffs > xOffs){
                      _this.keyboard.handleKeys({rotDown : true}, 3);
                    }
                    else if(yOffs < -50 && yOffs < xOffs){
                      _this.keyboard.handleKeys({rotUp : true}, 3);
                    } 
                  }
                }
                else{
                  if((rightHand.grabStrength > 0.90) && (leftHand.grabStrength > 0.90)){ 
                    _this.leapVars.bothGrab = true;
                    _this.soundMachine.play('leapGrab');
                    _this.leapVars.bothHandsInitPos.x = (rightHand.palmPosition[0] + leftHand.palmPosition[0])/2; 
                    _this.leapVars.bothHandsInitPos.y = (rightHand.palmPosition[1] + leftHand.palmPosition[1])/2; 
                    _this.leapVars.bothHandsInitPos.z = (rightHand.palmPosition[2] + leftHand.palmPosition[2])/2; 
                  }
                } 
              }    
              else if(numOfHands === 1){  
                _this.leapVars.bothGrab = false;  
                rightHand = frame.hands[0];
                if(rightHand.type === 'right' && rightHand.grabStrength < 0.2 ){   
                  if(frame.hands[0].palmNormal[0] < -0.8){
                    _this.keyboard.handleKeys({left : true}, 2);
                  }
                   
                  if(frame.hands[0].palmNormal[1] < -0.8){
                    _this.keyboard.handleKeys({down : true}, 2);
                  } 
                  else if(frame.hands[0].palmNormal[1] > 0.65){
                    _this.keyboard.handleKeys({up : true}, 2);
                  }

                  if(frame.hands[0].palmNormal[2] < -0.8){
                    _this.keyboard.handleKeys({forth : true}, 8);
                  } 
                  else if(frame.hands[0].palmNormal[2] > 0.8){
                    _this.keyboard.handleKeys({back : true}, 8);
                  } 
                } 
                else if(rightHand.grabStrength < 0.2 ){ 
                  if(frame.hands[0].palmNormal[0] > 0.9){
                    _this.keyboard.handleKeys({right : true}, 2);
                  }
                }
              } 
              else{ 
                _this.leapVars.bothGrab = false;
              }
            }
            else if( _this.trackingSystem === 'grab'){
               
              // leap palm position varies : -200 < x < 200 , 50 < y < 550 , -200 < z < 200  approximately! 
              if(numOfHands === 2){
                // rotate camera
                _this.leapVars.rightGrab = false; // deactivate zooming
                if(frame.hands[0].type === 'right') {
                  rightHand = frame.hands[0] ;
                  leftHand = frame.hands[1] ;
                }
                else{
                  leftHand = frame.hands[0] ;
                  rightHand = frame.hands[1] ;
                }

                if(_this.leapVars.bothGrab === true){ 
                  if((rightHand.grabStrength < 0.90) || (leftHand.grabStrength < 0.90) ){
                    _this.leapVars.bothGrab = false;
                    _this.soundMachine.play('leapNoGrab');
                  }
                  else{  
                    var xOffs = (-1*(rightHand.palmPosition[0] + leftHand.palmPosition[0])/2 - _this.leapVars.bothHandsInitPos.x)  ;  
                    var yOffs = ((rightHand.palmPosition[1] + leftHand.palmPosition[1])/2 - _this.leapVars.bothHandsInitPos.y)  ; 
                     
                    if(xOffs > 50 && yOffs < xOffs){
                      _this.keyboard.handleKeys({rotLeft : true}, 3);
                    }
                    else if(xOffs < -50 && yOffs > xOffs){
                      _this.keyboard.handleKeys({rotRight : true}, 3);
                    } 
                    if(yOffs > 50 && yOffs > xOffs){
                      _this.keyboard.handleKeys({rotDown : true}, 3);
                    }
                    else if(yOffs < -50 && yOffs < xOffs){
                      _this.keyboard.handleKeys({rotUp : true}, 3);
                    } 
                  }
                }
                else{
                  if((rightHand.grabStrength > 0.90) && (leftHand.grabStrength > 0.90)){ 
                    _this.leapVars.bothGrab = true;
                    _this.soundMachine.play('leapGrab');
                    _this.leapVars.bothHandsInitPos.x = (rightHand.palmPosition[0] + leftHand.palmPosition[0])/2; 
                    _this.leapVars.bothHandsInitPos.y = (rightHand.palmPosition[1] + leftHand.palmPosition[1])/2; 
                    _this.leapVars.bothHandsInitPos.z = (rightHand.palmPosition[2] + leftHand.palmPosition[2])/2; 
                  }
                } 
              }    
              else if(numOfHands === 1){ 
                // zomming in/out
                _this.leapVars.bothGrab = false; // deactivate
                rightHand = frame.hands[0];
                if(rightHand.type === 'right'){ 
                  if(_this.leapVars.rightGrab === true){
                    if(hand.grabStrength <= 0.90){
                      _this.leapVars.rightGrab = false;
                      _this.soundMachine.play('leapNoGrab');
                    }
                    else{   
                      if(
                        rightHand.palmPosition[0] < -70 && 
                        rightHand.palmPosition[0] < rightHand.palmPosition[1] -300 &&
                        rightHand.palmPosition[0] < rightHand.palmPosition[2]  
                      ){
                        _this.keyboard.handleKeys({left : true}, 8);
                      }
                      else if(
                        rightHand.palmPosition[0] > 70 && 
                        rightHand.palmPosition[0] > rightHand.palmPosition[1] - 300 &&
                        rightHand.palmPosition[0] > rightHand.palmPosition[2]  
                      ){
                        _this.keyboard.handleKeys({right : true}, 8);
                      }
                      
                      if(
                        rightHand.palmPosition[1] < 230 && 
                        rightHand.palmPosition[1] - 300 < rightHand.palmPosition[0] &&
                        rightHand.palmPosition[1] - 300 < rightHand.palmPosition[2]  
                      ){
                        _this.keyboard.handleKeys({down : true}, 8);
                      } 
                      else if(
                        rightHand.palmPosition[1] > 370 && 
                        rightHand.palmPosition[1] - 300 > rightHand.palmPosition[0] &&
                        rightHand.palmPosition[1] - 300 > rightHand.palmPosition[2]  
                      ){
                        _this.keyboard.handleKeys({up : true}, 8);
                      }
   
                      if(
                        rightHand.palmPosition[2] < -70 && 
                        rightHand.palmPosition[2] < rightHand.palmPosition[0] &&
                        rightHand.palmPosition[2] < rightHand.palmPosition[1] - 300 
                      ){
                        _this.keyboard.handleKeys({forth : true}, 24);
                      } 
                      else if(
                        rightHand.palmPosition[2] > 70 && 
                        rightHand.palmPosition[2] > rightHand.palmPosition[0] &&
                        rightHand.palmPosition[2] > rightHand.palmPosition[1] - 300 
                      ){
                        _this.keyboard.handleKeys({back : true}, 24);
                      }
                    }
                  }
                  else{
                    if(rightHand.grabStrength > 0.90){ 
                      _this.leapVars.rightGrab = true;
                      _this.soundMachine.play('leapGrab');  
                    }
                  }
                } 
                else{ 
                  _this.leapVars.rightGrab = false;
                }
              } 
              else{
                _this.leapVars.rightGrab = false;
                _this.leapVars.bothGrab = false;
              }
            } 
          }
          else if(_this.dollEditor.dollOn === false){ */

          // normal mode
           
          if(numOfHands === 2){
            return;
            // rotate camera
            _this.leapVars.rightGrab = false; // deactivate zooming
            if(frame.hands[0].type === 'right') {
              rightHand = frame.hands[0] ;
              leftHand = frame.hands[1] ;
            }
            else{
              leftHand = frame.hands[0] ;
              rightHand = frame.hands[1] ;
            }

            if(_this.leapVars.bothGrab === true){ 
              if((rightHand.grabStrength < 0.90) || (leftHand.grabStrength < 0.90) ){
                _this.leapVars.bothGrab = false;
                _this.soundMachine.play('leapNoGrab');
              }
              else{  
                var xOffs = (-1*(rightHand.palmPosition[0] + leftHand.palmPosition[0])/2 - _this.leapVars.bothHandsInitPos.x) * rotSpeed ;  
                var yOffs = ((rightHand.palmPosition[1] + leftHand.palmPosition[1])/2 - _this.leapVars.bothHandsInitPos.y) * rotSpeed ; 
                _this.crystalOrbit.setRotationManually(_this.leapVars.initCamTheta + xOffs, _this.leapVars.initCamPhi + yOffs ); 
              }
            }
            else{
              if((rightHand.grabStrength > 0.90) && (leftHand.grabStrength > 0.90)){ 
                _this.leapVars.bothGrab = true;
                _this.soundMachine.play('leapGrab');
                // code from orbitControls.js  
                var position = _this.crystalOrbit.getCamPosition();
                var quat = new THREE.Quaternion().setFromUnitVectors( _this.crystalOrbit.camera.up, new THREE.Vector3( 0, 1, 0 ) );
                var offset = new THREE.Vector3();
                offset.copy( position ).sub( _this.crystalOrbit.getTarget() );
 
                offset.applyQuaternion( quat ); 

                var theta = Math.atan2( offset.x, offset.z ); 
                var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

                _this.leapVars.initCamTheta = theta;
                _this.leapVars.initCamPhi = phi; 
                _this.leapVars.bothHandsInitPos.x = (rightHand.palmPosition[0] + leftHand.palmPosition[0])/2; 
                _this.leapVars.bothHandsInitPos.y = (rightHand.palmPosition[1] + leftHand.palmPosition[1])/2; 
                _this.leapVars.bothHandsInitPos.z = (rightHand.palmPosition[2] + leftHand.palmPosition[2])/2; 
              }
            } 
          }  
          else if(numOfHands === 1){ 

            // WASD using open palm

            _this.leapVars.bothGrab = false; // deactivate
            var hand = frame.hands[0];
            var palmNormal = new THREE.Vector3(hand.palmNormal[0], hand.palmNormal[1], hand.palmNormal[2]);
            var pos = new THREE.Vector3(hand.palmPosition[0],hand.palmPosition[1],hand.palmPosition[2] );

            // check if open palm is looking down - stops when user grabs 
             
            // camera rotations
            
            if( hand.grabStrength < 0.7){  

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
            }

            if( hand.grabStrength < 0.4 && Math.abs(palmNormal.x) < 0.4 && palmNormal.y < -0.6 && Math.abs(palmNormal.z) < 0.4 ){
  
              // camera translations

              // palm position workable limits : 
              //    -250 < x < 250
              //      40 < y < 400
              //    -200 < z < 200
    
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

            if(hand.grabStrength > 0.7){
              // stop smoothly!
              var directionVec = _this.camera.position.clone().sub(_this.keyboard.lastCameraPosition.cam.clone());

              //console.log(directionVec);
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
