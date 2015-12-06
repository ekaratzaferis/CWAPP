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
 
  function NoteManager(lattice, menu, explorer, camera) { 
      
    this.lattice = lattice ; 
    this.menu = menu; 
    this.explorer = explorer;  
    this.camera = camera;  
    this.noteLinesMeshes = [];
  };
  
  NoteManager.prototype.addNote = function(arg) {
     
    var _this = this;
    var scene = Explorer.getInstance().object3d; 
    
    if(arg.add === true){  
      var scene = Explorer.getInstance().object3d;

      var material = new THREE.LineBasicMaterial({ color: 0xFFFFFF  }) ;
      var geometry = new THREE.Geometry();
       
      geometry.vertices.push( new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0.000001) );
       
      var mesh = new THREE.Line(geometry, material);

      this.noteLinesMeshes[arg.id] = mesh;
      this.noteLinesMeshes[arg.id].visible = false;
      scene.add(mesh);
    }
    else if(arg.add === false){
      scene.remove(this.noteLinesMeshes[arg.id]); 
    }

    for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
      if(this.lattice.actualAtoms[i].outlineMesh !== undefined){
        scene.remove(this.lattice.actualAtoms[i].outlineMesh);
        this.lattice.actualAtoms[i].outlineMesh = undefined;
      }
    };
 
    for (var prop in this.noteLinesMeshes) { 

      var id = parseInt(prop);

      if(arg.id !== id || arg.add === true){ 
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
      } 
    }  
    if(arg.add === false){
      this.noteLinesMeshes[arg.id] = undefined;
    }
  };
  NoteManager.prototype.updateNotesPositions = function(arg) { 
    
    this.camera.updateMatrixWorld();
    this.explorer.plane.object3d.lookAt(this.camera.position);
    var cameToCenterScaled = this.camera.position.clone();
    cameToCenterScaled.setLength(cameToCenterScaled.length()*0.9);
    this.explorer.plane.object3d.position.set(cameToCenterScaled.x, cameToCenterScaled.y, cameToCenterScaled.z);
    this.explorer.plane.object3d.updateMatrixWorld();

    var notes = this.menu.getAtomNoteTable();
    for (var i = notes.length - 1; i >= 0; i--) { 
      this.noteMove({ id : parseInt(notes[i].id), x : notes[i].x, y : notes[i].y }, 'camera');
    };

  };
  NoteManager.prototype.noteMove = function(arg, whatMoved) { 
 
    var _this = this;

    if(this.noteLinesMeshes[arg.id] === undefined){
      return;
    }
 
    if(whatMoved === 'camera'){ 
      var atom = _.find(_this.lattice.actualAtoms, function(a){ return a.uniqueID === arg.id; }); 
      var atomPos = atom.object3d.position.clone();
      this.noteLinesMeshes[arg.id].geometry.vertices[ 0 ].set(atomPos.x, atomPos.y, atomPos.z) ; 
    } 
    var notePos = this.findNotePoint(arg.x, arg.y); 
    this.noteLinesMeshes[arg.id].geometry.vertices[ 1 ].set(notePos.x, notePos.y, notePos.z) ;

    this.noteLinesMeshes[arg.id].geometry.verticesNeedUpdate = true; 
 
  };
  NoteManager.prototype.noteInitiator = function(arg) {
     
    var _this = this;

    if(arg.visible === true){ 
       
      var atom = _.find(_this.lattice.actualAtoms, function(a){ return a.uniqueID === arg.id; });

      if(atom === undefined){
        return;
      }
 
      var atomPos = atom.object3d.position.clone();
      var notePos = this.findNotePoint(arg.x, arg.y);
      
      this.noteLinesMeshes[arg.id].geometry.vertices[ 0 ].set(atomPos.x, atomPos.y, atomPos.z) ;  
      this.noteLinesMeshes[arg.id].geometry.vertices[ 1 ].set(notePos.x, notePos.y, notePos.z) ;  
      
      this.noteLinesMeshes[arg.id].geometry.verticesNeedUpdate = true;
      this.noteLinesMeshes[arg.id].visible = true;
    } 
    else if(arg.visible === false){
      this.noteLinesMeshes[arg.id].visible = false; 
    } 
  };
  NoteManager.prototype.visibilityOfLine = function(arg) {

  };  
  NoteManager.prototype.findNotePoint = function(x,y){  
     
    var width = jQuery('#app-container').width() ;
    var height = $(window).height() ;

    var raycaster = new THREE.Raycaster(); 

    var x_ = (x/width)*2 - 1 ;
    var y_ = -1*(y/height)*2 + 1 ;
    
    this.camera.updateMatrixWorld();
    raycaster.setFromCamera( new THREE.Vector2( x_, y_ ) , this.camera ); 
  
    var intersects = raycaster.intersectObject( this.explorer.plane.object3d );
    
    var notePos;

    if(intersects.length > 0){  
      notePos = intersects[0].point.clone() ;
    }
    else{ 
      notePos = new THREE.Vector3(0,0,0);
    }
 
    return notePos ;
 
  };  
  return NoteManager;

});
