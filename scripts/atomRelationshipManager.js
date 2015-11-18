
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore', 
  'dollExplorer'
], function(
  THREE,
  jQuery,
  PubSub,
  _, 
  DollExplorer 
  
) {  
  function AtomRelationshipManager(lattice, motifEditor) {
 
    var _this = this;
    
    this.lattice = lattice;
    this.motifEditor = motifEditor;
    this.highlightOverlapState = false;
  };    

  AtomRelationshipManager.prototype.checkCellforOverlap = function(arg){
    if(this.highlightOverlapState === true){
      for (var i = this.motifEditor.unitCellAtoms.length - 1; i >= 0; i--) {
        for (var j = this.motifEditor.unitCellAtoms.length - 1; j >= 0; j--) {
          var ri = this.motifEditor.unitCellAtoms[i].radius;
          var rj = this.motifEditor.unitCellAtoms[j].radius;

          var tangentDist = ri + rj;

          var realDist = (this.motifEditor.unitCellAtoms[j].object3d.position).distanceTo(this.motifEditor.unitCellAtoms[i].object3d.position);
 
          if(realDist !== 0 && realDist + 0.0000001< tangentDist ){
                
            this.motifEditor.unitCellAtoms[j].setColorMaterial('#ff0000'); 
            this.motifEditor.unitCellAtoms[i].setColorMaterial('#ff0000'); 

          }
        };
      };
    }
    else if(this.highlightOverlapState === false){
      for (var i = this.motifEditor.unitCellAtoms.length - 1; i >= 0; i--) { 
        
        if(this.motifEditor.unitCellAtoms[i].setColorMaterial !== undefined){
          this.motifEditor.unitCellAtoms[i].setColorMaterial(this.motifEditor.unitCellAtoms[i].getOriginalColor()); 
        }
         
      };
    }
  };
  AtomRelationshipManager.prototype.checkMotiforOverlap = function(arg){

    if(this.motifEditor.newSphere !== undefined){
      this.motifEditor.motifsAtoms.push(this.motifEditor.newSphere);
    }

    if(this.highlightOverlapState === true){
      for (var i = this.motifEditor.motifsAtoms.length - 1; i >= 0; i--) {
        for (var j = this.motifEditor.motifsAtoms.length - 1; j >= 0; j--) {
          var ri = this.motifEditor.motifsAtoms[i].radius;
          var rj = this.motifEditor.motifsAtoms[j].radius;

          var tangentDist = ri + rj;

          var posj = new THREE.Vector3(this.motifEditor.motifsAtoms[j].position.x, this.motifEditor.motifsAtoms[j].position.x, this.motifEditor.motifsAtoms[j].position.z);
          var posi = new THREE.Vector3(this.motifEditor.motifsAtoms[i].position.x, this.motifEditor.motifsAtoms[i].position.x, this.motifEditor.motifsAtoms[i].position.z);

          var realDist = (posi).distanceTo(posj);

          if(realDist !== 0 && realDist + 0.0000001< tangentDist ){
                
            this.motifEditor.motifsAtoms[j].setColorMaterial('#ff0000'); 
            this.motifEditor.motifsAtoms[i].setColorMaterial('#ff0000'); 

          }
        };
      };
    }
    else if(this.highlightOverlapState === false){
      for (var i = this.motifEditor.motifsAtoms.length - 1; i >= 0; i--) { 
          
        this.motifEditor.motifsAtoms[i].setColorMaterial(this.motifEditor.motifsAtoms[i].getOriginalColor()); 
        
      };
    }

    if(this.motifEditor.newSphere !== undefined){
      this.motifEditor.motifsAtoms.pop();
    }
  };
  AtomRelationshipManager.prototype.checkForOverlap = function(arg){

    if(arg !== undefined){  
      this.highlightOverlapState = arg.highlightTangency;
    }

    this.checkCrystalforOverlap();
    this.checkMotiforOverlap();
    this.checkCellforOverlap();
  }
  AtomRelationshipManager.prototype.checkCrystalforOverlap = function(arg){
  
    if(this.highlightOverlapState === true){
      for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) {
        for (var j = this.lattice.actualAtoms.length - 1; j >= 0; j--) {
          var ri = this.lattice.actualAtoms[i].radius;
          var rj = this.lattice.actualAtoms[j].radius;

          var tangentDist = ri + rj;

          var realDist = (this.lattice.actualAtoms[j].object3d.position).distanceTo(this.lattice.actualAtoms[i].object3d.position);
 
          if(realDist !== 0 && realDist + 0.0000001< tangentDist ){
                
            this.lattice.actualAtoms[j].setColorMaterial('#ff0000'); 
            this.lattice.actualAtoms[i].setColorMaterial('#ff0000'); 

          }
        };
      };
    }
    else if(this.highlightOverlapState === false){
      for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
          
        this.lattice.actualAtoms[i].setColorMaterial(this.lattice.actualAtoms[i].cachedColor); 
        
      };
    }
  }
  return AtomRelationshipManager;
  
});  
