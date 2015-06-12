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

    for (var i = wavesNames.length - 1; i >= 0; i--) {
      this.wavesTrigger[wavesNames[i]] = false;
      this.waves[wavesNames[i]] = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 32, 32 ) , new THREE.MeshBasicMaterial( { blending: THREE.AdditiveAlphaBlending,color: '#0066CC', side: THREE.DoubleSide, transparent:true, opacity:0.1 ,depthWrite:false} ) );
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
    }
    lastTime = timeNow;
  };
    
  return Animate;

});
