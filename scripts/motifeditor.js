/*global define*/
'use strict';

define([
  'pubsub', 'three', 'underscore', 
  'atomSphere','jquery-ui', 'jquery', 'unitCellAtom', 'unitCellExplorer' ,
  'csg',
  'threeCSG'
], function(
  PubSub, THREE, _,
  AtomSphere, jQuery_ui, jQuery, UnitCellAtom , UnitCellExplorer,
  csg,
  ThreeCSG
) {
  var events = {
    LOAD: 'motifeditor.load',
    EDITOR_STATE: 'motifeditor.editor_state',
    VIEW_STATE: 'motifeditor.view_state'
  }; 

  function Motifeditor(menu) {
    this.motifeditor = null;

    this.menu = menu ; 
    this.cellParameters = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 

    this.motifParameters ;  
    this.pointPositions = [];
    this.motifsAtoms = [];
    this.unitCellAtoms = [];
    this.unitCellPositions = {}; 
    this.viewState = 'Classic';
    this.editorState = {state : "initial", fixed: false } ;
    this.atomsData ;
    this.isEmpty = true ;
    this.latticeName = 'none';

    this.newSphere ;
    this.newCellSphere ;
    this.lastSphereAdded ; 
    this.dragMode = false;
    this.tangentToThis;
    this.rotAxis='x';
    this.mutex = true ;
  };
  Motifeditor.prototype.loadAtoms = function(){
    var _this = this;
    require(['atoms'], function(atomsInfo) {
      _this.atomsData = atomsInfo ;    
    });
  };
  Motifeditor.prototype.setDraggableAtom = function(arg){ 
    this.dragMode = arg.dragMode;
    if(arg.dragMode) {  
      if(!_.isUndefined(this.newSphere)) this.newSphere.blinkMode(true, '#58D3F7'); 
      $(".rotatingAngles").show();
      $("#savedAtomsCont").css("visibility", "visible");
      $("#savedAtomsLbl").html("<span style='color:blue '>Choose Atom</span>");
    }
    else if(!arg.dragMode){
      $(".rotatingAngles").hide();
      $("#savedAtomsCont").css("visibility", "hidden");
      $("#savedAtomsLbl").text("Saved Atoms");
      if(!_.isUndefined(this.newSphere)) this.newSphere.blinkMode(false);
    }
  };
  Motifeditor.prototype.updateCellDimens = function(arg){
    if(this.editorState.fixed){ 

      if(!_.isUndefined(arg.x)) {
        if(this.latticeName !== 'hexagonal'){
          this.cellParameters.scaleX = arg.x ; 
          $('#scaleX').val(arg.x);
        }
      } 
      else if(!_.isUndefined(arg.y)) { 
        this.cellParameters.scaleY = arg.y ; 
        $('#scaleY').val(arg.y);
      }
      else if(!_.isUndefined(arg.z)) {  
        this.cellParameters.scaleZ = arg.z ;
        $('#scaleZ').val(arg.z); 
      } 
      this.configureCellPoints();
    }
      
  };
  Motifeditor.prototype.updateLatticeParameters = function(anglesScales, latticeType, latticeName) {
    
    this.latticeType = latticeType; 
    this.latticeName = latticeName;   
    
    if(this.latticeName === 'hexagonal'){
      this.cellParameters.alpha = 90 ;
      this.cellParameters.beta = 90 ;
      this.cellParameters.gamma = 120 ;
      this.cellParameters.scaleX = anglesScales.scaleZ ;
    }
    else{
      this.cellParameters.alpha = anglesScales.alpha ;
      this.cellParameters.beta = anglesScales.beta ;
      this.cellParameters.gamma = anglesScales.gamma ;
      this.cellParameters.scaleX = anglesScales.scaleX ;
    }
    this.cellParameters.scaleY = anglesScales.scaleY ;
    this.cellParameters.scaleZ = anglesScales.scaleZ ;
 
    this.configureCellPoints();

  };
  Motifeditor.prototype.onEditorStateChange = function(callback) {
    PubSub.subscribe(events.EDITOR_STATE, callback);
  };
  Motifeditor.prototype.onViewStateChange = function(callback) {
    PubSub.subscribe(events.VIEW_STATE, callback);
  };
  Motifeditor.prototype.selectElem = function(params) {

    var _this = this ;

    // first time
    if(_this.isEmpty) {  
      var newId = "_"+Math.random() ;
      var a = new AtomSphere( (new THREE.Vector3(0,0,0)) , _this.atomsData[params.element].radius/100 , _this.atomsData[params.element].color, params.tangency, params.element, newId);
      _this.newSphere = a ;
      _this.isEmpty = false;
      $("#atomName").val(params.element+" ");
      PubSub.publish(events.EDITOR_STATE,"creating");
      _this.addAtomInCell( (new THREE.Vector3(0,0,0)) , _this.atomsData[params.element].radius/100 ,  _this.atomsData[params.element].color, params.tangency, params.element, newId); 
       
      return;
    }
    else{ 
      if(_this.viewState!='Classic') {
        _this.setCSGmode('Classic');
        $('option:selected', 'select[id="unitCellView"]').removeAttr('selected'); 
        $('select[id="unitCellView"]').find('option[id="Classic"]').attr("selected",true);
      }
      var state = _this.editorState.state ;
      var p = _this.findNewAtomsPos(_this.lastSphereAdded, _this.atomsData[params.element].radius/100);
      _this.menu.setSliderValue("atomPosX", p.x );
      _this.menu.setSliderValue("atomPosY", p.y );
      _this.menu.setSliderValue("atomPosZ", p.z );
      $("#atomPosX").val( p.x);
      $("#atomPosY").val( p.y);
      $("#atomPosZ").val( p.z);
      var newId = "_"+Math.random();
      var a = new AtomSphere( (new THREE.Vector3(p.x,p.y,p.z)) , _this.atomsData[params.element].radius/100 , _this.atomsData[params.element].color,params.tangency, params.element, newId);
      _this.newSphere = a;
      _this.addAtomInCell( (new THREE.Vector3(p.x,p.y,p.z)) , _this.atomsData[params.element].radius/100 , _this.atomsData[params.element].color, params.tangency, params.element, newId);
      PubSub.publish(events.EDITOR_STATE,"creating");
      $("#atomName").val(params.element+" ");  
    }
  };
  Motifeditor.prototype.findNewAtomsPos = function(lastAtom, newAtomRadius, flag ) { // todo if there is no free around the last atom, coll det >2

    var _this = this , posFound = false, posFoundx, posFoundy, posFoundz, position; 
    var x = lastAtom.object3d.position.x + lastAtom.getRadius() + newAtomRadius;
    var y = lastAtom.object3d.position.y ;
    var z = lastAtom.object3d.position.z ;
    if(_.isUndefined(flag)) { 
      _this.newSphere = {
        "object3d" : {"position" : { "x": x, "y": y, "z": z, 
        clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); } } },
        getRadius: function() { return newAtomRadius; },
        getID: function() { return "_0"; }, 
        getTangency: function() { return true; },
        changeColor: function(a) {}  
      } ; 
    }
    else{
      _this.newSphere.object3d.position.set(x,y,z);
    }
    
    var posFound = _this.check("x");
    var vertNums = lastAtom.object3d.children[1].geometry.vertices.length;
     
    if(posFound.collisionsFound !== 0){
      for (var i = 0; i < vertNums; i+=20) { 

        var verPos = lastAtom.object3d.children[1].geometry.vertices[i].clone();  
        verPos.applyMatrix4( lastAtom.object3d.matrixWorld ); 

        _this.newSphere.object3d.position.x = verPos.x ;
        _this.newSphere.object3d.position.y = verPos.y ;
        _this.newSphere.object3d.position.z = verPos.z ; 

        _this.newSphere.object3d.position.x += _this.fixAtomPosition(lastAtom, "x") ;
        posFoundx = _this.check("x"); 
        if(posFoundx.collisionsFound === 0)  i = vertNums ;   
        
        _this.newSphere.object3d.position.y += _this.fixAtomPosition(lastAtom, "y") ;
        var posFoundy = _this.check("y"); 
        if(posFoundy.collisionsFound === 0)  i = vertNums ; 

        _this.newSphere.object3d.position.z += _this.fixAtomPosition(lastAtom, "z") ;
        var posFoundz = _this.check("z"); 
        if(posFoundz.collisionsFound === 0)  i = vertNums ; 
         
      }  
    } 
    
    return _this.newSphere.object3d.position ;
  };
  Motifeditor.prototype.dragAtom = function(axis, pos, objID){ // questions about sliders when dragging, about when and which dragging etc
    var _this = this ;
    var tempObj = _this.newSphere ;  
    _this.newSphere = _.find(_this.motifsAtoms, function(atomSphere){ return atomSphere.object3d.id === objID; });  
    if(_.isUndefined(_this.newSphere) ) _this.newSphere = tempObj ; //in case he drags the _this.newSphere already
    var theID = _this.newSphere.getID(); 
 
    if(axis === 'x' ) {  
      _this.newSphere.object3d.position.set(pos.x,pos.y,_this.newSphere.object3d.position.z);  
      _this.translateCellAtoms("x",  pos.x , theID);
      _this.translateCellAtoms("y",  pos.y , theID); 
    }
    else if(axis === 'y' ) {   
      _this.newSphere.object3d.position.set(_this.newSphere.object3d.position.x,pos.y,pos.z);  
      _this.translateCellAtoms("z",  pos.z , theID);
      _this.translateCellAtoms("y",  pos.y , theID);
    }
    else if(axis === 'z' ) { 
      _this.newSphere.object3d.position.set(pos.x, _this.newSphere.object3d.position.y,pos.z);  
      _this.translateCellAtoms("z",  pos.z , theID);
      _this.translateCellAtoms("x",  pos.x , theID);
    } 

    _this.newSphere = tempObj ;

    _this.configureCellPoints();  

    if(_this.dragMode) _this.rotAxis = axis;
     
  };
  Motifeditor.prototype.setAtomsPosition = function(param){ 
    var _this = this;  
    var oldX,oldY,oldZ;
    var stillColliding = true, doNotOverlap = _this.newSphere.getTangency() ;
    
    var sliderXVal = parseFloat($('#atomPosXSlider').slider( "value" ) ); 
    var sliderYVal = parseFloat($('#atomPosYSlider').slider( "value" )); 
    var sliderZVal = parseFloat($('#atomPosZSlider').slider( "value")); 
     
    if(!_.isUndefined(param.atomPosX)){ 
      if(_this.mutex){ 

        _this.mutex = false; 
        
        _this.newSphere.object3d.position.x =   parseFloat(  param.atomPosX ) ;  
        _this.translateCellAtoms("x",  sliderXVal , _this.newSphere.getID());

        if( _this.motifsAtoms.length===0 || doNotOverlap===false ){ 
          this.mutex = true;   
          _this.configureCellPoints();
          return ;
        }

        var zOffset = _this.check("z");
        var yOffset = _this.check("y");
        
        if(yOffset.offset>=zOffset.offset){
          if(yOffset.offset!=0 && zOffset.offset!=0){
            _this.newSphere.object3d.position.z += zOffset.offset ;
            var newSliderVal = sliderZVal + zOffset.offset ;
            _this.menu.setSliderValue("atomPosZ", newSliderVal );
            _this.translateCellAtoms("z",_this.newSphere.object3d.position.z + zOffset.offset,_this.newSphere.getID());
          }
        }
        else{ 
          _this.newSphere.object3d.position.y += yOffset.offset ;
          var newSliderVal = sliderYVal + yOffset.offset ;
          _this.menu.setSliderValue("atomPosY", newSliderVal );
          _this.translateCellAtoms("y",_this.newSphere.object3d.position.y + yOffset.offset,_this.newSphere.getID());
        }

        _this.mutex = true; 
        
      }
    }
    else if( !_.isUndefined(param.atomPosY) ) { 
      if(_this.mutex){
        
        _this.mutex = false; 

        _this.newSphere.object3d.position.y = parseFloat(  param.atomPosY );
        _this.translateCellAtoms("y", sliderYVal ,_this.newSphere.getID());

        if(_this.motifsAtoms.length===0 || doNotOverlap===false ){
          this.mutex = true; 
          _this.configureCellPoints();
          return ;
        }

        var zOffset = _this.check("z");
        var xOffset = _this.check("x"); 

        if(xOffset.offset>=zOffset.offset){
          if(xOffset.offset!=0 && zOffset.offset!=0){  
            _this.newSphere.object3d.position.z += zOffset.offset ;
            var newSliderVal = sliderZVal + zOffset.offset ;
            _this.menu.setSliderValue("atomPosZ", newSliderVal );
            _this.translateCellAtoms("z",_this.newSphere.object3d.position.z + zOffset.offset,_this.newSphere.getID());
          } 
        }
        else{ 

          _this.newSphere.object3d.position.x += xOffset.offset ;
           var newSliderVal = sliderXVal + xOffset.offset ;
          _this.menu.setSliderValue("atomPosX", newSliderVal );
          _this.translateCellAtoms("x",_this.newSphere.object3d.position.x + xOffset.offset,_this.newSphere.getID());
        }

        _this.mutex = true;

      }       
    }
    else if(!_.isUndefined(param.atomPosZ)){ 
      if(_this.mutex){
        
        _this.mutex = false; 
         
        _this.newSphere.object3d.position.z = parseFloat(  param.atomPosZ ); 
        _this.translateCellAtoms("z", sliderZVal ,_this.newSphere.getID());

        if(_this.motifsAtoms.length===0 || doNotOverlap===false ){
          this.mutex = true; 
          _this.configureCellPoints();
          return ;
        }

        var xOffset = _this.check("x");
        var yOffset = _this.check("y");
         
        if(xOffset.offset>=yOffset.offset){
          if(yOffset.offset!=0 && xOffset.offset!=0){ 
            _this.newSphere.object3d.position.y += yOffset.offset ;
             var newSliderVal = sliderYVal + yOffset.offset ;
            _this.menu.setSliderValue("atomPosY", newSliderVal );
            _this.translateCellAtoms("y",_this.newSphere.object3d.position.y + yOffset.offset,_this.newSphere.getID());
          }
        }
        else{ 
          _this.newSphere.object3d.position.x += xOffset.offset ;
          var newSliderVal = sliderXVal + xOffset.offset ;
          _this.menu.setSliderValue("atomPosX", newSliderVal );
          _this.translateCellAtoms("x",_this.newSphere.object3d.position.x + xOffset.offset,_this.newSphere.getID());
        }

        _this.mutex = true; 

      }
    }   

    _this.configureCellPoints();
  }; 
  Motifeditor.prototype.check = function(axis){

    var _this = this;

    var c = {"offset":0, "collisionsFound":0}, i = 0;
     
    while(i<_this.motifsAtoms.length && !_.isUndefined(_this.motifsAtoms[i])) {

      if( (_this.motifsAtoms[i].getTangency() === true) && (_this.motifsAtoms[i].getID()!==_this.newSphere.getID())   ) { 
        
        var a = _this.newSphere.object3d.position.clone();
        var b = _this.motifsAtoms[i].object3d.position.clone();
        var realDistance =parseFloat(  (a.distanceTo(b)).toFixed(parseInt(10)) );

        var calculatedDistance = parseFloat( (_this.motifsAtoms[i].getRadius() + _this.newSphere.getRadius()).toFixed(parseInt(10)) ) ; 

        if (realDistance < calculatedDistance){   
          _this.motifsAtoms[i].changeColor('#FF0000');  
          c.offset = parseFloat((_this.fixAtomPosition(_this.motifsAtoms[i],axis)).toFixed(parseInt(10)) );
          c.collisionsFound++;  
        } 
      }
      i++;
    }; 

    return c;
  };
  Motifeditor.prototype.fixAtomPosition = function(otherAtom,axis){
    var _this = this,sign = 1; 

    var movingSpherePosition = _this.newSphere.object3d.position.clone();

    var collisionSpherePosition = otherAtom.object3d.position.clone();
  
    var realTimeHypotenuse = collisionSpherePosition.distanceTo (movingSpherePosition);
    var calculatedHypotenuse = parseFloat( otherAtom.getRadius() + _this.newSphere.getRadius() ) ;  

    var fixedSide ;
    var wrongSide ;
     
    if(axis==="x"){ 
      wrongSide = Math.abs(movingSpherePosition.x - collisionSpherePosition.x);
      var projection = new THREE.Vector3(movingSpherePosition.x,collisionSpherePosition.y, collisionSpherePosition.z );
      fixedSide =  movingSpherePosition.distanceTo(projection);  
      if(movingSpherePosition.x < collisionSpherePosition.x) sign = -1 ;
    }
    else if(axis==="y"){ 
      wrongSide = Math.abs(movingSpherePosition.y - collisionSpherePosition.y);
      var projection = new THREE.Vector3(collisionSpherePosition.x,movingSpherePosition.y,collisionSpherePosition.z );
      fixedSide =  movingSpherePosition.distanceTo(projection);
      if(movingSpherePosition.y < collisionSpherePosition.y) sign = -1 ;
    }
    else{ 
      wrongSide = Math.abs(movingSpherePosition.z - collisionSpherePosition.z);
      var projection = new THREE.Vector3(collisionSpherePosition.x,collisionSpherePosition.y,movingSpherePosition.z ); 
      fixedSide =  movingSpherePosition.distanceTo(projection); 
      if(movingSpherePosition.z < collisionSpherePosition.z) sign = -1 ;  
    }   
    
    var rightSide = Math.sqrt ( ((calculatedHypotenuse*calculatedHypotenuse) - (fixedSide*fixedSide) )); 

    var offset = parseFloat( rightSide - wrongSide );
   
    return (sign*offset);
  }
  Motifeditor.prototype.setAtomsTangency = function(param){
    var _this = this; 
    _this.newSphere.setTangency(param.tangency);
  }; 
  Motifeditor.prototype.setAtomsParameter = function(param){
    var _this = this; 
     
    if(!_.isUndefined(param.atomOpacity) ) { 
      _this.newSphere.setOpacity(param.atomOpacity);
      _this.unitCellAtomsOpacity(_this.newSphere.getID(),param.atomOpacity);
    }
    else if(!_.isUndefined(param.atomColor)){ 
      var op =  parseInt($("#atomOpacity").val());
      _this.newSphere.setMaterial("#"+param.atomColor, op);
      _this.colorUnitCellAtoms(_this.newSphere.getID(), "#"+param.atomColor);
    }
    else if(!_.isUndefined(param.atomTexture)){ 
      _this.newSphere.setMaterialTexture(param.atomTexture);
      _this.unitCellAtomsTexture(_this.newSphere.getID(), param.atomTexture);
    } 
    else if(!_.isUndefined(param.wireframe)){ 
      _this.newSphere.wireframeMat(param.wireframe);
      _this.unitCellAtomsWireframe(_this.newSphere.getID(), param.wireframe);
    }  
  }; 
  Motifeditor.prototype.calculateCellsPoints = function (){
    var _this = this ; 
  };
  Motifeditor.prototype.getMotif = function (){
    var _this = this ;
    // todo kanw add axreiasto
    if(_.isUndefined( _.find(_this.motifsAtoms, function(atom){ return atom.getID() == _this.newSphere.getID(); }) )) _this.motifsAtoms.push(_this.newSphere);
      
    return _this.motifsAtoms; 
  };
   
  Motifeditor.prototype.getAllAtoms = function (){
    return this.motifsAtoms;
  };
  Motifeditor.prototype.getDimensions = function (){ 
    switch(this.latticeType) {
      case "primitive":    
        return {"x": this.cellParameters.scaleX, "y": this.cellParameters.scaleY, "z": this.cellParameters.scaleZ};  
      break; 
      case "face":  
        return {"x": this.cellParameters.scaleX * Math.sqrt(2), "y": this.cellParameters.scaleY * Math.sqrt(2), "z": this.cellParameters.scaleZ * Math.sqrt(2)};  
        break; 
      case "body":  
        return {"x": this.cellParameters.scaleX * (2/Math.sqrt(3)), "y": this.cellParameters.scaleY * (2/Math.sqrt(3)), "z": this.cellParameters.scaleZ * (2/Math.sqrt(3))};  
        break;
      case "base":   
        return {"x": this.cellParameters.scaleX * Math.sqrt(2), "y": this.cellParameters.scaleY , "z": this.cellParameters.scaleZ * Math.sqrt(2)};  
        break;
    }
  };
  Motifeditor.prototype.updateFixedDimensions = function (latticeParams) {

    if(!_.isUndefined(latticeParams.scaleX) ) { 
      if(this.latticeName !== 'hexagonal'){
        $("#fixedX").val(parseFloat(latticeParams.scaleX));
        this.cellParameters.scaleX = parseFloat(latticeParams.scaleX) ; 
      }
    } 
    if(!_.isUndefined(latticeParams.scaleY) ) {
      $("#fixedY").val(parseFloat(latticeParams.scaleY));
      this.cellParameters.scaleY = parseFloat(latticeParams.scaleY) ; 
    }
    if(!_.isUndefined(latticeParams.scaleZ) ) {
      $("#fixedZ").val(parseFloat(latticeParams.scaleZ));
      this.cellParameters.scaleZ = parseFloat(latticeParams.scaleZ) ; 
    }
  };
  Motifeditor.prototype.submitAtom = function(parameters) {
    var _this = this;
    this.motifParameters = parameters ;
    var buttonClicked = parameters.button;

    if(_this.editorState.state === "creating"){ 
      switch(buttonClicked) { 
        case "saveChanges":
          var name =$("#atomName").val();
          _this.newSphere.setName(name);
          _this.motifsAtoms.push(_this.newSphere); 
          _this.updateAtomList(_this.newSphere.getID(), _this.newSphere.getRadius(), _this.newSphere.getName(),true);
          PubSub.publish(events.EDITOR_STATE,"initial");
          _this.lastSphereAdded = _this.newSphere ;
          _this.newSphere.blinkMode(false); 
          _this.newSphere = undefined ;
          _this.dragMode = false;
          break;
        case "deleteAtom":
          _this.removeFromUnitCell(_this.newSphere.getID());
          _this.newSphere.destroy();
          if(!_.isUndefined( _this.motifsAtoms[0])) {   
            _this.lastSphereAdded = _this.motifsAtoms[_this.motifsAtoms.length-1];
            _this.newSphere = _this.motifsAtoms[_this.motifsAtoms.length-1];
            _this.configureCellPoints();
          }
          else{
            _this.newSphere = undefined ;
            _this.lastSphereAdded = undefined ;
            _this.isEmpty = true ; 
          }
          _this.dragMode = false;
          PubSub.publish(events.EDITOR_STATE,"initial"); 
          break;
        case "cancel":
          _this.removeFromUnitCell(_this.newSphere.getID());
          _this.newSphere.destroy();
          if(!_.isUndefined( _this.motifsAtoms[0])) {
            _this.lastSphereAdded = _this.motifsAtoms[_this.motifsAtoms.length-1];
            _this.newSphere = _this.motifsAtoms[_this.motifsAtoms.length-1]; // pop
            _this.configureCellPoints();
          }
          else{
            _this.newSphere = undefined ;
            _this.lastSphereAdded = undefined ;
            _this.isEmpty = true ;  
          }
          _this.dragMode = false;
          PubSub.publish(events.EDITOR_STATE,"initial");
          break;
      }
    }
    else if(_this.editorState.state === "editing"){
      switch(buttonClicked) { 
        case "saveChanges":
          var name =$("#atomName").val();
          _this.newSphere.setName(name);
          _this.motifsAtoms.push(_this.newSphere); 
          _this.updateAtomList(_this.newSphere.getID(), _this.newSphere.getRadius(), _this.newSphere.getName(),false);
          PubSub.publish(events.EDITOR_STATE,"initial");
          _this.newSphere.blinkMode(false);
          _this.newSphere = undefined ;
          _this.dragMode = false;
          break;
        case "deleteAtom":
          _this.removeFromUnitCell(_this.newSphere.getID());
          _this.newSphere.destroy();
          _this.removeAtomFromList(_this.newSphere.getID());
          _.find(_this.motifsAtoms, function(atom,k){ if(atom.getID() === _this.newSphere.getID() ) _this.motifsAtoms.splice(k,1); }); 
          if(!_.isUndefined( _this.motifsAtoms[0])) {
            _this.lastSphereAdded = _this.motifsAtoms[_this.motifsAtoms.length-1];
            _this.newSphere = _this.motifsAtoms[_this.motifsAtoms.length-1];  
            _this.configureCellPoints();
          }
          else{
            _this.newSphere = undefined ;
            _this.lastSphereAdded = undefined ;
            _this.isEmpty = true ;  
          }
          _this.dragMode = false;
          PubSub.publish(events.EDITOR_STATE,"initial");  
          break;
        case "cancel":
          _this.removeFromUnitCell(_this.newSphere.getID());
          _this.newSphere.destroy();
          _this.removeAtomFromList(_this.newSphere.getID());
          _.find(_this.motifsAtoms, function(atom,k){ if(atom.getID() === _this.newSphere.getID() ) _this.motifsAtoms.splice(k,1); });
          if(!_.isUndefined( _this.motifsAtoms[0])) {
            _this.lastSphereAdded = _this.motifsAtoms[_this.motifsAtoms.length-1];
            _this.newSphere = _this.motifsAtoms[_this.motifsAtoms.length-1];  
            _this.configureCellPoints();
          }
          else{
            _this.newSphere = undefined ;
            _this.lastSphereAdded = undefined ;
            _this.isEmpty = true ;  
          }
          _this.dragMode = false;
          PubSub.publish(events.EDITOR_STATE,"initial");  
          break;
      }
    }
  };
  Motifeditor.prototype.editorState_ = function (state){
    var _this = this ;
    _this.editorState.state = state;

    switch(state) {
      case "initial": 
        $("#atomPalette").prop("disabled",false);
        $(".atomInput").css("visibility", "hidden");
        $('option:selected', 'select[id="savedAtoms"]').removeAttr('selected'); 
        $('select[id="savedAtoms"]').find('option[id="---"]').attr("selected",true);
        $("#savedAtomsCont").css("visibility", "visible");
        $('input[name=dragMode]').attr('checked', false);
        break;
      case "creating":
        $("#atomPalette").prop("disabled",true);
        $(".atomInput").css("visibility", "visible");
        $("#savedAtomsCont").css("visibility", "hidden");
        break;
      case "editing":
        $("#atomPalette").prop("disabled",true);
        $(".atomInput").css("visibility", "visible");
        $("#savedAtomsCont").css("visibility", "hidden");
        break;
    }
  };
  Motifeditor.prototype.viewState_ = function (state){
    var _this = this ; 
     
    if(state !== "Classic") {  
      $("disableME").prop("disabled",true);
    }
    else{
      $("disableME").prop("disabled",false); 
    }
  };
  Motifeditor.prototype.updateAtomList = function(id, radius, name, create)  {
    var _this = this ;
    var text =  name+" - radius : "+radius ; 
    if(create){
      var $savedAtoms = jQuery('#savedAtoms'); 
      var option = "<option id="+id+" value="+id+">"+text+"</option>" ;
      $savedAtoms.append(option) ;
    }
    else{
      var str = "#savedAtoms option[id='"+id+"']";
      $(str).text(text);
    }  
  };
  Motifeditor.prototype.removeAtomFromList = function(id)  { 
    $("#savedAtoms option[value='"+id+"']").remove();
  }; 

  Motifeditor.prototype.changeRotatingAngle = function(arg){
    var _this = this ;  
    var pos = new THREE.Vector3();
    var r = this.newSphere.getRadius() + this.tangentToThis.getRadius() ;
   
    var polar = parseFloat( $('#rotAngleTheta').val() );
    var azimuthal = parseFloat( $('#rotAnglePhi').val() );
    if(_this.dragMode){ 
      pos = _this.sphericalCoords( r, azimuthal *  (Math.PI/180) , polar *  (Math.PI/180) );  
    }
    pos.x += this.tangentToThis.object3d.position.x ;
    pos.y += this.tangentToThis.object3d.position.y ;
    pos.z += this.tangentToThis.object3d.position.z ;
    _this.newSphere.object3d.position.set(pos.x , pos.y, pos.z); 
    _this.translateCellAtoms("x",  pos.x , _this.newSphere.getID());
    _this.translateCellAtoms("y",  pos.y , _this.newSphere.getID());
    _this.translateCellAtoms("z",  pos.z , _this.newSphere.getID());
    _this.configureCellPoints();
    _this.findAngles('x');
    _this.findAngles('y');
    _this.findAngles('z'); 
  };
  Motifeditor.prototype.sphericalCoords = function(r, azimuthalPhi , polarTheta){   
    var pos = new THREE.Vector3();
    pos.x = r * Math.sin(polarTheta) * Math.sin(azimuthalPhi);
    pos.y = r * Math.cos(polarTheta);
    pos.z = r * Math.sin(polarTheta) * Math.cos(azimuthalPhi); 
    return pos;
  };
  Motifeditor.prototype.findPolarAngles = function(p){   
     
    var angles = {'theta': 0 , 'phi': 0};
    var n = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z );
    angles.theta = Math.acos(p.y/n) * (180/Math.PI);
    angles.phi = Math.atan(p.x/p.z) * (180/Math.PI);
    return angles;
  };
  Motifeditor.prototype.rotateAroundAtom = function(_angle){
    var _this = this; 
      
    if(_this.dragMode){ 
      var axis = this.rotAxis;
      var movingAtom = this.newSphere;
      var stillAtom = this.tangentToThis;
      var movingPoint = new THREE.Vector3(movingAtom.object3d.position.x, movingAtom.object3d.position.y, movingAtom.object3d.position.z); 
      var stillPoint = new THREE.Vector3(stillAtom.object3d.position.x, stillAtom.object3d.position.y, stillAtom.object3d.position.z);
      var tangentDistance = movingAtom.getRadius() + stillAtom.getRadius() ; 
      var angle = _angle;

      if(axis === 'x'){
        
        var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
        var inactiveAxesPoint = new THREE.Vector3(stillPoint.x, stillPoint.y, movingPoint.z);
        var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
        var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint);
        if (_.isUndefined(angle)) angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(  oldHypotenuseVec.x, oldHypotenuseVec.y ) ) ; 
        var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint);  
        var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
        var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
        var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
        var position = new THREE.Vector3(stillPoint.x + horizontalSide, stillPoint.y + verticalSide, movingPoint.z );

        _this.newSphere.object3d.position.y = position.y ;  
        _this.newSphere.object3d.position.x = position.x ;   
        _this.translateCellAtoms("y",  position.y , _this.newSphere.getID());
        _this.translateCellAtoms("x",  position.x , _this.newSphere.getID());

        $("#rotAngleX").text( angle.toFixed(3));
 
        _this.configureCellPoints();
        _this.findAngles('y');
        _this.findAngles('z');
      }
      else if(axis === 'y'){

        var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
        var inactiveAxesPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, stillPoint.z);
        var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
        var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
        if (_.isUndefined(angle)) angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(  -1 * oldHypotenuseVec.z, oldHypotenuseVec.y ) ) ; 
        var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint); 
        var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
        var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
        var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
        var position = new THREE.Vector3(movingPoint.x  , stillPoint.y + verticalSide,  (stillPoint.z - horizontalSide) );

        _this.newSphere.object3d.position.y = position.y ;  
        _this.newSphere.object3d.position.z = position.z ;  
        _this.translateCellAtoms("y",  position.y , _this.newSphere.getID());
        _this.translateCellAtoms("z",  position.z , _this.newSphere.getID());
        var a = parseFloat((180 -angle).toFixed(3)) ;
        if(a<0) a = 360 + a ;
        $("#rotAngleY").text(a);  
 
        _this.configureCellPoints();
        _this.findAngles('x');
        _this.findAngles('z');
      }
      else if(axis === 'z'){
        var thirdPoint = new THREE.Vector3(stillPoint.x, movingPoint.y, movingPoint.z); 
        var inactiveAxesPoint = new THREE.Vector3(stillPoint.x, movingPoint.y, stillPoint.z); 
        var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
        var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
        if (_.isUndefined(angle)) angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(   oldHypotenuseVec.x, -1 * oldHypotenuseVec.z ) ) ; 
        var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint);  
        var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) ); 
        var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
        var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) ); 
        var position = new THREE.Vector3(stillPoint.x + horizontalSide  , movingPoint.y ,  (stillPoint.z - verticalSide) );

        _this.newSphere.object3d.position.x = position.x ;  
        _this.newSphere.object3d.position.z = position.z ;  
        _this.translateCellAtoms("x",  position.x , _this.newSphere.getID());
        _this.translateCellAtoms("z",  position.z , _this.newSphere.getID());
        var a = (360 - angle).toFixed(3) ;
        if(a==360) a=0.000;
        $("#rotAngleZ").text(a); 

        _this.configureCellPoints();
        _this.findAngles('x');
        _this.findAngles('y'); 
      }
      _this.menu.setSliderValue("atomPosX", _this.newSphere.object3d.position.x);
      _this.menu.setSliderValue("atomPosY", _this.newSphere.object3d.position.y);
      _this.menu.setSliderValue("atomPosZ", _this.newSphere.object3d.position.z);
      var p = new THREE.Vector3(
        _this.newSphere.object3d.position.x-_this.tangentToThis.object3d.position.x,
        _this.newSphere.object3d.position.y-_this.tangentToThis.object3d.position.y,
        _this.newSphere.object3d.position.z-_this.tangentToThis.object3d.position.z
        );
      var angles = _this.findPolarAngles(p);
      $("#rotAngleTheta").val((angles.theta).toFixed(3));
      $("#rotAnglePhi").val((angles.phi).toFixed(3));
    }
  };
  Motifeditor.prototype.findAngles = function(axis){ // set with parameter for flexibility
    var _this = this ; 
      
    var movingAtom = this.newSphere;
    var stillAtom = this.tangentToThis;
    var movingPoint = new THREE.Vector3(movingAtom.object3d.position.x, movingAtom.object3d.position.y, movingAtom.object3d.position.z); 
    var stillPoint = new THREE.Vector3(stillAtom.object3d.position.x, stillAtom.object3d.position.y, stillAtom.object3d.position.z);
    var tangentDistance = movingAtom.getRadius() + stillAtom.getRadius() ; 
    var angle;

    if(axis === 'x'){
      var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
      var inactiveAxesPoint = new THREE.Vector3(stillPoint.x, stillPoint.y, movingPoint.z);
      var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
      var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint);
      angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(  oldHypotenuseVec.x, oldHypotenuseVec.y ) ) ; 
      var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint);  
      var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
      var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
      var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
      var position = new THREE.Vector3(stillPoint.x + horizontalSide, stillPoint.y + verticalSide, movingPoint.z );
      $("#rotAngleX").text( angle.toFixed(3));

    }
    else if(axis === 'y'){
      var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
      var inactiveAxesPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, stillPoint.z);
      var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
      var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
      angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(  -1 * oldHypotenuseVec.z, oldHypotenuseVec.y ) ) ; 
      var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint); 
      var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
      var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
      var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
      var position = new THREE.Vector3(movingPoint.x  , stillPoint.y + verticalSide,  (stillPoint.z - horizontalSide) );
      var a = parseFloat((180 -angle).toFixed(3)) ;
      if(a<0) a = 360 + a ;
      $("#rotAngleY").text(a); 
    }
    else if(axis === 'z'){
      var thirdPoint = new THREE.Vector3(stillPoint.x, movingPoint.y, movingPoint.z); 
      var inactiveAxesPoint = new THREE.Vector3(stillPoint.x, movingPoint.y, stillPoint.z); 
      var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
      var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
      angle = calculateAngle( new THREE.Vector2(  1,0 ), new THREE.Vector2(   oldHypotenuseVec.x, -1 * oldHypotenuseVec.z ) ) ; 
      var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint);  
      var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) ); 
      var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
      var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) ); 
      var position = new THREE.Vector3(stillPoint.x + horizontalSide  , movingPoint.y ,  (stillPoint.z - verticalSide) );
      var a = (360 - angle).toFixed(3) ;
      if(a==360) a=0.000;
      $("#rotAngleZ").text(a); 
    } 
          
  };
  function calculateAngle(vec1, vec2){ 
    vec1.normalize();
    vec2.normalize(); 
    var angle = Math.atan2( vec2.y,vec2.x) -  Math.atan2(vec1.y,vec1.x); 
    var f = angle* (180/Math.PI);  
    if(f < 0 ) f = 360 + f ; 
     
    return f;  
  }
  Motifeditor.prototype.selectAtom = function (which){ 
    if(which==="---") {
      PubSub.publish(events.EDITOR_STATE,"initial");
    }
    else{ 
      var _this = this; 
       
      if(_this.dragMode) { 
          
        _this.tangentToThis = _.find(_this.motifsAtoms, function(atom){ return atom.getID() == which; });  
        var newPos = _this.findNewAtomsPos(_this.tangentToThis, _this.newSphere.getRadius(), true);  
         
        _this.newSphere.object3d.position.set(newPos.x, newPos.y, newPos.z); 
        _this.translateCellAtoms("x",  newPos.x , _this.newSphere.getID());
        _this.translateCellAtoms("y",  newPos.y , _this.newSphere.getID());
        _this.translateCellAtoms("z",  newPos.z , _this.newSphere.getID());
        _this.configureCellPoints(); 

        _this.menu.setSliderValue("atomPosX", _this.newSphere.object3d.position.x);
        _this.menu.setSliderValue("atomPosY", _this.newSphere.object3d.position.y);
        _this.menu.setSliderValue("atomPosZ", _this.newSphere.object3d.position.z);

        _this.findAngles('x');
        _this.findAngles('y');
        _this.findAngles('z');
        var p = new THREE.Vector3(
          _this.newSphere.object3d.position.x-_this.tangentToThis.object3d.position.x,
          _this.newSphere.object3d.position.y-_this.tangentToThis.object3d.position.y,
          _this.newSphere.object3d.position.z-_this.tangentToThis.object3d.position.z
        );
        var angles = _this.findPolarAngles(p);
        $("#rotAngleTheta").val((angles.theta).toFixed(3));
        $("#rotAnglePhi").val((angles.phi).toFixed(3));

      }
      else if(!_this.dragMode){ 
        var name,color, opacity;
        PubSub.publish(events.EDITOR_STATE,"editing");
        
        if(!_.isUndefined(_this.newSphere)) _this.newSphere.destroy() ;
        _this.newSphere = undefined ;
        _this.newSphere = _.find(_this.motifsAtoms, function(atom){ return atom.getID() == which; });
        $("#atomName").val(_this.newSphere.getName());
        $('#tangency').prop('checked', _this.newSphere.getTangency());
        _this.menu.setSliderValue("atomPosX", _this.newSphere.object3d.position.x);
        _this.menu.setSliderValue("atomPosY", _this.newSphere.object3d.position.y);
        _this.menu.setSliderValue("atomPosZ", _this.newSphere.object3d.position.z);
      }
    }
  };
  Motifeditor.prototype.configureCellPoints = function(){  
    var _this = this; 
    if(_this.isEmpty) return; 
    var dimensions;
    if( _this.editorState.fixed){  
      dimensions = {"xDim" : _this.cellParameters.scaleX, "yDim" : _this.cellParameters.scaleY, "zDim" : _this.cellParameters.scaleZ };
    } 
    else{ 
      if(_this.newSphere === undefined){
        dimensions = _this.findMotifsDimensions(undefined, undefined);   
      }
      else{
        dimensions = _this.findMotifsDimensions(_this.newSphere.object3d.position, _this.newSphere.getRadius());   
      }
    } 

    _this.cellPointsWithScaling(dimensions, true); // todo fix that true  
    

    if(_this.latticeName !== 'hexagonal'){

      _this.cellPointsWithAngles();

      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset();
                    if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                      _this.unitCellAtoms[i].object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                }   
              });
            });
          }); 
          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset();
                    if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                      _this.unitCellAtoms[i].object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                } 
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) { 
            for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
              if(_this.unitCellAtoms[j].latticeIndex === ("_"+i) ){  
                var offset = _this.unitCellAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                  _this.unitCellAtoms[j].object3d.position.set( 
                    _this.unitCellPositions["_"+i].position.x + offset.x , 
                    _this.unitCellPositions["_"+i].position.y + offset.y , 
                    _this.unitCellPositions["_"+i].position.z + offset.z 
                  );
                }  
              } 
              if(_this.unitCellAtoms[j].latticeIndex === ("__"+i) ){  
                var offset = _this.unitCellAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                  _this.unitCellAtoms[j].object3d.position.set( 
                    _this.unitCellPositions["__"+i].position.x + offset.x , 
                    _this.unitCellPositions["__"+i].position.y + offset.y , 
                    _this.unitCellPositions["__"+i].position.z + offset.z 
                  );
                }  
              } 
              if(_this.unitCellAtoms[j].latticeIndex === ("___"+i) ){  
                var offset = _this.unitCellAtoms[j].getUserOffset(); 
                if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                  _this.unitCellAtoms[j].object3d.position.set( 
                    _this.unitCellPositions["___"+i].position.x + offset.x , 
                    _this.unitCellPositions["___"+i].position.y + offset.y , 
                    _this.unitCellPositions["___"+i].position.z + offset.z 
                  );
                }  
              }  
            }
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset();
                    if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                      _this.unitCellAtoms[i].object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                }   
              });
            });
          }); 
          for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
            if(_this.unitCellAtoms[i].latticeIndex === ("_c") ){  
              var offset = _this.unitCellAtoms[i].getUserOffset();
              if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                _this.unitCellAtoms[i].object3d.position.set( 
                  _this.unitCellPositions["_c"].position.x + offset.x , 
                  _this.unitCellPositions["_c"].position.y + offset.y , 
                  _this.unitCellPositions["_c"].position.z + offset.z 
                );
              } 
            } 
          }  
          break;
         case "base":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset();
                    if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                      _this.unitCellAtoms[i].object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                } 
              });
            });
          });   
          for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
            if(_this.unitCellAtoms[j].latticeIndex === ("_up") ){  
              var offset = _this.unitCellAtoms[j].getUserOffset(); 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["_up"].position.x + offset.x , 
                  _this.unitCellPositions["_up"].position.y + offset.y , 
                  _this.unitCellPositions["_up"].position.z + offset.z 
                );
              }  
            } 
            if(_this.unitCellAtoms[j].latticeIndex === ("_down") ){  
              var offset = _this.unitCellAtoms[j].getUserOffset(); 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["_down"].position.x + offset.x , 
                  _this.unitCellPositions["_down"].position.y + offset.y , 
                  _this.unitCellPositions["_down"].position.z + offset.z 
                );
              }  
            }  
          }

          break;
      }
    }
    else{
      var a = _this.cellParameters.scaleZ ;
      var c = _this.cellParameters.scaleY ; 

      var vertDist = a*Math.sqrt(3);

      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) { 
            _.times(6 , function(_r) {
              for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                var v = new THREE.Vector3( a, 0, 0 );

                var axis = new THREE.Vector3( 0, 1, 0 );
                var angle = (Math.PI / 3) * _r ; 
                v.applyAxisAngle( axis, angle );

                var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
                var y =  v.y + _y*c ;
                var x = v.x + _x*a*1.5 ;
                  
                var position = new THREE.Vector3( x, y, z);  

                var reference = 'h_'+_x+_y+_z+_r ;
                if(_this.unitCellAtoms[i].latticeIndex === (reference) ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset();
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      position.x + offset.x , 
                      position.y + offset.y , 
                      position.z + offset.z 
                    );
                  } 
                } 
              }    
            });
          });
        });
      });
    } 
  };
  Motifeditor.prototype.addAtomInCell = function(pos,radius,color,tang, name,id){  
    var _this = this;  
    var dimensions;

    if( _this.editorState.fixed){
      dimensions = {"xDim" : _this.cellParameters.scaleX, "yDim" : _this.cellParameters.scaleY, "zDim" : _this.cellParameters.scaleZ };
    } 
    else{ 
      dimensions = _this.findMotifsDimensions(pos, radius); // calculate dimensions of cell
    }
     
    _this.cellPointsWithScaling(dimensions, true); // todo fix that true 
    
    _this.cellPointsWithAngles();

    if(_this.latticeName !== 'hexagonal'){
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
                  pos.x + _this.unitCellPositions["_"+_x+_y+_z].position.x, 
                  pos.y + _this.unitCellPositions["_"+_x+_y+_z].position.y, 
                  pos.z + _this.unitCellPositions["_"+_x+_y+_z].position.z), 
                  radius, color, tang, name, id,  ("_"+_x+_y+_z)) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z ); 
             });
            });
          });

          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
                  pos.x + _this.unitCellPositions["_"+_x+_y+_z].position.x, 
                  pos.y + _this.unitCellPositions["_"+_x+_y+_z].position.y, 
                  pos.z + _this.unitCellPositions["_"+_x+_y+_z].position.z), 
                  radius, color, tang, name, id,  ("_"+_x+_y+_z)) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {
           
            _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
                pos.x + _this.unitCellPositions["_"+i].position.x, 
                pos.y + _this.unitCellPositions["_"+i].position.y, 
                pos.z + _this.unitCellPositions["_"+i].position.z), 
                radius, color, tang, name, id,  ("_"+i)) 
            ); 
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
            _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
              pos.x + _this.unitCellPositions["__"+i].position.x, 
              pos.y + _this.unitCellPositions["__"+i].position.y, 
              pos.z + _this.unitCellPositions["__"+i].position.z), 
              radius, color, tang, name, id,  ("__"+i)) 
            ); 
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
            _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
              pos.x + _this.unitCellPositions["___"+i].position.x, 
              pos.y + _this.unitCellPositions["___"+i].position.y, 
              pos.z + _this.unitCellPositions["___"+i].position.z), 
              radius, color, tang, name, id,  ("___"+i)) 
            ); 
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z ); 
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
                  pos.x + _this.unitCellPositions["_"+_x+_y+_z].position.x, 
                  pos.y + _this.unitCellPositions["_"+_x+_y+_z].position.y, 
                  pos.z + _this.unitCellPositions["_"+_x+_y+_z].position.z), 
                  radius, color, tang, name, id,  ("_"+_x+_y+_z)) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z ); 
             });
            });
          });
          _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
            pos.x + _this.unitCellPositions["_c"].position.x, 
            pos.y + _this.unitCellPositions["_c"].position.y, 
            pos.z + _this.unitCellPositions["_c"].position.z), 
            radius, color, tang, name, id,  ("_c")) 
          ); 
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z ); 
          break;
        case "base":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
                  pos.x + _this.unitCellPositions["_"+_x+_y+_z].position.x, 
                  pos.y + _this.unitCellPositions["_"+_x+_y+_z].position.y, 
                  pos.z + _this.unitCellPositions["_"+_x+_y+_z].position.z), 
                  radius, color, tang, name, id,  ("_"+_x+_y+_z)) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
              });
            });
          }); 
          
          _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
              pos.x + _this.unitCellPositions["_up"].position.x, 
              pos.y + _this.unitCellPositions["_up"].position.y, 
              pos.z + _this.unitCellPositions["_up"].position.z), 
              radius, color, tang, name, id,  ("_up")) 
          ); 
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );

          _this.unitCellAtoms.push(new UnitCellAtom( new THREE.Vector3(
            pos.x + _this.unitCellPositions["_down"].position.x, 
            pos.y + _this.unitCellPositions["_down"].position.y, 
            pos.z + _this.unitCellPositions["_down"].position.z), 
            radius, color, tang, name, id,  ("_down")) 
          ); 
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
   
          break;
      }
    }
    else{  
      var a = _this.cellParameters.scaleZ ;
      var c = _this.cellParameters.scaleY ; 

      var vertDist = a*Math.sqrt(3);

      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) { 
            _.times(6 , function(_r) {

              var v = new THREE.Vector3( a, 0, 0 );

              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
                
              var position = new THREE.Vector3( x, y, z); 

              var reference = 'h_'+_x+_y+_z+_r ;
                
              _this.unitCellAtoms.push(new UnitCellAtom( 
                new THREE.Vector3(
                  pos.x + position.x, 
                  pos.y + position.y, 
                  pos.z + position.z), 
                  radius, color, tang, name, id, reference
                ) 
              ); 
              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z ); 

              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
              _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );    
               
            });
          });
        });
      });
 
    }
    _this.reconstructCellPoints();  
     
  };
  Motifeditor.prototype.reconstructCellPoints = function(){
    var _this = this; 
    if(_this.isEmpty) return ;
    if(_this.latticeName !== 'hexagonal'){
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset(); 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                    ); 
                  }
                }   
              });
            });
          });
          
          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset(); 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                    ); 
                  }
                }  
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) { 
            for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("_"+i) ){  
                var offset = _this.unitCellAtoms[j].getUserOffset(); 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["_"+i].position.x + offset.x , 
                  _this.unitCellPositions["_"+i].position.y + offset.y , 
                  _this.unitCellPositions["_"+i].position.z + offset.z 
                ); 
              } 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("__"+i) ){  
                var offset = _this.unitCellAtoms[j].getUserOffset(); 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["__"+i].position.x + offset.x , 
                  _this.unitCellPositions["__"+i].position.y + offset.y , 
                  _this.unitCellPositions["__"+i].position.z + offset.z 
                ); 
              } 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("___"+i) ){  
                var offset = _this.unitCellAtoms[j].getUserOffset(); 
                _this.unitCellAtoms[j].object3d.position.set( 

                  _this.unitCellPositions["___"+i].position.x + offset.x , 
                  _this.unitCellPositions["___"+i].position.y + offset.y , 
                  _this.unitCellPositions["___"+i].position.z + offset.z 
                ); 
              } 
            }
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset(); 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                    ); 
                  }
                }   
              });
            });
          });
          for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
            if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_c") ){  
              var offset = _this.unitCellAtoms[i].getUserOffset(); 
              _this.unitCellAtoms[i].object3d.position.set( 
                _this.unitCellPositions["_c"].position.x + offset.x , 
                _this.unitCellPositions["_c"].position.y + offset.y , 
                _this.unitCellPositions["_c"].position.z + offset.z 
              ); 
            }
          }
          break;
        case "base":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) ){  
                    var offset = _this.unitCellAtoms[i].getUserOffset(); 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                      _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                    ); 
                  }
                }  
              });
            });
          }); 
          for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
            if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("_up") ){  
              var offset = _this.unitCellAtoms[j].getUserOffset(); 
              _this.unitCellAtoms[j].object3d.position.set( 
                _this.unitCellPositions["_up"].position.x + offset.x , 
                _this.unitCellPositions["_up"].position.y + offset.y , 
                _this.unitCellPositions["_up"].position.z + offset.z 
              ); 
            } 
            if(!_.isUndefined(_this.unitCellAtoms[j].object3d) && _this.unitCellAtoms[j].latticeIndex === ("_down") ){  
              var offset = _this.unitCellAtoms[j].getUserOffset(); 
              _this.unitCellAtoms[j].object3d.position.set( 
                _this.unitCellPositions["_down"].position.x + offset.x , 
                _this.unitCellPositions["_down"].position.y + offset.y , 
                _this.unitCellPositions["_down"].position.z + offset.z 
              ); 
            }  
          }
           
          break;
      }
    }
    else{
      var a = _this.cellParameters.scaleZ ;
      var c = _this.cellParameters.scaleY ; 

      var vertDist = a*Math.sqrt(3);

      _.times(2, function(_y) {
        _.times(1 , function(_x) {
          _.times(1 , function(_z) { 
            _.times(6 , function(_r) {
              var v = new THREE.Vector3( a, 0, 0 );

              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
                
              var position = new THREE.Vector3( x, y, z);  

              var reference = 'h_'+_x+_y+_z+_r ;

              for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
               
                if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === reference ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset(); 
                  _this.unitCellAtoms[i].object3d.position.set( 
                    position.x + offset.x ,  
                    position.y + offset.y , 
                    position.z + offset.z 
                  ); 
                }
              }   
            });
          });
        });
      });
    }
  }
  Motifeditor.prototype.translateCellAtoms = function(axes, val, id){    
    var _this = this;   
    for (var i = 0; i<_this.unitCellAtoms.length; i++) {
      if(_this.unitCellAtoms[i].myID === id ){
        switch(axes) {
          case "x":  
            this.unitCellAtoms[i].object3d.position.x = parseFloat(val) ;
            this.unitCellAtoms[i].setUserOffset("x",parseFloat(val)); 
            break;
          case "y": 
            this.unitCellAtoms[i].object3d.position.y = parseFloat(val)  ;
            this.unitCellAtoms[i].setUserOffset("y",parseFloat(val)); 
            break;
          case "z": 
            this.unitCellAtoms[i].object3d.position.z = parseFloat(val)  ;
            this.unitCellAtoms[i].setUserOffset("z",parseFloat(val)); 
            break;
        } 
      }
    }
  };
  Motifeditor.prototype.findMotifsDimensions = function(pos, radius){
    var _this = this, offsets = {x : 0, y : 0, z : 0 } ;   
     
    var now = performance.now();
 
    if(_.isUndefined(_this.newSphere.object3d)){
      if(!_.isUndefined(pos) ){ 
        var helperObj = {"object3d" : {"position" : { "x": pos.x, "y":pos.y, "z": pos.z}}, getRadius: function() { return radius; } } ; 
        this.motifsAtoms.push(helperObj); 
      }
    }
    else{  
      _this.motifsAtoms.push(_this.newSphere);
    } 

    // - create an helper motif (copy of the real motif)
    var motifHelper = [], j = 0;
    while(j < _this.motifsAtoms.length ) { 
      var x = _this.motifsAtoms[j].object3d.position.x ;
      var y = _this.motifsAtoms[j].object3d.position.y ;
      var z = _this.motifsAtoms[j].object3d.position.z ;
      var r = _this.motifsAtoms[j].getRadius();

      motifHelper.push( 
        {
          "object3d" : {"position" : { "x": x, "y": y, "z": z, clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); } } },
          "r" : r , 
          getRadius: function() { return (this.r); } 
        } 
      ); 
      j++;
    } 
    /////

    // - find classic unit cell dimensions
    var distantLeftX  = _.min(_this.motifsAtoms, function(atom){ return (atom.object3d.position.x - atom.getRadius()); });
    var distantDownY  = _.min(_this.motifsAtoms, function(atom){ return (atom.object3d.position.y - atom.getRadius()); });
    var distantBackZ  = _.min(_this.motifsAtoms, function(atom){ return (atom.object3d.position.z - atom.getRadius()); });
    var distantRightX = _.max(_this.motifsAtoms, function(atom){ return (atom.object3d.position.x + atom.getRadius()); });
    var distantUpY    = _.max(_this.motifsAtoms, function(atom){ return (atom.object3d.position.y + atom.getRadius()); });
    var distantForthZ = _.max(_this.motifsAtoms, function(atom){ return (atom.object3d.position.z + atom.getRadius()); });

    var cell = { 
      xDim: Math.abs(distantLeftX.object3d.position.x - distantLeftX.getRadius() - (distantRightX.object3d.position.x + distantRightX.getRadius()) ),
      yDim: Math.abs(distantDownY.object3d.position.y - distantUpY.getRadius()   - (distantUpY.object3d.position.y    + distantDownY.getRadius())  ),
      zDim: Math.abs(distantBackZ.object3d.position.z - distantBackZ.getRadius() - (distantForthZ.object3d.position.z + distantForthZ.getRadius()) )
    } 
    
    if(cell.xDim===0) cell.xDim = distantRightX.getRadius()*2  ;
    if(cell.yDim===0) cell.yDim = distantUpY.getRadius()*2  ;
    if(cell.zDim===0) cell.zDim = distantForthZ.getRadius()*2  ;  
    // 
 
    // - find minimum radius of spheres r
    var minRadius = _this.findShortestRadius(); 
    // - set r-0.1 as a step for moving downwards the whole motif
    var movingOffset = minRadius;
    ////

    // - move helper motif by 1 step each time and detect collision 
    var finished = false, theXOffset, theYOffset, theZOffset;

    // for X
    j = 0;
    while(j < motifHelper.length ) { 
      motifHelper[j].object3d.position.x += cell.xDim ; 
      j++;
    }
    while(!finished){
      offsets.x -= movingOffset; 
      var j = 0;
      while(j < motifHelper.length ) { 
        motifHelper[j].object3d.position.x -= movingOffset ;  // todo maybe move it by a full 2r-0.001
        j++;
      }
      theXOffset = _this.fakeCollision("x", motifHelper);
      if (theXOffset != -1) finished = true ; 
    }   

    // for Y
    finished = false;
    j = 0;
    while(j < _this.motifsAtoms.length ) { 
      var x = _this.motifsAtoms[j].object3d.position.x ; 
      motifHelper[j].object3d.position.x = x ;
      motifHelper[j].object3d.position.y += cell.yDim ; 
      j++;
    } 

    while(!finished){ 
      offsets.y -= movingOffset; 
      var j = 0;
      while(j < motifHelper.length ) { 
        motifHelper[j].object3d.position.y -= movingOffset ;  // todo maybe move it by a full 2r-0.001
        j++;
      }
      theYOffset = _this.fakeCollision("y", motifHelper);
      if (theYOffset != -1) finished = true ; 
    } 
     
    // for Z
    finished = false;
    j = 0 ;
    while(j < _this.motifsAtoms.length ) { 
      var y = _this.motifsAtoms[j].object3d.position.y ; 
      motifHelper[j].object3d.position.y = y ;
      motifHelper[j].object3d.position.z += cell.zDim ; 
      j++;
    } 

    while(!finished){ 
      offsets.z -= movingOffset; 
      var j = 0;
      while(j < motifHelper.length ) { 
        motifHelper[j].object3d.position.z -= movingOffset ;  // todo maybe move it by a full 2r-0.001
        j++;
      }
      theZOffset = _this.fakeCollision("z", motifHelper);
      if (theZOffset != -1) finished = true ; 
    } 
    //

    /*
    var tempDim = {x: (cell.xDim + theXOffset + offsets.x), y: (cell.yDim + theYOffset + offsets.y), z: (cell.zDim + theZOffset + offsets.z)};

    // add a motif in each direction 
    j = 0 ;
    while(j < _this.motifsAtoms.length ) { 
      var z = _this.motifsAtoms[j].object3d.position.z ; 
      motifHelper[j].object3d.position.z = z ;

      var x = _this.motifsAtoms[j].object3d.position.x ;
      var y = _this.motifsAtoms[j].object3d.position.y ;
      var z = _this.motifsAtoms[j].object3d.position.z ;
      var r = _this.motifsAtoms[j].getRadius();

      motifHelper.push( 
        {
          "object3d" : {"position" : { 
            "x": x, 
            "y": y, 
            "z": z, 
            clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); } } },
          "r" : r , 
          getRadius: function() { return (this.r); } 
        } 
      ); 

      j++;
    }*/
  
    cell.xDim = (cell.xDim + theXOffset + offsets.x);
    cell.yDim = (cell.yDim + theYOffset + offsets.y);
    cell.zDim = (cell.zDim + theZOffset + offsets.z);
    _this.cellParameters.scaleX = cell.xDim ;
    _this.cellParameters.scaleY = cell.yDim ;
    _this.cellParameters.scaleZ = cell.zDim ; 

    _this.motifsAtoms.pop();

    var after = performance.now();
   // console.log('It took ' + (after - now) + ' ms.');

    return cell; // remember these dimensions are in 2R (e.g for cubic primitive)
  };
  Motifeditor.prototype.fakeCollision = function(axis, motifHelper){

    var _this = this;

    var offsets = [], i = 0, j =0;
     
    while(i<motifHelper.length) {
      j = 0;  
      while(j<_this.motifsAtoms.length) { 
        var a = motifHelper[i].object3d.position.clone();
        var b = new THREE.Vector3(_this.motifsAtoms[j].object3d.position.x, _this.motifsAtoms[j].object3d.position.y, _this.motifsAtoms[j].object3d.position.z) ;
        var realDistance =parseFloat(  (a.distanceTo(b)).toFixed(parseInt(10)) );
        var calculatedDistance = parseFloat( (_this.motifsAtoms[j].getRadius() + motifHelper[i].getRadius()).toFixed(parseInt(10)) ) ;  
        if (realDistance < calculatedDistance){     
          offsets.push( Math.abs( parseFloat((_this.fakeFixAtomPosition(motifHelper[i], _this.motifsAtoms[j],axis)).toFixed(parseInt(10)) ) ) ) ;  
        }  
        j++;
      } 
      i++;
    };  
    var o = (offsets.length === 0) ? -1 : _.max(offsets) ;
    
    return o;
  };
  Motifeditor.prototype.fakeFixAtomPosition = function(helperAtom, otherAtom,axis){
    var _this = this,sign = 1; 

    var movingSpherePosition = helperAtom.object3d.position.clone();

    var collisionSpherePosition = new THREE.Vector3(otherAtom.object3d.position.x, otherAtom.object3d.position.y, otherAtom.object3d.position.z);
  
    var realTimeHypotenuse = collisionSpherePosition.distanceTo (movingSpherePosition);
    var calculatedHypotenuse = parseFloat( otherAtom.getRadius() + helperAtom.getRadius() ) ;  

    var fixedSide ;
    var wrongSide ;
     
    if(axis==="x"){ 
      wrongSide = Math.abs(movingSpherePosition.x - collisionSpherePosition.x);
      var projection = new THREE.Vector3(movingSpherePosition.x,collisionSpherePosition.y, collisionSpherePosition.z );
      fixedSide =  movingSpherePosition.distanceTo(projection);  
      if(movingSpherePosition.x < collisionSpherePosition.x) sign = -1 ;
    }
    else if(axis==="y"){ 
      wrongSide = Math.abs(movingSpherePosition.y - collisionSpherePosition.y);
      var projection = new THREE.Vector3(collisionSpherePosition.x,movingSpherePosition.y,collisionSpherePosition.z );
      fixedSide =  movingSpherePosition.distanceTo(projection);
      if(movingSpherePosition.y < collisionSpherePosition.y) sign = -1 ;
    }
    else{ 
      wrongSide = Math.abs(movingSpherePosition.z - collisionSpherePosition.z);
      var projection = new THREE.Vector3(collisionSpherePosition.x,collisionSpherePosition.y,movingSpherePosition.z ); 
      fixedSide =  movingSpherePosition.distanceTo(projection); 
      if(movingSpherePosition.z < collisionSpherePosition.z) sign = -1 ;  
    }   
    
    var rightSide = Math.sqrt ( ((calculatedHypotenuse*calculatedHypotenuse) - (fixedSide*fixedSide) )); 

    var offset = parseFloat( rightSide - wrongSide );
   
    return (sign*offset);
  };
  function customBox(points) { 

    var vertices = [];
    var faces = [];

    vertices.push(points['_000'].position); // 0
    vertices.push(points['_010'].position); // 1
    vertices.push(points['_011'].position); // 2

    vertices.push(points['_001'].position); // 3
    vertices.push(points['_101'].position); // 4
    vertices.push(points['_111'].position); // 5
    vertices.push(points['_110'].position); // 6
    vertices.push(points['_100'].position); // 7

    faces.push(new THREE.Face3(0,1,2));
    faces.push(new THREE.Face3(0,2,3));

    faces.push(new THREE.Face3(3,2,5));
    faces.push(new THREE.Face3(3,5,4));
 
    faces.push(new THREE.Face3(4,5,6));
    faces.push(new THREE.Face3(4,6,7));

    faces.push(new THREE.Face3(7,6,1));
    faces.push(new THREE.Face3(7,1,0));

    faces.push(new THREE.Face3(7,0,3));
    faces.push(new THREE.Face3(7,3,4));

    faces.push(new THREE.Face3(2,1,6));
    faces.push(new THREE.Face3(2,6,5)); 

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;

    geom.mergeVertices();

    return geom;
  }
  Motifeditor.prototype.setCSGmode = function(mode){ 
    var _this = this, i = 0;

    var a = performance.now();
    _this.viewState = mode;

    var g = customBox(_this.unitCellPositions);

    var box = new THREE.Mesh( g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: "#FF0000"} ) );

    if(_this.viewState === 'Subtracted'){
      while(i < _this.unitCellAtoms.length ) {
        _this.unitCellAtoms[i].object3d.visible = true; 
        _this.unitCellAtoms[i].subtractedSolidView(box, _this.unitCellAtoms[i].object3d.position); 
        i++;
      } 
      var scene = UnitCellExplorer.getInstance().object3d;
      var object = scene.getObjectByName('solidvoid');
      if(!_.isUndefined(object)) scene.remove(object);
      PubSub.publish(events.VIEW_STATE,"Subtracted"); 
       
    }
    else if(_this.viewState === 'SolidVoid'){   

      var geometry = new THREE.Geometry();  
  
      while(i < _this.unitCellAtoms.length ) {  
        _this.unitCellAtoms[i].SolidVoid(_this.unitCellAtoms[i].object3d.position);  
        var mesh = new THREE.Mesh(new THREE.SphereGeometry(_this.unitCellAtoms[i].getRadius(), 32, 32), new THREE.MeshBasicMaterial() );
        mesh.position.set( _this.unitCellAtoms[i].object3d.position.x, _this.unitCellAtoms[i].object3d.position.y, _this.unitCellAtoms[i].object3d.position.z);
        mesh.updateMatrix();  
        geometry.merge( mesh.geometry, mesh.matrix );
        _this.unitCellAtoms[i].object3d.visible = false;   

        i++; 
      } 

      var cube = THREE.CSG.toCSG(box); 
      cube = cube.inverse();
      var spheres = THREE.CSG.toCSG(geometry);
      var geometryCSG = cube.subtract(spheres);
      var geom = THREE.CSG.fromCSG(geometryCSG);
      var finalGeom = assignUVs(geom);
 
      var solidBox = new THREE.Mesh( finalGeom, new THREE.MeshBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  })  );
      solidBox.name = 'solidvoid';
      UnitCellExplorer.add({'object3d' : solidBox}); 
      PubSub.publish(events.VIEW_STATE,"SolidVoid"); 
    }
    else if(_this.viewState === 'GradeLimited'){   
      PubSub.publish(events.VIEW_STATE,"GradeLimited"); 
    }
    else if(_this.viewState === 'Classic'){ 
      while(i < _this.unitCellAtoms.length ) { 
        _this.unitCellAtoms[i].object3d.visible = true;
        _this.unitCellAtoms[i].classicView(); 
        i++;
      } 
      var scene = UnitCellExplorer.getInstance().object3d;
      var object = scene.getObjectByName('solidvoid');
      if(!_.isUndefined(object)) scene.remove(object);
      PubSub.publish(events.VIEW_STATE,"Classic");
    }

    var b = performance.now();

    console.log('It took ' + (b - a) + ' ms.');
  };
  function assignUVs( geometry ){ //todo maybe it doesn't work right
     
    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (var i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;

    return geometry;
  }
  Motifeditor.prototype.findShortestRadius = function(){
    var r = _.min(this.motifsAtoms, function(atom){ return (atom.getRadius()); }); 
    return (r.getRadius());
  };
  Motifeditor.prototype.fixedLengthMode = function(arg){
    var _this = this, i=0;   
    if(arg.fixedLength===true) {
      if(!_.isUndefined(_this.motifsAtoms[0])){
        while(i < _this.motifsAtoms.length ) {
          _this.motifsAtoms[i].setTangency(false);
          i++;
        }
      }  
      $('#tangency').prop('checked', false);
      $('#tangency').prop('disabled', true);
    }
    else {
      $('#tangency').prop('disabled', false);
    }
    _this.editorState.fixed = arg.fixedLength;
    if(arg.x.length>0) {
      
      if(_this.latticeName === 'hexagonal'){
        $('#scaleX').val(arg.z);
        _this.cellParameters.scaleX = parseFloat(arg.z) ;
      }
      else{
        $('#scaleX').val(arg.x);
        _this.cellParameters.scaleX = parseFloat(arg.x) ;
      }
    }
    if(arg.y.length>0) {
      _this.cellParameters.scaleY = parseFloat(arg.y) ;
      $('#scaleY').val(arg.y);
    }
    if(arg.z.length>0) {
      _this.cellParameters.scaleZ = parseFloat(arg.z) ;
      $('#scaleZ').val(arg.z);
    }
    
    _this.configureCellPoints();

  }; 
  Motifeditor.prototype.removeFromUnitCell = function( id ){  //
    var _this = this, pos = []; 
    for (var i = 0; i<_this.unitCellAtoms.length; i++) {
      if(_this.unitCellAtoms[i].getID() === id ){
        _this.unitCellAtoms[i].destroy();
        pos.push(i); 
      } 
    } 
    for (var i = pos.length - 1; i>= 0; i--) {
      _this.unitCellAtoms.splice(pos[i],1);;
    }   
  };  
  Motifeditor.prototype.cameraDist = function(mode, crystalRenderer) {
    var cPos = crystalRenderer.cameras[0].position ;
    var currDistance = (crystalRenderer.cameras[0].position).distanceTo(new THREE.Vector3(0,0,0)) ;
    var vFOV = crystalRenderer.cameras[0].fov * Math.PI / 180;         
    var Visheight = 2 * Math.tan( vFOV / 2 ) * currDistance;   

    if(mode.distortion){
      crystalRenderer.cameras[0].fov = 75;
      var distance = Visheight/(2 * Math.tan( (75* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }
    else{ 
      crystalRenderer.cameras[0].fov = 15;
      var distance = Visheight/(2 * Math.tan( (15* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }
  } 
  Motifeditor.prototype.colorUnitCellAtoms = function(id, color){   
    var _this = this; 
    for (var i = 0; i<_this.unitCellAtoms.length; i++) { 
      if(_this.unitCellAtoms[i].myID === id ){
        var op =  parseInt($("#atomOpacity").val());
        _this.unitCellAtoms[i].setMaterial(color, op);
      }
    }
  }; 
  Motifeditor.prototype.unitCellAtomsWireframe = function(id, bool){   
    var _this = this; 
    for (var i = 0; i<_this.unitCellAtoms.length; i++) { 
      if(_this.unitCellAtoms[i].myID === id ){ 
        _this.unitCellAtoms[i].wireframeMat(bool);
      }
    }
  };
  Motifeditor.prototype.unitCellAtomsTexture = function(id, texture){   
    var _this = this; 
    for (var i = 0; i<_this.unitCellAtoms.length; i++) { 
      if(_this.unitCellAtoms[i].myID === id ){
        _this.unitCellAtoms[i].setMaterialTexture(texture);
      }
    }
  };
  Motifeditor.prototype.unitCellAtomsOpacity = function(id, opacity){   
    var _this = this; 
    for (var i = 0; i<_this.unitCellAtoms.length; i++) { 
      if(_this.unitCellAtoms[i].myID === id ){
        _this.unitCellAtoms[i].setOpacity(opacity);
      }
    }
  }; 
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Angle Handling - lattice.js code
  Motifeditor.prototype.cellPointsWithScaling = function(dimensions, recreate){ 
    var _this = this;
    if(this.latticeName !== 'hexagonal'){ 
      switch(_this.latticeType) {
          case "primitive":    
            _.times(2 , function(_x) {
              _.times(2 , function(_y) {
                _.times(2 , function(_z) {
                  if(recreate){
                    _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                  }
                  else{
                    _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z) ;
                  }
                });
              });
            }); 
            break;
          case "face":   
            _.times(2 , function(_x) {
              _.times(2 , function(_y) {
                _.times(2 , function(_z) {
                  if(recreate){
                    _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *_x, Math.sqrt(2) * dimensions.yDim *_y, Math.sqrt(2) * dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                  }
                  else{
                    _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *_x, Math.sqrt(2) * dimensions.yDim *_y, Math.sqrt(2) * dimensions.zDim *_z) ;
                  }
                });
              });
            }); 
            for (var i = 0; i <= 1; i ++) {
              if(recreate){
                _this.unitCellPositions["_"+i] = {"position" : new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *i, Math.sqrt(2) * dimensions.yDim *0.5, Math.sqrt(2) * dimensions.zDim *0.5), "latticeIndex" : "_"+i } ;  
                _this.unitCellPositions["__"+i] = {"position" : new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *0.5, Math.sqrt(2) * dimensions.yDim *i, Math.sqrt(2) * dimensions.zDim *0.5), "latticeIndex" : "__"+i } ;  
                _this.unitCellPositions["___"+i] = {"position" : new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *0.5, Math.sqrt(2) * dimensions.yDim *0.5, Math.sqrt(2) * dimensions.zDim *i), "latticeIndex" : "___"+i } ;  
              }
              else{
                _this.unitCellPositions["_"+i].position = new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *i, Math.sqrt(2) * dimensions.yDim *0.5, Math.sqrt(2) * dimensions.zDim *0.5) ;
                _this.unitCellPositions["__"+i].position = new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *0.5, Math.sqrt(2) * dimensions.yDim *i, Math.sqrt(2) * dimensions.zDim *0.5) ;
                _this.unitCellPositions["___"+i].position = new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *0.5, Math.sqrt(2) * dimensions.yDim *0.5, Math.sqrt(2) * dimensions.zDim *i) ;
              }
            };
            break;
          case "body":  
            _.times(2 , function(_x) {
              _.times(2 , function(_y) {
                _.times(2 , function(_z) {
                  if(recreate){
                    _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( (2/Math.sqrt(3)) * dimensions.xDim *_x, (2/Math.sqrt(3)) * dimensions.yDim *_y, (2/Math.sqrt(3)) * dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                  }
                  else{
                    _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( (2/Math.sqrt(3)) * dimensions.xDim *_x, (2/Math.sqrt(3)) * dimensions.yDim *_y, (2/Math.sqrt(3)) * dimensions.zDim *_z) ;
                  }
                });
              });
            }); 
            if(recreate){
              _this.unitCellPositions["_c"] = {"position" : new THREE.Vector3( (1/Math.sqrt(3)) * dimensions.xDim , (1/Math.sqrt(3)) * dimensions.yDim , (1/Math.sqrt(3)) * dimensions.zDim ), "latticeIndex" : '_c' } ;  
            }
            else{
              _this.unitCellPositions["_c"].position = new THREE.Vector3( (1/Math.sqrt(3)) * dimensions.xDim , (1/Math.sqrt(3)) * dimensions.yDim , (1/Math.sqrt(3)) * dimensions.zDim ) ;
            }
            break;
          case "base":   
            _.times(2 , function(_x) {
              _.times(2 , function(_y) {
                _.times(2 , function(_z) {
                  if(recreate){
                    _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *_x,  dimensions.yDim *_y, Math.sqrt(2) * dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                  }
                  else{
                    _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( Math.sqrt(2) * dimensions.xDim *_x,  dimensions.yDim *_y, Math.sqrt(2) * dimensions.zDim *_z) ;
                  }
                });
              });
            }); 
             
            if(recreate){
              _this.unitCellPositions["_up"] = {"position" : new THREE.Vector3( Math.sqrt(2) * dimensions.xDim /2 ,  dimensions.yDim , Math.sqrt(2) * dimensions.zDim /2 ), "latticeIndex" : "_up" } ;  
              _this.unitCellPositions["_down"] = {"position" : new THREE.Vector3( Math.sqrt(2) * dimensions.xDim /2, 0 , Math.sqrt(2) * dimensions.zDim /2), "latticeIndex" : "_down" } ;  
            }
            else{
              _this.unitCellPositions["_up"].position = new THREE.Vector3( Math.sqrt(2) * dimensions.xDim /2,  dimensions.yDim , Math.sqrt(2) * dimensions.zDim /2) ;
              _this.unitCellPositions["_down"].position = new THREE.Vector3( Math.sqrt(2) * dimensions.xDim /2,  0, Math.sqrt(2) * dimensions.zDim /2) ;
            }  

            break;
      }
    }
    
  };
  Motifeditor.prototype.cellPointsWithAngles = function() {    
    this.transform( reverseShearing,            function(value) {  return value; }                       );
    //this.transform( reverseScaling,             function(value) { return (value === 0 ? 0 : 1 / value); } );       
    //this.transform( _.union(scaling, shearing), function(value) { return value; }                         );  
  };   
  var shearing = [ 'alpha', 'beta', 'gamma' ];
  var reverseShearing = shearing.slice(0).reverse();
  var scaling = [ 'scaleX', 'scaleY', 'scaleZ' ];
  var reverseScaling = scaling.slice(0).reverse();

  Motifeditor.prototype.transform = function(parameterKeys, operation) {
    var matrix, _this = this;
    var argument; 
    var parameters = this.cellParameters;

    _.each(parameterKeys, function(k) {
      if (_.isUndefined(parameters[k]) === false) { 
        argument = {};
        argument[k] = operation(parseFloat(parameters[k]));
        matrix = transformationMatrix(argument); 
        _.each(_this.unitCellPositions, function(obj, reference) {  
          obj.position.applyMatrix4(matrix); 
        });
      }
    });
  };

  var transformationMatrix = function(parameter) {
     
    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - ((parameter.alpha) || 90)) * Math.PI / 180);

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleZ || 1;
    var sc = parameter.scaleY || 1; 
    
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
    return m;
  };

  return Motifeditor;
});
