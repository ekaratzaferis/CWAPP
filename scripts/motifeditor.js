/*global define*/
 

define([
  'pubsub', 
  'three', 
  'underscore', 
  'atomSphere',
  'jquery-ui', 
  'jquery', 
  'unitCellAtom',
  'unitCellExplorer' ,
  'csg',
  'threeCSG',
  'motifExplorer'
], function(
  PubSub, THREE, _,
  AtomSphere, 
  jQuery_ui, 
  jQuery, 
  UnitCellAtom, 
  UnitCellExplorer,
  csg,
  ThreeCSG,
  MotifExplorer
) {
  var events = {
    LOAD: 'motifeditor.load',
    EDITOR_STATE: 'motifeditor.editor_state',
    VIEW_STATE: 'motifeditor.view_state'
  }; 

  function Motifeditor(menu, soundMachine) {
    this.motifeditor = null;

    this.soundMachine = soundMachine;

    this.menu = menu ; 
    this.cellParameters = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 
    this.initialLatticeParams = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 
    
    this.motifsAtoms = [];
    this.unitCellAtoms = [];
    this.unitCellPositions = {}; 
    this.viewState = 'Classic';
    this.editorState = {state : "initial", fixed: false, atomPosMode : 'absolute', updated : false } ; 
    this.isEmpty = true ;
    this.latticeName = 'none';
    this.latticeType = 'none';  
    this.latticeSystem = 'none';
 
    this.manualSetCellAngles = false;
    this.leastCellLengths = {'x' : 0, 'y' : 0, 'z' : 0 };
    this.leastCellAngles = {'alpha' : 2, 'beta' : 2, 'gamma' : 2 };
    this.cellVolume =  {col : false, xInitVal : 0.5, yInitVal : 0.5, zInitVal : 0.5, aCol : false, bCol : false, cCol : false};

    this.newSphere ; 
    this.lastSphereAdded ; 
    this.dragMode = false;
    this.tangentToThis;
    this.rotAxis='x';
    this.mutex = true ;
    this.cellMutex = true ;
    this.globalTangency = true;
    this.padlock = true;


    // rendering mode
    this.renderingMode = 'realistic'; // todo change that to realistic

    this.box3 = {bool : false, pos : undefined}; // temporal. must be removed after testing
  
  }; 
  Motifeditor.prototype.setDraggableAtom = function(arg, doNotRepos){ 
    
    this.menu.rotAnglesSection(arg.dragMode);

    this.dragMode = arg.dragMode;

    if(arg.dragMode === true) {   
      if(!_.isUndefined(this.newSphere)) {
        this.newSphere.blinkMode(true, '#58D3F7');  
      }
        
      this.selectAtom(arg.parentId, doNotRepos, true);
      this.newSphere.tangentParent = arg.parentId ;
    }
    else if(arg.dragMode === false){ 
       
      if(!_.isUndefined(this.newSphere)) {
        this.newSphere.blinkMode(false);
      }
      this.newSphere.tangentParent = undefined;
      this.newSphere.tangentR = undefined; 
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
  Motifeditor.prototype.updateLatticeParameters = function(anglesScales, latticeType, latticeName, latticeSystem, restore) {

    if(this.editorState.updated === true || !anglesScales) {
      return;
    }
    this.editorState.updated = true ;

    this.latticeType   = latticeType; 
    this.latticeName   = latticeName;   
    this.latticeSystem = latticeSystem;   

    this.initialLatticeParams.alpha = anglesScales.alpha ;
    this.initialLatticeParams.beta  = anglesScales.beta ;
    this.initialLatticeParams.gamma = anglesScales.gamma ; 
    
    if(this.padlock === false){   
      this.cellParameters.alpha = parseInt($("#alpha").val());
      this.cellParameters.beta = parseInt($("#beta").val());
      this.cellParameters.gamma = parseInt($("#gamma").val());
    }
    else {   
      this.cellParameters.alpha = this.initialLatticeParams.alpha ;
      this.cellParameters.beta  = this.initialLatticeParams.beta ;
      this.cellParameters.gamma = this.initialLatticeParams.gamma ;
    }  
    if(_.isUndefined(restore) ) {
      this.configureCellPoints('manual');
    }

  };
  Motifeditor.prototype.onEditorStateChange = function(callback) {
    PubSub.subscribe(events.EDITOR_STATE, callback);
  };
  Motifeditor.prototype.onViewStateChange = function(callback) {
    PubSub.subscribe(events.VIEW_STATE, callback);
  };
  Motifeditor.prototype.selectElem = function(params) {
     
    // late feature
    if(this.newSphere !== undefined){
       
      this.removeFromUnitCell(this.newSphere.getID());
      this.menu.breakChain({id : this.newSphere.getID(), remove : true});
      this.deleteTangentChild(this.newSphere.getID());
      this.newSphere.destroy();
      if(!_.isUndefined( this.motifsAtoms[0])) {   
        this.lastSphereAdded = this.motifsAtoms[this.motifsAtoms.length-1];
        this.newSphere =  undefined; 
        this.configureCellPoints();
      }
      else{
        this.newSphere = undefined ;
        this.lastSphereAdded = undefined ;
        this.isEmpty = true ; 
      }
      
      this.dragMode = false;  
      this.initVolumeState(); 
      
    }

    var _this = this ;
    
    var radius = parseFloat(params.ionicValue);
     
    var newId = "_"+produceUuid() ;
    var p = new THREE.Vector3(0,0,0);

    if(this.isEmpty) {  
      // first time  
      this.isEmpty = false; 
    }
    else{
      p = this.findNewAtomsPos(
        this.lastSphereAdded, 
        radius, 
        false, 
        params.element
      ); 
    } 
 
    var a = new AtomSphere( 
      true, 
      new THREE.Vector3(p.x,p.y,p.z), 
      radius, 
      params.atomColor,
      params.tangency, 
      params.element, 
      newId, 
      1,
      false,
      params.ionicIndex
    );

    this.newSphere = a;  
   
    this.addAtomInCell( 
      new THREE.Vector3(p.x,p.y,p.z), 
      radius, 
      params.atomColor, 
      params.tangency, 
      params.element, 
      newId,
      1,
      false
    );

    PubSub.publish(
      events.EDITOR_STATE,{
        'state' : "creating", 
        'atomPos' : new THREE.Vector3(p.x, p.y, p.z),
        'atomColor' : params.atomColor
      }
    );  
  };
  Motifeditor.prototype.findNewAtomsPos = function(lastAtom, newAtomRadius, flag, elName ) {  

    var _this = this , posFound = false, posFoundx, posFoundy, posFoundz, position; 
    var x = lastAtom.object3d.position.x + lastAtom.getRadius() + newAtomRadius;
    var y = lastAtom.object3d.position.y ;
    var z = lastAtom.object3d.position.z ;
    if(!flag) { 
      _this.newSphere = {
        "object3d" : {"position" : { "x": x, "y": y, "z": z, 
        clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); } } },
        getRadius: function() { return newAtomRadius; },
        getID: function() { return "-"; }, 
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
    
        this.menu.editMEInputs(
          { 
            'rotAngleTheta' :  54.7 , 
            'rotAnglePhi' :  45 
          }
        );
      } 
      
    }
    else if(_this.latticeSystem === 'hexagonal' && _this.motifsAtoms.length === 1  ){
      this.tangentToThis = _this.motifsAtoms[0] ;
      this.setTangentAngle(0.0000, 35.2644 , parseFloat(  newAtomRadius + _this.motifsAtoms[0].getRadius() ), _this.motifsAtoms[0] );
   
      this.menu.editMEInputs(
        { 
          'rotAngleTheta' : 35.2 , 
          'rotAnglePhi' : 0 
        }
      );
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
    var idIs = _this.newSphere.getID();
    var tempObj = _this.newSphere ;  
    this.newSphere = _.find(_this.motifsAtoms, function(atomSphere){ return atomSphere.object3d.id === objID; });  
    if(_.isUndefined(_this.newSphere) ) {
      this.newSphere = tempObj ; //in case he drags the this.newSphere already
    }
    var theID = _this.newSphere.getID(); 
  
    if(axis === 'x' ) {   
      this.newSphere.object3d.position.set(pos.x,pos.y,this.newSphere.object3d.position.z);  
      this.translateCellAtoms("x",  pos.x , theID);  
      this.translateCellAtoms("y",  pos.y , theID);

      if(idIs == this.newSphere.getID()){  
        $("#atomPosX").val(pos.x);
        $("#atomPosY").val(pos.y);  
        this.menu.setSliderValue("atomPosX", pos.x );
        this.menu.setSliderValue("atomPosY", pos.y ); 
      }
    }
    else if(axis === 'y' ) {   
      this.newSphere.object3d.position.set(_this.newSphere.object3d.position.x,pos.y,pos.z);  
      this.translateCellAtoms("z",  pos.z , theID);
      this.translateCellAtoms("y",  pos.y , theID);
      if(idIs == this.newSphere.getID()){  
        $("#atomPosY").val(pos.y);
        $("#atomPosZ").val(pos.z);
        this.menu.setSliderValue("atomPosZ", pos.z );
        this.menu.setSliderValue("atomPosY", pos.y ); 
      }
    }
    else if(axis === 'z' ) { 
      this.newSphere.object3d.position.set(pos.x, this.newSphere.object3d.position.y,pos.z);  
      this.translateCellAtoms("z",  pos.z , theID);
      this.translateCellAtoms("x",  pos.x , theID);
      if(idIs == this.newSphere.getID()){  
        $("#atomPosX").val(pos.x);
        $("#atomPosZ").val(pos.z);
        this.menu.setSliderValue("atomPosX", pos.x );
        this.menu.setSliderValue("atomPosZ", pos.z ); 
      }
    } 

    this.newSphere = tempObj ;

    this.configureCellPoints();  

    this.rotAxis = axis;
    
    this.menu.editMEInputs(
      {   
        'Aa' : this.cellParameters.scaleZ,
        'Ab' : this.cellParameters.scaleX,
        'Ac' : this.cellParameters.scaleY,
        'cellAlpha' : this.cellParameters.alpha,
        'cellBeta' : this.cellParameters.beta,
        'cellGamma' : this.cellParameters.gamma
      }
    ); 
 
    this.menu.breakChain({ id : this.newSphere.getID(), remove : false});
     
  };
  Motifeditor.prototype.atomPosMode = function(arg){   
        
    var x = $('#Ab').val() ;
    var y = $('#Ac').val() ;
    var z = $('#Aa').val() ;
 
    this.editorState.atomPosMode = (arg.xyz !== undefined) ? 'absolute' : 'relative';
 
 
    if(this.editorState.atomPosMode === 'relative'){ 

      var bool = (this.editorState.atomPosMode === 'absolute') ? true : false ;

      this.padlockMode({padlock : bool}); 

      this.menu.editMEInputs(
        {
         'padlock' : bool ,
         'tangency' : bool 
        }
      );

      this.setAtomsTangency({tangency : false});

      this.menu.setSliderMin('atomPosX', 0);
      this.menu.setSliderMax('atomPosX', 1); 
      this.menu.setSliderValue('atomPosX', this.newSphere.object3d.position.x/x);

      this.menu.setSliderMin('atomPosY', 0);
      this.menu.setSliderMax('atomPosY', 1);
      this.menu.setSliderValue('atomPosY', this.newSphere.object3d.position.y/y);

      this.menu.setSliderMin('atomPosZ', 0);
      this.menu.setSliderMax('atomPosZ', 1);
      this.menu.setSliderValue('atomPosZ', this.newSphere.object3d.position.z/z);

    }
    else if(this.editorState.atomPosMode === 'absolute'){
      this.menu.setSliderMin('atomPosX', -20.0000000000);
      this.menu.setSliderMax('atomPosX', 20.0000000000);
      this.menu.setSliderValue('atomPosX', this.newSphere.object3d.position.x);

      this.menu.setSliderMin('atomPosY', -20.0000000000);
      this.menu.setSliderMax('atomPosY', 20.0000000000);
      this.menu.setSliderValue('atomPosY', this.newSphere.object3d.position.y);

      this.menu.setSliderMin('atomPosZ', -20.0000000000);
      this.menu.setSliderMax('atomPosZ', 20.0000000000);
      this.menu.setSliderValue('atomPosZ', this.newSphere.object3d.position.z);

      //this.removeFromUnitCell(this.newSphere.getID());
      //this.newSphere.destroy();
      /*
      if(!_.isUndefined( this.motifsAtoms[0])) {
        this.lastSphereAdded = this.motifsAtoms[this.motifsAtoms.length-1];
        this.newSphere =  undefined;  
        this.configureCellPoints();
      }
      else{
        this.newSphere = undefined ;
        this.lastSphereAdded = undefined ;
        this.isEmpty = true ;  
      }
      this.dragMode = false;
      */
      //PubSub.publish(events.EDITOR_STATE,{ 'state' : "initial"});
    }
     
  };
  Motifeditor.prototype.setUIPadlock = function(arg){  
     
    if(arg === true){  
       
      this.cellParameters.alpha = this.initialLatticeParams.alpha ;
      this.cellParameters.beta = this.initialLatticeParams.beta ;
      this.cellParameters.gamma = this.initialLatticeParams.gamma ;
 
      this.menu.editMEInputs(
        {
          'cellAlpha' : this.cellParameters.alpha,
          'cellBeta' : this.cellParameters.beta,
          'cellGamma' : this.cellParameters.gamma 
        }
      );  
      this.configureCellPoints();
 
      this.menu.editMEInputs(
        {
          'Aa' : this.cellParameters.scaleZ,
          'Ab' : this.cellParameters.scaleX,
          'Ac' : this.cellParameters.scaleY 
        }
      );  
    }
         
    this.menu.disableMEInputs(
      {
        'Aa' : arg,
        'Ab' : arg,
        'Ac' : arg,
        'cellAlpha' : arg,
        'cellBeta' : arg,
        'cellGamma' : arg 
      }
    );

  };
  Motifeditor.prototype.setAtomsPosition = function(param){ 
    
    var _this = this;  

    var oldX,oldY,oldZ;
    var stillColliding = true, doNotOverlap = this.globalTangency ;
    var xFactor = 1;
    var yFactor = 1;
    var zFactor = 1;
     
    this.menu.breakChain({ id : this.newSphere.getID(), remove : false});
      
    if(this.editorState.atomPosMode === 'relative'){  
      xFactor = parseFloat($("#Ab").val()) ;
      yFactor = parseFloat($("#Ac").val()) ;
      zFactor = parseFloat($("#Aa").val()) ; 
    }
 
    var sliderXVal, sliderYVal, sliderZVal ;
       
    if(param.trigger === undefined){  
      sliderXVal = xFactor * parseFloat($('#atomPosXSlider').slider("option", "value")); 
      sliderYVal = yFactor * parseFloat($('#atomPosYSlider').slider("option", "value") ); 
      sliderZVal = zFactor * parseFloat($('#atomPosZSlider').slider("option", "value") ); 
    }
    else{
      sliderXVal = xFactor * parseFloat($('#atomPosX').val() ); 
      sliderYVal = yFactor * parseFloat($('#atomPosY').val() );
      sliderZVal = zFactor * parseFloat($('#atomPosZ').val() );
    }  

    if(this.editorState.atomPosMode === 'relative'){ 
      var vecHelper = this.transformHelper(new THREE.Vector3(sliderXVal, sliderYVal, sliderZVal));
       
      this.newSphere.object3d.position.set(vecHelper.x, vecHelper.y, vecHelper.z); 
      this.translateCellAtoms("x", vecHelper.x ,this.newSphere.getID());
      this.translateCellAtoms("y", vecHelper.y ,this.newSphere.getID());
      this.translateCellAtoms("z", vecHelper.z ,this.newSphere.getID());
    } 
    else{
      if(!_.isUndefined(param.atomPosX)){ 
        if(this.mutex){ 

          this.mutex = false; 
          
          this.newSphere.object3d.position.x = parseFloat(  param.atomPosX ) ;  
          
          this.translateCellAtoms("x", sliderXVal, this.newSphere.getID());

          if( this.motifsAtoms.length === 0 || doNotOverlap===false ){ 
            this.mutex = true;   
            this.configureCellPoints();
            return ;
          }

          var zOffset = this.check("z");
          var yOffset = this.check("y");
          
          if(yOffset.offset>=zOffset.offset){ 
            if(yOffset.offset!=0 && zOffset.offset!=0){
              this.newSphere.object3d.position.z += zOffset.offset ;
              var newSliderVal = sliderZVal + zOffset.offset ;
              this.menu.setSliderValue("atomPosZ", newSliderVal );
              this.translateCellAtoms("z",this.newSphere.object3d.position.z + zOffset.offset,this.newSphere.getID());
            }
          }
          else{ 
            this.newSphere.object3d.position.y += yOffset.offset ;
            var newSliderVal = sliderYVal + yOffset.offset ;
            this.menu.setSliderValue("atomPosY", newSliderVal );
            this.translateCellAtoms("y",this.newSphere.object3d.position.y + yOffset.offset,this.newSphere.getID());
          }

          this.mutex = true; 
          
        }
      }
      else if( !_.isUndefined(param.atomPosY) ) { 
        if(this.mutex){
          
          this.mutex = false; 

          this.newSphere.object3d.position.y = parseFloat(  param.atomPosY );
          this.translateCellAtoms("y", sliderYVal ,this.newSphere.getID());

          if(this.motifsAtoms.length===0 || doNotOverlap===false ){
            this.mutex = true; 
            this.configureCellPoints();
            return ;
          }

          var zOffset = this.check("z");
          var xOffset = this.check("x"); 

          if(xOffset.offset>=zOffset.offset){
            if(xOffset.offset!=0 && zOffset.offset!=0){  
              this.newSphere.object3d.position.z += zOffset.offset ;
              var newSliderVal = sliderZVal + zOffset.offset ;
              this.menu.setSliderValue("atomPosZ", newSliderVal );
              this.translateCellAtoms("z",this.newSphere.object3d.position.z + zOffset.offset,this.newSphere.getID());
            } 
          }
          else{ 

            this.newSphere.object3d.position.x += xOffset.offset ;
             var newSliderVal = sliderXVal + xOffset.offset ;
            this.menu.setSliderValue("atomPosX", newSliderVal );
            this.translateCellAtoms("x",this.newSphere.object3d.position.x + xOffset.offset,this.newSphere.getID());
          }

          this.mutex = true;

        }       
      }
      else if(!_.isUndefined(param.atomPosZ)){ 
        if(this.mutex){
          
          this.mutex = false; 
           
          this.newSphere.object3d.position.z = parseFloat(  param.atomPosZ ); 
          this.translateCellAtoms("z", sliderZVal ,this.newSphere.getID());

          if(this.motifsAtoms.length === 0 || doNotOverlap===false ){
            this.mutex = true; 
            this.configureCellPoints(); 
            return ;
          }

          var xOffset = this.check("x");
          var yOffset = this.check("y");
           
          if(xOffset.offset>=yOffset.offset){
            if(yOffset.offset!=0 && xOffset.offset!=0){ 
              this.newSphere.object3d.position.y += yOffset.offset ;
               var newSliderVal = sliderYVal + yOffset.offset ;
              this.menu.setSliderValue("atomPosY", newSliderVal );
              this.translateCellAtoms("y",this.newSphere.object3d.position.y + yOffset.offset,this.newSphere.getID());
            }
          }
          else{ 
            this.newSphere.object3d.position.x += xOffset.offset ;
            var newSliderVal = sliderXVal + xOffset.offset ;
            this.menu.setSliderValue("atomPosX", newSliderVal );
            this.translateCellAtoms("x",this.newSphere.object3d.position.x + xOffset.offset,this.newSphere.getID());
          }

          this.mutex = true; 

        }
      }  

       
      if(this.editorState.atomPosMode !== 'relative'){ 
        this.menu.editMEInputs(
          {   
            'Aa' : this.cellParameters.scaleZ,
            'Ab' : this.cellParameters.scaleX,
            'Ac' : this.cellParameters.scaleY,
            'cellAlpha' : this.cellParameters.alpha,
            'cellBeta' : this.cellParameters.beta,
            'cellGamma' : this.cellParameters.gamma
          }
        ); 
      }
    }
    this.configureCellPoints();
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
          _this.motifsAtoms[i].changeColor('#FF0000', 250);  
          if(this.soundMachine.procced) this.soundMachine.play('atomCollision');
          c.offset = parseFloat((_this.fixAtomPosition(_this.motifsAtoms[i],axis)).toFixed(parseInt(10)) );
          c.collisionsFound++;  
        } 
      }
      i++;
    }; 

    return c;
  };
   
  Motifeditor.prototype.checkForMoreColls = function(){
    var coll = false;  
    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) {
      for (var j = this.unitCellAtoms.length - 1; j >= 0; j--) { 
        if((this.unitCellAtoms[i].latticeIndex != this.unitCellAtoms[j].latticeIndex) && (this.unitCellAtoms[j].object3d !== undefined) && (this.unitCellAtoms[i].object3d !== undefined)){   
          if( ((this.unitCellAtoms[i].object3d.position.distanceTo(this.unitCellAtoms[j].object3d.position) + 0.0000001) < (this.unitCellAtoms[i].getRadius() + this.unitCellAtoms[j].getRadius())) && (this.unitCellAtoms[j].object3d.position.distanceTo(this.unitCellAtoms[i].object3d.position) != 0 )){   
            coll = true;
          }
        }
      }
    }

    return coll;

  };
 
  Motifeditor.prototype.setManuallyCellVolume = function(par){ 
      
    var val = parseFloat(par.cellVolume);
    
    var newVals = {x : 1, y : 1, z : 1};
    
    var _perc ;

    if(par.trigger === 'reducer'){ 
      if((this.cellVolume.xInitVal >= this.cellVolume.yInitVal) && (this.cellVolume.xInitVal >= this.cellVolume.zInitVal)){
        _perc = (this.cellVolume.xInitVal - (par.step * 0.5)) / this.cellVolume.xInitVal ;
      }
      else if((this.cellVolume.yInitVal >= this.cellVolume.xInitVal) && (this.cellVolume.yInitVal >= this.cellVolume.zInitVal)){
        _perc = (this.cellVolume.yInitVal - (par.step * 0.5)) / this.cellVolume.yInitVal ;
      }
      else if((this.cellVolume.zInitVal >= this.cellVolume.xInitVal) && (this.cellVolume.zInitVal >= this.cellVolume.yInitVal)){
        _perc = (this.cellVolume.zInitVal - (par.step * 0.5)) / this.cellVolume.zInitVal ;
      }
    } 
    else{
      _perc = parseFloat(par.cellVolume)/100;
    }
 
    newVals.x = _perc * this.cellVolume.xInitVal; 
    newVals.y = _perc * this.cellVolume.yInitVal;
    newVals.z = _perc * this.cellVolume.zInitVal;
 
    this.cellVolume.aCol = undefined;
    this.cellVolume.bCol = undefined;
    this.cellVolume.cCol = undefined;

    var newValA = newVals.z ;  

    this.setManuallyCellLengths({'Aa' : newValA }, 'volume');
    this.menu.setSliderValue("Aa", newValA); 
      
    var newValB = newVals.x ;
    this.setManuallyCellLengths({'Ab' : newValB }, 'volume');
    this.menu.setSliderValue("Ab", newValB);
     
    var newValC = newVals.y ;
    this.setManuallyCellLengths({'Ac' : newValC }, 'volume');
    this.menu.setSliderValue("Ac", newValC); 
     
    if( this.cellVolume.aCol !== undefined || this.cellVolume.bCol !== undefined || this.cellVolume.cCol !== undefined  ){  
        
      if( this.cellVolume.aCol === undefined){
        this.cellVolume.aCol = -1;
      } 
      if( this.cellVolume.bCol === undefined){
        this.cellVolume.bCol = -1;
      } 
      if( this.cellVolume.cCol === undefined){
        this.cellVolume.cCol = -1;
      } 
  
      if(this.cellVolume.bCol >= this.cellVolume.aCol && this.cellVolume.bCol >= this.cellVolume.cCol  ){ 
         
        var newPercX = this.cellParameters.scaleX/this.cellVolume.xInitVal ;
        
        var newZsc = this.cellVolume.zInitVal*newPercX; 
        this.cellParameters.scaleZ = newZsc;
        this.menu.setSliderValue("Aa", newZsc);
       
        var newYsc = this.cellVolume.yInitVal*newPercX; 
        this.cellParameters.scaleY = newYsc;
        this.menu.setSliderValue("Ac", newYsc);
        
        this.menu.setSliderValue("Ab", this.cellParameters.scaleX);
        
      }
      else if(this.cellVolume.cCol >= this.cellVolume.aCol && this.cellVolume.cCol >= this.cellVolume.bCol){
      
        var newPercY = this.cellParameters.scaleY/this.cellVolume.yInitVal ;

        var newZsc = this.cellVolume.zInitVal*newPercY; 
        this.cellParameters.scaleZ = newZsc;
        this.menu.setSliderValue("Aa", newZsc);
        
        var newXsc = this.cellVolume.xInitVal*newPercY;
        this.cellParameters.scaleX = newXsc; 
        this.menu.setSliderValue("Ab", newXsc);
         
        this.menu.setSliderValue("Ac", this.cellParameters.scaleY);
        
      }
      else if(this.cellVolume.aCol >= this.cellVolume.bCol && this.cellVolume.aCol >= this.cellVolume.cCol ){
       
        var newPercZ = this.cellParameters.scaleZ/this.cellVolume.zInitVal ;
        
        var newYsc = this.cellVolume.yInitVal*newPercZ; 
        this.cellParameters.scaleY = newYsc; 
        this.menu.setSliderValue("Ac", newYsc);
         
        var newXsc = this.cellVolume.xInitVal*newPercZ; 
        this.cellParameters.scaleX = newXsc; 
        this.menu.setSliderValue("Ab", newXsc);
         
        this.menu.setSliderValue("Aa", this.cellParameters.scaleZ);
         
      }  

      var newPerc = 100 * this.cellParameters.scaleX/this.cellVolume.xInitVal ;
      this.menu.setSliderValue("cellVolume", 100); 
       
    } 

    this.configureCellPoints('manual'); // final fix
 
   // this.boxHelper();  
  };
  Motifeditor.prototype.scaleRelative = function(par){

    var _this = this;

    if(par.Aa != undefined){ 

      _.each(_this.motifsAtoms, function(atom, r) { 
        
          var ratio = atom.object3d.position.z / _this.cellParameters.scaleZ ;
          var newPos = ratio * parseFloat(par.Aa) ;
          atom.object3d.position.z = newPos; 
          _this.translateCellAtoms("z", newPos ,atom.getID());

      }); 
      if(this.newSphere !== undefined){
        var ratio = this.newSphere.object3d.position.z / this.cellParameters.scaleZ ;
        var newPos = ratio * parseFloat(par.Aa) ;
        this.newSphere.object3d.position.z = newPos; 
        this.translateCellAtoms("z", newPos ,this.newSphere.getID());
      }

      this.cellParameters.scaleZ = parseFloat( par.Aa ); 

    }
    else if(par.Ab != undefined){ 

      _.each(_this.motifsAtoms, function(atom, r) { 
        var ratio = atom.object3d.position.x / _this.cellParameters.scaleX ;
        var newPos = ratio * parseFloat(par.Ab) ;
        atom.object3d.position.x = newPos;
        _this.translateCellAtoms("x", newPos ,atom.getID());
      });
      if(this.newSphere !== undefined){
        var ratio = this.newSphere.object3d.position.x / this.cellParameters.scaleX ;
        var newPos = ratio * parseFloat(par.Ab) ;
        this.newSphere.object3d.position.x = newPos; 
        this.translateCellAtoms("x", newPos ,this.newSphere.getID());
      }

      this.cellParameters.scaleX = parseFloat( par.Ab ); 
    } 
    else if(par.Ac != undefined){ 

      _.each(_this.motifsAtoms, function(atom, r) { 
        var ratio = atom.object3d.position.y / _this.cellParameters.scaleY ;
        var newPos = ratio * parseFloat(par.Ac) ;
        atom.object3d.position.y = newPos;
        _this.translateCellAtoms("y", newPos ,atom.getID());
      });
      if(this.newSphere !== undefined){
        var ratio = this.newSphere.object3d.position.y / this.cellParameters.scaleY ;
        var newPos = ratio * parseFloat(par.Ac) ;
        this.newSphere.object3d.position.y = newPos; 
        this.translateCellAtoms("y", newPos ,this.newSphere.getID());
      }
      this.cellParameters.scaleY = parseFloat( par.Ac );  
    }
    this.configureCellPoints();
  };
  Motifeditor.prototype.setManuallyCellLengths = function(par, volumeF){
     
    if(this.cellMutex === false) {
      return ;
    }
    
    if(this.editorState.atomPosMode === 'relative'){
      this.scaleRelative(par);
      return;
    }
    var moreCollisions = true;

    this.cellMutex = false ;
    var axis = 'none' ;
    var counterHelper = 0; // help exit infinite loops in case of a bug
   
    while(moreCollisions === true && counterHelper < 10 ){
       
      if(par.Aa != undefined){ 
        this.cellParameters.scaleZ = parseFloat( par.Aa ); 
        // tangency check
          
        this.configureCellPoints('manual');
        
        if(this.globalTangency ||  true){ 
          var offset = this.checkInterMotifCollision('z', parseFloat(par.Aa) );
          this.cellParameters.scaleZ = offset ; 

          if(par.Aa != offset ) {   
          
            this.menu.forceToLooseEvent('Aa');
            this.menu.forceToLooseEvent('cellVolume'); // not needed in many cases 
            this.cellVolume.aCol = Math.abs(offset - this.cellParameters.scaleZ); 
            this.menu.setSliderValue("Aa", offset);
            $("#Aa").val(offset);
          }

          if( (this.latticeSystem === 'hexagonal'  && this.latticeType === 'hexagonal')){
            this.cellParameters.scaleX = offset ;
            if(par.Ab != offset ) {  
              this.menu.setSliderValue("Ab", offset); 
            } 
          }
        }
        par.Aa = this.cellParameters.scaleZ ; // for recurrency of collision checks
        
      }
      else if(par.Ab != undefined){  
        this.cellParameters.scaleX = parseFloat( par.Ab );
        // tangency check

        this.configureCellPoints('manual');   
        if(this.globalTangency){ 
          var offset = this.checkInterMotifCollision('x', parseFloat(par.Ab) ); 
          
          this.cellParameters.scaleX = offset ;
            
          if(par.Ab != offset ) {   
            this.menu.forceToLooseEvent('Ab');
            this.menu.forceToLooseEvent('cellVolume');
            this.cellVolume.bCol = Math.abs(offset - this.cellParameters.scaleX);
            this.menu.setSliderValue("Ab", offset); 
          }
           
        }
        par.Ab = this.cellParameters.scaleX ; // for recurrency of collision checks

      }
      else if(par.Ac != undefined){ 
        this.cellParameters.scaleY = parseFloat( par.Ac );
        // tangency check
        this.configureCellPoints('manual');
        if(this.globalTangency){    
          var offset = this.checkInterMotifCollision('y', parseFloat(par.Ac) ); 
          this.cellParameters.scaleY = offset ;
          if(par.Ac != offset ) {
            this.menu.forceToLooseEvent('Ac');
            this.menu.forceToLooseEvent('cellVolume');
            this.cellVolume.cCol = Math.abs(offset - this.cellParameters.scaleY); 
            this.menu.setSliderValue("Ac", offset);
            $("#Ac").val(offset);
          }
        }
        par.Ac = this.cellParameters.scaleY ; // for recurrency of collision checks
      } 
      this.configureCellPoints('manual'); //second time
      this.updateLatticeTypeRL();

      moreCollisions = this.checkForMoreColls(); 
      counterHelper++;  
    } 
    
    /*if(aAtomIndex && this.unitCellAtoms[aAtomIndex].object3d !== undefined){  
      var s = new THREE.Vector3(
        this.unitCellAtoms[aAtomIndex].object3d.position.x - this.unitCellAtoms[bAtomIndex].object3d.position.x,
        this.unitCellAtoms[aAtomIndex].object3d.position.y - this.unitCellAtoms[bAtomIndex].object3d.position.y,
        this.unitCellAtoms[aAtomIndex].object3d.position.z - this.unitCellAtoms[bAtomIndex].object3d.position.z
      ) ;
     
      this.giveInfo('The distance of tangent atoms after fixing -> Mathematical distance : '+(this.unitCellAtoms[aAtomIndex].getRadius() + this.unitCellAtoms[bAtomIndex].getRadius())+' , distance in CW : '+s.length());
    }
    */
      
    ///////////////////////
    this.cellMutex = true ;
    ///////////////////////   
  };
  Motifeditor.prototype.giveInfo = function(string) {
    $('#infoBox').css('display', 'inline');
    $('#infoBox').text( string );
  };
  Motifeditor.prototype.checkInterMotifCollision = function(angleORaxis, val){
    
    // here we compare the new value from the slider to the least cell dimensions/angles we have calculated in the past or just now (depends on the lattice)

    var _this = this;
    var lengthFix = ((angleORaxis === 'x') || (angleORaxis === 'y') || (angleORaxis === 'z')) ? true : false ;

    if(lengthFix){ 
      this.checkForLengthFix( angleORaxis, val ) ;

      switch(angleORaxis) { 
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
    }
    else{
      // angles fix 
      var limit = this.checkForAngleFix( angleORaxis, val ) ;

      switch(angleORaxis) { 
        case "alpha": 
          if( val != _this.leastCellAngles.alpha){
            return { newVal : _this.leastCellAngles.alpha, limit : limit } ;
          }
          else{
            return { newVal : val };
          }
        break;

        case "beta": 

          if( val != _this.leastCellAngles.beta){
            return { newVal : _this.leastCellAngles.beta, limit : limit } ;
          }
          else{
            return { newVal : val };
          }

        break;

        case "gamma": 
          if( val != _this.leastCellAngles.gamma){
            return { newVal : _this.leastCellAngles.gamma, limit : limit } ;
          }
          else{
            return { newVal : val };
          }

        break;
      }
    }  
  };

  var motifVirtPositions = [] ;

  motifVirtPositions['cubicprimitive'] = [];
  motifVirtPositions['tetragonalprimitive'] = [];
  motifVirtPositions['orthorhombicprimitive'] = [];

  motifVirtPositions['cubicbody'] = [{a : 1/2, b : 1/2, c: 1/2}, {a : -1/2, b : 1/2,  c: 1/2}, {a : 1/2, b : -1/2,  c: 1/2}, {a : -1/2, b : -1/2,  c: 1/2}];
  motifVirtPositions['tetragonalbody'] = [{a : 1/2, b : 1/2, c: 1/2}, {a : -1/2, b : 1/2,  c: 1/2}, {a : 1/2, b : -1/2,  c: 1/2}, {a : -1/2, b : -1/2,  c: 1/2}];
  motifVirtPositions['orthorhombicbody'] = [{a : 1/2, b : 1/2, c: 1/2}, {a : -1/2, b : 1/2,  c: 1/2}, {a : 1/2, b : -1/2,  c: 1/2}, {a : -1/2, b : -1/2,  c: 1/2}];

  motifVirtPositions['cubicface'] = [{a : 0, b : 1/2, c: 1/2}, {a : 0, b : -1/2, c: 1/2}, {a : 1/2, b : 0, c: 1/2}, {a : -1/2, b : 0, c: 1/2}];
  motifVirtPositions['orthorhombicface'] = [{a : 0, b : 1/2, c: 1/2}, {a : 0, b : -1/2, c: 1/2}, {a : 1/2, b : 0, c: 1/2}, {a : -1/2, b : 0, c: 1/2}];

  motifVirtPositions['orthorhombicbase'] = [{a : 0, b : 1/2, c: 1/2 } ];
  motifVirtPositions['monoclinicbase'] = [] ;//[{a : 0, b : 1/2, c: 1/2 } ];
  
  motifVirtPositions['rhombohedralprimitive'] = [];
  motifVirtPositions['triclinicprimitive'] = []; 
  motifVirtPositions['monoclinicprimitive'] = [];

  motifVirtPositions['hexagonalhexagonal'] = [];

  Motifeditor.prototype.checkForLengthFix = function(axis, val){
    
    var withAngles, result = -1 ;

    if(
      this.latticeSystem === 'rhombohedral' || 
      this.latticeSystem === 'triclinic' || 
      (this.latticeSystem === 'monoclinic' && (this.latticeType === 'primitive' || this.latticeType === 'base')) ||
      (this.latticeSystem === 'hexagonal' && (this.latticeType === 'primitive')) ||
      (this.cellParameters.alpha !== 90 || this.cellParameters.beta !== 90 || this.cellParameters.gamma !== 90 )
    ) 
    {
      withAngles = 1;
    }
    
    var _this = this ;
 
    if(axis === 'x'){  
      this.cellParameters.scaleX =  val ;
      result = this.detectCollisionForLengths('x', withAngles);

      if(!result.normalize) {
        this.leastCellLengths.x = this.cellParameters.scaleX + result.offset ; 
      }
      else{
        this.leastCellLengths.x = (this.cellParameters.scaleX/2 + result.offset) *2 ; 
      }
      if(this.leastCellLengths.x < 0 ) this.leastCellLengths.x = val ;
    }
    else if(axis === 'y'){  
      this.cellParameters.scaleY =  val ;
      result = this.detectCollisionForLengths('y', withAngles);
      if(!result.normalize) {
        this.leastCellLengths.y = this.cellParameters.scaleY + result.offset ; 
      }
      else{
        this.leastCellLengths.y = (this.cellParameters.scaleY/2 + result.offset) *2 ; 
      }  
      if(this.leastCellLengths.y < 0 ) this.leastCellLengths.y = val ;
    }
    else if(axis === 'z'){  
      this.cellParameters.scaleZ =  val ;
      result = this.detectCollisionForLengths('z', withAngles);
      if(!result.normalize) {
        this.leastCellLengths.z = this.cellParameters.scaleZ + result.offset ; 
      }
      else{
        this.leastCellLengths.z = (this.cellParameters.scaleZ/2 + result.offset) *2 ; 
      }
      if(this.leastCellLengths.z < 0 ) this.leastCellLengths.z = val ;
    }          
  };
  Motifeditor.prototype.checkForAngleFix = function(angleName, val){
      
    var _this = this, result = {newVal : undefined, limit : undefined} ; 

    if(angleName === 'alpha'){  

      result = this.detectCollisionForAngles('alpha');
     
      this.leastCellAngles.alpha = this.cellParameters.alpha + result.offset ; 
       
      if(this.leastCellAngles.alpha < -1000 ) this.leastCellAngles.alpha = val ;

    }
    else if(angleName === 'beta'){  
      
      result = this.detectCollisionForAngles('beta');
       
      this.leastCellAngles.beta = this.cellParameters.beta + result.offset ; 
       
      if(this.leastCellAngles.beta < -1000 ) this.leastCellAngles.beta = val ;
    }
    else if(angleName === 'gamma'){  
       
      result = this.detectCollisionForAngles('gamma');
       
      this.leastCellAngles.gamma = this.cellParameters.gamma + result.offset ; 
       
      if(this.leastCellAngles.gamma < -1000 ) this.leastCellAngles.gamma = val ;
    }
    
    return result.limit;

  };

  var bbHelper = [] ;
  var spHelper = [] ;

  Motifeditor.prototype.sphereHelper = function(a, color){
     
    var material = [ new THREE.LineBasicMaterial({ color: color  }) ];
    var geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
    
    var scene = UnitCellExplorer.getInstance().object3d;
     
    var g=0;

    if(spHelper.length > 1) {  
      while(g<spHelper.length) {   
        scene.remove(spHelper[g] );
        g++;
      }
      spHelper.splice(0);
    } 
      
    
    var scene = UnitCellExplorer.getInstance().object3d;

    var mesh = new THREE.Mesh(geometry, material[0]);
    mesh.position.set(a.x, a.y, a.z) ;
    spHelper.push(mesh);
    scene.add(mesh); 
  }

  Motifeditor.prototype.lineHelper = function(a,b, color){
    
    if(!color) color = 0xff0000;
    var material = [ new THREE.LineBasicMaterial({ color: color  }) ];
    var geometry = new THREE.Geometry();
    
    var scene = UnitCellExplorer.getInstance().object3d;
    
     
    var g=0;
    if(bbHelper.length > 50) {  
      while(g<bbHelper.length) {   
        //scene.remove(bbHelper[g] );
        g++;
      }
      bbHelper.splice(0);
    } 
     

    geometry.vertices.push( a, b );
    
    var scene = UnitCellExplorer.getInstance().object3d;

    var mesh = new THREE.Line(geometry, material[0]);
    bbHelper.push(mesh);
    scene.add(mesh); 
  }

  Motifeditor.prototype.boxHelper = function( ){
    
    if(this.box3.bool === true) { 

      var scene = UnitCellExplorer.getInstance().object3d;
       
      var g=0;
      while(g<bbHelper.length) {   
        scene.remove(bbHelper[g] );
        g++;
      }
      var j = 0,_this = this;  
      
      var objs = new THREE.Object3D();
    
      while(j<_this.motifsAtoms.length) {
        objs.add(_this.motifsAtoms[j].object3d.clone() );
        j++;
      }
      var mm = new THREE.Mesh(new THREE.SphereGeometry(this.newSphere.getRadius(), 32, 32), new THREE.MeshPhongMaterial());

      if(this.newSphere.object3d !== undefined){
        mm.position.set(this.newSphere.object3d.position.x, this.newSphere.object3d.position.y, this.newSphere.object3d.position.z );
      }
      else{
        mm.position.set(this.box3.pos.x, this.box3.pos.y, this.box3.pos.z );

      }

      objs.add(mm);

      _.each(_this.unitCellPositions, function(pos, k) {  
         
        var x2 = new THREE.BoundingBoxHelper( objs, 0xffffff );
   
        x2.update();
        x2.position.x +=  pos.position.x;  
        x2.position.y +=  pos.position.y;  
        x2.position.z +=  pos.position.z; 

        scene.add( x2 );

        bbHelper.push( x2  );

      });
    }else{
      var scene = UnitCellExplorer.getInstance().object3d; 
      var g=0;
      if(bbHelper.length > 1) {  
        while(g<bbHelper.length) {   
          scene.remove(bbHelper[g] );
          g++;
        }
        bbHelper.splice(0);
      } 
    }
    

  };
  Motifeditor.prototype.fakeFixAtomPositionWithAngles = function(helperAtom, otherAtom, eqAtom, axis){
    var _this = this,sign = 1; 

    var atomOverlapping = helperAtom.object3d.position.clone();

    var atomOverlapped = new THREE.Vector3(otherAtom.object3d.position.x,otherAtom.object3d.position.y,otherAtom.object3d.position.z) ;
    var equilOverlInMotif = new THREE.Vector3(eqAtom.object3d.position.x,eqAtom.object3d.position.y,eqAtom.object3d.position.z) ; 
  
    var realTimeHypotenuse = new THREE.Vector3( atomOverlapped.x - atomOverlapping.x, atomOverlapped.y - atomOverlapping.y, atomOverlapped.z - atomOverlapping.z );
    var calculatedHypotenuse = parseFloat( otherAtom.getRadius() + helperAtom.getRadius() ) ;  

    var fixedSide ;
    var wrongSide, rightSide ;
     
    if(axis === 'y'){ 
         
      var bVector = new THREE.Vector3( atomOverlapping.x - equilOverlInMotif.x, atomOverlapping.y - equilOverlInMotif.y, atomOverlapping.z - equilOverlInMotif.z);

      var aVector = new THREE.Vector3( atomOverlapped.x - equilOverlInMotif.x, atomOverlapped.y - equilOverlInMotif.y, atomOverlapped.z - equilOverlInMotif.z);
      
      var rr = bVector.clone();
      if(aVector.length() === 0){ 
       
        var offset = ( helperAtom.getRadius() + otherAtom.getRadius() -  bVector.length() ) ;
        bVector.setLength(bVector.length() + offset);

      }
      else{  
        var knownAngleCrads = bVector.angleTo(aVector)  ;
        var knownAngleCdegrs = bVector.angleTo(aVector)* 180 / Math.PI ;
        var C = Math.cos(knownAngleCrads);

        var c = 1;
        var a =  atomOverlapped.distanceTo(equilOverlInMotif) ;
        var b =  2*a*C;
        var offset = b - bVector.length()  ;
        bVector.setLength(bVector.length() + offset);
      }

      _.each(reverseShearing, function(k) {
        if (_.isUndefined(_this.cellParameters[k]) === false) { 
          var argument = {};
          argument[k] = -1 * parseFloat(_this.cellParameters[k]); 
          var matrix = transformationMatrix(argument);  
          bVector.applyMatrix4(matrix);  
        }
      }); 

      
      return (bVector.length() - this.cellParameters.scaleY);
      
    }
    else if(axis === 'z'){ 

      var bVector = new THREE.Vector3( atomOverlapping.x - equilOverlInMotif.x, atomOverlapping.y - equilOverlInMotif.y, atomOverlapping.z - equilOverlInMotif.z);

      var aVector = new THREE.Vector3( atomOverlapped.x - equilOverlInMotif.x, atomOverlapped.y - equilOverlInMotif.y, atomOverlapped.z - equilOverlInMotif.z);
      
      if(aVector.length() === 0){ 
       
        var offset = ( helperAtom.getRadius() + otherAtom.getRadius() -  bVector.length() ) ;
        bVector.setLength(bVector.length() + offset);

      }
      else{  
        var rr = bVector.clone();

        var knownAngleCrads = bVector.angleTo(aVector)  ;
        var knownAngleCdegrs = bVector.angleTo(aVector)* 180 / Math.PI ;
        var C = Math.cos(knownAngleCrads);
    
        var c = 1;
        var a =  atomOverlapped.distanceTo(equilOverlInMotif) ;
        var b =  2 * a * C ;
        var offset = b - bVector.length()  ;
        bVector.setLength(bVector.length() + offset);
      }
      if(_this.latticeSystem != 'hexagonal' && _this.latticeType != 'hexagonal'){  
        _.each(reverseShearing, function(k) {
          if (_.isUndefined(_this.cellParameters[k]) === false) {
            var argument = {};
            argument[k] = -1 * parseFloat(_this.cellParameters[k]);
            var matrix = transformationMatrix(argument);
            bVector.applyMatrix4(matrix);
          }
        });
      }
       
      return (bVector.length() - this.cellParameters.scaleZ);
         
    } 
 
  }; 
  Motifeditor.prototype.setManuallyCellAngles = function(par){

    if( this.cellMutex === false) { 
      return ;
    }

    this.cellMutex = false;
    var moreCollisions = true ;
    var angle = 'none' ;
    var counterHelper = 0 ; // to exit from infinite loops in case of bug

    while(moreCollisions === true && counterHelper < 100 ){
      moreCollisions = false;
      if(par.cellAlpha != undefined){ 
        this.cellParameters.alpha = parseFloat( par.cellAlpha ); 
        // tangency check
         
        this.configureCellPoints('manual');  
       
        if(this.globalTangency){ 
          var offset = this.checkInterMotifCollision('alpha', parseFloat(par.cellAlpha) );
          this.cellParameters.alpha = offset.newVal ;

          if(par.cellAlpha != offset.newVal ) { 
            this.menu.forceToLooseEvent('cellAlpha');
            this.menu.setSliderValue("cellAlpha", offset.newVal);
            $('#cellAlpha').val(offset.newVal);
          } 
        } 
      }
      else if(par.cellBeta != undefined){ 
        this.cellParameters.beta = parseFloat( par.cellBeta ); 
        // tangency check
         
        this.configureCellPoints('manual');  
        if(this.globalTangency ){ 
          var offset = this.checkInterMotifCollision('beta', parseFloat(par.cellBeta) );
          this.cellParameters.beta = offset.newVal ;
           
          if(par.cellBeta != offset.newVal ) { 
            this.menu.forceToLooseEvent('cellBeta');
            this.menu.setSliderValue("cellBeta", offset.newVal);
            $('#cellBeta').val(offset.newVal);
          } 
        } 
      }
      else if(par.cellGamma != undefined){ 
        this.cellParameters.gamma = parseFloat( par.cellGamma ); 
        // tangency check
        this.configureCellPoints('manual');  
        if(this.globalTangency){ 
          var offset = this.checkInterMotifCollision('gamma', parseFloat(par.cellGamma) );
          this.cellParameters.gamma = offset.newVal ;

          if(par.cellGamma != offset.newVal ) { 
            this.menu.forceToLooseEvent('cellGamma');
            this.menu.setSliderValue("cellGamma", offset.newVal);
            $('#cellGamma').val(offset.newVal);
          } 
        } 
      }
      
      this.configureCellPoints('manual');  
       
      this.updateLatticeTypeRL();
      moreCollisions = false;  
      counterHelper++;
      
    }
    if(aAtomIndex){  
      var s = new THREE.Vector3(
        this.unitCellAtoms[aAtomIndex].object3d.position.x - this.unitCellAtoms[bAtomIndex].object3d.position.x,
        this.unitCellAtoms[aAtomIndex].object3d.position.y - this.unitCellAtoms[bAtomIndex].object3d.position.y,
        this.unitCellAtoms[aAtomIndex].object3d.position.z - this.unitCellAtoms[bAtomIndex].object3d.position.z
      ) ;
     
      this.giveInfo('The distance of tangent atoms after fixing -> Mathematical distance : '+(this.unitCellAtoms[aAtomIndex].getRadius() + this.unitCellAtoms[bAtomIndex].getRadius())+' , real distance : '+s.length());
    }
        
    this.cellMutex = true ; 
  };
 
  Motifeditor.prototype.setAnglesManually = function(par){
     
    if( par.manualSetCellAngles) { 
      $(".manualAngles").css("display", "inline"); 
      $('input[name=manualSetCellAngles]').attr('checked', true);
      
      $("#cellAlpha").val(this.cellParameters.alpha);
      $("#cellBeta").val(this.cellParameters.beta);
      $("#cellGamma").val(this.cellParameters.gamma);

      this.menu.setSliderValue("cellAlpha", this.cellParameters.alpha);
      this.menu.setSliderValue("cellBeta", this.cellParameters.beta);
      this.menu.setSliderValue("cellGamma", this.cellParameters.gamma);

      this.checkForAngleFix(); // calculate the least acceptable angle for the cell
    } 
  };

  Motifeditor.prototype.setDimsManually = function(par){
   
    if( par.manualSetCellDims) { 
      $(".manualDims").css("display", "inline"); 
      $('input[name=manualSetCellDims]').attr('checked', true);
        
      $("#Aa").val(this.cellParameters.scaleZ);
      $("#Ab").val(this.cellParameters.scaleX); 
      $("#Ac").val(this.cellParameters.scaleY);

      this.menu.setSliderValue("Aa", this.cellParameters.scaleZ);
      this.menu.setSliderValue("Ab", this.cellParameters.scaleX);
      this.menu.setSliderValue("Ac", this.cellParameters.scaleY); 
      this.checkForLengthFix(); // calculate the least acceptable length for the cell
    }
     
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
      this.newSphere.setOpacity(param.atomOpacity, param.atomOpacity);
      this.unitCellAtomsOpacity(this.newSphere.getID(),param.atomOpacity);
    }
    else if(!_.isUndefined(param.atomColor)){  
      this.newSphere.setColorMaterial("#"+param.atomColor);
      this.colorUnitCellAtoms(this.newSphere.getID(), "#"+param.atomColor);
    }
    else if(!_.isUndefined(param.atomTexture)){
      // deprecated 
      this.newSphere.setColorMaterial(param.atomTexture);
      this.unitCellAtomsTexture(this.newSphere.getID(), param.atomTexture);
    } 
    else if(!_.isUndefined(param.wireframe)){ 
      // deprecated
      this.newSphere.wireframeMat(param.wireframe);
      this.unitCellAtomsWireframe(this.newSphere.getID(), param.wireframe);
    }  
  };  
  Motifeditor.prototype.getMotif = function (store){ 
    var _this = this, copiedAr = this.motifsAtoms.slice() ;
     
    /*
    {
      "object3d" : {
        "position" : { 
          "x": _this.newSphere.object3d.position.x, 
          "y": _this.newSphere.object3d.position.y, 
          "z": _this.newSphere.object3d.position.z,
          clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); }
        },
        'children' : [
          
        ]
      }, 
      getRadius: function() { return _this.newSphere.getRadius(); }
    }
    */

    // store needs fix here
    if(this.newSphere !== undefined){ 
      var newSphereHelper = jQuery.extend(true, {}, this.newSphere);
      newSphereHelper.position = { 
        "x": _this.newSphere.position.x,
        "y": _this.newSphere.position.y,
        "z": _this.newSphere.position.z,
        clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); }
      };
      copiedAr.push(
        newSphereHelper
      );

    }
     
    return copiedAr; 

  };
   
  Motifeditor.prototype.getAllAtoms = function (){
    return this.motifsAtoms;
  };
  Motifeditor.prototype.getDimensions = function (){ 
    var  r = {
      'x' : this.cellParameters.scaleX, 
      'y' : this.cellParameters.scaleY, 
      'z' : this.cellParameters.scaleZ,
      'alpha' : this.cellParameters.alpha,
      'beta' : this.cellParameters.beta,
      'gamma' : this.cellParameters.gamma 
    } ;
      
    return r;
  };
  Motifeditor.prototype.updateFixedParams = function (params) {
    $("#fixedX").val(params.x);
    $("#fixedY").val(params.y);
    $("#fixedZ").val(params.z); 
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

    var buttonClicked = parameters.button;
   
    if(this.editorState.state === "creating"){ 
      switch(buttonClicked) { 
        case "saveChanges":   
          this.motifsAtoms.push(this.newSphere); 
          this.updateAtomList(
            this.newSphere.object3d.position.clone(), 
            this.newSphere.getID(), 
            this.newSphere.getRadius(), 
            this.newSphere.elementName,
            'edit',
            'bg-light-gray',
            this.newSphere.tangentParent,
            this.newSphere.color,
            this.newSphere.ionicIndex
          );
          PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});
          this.lastSphereAdded = this.newSphere ;
          this.newSphere.blinkMode(false); 
          this.newSphere = undefined ;
          this.dragMode = false; 
          break;
        case "deleteAtom": 
          this.removeFromUnitCell(this.newSphere.getID());
          this.menu.breakChain({id : this.newSphere.getID(), remove : true});
          this.deleteTangentChild(this.newSphere.getID());
          this.newSphere.destroy();
          if(!_.isUndefined( this.motifsAtoms[0])) {   
            this.lastSphereAdded = this.motifsAtoms[this.motifsAtoms.length-1];
            this.newSphere =  undefined; 
            this.configureCellPoints();
          }
          else{
            this.newSphere = undefined ;
            this.lastSphereAdded = undefined ;
            this.isEmpty = true ; 
          }
          
          this.dragMode = false; 
          PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});
          this.initVolumeState(); 
          break; 
      }
    }
    else if(this.editorState.state === "editing"){ 
      switch(buttonClicked) { 
        case "saveChanges": 
          this.motifsAtoms.push(this.newSphere);
          this.updateAtomList(
            this.newSphere.object3d.position.clone(), 
            this.newSphere.getID(), 
            this.newSphere.getRadius(),  
            this.newSphere.elementName,
            'edit',
            'bg-light-gray',
            this.newSphere.tangentParent,
            this.newSphere.color,
            this.newSphere.ionicIndex
          );
          PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});
          this.newSphere.blinkMode(false);
          this.newSphere = undefined ;
          this.dragMode = false; 
          break;
        case "deleteAtom":
          this.removeFromUnitCell(this.newSphere.getID());
          this.menu.breakChain({id : this.newSphere.getID(), remove : true});
          this.newSphere.destroy();
          this.updateAtomList(
            undefined, 
            this.newSphere.getID(), 
            undefined, 
            undefined,
            'delete'
          );
          this.deleteTangentChild(this.newSphere.getID());
          //_.find(this.motifsAtoms, function(atom,k){ if(atom.getID() === this.newSphere.getID() ) this.motifsAtoms.splice(k,1); }); 
          if(!_.isUndefined( this.motifsAtoms[0])) {
            this.lastSphereAdded = this.motifsAtoms[this.motifsAtoms.length-1];
            this.newSphere =  undefined; //this.motifsAtoms[this.motifsAtoms.length-1];   
            this.configureCellPoints();
          }
          else{
            this.newSphere = undefined ;
            this.lastSphereAdded = undefined ;
            this.isEmpty = true ;  
          }
          this.dragMode = false; 
          PubSub.publish(events.EDITOR_STATE, {'state' : "initial"});  
          this.initVolumeState(); 
          break; 
      }
    } 
  };
  Motifeditor.prototype.deleteTangentChild = function (id){
    // todo na feugei kai to tanngent icon apo to child kai na ginetai free
    _.each(this.motifsAtoms, function(atom, r) { 
      if(atom.getID() == id) { 

        atom.tangentParent = undefined ;
        
        /* 
        this.updateAtomList(
          atom.object3d.position.clone(), 
          atom.getID(), 
          atom.getRadius(),  
          atom.elementName,
          'edit',
          'bg-light-gray',
          atom.tangentParent
        );*/
      }
    });   
  };
  Motifeditor.prototype.editorState_ = function (arg){
    var _this = this ;
    this.editorState.state = arg.state;
    var atomPos = (arg.atomPos === undefined) ? new THREE.Vector3(0,0,0) : arg.atomPos;
    var color = (arg.atomColor === undefined) ? '#ffffff' : (arg.atomColor);
     
    switch(arg.state) {
      case "initial":  
        this.menu.rotAnglesSection(false); 
        this.menu.disableMEButtons(
          {
            'atomPalette' : false,
            'saveAtomChanges' : true,
            'previewAtomChanges' : true,  
            'deleteAtom' : true 
          }
        );
        this.menu.editMEInputs(
          {
            'atomPosX' : 0,
            'atomPosY' : 0,
            'atomPosZ' : 0,  
            'atomColor' : '#1F2227',  
            'atomOpacity' : 10,
            'atomName' : '-', 
            'Aa' : this.cellParameters.scaleZ,
            'Ab' : this.cellParameters.scaleX,
            'Ac' : this.cellParameters.scaleY,
            'cellAlpha' : this.cellParameters.alpha,
            'cellBeta' : this.cellParameters.beta,
            'cellGamma' : this.cellParameters.gamma
          }
        ); 
        this.menu.disableMEInputs(
          {
            'atomPosX' : true,
            'atomPosY' : true,
            'atomPosZ' : true,  
            'atomColor' : true,  
            'atomOpacity' : true,  
            'atomPositioningXYZ' : true,
            'atomPositioningABC' : true,  
            'rotAngleTheta' :  false, 
            'rotAnglePhi' : false,
            'tangentR' : false,
            'Aa' : true,
            'Ab' : true,
            'Ac' : true,
            'cellAlpha' : true,
            'cellBeta' : true,
            'cellGamma' : true 
          }
        ); 
        break;
      case "creating":
        if(this.editorState.atomPosMode === 'relative'){
          arg.atomPos.x = arg.atomPos.x/ parseFloat($('#Ab').val());
          arg.atomPos.y = arg.atomPos.y/ parseFloat($('#Ac').val());
          arg.atomPos.z = arg.atomPos.z/ parseFloat($('#Aa').val());
        } 
        this.menu.disableMEButtons(
          {
            'atomPalette' : true,
            'saveAtomChanges' : false,
            'previewAtomChanges' : false, 
            'deleteAtom' : false 
          }
        );  
        this.menu.editMEInputs(
          {
            'atomPosX' : arg.atomPos.x,
            'atomPosY' : arg.atomPos.y,
            'atomPosZ' : arg.atomPos.z,  
            'atomColor' : color,  
            'atomOpacity' : 10,   
            'Aa' : this.cellParameters.scaleZ,
            'Ab' : this.cellParameters.scaleX,
            'Ac' : this.cellParameters.scaleY,
            'cellAlpha' : this.cellParameters.alpha,
            'cellBeta' : this.cellParameters.beta,
            'cellGamma' : this.cellParameters.gamma
          }
        );   
         var padD = false ;

        if(this.padlock === true){
          padD = true;
        }
        this.menu.disableMEInputs(
          {
            'atomPosX' : false,
            'atomPosY' : false,
            'atomPosZ' : false,  
            'atomColor' : false, 
            'atomOpacity' : false,     
            'atomPositioningXYZ' : false,
            'atomPositioningABC' : false,
            'Aa' : padD,
            'Ab' : padD,
            'Ac' : padD,
            'cellAlpha' : padD,
            'cellBeta' : padD,
            'cellGamma' : padD
          }
        );  
        break;
      case "editing": 
        if(this.editorState.atomPosMode === 'relative'){
          arg.atomPos.x = arg.atomPos.x/ parseFloat($('#Ab').val());
          arg.atomPos.y = arg.atomPos.y/ parseFloat($('#Ac').val());
          arg.atomPos.z = arg.atomPos.z/ parseFloat($('#Aa').val());
        } 
        this.menu.disableMEButtons(
          {
            'atomPalette' : true,
            'saveAtomChanges' : false,
            'previewAtomChanges' : false, 
            'deleteAtom' : false 
          }
        );   
        this.menu.editMEInputs(
          {
            'atomPosX' : arg.atomPos.x,
            'atomPosY' : arg.atomPos.y,
            'atomPosZ' : arg.atomPos.z,  
            'atomColor' : color,  
            'atomOpacity' : arg.opacity, 
            'ionicIndex' : arg.ionicIndex, 
            'atomName' : arg.atomName.toLowerCase()
          }
        );   

        var padD = false ;

        if(this.padlock === true){
          padD = true;
        }
        this.menu.disableMEInputs(
          {
            'atomPosX' : false,
            'atomPosY' : false,
            'atomPosZ' : false,  
            'atomColor' : false,  
            'atomOpacity' : false,  
            'Aa' : padD,
            'Ab' : padD,
            'Ac' : padD,
            'cellAlpha' : padD,
            'cellBeta' : padD,
            'cellGamma' : padD
          }
        );  
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
  Motifeditor.prototype.updateAtomList = function(pos, id, radius, name, action, classColor, chainLevel, atomColor, ionicIndex) {

    var _this = this ;  
    if(action === 'delete'){
       this.menu.editSavedAtom({
        'action':action,
        'id':id
      });
    }
    else{ 
      pos = (pos.x === '-') ? pos : (new THREE.Vector3(pos.x.toFixed(1),pos.y.toFixed(1),pos.z.toFixed(1)));

      var atomPos;
       
      if(this.editorState.atomPosMode === 'relative' && pos.x !== '-'){
        var x = parseFloat($('#Ab').val()) ;
        var y = parseFloat($('#Ac').val()) ;
        var z = parseFloat($('#Aa').val()) ;
        atomPos = '('+(pos.z/z).toFixed(1)+','+(pos.x/x).toFixed(1)+','+(pos.y/y).toFixed(1)+')';
      }  
      else{
        atomPos = '['+(pos.z)+','+(pos.x)+','+(pos.y)+']';
      }
     
      this.menu.editSavedAtom({
        'action':action,
        'id':id, 
        'visible':true,
        'elementCode':name.toLowerCase(),
        'elementName':name,
        'atomColor':atomColor,
        'atomPos': atomPos,
        'ionicIndex': ionicIndex
      });

      this.menu.highlightAtomEntry({id : id, color : classColor});

      if(chainLevel !== undefined){ 
        this.menu.hideChainIcon({id : id, hide : false});
      }
    } 
  }; 
  Motifeditor.prototype.setTangentAngle = function(azimuthal, polar, r, tangentToThis){
     
    var _this = this ;  
    var pos = new THREE.Vector3();
         
    pos = _this.sphericalCoords( r, azimuthal *  (Math.PI/180) , polar *  (Math.PI/180) );  
     
    pos.x += tangentToThis.object3d.position.x ;
    pos.y += tangentToThis.object3d.position.y ;
    pos.z += tangentToThis.object3d.position.z ;
    
    this.newSphere.object3d.position.x = pos.x ;
    this.newSphere.object3d.position.y = pos.y ;
    this.newSphere.object3d.position.z = pos.z ;
     
    this.translateCellAtoms("x",  pos.x , this.newSphere.getID());
    this.translateCellAtoms("y",  pos.y , this.newSphere.getID());
    this.translateCellAtoms("z",  pos.z , this.newSphere.getID());
    this.configureCellPoints();
    this.findAngles('x');
    this.findAngles('y');
    this.findAngles('z'); 
  };
  Motifeditor.prototype.changeRotatingAngle = function(arg, tangentToThis){
     
    var _this = this ;  
    var pos = new THREE.Vector3();
    var tangentToThis = (tangentToThis === undefined) ? this.tangentToThis : tangentToThis ; 
    var r = this.newSphere.getRadius() + tangentToThis.getRadius() ;
   
    var polar = parseFloat( arg.rotAngleTheta );
    var azimuthal = parseFloat( arg.rotAnglePhi );
    if(this.dragMode){ 
      pos = _this.sphericalCoords( r, azimuthal *  (Math.PI/180) , polar *  (Math.PI/180) );  
    }
    pos.x += tangentToThis.object3d.position.x ;
    pos.y += tangentToThis.object3d.position.y ;
    pos.z += tangentToThis.object3d.position.z ;
    this.newSphere.object3d.position.set(pos.x , pos.y, pos.z); 
    this.translateCellAtoms("x",  pos.x , this.newSphere.getID());
    this.translateCellAtoms("y",  pos.y , this.newSphere.getID());
    this.translateCellAtoms("z",  pos.z , this.newSphere.getID());
    this.configureCellPoints();
    this.findAngles('x');
    this.findAngles('y');
    this.findAngles('z'); 
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
    var _this = this, colAtom; 
    
    if(this.dragMode === false && this.globalTangency === true){
      for (var i = this.motifsAtoms.length - 1; i >= 0; i--) {
        var realDist = this.motifsAtoms[i].object3d.position.distanceTo(this.newSphere.object3d.position);
        var calcDist = this.motifsAtoms[i].getRadius() + this.newSphere.getRadius();
        if(realDist<calcDist){
          colAtom = this.motifsAtoms[i];
        }
      };
    }

    if(this.dragMode || colAtom){ 

      if(this.soundMachine.procced) this.soundMachine.play('popOutOfAtom');

      var axis = this.rotAxis;
      var movingAtom = this.newSphere;
      var stillAtom = (colAtom) ? colAtom : this.tangentToThis;
      var movingPoint = new THREE.Vector3(movingAtom.object3d.position.x, movingAtom.object3d.position.y, movingAtom.object3d.position.z); 
      var stillPoint = new THREE.Vector3(stillAtom.object3d.position.x, stillAtom.object3d.position.y, stillAtom.object3d.position.z);
      var tangentDistance = this.newSphere.tangentR ; 
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

        this.newSphere.object3d.position.y = position.y ;  
        this.newSphere.object3d.position.x = position.x ;   
        this.translateCellAtoms("y",  position.y , this.newSphere.getID());
        this.translateCellAtoms("x",  position.x , this.newSphere.getID());
 
        this.menu.editMEInputs(
          {  
            'rotAngleX' : angle.toFixed(0) 
          }
        );

        this.configureCellPoints();

        if(this.dragMode) {
          this.findAngles('y');
          this.findAngles('z');
        }
      }
      else if(axis === 'y'){

        var thirdPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, movingPoint.z); 
        var inactiveAxesPoint = new THREE.Vector3(movingPoint.x, stillPoint.y, stillPoint.z);
        var oldHypotenuseVec = movingPoint.sub(inactiveAxesPoint);
        var oldVerticalVec = thirdPoint.sub(inactiveAxesPoint); 
        if (_.isUndefined(angle)) angle = calculateAngle( new THREE.Vector2( 1,0 ), new THREE.Vector2( -1 * oldHypotenuseVec.z, oldHypotenuseVec.y ) ) ; 
        var inactiveAxesVec = inactiveAxesPoint.sub(stillPoint); 
        var correctHypotenuse = Math.sqrt( (tangentDistance * tangentDistance) -  (inactiveAxesVec.length() * inactiveAxesVec.length()) );
        var verticalSide = correctHypotenuse * Math.sin(angle * (Math.PI/180) );
        var horizontalSide = correctHypotenuse * Math.cos(angle * (Math.PI/180) );
        var position = new THREE.Vector3(movingPoint.x  , stillPoint.y + verticalSide,  (stillPoint.z - horizontalSide) );

        this.newSphere.object3d.position.y = position.y ;  
        this.newSphere.object3d.position.z = position.z ;  
        this.translateCellAtoms("y",  position.y , _this.newSphere.getID());
        this.translateCellAtoms("z",  position.z , _this.newSphere.getID());
        var a = parseFloat((180 -angle).toFixed(0)) ;
        if(a<0) a = 360 + a ;
          
        this.menu.editMEInputs(
          {  
            'rotAngleY' : a 
          }
        );
        this.configureCellPoints();
        if(this.dragMode) {
          this.findAngles('x');
          this.findAngles('z');
        }
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

        this.newSphere.object3d.position.x = position.x ;  
        this.newSphere.object3d.position.z = position.z ;  
        this.translateCellAtoms("x",  position.x , _this.newSphere.getID());
        this.translateCellAtoms("z",  position.z , _this.newSphere.getID());
        var a = (360 - angle).toFixed(0) ;
        if(a==360) a=0.000;
          
        this.menu.editMEInputs(
          {  
            'rotAngleX' : a
          }
        );
        this.configureCellPoints();
        if(this.dragMode) {
          this.findAngles('x');
          this.findAngles('y'); 
        }
      }
      this.menu.setSliderValue("atomPosX", _this.newSphere.object3d.position.x);
      this.menu.setSliderValue("atomPosY", _this.newSphere.object3d.position.y);
      this.menu.setSliderValue("atomPosZ", _this.newSphere.object3d.position.z);
      if(this.dragMode) {
        var p = new THREE.Vector3(
          this.newSphere.object3d.position.x-this.tangentToThis.object3d.position.x,
          this.newSphere.object3d.position.y-this.tangentToThis.object3d.position.y,
          this.newSphere.object3d.position.z-this.tangentToThis.object3d.position.z
          ); 
        var angles = _this.findPolarAngles(p);

        this.menu.editMEInputs(
          { 
            'rotAngleTheta' : (angles.theta).toFixed(1) , 
            'rotAnglePhi' : (angles.phi).toFixed(1)   
          }
        );
      }
    } 

    if(this.padlock === true && this.globalTangency === true){
     
      var _dimensions = this.findMotifsDimensions(_this.newSphere.object3d.position, _this.newSphere.getRadius());   

      var dimensions = this.calcABCforParticularCases(_dimensions);

      // for volume reduce functionality 
      this.initVolumeState();

    } 

  }; 
  Motifeditor.prototype.findAngles = function(axis){ // set with parameter for flexibility
    var _this = this ; 
     
    var movingAtom = this.newSphere;
    var stillAtom = this.tangentToThis;
    var movingPoint = new THREE.Vector3(movingAtom.object3d.position.x, movingAtom.object3d.position.y, movingAtom.object3d.position.z); 
    var stillPoint = new THREE.Vector3(stillAtom.object3d.position.x, stillAtom.object3d.position.y, stillAtom.object3d.position.z);
    var tangentDistance = this.newSphere.tangentR ;  
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
      this.menu.editMEInputs(
        {  
          'rotAngleX' : angle.toFixed(0) 
        }
      );

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
      var a = parseFloat((180 -angle).toFixed(0)) ;
      if(a<0) a = 360 + a ;
      this.menu.editMEInputs(
        {  
          'rotAngleY' : a 
        }
      ); 
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
      var a = (360 - angle).toFixed(0) ;
      if(a==360) a=0.000;
      this.menu.editMEInputs(
        {  
          'rotAngleZ' : a
        }
      ); 
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
  Motifeditor.prototype.changeTangentR = function(arg){

    var movingAtom = this.newSphere;
    var stillAtom = this.tangentToThis;

    if(arg === undefined || arg.tangentR === ''){
      
      var tangentDistance = movingAtom.getRadius() + stillAtom.getRadius() ; 
      this.newSphere.tangentR = tangentDistance;
      this.menu.editMEInputs(
        { 
          'tangentR' : tangentDistance  
        }
      );
    }
    else{ 
      this.newSphere.tangentR = parseFloat(arg.tangentR);
      this.rotateAroundAtom();
      this.menu.editMEInputs(
        { 
          'tangentR' : arg.tangentR  
        }
      );
    }
     
  };
  Motifeditor.prototype.selectAtom = function (which, doNotRepos, doNotChangeState){ 
    var _this = this;
    var doNotDestroy = false;
    var x = $('#Ab').val() ;
    var y = $('#Ac').val() ;
    var z = $('#Aa').val() ;

    this.menu.disableMEInputs(
    { 
      'atomPositioningXYZ' : false,
      'atomPositioningABC' : false
    });

     
    if(this.dragMode === true && doNotChangeState !== undefined) { 
        
      this.tangentToThis = _.find(_this.motifsAtoms, function(atom){ return atom.getID() == which; }); 
 
      if(doNotRepos === undefined) {  
        var newPos = this.findNewAtomsPos(this.tangentToThis, this.newSphere.getRadius(), true);  

        this.newSphere.object3d.position.set(newPos.x, newPos.y, newPos.z); 

        this.changeTangentR();

        this.translateCellAtoms("x",  newPos.x , _this.newSphere.getID());
        this.translateCellAtoms("y",  newPos.y , _this.newSphere.getID());
        this.translateCellAtoms("z",  newPos.z , _this.newSphere.getID());
        this.configureCellPoints(); 

        this.menu.setSliderValue("atomPosX", _this.newSphere.object3d.position.x);
        this.menu.setSliderValue("atomPosY", _this.newSphere.object3d.position.y);
        this.menu.setSliderValue("atomPosZ", _this.newSphere.object3d.position.z);
      }
      else{
        this.changeTangentR({'tangentR' : this.newSphere.tangentR});
      } 

      this.findAngles('x');
      this.findAngles('y');
      this.findAngles('z');

      var p = new THREE.Vector3(
        this.newSphere.object3d.position.x-_this.tangentToThis.object3d.position.x,
        this.newSphere.object3d.position.y-_this.tangentToThis.object3d.position.y,
        this.newSphere.object3d.position.z-_this.tangentToThis.object3d.position.z
      );
      var angles = _this.findPolarAngles(p);

      this.menu.editMEInputs(
        { 
          'rotAngleTheta' : (angles.theta).toFixed(1) , 
          'rotAnglePhi' : (angles.phi).toFixed(1)  
        }
      );

    }
    else if(!this.dragMode){ 
      if(this.newSphere !== undefined && which === this.newSphere.getID()){
        // case where user clicks ont he current atom
        return;
      }
      else if(this.newSphere !== undefined){
        // case where the user clicks other atom without having saved last atom's changes
        if(this.newSphere.fresh === true){
          var r = confirm("Your changes will be lost. Are you sure you want to proceed?");
        
          if (r !== true) {
              return;
          }  
          this.updateAtomList(
            undefined, 
            this.newSphere.getID(), 
            undefined, 
            undefined,
            'delete'
          );
        }
        else if(this.newSphere.fresh === false){
          var r = confirm("Your changes will be automatically saved. Are you sure you want to proceed?");
          
          if (r !== true) {
              return;
          }
          else{ 
            this.motifsAtoms.push(this.newSphere);
            
            this.updateAtomList(
              this.newSphere.object3d.position.clone(), 
              this.newSphere.getID(), 
              this.newSphere.getRadius(),  
              this.newSphere.elementName,
              'edit',
              'bg-light-gray',
              this.newSphere.tangentParent,
              this.newSphere.color,
              this.newSphere.ionicIndex
            );
             
            this.newSphere.blinkMode(false);
            this.newSphere = undefined ;
            this.dragMode = false; 
            doNotDestroy = true;
          }
        }
      }
      if(this.newSphere !== undefined){
        this.menu.highlightAtomEntry({id : this.newSphere.getID(), color : 'bg-light-gray'});
      } 
      this.menu.highlightAtomEntry({id : which, color : 'bg-light-purple'}); 

      var name,color, opacity;
      
      if(!_.isUndefined(this.newSphere) && doNotDestroy === false) { 
        this.newSphere.destroy() ; 
        this.removeFromUnitCell(this.newSphere.getID());
        this.initVolumeState();
      }
       
      this.newSphere = _.find(_this.motifsAtoms, function(atom){ return atom.getID() == which; });
      this.newSphere.fresh = false;

      if(this.editorState.atomPosMode === 'relative'){
         
        this.menu.setSliderValue('atomPosX', this.newSphere.object3d.position.x/x);
        this.menu.setSliderValue('atomPosY', this.newSphere.object3d.position.y/y);
        this.menu.setSliderValue('atomPosZ', this.newSphere.object3d.position.z/z);
      }
      else{
        this.menu.setSliderValue('atomPosX', this.newSphere.object3d.position.x);
        this.menu.setSliderValue('atomPosY', this.newSphere.object3d.position.y);
        this.menu.setSliderValue('atomPosZ', this.newSphere.object3d.position.z);
      }
       
      _.each(_this.motifsAtoms, function(atom, r) { 
        if(atom.getID() == which) { 
          _this.motifsAtoms.splice(r,1);
        }
      });   

      // drag mode restore
 
      if(this.newSphere.tangentParent !== undefined){
        this.setDraggableAtom({'dragMode': true, 'parentId': this.newSphere.tangentParent}, true);
      } 
      if(doNotChangeState === undefined){
        PubSub.publish(events.EDITOR_STATE,{ 'state' : 'editing', 'ionicIndex' : this.newSphere.ionicIndex,'atomName' : this.newSphere.getName(), 'atomPos' : this.newSphere.object3d.position.clone(), 'opacity' : this.newSphere.opacity*10, 'atomColor' : this.newSphere.color });
      }
    } 
  };
  Motifeditor.prototype.configureCellPoints = function(manual){  
    
    var _this = this;  
    if(this.isEmpty) {
      return; 
    }

    var dimensions; 

    if( (!this.padlock && this.globalTangency === false) || (manual !== undefined)){   
      dimensions = {"xDim" : this.cellParameters.scaleX, "yDim" : this.cellParameters.scaleY, "zDim" : this.cellParameters.scaleZ };
    } 
    else{ 
      if(this.newSphere === undefined || this.newSphere.object3d === undefined){ 
        dimensions = this.findMotifsDimensions(undefined, undefined);  
      }
      else{ 
        dimensions = this.findMotifsDimensions(this.newSphere.object3d.position, this.newSphere.getRadius());   
      }
    } 

    this.revertShearing();
      
    if(_this.latticeName !== 'hexagonal') {
      this.cellPointsWithScaling({xDim : 1, yDim : 1, zDim : 1}, false, manual); 
    } 

    //edw paizei kapoio provlima me to oti vriskei collisions sunexeia me

    this.cellPointsWithScaling(dimensions, true, manual); // todo fix that true  
 
    if(_this.latticeName !== 'hexagonal'){

      this.cellPointsWithAngles();
     
      // reposition cell atoms after changing unitCellPositions
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {  
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z)  && _this.unitCellAtoms[i].temp === undefined ){  
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
                _.each(_this.unitCellAtoms, function(a, i) { 
                  if(a.latticeIndex === ("_"+_x+_y+_z)  && a.temp === undefined ){ 
 
                    var offset = a.getUserOffset();
                    
                    if(!_.isUndefined(a.object3d)){ 

                      a.object3d.position.set( 
                        _this.unitCellPositions["_"+_x+_y+_z].position.x + offset.x , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.y + offset.y , 
                        _this.unitCellPositions["_"+_x+_y+_z].position.z + offset.z 
                      );
                    } 
                  } 
                });
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {  
            for (var j = _this.unitCellAtoms.length - 1; j >= 0; j--) {
              if(  _this.unitCellAtoms[j].temp === undefined ){ 
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
            }
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {  
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) && _this.unitCellAtoms[i].temp === undefined ){  
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
            if(_this.unitCellAtoms[i].latticeIndex === ("_c")  && _this.unitCellAtoms[i].temp === undefined ){  
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
                  if(_this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) && _this.unitCellAtoms[i].temp === undefined ){  
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
            if(_this.unitCellAtoms[j].latticeIndex === ("_up")  && _this.unitCellAtoms[j].temp === undefined){  
              var offset = _this.unitCellAtoms[j].getUserOffset(); 
              if(!_.isUndefined(_this.unitCellAtoms[j].object3d)){ 
                _this.unitCellAtoms[j].object3d.position.set( 
                  _this.unitCellPositions["_up"].position.x + offset.x , 
                  _this.unitCellPositions["_up"].position.y + offset.y , 
                  _this.unitCellPositions["_up"].position.z + offset.z 
                );
              }  
            } 
            if(_this.unitCellAtoms[j].latticeIndex === ("_down") && _this.unitCellAtoms[j].temp === undefined ){  
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

                if(_this.unitCellAtoms[i].latticeIndex === (reference) && _this.unitCellAtoms[i].temp === undefined  ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset();
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d)){ 
                    _this.unitCellAtoms[i].object3d.position.set( 
                      position.x + offset.x , 
                      position.y + offset.y , 
                      position.z + offset.z 
                    );
                  } 
                } 
                if(_this.unitCellAtoms[i].latticeIndex === (referenceC) && _this.unitCellAtoms[i].temp === undefined  ){  
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
  Motifeditor.prototype.addAtomInCell = function(pos, radius, color, tang, name, id, opacity, wireframe, restore){  
    var _this = this;  
    var dimensions, identity ;
     
    if( (!this.padlock && this.globalTangency === false) && _.isUndefined(restore)){
      dimensions = {"xDim" : this.cellParameters.scaleX, "yDim" : this.cellParameters.scaleY, "zDim" : this.cellParameters.scaleZ };
    } 
    else if(_.isUndefined(restore)){ 
      dimensions = this.findMotifsDimensions(pos, radius); // calculate dimensions of cell 
    }
      
    if(_.isUndefined(restore)) {
      this.cellPointsWithScaling(dimensions, true); // todo fix that true 
    }
    
    if(_.isUndefined(restore)) {
      this.cellPointsWithAngles();
    } 

    this.box3.pos = pos;

    function createHelperObj(pos, radius, latticeIndex, x, y, z){
      var o = 
      { 
        "object3d" : {
          "position" : new THREE.Vector3(x,y,z)
        }, 
        'temp' : true,
        getRadius: function() { return radius; },
        'latticeIndex': latticeIndex, 
        "userOffset" : { 
          "x": pos.x, 
          "y": pos.y, 
          "z": pos.z
        }
      }; 
      return o; 
    } 
    
    if(_this.latticeName !== 'hexagonal'){ 
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                identity = "_"+_x+_y+_z; 
                _this.unitCellAtoms.push(
                  createHelperObj(
                    pos,
                    radius, 
                    identity, 
                    pos.x + _this.unitCellPositions[identity].position.x, 
                    pos.y + _this.unitCellPositions[identity].position.y, 
                    pos.z + _this.unitCellPositions[identity].position.z
                  )
                );  
             });
            });
          }); 
          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                identity = "_"+_x+_y+_z; 
                _this.unitCellAtoms.push(
                  createHelperObj(
                    pos, 
                    radius, 
                    identity, 
                    pos.x + _this.unitCellPositions[identity].position.x, 
                    pos.y + _this.unitCellPositions[identity].position.y, 
                    pos.z + _this.unitCellPositions[identity].position.z
                  )
                ); 
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {
            identity = "_"+i ; 
            _this.unitCellAtoms.push(
              createHelperObj(
                pos, 
                radius, 
                identity, 
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z
              )
            );

            /////////////////
            identity = "__"+i ; 
            _this.unitCellAtoms.push(
              createHelperObj(
                pos, 
                radius, 
                identity, 
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z
              )
            );

            ////////////////

            identity = "___"+i ; 
            _this.unitCellAtoms.push(
              createHelperObj(
                pos, 
                radius, 
                identity, 
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z
              )
            );
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {   
                
                identity = "_"+_x+_y+_z ; 
                _this.unitCellAtoms.push(
                  createHelperObj(
                    pos, 
                    radius, 
                    identity, 
                    pos.x + _this.unitCellPositions[identity].position.x, 
                    pos.y + _this.unitCellPositions[identity].position.y, 
                    pos.z + _this.unitCellPositions[identity].position.z
                  )
                );

              });
            });
          });

          identity = "_c" ; 
          _this.unitCellAtoms.push(
            createHelperObj(
              pos, 
              radius, 
              identity, 
              pos.x + _this.unitCellPositions[identity].position.x, 
              pos.y + _this.unitCellPositions[identity].position.y, 
              pos.z + _this.unitCellPositions[identity].position.z
            )
          );

          break;
        case "base":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {

                identity = "_"+_x+_y+_z; 
                _this.unitCellAtoms.push(
                  createHelperObj(
                    pos, 
                    radius, 
                    identity, 
                    pos.x + _this.unitCellPositions[identity].position.x, 
                    pos.y + _this.unitCellPositions[identity].position.y, 
                    pos.z + _this.unitCellPositions[identity].position.z
                  )
                );

              });
            });
          }); 
          
          identity = "_up"; 
          _this.unitCellAtoms.push(
            createHelperObj(
              pos, 
              radius, 
              identity, 
              pos.x + _this.unitCellPositions[identity].position.x, 
              pos.y + _this.unitCellPositions[identity].position.y, 
              pos.z + _this.unitCellPositions[identity].position.z
            )
          );

          /////

          identity = "_down" ; 
          _this.unitCellAtoms.push(
            createHelperObj(
              pos, 
              radius, 
              identity, 
              pos.x + _this.unitCellPositions[identity].position.x, 
              pos.y + _this.unitCellPositions[identity].position.y, 
              pos.z + _this.unitCellPositions[identity].position.z
            )
          );
   
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
            _this.unitCellAtoms.push(  
              createHelperObj(
                pos,
                radius, 
                'hc_'+_x+_y+_z, 
                pos.x , 
                pos.y + y, 
                pos.z 
              ) 
            );  
                
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
              
              _this.unitCellAtoms.push( 
                createHelperObj(
                  pos,
                  radius, 
                  reference, 
                  pos.x + position.x, 
                  pos.y + position.y, 
                  pos.z + position.z
                )  
              );  
 
            });
          });
        });
      });   
    }
 
    this.reconstructCellPoints(restore);  
    
    if(this.padlock === true || this.globalTangency === true){

      this.leastVolume();  

      this.cellVolume.xInitVal = this.cellParameters.scaleX;
      this.cellVolume.yInitVal = this.cellParameters.scaleY;
      this.cellVolume.zInitVal = this.cellParameters.scaleZ;
    }
    
    if(_this.latticeName !== 'hexagonal'){ 
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                identity = "_"+_x+_y+_z;
                 
                _this.unitCellAtoms.push(
                  new UnitCellAtom( 
                    new THREE.Vector3(
                      pos.x + _this.unitCellPositions[identity].position.x, 
                      pos.y + _this.unitCellPositions[identity].position.y, 
                      pos.z + _this.unitCellPositions[identity].position.z
                    ), 
                    radius, 
                    color, 
                    tang, 
                    name, 
                    id, 
                    identity,
                    opacity,
                    _this.renderingMode
                  ) 
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
                identity = "_"+_x+_y+_z;
                _this.unitCellAtoms.push(
                  new UnitCellAtom( 
                    new THREE.Vector3(
                      pos.x + _this.unitCellPositions[identity].position.x, 
                      pos.y + _this.unitCellPositions[identity].position.y, 
                      pos.z + _this.unitCellPositions[identity].position.z
                    ), 
                    radius, 
                    color, 
                    tang, 
                    name, 
                    id,  
                    identity, 
                    opacity,
                    _this.renderingMode
                  ) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {
            identity = "_"+i ;
            _this.unitCellAtoms.push(new UnitCellAtom( 
                new THREE.Vector3(
                  pos.x + _this.unitCellPositions[identity].position.x, 
                  pos.y + _this.unitCellPositions[identity].position.y, 
                  pos.z + _this.unitCellPositions[identity].position.z
                ), 
                radius, 
                color, 
                tang, 
                name, 
                id,
                identity, 
                opacity, 
                _this.renderingMode
              ) 
            ); 
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
            /////////////////
            identity = "__"+i ;
            _this.unitCellAtoms.push(
                new UnitCellAtom( 
                  new THREE.Vector3(
                  pos.x + _this.unitCellPositions["__"+i].position.x, 
                  pos.y + _this.unitCellPositions["__"+i].position.y, 
                  pos.z + _this.unitCellPositions["__"+i].position.z
                ), 
                radius,
                color, 
                tang, 
                name, 
                id,
                "__"+i, 
                opacity,
                _this.renderingMode
              ) 
            ); 
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
            _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
  
            ////////////////

            identity = "___"+i ;
            _this.unitCellAtoms.push(
              new UnitCellAtom( 
                new THREE.Vector3(
                  pos.x + _this.unitCellPositions["___"+i].position.x, 
                  pos.y + _this.unitCellPositions["___"+i].position.y, 
                  pos.z + _this.unitCellPositions["___"+i].position.z), 
                radius, 
                color, 
                tang, 
                name, 
                id, 
                "___"+i, 
                opacity,
                _this.renderingMode
              ) 
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
                
                identity = "_"+_x+_y+_z ;
                _this.unitCellAtoms.push(
                    new UnitCellAtom( 
                      new THREE.Vector3(
                      pos.x + _this.unitCellPositions[identity].position.x, 
                      pos.y + _this.unitCellPositions[identity].position.y, 
                      pos.z + _this.unitCellPositions[identity].position.z), 
                    radius, 
                    color, 
                    tang, 
                    name, 
                    id,
                    identity, 
                    opacity,
                    _this.renderingMode
                  ) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
              });
            });
          });

          identity = "_c" ;
          _this.unitCellAtoms.push(
            new UnitCellAtom( 
              new THREE.Vector3(
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z), 
              radius, 
              color, 
              tang, 
              name, 
              id,
              identity, 
              opacity,
              _this.renderingMode
            ) 
          ); 
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z ); 
 
          break;
        case "base":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {

                identity = "_"+_x+_y+_z;
                _this.unitCellAtoms.push(
                  new UnitCellAtom( 
                    new THREE.Vector3(
                      pos.x + _this.unitCellPositions[identity].position.x, 
                      pos.y + _this.unitCellPositions[identity].position.y, 
                      pos.z + _this.unitCellPositions[identity].position.z), 
                    radius, 
                    color, 
                    tang, 
                    name, 
                    id,
                    identity, 
                    opacity,
                    _this.renderingMode
                  ) 
                ); 
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
                _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
              });
            });
          }); 
          
          identity = "_up";
          _this.unitCellAtoms.push(
            new UnitCellAtom( 
              new THREE.Vector3(
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z), 
              radius, 
              color, 
              tang, 
              name, 
              id, 
              identity, 
              opacity,
              _this.renderingMode
            ) 
          ); 
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("x",pos.x );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("y",pos.y );
          _this.unitCellAtoms[_this.unitCellAtoms.length-1].setUserOffset("z",pos.z );
 
          /////

          identity = "_down" ;
          _this.unitCellAtoms.push(
            new UnitCellAtom( 
              new THREE.Vector3(
                pos.x + _this.unitCellPositions[identity].position.x, 
                pos.y + _this.unitCellPositions[identity].position.y, 
                pos.z + _this.unitCellPositions[identity].position.z), 
              radius, 
              color, 
              tang, 
              name, 
              id, 
              identity, 
              opacity,
              _this.renderingMode
            ) 
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
                radius, 
                color,
                tang, 
                name, 
                id, 
                'hc_'+_x+_y+_z, 
                opacity,
                _this.renderingMode
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
                  radius, 
                  color, 
                  tang, 
                  name, 
                  id, 
                  reference, 
                  opacity,
                  _this.renderingMode
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
     
    // delete helpers
    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) {
      if(this.unitCellAtoms[i].temp !== undefined){  
        this.unitCellAtoms.splice(i,1);
      }
    };  
   
    this.updateAtomList(
      {x:'-',y:'-',z:'-'}, 
      this.newSphere.getID(), 
      '-', 
      this.newSphere.elementName,
      'save',
      'bg-light-purple',
      undefined,
      this.newSphere.color,
      this.newSphere.ionicIndex
    );
  }; 
  Motifeditor.prototype.atomVisibility = function(arg){ 
    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) { 
      if(this.unitCellAtoms[i].myID === arg.id){
        this.unitCellAtoms[i].object3d.visible = arg.visible;
      }
    }
    for (var i = this.motifsAtoms.length - 1; i >= 0; i--) { 
      if(this.motifsAtoms[i].getID() === arg.id){
        this.motifsAtoms[i].object3d.visible = arg.visible;
      }
    } 
    if(this.newSphere !== undefined && this.newSphere.getID() === arg.id){
      this.newSphere.object3d.visible = arg.visible;
    }
  };
  Motifeditor.prototype.leastVolume = function(){ 
    
    var coll = false;
    var step = 0;   
    
    this.menu.resetProgressBar('Constructing cell...');

    while(coll === false && this.unitCellAtoms.length !== 0){ 
    
      step += 1; 
      this.setManuallyCellVolume({ 'step' : step, 'trigger' : 'reducer'});
      if( this.cellVolume.aCol !== undefined || this.cellVolume.bCol !== undefined || this.cellVolume.cCol !== undefined  ){  
        coll = true;
      }
    }   
    
    this.menu.progressBarFinish();

    /*
    $("#cellVolume").val(100);  
    this.menu.setSliderValue("cellVolume", 100 );
    this.menu.setSliderMin("cellVolume", 90 );
    */
  };
  Motifeditor.prototype.reconstructCellPoints = function(restore){
    var _this = this; 
    if(restore) return ;
    if(_this.latticeName !== 'hexagonal'){
      switch(_this.latticeType) {
        case "primitive":  // primitive  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z)  && _this.unitCellAtoms[i].temp === undefined ){  
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
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z)  && _this.unitCellAtoms[i].temp === undefined ){  
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
              if( _this.unitCellAtoms[j].wireframe !== undefined ){  
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
            }
          };
          break;
        case "body":  
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) { 
                for (var i = _this.unitCellAtoms.length - 1; i >= 0; i--) {
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z) && _this.unitCellAtoms[i].temp === undefined ){  
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
            if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_c")  && _this.unitCellAtoms[i].temp === undefined ){  
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
                  if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && _this.unitCellAtoms[i].latticeIndex === ("_"+_x+_y+_z)  && _this.unitCellAtoms[i].temp === undefined ){  
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
            if( _this.unitCellAtoms[j].wireframe !== undefined ){ 
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
               
                if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && ( _this.unitCellAtoms[i].latticeIndex === reference)  && _this.unitCellAtoms[i].temp === undefined ){  
                  var offset = _this.unitCellAtoms[i].getUserOffset(); 
                  _this.unitCellAtoms[i].object3d.position.set( 
                    position.x + offset.x ,  
                    position.y + offset.y , 
                    position.z + offset.z 
                  ); 
                }
                if(!_.isUndefined(_this.unitCellAtoms[i].object3d) && (_this.unitCellAtoms[i].latticeIndex === referenceC)  && _this.unitCellAtoms[i].temp === undefined ){  
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

    _.each(_this.unitCellAtoms, function(a, k) {  
      if(a.getID() === id ){
        switch(axes) {
          case "x":  
            a.object3d.position.x = parseFloat(val) ;
            a.setUserOffset("x",parseFloat(val)); 
            break;
          case "y": 
            a.object3d.position.y = parseFloat(val)  ;
            a.setUserOffset("y",parseFloat(val)); 
            break;
          case "z": 
            a.object3d.position.z = parseFloat(val)  ;
            a.setUserOffset("z",parseFloat(val)); 
            break;
        } 
      }
    });
  };
  Motifeditor.prototype.findMotifsDimensions = function(pos, radius){

    var _this = this, offsets = {x : 0, y : 0, z : 0 }, myf ;   
       
    if(!_.isUndefined(_this.newSphere)){  
      if(_.isUndefined(_this.newSphere.object3d)){
        if(!_.isUndefined(pos) ){
          var helperObj = {
            "object3d" : {
              "position" : { 
                "x": pos.x, 
                "y":pos.y, 
                "z": pos.z}
              }, 
            getRadius: function() { return radius; }
          } ; 
          this.motifsAtoms.push(helperObj); 
          myf=true;
        }
      }
      else{
        var helperObj = {"object3d" : {"position" : { "x": _this.newSphere.object3d.position.x, "y":_this.newSphere.object3d.position.y, "z": _this.newSphere.object3d.position.z}}, getRadius: function() { return _this.newSphere.getRadius(); } } ; 
        this.motifsAtoms.push(helperObj); 
        myf=true;
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
 
    if(myf) {
      this.motifsAtoms.pop();
    }
    
    if(this.editorState.atomPosMode === 'absolute'){

      this.menu.setSliderMin('atomPosX',-1*cell.xDim);
      this.menu.setSliderMin('atomPosY',-1*cell.yDim);
      this.menu.setSliderMin('atomPosZ',-1*cell.zDim);

      this.menu.setSliderMax('atomPosX',cell.xDim);
      this.menu.setSliderMax('atomPosY',cell.yDim);
      this.menu.setSliderMax('atomPosZ',cell.zDim); 

      this.menu.setSliderMax('Aa',cell.xDim*10);
      this.menu.setSliderMax('Ab',cell.yDim*10);
      this.menu.setSliderMax('Ac',cell.zDim*10); 
    }

    return cell; // remember these dimensions are in 2l (e.g for cubic primitive)
  };
  Motifeditor.prototype.findHexTangentLengths = function(dimensions){
    var offsets = {x : 0, y : 0, z : 0 } ; 
    return dimensions.zDim;
    var finished = false, theXOffset=0, theYOffset=0, theZOffset=0;

    var motifHelper = [], j = 0;
    if(this.newSphere.object3d !== undefined){
      var rad = this.newSphere.getRadius();
      var helperObj = {"object3d" : {"position" : { "x": this.newSphere.object3d.position.x, "y":this.newSphere.object3d.position.y, "z": this.newSphere.object3d.position.z}}, getRadius: function() { return rad; } } ; 
      this.motifsAtoms.push(helperObj);
    }

    var minRadius = this.findShortestRadius(); 

    var movingOffset = 0.1; 

    while(j < this.motifsAtoms.length ) { 
       
      var r = this.motifsAtoms[j].getRadius();

      motifHelper.push( 
        {
          "object3d" : {"position" : { "x": this.motifsAtoms[j].object3d.position.x, "y": this.motifsAtoms[j].object3d.position.y, "z": this.motifsAtoms[j].object3d.position.z, clone: function() { return (new THREE.Vector3(this.x,this.y,this.z)); } } },
          "r" : r , 
          getRadius: function() { return (this.r); } 
        } 
      ); 
      j++;
    } 
     
    var a = dimensions.zDim ;
    var c = dimensions.yDim ; 
   
    var vertDist = a*Math.sqrt(3), _this = this;
     
    while(false){
      offsets.z -= movingOffset;

      _.times(6 , function(_r) {
          
        var v = new THREE.Vector3( a + offsets.z, 0, 0 );
       
        var axis = new THREE.Vector3( 0, 1, 0 );
        var angle = (Math.PI / 3) * _r ; 
        v.applyAxisAngle( axis, angle );

        for (var i = motifHelper.length - 1; i >= 0; i--) {
          motifHelper[i].object3d.position.x += v.x ;
          motifHelper[i].object3d.position.z += v.z ; 
        } 

        var ofst = _this.fakeCollision("x", motifHelper, new THREE.Vector3(v.x, 0 , v.z));   
        if( ofst > theZOffset) theZOffset = ofst ;

      });
          
      if (offsets.z < -5) finished = true ; 
    };
  
    if(this.newSphere.object3d !== undefined){
      this.motifsAtoms.pop();
    }; 
    return a ;
    dimensions.xDim += theZOffset;
    dimensions.zDim += theZOffset;
    return dimensions.xDim;
  }; 
  Motifeditor.prototype.transformHelper = function(vector){
    var _this = this ;
    _.each(shearing, function(k) {  
      if (_.isUndefined(_this.cellParameters[k]) === false) { 
        var argument = {};
        argument[k] = parseFloat(_this.cellParameters[k]); 
        var matrix = transformationMatrix(argument);   
        vector.applyMatrix4(matrix);   
      }
    });

    return vector;
  };

  // array to hold the lattice point in which if intermotif collision happens the offset must be scales before applied to ScaleX,Y,Z and sliders
  // if there us a collision and on of the atoms involved belongs to any of the special cases below, the result must be normalized
  var holdSpecialPos = {} ;
  holdSpecialPos['_0y'] = true;    //face 0     0.5  0.5
  holdSpecialPos['_0z'] = true;    //face 0     0.5  0.5
  holdSpecialPos['__0x'] = true;   //face 0.5   0    0.5
  holdSpecialPos['__0z'] = true;   //face 0.5   0    0.5
  holdSpecialPos['___0x'] = true;  //face 0.5   0.5  0
  holdSpecialPos['___0y'] = true;  //face 0.5   0.5  0

  holdSpecialPos['_1z'] = true;    //face 1     0.5  0.5
  holdSpecialPos['_1y'] = true;    //face 1     0.5  0.5
  holdSpecialPos['__1x'] = true;   //face 0.5   1    0.5
  holdSpecialPos['__1z'] = true;   //face 0.5   1    0.5
  holdSpecialPos['___1x'] = true;  //face 0.5   0.5  1
  holdSpecialPos['___1y'] = true;  //face 0.5   0.5  1

  holdSpecialPos['_cx'] = true;    //body 0.5   0.5  1
  holdSpecialPos['_cy'] = true;    //body 0.5   0.5  1
  holdSpecialPos['_cz'] = true;    //body 0.5   0.5  1

  holdSpecialPos['_upx'] = true;   //base 0.5   1    0.5
  holdSpecialPos['_upz'] = true;   //base 0.5   1    0.5

  holdSpecialPos['_downx'] = true; //base 0.5   0    0.5
  holdSpecialPos['_downz'] = true; //base 0.5   0    0.5

  Motifeditor.prototype.detectCollisionForLengths = function(axis, withAngles){
    var startTime = performance.now(), _this = this, offset = -1, posInlattice = 'none', normalize = false ;
    var noCollision = false ;
    aAtomIndex = undefined;
    bAtomIndex = undefined;

    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) {
      var a = this.unitCellAtoms[i];
  
      var rPos = new THREE.Vector3(
        this.unitCellPositions[a.latticeIndex].position.x + a.userOffset.x ,
        this.unitCellPositions[a.latticeIndex].position.y + a.userOffset.y ,
        this.unitCellPositions[a.latticeIndex].position.z + a.userOffset.z  
      );

      for (var j = this.unitCellAtoms.length - 1; j >= 0; j--) {
        var b = this.unitCellAtoms[j];
        if(a.latticeIndex != b.latticeIndex){ 
          var lPos = new THREE.Vector3(
            this.unitCellPositions[b.latticeIndex].position.x + b.userOffset.x ,
            this.unitCellPositions[b.latticeIndex].position.y + b.userOffset.y ,
            this.unitCellPositions[b.latticeIndex].position.z + b.userOffset.z  
          ), sign; 
          
          if( ((rPos.distanceTo(lPos) + 0.0000001) < (a.getRadius() + b.getRadius())) && (rPos.distanceTo(lPos) != 0 )){ // 0.00000000001 is for precision issues  
             
          //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xffffff );        // a to b : white

            var vecHelper;
            aAtomIndex = j ;
            bAtomIndex = i ;
            noCollision = false;
            if( !(this.latticeSystem === 'hexagonal') || !(this.latticeType === 'hexagonal'))
            {    
              if(!_.isUndefined( holdSpecialPos[b.latticeIndex+axis]) || !_.isUndefined( holdSpecialPos[a.latticeIndex+axis])) normalize = true;
               
              if(axis == 'x') {
                sign = (lPos.x>rPos.x) ? -1 : 1 ;
                vecHelper = this.transformHelper(new THREE.Vector3(this.cellParameters.scaleX,0,0));
              }
              else if(axis == 'y') {
                sign = (lPos.y>rPos.y) ? -1 : 1 ;
                vecHelper = this.transformHelper(new THREE.Vector3(0,this.cellParameters.scaleY,0));
              }
              else {
                sign = (lPos.z>rPos.z) ? -1 : 1 ;
                vecHelper = vecHelper = this.transformHelper(new THREE.Vector3( 0,0,this.cellParameters.scaleZ)); 
              }
              vecHelper.set(vecHelper.x*sign,vecHelper.y*sign,vecHelper.z*sign); 
            }
            else{
              vecHelper = new THREE.Vector3(
                this.unitCellPositions[a.latticeIndex].position.x-this.unitCellPositions[b.latticeIndex].position.x,
                this.unitCellPositions[a.latticeIndex].position.y-this.unitCellPositions[b.latticeIndex].position.y,
                this.unitCellPositions[a.latticeIndex].position.z-this.unitCellPositions[b.latticeIndex].position.z 
              );
            }

            var bortherPos = new THREE.Vector3(vecHelper.x + lPos.x, vecHelper.y + lPos.y, vecHelper.z + lPos.z ); 

            if(a.wireframe != undefined && this.latticeName !== 'hexagonal') a.changeColor((0xFF0000, 250));
            if(b.wireframe != undefined && this.latticeName !== 'hexagonal') b.changeColor((0xFF0000, 250));
           
            if(this.soundMachine.procced) this.soundMachine.play('cellCollision');

            var rA = a.getRadius();
            var rB = b.getRadius(); 

            offset = this.fixLengths(
              axis, 
              {
                "object3d" : {
                  "position" : {
                    "x": rPos.x, 
                    "y": rPos.y, 
                    "z": rPos.z, 
                  }
                }, 
                getRadius: function() { return rA; }
              },  
              {
                "object3d" : {
                  "position" : {
                    "x": lPos.x, 
                    "y": lPos.y, 
                    "z": lPos.z, 
                  }
                }, 
                getRadius: function() { return rB; }
              }, 
              {
                "object3d" : {
                  "position" : {
                    "x": bortherPos.x, 
                    "y": bortherPos.y, 
                    "z": bortherPos.z 
                  }
                }, 
                getRadius: function() { return rB; }
              },
              withAngles 
            );  
             
            j = -1;
            i = -1;
          }
        }  
      };
    };
     
    var endTime = performance.now(); 
    return {'offset': offset, 'normalize': normalize} ; 
  };

  var holdSpecialUnitCellPosFacs = {};

  holdSpecialUnitCellPosFacs['_c'] = {};

  Motifeditor.prototype.detectCollisionForAngles = function(angleName){
      
    var _this = this ;
    var alpha = -1000000;
    var beta = -1000000;
    var gamma = -1000000;
    
    aAtomIndex = undefined;
    bAtomIndex = undefined;
 
    for (var i = this.unitCellAtoms.length - 1; i >= 0; i--) {
      var rightSphere = this.unitCellAtoms[i];
      
      for (var j = this.unitCellAtoms.length - 1; j >= 0; j--) {

        var leftSphere = this.unitCellAtoms[j];

        if(leftSphere.latticeIndex != rightSphere.latticeIndex){ 
   
          if( ((rightSphere.object3d.position.distanceTo(leftSphere.object3d.position) + 0.0000001) < (rightSphere.getRadius() + leftSphere.getRadius())) && (rightSphere.object3d.position.distanceTo(leftSphere.object3d.position) != 0 )){
            
            aAtomIndex = j ;
            bAtomIndex = i ;

            rightSphere.changeColor((0xFF0000, 250));
            leftSphere.changeColor((0xFFFFFF, 250));
  
            if( angleName === 'beta'){ 
              if(rightSphere.object3d.position.x < leftSphere.object3d.position.x){
                // swap because we want to have the "right" atom in Xn2 so Xn2 - Xn1 = L > 0
                rightSphere = this.unitCellAtoms[j] ;
                leftSphere = this.unitCellAtoms[i] ; 
              }
              var _1_2 = Math.abs( leftSphere.object3d.position.y - rightSphere.object3d.position.y );
              var _1_4 = leftSphere.getRadius() + rightSphere.getRadius();  
              var _2_4 = Math.sqrt( _1_4 * _1_4 - _1_2 * _1_2 );
              var _2_3 = Math.abs(leftSphere.object3d.position.z - rightSphere.object3d.position.z);
              var _3_4 = Math.sqrt( _2_4 * _2_4 - _2_3 * _2_3 );
  
              var leftLatticePointIndex = ((leftSphere.object3d.position.x - leftSphere.userOffset.x) < (rightSphere.object3d.position.x - rightSphere.userOffset.x)) ? leftSphere.latticeIndex : rightSphere.latticeIndex ;

              var _initPos_1;
              var _initPos_2;

              if( leftLatticePointIndex === leftSphere.latticeIndex ){  
                var L = _3_4 + leftSphere.userOffset.x - rightSphere.userOffset.x ;
                _initPos_1 = this.initialCellPositions(leftSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(rightSphere.latticeIndex) ;

              }
              else if( leftLatticePointIndex === rightSphere.latticeIndex ){ 
                var L = -1*_3_4 + rightSphere.userOffset.x - leftSphere.userOffset.x ;
                _initPos_1 = this.initialCellPositions(rightSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(leftSphere.latticeIndex) ;
              }
   
              var parameters = this.cellParameters; 
              var parameterKeys = [ 'alpha' , 'gamma']; 

              _.each(parameterKeys, function(k) {   
                if (_.isUndefined(parameters[k]) === false) { 
                  var argument = {};
                   
                  argument[k] = parseFloat(parameters[k]);
                    
                  var matrix = transformationMatrix(argument); 
                   
                  _initPos_1.applyMatrix4(matrix); 
                  _initPos_2.applyMatrix4(matrix); 
                  
                }
              }); 

              var ab, Xn2, Xn1;

              if(_initPos_2.y === 0){
                Xn1 = ( L * _initPos_1.y - _initPos_2.x * _initPos_1.y + _initPos_1.x * _initPos_2.y) / (_initPos_2.y - _initPos_1.y);

                ab = ( Xn1 - _initPos_1.x ) / _initPos_1.y ;
              }
              else{
                Xn2 = ( L * _initPos_2.y + _initPos_1.x * _initPos_2.y - _initPos_2.x * _initPos_1.y ) / (_initPos_2.y - _initPos_1.y);

                ab = ( Xn2 - _initPos_2.x ) / _initPos_2.y ;
              }
  
              var atan_ab = Math.atan(ab) ;
               
              beta =  90 - atan_ab * 180 / Math.PI ; 
                 
              return { 'offset': (beta-this.cellParameters.beta) } ;
            }
            else if( angleName === 'alpha'){
              if(rightSphere.object3d.position.z < leftSphere.object3d.position.z){ 
                rightSphere = this.unitCellAtoms[j] ;
                leftSphere = this.unitCellAtoms[i] ; 
              }
              var _1_2 = Math.abs( leftSphere.object3d.position.y - rightSphere.object3d.position.y );
              var _1_4 = leftSphere.getRadius() + rightSphere.getRadius();  
              var _2_4 = Math.sqrt( _1_4 * _1_4 - _1_2 * _1_2 );

              var _2_3 = Math.abs(leftSphere.object3d.position.x - rightSphere.object3d.position.x);
              var _3_4 = Math.sqrt( _2_4 * _2_4 - _2_3 * _2_3 );
  
              var leftLatticePointIndex = ((leftSphere.object3d.position.z - leftSphere.userOffset.z) < (rightSphere.object3d.position.z - rightSphere.userOffset.z)) ? leftSphere.latticeIndex : rightSphere.latticeIndex ;

              var _initPos_2;
              var _initPos_1;

              if( leftLatticePointIndex === leftSphere.latticeIndex ){
                var L = _3_4 + leftSphere.userOffset.z - rightSphere.userOffset.z ;
                _initPos_1 = this.initialCellPositions(leftSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(rightSphere.latticeIndex) ;
              }
              else if( leftLatticePointIndex === rightSphere.latticeIndex ){
                var L = -1 * _3_4 + rightSphere.userOffset.z - leftSphere.userOffset.z ;
                _initPos_1 = this.initialCellPositions(rightSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(leftSphere.latticeIndex) ;
              }  

              var parameters = this.cellParameters; 
              var parameterKeys = [ 'beta' , 'gamma']; 

              _.each(parameterKeys, function(k) {   
                if (_.isUndefined(parameters[k]) === false) { 
                  var argument = {};
                   
                  argument[k] = parseFloat(parameters[k]);
                    
                  var matrix = transformationMatrix(argument); 
                   
                  _initPos_1.applyMatrix4(matrix); 
                  _initPos_2.applyMatrix4(matrix); 
                  
                }
              });
 
              var Zn2,Zn1; 
              var bc;
 
              if(_initPos_2.y === 0){
                Zn1 = ( L * _initPos_1.y + _initPos_1.z * _initPos_2.y - _initPos_2.z * _initPos_1.y ) / ( _initPos_2.y - _initPos_1.y) ;
                bc = ( Zn1 - _initPos_1.z ) / _initPos_1.y ;
              }
              else{
                Zn2 = ( L * _initPos_2.y + _initPos_2.y * _initPos_1.z - _initPos_1.y * _initPos_2.z ) / ( _initPos_2.y - _initPos_1.y) ;
                bc = ( Zn2 - _initPos_2.z ) / _initPos_2.y ; 
              } 

              var bc = Math.atan(bc) ; 

              alpha =  90 - bc * 180 / Math.PI ; 
  
              return {'offset': (alpha-this.cellParameters.alpha), } ;
            }
            else if( angleName === 'gamma'){
              if(rightSphere.object3d.position.x < leftSphere.object3d.position.x){
                // swap because we want to have the "right" atom in Xn2 so Xn2 - Xn1 = L > 0
                rightSphere = this.unitCellAtoms[j] ;
                leftSphere = this.unitCellAtoms[i] ; 
              }
              var _1_2 = Math.abs( leftSphere.object3d.position.y - rightSphere.object3d.position.y );
              var _1_4 = leftSphere.getRadius() + rightSphere.getRadius();  
              var _2_4 = Math.sqrt( _1_4 * _1_4 - _1_2 * _1_2 );
              var _2_3 = Math.abs(leftSphere.object3d.position.z - rightSphere.object3d.position.z);
              var _3_4 = Math.sqrt( _2_4 * _2_4 - _2_3 * _2_3 );
  
              var leftLatticePointIndex = ((leftSphere.object3d.position.x - leftSphere.userOffset.x) <= (rightSphere.object3d.position.x - rightSphere.userOffset.x)) ? leftSphere.latticeIndex : rightSphere.latticeIndex ;

              var _initPos_2;
              var _initPos_1;
  
              if( leftLatticePointIndex === leftSphere.latticeIndex ){  
                var L = _3_4 + leftSphere.userOffset.x - rightSphere.userOffset.x ;
                _initPos_1 = this.initialCellPositions(leftSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(rightSphere.latticeIndex) ;

              }
              else if( leftLatticePointIndex === rightSphere.latticeIndex ){ 
                var L = -1*_3_4 + rightSphere.userOffset.x - leftSphere.userOffset.x ;
                _initPos_1 = this.initialCellPositions(rightSphere.latticeIndex) ;
                _initPos_2 = this.initialCellPositions(leftSphere.latticeIndex) ;
              }

              var parameters = this.cellParameters; 
              var parameterKeys = [ 'alpha' , 'beta']; 

              _.each(parameterKeys, function(k) {   
                if (_.isUndefined(parameters[k]) === false) { 
                  var argument = {};
                   
                  argument[k] = parseFloat(parameters[k]);
                    
                  var matrix = transformationMatrix(argument); 
                   
                  _initPos_1.applyMatrix4(matrix); 
                  _initPos_2.applyMatrix4(matrix); 
                  
                }
              });
 
              var Xn2, Xn1 ; 
              var ac;

              if(_initPos_2.z === 0){ 
                Xn1 = (  L * _initPos_1.z - _initPos_2.x * _initPos_1.z + _initPos_1.x * _initPos_2.z) / (_initPos_2.z - _initPos_1.z);
                ac = ( Xn1 - _initPos_1.x ) / _initPos_1.z ;
              }
              else{
                Xn2 = ( _initPos_1.x * _initPos_2.z + L * _initPos_2.z - _initPos_2.x * _initPos_1.z ) / (_initPos_2.z - _initPos_1.z);
                ac = ( Xn2 - _initPos_2.x ) / _initPos_2.z ;
              }
  
              var atan_ac = Math.atan(ac) ;
               
              gamma =  90 - atan_ac * 180 / Math.PI ;  
 
              return {'offset': (gamma-this.cellParameters.gamma), } ;
            }

            // exit loop
            j = -1 ;
            i = -1 ;

          } 
        } 
      } 
    }  
    return {'offset': -1000000, 'normalize': false} ;
  };
  Motifeditor.prototype.fixAngles = function(angleName, a, b, thirdPoint){ 
    var _this = this, offset = 0 ;  
    var rA = a.getRadius();
    var rB = b.getRadius();
      
    var rPos = new THREE.Vector3(a.object3d.position.x, a.object3d.position.y, a.object3d.position.z);
    var lPos = new THREE.Vector3(b.object3d.position.x, b.object3d.position.y, b.object3d.position.z);
    var bBrPos = new THREE.Vector3(thirdPoint.object3d.position.x, thirdPoint.object3d.position.y, thirdPoint.object3d.position.z);
     
    //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xffffff );        // a to b : white
    //this.lineHelper( new THREE.Vector3(bBrPos.x,bBrPos.y,bBrPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xFF0000 );  // brotherOfB to b  : red
    //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(bBrPos.x,bBrPos.y,bBrPos.z) , 0x00FF00 );  // a to brotherOfB  :  green 
 

  };
  function compareWithHighPrecision(a,b){ // compare with high precision but not with absolute equality
    var precision = 0.000000001, r = false;
    var x = Math.abs(a-b);
    if(x<precision) r = true;
    return r;
  };

  var aAtomIndex, bAtomIndex;
 
  Motifeditor.prototype.fixLengths = function(axis, a, b, brotherOfb, withAngles){ 
    var _this = this, sign = 1, offset = 0 ;  
    var rA = a.getRadius();
    var rB = b.getRadius();
      
    var rPos = new THREE.Vector3(a.object3d.position.x, a.object3d.position.y, a.object3d.position.z);
    var lPos = new THREE.Vector3(b.object3d.position.x, b.object3d.position.y, b.object3d.position.z);
    var bBrPos = new THREE.Vector3(brotherOfb.object3d.position.x, brotherOfb.object3d.position.y, brotherOfb.object3d.position.z);
     
    //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xffffff );        // a to b : white
    //this.lineHelper( new THREE.Vector3(bBrPos.x,bBrPos.y,bBrPos.z), new THREE.Vector3(lPos.x,lPos.y,lPos.z) , 0xFF0000 );  // brotherOfB to b  : red
    //this.lineHelper( new THREE.Vector3(rPos.x,rPos.y,rPos.z), new THREE.Vector3(bBrPos.x,bBrPos.y,bBrPos.z) , 0x00FF00 );  // a to brotherOfB  :  green  
    
    var cVector = new THREE.Vector3( rPos.x - bBrPos.x, rPos.y - bBrPos.y, rPos.z - bBrPos.z); 
    var aVector = new THREE.Vector3( lPos.x - bBrPos.x, lPos.y - bBrPos.y, lPos.z - bBrPos.z);
    var bVector = new THREE.Vector3( lPos.x - rPos.x, lPos.y - rPos.y, lPos.z - rPos.z);
    
    var caseNoTriangle = compareWithHighPrecision((cVector.length() + aVector.length()), bVector.length() );
    if(!caseNoTriangle) caseNoTriangle = compareWithHighPrecision((cVector.length() + bVector.length()), aVector.length() );
    if(!caseNoTriangle) caseNoTriangle = compareWithHighPrecision((aVector.length() + bVector.length()), cVector.length() );
          
    if( caseNoTriangle ){  
      //  cases : 1. one atom in motif, 2. the collided atoms have their center on the same axis so triangle is not created ( ekfilismeno trigwno)
      var offset = ( rA + rB -  rPos.distanceTo(lPos) ) ;
      aVector.setLength(aVector.length() + offset);  
    }
    else{  
       
      var bSideLength = rA + rB;
       
      var cSideLength = cVector.length();
      var betaAngleRad = cVector.angleTo(aVector)
      
      var cAngleSin = cSideLength * Math.sin(betaAngleRad) / bSideLength ;
      var gammaAngleRad = Math.asin(cAngleSin);
      gammaAngleRad = (gammaAngleRad>Math.PI/2) ? (Math.PI - gammaAngleRad) : (gammaAngleRad) ;

      var alphaAngleRad = Math.PI - gammaAngleRad - betaAngleRad; 
      var aSideLength = bSideLength * Math.sin(alphaAngleRad) / Math.sin(betaAngleRad) ;

      var offset = aSideLength - aVector.length()  ;
      aVector.setLength(aVector.length() + offset);
 
    } 
  
    if(withAngles){   
      _.each(reverseShearing, function(k) {
        if (_.isUndefined(_this.cellParameters[k]) === false) { 
          var argument = {};
          argument[k] = -1 * parseFloat(_this.cellParameters[k]); 
          var matrix = transformationMatrix(argument);  
          aVector.applyMatrix4(matrix);  
        }
      });  
    }  

    if(axis === 'x') return (aVector.length() - this.cellParameters.scaleX);
    if(axis === 'y') return (aVector.length() - this.cellParameters.scaleY);
    if(axis === 'z') return (aVector.length() - this.cellParameters.scaleZ);
       
  }; 
  Motifeditor.prototype.fakeCollision = function(axis, motifHelper, motifCenter){
    
    var _this = this;
    
    var offset = -1, i = 0, j =0;
  
    while(i<motifHelper.length) {
      j = 0;   
      while(j<_this.motifsAtoms.length) {  
        var a = motifHelper[i].object3d.position.clone();
         
        var b = new THREE.Vector3(_this.motifsAtoms[j].object3d.position.x, _this.motifsAtoms[j].object3d.position.y, _this.motifsAtoms[j].object3d.position.z) ;
        var realDistance = parseFloat( (a.distanceTo(b)).toFixed(parseInt(10)) );
        var calculatedDistance = parseFloat( (_this.motifsAtoms[j].getRadius() + motifHelper[i].getRadius()).toFixed(parseInt(10)) ) ;  
        
        if (realDistance < calculatedDistance){   
           
          var val; 
          var bortherPos = new THREE.Vector3(motifCenter.x + b.x, motifCenter.y + b.y, motifCenter.z + b.z ); 
   
          var rA = motifHelper[i].getRadius();
          var rB = this.motifsAtoms[j].getRadius(); 

          var offset = this.fixLengths(
            axis, 
            {
              "object3d" : {
                "position" : {
                  "x": a.x, 
                  "y": a.y, 
                  "z": a.z, 
                }
              }, 
              getRadius: function() { return rA; }
            },  
            {
              "object3d" : {
                "position" : {
                  "x": b.x, 
                  "y": b.y, 
                  "z": b.z, 
                }
              }, 
              getRadius: function() { return rB; }
            }, 
            {
              "object3d" : {
                "position" : {
                  "x": bortherPos.x, 
                  "y": bortherPos.y, 
                  "z": bortherPos.z 
                }
              }, 
              getRadius: function() { return rB; }
            },
            true 
          ); 
          j = 100000;
          i = 100000;  
        }  
        j++;
      } 
      i++;
    };  
    return {'offset': offset } ; 

  }; 
  Motifeditor.prototype.fakeFixAtomPosition = function(helperAtom, otherAtom,axis){
    var _this = this, sign = 1; 

    var movingSpherePosition = helperAtom.object3d.position.clone();

    var collisionSpherePosition = new THREE.Vector3( otherAtom.object3d.position.x, otherAtom.object3d.position.y, otherAtom.object3d.position.z );
  
    var realTimeHypotenuse = collisionSpherePosition.distanceTo(movingSpherePosition);
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
    if(this.unitCellAtoms.length === 0){
      return;
    }
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
  }; 
  Motifeditor.prototype.renderingModeChange = function(arg){ 

    this.renderingMode = arg.mode;

    if(arg.mode === 'wireframe'){
      this.menu.editMEInputs( { 'opacity' : 0} );
      if(this.unitCellAtoms.length !== 0 ){
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
          this.unitCellAtoms[i].wireframeMat(true);
        } 
      }
    }
    else if(arg.mode === 'toon'){ 
      if(this.unitCellAtoms.length !== 0 ){ 
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
          this.unitCellAtoms[i].wireframeMat(false);
        } 
      }
      for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
        this.unitCellAtoms[i].coonMode(true);
      }
    }
    else if(arg.mode === 'flat'){
      if(this.unitCellAtoms.length !== 0 ){ 
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
            this.unitCellAtoms[i].wireframeMat(false);
          } 
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
          this.unitCellAtoms[i].flatMode(true);
        } 
      }
    }
    else if(arg.mode === 'realistic'){
      if(this.unitCellAtoms.length !== 0 ){ 
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
            this.unitCellAtoms[i].wireframeMat(false);
          }  
        for (var i = 0, len = this.unitCellAtoms.length; i < len; i++) {
          this.unitCellAtoms[i].realisticMode(true);
        } 
      }
    }
  };
  Motifeditor.prototype.offsetMotifsForViews = function(mode){
    var atoms = [], j =0;
    if(mode === 'cellClassic'){
      return atoms;
    }
    var i=0;

    var globMat;
     
    if(this.latticeType === 'face'){
      var arr = [{a : 0, b : 1},{a : 1, b : 0},{a : 0, b : -1},{a : -1, b : 0}];
      var halfX = this.cellParameters.scaleX * 0.5;
      var halfY = this.cellParameters.scaleY * 0.5;
      var halfZ = this.cellParameters.scaleZ * 0.5;

      var leftPos = new THREE.Vector3(0, halfY, halfZ);
      var rightPos = new THREE.Vector3(this.cellParameters.scaleX, halfY, halfZ);
      var frontPos = new THREE.Vector3(halfX, halfY, this.cellParameters.scaleZ);
      var backPos = new THREE.Vector3(halfX, halfY, 0);
      var upPos = new THREE.Vector3(halfX, this.cellParameters.scaleY, halfZ);
      var downPos = new THREE.Vector3(halfX, 0, halfZ);

      while(j <this.motifsAtoms.length) {
        var p = this.motifsAtoms[j].object3d.position.clone();
        if(this.renderingMode === 'wireframe') { 
          globMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color : this.motifsAtoms[j].color, wireframe: true, opacity:0}) ; 
        }
        else if(this.renderingMode === 'realistic'){ 
          globMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: this.motifsAtoms[j].color, transparent:true, opacity:this.motifsAtoms[j].opacity }) ; 
        }
        else{ 
          globMat = new THREE.MeshLambertMaterial({  color: this.motifsAtoms[j].color, transparent:true, opacity: this.motifsAtoms[j].opacity }) ; 
        }  

        var radius = this.motifsAtoms[j].radius;
        console.log(radius);
        for ( i = 0; i < 4; i ++ ) {
          var replicaAtomLeft = new THREE.Mesh( new THREE.SphereGeometry(radius,32, 32), globMat ); 
          replicaAtomLeft.position.set(p.x + leftPos.x,p.y + leftPos.y,p.z + leftPos.z); 
          replicaAtomLeft.position.z += ( arr[i].a * this.cellParameters.scaleZ );
          replicaAtomLeft.position.y += ( arr[i].b * this.cellParameters.scaleY ); 
          atoms.push(replicaAtomLeft);
          
          var replicaAtomRight = new THREE.Mesh( new THREE.SphereGeometry(radius,32, 32), globMat ); 
          replicaAtomRight.position.set(p.x + rightPos.x,p.y + rightPos.y,p.z + rightPos.z);
          replicaAtomRight.position.z += ( arr[i].a * this.cellParameters.scaleZ );
          replicaAtomRight.position.y += ( arr[i].b * this.cellParameters.scaleY ); 
          atoms.push(replicaAtomRight);

          var replicaAtomFront = new THREE.Mesh( new THREE.SphereGeometry(radius,32, 32), globMat ); 
          replicaAtomFront.position.set(p.x + frontPos.x,p.y + frontPos.y,p.z + frontPos.z);
          replicaAtomFront.position.x += ( arr[i].a * this.cellParameters.scaleX );
          replicaAtomFront.position.y += ( arr[i].b * this.cellParameters.scaleY ); 
          atoms.push(replicaAtomFront);

          var replicaAtomBack = new THREE.Mesh( new THREE.SphereGeometry(radius,32, 32), globMat ); 
          replicaAtomBack.position.set(p.x + backPos.x,p.y + backPos.y,p.z + backPos.z);
          replicaAtomBack.position.x += ( arr[i].a * this.cellParameters.scaleX );
          replicaAtomBack.position.y += ( arr[i].b * this.cellParameters.scaleY ); 
          atoms.push(replicaAtomBack);

          var replicaAtomUp = new THREE.Mesh( new THREE.SphereGeometry(radius,32, 32), globMat ); 
          replicaAtomUp.position.set(p.x + upPos.x,p.y + upPos.y,p.z + upPos.z);
          replicaAtomUp.position.z += ( arr[i].a * this.cellParameters.scaleZ );
          replicaAtomUp.position.x += ( arr[i].b * this.cellParameters.scaleX ); 
          atoms.push(replicaAtomUp);

          var replicaAtomDown = new THREE.Mesh( new THREE.SphereGeometry(radius,32, 32), globMat ); 
          replicaAtomDown.position.set(p.x + downPos.x,p.y + downPos.y,p.z + downPos.z);
          replicaAtomDown.position.z += ( arr[i].a * this.cellParameters.scaleZ );
          replicaAtomDown.position.x += ( arr[i].b * this.cellParameters.scaleX ); 
          atoms.push(replicaAtomDown);

        }
        j++;
      }
      
    }
    else if(this.latticeType === 'base'){

    }
    else if(this.latticeType === 'body'){

    }
    console.log(atoms);
    return atoms;
 
  }; 
  Motifeditor.prototype.subtractedSolidView = function(box, mesh) {
    var _this = this; 
 
    var cube = THREE.CSG.toCSG(box);
    cube = cube.inverse();
    var sphere = THREE.CSG.toCSG(mesh);
    var geometry = sphere.intersect(cube);
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);
    
    var sphereCut = new THREE.Mesh( finalGeom, mesh.material.clone()); 
    sphereCut.receiveShadow = true; 
    sphereCut.castShadow = true; 
    
    return sphereCut;

  };
  Motifeditor.prototype.setCSGmode = function(arg){ 
    var _this = this, i = 0;
     
    this.viewState = arg.mode;
 
    var g = this.customBox(this.unitCellPositions, this.latticeName);

    var box = new THREE.Mesh( g, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: "#FF0000"}) );
    var scene = UnitCellExplorer.getInstance().object3d;
    var helperMotifs = this.offsetMotifsForViews(this.viewState);

    if(this.viewState === 'cellSubstracted'){
      while(i < this.unitCellAtoms.length ) {
        this.unitCellAtoms[i].object3d.visible = true; 
        this.unitCellAtoms[i].subtractedSolidView(box, this.unitCellAtoms[i].object3d.position); 
    
        i++;
      } 
       
      i =0;

      while(i < helperMotifs.length ) {
         
        var mesh_ = this.subtractedSolidView(box, helperMotifs[i]); 
        mesh_.name = 'cellSubstracted'; 
        scene.add(mesh_); 
        i++;
      } 
      
      var object = scene.getObjectByName('solidvoid');
      if(!_.isUndefined(object)) scene.remove(object);
      PubSub.publish(events.VIEW_STATE,"Subtracted");  
    }
    else if(this.viewState === 'cellSolidVoid'){  

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
    else if(this.viewState === 'cellGradeLimited'){ 
       
      var box = new THREE.Mesh(g, new THREE.MeshBasicMaterial({side: THREE.DoubleSide,transparent:true, opacity:0.2, color:0xFF0000}));
      box.visible = false;
      
      // find geometry's center
      var centroid = new THREE.Vector3(); 
      for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
        centroid.add( g.vertices[ z ] ); 
      }  
      centroid.divideScalar( g.vertices.length );
       
      UnitCellExplorer.add({'object3d' : box }); 

      var collidableMeshList = [] ;
      collidableMeshList.push(box);
        
      i=0;
       

      while(i < this.unitCellAtoms.length ) {    

        // workaround for points that are exactly on the grade (faces, cell points)
        var smartOffset = centroid.clone().sub(this.unitCellAtoms[i].object3d.position.clone());
        smartOffset.setLength(0.01);
        var originPointF = this.unitCellAtoms[i].object3d.position.clone().add(smartOffset);
        //

        var dir = new THREE.Vector3(1,1000000,1);  
        var rayF = new THREE.Raycaster( originPointF, dir.clone().normalize() );
        var collisionResultsF = rayF.intersectObjects( collidableMeshList );
 
        var touches = true ;
        var radius = this.unitCellAtoms[i].getRadius() ; 

        if(collisionResultsF.length !== 1){ // case its center is not fully inside (if it is nothing happens and it remains visible)
  
          var vertexIndex = this.unitCellAtoms[i].object3d.children[0].geometry.vertices.length-1;
          var atomCentre = this.unitCellAtoms[i].object3d.position.clone();

          while( vertexIndex >= 0 )
          {     
            var localVertex = this.unitCellAtoms[i].object3d.children[0].geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(this.unitCellAtoms[i].object3d.matrixWorld);
            var directionVector = globalVertex.sub( originPointF );     
            
            var ray = new THREE.Raycaster( originPointF, directionVector.clone().normalize() );
            
            var collisionResults = ray.intersectObjects( collidableMeshList );
               
            if( (collisionResults.length >= 1) &&  (collisionResults[0].distance <= radius) ) {
              vertexIndex = -2;   
            }
            vertexIndex--;
            if(vertexIndex === -1) touches = false;
          }  
          if(!touches) {
            this.unitCellAtoms[i].object3d.visible = false ;
          }
        } 
        this.unitCellAtoms[i].GradeLimited();
        i++;   
      } 
      UnitCellExplorer.remove({'object3d' : box }); 

      PubSub.publish(events.VIEW_STATE,"GradeLimited"); 
    }
    else if(this.viewState === 'cellClassic'){ 
      while(i < this.unitCellAtoms.length ) { 
        this.unitCellAtoms[i].object3d.visible = true;
        this.unitCellAtoms[i].classicView(); 
        i++;
      }  
      var object = scene.getObjectByName('solidvoid');
      if(!_.isUndefined(object)) {
        scene.remove(object);
      }
      PubSub.publish(events.VIEW_STATE,"Classic");
    };
  };

  function assignUVs( geometry ){ 
     
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

    if( this.latticeSystem === 'hexagonal' && this.latticeType === 'hexagonal') return; // it can never be something else
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
  Motifeditor.prototype.padlockMode = function(arg, restore){
    var _this = this, i=0;   
    
    this.padlock = arg.padlock;
    this.setUIPadlock(arg.padlock);
     
    if(arg.padlock === false) { 
      if(restore === true){
        this.cellParameters.alpha = parseInt($("#alpha").val());
        this.cellParameters.beta  = parseInt($("#beta").val());
        this.cellParameters.gamma = parseInt($("#gamma").val());
      } 
    }
    else {  

      this.menu.disableMEInputs(
        {
          'tangency' : false
        }
      );

      this.menu.editMEInputs(
        {
          'tangency' : true
        }
      );

      this.globalTangency = true ;
      this.cellParameters.alpha = this.initialLatticeParams.alpha ;
      this.cellParameters.beta  = this.initialLatticeParams.beta ;
      this.cellParameters.gamma = this.initialLatticeParams.gamma ;
       
      // for volume reduce functionality
      this.cellVolume.xInitVal = this.cellParameters.scaleX;
      this.cellVolume.yInitVal = this.cellParameters.scaleY;
      this.cellVolume.zInitVal = this.cellParameters.scaleZ;  
       // for volume reduce functionality 
      this.initVolumeState(); 
    }

    // volume reducing functionality 

    this.editorState.fixed = arg.padlock; // keep .fixed var for future uses
 
    var sz ;
    if(_this.latticeName === 'hexagonal'){ 
      sz = this.cellParameters.scaleX;

    }
    else{ 
      sz = this.cellParameters.scaleZ; 
    }  

    this.menu.disableMEInputs(
      {
        'cellVolume' : !arg.padlock
      }
    );

    this.menu.editMEInputs(
      {
        'scaleX' : this.cellParameters.scaleX,
        'scaleY' : this.cellParameters.scaleY, 
        'scaleZ' : sz 
      }
    );

  }; 

  Motifeditor.prototype.initVolumeState = function(){   

    if(this.padlock === true || this.globalTangency === true){
      this.leastVolume();
         
      $("#cellVolume").val(100);   
      this.menu.setSliderValue("cellVolume", 100 );  

      this.cellVolume.xInitVal = this.cellParameters.scaleX;
      this.cellVolume.yInitVal = this.cellParameters.scaleY;
      this.cellVolume.zInitVal = this.cellParameters.scaleZ;
    }

  };
  Motifeditor.prototype.removeFromUnitCell = function( id ){  //
    var _this = this, pos = [];  

    for (var i = 0; i<this.unitCellAtoms.length; i++) {
      if(this.unitCellAtoms[i].getID() === id ){
        this.unitCellAtoms[i].destroy();
        pos.push(i); 
      } 
    } 
    for (var i = pos.length - 1; i>= 0; i--) {
      this.unitCellAtoms.splice(pos[i],1);;
    }   
 
  };  

  Motifeditor.prototype.colorUnitCellAtoms = function(id, color){   
    var _this = this; 
    for (var i = 0; i<this.unitCellAtoms.length; i++) { 
      if(this.unitCellAtoms[i].myID === id ){ 
        this.unitCellAtoms[i].setMaterial(color, this.renderingMode);
      }
    }
  }; 
  Motifeditor.prototype.unitCellAtomsWireframe = function(id, bool){   
    var _this = this; 
    for (var i = 0; i<this.unitCellAtoms.length; i++) { 
      if(this.unitCellAtoms[i].myID === id ){ 
        this.unitCellAtoms[i].wireframeMat(bool);
      }
    }
  };
  Motifeditor.prototype.unitCellAtomsTexture = function(id, texture){   
    var _this = this; 
    for (var i = 0; i<_this.unitCellAtoms.length; i++) { 
      if(this.unitCellAtoms[i].myID === id ){
        this.unitCellAtoms[i].setMaterialTexture(texture);
      }
    }
  };
  Motifeditor.prototype.unitCellAtomsOpacity = function(id, opacity){   
    var _this = this; 
    for (var i = 0; i<this.unitCellAtoms.length; i++) { 
      if(this.unitCellAtoms[i].myID === id ){
        this.unitCellAtoms[i].setOpacity(opacity, this.renderingMode);
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
    
    if(_.isUndefined(dimensions)) {
      return ;
    }

    var _this = this, dims = { xDim : dimensions.xDim, yDim : dimensions.yDim, zDim : dimensions.zDim } ;
       
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
        else if(_this.motifsAtoms.length >= 1){ // the second atom has not been added to the array yet, so we compare to 1 
          if(_this.latticeType === 'primitive'){
            dims.xDim = dims.yDim = dims.zDim = LL ; 
          }
          else if(_this.latticeType === 'face'){
            dims.xDim = dims.yDim = dims.zDim = 2 * LL ; 
          }
          else if(_this.latticeType === 'body'){
            dims.xDim = dims.yDim = dims.zDim = 2 * LL;
          } 
        } 
      break;

      case "tetragonal": 
        if(_this.motifsAtoms.length === 0){
          if(_this.latticeType === 'primitive'){ 
            dims.yDim *= 1.3 ; 
          }
          else if(_this.latticeType === 'body'){
            dims.xDim = dims.zDim = (2/Math.sqrt(3)) * dimensions.xDim ;
            dims.yDim = 1.3 * (2/Math.sqrt(3)) * dimensions.xDim ;
          } 
        }
        else if(_this.motifsAtoms.length >= 1){
          if(_this.latticeType === 'primitive'){ 
            dims.xDim = dims.zDim = LL;
            dims.yDim = 1.3 * LL ;
          }
          else if(_this.latticeType === 'body'){
            dims.xDim = dims.zDim = dims.zDim = 2 * LL;
            dims.yDim = 1.3 * 2 * LL;
          } 
        } 
      break;

      case "orthorhombic": 
        if(_this.motifsAtoms.length === 0){
          if(_this.latticeType === 'primitive'){ 
            dims.zDim = LL ;
            dims.xDim = 1.1 * LL;
            dims.yDim = 1.2 * LL;
          }
          else if(_this.latticeType === 'face'){  
            dims.xDim = Math.sqrt(2) * dimensions.xDim * 1.1 ;
            dims.yDim = Math.sqrt(2) * dimensions.yDim * 1.2 ;
            dims.zDim = Math.sqrt(2) * dimensions.zDim   ;
          }
          else if(_this.latticeType === 'body'){ 
            dims.zDim = (2/Math.sqrt(3)) * dimensions.zDim 
            dims.xDim = (2/Math.sqrt(3)) * dimensions.xDim * 1.1 ;
            dims.yDim = (2/Math.sqrt(3)) * dimensions.yDim * 1.2 ;
          } 
          else if(_this.latticeType === 'base'){ 
            dims.zDim = Math.sqrt(2) * dims.zDim ;
            dims.xDim = Math.sqrt(2) * dims.xDim * 1.1;
            dims.yDim = Math.sqrt(2) * dims.yDim * 1.2 ;
          } 
        }
        else if(_this.motifsAtoms.length >= 1){ 
          dims.zDim = 2 * 1.2 * LL;
          dims.xDim = 2 * 1.1 * LL;
          dims.yDim = 2 * 1.3 * LL;  
        }  
      break;

      case "hexagonal": 
        if( this.latticeType === 'primitive'){
          if(_this.motifsAtoms.length === 0){ 
            dims.xDim = dims.yDim = dims.zDim = LL ; 
          }
          else if(_this.motifsAtoms.length >= 1){
            dims.xDim = dims.yDim = dims.zDim = LL*1.5 ;  
          } 
        }
        else if( this.latticeType === 'hexagonal'){  
          if(_this.motifsAtoms.length >= 1){ 
           
            dims.xDim = dims.zDim = this.findHexTangentLengths(dims);  
          }
        }
      break;

      case "rhombohedral": 
        if(_this.motifsAtoms.length === 0){ 
          dims.xDim = dims.yDim = dims.zDim = LL ; 
        }
        else if(_this.motifsAtoms.length >= 1){
          dims.xDim = dims.yDim = dims.zDim = LL*1.5 ;  
        } 
      break;

      case "monoclinic": 
        if(_this.motifsAtoms.length === 0){ 
          if(_this.latticeType === 'primitive'){ 
            dims.zDim = LL;
            dims.xDim = 1.1 * LL;
            dims.yDim = 1.2 * LL; 
          }
          else if(_this.latticeType === 'base'){ 
            dims.zDim = Math.sqrt(2) * dims.zDim ;
            dims.xDim = Math.sqrt(2) * dims.xDim * 1.1;
            dims.yDim = Math.sqrt(2) * dims.yDim * 1.2 ;
          }
        }
        else if(_this.motifsAtoms.length >= 1){
          if(_this.latticeType === 'primitive'){
            dims.zDim = LL;
            dims.xDim = 1.1 * LL;
            dims.yDim = 1.2 * LL; 
          }  
          else if(_this.latticeType === 'base'){ 
            dims.zDim = 2 * 1.1 * LL;
            dims.xDim = 2 * LL;
            dims.yDim = LL;
          } 
        }
         
      break;

      case "triclinic": 
        if(_this.motifsAtoms.length === 0){ 
          dims.zDim = LL;
          dims.xDim = 1.1 * LL;
          dims.yDim = 1.2 * LL; 

        }
        else if(_this.motifsAtoms.length >= 1){ 
          dims.zDim = LL;
          dims.xDim = 1.1 * LL;
          dims.yDim = 1.2 * LL;  
        } 
      break;
  
    } 
        
    return dims;
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Angle Handling - lattice.js code
  Motifeditor.prototype.cellPointsWithScaling = function(_dimensions, recreate, _manual){ 
    var _this = this; 

    var dimensions;

    if( (!this.padlock && !this.globalTangency ) || _manual !== undefined){
      dimensions = _dimensions ;  
    }
    else{  
      dimensions = this.calcABCforParticularCases(_dimensions); 
   
      // store initial values for reduce volume feature
      if(!(_dimensions.xDim === 1 && _dimensions.xDim && _dimensions.xDim) ){  
        this.cellVolume.xInitVal = dimensions.xDim;
        this.cellVolume.yInitVal = dimensions.yDim;
        this.cellVolume.zInitVal = dimensions.zDim;  
      }
    } 
     
    this.cellParameters.scaleX = dimensions.xDim;
    this.cellParameters.scaleY = dimensions.yDim;
    this.cellParameters.scaleZ = dimensions.zDim;

    if( (this.latticeSystem === 'hexagonal'  && this.latticeType === 'hexagonal')){

      var a = _this.cellParameters.scaleZ ;
      var c = _this.cellParameters.scaleY ; 

      var vertDist = a * Math.sqrt(3);

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

                if(recreate){
                  _this.unitCellPositions[reference] = {"position" : new THREE.Vector3( position.x, position.y, position.z), "latticeIndex" : reference} ;  
                  _this.unitCellPositions[referenceC] = {"position" : new THREE.Vector3( positionC.x, positionC.y, positionC.z), "latticeIndex" : referenceC} ;  
                }
                else{
                 // _this.unitCellPositions[reference].position = new THREE.Vector3( position.x, position.y, position.z) ;
                  //_this.unitCellPositions[referenceC].position = new THREE.Vector3( positionC.x, positionC.y, positionC.z) ;
                } 
              }    
            });
          });
        });
      }); 
    }
    else{  
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
    }
  };  
  Motifeditor.prototype.initialCellPositions = function(latticeIndex){ 
    var _this = this; 
    var unitCellPositions = {};
    var dimensions = { xDim : this.cellParameters.scaleX,  yDim : this.cellParameters.scaleY,  zDim : this.cellParameters.scaleZ};

    switch(this.latticeType) {
      case "primitive":    
        _.times(2 , function(_x) {
          _.times(2 , function(_y) {
            _.times(2 , function(_z) { 
              unitCellPositions["_"+_x+_y+_z] = {
                "position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), 
                "latticeIndex" : "_"+_x+_y+_z 
              } ;  
               
            });
          });
        }); 
        break;
      case "face":   
        _.times(2 , function(_x) {
          _.times(2 , function(_y) {
            _.times(2 , function(_z) { 
              unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
            });
          });
        }); 
        for (var i = 0; i <= 1; i ++) { 
          unitCellPositions["_"+i] = {"position" : new THREE.Vector3( dimensions.xDim *i, dimensions.yDim *0.5, dimensions.zDim *0.5), "latticeIndex" : "_"+i } ;  
          unitCellPositions["__"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *i, dimensions.zDim *0.5), "latticeIndex" : "__"+i } ;  
          unitCellPositions["___"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *0.5, dimensions.zDim *i), "latticeIndex" : "___"+i } ;   
        };
        break;
      case "body":   
        _.times(2 , function(_x) {
          _.times(2 , function(_y) {
            _.times(2 , function(_z) { 
              unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3(  dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;   
            });
          });
        }); 
        
        unitCellPositions["_c"] = {"position" : new THREE.Vector3( (1/2) * dimensions.xDim , (1/2) * dimensions.yDim , (1/2) * dimensions.zDim ), "latticeIndex" : '_c' } ;  
        break;
      case "base":   
        _.times(2 , function(_x) {
          _.times(2 , function(_y) {
            _.times(2 , function(_z) { 
              unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x,  dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
            });
          });
        });   

        unitCellPositions["_up"] = {"position" : new THREE.Vector3( dimensions.xDim /2 ,  dimensions.yDim , dimensions.zDim /2 ), "latticeIndex" : "_up" } ;  
        unitCellPositions["_down"] = {"position" : new THREE.Vector3( dimensions.xDim /2, 0 ,  dimensions.zDim /2), "latticeIndex" : "_down" } ;  
        break; 
    } 
    
    var returnVec = _.findWhere(unitCellPositions, {latticeIndex: latticeIndex});

    return returnVec.position;
  };
  Motifeditor.prototype.revertShearing = function() {
    this.transform(reverseShearing, function(value) {  
      return -value;
    });
  }; 
      
  Motifeditor.prototype.cellPointsWithAngles = function() {  
    //this.transform(reverseShearing, function(value) {  return -value; });  
    this.transform( shearing, function(value) {  return value; }  ); 
    //this.transform( reverseScaling,             function(value) { return (value === 0 ? 0 : 1 / value); } );       
    //this.transform( _.union(scaling, shearing), function(value) { return value; }                         );  
  };   
  var shearing = [ 'alpha', 'beta', 'gamma' ];
  var reverseShearing = shearing.slice(0).reverse();
  var scaling = [ 'scaleX', 'scaleY', 'scaleZ' ];
  var reverseScaling = scaling.slice(0).reverse();

  Motifeditor.prototype.transform = function( parameterKeys, operation ) {
    var matrix, _this = this;
    var argument; 
    var parameters = this.cellParameters;  
    _.each(parameterKeys, function(k) {   
      if (_.isUndefined(parameters[k]) === false) { 
        argument = {};
        argument[k] = operation(parseFloat(parameters[k]));
        matrix = transformationMatrix(argument); 
        _.each(_this.unitCellPositions, function(pos, reference) {
          if(pos.position.applyMatrix4 === undefined){
            pos.position = new THREE.Vector3(pos.position.x, pos.position.y, pos.position.z);
          }  
          pos.position.applyMatrix4(matrix); 
        });
      }
    });
  };

  var transformationMatrix = function(parameter) {

    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - ((parameter.gamma) || 90)) * Math.PI / 180); 
    var bc = Math.tan((90 - ((parameter.alpha) || 90)) * Math.PI / 180);

    var xy = 0;
    var zy = 0;
    var xz = 0;

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

  var uuid = -1;

  function produceUuid () {
    uuid++
    return uuid;
  }

  return Motifeditor;
});
