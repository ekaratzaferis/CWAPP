
'use strict';

define([ 
  'jquery', 
  'underscore'
], function( 
  jQuery, 
  _
) { 

  function SceneResizer(crystalRenderer, motifRenderer, unitCellRenderer ) {
    this.crystalRenderer = crystalRenderer ;
    this.unitCellRenderer = unitCellRenderer ;
    this.motifRenderer = motifRenderer ; 
 
  };

  SceneResizer.prototype.resize = function(width, height, state){
    width = jQuery('#app-container').width() ;

    if( state === 'motifScreen'){
      this.crystalRenderer.changeContainerDimensions(width/2, height/2);
      this.unitCellRenderer.changeContainerDimensions(width/2, height/2);
      this.motifRenderer.changeContainerDimensions(width, height/2);    

      $('#crystalRenderer').width(width/2);
      $('#crystalRenderer').height(height/2);
      $('#crystalRenderer').css( "left", width/2 );

      $('#unitCellRenderer').width(width/2);
      $('#unitCellRenderer').height(height/2);

      $('#motifRenderer').width(width);
      $('#motifRenderer').height(height/2);
      $('#motifRenderer').css( "top", height/2 );

      $('#motifPosX').css( "width", width/3 );
      $('#motifPosX').css( "height", height/2 );

      $('#motifPosY').css( "width", width/3 );
      $('#motifPosY').css( "height", height/2 );

      $('#motifPosZ').css( "width", width/3 );
      $('#motifPosZ').css( "height", height/2 );

    }
    else{
      this.crystalRenderer.changeContainerDimensions(width,height);
      this.unitCellRenderer.changeContainerDimensions(0,0);
      this.motifRenderer.changeContainerDimensions(0,0); 

      $('#crystalRenderer').width(width);
      $('#crystalRenderer').height(height);
      $('#crystalRenderer').css( "left", 0 );

      $('#unitCellRenderer').width(0);
      $('#unitCellRenderer').height(0);

      $('#motifRenderer').width(0); 
      $('#motifRenderer').height(0);

      $('#motifPosX').css( "width", 0 );
      $('#motifPosX').css( "height", 0 );

      $('#motifPosY').css( "width", 0 );
      $('#motifPosY').css( "height", 0 );

      $('#motifPosZ').css( "width", 0 );
      $('#motifPosZ').css( "height", 0 );
      
    }

    
  };
 
  return SceneResizer;
  
});
