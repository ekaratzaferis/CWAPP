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
    this.initialLatticeParams = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 


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
    this.latticeType = 'none';  
    this.latticeSystem = 'none';

    this.manualAabc = false;
    this.leastCellLengths = {'x' : 0, 'y' : 0, 'z' : 0 };

    this.newSphere ;
    this.newCellSphere ;
    this.lastSphereAdded ; 
    this.dragMode = false;
    this.tangentToThis;
    this.rotAxis='x';
    this.mutex = true ;
    this.globalTangency = true;
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
      
  };
  Motifeditor.prototype.updateLatticeParameters = function(anglesScales, latticeType, latticeName, latticeSystem) {
    
    this.latticeType = latticeType; 
    this.latticeName = latticeName;   
    this.latticeSystem = latticeSystem;   
      
    this.initialLatticeParams.alpha = anglesScales.alpha ;
    this.initialLatticeParams.beta  = anglesScales.beta ;
    this.initialLatticeParams.gamma = anglesScales.gamma ; 
    
    if(this.editorState.fixed){  
      this.cellParameters.alpha = parseInt($("#alpha").val());
      this.cellParameters.beta = parseInt($("#beta").val());
      this.cellParameters.gamma = parseInt($("#gamma").val());
    }
    else { 
      this.cellParameters.alpha = this.initialLatticeParams.alpha ;
      this.cellParameters.beta  = this.initialLatticeParams.beta ;
      this.cellParameters.gamma = this.initialLatticeParams.gamma ;
    }  
    this.configureCellPoints(1);

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
      var p = _this.findNewAtomsPos(_this.lastSphereAdded, _this.atomsData[params.element].radius/100, false, params.element);
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
  Motifeditor.prototype.findNewAtomsPos = function(lastAtom, newAtomRadius, flag, elName ) { // todo if there is no free around the last atom, coll det >2

    var _this = this , posFound = false, posFoundx, posFoundy, posFoundz, position; 
    var x = lastAtom.object3d.position.x + lastAtom.getRadius() + newAtomRadius;
    var y = lastAtom.object3d.position.y ;
    var z = lastAtom.object3d.position.z ;
    if(!flag) { 
      _this.newSphere = {
        "object3d" : {"position" : { "x": x, "y": y, "z": z, 
        clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); } } },
        getRadius: function() { return newAtomRadius; },
        getID: function() { return "_0"; }, 
        getTangency: function() { return true; },
        getName: function() { return elName; },
        changeColor: function(a) {}  
      } ; 
    }
    else{
      _this.newSphere.object3d.position.set(x,y,z);
    }
    if(_this.latticeSystem === 'cubic' && _this.motifsAtoms.length === 1 && _this.latticeType === 'primitive'){
      
      if(_this.latticeType === 'primitive'){ 
        _this.tangentToThis = _this.motifsAtoms[0] ;
        _this.setTangentAngle(  45, 54.7354 , parseFloat(  newAtomRadius + _this.motifsAtoms[0].getRadius() ), _this.motifsAtoms[0]);
        $("#rotAngleTheta").val((54.7354).toFixed(4));
        $("#rotAnglePhi").val((45.0000).toFixed(4));
      } 
      
    }
    else if(_this.latticeSystem === 'hexagonal' && _this.motifsAtoms.length === 1  ){
      _this.tangentToThis = _this.motifsAtoms[0] ;
      _this.setTangentAngle(0.0000, 35.2644 , parseFloat(  newAtomRadius + _this.motifsAtoms[0].getRadius() ), _this.motifsAtoms[0] );
      $("#rotAngleTheta").val((35.2644).toFixed(4));
      $("#rotAnglePhi").val((0.0000).toFixed(4));
    }
    else{  
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
    }
    return _this.newSphere.object3d.position ;
  };
  Motifeditor.prototype.dragAtom = function(axis, pos, objID){  
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
    var stillColliding = true, doNotOverlap = _this.globalTangency ;
    
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
       
      if( (_this.globalTangency) && (_this.motifsAtoms[i].getID()!==_this.newSphere.getID())   ) { 
        
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
  Motifeditor.prototype.setManuallyCellDims = function(par){
   
    if(!this.manualAabc ) return ;

    var axis = 'none' ;

    if(par.Aa != undefined){
      this.cellParameters.scaleZ = parseFloat( par.Aa ); 
      // tangency check
      this.configureCellPoints(1);  
      var offset = this.checkInterMotifCollision('z', parseFloat(par.Aa) );
      this.cellParameters.scaleZ = offset ;
      if(par.Aa != offset ) this.menu.setSliderValue("Aa", offset);
      
    }
    else if(par.Ab != undefined){
      this.cellParameters.scaleX = parseFloat( par.Ab );
      // tangency check
      this.configureCellPoints(1);   
      var offset = this.checkInterMotifCollision('x', parseFloat(par.Ab) );
      this.cellParameters.scaleX = offset ;

      if(par.Ab != offset ) this.menu.setSliderValue("Ab", offset);
       
    }
    else if(par.Ac != undefined){
      this.cellParameters.scaleY = parseFloat( par.Ac );
      // tangency check
      this.configureCellPoints(1);   
      var offset = this.checkInterMotifCollision('y', parseFloat(par.Ac) );
      this.cellParameters.scaleY = offset ;
      if(par.Ac != offset ) this.menu.setSliderValue("Ac", offset);
    }
    
    this.configureCellPoints(1); //second time
    this.updateLatticeTypeRL();
  };
  Motifeditor.prototype.checkInterMotifCollision = function(axis, val){
    
    // here we compare the new value from the slider to the least cell dimensions we have calculated in the past or just now (depends on the lattice)

    var _this = this;

    _this.findLeastCellLength( axis, val ) ;

    switch(axis) { 
      case "x": 
        if( val < _this.leastCellLengths.x){
          return _this.leastCellLengths.x ;
        }
        else{
          return val;
        }
      break;

      case "y": 
        if( val < _this.leastCellLengths.y){
          return _this.leastCellLengths.y ;
        }
        else{
          return val;
        }

      break;

      case "z": 
        if( val < _this.leastCellLengths.z){
          return _this.leastCellLengths.z ;
        }
        else{
          return val;
        }

      break;
    }
           

  };

  Motifeditor.prototype.findLeastCellLength = function(axis, val){
     
    var _this = this ;
    var offsets = {x : 0, y : 0, z : 0 } ; 

    var helperObj = {"object3d" : {"position" : { "x": _this.newSphere.object3d.position.x, "y":_this.newSphere.object3d.position.y, "z": _this.newSphere.object3d.position.z, }}, getRadius: function() { return _this.newSphere.getRadius(); } ,
      
    } ; 
    this.motifsAtoms.push(helperObj);
 
    var motifHelper = [], j = 0;
    while(j < _this.motifsAtoms.length ) {  
      var x = _this.motifsAtoms[j].object3d.position.x ;
      var y = _this.motifsAtoms[j].object3d.position.y ;
      var z = _this.motifsAtoms[j].object3d.position.z ;
      var r = _this.motifsAtoms[j].getRadius();

      motifHelper.push( 
        {
          "object3d" : {"position" : { "x": x, "y": y, "z": z, clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); },
            applyMatrix4 : function ( m ) {
 
            var x = this.x, y = this.y, z = this.z;

            var e = m.elements;

            this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ];
            this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ];
            this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];
            } } },
          "r" : r , 
          getRadius: function() { return (this.r); } 
        } 
      ); 
      j++;
    } 
     // - find minimum radius of spheres r
    var minRadius = _this.findShortestRadius(); 
    // - set r-0.1 as a step for moving downwards the whole motif
    var movingOffset = parseFloat( minRadius);

    if( (axis === undefined) && (_this.latticeType === 'primitive') && (_this.latticeSystem === 'cubic' || _this.latticeSystem === 'tetragonal' || _this.latticeSystem === 'orthorhombic') )  
    {  
 
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
      j = 0;
      while(j < _this.motifsAtoms.length ) { 
        var z = _this.motifsAtoms[j].object3d.position.z ; 
        motifHelper[j].object3d.position.z = z ; 
        j++;
      }
      //
   
      var tempDim = {x: (cell.xDim + theXOffset + offsets.x), y: (cell.yDim + theYOffset + offsets.y), z: (cell.zDim + theZOffset + offsets.z)};
        
      this.leastCellLengths = tempDim;
    }
 
    ///
    else if( 
        ( (_this.latticeType === 'body' ) && (_this.latticeSystem === 'cubic' || _this.latticeSystem === 'tetragonal' || _this.latticeSystem === 'orthorhombic') )  
        ||  
        ( (_this.latticeType === 'face' ) && (_this.latticeSystem === 'cubic' || _this.latticeSystem === 'orthorhombic'))
        ||
        ( (_this.latticeType === 'base' ) && ( _this.latticeSystem === 'orthorhombic'))
        ||
        ( (_this.latticeType === 'primitive' ) && (_this.latticeSystem === 'rhombohedral' || _this.latticeSystem === 'triclinic' || (_this.latticeSystem === 'monoclinic'   )))
      )  
    {
      // this algorithm calculates the least distances of the unit cell in x,y,z directions, putting 4 times the motifhelper in diff position and tries fake collision
       
      var xDistances =[], theXOffset  ; 
      var twoDarr = [] ;
       
      if(axis === 'x'){   
        if (_this.latticeType === 'body' ) { 
          twoDarr = [{a : 1/2, b : 1/2}, {a : -1/2, b : 1/2}, {a : 1/2, b : -1/2}, {a : -1/2, b : -1/2}] 
        } 
        else if (_this.latticeType === 'face' ) {  
          twoDarr = [{a : 0, b : 1/2}, {a : 0, b : -1/2}, {a : 1/2, b : 0}, {a : -1/2, b : 0}] ;
        }
        else if (_this.latticeType === 'base' ) {  
          twoDarr = [{a : 0, b : 1/2}, {a : 0, b : -1/2} ] ;
        }
         
        _this.cellParameters.scaleX =  val ;
        j = 0;
        while(j < motifHelper.length ) { 
          motifHelper[j].object3d.position.x = _this.cellParameters.scaleX  ; 
           
          if (_this.latticeSystem === 'rhombohedral' || _this.latticeSystem === 'triclinic' || (_this.latticeSystem === 'monoclinic' && _this.latticeType === 'primitive' )) { 
            var argument, matrix ; 
            _.each(reverseShearing, function(k) {
              if (_.isUndefined(_this.cellParameters[k]) === false) { 
                argument = {};
                argument[k] = parseFloat(_this.cellParameters[k]); 
                matrix = transformationMatrix(argument);  
                motifHelper[j].object3d.position.applyMatrix4(matrix);  
              }
            });  
          }
          j++;
        }
        var sideTosideCol ;
        if(_this.latticeSystem === 'rhombohedral' || _this.latticeSystem === 'triclinic' || (_this.latticeSystem === 'monoclinic' && _this.latticeType === 'primitive')){ 
          sideTosideCol = _this.fakeCollision("x", motifHelper, 1); 
        }
        else{   
          sideTosideCol = _this.fakeCollision("x", motifHelper); 
        }

        
        j = 0;
         
        while(j < motifHelper.length ) { 
          motifHelper[j].object3d.position.x = _this.cellParameters.scaleX / 2 ; 
          j++;
        }
 
        for (var g = 0; g < twoDarr.length; g++) {

          j = 0;
          while(j < motifHelper.length ) {
            
            motifHelper[j].object3d.position.y = ( _this.cellParameters.scaleY * twoDarr[g].a ) ; 
            motifHelper[j].object3d.position.z = ( _this.cellParameters.scaleZ * twoDarr[g].b ) ;   
            j++;
          }
           
          theXOffset = _this.fakeCollision("x", motifHelper); 
          xDistances[g] = parseFloat(theXOffset  );
 
        };
        var maxX = _.max( xDistances );
        var centeredDist = (_this.cellParameters.scaleX/2 + maxX)* 2 ; // body centered atom
        var cornerDist = _this.cellParameters.scaleX + sideTosideCol; // in 4 corners 
        _this.leastCellLengths.x = (centeredDist > cornerDist) ? centeredDist : cornerDist;

        if(_this.leastCellLengths.x < 0 ) _this.leastCellLengths.x = val ;
        
      }
      
      else if(axis === 'y'){  
        if (_this.latticeType === 'body' ) { 
          twoDarr = [{a : 1/2, b : 1/2}, {a : -1/2, b : 1/2}, {a : 1/2, b : -1/2}, {a : -1/2, b : -1/2}] 
        } 
        else if (_this.latticeType === 'face' ) {  
          twoDarr = [{a : 0, b : 1/2}, {a : 0, b : -1/2}, {a : 1/2, b : 0}, {a : -1/2, b : 0}] ;
        }
        else if (_this.latticeType === 'base' ) {  
          twoDarr = [] ;
        }

        _this.cellParameters.scaleY =  val ;
        j = 0;
          
        while(j < motifHelper.length ) { 
          motifHelper[j].object3d.position.y = _this.cellParameters.scaleY  ; 
          if (_this.latticeSystem === 'rhombohedral' || _this.latticeSystem === 'triclinic' || (_this.latticeSystem === 'monoclinic' && _this.latticeType === 'primitive' )) { 
            var argument, matrix ;  
            _.each(reverseShearing, function(k) {  
              if (_.isUndefined(_this.cellParameters[k]) === false) { 
                argument = {};
                argument[k] = parseFloat(_this.cellParameters[k]); 
                matrix = transformationMatrix(argument);   
                motifHelper[j].object3d.position.applyMatrix4(matrix);   
              }
            });  
          }
          j++;
        }
         
        var sideTosideCol ;
        if(_this.latticeSystem === 'rhombohedral' || _this.latticeSystem === 'triclinic' || (_this.latticeSystem === 'monoclinic' && _this.latticeType === 'primitive')){ 
          sideTosideCol = _this.fakeCollision("y", motifHelper, 1); 
        }
        else{   
          sideTosideCol = _this.fakeCollision("y", motifHelper); 
        }
         
        j = 0;
        while(j < motifHelper.length ) { 
          motifHelper[j].object3d.position.y = _this.cellParameters.scaleY / 2 ; 
          j++;
        }
 
        for (var g = 0; g < twoDarr.length; g++) {

          j = 0;
          while(j < motifHelper.length ) {
            
            motifHelper[j].object3d.position.x = ( _this.cellParameters.scaleX * twoDarr[g].a ) ; 
            motifHelper[j].object3d.position.z = ( _this.cellParameters.scaleZ * twoDarr[g].b ) ;   
            j++;
          }
           
          theXOffset = _this.fakeCollision("y", motifHelper); 
          xDistances[g] = parseFloat(theXOffset  );
 
        };

        var maxX = _.max( xDistances );
        var centeredDist = (_this.cellParameters.scaleY/2 + maxX)* 2 ;
        var cornerDist = _this.cellParameters.scaleY + sideTosideCol;
         
        _this.leastCellLengths.y = (centeredDist > cornerDist) ? centeredDist : cornerDist;
          
        if(_this.leastCellLengths.y < 0 ) _this.leastCellLengths.y = val ;
        
      }
      else if(axis === 'z'){  
        if (_this.latticeType === 'body' ) { 
          twoDarr = [{a : 1/2, b : 1/2}, {a : -1/2, b : 1/2}, {a : 1/2, b : -1/2}, {a : -1/2, b : -1/2}] 
        } 
        else if (_this.latticeType === 'face' ) {  
          twoDarr = [{a : 0, b : 1/2}, {a : 0, b : -1/2}, {a : 1/2, b : 0}, {a : -1/2, b : 0}] ;
        }
        else if (_this.latticeType === 'base' ) {  
          twoDarr = [{a : 0, b : 1/2}, {a : 0, b : -1/2} ] ;
        }
        _this.cellParameters.scaleZ =  val ;
        j = 0;
        while(j < motifHelper.length ) { 
          motifHelper[j].object3d.position.z = _this.cellParameters.scaleZ  ; 
          if (_this.latticeSystem === 'rhombohedral' || _this.latticeSystem === 'triclinic' || (_this.latticeSystem === 'monoclinic' && _this.latticeType === 'primitive' )) { 
            var argument, matrix ; 
            _.each(reverseShearing, function(k) {
              if (_.isUndefined(_this.cellParameters[k]) === false) { 
                argument = {};
                argument[k] = parseFloat(_this.cellParameters[k]); 
                matrix = transformationMatrix(argument);  
                motifHelper[j].object3d.position.applyMatrix4(matrix);  
              }
            });  
          }
          j++;
        }

        var sideTosideCol ;
        if(_this.latticeSystem === 'rhombohedral' || _this.latticeSystem === 'triclinic' || (_this.latticeSystem === 'monoclinic' && _this.latticeType === 'primitive')){ 
          sideTosideCol = _this.fakeCollision("z", motifHelper, 1); 
        }
        else{   
          sideTosideCol = _this.fakeCollision("z", motifHelper); 
        }
        
        j = 0;
        while(j < motifHelper.length ) { 
          motifHelper[j].object3d.position.z = _this.cellParameters.scaleZ / 2 ; 
          j++;
        }
 
        for (var g = 0; g < twoDarr.length; g++) {

          j = 0;
          while(j < motifHelper.length ) {
            
            motifHelper[j].object3d.position.y = ( _this.cellParameters.scaleY * twoDarr[g].a ) ; 
            motifHelper[j].object3d.position.x = ( _this.cellParameters.scaleX * twoDarr[g].b ) ;   
            j++;
          }
           
          theXOffset = _this.fakeCollision("z", motifHelper); 
          xDistances[g] = parseFloat(theXOffset  );
 
        };
        var maxX = _.max( xDistances );
        var centeredDist = (_this.cellParameters.scaleZ/2 + maxX)* 2 ;
        var cornerDist = _this.cellParameters.scaleZ + sideTosideCol;
        _this.leastCellLengths.z = (centeredDist > cornerDist) ? centeredDist : cornerDist;
         
        if(_this.leastCellLengths.z < 0 ) _this.leastCellLengths.z = val ;
        
      }
        
    }
    else if( (_this.latticeType === 'hexagonal' ) && ( _this.latticeSystem === 'hexagonal') )     
    {
      // this algorithm calculates the least distances of the unit cell in x,y,z directions, putting 4 times the motifhelper in diff position and tries fake collision
        
      if(axis === 'y'){   

        _this.cellParameters.scaleY =  val ;
        j = 0;
          
        while(j < motifHelper.length ) { 
          motifHelper[j].object3d.position.y = _this.cellParameters.scaleY  ;  
          j++;
        }

        var sideTosideCol = _this.fakeCollision("y", motifHelper);
       
        var cornerDist = _this.cellParameters.scaleY + sideTosideCol;
        _this.leastCellLengths.y = cornerDist ;
         
        if(_this.leastCellLengths.y < 0 ) _this.leastCellLengths.y = val ;
        
      } 
      else if(axis === 'x' || axis === 'z'){ 

        /*var xDistances =[], theXOffset  ; 
        var twoDarr =[{a : 0, b : 1/2}, {a : 0, b : -1/2} ] ;
        _.times(6 , function(_r) {
          var v = new THREE.Vector3( a, 0, 0 );

          var axis = new THREE.Vector3( 0, 1, 0 );
          var angle = (Math.PI / 3) * _r ; 
          v.applyAxisAngle( axis, angle );

        });

        for (var g = 0; g < twoDarr.length; g++) {

          j = 0;
          while(j < motifHelper.length ) {
            
            motifHelper[j].object3d.position.y = ( _this.cellParameters.scaleY * twoDarr[g].a ) ; 
            motifHelper[j].object3d.position.x = ( _this.cellParameters.scaleX * twoDarr[g].b ) ;   
            j++;
          }
           
          theXOffset = _this.fakeCollision("z", motifHelper); 
          xDistances[g] = parseFloat(theXOffset  );
 
        };*/


      }
    }

    this.motifsAtoms.pop();
  };
  Motifeditor.prototype.fakeFixAtomPositionWithAngles = function(helperAtom, otherAtom,axis){
    var _this = this,sign = 1; 
    
    var movingSpherePosition = helperAtom.object3d.position.clone();

    var collisionSpherePosition = new THREE.Vector3( otherAtom.object3d.position.x, otherAtom.object3d.position.y, otherAtom.object3d.position.z );
  
    var realTimeHypotenuse = new THREE.Vector3( collisionSpherePosition.x - movingSpherePosition.x, collisionSpherePosition.y - movingSpherePosition.y, collisionSpherePosition.z - movingSpherePosition.z );
    var calculatedHypotenuse = parseFloat( otherAtom.getRadius() + helperAtom.getRadius() ) ;  

    var fixedSide ;
    var wrongSide, rightSide ;
     
    if(axis==="x"){ 
       
    }
    else if(axis==="y"){ 
      var argument,matrix,line = new THREE.Vector3(0,1,0);
      line.setLength(100);
      
      _.each(reverseShearing, function(k) {
        if (_.isUndefined(_this.cellParameters[k]) === false) { 
          argument = {};
          argument[k] = parseFloat(_this.cellParameters[k]); 
          matrix = transformationMatrix(argument);  
          line.applyMatrix4(matrix);  
        }
      });  
       
      var a = realTimeHypotenuse.clone(); 
      console.log(line);
      console.log(a);
      var projectOnLine = a.projectOnVector(line);
      console.log(a);
      wrongSide = projectOnLine.length();
       
      fixedSide = Math.sqrt ( Math.abs((( (realTimeHypotenuse.length())*(realTimeHypotenuse.length())) - (wrongSide*wrongSide) ))); 
       
      rightSide = Math.sqrt ( (( calculatedHypotenuse*calculatedHypotenuse) - (fixedSide*fixedSide) )); 
 
      console.log('---'); 
    }
    else{ 
         
    }    
    var offset = parseFloat( rightSide - wrongSide );
    console.log(offset); 

    return (offset);
  }; 
  Motifeditor.prototype.setDimsManually = function(par){
    
    if( par.manualSetCellDims) { 
      $(".manualDims").css("display", "inline"); 
      $('input[name=manualSetCellDims]').attr('checked', true);
      this.menu.setSliderValue("Aa", this.cellParameters.scaleZ);
      this.menu.setSliderValue("Ab", this.cellParameters.scaleX);
      this.menu.setSliderValue("Ac", this.cellParameters.scaleY);
      this.findLeastCellLength(); // calculate the least acceptable length for the cell
    }
    else{
      $(".manualDims").css("display", "none");
      $('input[name=manualSetCellDims]').attr('checked', false); 
    }
    this.setAtomMovementUI(par.manualSetCellDims);
    this.manualAabc = par.manualSetCellDims ;
  };
  Motifeditor.prototype.setAtomMovementUI = function (action){

    if(action){
      this.menu.setOnOffSlider('atomPosX', 'disable');  
      this.menu.setOnOffSlider('atomPosY', 'disable');
      this.menu.setOnOffSlider('atomPosZ', 'disable');

    }
    else{ 
      this.menu.setOnOffSlider('atomPosX', 'enable');
      this.menu.setOnOffSlider('atomPosY', 'enable');
      this.menu.setOnOffSlider('atomPosZ', 'enable');     
    }

    $("#atomPosX").prop("disabled",action);
    $("#atomPosY").prop("disabled",action);
    $("#atomPosZ").prop("disabled",action);
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
    this.globalTangency = param.tangency ;
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
    var _this = this, copiedAr = this.motifsAtoms.slice() ;
     
    if(_.isUndefined( _.find(_this.motifsAtoms, function(atom){ return atom.getID() == _this.newSphere.getID(); }) )) 
    {
      copiedAr.push(_this.newSphere); 
    }
    return copiedAr; 
  };
   
  Motifeditor.prototype.getAllAtoms = function (){
    return this.motifsAtoms;
  };
  Motifeditor.prototype.getDimensions = function (){ 
    var r = {}; 
    if(!this.editorState.fixed){  
       
      r = {
        'x' : this.cellParameters.scaleX, 
        'y' : this.cellParameters.scaleY, 
        'z' : this.cellParameters.scaleZ,
        'alpha' : this.cellParameters.alpha,
        'beta' : this.cellParameters.beta,
        'gamma' : this.cellParameters.gamma 
      } ;
    }
    else{
       
      r = {
        'x' : this.cellParameters.scaleX, 
        'y' : this.cellParameters.scaleY, 
        'z' : this.cellParameters.scaleZ,
        'alpha' : this.initialLatticeParams.alpha,
        'beta' : this.initialLatticeParams.beta,
        'gamma' : this.initialLatticeParams.gamma 
      } ;
    } 
    return r;
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
          _this.setDimsManually( { 'manualSetCellDims' : false });
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
          _this.setDimsManually( { 'manualSetCellDims' : false });
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
          _this.setDimsManually( { 'manualSetCellDims' : false });
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
          _this.setDimsManually( { 'manualSetCellDims' : false });
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
          _this.setDimsManually( { 'manualSetCellDims' : false });
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
          _this.setDimsManually( { 'manualSetCellDims' : false });
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
  Motifeditor.prototype.setTangentAngle = function(azimuthal, polar, r, tangentToThis){
     
    var _this = this ;  
    var pos = new THREE.Vector3();
         
    pos = _this.sphericalCoords( r, azimuthal *  (Math.PI/180) , polar *  (Math.PI/180) );  
     
    pos.x += tangentToThis.object3d.position.x ;
    pos.y += tangentToThis.object3d.position.y ;
    pos.z += tangentToThis.object3d.position.z ;
    
    _this.newSphere.object3d.position.x = pos.x ;
    _this.newSphere.object3d.position.y = pos.y ;
    _this.newSphere.object3d.position.z = pos.z ;
     
    _this.translateCellAtoms("x",  pos.x , _this.newSphere.getID());
    _this.translateCellAtoms("y",  pos.y , _this.newSphere.getID());
    _this.translateCellAtoms("z",  pos.z , _this.newSphere.getID());
    _this.configureCellPoints();
    _this.findAngles('x');
    _this.findAngles('y');
    _this.findAngles('z'); 
  };
  Motifeditor.prototype.changeRotatingAngle = function(arg, tangentToThis){
     
    var _this = this ;  
    var pos = new THREE.Vector3();
    var tangentToThis = (tangentToThis === undefined) ? this.tangentToThis : tangentToThis ; 
    var r = this.newSphere.getRadius() + tangentToThis.getRadius() ;
   
    var polar = parseFloat( arg.rotAngleTheta );
    var azimuthal = parseFloat( arg.rotAnglePhi );
    if(_this.dragMode){ 
      pos = _this.sphericalCoords( r, azimuthal *  (Math.PI/180) , polar *  (Math.PI/180) );  
    }
    pos.x += tangentToThis.object3d.position.x ;
    pos.y += tangentToThis.object3d.position.y ;
    pos.z += tangentToThis.object3d.position.z ;
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
      $("#rotAngleTheta").val((angles.theta).toFixed(4));
      $("#rotAnglePhi").val((angles.phi).toFixed(4));
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
        $("#rotAngleTheta").val((angles.theta).toFixed(4));
        $("#rotAnglePhi").val((angles.phi).toFixed(4));

      }
      else if(!_this.dragMode){ 
        var name,color, opacity;
        PubSub.publish(events.EDITOR_STATE,"editing");
        
        if(!_.isUndefined(_this.newSphere)) _this.newSphere.destroy() ;
        _this.newSphere = undefined ;
        _this.newSphere = _.find(_this.motifsAtoms, function(atom){ return atom.getID() == which; });
        $("#atomName").val(_this.newSphere.getName());
         
        _this.menu.setSliderValue("atomPosX", _this.newSphere.object3d.position.x);
        _this.menu.setSliderValue("atomPosY", _this.newSphere.object3d.position.y);
        _this.menu.setSliderValue("atomPosZ", _this.newSphere.object3d.position.z);
      }
    }
    
  };
  Motifeditor.prototype.configureCellPoints = function(manual){  
    var _this = this; 
    if(_this.isEmpty) return; 
    var dimensions;
    if( _this.editorState.fixed || manual!=undefined){  
      dimensions = {"xDim" : _this.cellParameters.scaleX, "yDim" : _this.cellParameters.scaleY, "zDim" : _this.cellParameters.scaleZ };
    } 
    else{ 
      if(_this.newSphere === undefined){
        dimensions = _this.findMotifsDimensions(undefined, undefined, manual);  
      }
      else{
        dimensions = _this.findMotifsDimensions(_this.newSphere.object3d.position, _this.newSphere.getRadius(), manual);   
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
                var zC = (_x % 2==0) ? (_z*vertDist) : (( _z*vertDist + vertDist/2));
                var yC =  _y*c ;
                var xC =  _x*a*1.5 ;
                var position = new THREE.Vector3( x, y, z);  
                var positionC = new THREE.Vector3( xC, yC, zC);  

                var reference = 'h_'+_x+_y+_z+_r ;
                var referenceC = 'hc_'+_x+_y+_z ;

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
                if(_this.unitCellAtoms[i].latticeIndex === (referenceC) ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset();
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      positionC.x + offset.x , 
                      positionC.y + offset.y , 
                      positionC.z + offset.z 
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
            var y =  _y*c ;  
            _this.unitCellAtoms.push(new UnitCellAtom( 
              new THREE.Vector3(
                pos.x , 
                pos.y + y, 
                pos.z), 
                radius, color, tang, name, id, 'hc_'+_x+_y+_z
              ) 
            );  
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
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
              var zC = (_x % 2==0) ? (_z*vertDist) : (( _z*vertDist + vertDist/2));
              var yC =  _y*c ;
              var xC =  _x*a*1.5 ;

              var position = new THREE.Vector3( x, y, z);  
              var positionC = new THREE.Vector3( xC, yC, zC);  

              var reference = 'h_'+_x+_y+_z+_r ;
              var referenceC = 'hc_'+_x+_y+_z ;

              for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
               
                if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && ( _this.unitCellAtoms[i].latticeIndex === reference) ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset(); 
                  _this.unitCellAtoms[i].object3d.position.set( 
                    position.x + offset.x ,  
                    position.y + offset.y , 
                    position.z + offset.z 
                  ); 
                }
                if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && (_this.unitCellAtoms[i].latticeIndex === referenceC)){  
                  var offset = _this.unitCellAtoms[i].getUserOffset(); 
                  _this.unitCellAtoms[i].object3d.position.set( 
                    positionC.x + offset.x ,  
                    positionC.y + offset.y , 
                    positionC.z + offset.z 
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
  Motifeditor.prototype.findMotifsDimensions = function(pos, radius, manual){

    var _this = this, offsets = {x : 0, y : 0, z : 0 } ;   
       
    if(!_.isUndefined(_this.newSphere)){  
      if(_.isUndefined(_this.newSphere.object3d)){
        if(!_.isUndefined(pos) ){ 
          var helperObj = {"object3d" : {"position" : { "x": pos.x, "y":pos.y, "z": pos.z}}, getRadius: function() { return radius; } } ; 
          this.motifsAtoms.push(helperObj); 
        }
      }
      else{  
        var helperObj = {"object3d" : {"position" : { "x": _this.newSphere.object3d.position.x, "y":_this.newSphere.object3d.position.y, "z": _this.newSphere.object3d.position.z}}, getRadius: function() { return _this.newSphere.getRadius(); } } ; 
        this.motifsAtoms.push(helperObj); 
      } 
    } 

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
    
    if(_this.latticeName === 'hexagonal'){
      if(cell.zDim > cell.xDim){
        _this.cellParameters.scaleX = cell.zDim ;
        cell.xDim = cell.zDim ;
      }
      else{
        _this.cellParameters.scaleZ = cell.xDim ;
        cell.zDim = cell.xDim ; 
      }
    } 
 
    this.motifsAtoms.pop();
       
    return cell; // remember these dimensions are in 2l (e.g for cubic primitive)
  };
  Motifeditor.prototype.fakeCollision = function(axis, motifHelper, withAngles){

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
        var val;
        if( _.isUndefined(withAngles) ) {
          val = _this.fakeFixAtomPosition(motifHelper[i], _this.motifsAtoms[j],axis) 
        }
        else{ 
          val = _this.fakeFixAtomPositionWithAngles(motifHelper[i], _this.motifsAtoms[j],axis) ; 
        } 
        offsets.push( Math.abs( parseFloat((val).toFixed(parseInt(10)) ) ) ) ;  
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

    var collisionSpherePosition = new THREE.Vector3( otherAtom.object3d.position.x, otherAtom.object3d.position.y, otherAtom.object3d.position.z );
  
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
  Motifeditor.prototype.customBox = function(points) { 

    var vertices = [];
    var faces = [];
    var _this = this ;

    if(this.latticeName !== 'hexagonal'){
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
    }
    else{
      var bottomFacePoints=[];
      var upperFacePoints=[]; 
      _.times(2, function(_y) {  
        _.times(6 , function(_r) { 

          var v = new THREE.Vector3( _this.cellParameters.scaleZ, 0, 0 ); 
          var axis = new THREE.Vector3( 0, 1, 0 );
          var angle = (Math.PI / 3) * _r ; 
          v.applyAxisAngle( axis, angle );

          var z = v.z ;
          var y = v.y + _y*_this.cellParameters.scaleY ;
          var x = v.x ; 
          var position = new THREE.Vector3( x, y, z);
          
          if(_y > 0){
            upperFacePoints.push(position);
          }
          else{
            bottomFacePoints.push(position);
          }
        }); 
      }); 

      for (var i = 0; i<6; i++) {
        vertices[i] = bottomFacePoints[i];
        vertices[i+6] = upperFacePoints[i];
      };
      for (var i = 0; i<4; i++) {
        faces.push(new THREE.Face3(0,i+1,i+2));
        faces.push(new THREE.Face3(i+8,i+7,6)); 
      } 
      for (var i = 0; i<5; i++) { 
        faces.push(new THREE.Face3(i+7,i+1,i));
        faces.push(new THREE.Face3(i+6,i+7,i));
      } 
      faces.push(new THREE.Face3(6,0,5));
      faces.push(new THREE.Face3(11,6,5));
    } 
 
    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.mergeVertices();  
    geom.computeFaceNormals();
    return geom;
  }
  function customBox2(points) { 
    var vertices = [];
    var faces = []; 
 
    vertices.push(points['_111'].position); // 0
    vertices.push(points['_110'].position); // 1
    vertices.push(points['_101'].position); // 2 
    vertices.push(points['_100'].position); // 3
    vertices.push(points['_010'].position); // 4
    vertices.push(points['_011'].position); // 5
    vertices.push(points['_000'].position); // 6
    vertices.push(points['_001'].position); // 7

    faces.push(new THREE.Face3(0,2,1));
    faces.push(new THREE.Face3(2,3,1));

    faces.push(new THREE.Face3(4,6,5));
    faces.push(new THREE.Face3(6,7,5));
 
    faces.push(new THREE.Face3(4,5,1));
    faces.push(new THREE.Face3(5,0,1));

    faces.push(new THREE.Face3(7,6,2));
    faces.push(new THREE.Face3(6,3,2));

    faces.push(new THREE.Face3(5,7,0));
    faces.push(new THREE.Face3(7,2,0));

    faces.push(new THREE.Face3(1,3,4));
    faces.push(new THREE.Face3(3,6,4)); 
      
    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
        
    geometry.computeFaceNormals(); 
    geometry.computeVertexNormals();

    return geometry;
 
  }
  function flipNormals(geometry){
    for ( var i = 0; i < geometry.faces.length; i ++ ) {

      var face = geometry.faces[ i ];
      var temp = face.a;
      face.a = face.c;
      face.c = temp;

    }
     
    var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
    for ( var i = 0; i < faceVertexUvs.length; i ++ ) {
    
      var temp = faceVertexUvs[ i ][ 0 ];
      faceVertexUvs[ i ][ 0 ] = faceVertexUvs[ i ][ 2 ];
      faceVertexUvs[ i ][ 2 ] = temp;
    
    } 
    return geometry;
  }
  Motifeditor.prototype.setCSGmode = function(mode){ 
    var _this = this, i = 0;

    var a = performance.now();
    _this.viewState = mode;

    var g = this.customBox(_this.unitCellPositions, _this.latticeName);

    var box = new THREE.Mesh( g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: "#FF0000"} ) );
    var scene = UnitCellExplorer.getInstance().object3d;
    if(_this.viewState === 'Subtracted'){
      while(i < _this.unitCellAtoms.length ) {
        _this.unitCellAtoms[i].object3d.visible = true; 
        _this.unitCellAtoms[i].subtractedSolidView(box, _this.unitCellAtoms[i].object3d.position); 
        i++;
      } 
      
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
 
      var solidBox = new THREE.Mesh( finalGeom, new THREE.MeshLambertMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16) })  );
      solidBox.name = 'solidvoid';
      UnitCellExplorer.add({'object3d' : solidBox}); 
      PubSub.publish(events.VIEW_STATE,"SolidVoid"); 
    }
    else if(_this.viewState === 'GradeLimited'){ 
      var g = customBox2(_this.unitCellPositions) ; 
      var g2 = g.clone() ; 
      var box = new THREE.Mesh(g, new THREE.MeshBasicMaterial({side: THREE.DoubleSide,transparent:true, opacity:0.2, color:0xFF0000}));
      box.visible = false;
      box.scale.set(1.3,1.3,1.3); // trick to include cases in wich the center is exactly on the grade limits (faces, grid) 
        
      var FNHbox = new THREE.FaceNormalsHelper( box ) ; // not sure why it is needed, maybe for calculating the normals 

      UnitCellExplorer.add({'object3d' : box }); 

      var collidableMeshList = [] ;
      collidableMeshList.push(box);
        
      i=0;
 
      while(i < _this.unitCellAtoms.length ) {    

        var originPointF = _this.unitCellAtoms[i].object3d.position.clone();
        var dir = new THREE.Vector3(1,10,1);  
        var rayF = new THREE.Raycaster( originPointF, dir.clone().normalize() );
        var collisionResultsF = rayF.intersectObjects( collidableMeshList );

        var touches = true ;
        var radius = _this.unitCellAtoms[i].getRadius() ;
     
        if(collisionResultsF.length !== 1){ // case its center is not fully inside (if it is nothing happens and it remains visible)

          var box2 = new THREE.Mesh(g2, new THREE.MeshBasicMaterial({side: THREE.DoubleSide,transparent:true, opacity:0.2, color:0xFF0000}));
          box2.visible = false; // i have to delete the helper boxes
          collidableMeshList.pop();
          collidableMeshList.push(box2);

          var vertexIndex = _this.unitCellAtoms[i].object3d.children[0].geometry.vertices.length-1;
          
          while( vertexIndex >= 0 )
          {     
            var localVertex = _this.unitCellAtoms[i].object3d.children[0].geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(_this.unitCellAtoms[i].object3d.matrixWorld);
            var directionVector = globalVertex.sub( originPointF );     
            
            var ray = new THREE.Raycaster( originPointF, directionVector.clone().normalize() );
  
            var collisionResults = ray.intersectObjects( collidableMeshList );
               
            if( (collisionResults.length >= 1) &&  (collisionResults[0].distance <= radius) ) {
              vertexIndex = -2;  
              
            }
            vertexIndex--;
            if(vertexIndex === -1) touches = false;
          }  
          if(!touches) _this.unitCellAtoms[i].object3d.visible = false ;
        } 
        _this.unitCellAtoms[i].GradeLimited();
        i++;   
      } 

      PubSub.publish(events.VIEW_STATE,"GradeLimited"); 
    }
    else if(_this.viewState === 'Classic'){ 
      while(i < _this.unitCellAtoms.length ) { 
        _this.unitCellAtoms[i].object3d.visible = true;
        _this.unitCellAtoms[i].classicView(); 
        i++;
      }  
      var object = scene.getObjectByName('solidvoid');
      if(!_.isUndefined(object)) scene.remove(object);
      PubSub.publish(events.VIEW_STATE,"Classic");
    }

    var b = performance.now();

    
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
  Motifeditor.prototype.updateLatticeTypeRL = function(){
    var params = this.cellParameters ;
    var type = this.latticeType ;
    var system = this.latticeSystem;

    // cubic
    if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma && params.alpha == 90){
      if( type === 'primitive'){  
        $("select option[value='cubic_primitive']").attr("selected","selected");
      }
      else if( type === 'body'){ 
        $("select option[value='cubic_body_centered']").attr("selected","selected");
      }
      else if( type === 'face'){  
        $("select option[value='cubic_face_centered']").attr("selected","selected");
      }
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
      
    }

    // tetragonal
    else if( params.scaleX === params.scaleZ && params.scaleX === params.scaleY && params.alpha === params.beta && params.beta === params.gamma && params.beta == 90){
      if( type === 'primitive'){  
        $("select option[value='tetragonal_primitive']").attr("selected","selected");
      }
      else if( type === 'body'){ 
        $("select option[value='tetragonal_body_centered']").attr("selected","selected");
      } 
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    }

    // Orthorhombic
    else if( params.scaleX != params.scaleY && params.scaleX != params.scaleZ && params.scaleY != params.scaleZ && params.alpha === params.beta && params.beta === params.gamma && params.beta == 90){
      if( type === 'primitive'){  
        $("select option[value='orthorhombic_primitive']").attr("selected","selected");
      }
      else if( type === 'body'){ 
        $("select option[value='orthorhombic_body_centered']").attr("selected","selected");
      }
      else if( type === 'face'){  
        $("select option[value='orthorhombic_face_centered']").attr("selected","selected");
      }
      else if( type === 'base'){  
        $("select option[value='orthorhombic_base_centered']").attr("selected","selected");
      }
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    } 

    // Rhombohedral
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma && params.alpha != 90){
      if( type === 'primitive'){  
        $("select option[value='rhombohedral_primitive']").attr("selected","selected");
      } 
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    }

    // Monoclinic
    else if( params.scaleX != params.scaleY && params.scaleX != params.scaleZ && params.scaleY != params.scaleZ && params.gamma === params.beta && params.beta == 90 && params.alpha != 90){
      if( type === 'primitive'){  
        $("select option[value='monoclinic_primitive']").attr("selected","selected");
      } 
      else if( type === 'base'){  
        $("select option[value='monoclinic_base_centered']").attr("selected","selected");
      }
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    }

    // Triclinic
    else if(params.scaleX != params.scaleY && 
            params.scaleX != params.scaleZ && 
            params.scaleY != params.scaleZ && 
            params.gamma  != params.beta && 
            params.gamma  != params.alpha && 
            params.alpha  != params.beta && 
            params.gamma  != 90 && 
            params.beta   != 90 && 
            params.alpha  != 90)
    {
      if( type === 'primitive'){  
        $("select option[value='triclinic_primitive']").attr("selected","selected");
      } 
      else { 
        $("select option[value='nonexistent']").attr("selected","selected");
      }
    }

    else{
      $("select option[value='nonexistent']").attr("selected","selected");
    }
  };
  Motifeditor.prototype.findShortestRadius = function(){
    var r = _.min(this.motifsAtoms, function(atom){ return (atom.getRadius()); }); 

    return r.getRadius() ;
  };
  Motifeditor.prototype.fixedLengthMode = function(arg){
    var _this = this, i=0;   
    if(arg.fixedLength === true) {
      _this.globalTangency = false ;  
      $('#tangency').prop('checked', false);
      $('#tangency').prop('disabled', true);
        
      this.cellParameters.alpha = parseInt($("#alpha").val());
      this.cellParameters.beta = parseInt($("#beta").val());
      this.cellParameters.gamma = parseInt($("#gamma").val());
    }
    else { 
      $('#tangency').prop('disabled', false);
      _this.globalTangency = true ;
      this.cellParameters.alpha = this.initialLatticeParams.alpha ;
      this.cellParameters.beta = this.initialLatticeParams.beta ;
      this.cellParameters.gamma = this.initialLatticeParams.gamma ;
    }

    this.editorState.fixed = arg.fixedLength;

    if(_this.latticeName === 'hexagonal'){
      $('#scaleX').val(arg.x);
      $('#scaleY').val(arg.y);
      $('#scaleZ').val(arg.x);
    }
    else{
      $('#scaleX').val(arg.x);
      $('#scaleY').val(arg.y);
      $('#scaleZ').val(arg.z); 
    }

    this.cellParameters.scaleX = parseFloat(arg.x) ;
    this.cellParameters.scaleY = parseFloat(arg.y) ;
    this.cellParameters.scaleZ = parseFloat(arg.z) ;

    this.configureCellPoints();
      // lattice detect mechanism. Ax Ay Az edw
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
  Motifeditor.prototype.checkIfTangent = function(atom1, atom2){

    var tangentDistance = atom1.getRadius() + atom2.getRadius() ;
    var realDistance = atom1.object3d.position.distanceTo(atom2.object3d.position) ;
    
    if(Math.abs(tangentDistance-realDistance) <0.0001) { // not strict criteria to assume they are tangent 
      return true;
    }
    else{
      return false;
    }
       
  };
  Motifeditor.prototype.calcABCforParticularCases = function(dimensions){
    var _this = this, dims = {xDim : dimensions.xDim, yDim : dimensions.yDim, zDim : dimensions.zDim } ;
    if(_this.newSphere != undefined){  
      //    c = y,    b = x,    a = z
      var LL = _.max([ dims.xDim, dims.yDim,dims.zDim ]);
      var ll = _.min([ dims.xDim, dims.yDim,dims.zDim ]);

      switch(_this.latticeSystem) {
        case "cubic":
          if(_this.motifsAtoms.length === 0){
            if(_this.latticeType === 'face'){
              dims.xDim = dims.yDim = dims.zDim = Math.sqrt(2) * dims.xDim ; 
            }
            else if(_this.latticeType === 'body'){
              dims.xDim = dims.yDim = dims.zDim = (2/Math.sqrt(3)) * dimensions.xDim ;
            }
          } 
          else if(_this.motifsAtoms.length === 1){ // the second atom has not been added to the array yet, so we compare to 1
             
            if(_this.checkIfTangent(_this.motifsAtoms[0], _this.newSphere)){ 

              if(_this.latticeType === 'primitive'){
                dims.xDim = dims.yDim = dims.zDim = (2*(_this.motifsAtoms[0].getRadius()+_this.newSphere.getRadius()))/Math.sqrt(3) ;
              }
              else if(_this.latticeType === 'face'){
                dims.xDim = dims.yDim = dims.zDim = 2*(_this.motifsAtoms[0].getRadius()+_this.newSphere.getRadius()) ; 
              }
              else if(_this.latticeType === 'body'){
                dims.xDim = dims.yDim = dims.zDim = LL;
              }
            } 
            else{ 
              dims.xDim = dims.yDim = dims.zDim = LL;
            }
          }
          else if(_this.motifsAtoms.length > 1){
             
            if(_this.latticeType === 'face'){
              dims.xDim = dims.yDim = dims.zDim = 2*(_this.motifsAtoms[0].getRadius()+_this.newSphere.getRadius()) ; 
            }
          }
        break;

        case "tetragonal": 
          if(_this.motifsAtoms.length === 0){
            if(_this.latticeType === 'primitive'){
              dims.xDim = dims.zDim = 2*(_this.newSphere.getRadius());
              dims.yDim = 2.6 *(_this.newSphere.getRadius()); 
            }
            else if(_this.latticeType === 'body'){
              dims.xDim = dims.zDim = 2*(_this.newSphere.getRadius());
              dims.yDim = 3 *(_this.newSphere.getRadius());
            } 
          }
          else if(_this.motifsAtoms.length === 1){
            if(_this.motifsAtoms[0].getName() === _this.newSphere.getName()){
              dims.xDim = dims.yDim = dims.zDim = 1.3*LL;
            }
            else{
              dims.xDim = dims.zDim = LL;
              dims.yDim = ll;
            }
          }
          else if(_this.motifsAtoms.length > 1){
            dims.xDim = dims.zDim = LL;
            dims.yDim = ll;
          }

        break;

        case "orthorhombic": 
          if(_this.motifsAtoms.length === 0){
            if(_this.latticeType === 'primitive'){
              var rr = 2*(_this.newSphere.getRadius());
              dims.zDim = rr;
              dims.xDim = 1.15*rr;
              dims.yDim = 1.3*rr;
            }
            else if(_this.latticeType === 'face'){
              dims.xDim = this.cellParameters.scaleX * Math.sqrt(2) * 2.2  ;
              dims.yDim = this.cellParameters.scaleY * Math.sqrt(2) * 2.5;
              dims.zDim = this.cellParameters.scaleZ * Math.sqrt(2) * 2.1 ;
            }
            else if(_this.latticeType === 'body'){
              var rr = 2*(_this.newSphere.getRadius());
              dims.zDim = (2/Math.sqrt(3)) * dimensions.zDim * 1.1 ;
              dims.xDim = (2/Math.sqrt(3)) * dimensions.xDim * 1.2 ;
              dims.yDim = (2/Math.sqrt(3)) * dimensions.yDim * 1.3 ;
            } 
            else if(_this.latticeType === 'base'){
              var rr = 2*(_this.newSphere.getRadius());
              dims.zDim = 1.5*rr;
              dims.xDim = 1.6*rr;
              dims.yDim = 1.7*rr;
            } 
          }
          else if(_this.motifsAtoms.length >= 1){
            if(dims.xDim === dims.yDim || dims.xDim === dims.zDim || dims.yDim === dims.zDim){
              dims.zDim = LL;
              dims.xDim = 1.15*LL;
              dims.yDim = 1.3*LL; 
            }  
          }
           
        break;

        case "hexagonal": 
          if(_this.motifsAtoms.length === 1){
            
            if(_this.motifsAtoms[0].getName() === _this.newSphere.getName()){
              var RR = 2*(_.max([ _this.newSphere.getRadius(), _this.motifsAtoms[0].getRadius()]) );
              dims.zDim = RR;
              dims.xDim = RR;
              dims.yDim = RR*Math.sqrt(8/3); 
            }
          }
        break;

        case "rhombohedral": 
          if(_this.motifsAtoms.length === 0){ 
            dims.xDim = dims.yDim = dims.zDim = 2*(_this.newSphere.getRadius()); 
          }
          else if(_this.motifsAtoms.length >= 1){
            dims.xDim = dims.yDim = dims.zDim = LL ;  
          } 
        break;

        case "monoclinic": 
          if(_this.motifsAtoms.length === 0){ 
            if(_this.latticeType === 'primitive'){
              var rr = 2*(_this.newSphere.getRadius());
              dims.zDim = rr;
              dims.xDim = 1.15*rr;
              dims.yDim = 1.3*rr; 
            }
            else if(_this.latticeType === 'base'){
              var rr = 2*(_this.newSphere.getRadius());
              dims.zDim = 1.5*rr;
              dims.xDim = 1.6*rr;
              dims.yDim = 1.7*rr;
            }
          }
          else if(_this.motifsAtoms.length >= 1){
            if(dims.xDim === dims.yDim || dims.xDim === dims.zDim || dims.yDim === dims.zDim){
              dims.zDim = LL;
              dims.xDim = 1.15*LL;
              dims.yDim = 1.3*LL; 
            }   
          }
           
        break;

        case "triclinic": 
          if(_this.motifsAtoms.length === 0){
            var rr = 2*(_this.newSphere.getRadius());
            dims.zDim = rr;
            dims.xDim = 1.15*rr;
            dims.yDim = 1.3*rr; 

          }
          else if(_this.motifsAtoms.length >= 1){
            if(dims.xDim === dims.yDim || dims.xDim === dims.zDim || dims.yDim === dims.zDim){
              dims.zDim = LL;
              dims.xDim = 1.15*LL;
              dims.yDim = 1.3*LL; 
            }   
          } 
        break;
    
      } 
       
    }

    return dims;
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Angle Handling - lattice.js code
  Motifeditor.prototype.cellPointsWithScaling = function(_dimensions, recreate){ 
    var _this = this; 
    
    var dimensions = (this.editorState.fixed || this.manualAabc) ? _dimensions : _this.calcABCforParticularCases(_dimensions);

    _this.cellParameters.scaleX = dimensions.xDim;
    _this.cellParameters.scaleY = dimensions.yDim;
    _this.cellParameters.scaleZ = dimensions.zDim;

    switch(_this.latticeType) {
        case "primitive":    
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                if(recreate){
                  _this.unitCellPositions["_"+_x+_y+_z] = {
                    "position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), 
                    "latticeIndex" : "_"+_x+_y+_z 
                  } ;  
                }
                else{
                  _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( 
                    dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z
                  ) ;
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
                  _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                }
                else{
                  _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z) ;
                }
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {
            if(recreate){
              _this.unitCellPositions["_"+i] = {"position" : new THREE.Vector3( dimensions.xDim *i, dimensions.yDim *0.5, dimensions.zDim *0.5), "latticeIndex" : "_"+i } ;  
              _this.unitCellPositions["__"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *i, dimensions.zDim *0.5), "latticeIndex" : "__"+i } ;  
              _this.unitCellPositions["___"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *0.5, dimensions.zDim *i), "latticeIndex" : "___"+i } ;  
            }
            else{
              _this.unitCellPositions["_"+i].position = new THREE.Vector3( dimensions.xDim *i, dimensions.yDim *0.5, dimensions.zDim *0.5) ;
              _this.unitCellPositions["__"+i].position = new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *i,  dimensions.zDim *0.5) ;
              _this.unitCellPositions["___"+i].position = new THREE.Vector3( dimensions.xDim *0.5,  dimensions.yDim *0.5,  dimensions.zDim *i) ;
            }
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                if(recreate){
                  _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3(  dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                }
                else{
                  _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3(  dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z) ;
                }
              });
            });
          }); 
          if(recreate){
            _this.unitCellPositions["_c"] = {"position" : new THREE.Vector3( (1/2) * dimensions.xDim , (1/2) * dimensions.yDim , (1/2) * dimensions.zDim ), "latticeIndex" : '_c' } ;  
          }
          else{
            _this.unitCellPositions["_c"].position = new THREE.Vector3( (1/2) * dimensions.xDim , (1/2) * dimensions.yDim , (1/2) * dimensions.zDim ) ;
          }
          break;
        case "base":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                if(recreate){
                  _this.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x,  dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                }
                else{
                  _this.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( dimensions.xDim *_x,  dimensions.yDim *_y, dimensions.zDim *_z) ;
                }
              });
            });
          }); 
           
          if(recreate){
            _this.unitCellPositions["_up"] = {"position" : new THREE.Vector3( dimensions.xDim /2 ,  dimensions.yDim , dimensions.zDim /2 ), "latticeIndex" : "_up" } ;  
            _this.unitCellPositions["_down"] = {"position" : new THREE.Vector3( dimensions.xDim /2, 0 ,  dimensions.zDim /2), "latticeIndex" : "_down" } ;  
          }
          else{
            _this.unitCellPositions["_up"].position = new THREE.Vector3( dimensions.xDim /2, dimensions.yDim , dimensions.zDim /2) ;
            _this.unitCellPositions["_down"].position = new THREE.Vector3( dimensions.xDim /2,  0, dimensions.zDim /2) ;
          }  

          break;
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
