'use strict';

define([
  'three',
  'explorer',
  'underscore',
  'tween'
], function(
  THREE,
  Explorer,
  _,
  TWEEN
) { 

  function Narrative_system( lattice, orbit, animationMachine, crystalScene ) { 
    
    this.orbit = orbit ; 
    this.lattice = lattice ; 
    this.cameraData = {};
    this.planeData = {};
    this.dirData = {};
    this.animationMachine = animationMachine; 
    this.crystalScene = crystalScene; 

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
    
    var _this = this;
    var camera = this.orbit.camera ;
    var t = this.orbit.control.target ;
    var control = this.orbit.control ;

    if(arg.id !== undefined && this.cameraData[arg.id] !== undefined ){ 
        
      var finalPos = new THREE.Vector3(this.cameraData[arg.id].position.x,this.cameraData[arg.id].position.y,this.cameraData[arg.id].position.z);
      var finalTarget = new THREE.Vector3(this.cameraData[arg.id].target.x,this.cameraData[arg.id].target.y,this.cameraData[arg.id].target.z);
      
      var from = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
      };

      var to = {
          x: finalPos.x,
          y: finalPos.y,
          z: finalPos.z
      };
     
      var times = 0;

      var tween = new TWEEN.Tween({x : from.x, y : from.y, z : from.z, timer : 0 })
        .to({x : to.x, y : to.y, z : to.z, timer : 200}, 2000)
        .easing(TWEEN.Easing.Quintic.InOut)
        .onUpdate(function () {
          var v = new THREE.Vector3(this.x, this.y, this.z);
          var newP = v.setLength(v.length()*(1+times)); 
          camera.position.copy(newP); 
          camera.lookAt(t); 
           
          if(this.timer>150){
            times-=0.01;
          }
          else if(this.timer>100){
            times-=0.01;
          }
          else{
            times+=0.01;
          }
          
        })
        .onComplete(function () { 
          camera.position.copy(new THREE.Vector3(this.x, this.y, this.z)); 
        })
        .start();
      
      var tweenT = new TWEEN.Tween(t)
        .to(finalTarget, 2000)
        .easing(TWEEN.Easing.Quintic.InOut)
        .onUpdate(function () {  
        })
        .onComplete(function () {   
        })
        .start();
 

    }

    //////////
 
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

    for (var prop in l.points) {

      l.points[prop].deleteNoteState(arg.id); 
    }

    _.each(l.grids, function(grid, reference) {
        
      grid.grid.deleteNoteState(arg.id);  
    });

     _.each(l.faces, function(face, reference) { 
      face.deleteNoteState(arg.id); 
    });


    //////
    _this.planeData[arg.id] = {};

    
    _this.dirData[arg.id] = {};

     

  }; 
  return Narrative_system;

});
