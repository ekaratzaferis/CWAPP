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
  var stateNames = [ 'Lattice Points', 'The motif', 'The cropped unit cell', 'Whole unit cell', 'the crystal' ];
  function GearTour(crystalScene, motifEditor, lattice) { 
    
    this.crystalScene = crystalScene ;
    this.motifEditor = motifEditor ; 
    this.lattice = lattice ;
     
  };
 
  GearTour.prototype.setState = function(state){

    $("#gearBarLabel").text(stateNames[state-1]);
 
    switch(state){ 

      case 1:  
        this.setActualAtoms(false, 1);
        this.setMillers(false); 
        this.hideSubtractedCell();
      break;


      case 2:  
        this.setActualAtoms(false,2);
        this.setMillers(false); 
        this.hideSubtractedCell();
      break;


      case 3:  
        this.setActualAtoms(false,3); 
        this.setMillers(true);
        this.subtractedCell(); 
      break;


      case 4:  
        this.setActualAtoms(false, 4);
        this.setMillers(true); 
        this.hideSubtractedCell();
      break;


      case 5:  
        this.setActualAtoms(true, []);
        this.setMillers(true); 
        this.hideSubtractedCell();
      break;

    }
  };
  
  GearTour.prototype.setActualAtoms = function(bool, state){
 
    var l = this.lattice, _this = this; 
    var indexes;
    if(state ===4 && bool === false) {
      indexes = _this.findCellIndexes() ;
    }

    l.actualAtoms.forEach(function(atom, i) { 
      var visible = false ;
      if(state === 2 && bool === false ){
        visible = (atom.centerOfMotif.x === 0 && atom.centerOfMotif.y === 0 && atom.centerOfMotif.z === 0 ) ? true : false ;
        atom.object3d.visible = visible ;
      }
      else if(state === 3 && bool === false){
        atom.object3d.visible = bool ; 
      }
      else if(state === 4 && bool === false){
        visible = indexes.hasOwnProperty(atom.latticeIndex);
        atom.object3d.visible = visible ;
      }
      else{
        atom.object3d.visible = bool ;
      }
 
    });
  
  };  
  GearTour.prototype.hideSubtractedCell = function(){
    var j=0;
    while(j < this.lattice.actualAtoms.length ) { 
      console.log(this.lattice.actualAtoms[j].subtractedForGear.object3d);
      if(this.lattice.actualAtoms[j].subtractedForGear.object3d !== undefined) this.lattice.actualAtoms[j].subtractedForGear.object3d.visible = false;   
      j++;
    }  

  };
  GearTour.prototype.subtractedCell = function(){
 
    var geometry = new THREE.Geometry(), i=0;  
    var scene = this.crystalScene.object3d;
    var indexes = this.findCellIndexes();
 
    var g = this.motifEditor.customBox(this.motifEditor.unitCellPositions, this.motifEditor.latticeName);
    var box = new THREE.Mesh(g, new THREE.MeshLambertMaterial({color:"#FF0000" }) );
     
    var j = 0 ;
    while(j < this.lattice.actualAtoms.length ) {
      var inTheCell = indexes.hasOwnProperty(this.lattice.actualAtoms[j].latticeIndex);
      if(inTheCell){
        if(this.lattice.actualAtoms[j].subtractedForGear.object3d !== undefined){
          this.lattice.actualAtoms[j].subtractedForGear.object3d.visible = true; 
        }
        else{ 
          this.lattice.actualAtoms[j].subtractedSolidView( box, this.lattice.actualAtoms[j].object3d.position, true );
        } 
      } 
      j++;
    }   

  };
  GearTour.prototype.findCellIndexes = function(){

    var indexes = {};
    var origin = this.lattice.lattice.originArray[0];
    var vector = this.lattice.lattice.vector;
    var originLength = this.lattice.lattice.originArray.length ;
    var originArray = this.lattice.lattice.originArray, position, reference ;
    var limit = new THREE.Vector3(
      vector.x + origin.x,
      vector.y + origin.y,
      vector.z + origin.z
    );

    _.times(2, function(_x) {
      _.times(2, function(_y) {
        _.times(2, function(_z) {  
          for (var index = 0; index < originLength; index++) {
            origin = originArray[index];
            position = new THREE.Vector3(
              _x * vector.x + origin.x,
              _y * vector.y + origin.y,
              _z * vector.z + origin.z
            ); 
            if (position.x <= limit.x && position.y <= limit.y && position.z <= limit.z) 
            {     
              reference = 'r_' + _x + '_' + _y + '_' + _z + '_' + index;
               
              if (_.isUndefined(indexes[reference])) {
                indexes[reference] = true ;   
              }
            }                   
          }
        });  
      });  
    });

    return indexes;
  };
  GearTour.prototype.setMillers = function(bool){
 
    var l = this.lattice; 

    l.millerPlanes.forEach(function(plane) {
      plane.plane.object3d.visible = bool ;
    });
    l.millerDirections.forEach(function(dir) {
      dir.direction.setVisible(bool);  
    });

  }; 
  return GearTour;

});
