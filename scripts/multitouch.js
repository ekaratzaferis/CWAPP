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

    document.addEventListener( 'touchstart', touchstart, true ); 
    document.addEventListener( 'touchmove' , touchmove,  true ); 
    document.addEventListener( 'touchend'  , touchend,   true ); 
    
    this.keyboard = keyboard;
    this.lastFingersPosition = { x : 0, y : 0 };

  }; 
   
  Multitouch.prototype.touchend = function( event ) {
    this.fingersPosition = { x : 0, y : 0 };
     
  }; 
  Multitouch.prototype.touchstart = function( event ) {
    
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
        
        if(x<0){
          this.keyboard.handleKeys({left : true}, x);
        }
        else if(x >0){
          this.keyboard.handleKeys({right : true}, x);
        }
        
        this.lastFingersPosition = { x : event.touches[ 0 ].pageX, y : event.touches[ 0 ].pageY };
        break;

      case 2: // two-fingered touch: WASD

         
        break;

      case 3: // three-fingered touch: UP/DOWN

        //event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
        break;
  

    }

  }
  Multitouch.prototype.onDocumentMouseUp  = function(event){  
      
  }; 

  return Multitouch;
  
});  
