
'use strict';

define([ 
  'jquery', 
  'underscore'
], function( 
  jQuery, 
  _
) { 

  function SceneResizer(crystalRenderer, motifRenderer, unitCellRenderer, hudDisplayFactor, dollEditor) {
    
    this.crystalRenderer = crystalRenderer ;
    this.unitCellRenderer = unitCellRenderer ;
    this.motifRenderer = motifRenderer ;   
    this.hudDisplayFactor = hudDisplayFactor ;  
    this.dollEditor = dollEditor ;  
  };

  SceneResizer.prototype.resize = function(state){
    var width = jQuery('#app-container').width() ;
    var height = $(window).height() ;
    var _this = this;

    $("#leapIcon").css({ 
      "width": width/15,
      "height": width/30,  
      "right": 5,  
      "top": 5,  
     "background-size": (width/15)+"px "+(width/30)+"px"
    });

    if( state === 'motifScreen'){
      this.crystalRenderer.changeContainerDimensions(width/2, height/2);
      this.unitCellRenderer.changeContainerDimensions(width/2, height/2);
      this.motifRenderer.changeContainerDimensions(width, height/2);    

      $('#crystalRenderer').width(width/2);
      $('#crystalRenderer').height(height/2);
    
      $('#crystalRendererCaption').width((width/2)-20);
      $('#crystalRendererCaption').height((height/2)-10);
      $('#crystalRendererCaption').css('display','block');
      $('#crystalRendererCaption').css('left',width/2);

      $('#unitCellRenderer').width(width/2);
      $('#unitCellRenderer').height(height/2);
        
      $('#unitCellRendererCaption').width((width/2)-10);
      $('#unitCellRendererCaption').height((height/2)-10);
      $('#unitCellRendererCaption').css('display','block');

      $('#motifRenderer').width(width);
      $('#motifRenderer').height(height/2);
      $('#motifRenderer').css( "top", height/2 );
        
      $('#motifScreenTableCaption').css('display','table');

      $('#motifPosX').css( "width", width/3 );
      $('#motifPosX').css( "height", height/2 );

      $('#motifPosY').css( "width", width/3 );
      $('#motifPosY').css( "height", height/2 );

      $('#motifPosZ').css( "width", width/3 );
      $('#motifPosZ').css( "height", height/2 );
        
      $('#motifPosXCaption').css( "width", width/3 );
      $('#motifPosXCaption').css( "height", height/2 );

      $('#motifPosYCaption').css( "width", width/3 );
      $('#motifPosYCaption').css( "height", height/2 );

      $('#motifPosZCaption').css( "width", width/3 );
      $('#motifPosZCaption').css( "height", height/2 );
 
      $('#hudRendererCube').width((0.5 * 1.5 * width) / this.hudDisplayFactor);
      $('#hudRendererCube').height((0.5 * 1.5 * height) / this.hudDisplayFactor);
        
      
    }
    else{
      this.crystalRenderer.changeContainerDimensions(width, height);
      this.unitCellRenderer.changeContainerDimensions(0,0);
      this.motifRenderer.changeContainerDimensions(0,0); 

      $('#crystalRenderer').width(width);
      $('#crystalRenderer').height(height);
        
      $('#crystalRendererCaption').width(0);
      $('#crystalRendererCaption').height(0);
      $('#crystalRendererCaption').css('display','none');

      $('#unitCellRenderer').width(0);
      $('#unitCellRenderer').height(0);
        
      $('#unitCellRendererCaption').width(0);
      $('#unitCellRendererCaption').height(0);
      $('#unitCellRendererCaption').css('display','none');

      $('#motifRenderer').width(0); 
      $('#motifRenderer').height(0);

      $('#motifPosX').css( "width", 0 );
      $('#motifPosX').css( "height", 0 );

      $('#motifPosY').css( "width", 0 );
      $('#motifPosY').css( "height", 0 );

      $('#motifPosZ').css( "width", 0 );
      $('#motifPosZ').css( "height", 0 );
        
      $('#motifScreenTableCaption').css('display','none');
        
      $('#motifPosXCaption').css( "width", 0 );
      $('#motifPosXCaption').css( "height", 0 );

      $('#motifPosYCaption').css( "width", 0 );
      $('#motifPosYCaption').css( "height", 0 );

      $('#motifPosZCaption').css( "width", 0 );
      $('#motifPosZCaption').css( "height", 0 );
      
      $('#hudRendererCube').width(width/this.hudDisplayFactor);
      $('#hudRendererCube').height(height/this.hudDisplayFactor);

    }
    
    setTimeout(_this.dollEditor.rePosition.bind(_this.dollEditor),100);
  };
 
  return SceneResizer;
  
});
