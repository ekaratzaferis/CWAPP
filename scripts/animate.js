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
  
  var wavesNames = ['crystalCenter', 'cellCollision', 'atomCollision'];
  function Animate(scene, soundMachine) { 
    
    this.scene = scene ;
    this.soundMachine = soundMachine ; 
    this.waves = [] ;
    this.wavesTrigger = [] ;
    this.doll_toAtomMovement = undefined;

    for (var i = wavesNames.length - 1; i >= 0; i--) {
      this.wavesTrigger[wavesNames[i]] = false;
      this.waves[wavesNames[i]] = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 32, 32 ) , new THREE.MeshBasicMaterial( { blending: THREE.AdditiveBlending, color: '#0066CC', side: THREE.DoubleSide, transparent:true, opacity:0.1 ,depthWrite:false} ) );
      this.waves[wavesNames[i]].visible = false ;
      scene.add({'object3d' : this.waves[wavesNames[i]]}); 
    }; 
  };

  Animate.prototype.produceWave = function(sourcePos, which){

    this.wavesTrigger[which] = true ;
    this.waves[which].visible = true ;
    this.waves[which].position.set(sourcePos.x, sourcePos.y, sourcePos.z); 
    this.waves[which].scale.set(0.1,0.1,0.1); 

  };

  var lastTime = 0;


  Animate.prototype.animation = function(){
    var timeNow = new Date().getTime();

    if (lastTime != 0) {
      var elapsed = timeNow - lastTime ;
       
      var offset = elapsed/20 ;
        
      //soundwaves
      for (var i = wavesNames.length - 1; i >= 0; i--) {
        if(this.wavesTrigger[wavesNames[i]]){
          var a = this.waves[wavesNames[i]].scale.x ; 
          a += offset ;
          this.waves[wavesNames[i]].scale.set(a,a,a); 
          this.waves[wavesNames[i]].material.opacity -= offset/1000;
          if(this.waves[wavesNames[i]].scale.x > 100){ 
            this.waves[wavesNames[i]].material.opacity = 0.1;
            this.waves[wavesNames[i]].visible = false ;
            this.wavesTrigger[wavesNames[i]] = false ;
          }  
        } 
      } 

      // camera doll movement
      if( this.doll_toAtomMovement!== undefined && (this.doll_toAtomMovement.targetTrigger === true || this.doll_toAtomMovement.positionTrigger === true)){
           
        var offset2, 
            newTarget,
            ltarg,
            distanceVec,
            lpos,
            targConnectVector = this.doll_toAtomMovement.targConnectVector.clone(),
            posConnectVector = this.doll_toAtomMovement.posConnectVector.clone(),
            simultanousFactor = targConnectVector.length()/posConnectVector.length(); 

        // calcs for target
        if(this.doll_toAtomMovement.targetTrigger){ 
            
          this.doll_toAtomMovement.targetFactor += offset/3 ;

          ltarg = targConnectVector.length() ;

          if(this.doll_toAtomMovement.targetFactor > ltarg){  
            this.doll_toAtomMovement.targetFactor = ltarg ;
            this.doll_toAtomMovement.targetTrigger = false; 

            if(this.doll_toAtomMovement.positionTrigger === false){
              this.doll_toAtomMovement.orbitControl.control.target = new THREE.Vector3(
                this.doll_toAtomMovement.newTarget.x,
                this.doll_toAtomMovement.newTarget.y,
                this.doll_toAtomMovement.newTarget.z

                );
            }
          }
          targConnectVector.setLength(this.doll_toAtomMovement.targetFactor);

          this.doll_toAtomMovement.orbitControl.control.target.set(
            this.doll_toAtomMovement.oldTarget.x + targConnectVector.x, 
            this.doll_toAtomMovement.oldTarget.y + targConnectVector.y, 
            this.doll_toAtomMovement.oldTarget.z + targConnectVector.z
          );
          
        }

        // calcs for position
        if(this.doll_toAtomMovement.positionTrigger){
          
          lpos = posConnectVector.length() ;

          this.doll_toAtomMovement.posFactor += ((lpos * offset) / (100) ); 
 
          if(this.doll_toAtomMovement.posFactor > lpos){  
            this.doll_toAtomMovement.posFactor = lpos ;
            this.doll_toAtomMovement.positionTrigger = false; 

            this.doll_toAtomMovement.orbitControl.camera.position.set(
              this.doll_toAtomMovement.oldPos.x + posConnectVector.x, 
              this.doll_toAtomMovement.oldPos.y + posConnectVector.y, 
              this.doll_toAtomMovement.oldPos.z + posConnectVector.z
            );

            if(this.doll_toAtomMovement.targetTrigger === false){
              this.doll_toAtomMovement.orbitControl.control.target = new THREE.Vector3(
                this.doll_toAtomMovement.newTarget.x,
                this.doll_toAtomMovement.newTarget.y,
                this.doll_toAtomMovement.newTarget.z

              );
            }
            this.doll_toAtomMovement.atom.visible = false;
          }
          else{  
            posConnectVector.setLength(this.doll_toAtomMovement.posFactor);
             
            this.doll_toAtomMovement.orbitControl.camera.position.set(
              this.doll_toAtomMovement.oldPos.x + posConnectVector.x, 
              this.doll_toAtomMovement.oldPos.y + posConnectVector.y, 
              this.doll_toAtomMovement.oldPos.z + posConnectVector.z
            );
          }

        }
      }
    }
    lastTime = timeNow;
  };
    
  return Animate;

});
