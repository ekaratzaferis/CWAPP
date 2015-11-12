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
 
  function AtomCustomizer(lattice, soundMachine, dollEditor, menu) { 
      
    this.lattice = lattice ;
    this.soundMachine = soundMachine ;
    this.menu = menu;
    this.dollEditor = dollEditor;

    
  };
 
  AtomCustomizer.prototype.atomJustClicekd = function(atom){ 

    var arg = {
      'name' : atom.elementName,
      'ionicIndex' : atom.ionicIndex,
      'radius' : atom.radius,
      'color' : atom.color,
      'opacity' : atom.opacity,
      'visibility' : atom.visibility, 
      'id' : atom.uniqueID
    }
    
    this.menu.openAtomCustomizer(arg);
  };

  AtomCustomizer.prototype.customizeAtom = function(arg){ 
    var _this = this;
    
    var atom = _.findWhere(_this.lattice.actualAtoms, {uniqueID : arg.id});
    if(atom === undefined){
      //atom = _.findWhere(_this.lattice.cachedAtoms, {uniqueID : arg.id});
    }
    console.log(arg);
    if(atom === undefined){
      return;
    }

    if(arg.opacity !== undefined){
      atom.setOpacity(parseFloat(arg.opacity));
    }
    else if(arg.color !== undefined){
      var col = arg.color;
      if(col.charAt(0) !== '#'){
        col = '#'+col;
      }
      atom.setColorMaterial(col);
    }
    else if(arg.visibility !== undefined){  
      atom.setVisibility( arg.visibility); 
    }
    else if(arg.dollMode !== undefined){
      this.dollEditor.dollMode(atom.object3d);
    } 
  
  };
  return AtomCustomizer;

});
