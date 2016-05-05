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

  function Narrative_system( lattice, orbit) { 
    
    this.orbit = orbit ; 
    this.lattice = lattice ; 
    this.cameraData = {};
    this.planeData = {};
    this.dirData = {};

    this.restoreData ={
      atoms : undefined,
      planes : undefined,
      dirs : undefined,
      grids : undefined,
      points : undefined,
      faces : undefined
    };

  };
  

  Narrative_system.prototype.restoreNoteState = function(arg){

  };
  Narrative_system.prototype.saveNoteState = function(arg){
    
    var _this = this;
    var id = arg.id;
    var cameraToggle = arg.cameraToggle;
    var sceneObjsToggle = arg.sceneObjsToggle;
  
    if( cameraToggle === true){

      var p = this.orbit.camera.position.clone();
      var t = this.orbit.control.target.clone();
  
      this.cameraData[id] = {
        position : {
          x:p.x,
          y:p.y,
          z:p.z
        },
        target : {
          x : t.x,
          y : t.y,
          z : t.z
        }
      }
    }

    if( sceneObjsToggle === true){
       
      var l = this.lattice, _this = this; 
      var indexes;
    
      l.actualAtoms.forEach(function(atom, i) { 
        
        var noteState = {
          visible : atom.visibility,
          opacity : atom.opacity,
          color : atom.color
        } 

        atom.setNoteState(id, noteState);
        // _this.restoreData.atoms[idd] = atom.notStates;
        
      });
 
      for (var prop in l.points) {
        if (l.points.hasOwnProperty(prop)) { 
          var noteState = {
            visible : l.points[prop].object3d.visible 
          }
          l.points[prop].setNoteState(id, noteState);

        }
      }

      _.each(l.grids, function(grid, reference) {
         
        var noteState = {
          visible : grid.grid.object3d.visible, 
          color : grid.grid.color,
          scale : grid.grid.scale
        }
        grid.grid.setNoteState(id, noteState); 
      });

       _.each(l.faces, function(face, reference) {
         
        var noteState = {
          visible : face.object3d.visible, 
          color : face.color,
          opacity : face.opacity
        }
        face.setNoteState(id, noteState); 
      });


      //////
      _this.planeData[id] = {};

      l.millerPlanes.forEach(function(plane) {

        if(plane.parallelIndex === 1){ 
          _this.planeData[id][plane.id] = {
            visible : plane.plane.visible,
            opacity : plane.plane.opacity,
            color : plane.plane.color

          } 
        }
      });

      _this.dirData[id] = {};

      l.millerDirections.forEach(function(dir) { 
        
        var r = (dir.direction.radius === NaN) ? 2 : dir.direction.radius;
        _this.dirData[id][dir.id] = {
          visible : dir.direction.object3d.visible, 
          radius : r, 
          color :  dir.direction.object3d.children[0].material.color.getHex() 
        } 
          
      });
 
    }
    
  };   
  Narrative_system.prototype.enableNoteState = function(arg){
  
    if(arg.id !== undefined && this.cameraData[arg.id] !== undefined){ 
      var c = this.orbit.camera ;
      var t = this.orbit.control.target ;

      t.x = this.cameraData[arg.id].target.x;
      t.y = this.cameraData[arg.id].target.y;
      t.z = this.cameraData[arg.id].target.z;

      c.position.x = this.cameraData[arg.id].position.x;
      c.position.y = this.cameraData[arg.id].position.y;
      c.position.z = this.cameraData[arg.id].position.z;
    }

    var l = this.lattice, _this = this; 
    var indexes;
  
    l.actualAtoms.forEach(function(atom, i) { 
      
      atom.applyNoteState(arg.id);
      
    });
  
    for (var prop in this.dirData[arg.id]) {
      l.millerDirections.forEach(function(dir, i) { 
        if(dir.id === prop  ){ 
          dir.direction.setVisible(_this.dirData[arg.id][prop].visible);
          dir.direction.setColor(_this.dirData[arg.id][prop].color);
          dir.direction.updateTubeRadius(_this.dirData[arg.id][prop].radius);
        }
        
      }); 
    }

    for (var prop in this.planeData[arg.id]) {

      l.millerPlanes.forEach(function(plane, i) { 
        
        if(plane.id === prop && plane.parallelIndex === 1){
          plane.plane.setVisible(_this.planeData[arg.id][prop].visible);
          plane.plane.setColor(_this.planeData[arg.id][prop].color);
          plane.plane.setOpacity(_this.planeData[arg.id][prop].opacity);
        }
         
      }); 
    }

    for (var prop in l.points) {
      if (l.points.hasOwnProperty(prop)) {  

        l.points[prop].applyNoteState(arg.id);

      }
    }

    _.each(l.grids, function(grid, reference) { 
      grid.grid.applyNoteState(arg.id); 
    });

     _.each(l.faces, function(face, reference) {
       
      face.applyNoteState(arg.id); 
    });

  }
    
  Narrative_system.prototype.deleteNoteState = function(arg){
  
    var l = this.lattice, _this = this; 
    var indexes;
  
    l.actualAtoms.forEach(function(atom, i) { 
      
      atom.deleteNoteState(arg.id);
      
    });

  }; 
  return Narrative_system;

});
