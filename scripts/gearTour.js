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
  function GearTour(crystalScene, motifEditor, lattice, menu) { 
    
    this.crystalScene = crystalScene ;
    this.motifEditor = motifEditor ; 
    this.lattice = lattice ;
    this.crystalHasChanged = true ;
    this.menu = menu;
    this.state = 5;
  };
 
  GearTour.prototype.setState = function(state){

    if(this.lattice.actualAtoms.length === 0) {
      return;
    }

    if(state !== 5){
      this.menu.switchTab('visualTab');
      this.menu.setTabDisable({
        'latticeTab': true,
        'motifLI':true,
        'millerPI':true,
        'publicTab':true
      });
    }
    else if( state === 5){
      this.menu.setTabDisable({
        'latticeTab': false,
        'motifLI':false,
        'millerPI':false,
        'publicTab':false
      });
    }
    this.state = state;

    this.menu.resetProgressBar( 'Processing...');

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
    this.menu.progressBarFinish();    

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
  GearTour.prototype.removeSubtractedCell = function () {
    this.crystalHasChanged = true ;
    var j=0;
    var scene = this.crystalScene.object3d;
    while(j < this.lattice.actualAtoms.length ) {  
      if(this.lattice.actualAtoms[j].subtractedForGear.object3d !== undefined) {
        this.lattice.actualAtoms[j].removeSubtractedForGear();   
      };
      j++;
    } 

    this.setActualAtoms(true, []);
    this.setMillers(true);  

  };
  GearTour.prototype.hideSubtractedCell = function(){
    var j=0;
    while(j < this.lattice.actualAtoms.length ) {  
      if(this.lattice.actualAtoms[j].subtractedForGear.object3d !== undefined) {
        this.lattice.actualAtoms[j].subtractedForGear.object3d.visible = false;   
      };
      j++;
    }  

  };
  GearTour.prototype.subtractedCell = function(){
 
    var geometry = new THREE.Geometry(), i=0;  
    var scene = this.crystalScene.object3d;
    var indexes = this.findCellIndexes();
    var viewBox = [] ;
    var box;
    var j = 0 ;

    while(j < this.lattice.actualAtoms.length ) { 
      var inTheCell = indexes.hasOwnProperty(this.lattice.actualAtoms[j].latticeIndex);
      if(inTheCell){
         
        if((this.lattice.actualAtoms[j].subtractedForGear.object3d !== undefined) && !(this.crystalHasChanged)){
          this.lattice.actualAtoms[j].subtractedForGear.object3d.visible = true;  
        }
        else{  
             
          if(box === undefined){  
            var vb ;
            if(!(this.motifEditor.latticeType === 'hexagonal')){  
              viewBox['_000'] = this.lattice.points['r_0_0_0_0'].object3d ;
              viewBox['_001'] = this.lattice.points['r_0_0_1_0'].object3d ;
              viewBox['_010'] = this.lattice.points['r_0_1_0_0'].object3d ;
              viewBox['_011'] = this.lattice.points['r_0_1_1_0'].object3d ;
              viewBox['_100'] = this.lattice.points['r_1_0_0_0'].object3d ;
              viewBox['_101'] = this.lattice.points['r_1_0_1_0'].object3d ;
              viewBox['_110'] = this.lattice.points['r_1_1_0_0'].object3d ;
              viewBox['_111'] = this.lattice.points['r_1_1_1_0'].object3d ;
            
              vb = this.lattice.customBox(viewBox) ;
            }
            else{
              vb = this.lattice.customBoxForHexCell(); 
            }
            
            box = new THREE.Mesh(vb, new THREE.MeshLambertMaterial({color:"#FF0000" }) );
             
          } 
          this.lattice.actualAtoms[j].subtractedSolidView( box, this.lattice.actualAtoms[j].object3d.position, true );
        } 
      } 
      j++;
    }   
    this.crystalHasChanged = false; 
  };
  GearTour.prototype.findCellIndexes = function(){
    
    var indexes = {}, _this = this ;

    if(this.motifEditor.latticeType === 'hexagonal'){
      var a = this.lattice.parameters.scaleZ ;
      var c = this.lattice.parameters.scaleY ;
      var co = 0 ;

      var vertDist = a * Math.sqrt(3);
 
      _.times(2, function(_y) {
        _.times(1   , function(_x) {
          _.times(1  , function(_z) {
            
            // point in the middle
            var z = (_x % 2==0) ? (_z*vertDist) : ((_z*vertDist + vertDist/2));
            var y =  _y*c ;
            var x = _x*a*1.5 ;
            var reference = 'h_'+(x).toFixed(2)+(y).toFixed(2)+(z).toFixed(2) ; 
            indexes[reference] = true; 
            // point in the middle 

            _.times(6 , function(_r) {

              var v = new THREE.Vector3( a, 0, 0 ); 
              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
              
              var position = new THREE.Vector3( x, y, z);
              z = z.toFixed(2) ;
              if(z==0) z = '0.00'; // check for negative zeros  

              var reference = 'h_'+(x).toFixed(2)+(y).toFixed(2)+z ;
               
              if (_.isUndefined( indexes[reference])) { 
                
                indexes[reference] = true ;   
                 
              }  
            }); 
          });
        });
      }); 

    }
    else{  
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
    }

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
