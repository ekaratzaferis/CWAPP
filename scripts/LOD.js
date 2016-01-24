
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

  function LOD( lattice, motifEditor) {

    this.lattice = lattice;
    this.motifEditor = motifEditor;
     
  } 
  LOD.prototype.setLOD = function(arg){ 

    this.lattice.LOD.level = arg;
    this.motifEditor.LOD.level = arg;
    
    var g = new THREE.OctahedronGeometry(1, arg); 

    // lattice atoms
    for (var i = 0, len = this.lattice.actualAtoms.length; i < len; i++) { 
      this.lattice.actualAtoms[i].lod = arg;
      var chs = this.lattice.actualAtoms[i].setNewLodGeometry();
    }  
    for (var i = 0, len = this.lattice.cachedAtoms.length; i < len; i++) { 
      this.lattice.cachedAtoms[i].lod = arg;
      var chs = this.lattice.cachedAtoms[i].setNewLodGeometry();
    }

    // ME atoms
    for (var i = 0, len = this.motifEditor.unitCellAtoms.length; i < len; i++) { 
      this.motifEditor.unitCellAtoms[i].lod = arg;
      var chs = this.motifEditor.unitCellAtoms[i].setNewLodGeometry();
    }  
    for (var i = 0, len = this.motifEditor.cachedAtoms.length; i < len; i++) { 
      this.motifEditor.cachedAtoms[i].lod = arg;
      var chs = this.motifEditor.cachedAtoms[i].setNewLodGeometry(); 
    }
    for (var i = 0, len = this.motifEditor.motifsAtoms.length; i < len; i++) { 
      this.motifEditor.motifsAtoms[i].lod = arg;
      var chs = this.motifEditor.motifsAtoms[i].setNewLodGeometry();
    } 
    if(this.motifEditor.newSphere !== undefined){
      this.motifEditor.newSphere.lod = arg; 
      this.motifEditor.newSphere.setNewLodGeometry(); 
    }

    $( "#vertices" ).html( g.vertices.length );
 
  } 
  return LOD;
});  
