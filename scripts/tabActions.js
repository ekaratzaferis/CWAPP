"use strict";

define([
  "three", 
  "underscore",
  "jquery"
], function(
  THREE, 
  _,
  jQuery
) {
 
  function TabActions(lattice, motifEditor, crystalRenderer, unitCellRenderer,crystalScreenEvents, motifRenderer, dollEditor, hudCube, hudArrows, CubeEvent, sceneResizer, gearTour) { 
   
    this.lattice = lattice;
    this.motifEditor = motifEditor; 
    this.crystalRenderer = crystalRenderer ;
    this.dollEditor = dollEditor ;
    this.hudCube = hudCube ;
    this.hudArrows = hudArrows ;
    this.CubeEvent = CubeEvent ;
    this.sceneResizer = sceneResizer ;
    this.unitCellRenderer = unitCellRenderer ;
    this.crystalScreenEvents = crystalScreenEvents ;
    this.motifRenderer = motifRenderer ;
    this.gearTour = gearTour ;
  };

  TabActions.prototype.tabClick = function(tabId) {
    
    var height = $(window).height() ;
    var  width = $('#app-container').width(); ;
  
    //

    if(tabId === "millerPI" ){ 
      if(this.lattice.latticeName === 'hexagonal'){
        $(".hexagonalMiller").css('display','block');
      }
      else{
        $(".hexagonalMiller").css('display','none'); 
      }  
    }  

    if( (tabId === "motifLI" ) && !($('#selected_lattice').html() === 'Choose a Lattice') && this.gearTour.state === 5){     
      
      this.dollEditor.setVisibility(false); 
      this.hudCube.setVisibility(false);
      this.hudArrows.setVisibility(false);
      this.CubeEvent.enableCubeEvents = false ;

      this.sceneResizer.resize('motifScreen');
                                                                            
      this.unitCellRenderer.startAnimation();                                                                    
      this.motifRenderer.startAnimation(); 
      this.motifEditor.updateLatticeParameters(this.lattice.getAnglesScales(), this.lattice.getLatticeType(), this.lattice.getLatticeName(), this.lattice.getLatticeSystem());

      this.crystalScreenEvents.state = 'motifScreen';
 
    }
    else if(tabId !== "motifLI" ){   
      if(
        (this.lattice.viewMode !== 'crystalClassic' || this.gearTour.state !== 5) && 
        ( tabId === "latticeTab" || tabId === "publicTab")
      ){
        return;
      } 

      if(tabId === "latticeTab"){
        this.lattice.updateLatticeUI(this.motifEditor.cellParameters);
      }
        console.log(99);
      this.dollEditor.setVisibility(true);
      this.hudCube.setVisibility(true);
      this.hudArrows.setVisibility(true);
      this.CubeEvent.enableCubeEvents = true ;

      this.sceneResizer.resize('crystal');
       
      this.crystalRenderer.changeContainerDimensions(width,height); 
      this.motifRenderer.changeContainerDimensions(0, 0);

      if(this.unitCellRenderer.ucViewport === false){
        this.unitCellRenderer.changeContainerDimensions(0,0);
        this.unitCellRenderer.stopAnimation();
      }
      else {
        this.unitCellRenderer.setUCviewport(true);
      }
      this.motifRenderer.stopAnimation(); 
      this.crystalScreenEvents.state = 'default';
 
    }
 
  }; 
 

  return TabActions;
});
