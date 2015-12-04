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
 
  function NoteManager(lattice, menu, crystalCamera) { 
      
    this.lattice = lattice ; 
    this.menu = menu; 
    this.crystalCamera = crystalCamera;  
  };
  
  NoteManager.prototype.outlineAtoms = function(arg) {

    var _this = this;
    var scene = Explorer.getInstance().object3d; 
    
    for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
      if(this.lattice.actualAtoms[i].outlineMesh !== undefined){
        scene.remove(this.lattice.actualAtoms[i].outlineMesh);
        this.lattice.actualAtoms[i].outlineMesh = undefined;
      }
    };

    for (var i = arg.length - 1; i >= 0; i--) {
      var id = parseInt(arg[i]);
      for (var j = this.lattice.actualAtoms.length - 1; j >= 0; j--) {
        
        if(this.lattice.actualAtoms[j].uniqueID === id){ 
          var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0x0040FF, side: THREE.BackSide } );
          var outlineMesh1 = new THREE.Mesh( this.lattice.actualAtoms[j].object3d.children[0].geometry.clone(), outlineMaterial1 );
          outlineMesh1.position.set(this.lattice.actualAtoms[j].object3d.position.x, this.lattice.actualAtoms[j].object3d.position.y, this.lattice.actualAtoms[j].object3d.position.z);
          var sc = this.lattice.actualAtoms[j].getScaledRadius();
          outlineMesh1.scale.set( sc , sc , sc );  
          outlineMesh1.scale.multiplyScalar(1.05);
          this.lattice.actualAtoms[j].outlineMesh = outlineMesh1 ;
          scene.add( this.lattice.actualAtoms[j].outlineMesh ); 
        }
      } 
    };
  };
  NoteManager.prototype.noteMove = function(arg) {
    console.log(arg);
  };
  NoteManager.prototype.noteInitiator = function(arg) {
    console.log(arg);

    var _this = this;

    var scene = Explorer.getInstance().object3d;

    var material = new THREE.LineBasicMaterial({ color: 0xFFFFFF  }) ;
    var geometry = new THREE.Geometry();
    
    var atom = _.find(_this.lattice.actualAtoms, function(a){ return a.uniqueID === arg.id; });

    if(atom === undefined){
      return;
    }
    var atomPos = atom.object3d.position.clone();
    var notePos = this.findNotePoint(arg.x, arg.y);
    geometry.vertices.push( atomPos, notePos );
     
    var mesh = new THREE.Line(geometry, material);

    scene.add(mesh);

  };
  NoteManager.prototype.outlineAtomsWithNotes = function(arg) {
    this.outlineAtoms(arg);
  };
  NoteManager.prototype.setVisibilityOfOutliners = function(bool) {
    for (var i = this.actualAtoms.length - 1; i >= 0; i--) { 
      if(this.actualAtoms[i].outlineMesh !== undefined){ 
        this.actualAtoms[i].outlineMesh.visible = bool;
      }
    };
  };
  
  NoteManager.prototype.findNotePoint = function(x,y){  
    
    var width = jQuery('#app-container').width() ;
    var height = $(window).height() ;

    var vector = new THREE.Vector3();

    vector.set(
        (x/width) * 2 - 1,
        (y/height) * 2 + 1,
        0.5 );

    vector.unproject( this.crystalCamera );

    var dir = vector.sub( this.crystalCamera.position ).normalize();

    var distance = - this.crystalCamera.position.z / dir.z;

    var pos = this.crystalCamera.position.clone().add( dir.multiplyScalar( distance ) );
 
    return pos;
  };  
  return NoteManager;

});
