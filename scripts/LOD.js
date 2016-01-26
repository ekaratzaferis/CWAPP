
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore' 
], function(
  THREE,
  jQuery,
  PubSub,
  _  
) { 

  var instance;
  var storedTextures = {};

  function LOD( lattice, motifEditor, menu) {

    this.lattice = lattice;
    this.motifEditor = motifEditor;
    this.menu = menu;
    this.lodLevel = 3;
     
  } 
  LOD.prototype.setLOD = function(arg){ 

    this.lodLevel = arg;
    this.lattice.LOD.level = this.lodLevel;
    this.motifEditor.LOD.level = this.lodLevel;

    var g = new THREE.OctahedronGeometry(1, this.lodLevel); 

    // lattice atoms
    for (var i = 0, len = this.lattice.actualAtoms.length; i < len; i++) { 
      this.lattice.actualAtoms[i].lod = this.lodLevel;
      var chs = this.lattice.actualAtoms[i].setNewLodGeometry();
    }  
    for (var i = 0, len = this.lattice.cachedAtoms.length; i < len; i++) { 
      this.lattice.cachedAtoms[i].lod = this.lodLevel;
      var chs = this.lattice.cachedAtoms[i].setNewLodGeometry();
    }
    this.lattice.crystalNeedsRecalculation = {'crystalSolidVoid' : true, 'crystalSubstracted' : true}; // for view modes 
    this.lattice.setCSGmode({mode : 'crystalClassic'}, 'reset');
    this.menu.chooseActiveCrystalMode('crystalClassic');

    // ME atoms
    for (var i = 0, len = this.motifEditor.unitCellAtoms.length; i < len; i++) { 
      this.motifEditor.unitCellAtoms[i].lod = this.lodLevel;
      var chs = this.motifEditor.unitCellAtoms[i].setNewLodGeometry();
    }  
    for (var i = 0, len = this.motifEditor.cachedAtoms.length; i < len; i++) { 
      this.motifEditor.cachedAtoms[i].lod = this.lodLevel;
      var chs = this.motifEditor.cachedAtoms[i].setNewLodGeometry(); 
    }
    for (var i = 0, len = this.motifEditor.motifsAtoms.length; i < len; i++) { 
      this.motifEditor.motifsAtoms[i].lod = this.lodLevel;
      var chs = this.motifEditor.motifsAtoms[i].setNewLodGeometry();
    } 
    if(this.motifEditor.newSphere !== undefined){
      this.motifEditor.newSphere.lod = this.lodLevel; 
      this.motifEditor.newSphere.setNewLodGeometry(); 
    }
    this.motifEditor.cellNeedsRecalculation = {'cellSolidVoid' : true, 'cellSubstracted' : true}; 
    if(this.motifEditor.viewMode !== 'cellClassic' ){
      this.motifEditor.setCSGmode({mode : 'cellClassic'} , 'reset' );
      this.menu.chooseActiveUnitCellMode('cellClassic');
    }

    $( "#vertices" ).html( g.vertices.length );
 
  } 
  return LOD;
});  
