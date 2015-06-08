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
 
  function Sound() {

    this.procced = true, this.context ;
    var _this = this ;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { 
        this.procced = false;
        alert('Web Audio API not supported in this browser.'); 
    }
    if(this.procced){ 
      this.crystalSoundSource = this.context.createBufferSource();
       
      var request = new XMLHttpRequest();

      request.open('GET', 'sounds/crystalCenter.mp3', true);
      request.setRequestHeader ("Accept", "Access-Control-Allow-Origin: *'"); // to access locally the Mp3s
      request.responseType = 'arraybuffer';

      request.onload = function() {
        var audioData = request.response;

        _this.context.decodeAudioData(audioData, function(buffer) { 
            _this.crystalSoundSource.buffer = buffer;

          },

          function(e){"Error with decoding audio data" + e.err});
  
      }

      request.send();

    }  
  }

  Sound.prototype.crystalCenterPlay = function() {
    
    var sound = this.crystalSoundSource ; 
    
    var dryGainNode = this.context.createGain();
    dryGainNode.gain.value = 0.8;

  
    var panner = this.context.createPanner();
    panner.setPosition(1,1,1);
    sound.connect(panner);
    panner.connect(dryGainNode);
    
    sound.connect(this.context.destination);
    sound.loop = true;
 
    sound.start(0);
  
 };

  Sound.prototype.play = function(sampleName) {
     
  };
    
  return Sound;
});
