"use strict";

define([
  "three", 
  "underscore",
  "jquery",
  "leapMotion"
], function(
  THREE, 
  _,
  jQuery
) {
  
  var zoomSpeed = 0.5 ;
  var stillHandFactor = 100 ; // increasing it results to more stability in hand

  function LeapMotionHandler( lattice, motifeditor, crystalOrbit ) { 
    
    this.lattice = lattice;
    this.motifeditor = motifeditor; 
    this.controller;
    this.crystalOrbit = crystalOrbit;
    this.leapVars = {
      rightGrab : false, 
      initCameraDist : undefined, 
      initHandPos : undefined, 
      bothGrab : undefined, 
      bothHandsInitPos : undefined, 
      initCamTheta : undefined, 
      initCamPhi : undefined};
    this.toggle(true);
  };

  LeapMotionHandler.prototype.toggle = function(bool) {
    
    var _this = this;

    if(bool === true){
      if( this.controller === undefined){
        var output = '<div id="leap_id" ' +
          'style=" top:0px; position: fixed; z-Index: 10000; background-color:##585858; opacity:0.7">'+
          '</div>';
        $(output).appendTo(document.body);

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
              if((rightHand.grabStrength < 0.95) || (leftHand.grabStrength < 0.95) ){
                _this.leapVars.bothGrab = false;
              }
              else{  
                var handOffset = ((rightHand.palmPosition[0] + rightHand.palmPosition[0] )/2 - _this.leapVars.bothHandsInitPos)  ;
                 
                _this.crystalOrbit.setThetaPhi(handOffset/1000, 0); 
              }
            }
            else{
              if((rightHand.grabStrength > 0.95) && (leftHand.grabStrength > 0.95)){ 
                _this.leapVars.bothGrab = true;
                _this.leapVars.initCamTheta =  _this.crystalOrbit.control.myTheta;
                _this.leapVars.initCamPhi =  _this.crystalOrbit.control.myPhi;
                _this.leapVars.bothHandsInitPos = (rightHand.palmPosition[0] + leftHand.palmPosition[0])/2; 
              }
            }

          }  
          else if(numOfHands === 1){ 
            // zomming in/out
            _this.leapVars.bothGrab = false; // deactivate
            rightHand = frame.hands[0];
            if(rightHand.type === 'right'){ 
              if(_this.leapVars.rightGrab === true){
                if(hand.grabStrength <= 0.95){
                  _this.leapVars.rightGrab = false;
                }
                else{  
                  var handOffset = (rightHand.palmPosition[2] - _this.leapVars.initHandPos) * zoomSpeed ;
                  var newDist = handOffset + _this.leapVars.initCameraDist ;
                  _this.crystalOrbit.leap_zoom(newDist); 
                }
              }
              else{
                if(rightHand.grabStrength > 0.95){ 
                  _this.leapVars.rightGrab = true;
                  _this.leapVars.initCameraDist = (_this.crystalOrbit.getCamPosition()).distanceTo(new THREE.Vector3(0,0,0));
                  _this.leapVars.initHandPos = rightHand.palmPosition[2]; 
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




          //////////////
          frameString = concatData("frame_id", frame.id);
          frameString += concatData("num_hands", frame.hands.length);
          frameString += concatData("num_fingers", frame.fingers.length);
          frameString += "<br>";

          // Showcase some new V2 features
          for (var i = 0, len = numOfHands; i < len; i++) {
            hand = frame.hands[i]; 

            handString = concatData("hand_type", hand.type);
            handString += concatData("confidence", hand.confidence);
            //handString += concatData("pinch_strength", hand.pinchStrength);
            handString += concatData("grab_strength", hand.grabStrength);
        
            handString += '<br>';
        
            // Helpers for thumb, pinky, etc.
            //fingerString = concatJointPosition("finger_thumb_dip", hand.thumb.dipPosition);
            /*for (var j = 0, len2 = hand.fingers.length; j < len2; j++) {
              finger = hand.fingers[j];
              fingerString += concatData("finger_type", finger.type) + " (" + getFingerName(finger.type) + ") <br>";
              fingerString += concatJointPosition("finger_dip", finger.dipPosition);
              fingerString += concatJointPosition("finger_pip", finger.pipPosition);
              fingerString += concatJointPosition("finger_mcp", finger.mcpPosition);
              fingerString += "<br>";
            }
            */
            frameString += handString;
            // frameString += fingerString;
          }
        
          $('#leap_id').html( frameString); 
        }); 
        this.controller.loopWhileDisconnected = false;
      }
      this.controller.connect(); 
    }
    else{
      setTimeout(function (){document.getElementById("leap_id").innerHTML = ""}, 700);;
      this.controller.disconnect();
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
