
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore',
  'motifExplorer',
  'explorer'
], function(
  THREE,
  jQuery,
  PubSub,
  _,
  MotifExplorer,
  Explorer
) { 
  var raycaster = new THREE.Raycaster(); 
  var mouse = new THREE.Vector2();

  //
  // possible useless FILE and will be DELETED
  //

  function CrystalMouseEvents( client, _camera, domElement, state, dollEditor, atomCustomizer ) {
    this.plane = {'object3d' : undefined} ;
    this.camera = _camera;
    this.container = domElement; 
    this.motifEditorAtms = [] ;
    this.getCrystalObjs = [] ;
    this.client = client ;
    this.state = state ;
    var _this =this ;
    this.dollEditor = dollEditor;
    this.atomCustomizer = atomCustomizer;
    this.offset = new THREE.Vector3(); 
    this.coloredAtomsExist = false;

    var mMoove = this.onDocumentMouseMove.bind(this) ; 
    document.getElementById(this.container).addEventListener("mousemove", mMoove, false); 

    var mDown = this.onDocumentMouseDown.bind(this) ;
    document.getElementById(this.container).addEventListener("mousedown",  mDown, false);

    var mUp = this.onDocumentMouseUp.bind(this) ;
    document.getElementById(this.container).addEventListener("mouseup"  ,    mUp, false);
     
  }; 

  CrystalMouseEvents.prototype.onDocumentMouseDown = function(event){ 
    
    event.preventDefault();
    var _this = this;

    if(this.state === 'default'){
      mouse.x = ( event.clientX / $('#'+this.container).width() ) * 2 - 1;
      mouse.y = - ( event.clientY / $('#'+this.container).height() ) * 2 + 1;
    }
    else if(_this.state === 'motifScreen'){
      mouse.x = ( event.clientX / $('#'+this.container).width() ) * 2 - 3;
      mouse.y = - ( event.clientY / $('#'+this.container).height() ) * 2 + 1; 
    }
     
    raycaster.setFromCamera( mouse, this.camera ); 
 
    var crystalobjsIntersects = raycaster.intersectObjects( this.getCrystalObjects() );
     
    if ( crystalobjsIntersects.length > 0 ) {   
      if(crystalobjsIntersects[0].object.parent.name === 'atom'){
 
        var obj = crystalobjsIntersects[0].object ; 
        var filteredAtom = _.findWhere(_this.client.actualAtoms, {uniqueID : obj.parent.uniqueID});   
        if(filteredAtom === undefined){
          filteredAtom = _.findWhere(_this.client.cachedAtoms, {uniqueID : obj.parent.uniqueID}); 
        } 
        console.log(filteredAtom);
        if(filteredAtom !== undefined){
          this.atomCustomizer.atomJustClicekd(filteredAtom);
        } 
      }
    }  
  };
  CrystalMouseEvents.prototype.onDocumentMouseUp = function(event){ 

  };
  CrystalMouseEvents.prototype.onDocumentMouseMove = function(event){ 
    var _this = this;
     
    event.preventDefault();
    
    if(_this.state === 'default'){
      mouse.x = ( event.clientX / $('#'+_this.container).width() ) * 2 - 1;
      mouse.y = - ( event.clientY / $('#'+_this.container).height() ) * 2 + 1;
    }
    else if(_this.state === 'motifScreen'){
      mouse.x = ( event.clientX / $('#'+_this.container).width() ) * 2 - 3;
      mouse.y = - ( event.clientY / $('#'+_this.container).height() ) * 2 + 1; 
    }
     
    raycaster.setFromCamera( mouse, _this.camera ); 
 
    var crystalobjsIntersects = raycaster.intersectObjects( this.getCrystalObjects() );
    
    if ( crystalobjsIntersects.length > 0 ) {  

      for (var i = this.client.actualAtoms.length - 1; i >= 0; i--) {
        this.client.actualAtoms[i].setColorMaterial(); 
        this.client.actualAtoms[i].object3d.visible = this.client.actualAtoms[i].visibility;
      }; 
        
      this.dollEditor.setAtomUnderDoll(crystalobjsIntersects[0].object.parent);
       
      var obj = crystalobjsIntersects[0].object ; 
      var filteredAtom = _.findWhere(_this.client.actualAtoms, {uniqueID : obj.parent.uniqueID});  
      if(filteredAtom === undefined){
        filteredAtom = _.findWhere(_this.client.cachedAtoms, {uniqueID : obj.parent.uniqueID}); 
        if(filteredAtom === undefined){
          return;
        }
      }
      
      if(filteredAtom.object3d.visible === false){
        filteredAtom.object3d.visible = true ;
      }
      filteredAtom.setColorMaterial(0xCC2EFA, true);
      this.coloredAtomsExist = true; 
      document.getElementById(this.container).style.cursor = 'pointer';
    } 
    else{  
      this.dollEditor.setAtomUnderDoll(undefined);
      
      if(this.coloredAtomsExist === true){ 
        for (var i = this.client.actualAtoms.length - 1; i >= 0; i--) {
          this.client.actualAtoms[i].setColorMaterial();
          this.client.actualAtoms[i].object3d.visible = this.client.actualAtoms[i].visibility;
        };
        for (var i = this.client.cachedAtoms.length - 1; i >= 0; i--) {
          this.client.cachedAtoms[i].setColorMaterial();
          this.client.cachedAtoms[i].object3d.visible = this.client.cachedAtoms[i].visibility;
        };
        this.coloredAtomsExist = false;
        document.getElementById(this.container).style.cursor = 'default';
      } 
    }
  }
 
 
  CrystalMouseEvents.prototype.getCrystalObjects = function() {  
    var _this = this;
    _this.getCrystalObjs = [] ;

    Explorer.getInstance().object3d.traverse (function (object) {
      if ((object.name === 'atom' && object.latticeIndex !== '-') || (object.name === 'atom' && object.latticeIndex === '-' && object.visible === true) || object.name === 'miller') {  
        for (var i = 0; i < object.children.length; i++) {  
          _this.getCrystalObjs.push(object.children[i]);
        };
      }
    });
    return _this.getCrystalObjs;
  };

  return CrystalMouseEvents;
  
});  
