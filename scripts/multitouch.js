'use strict';
define([
  'jquery' 
], function(
  jQuery  
) { 
   
  function Multitouch(domElement, keyboard) {

    var _this = this;
 
    var touchstart = this.touchstart.bind(_this) ;  
    var touchmove  = this.touchmove.bind(_this) ;  
    var touchend   = this.touchend.bind(_this) ;  

    document.getElementById('crystalRendererMouse').addEventListener( 'touchstart', touchstart, true ); 
    document.getElementById('crystalRendererMouse').addEventListener( 'touchmove' , touchmove,  true ); 
    document.getElementById('crystalRendererMouse').addEventListener( 'touchend'  , touchend,   true ); 
    
    this.keyboard = keyboard;
    this.lastFingersPosition = { x : 0, y : 0 };
    this.touchDevice = false;

  }; 
   
  Multitouch.prototype.touchend = function( event ) {
    this.fingersPosition = { x : 0, y : 0 };
     
  }; 
  Multitouch.prototype.touchstart = function( event ) {
    
    this.touchDevice = true;

    switch ( event.touches.length ) {

      case 1: // one-fingered touch: rotate
        this.lastFingersPosition = { x : event.touches[ 0 ].pageX, y : event.touches[ 0 ].pageY };
        break;

      case 2: // two-fingered touch: dolly

         
        break;

      case 3: // three-fingered touch: pan

        //event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
        break;
 

    }
  
  };
  Multitouch.prototype.touchmove = function( event ) {
      
    switch ( event.touches.length ) {

      case 1: // one-fingered touch 
   
        var x = event.touches[ 0 ].pageX - this.lastFingersPosition.x ;
        var y = this.lastFingersPosition.y - event.touches[ 0 ].pageY ;
        
        if(Math.abs(x) > Math.abs(y)){
 
          if(x < 0){
            
            this.keyboard.handleKeys({rotLeft : true}, 0.75 );
          }
          else if(x > 0){ 
            this.keyboard.handleKeys({rotRight : true}, 0.75 );
          }
        }
        else{
          if(y < 0){ 
            this.keyboard.handleKeys({ rotUp: true}, 0.75 );
          }
          else if(y > 0){ 
            this.keyboard.handleKeys({ rotDown: true}, 0.75 );
          }
        }
        break;

      case 2: // two-fingered touch: WASD
        var x = event.touches[ 0 ].pageX - this.lastFingersPosition.x ;
        var y = this.lastFingersPosition.y - event.touches[ 0 ].pageY ;
        
        if(Math.abs(x) > Math.abs(y)){
          if(x<0){ 
            this.keyboard.handleKeys({left : true}, 1 );
          }
          else if(x >0){ 
            this.keyboard.handleKeys({right : true}, 1 );
          }
        }
        else{
          if(y<0){ 
            this.keyboard.handleKeys({ back : true}, 4 );
          }
          else if(y >0){ 
            this.keyboard.handleKeys({ forth: true}, 4 );
          }
        }
          
        break;

      case 3: // three-fingered touch: UP/DOWN

        var x = event.touches[ 0 ].pageX - this.lastFingersPosition.x ;
        var y = this.lastFingersPosition.y - event.touches[ 0 ].pageY ;
        
        if(Math.abs(x) > Math.abs(y)){

          return;
          if(x<0){
            
            this.keyboard.handleKeys({left : true}, 1 );
          }
          else if(x >0){ 
            this.keyboard.handleKeys({right : true}, 1 );
          }
        }
        else{
          if(y<0){ 
            this.keyboard.handleKeys({ up : true}, 1 );
          }
          else if(y >0){ 
            this.keyboard.handleKeys({ down: true}, 1 );
          }
        }
        break;
   
    }
    
    this.lastFingersPosition = { x : event.touches[ 0 ].pageX, y : event.touches[ 0 ].pageY };

  }
  Multitouch.prototype.onDocumentMouseUp  = function(event){  
      
  }; 

  return Multitouch;
  
});  
