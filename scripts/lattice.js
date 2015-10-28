'use strict';

define([
  'pubsub', 'three', 'underscore',
  'point', 'grid','face','millervector','millerplane', 'crystalAtom', 'explorer'
], function(
  PubSub, THREE, _,
  Point, Grid, Face, MillerVector, MillerPlane, CrystalAtom, Explorer
) {
  var events = {
    LOAD: 'lattice.load',
    DIRECTION_STATE: 'lattice.direction_state', 
    PLANE_STATE: 'lattice.plane_state'
  };

  var defaultParameters = {
    repeatX: 1, repeatY: 1, repeatZ: 1,
    scaleX: 1, scaleY: 1, scaleZ: 1,
    alpha: 90, beta: 90, gamma: 90
  };

  var shearing = [
    'alpha', 'beta', 'gamma'
  ];

  var reverseShearing = shearing.slice(0).reverse();

  var scaling = [
    'scaleX', 'scaleY', 'scaleZ'
  ];

  var reverseScaling = scaling.slice(0).reverse();

  function Lattice(menu, soundMachine) {

    // lattice
    this.menu = menu ;  
    this.lattice = null;
    this.parameters = defaultParameters;
    this.points = {}; 
    this.mutex = false;
    this.currentMotif = [];
    this.latticeName = 'none';  
    this.latticeType = 'none'; // may be useless
    this.latticeSystem = 'none'; // may be useless 
    this.actualAtoms = []; 

    // grade
    this.gradeChoice = {"face":false, "grid":false};
    this.gridPointsPos = [];
    this.grids = [];
    this.hexGrids = {};
    this.faces = [];
    this.gradeParameters = {"radius" : 1, "cylinderColor" : "FFFFFF" , "faceOpacity" : 1 , "faceColor" : "FFFFFF"};
    this.hexagonalShapes = [] ;
    // miller
    this.millerParameters = []; 

    this.millerPlanes = [];
    this.planeState = {state:"initial", editing : undefined };
    this.planeList =[];
    this.tempPlanes =[];

    this.millerDirections = [];
    this.directionalState = {state:"initial", editing : undefined };    
    this.directionalList =[];
    this.tempDirs = [] ;
    this.planesUnique = [];
    this.directionsUnique = [] ;

    //view
    this.viewBox = [];
    this.viewMode = 'Classic';
    this.solidVoidObject ;

    // visualization
    this.renderingMode = 'realistic';
  }; 
  Lattice.prototype.renderingModeChange = function(arg) {
    
    this.renderingMode = arg.mode;

    if(arg.mode === 'wireframe'){
      
      if(this.actualAtoms.length !== 0 ){
        for (var i = 0, len = this.actualAtoms.length; i < len; i++) {
          this.actualAtoms[i].wireframeMat(true);
        } 
      }
    }
    else if(arg.mode === 'toon'){ 
      if(this.actualAtoms.length !== 0 ){  
        for (var i = 0, len = this.actualAtoms.length; i < len; i++) {
          this.actualAtoms[i].wireframeMat(false);
        } 
      }
      for (var i = 0, len = this.actualAtoms.length; i < len; i++) {
        this.actualAtoms[i].coonMode(true);
      } 
    }
    else if(arg.mode === 'flat'){
      if(this.actualAtoms.length !== 0 ){ 
          
        for (var i = 0, len = this.actualAtoms.length; i < len; i++) {
          this.actualAtoms[i].wireframeMat(false);
        } 
          
        for (var i = 0, len = this.actualAtoms.length; i < len; i++) {
          this.actualAtoms[i].flatMode(true);
        } 
      }
    }
    else if(arg.mode === 'realistic'){
      if(this.actualAtoms.length !== 0 ){ 
        for (var i = 0, len = this.actualAtoms.length; i < len; i++) {
          this.actualAtoms[i].wireframeMat(false);
        }  
        for (var i = 0, len = this.actualAtoms.length; i < len; i++) {
          this.actualAtoms[i].realisticMode(true);
        } 
      }
    }
  };
  Lattice.prototype.offsetMotifsForViews = function(mode, objName){
    var atoms = [];
    if(mode === 'cellClassic'){
      return atoms;
    }
    var i = 0, j = 0;

    var globMat;
    var arr = [{a : 0, b : 1},{a : 1, b : 0},{a : 0, b : -1},{a : -1, b : 0}];
    var halfX = this.parameters.scaleX * 0.5;
    var halfY = this.parameters.scaleY * 0.5;
    var halfZ = this.parameters.scaleZ * 0.5;

    var leftPos = new THREE.Vector3(0, halfY, halfZ);
    var rightPos = new THREE.Vector3(this.parameters.scaleX, halfY, halfZ);
    var frontPos = new THREE.Vector3(halfX, halfY, this.parameters.scaleZ);
    var backPos = new THREE.Vector3(halfX, halfY, 0);
    var upPos = new THREE.Vector3(halfX, this.parameters.scaleY, halfZ);
    var downPos = new THREE.Vector3(halfX, 0, halfZ);

    var centerPos = new THREE.Vector3(halfX, halfY, halfZ);
 
    if(this.latticeType === 'face'){ 
      while(j <this.currentMotif.length) {
        var p = this.currentMotif[j].object3d.position.clone();
        if(this.renderingMode === 'wireframe') { 
          globMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color : this.currentMotif[j].color, wireframe: true, opacity:0}) ; 
        }
        else if(this.renderingMode === 'realistic'){ 
          globMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: this.currentMotif[j].color, transparent:true, opacity:this.currentMotif[j].opacity }) ; 
        }
        else{ 
          globMat = new THREE.MeshLambertMaterial({  color: this.currentMotif[j].color, transparent:true, opacity: this.currentMotif[j].opacity }) ; 
        }  

        var radius = this.currentMotif[j].radius;
        var globalG = new THREE.SphereGeometry(radius,32, 32);
        
        ///
        for (var z = 0; z < this.parameters.repeatZ; z++) {
          for (var y = 0; y <= this.parameters.repeatY; y++) {
            var replicaAtomLeft = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomLeft.name = objName;
            replicaAtomLeft.position.set(p.x - halfX, p.y + y*this.parameters.scaleY, p.z + halfZ + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomLeft);
 
          };
        };
        for (var z = 0; z <= this.parameters.repeatZ; z++) {
          for (var y = 0; y < this.parameters.repeatY; y++) { 
            var replicaAtomLeft2 = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomLeft2.name = objName;
            replicaAtomLeft2.position.set(p.x - halfX, p.y + y*this.parameters.scaleY +halfY, p.z + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomLeft2); 
          };
        }; 
        ///

        /// 
        for (var x = 0; x < this.parameters.repeatX; x++) {
          for (var y = 0; y <= this.parameters.repeatY; y++) {
            var replicaAtomBack = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomBack.name = objName;
            replicaAtomBack.position.set(p.x + x*this.parameters.scaleX + halfX, p.y + y*this.parameters.scaleY, p.z - halfZ ); 
            atoms.push(replicaAtomBack);
          };
        };
        for (var x = 0; x <= this.parameters.repeatX; x++) {
          for (var y = 0; y < this.parameters.repeatY; y++) {
            var replicaAtomBack2 = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomBack2.name = objName;
            replicaAtomBack2.position.set(p.x + x*this.parameters.scaleX , p.y + y*this.parameters.scaleY + halfY,p.z - halfZ ); 
            atoms.push(replicaAtomBack2);
          };
        };  
        ///

        var farX = halfX + this.parameters.scaleX*this.parameters.repeatX ;

        for (var z = 0; z < this.parameters.repeatZ; z++) {
          for (var y = 0; y <= this.parameters.repeatY; y++) { 
            var replicaAtomRight = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomRight.name = objName;
            replicaAtomRight.position.set(p.x + farX, p.y + y*this.parameters.scaleY,p.z + halfZ + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomRight);
          };
        };
        for (var z = 0; z <= this.parameters.repeatZ; z++) {
          for (var y = 0; y < this.parameters.repeatY; y++) { 
            var replicaAtomRight2 = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomRight2.name = objName;
            replicaAtomRight2.position.set(p.x + farX, p.y + y*this.parameters.scaleY + halfY,p.z + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomRight2);
          };
        }; 
        //
        
        var farZ = halfZ + this.parameters.scaleZ*this.parameters.repeatZ ;

        for (var x = 0; x < this.parameters.repeatX; x++) {
          for (var y = 0; y <= this.parameters.repeatY; y++) {
            var replicaAtomFront = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomFront.name = objName;
            replicaAtomFront.position.set(p.x + x*this.parameters.scaleX + halfX,p.y + y*this.parameters.scaleY,p.z + farZ); 
            atoms.push(replicaAtomFront);
          };
        };
       
        for (var x = 0; x <= this.parameters.repeatX; x++) {
          for (var y = 0; y < this.parameters.repeatY; y++) {
            var replicaAtomFront2 = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomFront2.name = objName;
            replicaAtomFront2.position.set(p.x + x*this.parameters.scaleX,p.y + y*this.parameters.scaleY + halfY , p.z + farZ ); 
            atoms.push(replicaAtomFront2);
          };
        };
        
        //
        var farY = halfY + this.parameters.scaleY*this.parameters.repeatY ;
        for (var z = 0; z < this.parameters.repeatZ; z++) {
          for (var x = 0; x <= this.parameters.repeatX; x++) { 
            var replicaAtomLeft3 = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomLeft3.name = objName;
            replicaAtomLeft3.position.set(p.x + x*this.parameters.scaleX, p.y + farY, p.z + z*this.parameters.scaleZ+halfZ); 
            atoms.push(replicaAtomLeft3); 
          };
        };
        for (var z = 0; z <= this.parameters.repeatZ; z++) {
          for (var x = 0; x < this.parameters.repeatX; x++) { 
            var replicaAtomLeft3 = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomLeft3.name = objName;
            replicaAtomLeft3.position.set(p.x + x*this.parameters.scaleX + halfX, p.y + farY, p.z + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomLeft3); 
          };
        };
        for (var z = 0; z < this.parameters.repeatZ; z++) {
          for (var x = 0; x <= this.parameters.repeatX; x++) { 
            var replicaAtomLeft3 = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomLeft3.name = objName;
            replicaAtomLeft3.position.set(p.x + x*this.parameters.scaleX, p.y - halfY, p.z + z*this.parameters.scaleZ+halfZ); 
            atoms.push(replicaAtomLeft3); 
          };
        };
        for (var z = 0; z <= this.parameters.repeatZ; z++) {
          for (var x = 0; x < this.parameters.repeatX; x++) { 
            var replicaAtomLeft3 = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomLeft3.name = objName;
            replicaAtomLeft3.position.set(p.x + x*this.parameters.scaleX + halfX, p.y - halfY, p.z + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomLeft3); 
          };
        };

        j++;
      } 
    }
    else if(this.latticeType === 'base'){
      while(j <this.currentMotif.length) {
        var p = this.currentMotif[j].object3d.position.clone();
        if(this.renderingMode === 'wireframe') { 
          globMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color : this.currentMotif[j].color, wireframe: true, opacity:0}) ; 
        }
        else if(this.renderingMode === 'realistic'){ 
          globMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: this.currentMotif[j].color, transparent:true, opacity:this.currentMotif[j].opacity }) ; 
        }
        else{ 
          globMat = new THREE.MeshLambertMaterial({  color: this.currentMotif[j].color, transparent:true, opacity: this.currentMotif[j].opacity }) ; 
        }  

        var radius = this.currentMotif[j].radius;
        var globalG = new THREE.SphereGeometry(radius,32, 32);
   
        for (var z = 0; z < this.parameters.repeatZ; z++) {
          for (var y = 0; y <= this.parameters.repeatY; y++) {
            var replicaAtomLeft = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomLeft.name = objName;
            replicaAtomLeft.position.set(p.x - halfX,p.y + y*this.parameters.scaleY,p.z + halfZ + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomLeft);
          };
        };

        for (var x = 0; x < this.parameters.repeatX; x++) {
          for (var y = 0; y <= this.parameters.repeatY; y++) {
            var replicaAtomBack = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomBack.name = objName;
            replicaAtomBack.position.set(p.x + x*this.parameters.scaleX + halfX, p.y + y*this.parameters.scaleY, p.z - halfZ ); 
            atoms.push(replicaAtomBack);
          };
        };

        var farX = halfX + this.parameters.scaleX*this.parameters.repeatX ;

        for (var z = 0; z < this.parameters.repeatZ; z++) {
          for (var y = 0; y <= this.parameters.repeatY; y++) { 
            var replicaAtomRight = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomRight.name = objName;
            replicaAtomRight.position.set(p.x + farX,p.y + y*this.parameters.scaleY,p.z + halfZ + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomRight);
          };
        };

        var farZ = halfZ + this.parameters.scaleZ*this.parameters.repeatZ ;

        for (var x = 0; x < this.parameters.repeatX; x++) {
          for (var y = 0; y <= this.parameters.repeatY; y++) {
            var replicaAtomFront = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomFront.name = objName;
            replicaAtomFront.position.set(p.x + x*this.parameters.scaleX + halfX,p.y + y*this.parameters.scaleY,p.z + farZ); 
            atoms.push(replicaAtomFront);
          };
        };


        j++;
      }
    } 
    else if(this.latticeType === 'body'){
      while(j <this.currentMotif.length) {
        var p = this.currentMotif[j].object3d.position.clone();
        if(this.renderingMode === 'wireframe') { 
          globMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color : this.currentMotif[j].color, wireframe: true, opacity:0}) ; 
        }
        else if(this.renderingMode === 'realistic'){ 
          globMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: this.currentMotif[j].color, transparent:true, opacity:this.currentMotif[j].opacity }) ; 
        }
        else{ 
          globMat = new THREE.MeshLambertMaterial({  color: this.currentMotif[j].color, transparent:true, opacity: this.currentMotif[j].opacity }) ; 
        }  

        var radius = this.currentMotif[j].radius;
        var globalG = new THREE.SphereGeometry(radius,32, 32);
   
        for (var z = 0; z < this.parameters.repeatZ; z++) {
          for (var y = 0; y < this.parameters.repeatY; y++) {
            var replicaAtomLeft = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomLeft.name = objName;
            replicaAtomLeft.position.set(p.x - halfX,p.y + y*this.parameters.scaleY + halfY,p.z + halfZ + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomLeft);
          };
        };

        for (var x = 0; x < this.parameters.repeatX; x++) {
          for (var y = 0; y < this.parameters.repeatY; y++) {
            var replicaAtomBack = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomBack.name = objName;
            replicaAtomBack.position.set(p.x + x*this.parameters.scaleX + halfX,p.y + y*this.parameters.scaleY + halfY,p.z - halfZ ); 
            atoms.push(replicaAtomBack);
          };
        };

        var farX = halfX + this.parameters.scaleX*this.parameters.repeatX ;

        for (var z = 0; z < this.parameters.repeatZ; z++) {
          for (var y = 0; y < this.parameters.repeatY; y++) {

            var replicaAtomRight = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomRight.name = objName;
            replicaAtomRight.position.set(p.x + farX,p.y + y*this.parameters.scaleY + halfY,p.z + halfZ + z*this.parameters.scaleZ); 
            atoms.push(replicaAtomRight);
          };
        };

        var farZ = halfZ + this.parameters.scaleZ*this.parameters.repeatZ ;

        for (var x = 0; x < this.parameters.repeatX; x++) {
          for (var y = 0; y < this.parameters.repeatY; y++) {
            var replicaAtomFront = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomFront.name = objName;
            replicaAtomFront.position.set(p.x  + x*this.parameters.scaleX + halfX,p.y + y*this.parameters.scaleY + halfY,p.z + farZ); 
            atoms.push(replicaAtomFront);
          };
        };
        

        var farY = halfY + this.parameters.scaleY*this.parameters.repeatY ;

        for (var x = 0; x < this.parameters.repeatX; x++) {
          for (var z = 0; z < this.parameters.repeatZ; z++) {
            var replicaAtomUp = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomUp.name = objName;
            replicaAtomUp.position.set(p.x  + x*this.parameters.scaleX + halfX,p.y + farY,p.z + z*this.parameters.scaleZ + halfZ); 
            atoms.push(replicaAtomUp);
          };
        };

        for (var x = 0; x < this.parameters.repeatX; x++) {
          for (var z = 0; z < this.parameters.repeatZ; z++) {
            var replicaAtomDown = new THREE.Mesh( globalG, globMat ); 
            if(objName !== undefined) replicaAtomDown.name = objName;
            replicaAtomDown.position.set(p.x  + x*this.parameters.scaleX + halfX,p.y - halfY ,p.z + z*this.parameters.scaleZ + halfZ); 
            atoms.push(replicaAtomDown);
          };
        };

        j++;
      }
    } 
    
    i=0;
     
    /////////////////////////////////// 
 
    if (this.parameters.alpha !== 90) {  
      var matrix = transformationMatrix({alpha : this.parameters.alpha});  
      _.each(atoms, function(atom) { 
        atom.position.applyMatrix4(matrix);    
      }); 
    }
    if (this.parameters.beta !== 90) {  
      var matrix = transformationMatrix({beta : this.parameters.beta});  
      _.each(atoms, function(atom) { 
        atom.position.applyMatrix4(matrix);    
      }); 
    }
    if (this.parameters.gamma !== 90) {  
      var matrix = transformationMatrix({gamma : this.parameters.gamma});  
      _.each(atoms, function(atom) { 
        atom.position.applyMatrix4(matrix);    
      }); 
    }

    /*
    while(i < atoms.length ){  
      atoms[i].material.color = new THREE.Color(0xff0000); 
      Explorer.add({'object3d' : atoms[i]});  
      i++;
    } 
    */
    return atoms;
 
  }; 
  Lattice.prototype.editObjectsInScene = function(name, action, visible){ 
    var finished = false, found = false;
    var scene = Explorer.getInstance().object3d;
    scene.traverse (function (object)
    { 
      if (object.name === name){
        
        found = true;
        if(action === 'remove'){ 
          scene.remove(object);
        }
        else if(action === 'visibility'){  
          object.visible = visible;
        }
      }  
    });
  
    return found;
  };
  Lattice.prototype.setCSGmode = function(arg) {
     
    var _this = this, i = 0;
    this.viewMode = arg.mode ;
     
    this.menu.resetProgressBar( 'Processing...'); 

    /*
    if(this.viewMode !== 'Classic'){
      this.menu.setTabDisable({
        'latticeTab': true,
        'motifLI':true,
        'publicTab':true
      });
    }
    else{
      this.menu.setTabDisable({
        'latticeTab': false, 
        'motifLI':false,
        'publicTab':false 
      });
    }*/

    if(this.actualAtoms.length!==0){
  
      var scene = Explorer.getInstance().object3d;

      /*
      var geometry = new THREE.Geometry();
      while(i < this.viewBox.length ) {  
        this.viewBox[i].object3d.updateMatrix();  
        geometry.merge( this.viewBox[i].object3d.geometry, this.viewBox[i].object3d.matrix ); 
        i++; 
      }  */

      var g = this.customBox(this.viewBox);
      var box = new THREE.Mesh(g, new THREE.MeshLambertMaterial({side: THREE.DoubleSide, opacity : 0.5, transparent : true, color:"#FF0000" }) );
       
      if(this.viewMode === 'crystalSubstracted'){
        
        var helperMotifs = this.offsetMotifsForViews(this.viewMode);
        this.editObjectsInScene('cellSolidVoid', 'visibility', false);
        this.editObjectsInScene('cellGradeLimited', 'visibility', false); 
        this.editObjectsInScene('cellSubstracted', 'visibility', true);
        var enterViewmode = true; 
        if(this.actualAtoms[0].viewModeBeen.SubtractedSolid === true ){
          enterViewmode = false;
        }
        i = 0 ;
        while(i < this.actualAtoms.length ) {
          this.actualAtoms[i].object3d.visible = false; 
          
          if(enterViewmode === true){
            this.actualAtoms[i].subtractedSolidView(box, this.actualAtoms[i].object3d.position, true);
          } 
          else{
            this.actualAtoms[i].subtractedForGear.object3d.visible = true; 
          }
          i++;
        } 

        i = 0;

        while(i < helperMotifs.length ) { 
          var mesh_ = this.subtractedSolidView(box, helperMotifs[i]); 
          mesh_.name = 'cellSubstracted'; 
          scene.add(mesh_); 
          i++;
        } 

        if(this.solidVoidObject !== undefined){ 
          this.solidVoidObject.visible = false; 
        }
      }
      else if(this.viewMode === 'crystalSolidVoid'){   

        var found = false;
        var helperMotifs = this.offsetMotifsForViews(this.viewState);
        this.editObjectsInScene('cellSubstracted', 'visibility', false);
        this.editObjectsInScene('cellGradeLimited', 'visibility', false);

        if(this.solidVoidObject !== undefined){
          this.solidVoidObject.visible = true; 
          found = true;
          this.objectSolidVoid.visible = true; //todo 2 idia
          while(i < this.actualAtoms.length ) {  
            this.actualAtoms[i].object3d.visible = false;  
            if(this.actualAtoms[i].subtractedForGear.object3d !== undefined){
              this.actualAtoms[i].subtractedForGear.object3d.visible = false;  
            }
            i++; 
          } 
          return;
        }
         
        var geometry = new THREE.Geometry();  

        var globalG = new THREE.SphereGeometry(1, 32, 32);

        i =0 ;
        while(i < this.actualAtoms.length ) {  
          this.actualAtoms[i].SolidVoid(this.actualAtoms[i].object3d.position);  
          var mesh = new THREE.Mesh(globalG, new THREE.MeshBasicMaterial() );
          mesh.scale.set(this.actualAtoms[i].getRadius(), this.actualAtoms[i].getRadius(), this.actualAtoms[i].getRadius());
          mesh.position.set( this.actualAtoms[i].object3d.position.x, this.actualAtoms[i].object3d.position.y, this.actualAtoms[i].object3d.position.z);
          mesh.updateMatrix();   
          geometry.merge( mesh.geometry, mesh.matrix ); 
          i++; 
        } 

        i=0;

        while(i < helperMotifs.length ) { 
          helperMotifs[i].updateMatrix();   
          geometry.merge( helperMotifs[i].geometry, helperMotifs[i].matrix );
          i++; 
        } 

        var cube = THREE.CSG.toCSG(box); 
        cube = cube.inverse();
        var spheres = THREE.CSG.toCSG(geometry);
        var geometryCSG = cube.subtract(spheres);
        var geom = THREE.CSG.fromCSG(geometryCSG);
        var finalGeom = assignUVs(geom);
   
        var solidBox = new THREE.Mesh( finalGeom, new THREE.MeshLambertMaterial({ color: '#9A2EFE' }) );
        solidBox.name = 'solidvoid';
        this.solidVoidObject = solidBox;
        Explorer.add({'object3d' : solidBox}); 

        i = 0;

        while(i < this.actualAtoms.length ) {   
          this.actualAtoms[i].object3d.visible = false;   
          if(this.actualAtoms[i].subtractedForGear.object3d !== undefined){
            this.actualAtoms[i].subtractedForGear.object3d.visible = false;  
          }
          i++; 
        } 

      }
      else if(this.viewMode === 'crystalGradeLimited'){ 

        var found = false, objectSolidVoid;
        helperMotifs = this.offsetMotifsForViews(this.viewState, 'cellGradeLimited');
        this.editObjectsInScene('cellSubstracted', 'visibility', false);
        this.editObjectsInScene('cellSolidVoid', 'visibility', false);

        if(this.solidVoidObject !== undefined){ 
          this.solidVoidObject.visible = false; 
        } 

        while(i < this.actualAtoms.length ) {   
          this.actualAtoms[i].object3d.visible = true;  
          if(this.actualAtoms[i].subtractedForGear.object3d !== undefined){
            this.actualAtoms[i].subtractedForGear.object3d.visible = false;  
          }
          i++; 
        } 
  
        scene.add(  box  );  

        var collidableMeshList = [] ;
        collidableMeshList.push(box); 
 
        // find geometry's center
        var centroid = new THREE.Vector3(); 
        for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
          centroid.add( g.vertices[ z ] ); 
        }  
        centroid.divideScalar( g.vertices.length );
           
        i=0;
   
        while(i < this.actualAtoms.length ) {    

          // workaround for points that are exactly on the grade (faces, cell points)
          var smartOffset = centroid.clone().sub(this.actualAtoms[i].object3d.position.clone());
          smartOffset.setLength(0.01);
          var originPointF = this.actualAtoms[i].object3d.position.clone().add(smartOffset);
          //
 
          var dir = new THREE.Vector3(1,100000,1); // don't care about it 
          var rayF = new THREE.Raycaster( originPointF,dir.clone().normalize() );
          var collisionResultsF = rayF.intersectObjects( collidableMeshList );
  
          var touches = true ;
          var radius = this.actualAtoms[i].getRadius() ;
         
          if(collisionResultsF.length !== 1){ // case its center is not fully inside (if it is nothing happens and it remains visible)
 
            var vertexIndex = this.actualAtoms[i].object3d.children[0].geometry.vertices.length-1;
            var atomCentre = this.actualAtoms[i].object3d.position.clone();

            while( vertexIndex >= 0 )
            {     
              var localVertex = this.actualAtoms[i].object3d.children[0].geometry.vertices[vertexIndex].clone();
              var globalVertex = localVertex.applyMatrix4(this.actualAtoms[i].object3d.matrixWorld);
              var directionVector = globalVertex.sub( originPointF );     
              
              var ray = new THREE.Raycaster( originPointF, directionVector.clone().normalize() );
    
              var collisionResults = ray.intersectObjects( collidableMeshList );
                 
              if( (collisionResults.length >= 1) &&  (collisionResults[0].distance <= radius) ) {
                vertexIndex = -2;  
                
              }
              vertexIndex--;
              if(vertexIndex === -1) {
                touches = false;
              }
            }  
            if(!touches) {
              this.actualAtoms[i].object3d.visible = false ;
            }
          } 
          this.actualAtoms[i].GradeLimited();
          i++;   
        } 

        i=0;

        while(i < helperMotifs.length ) { 
            // Explorer.add({'object3d' : helperMotifs[i] });
          // workaround for points that are exactly on the grade (faces, cell points)
          var smartOffset = centroid.clone().sub(helperMotifs[i].position.clone());
          smartOffset.setLength(0.01);
          var originPointF = helperMotifs[i].position.clone().add(smartOffset);
          //

          var dir = new THREE.Vector3(1,1000000,1);  
          var rayF = new THREE.Raycaster( originPointF, dir.clone().normalize() );
          var collisionResultsF = rayF.intersectObjects( collidableMeshList );
   
          var touches = true ;
          var radius = helperMotifs[i].geometry.boundingSphere.radius ;  

          if(collisionResultsF.length !== 1){ // case its center is not fully inside (if it is nothing happens and it remains visible)
    
            var vertexIndex = helperMotifs[i].geometry.vertices.length-1;
            var atomCentre = helperMotifs[i].position.clone();

            while( vertexIndex >= 0 )
            {     
              var localVertex = helperMotifs[i].geometry.vertices[vertexIndex].clone();
              var globalVertex = localVertex.applyMatrix4(helperMotifs[i].matrixWorld);
              var directionVector = globalVertex.sub( originPointF );     
              
              var ray = new THREE.Raycaster( originPointF, directionVector.clone().normalize() );
              
              var collisionResults = ray.intersectObjects( collidableMeshList );
                 
              if( (collisionResults.length >= 1) &&  (collisionResults[0].distance <= radius) ) {
                vertexIndex = -2;   
              }
              vertexIndex--;
              if(vertexIndex === -1) {
                touches = false;
              }
            }  

            if(touches === true) { 
              Explorer.add({'object3d' : helperMotifs[i] });
            }
          }
          else{ 
            Explorer.add({'object3d' : helperMotifs[i] });
          }
          i++;
        } 
        Explorer.remove({'object3d' : box }); 
      }
      else if(this.viewMode === 'crystalClassic'){ 
        var found = false, objectSolidVoid;
    
        var objectSolidVoid = scene.getObjectByName('solidvoid');
        if(!_.isUndefined(objectSolidVoid)) {
          found = true;
          objectSolidVoid.visible = false;
          if(arg.reset !== undefined){
            if(this.solidVoidObject !== undefined){ 
              this.solidVoidObject = undefined;
            }
            scene.remove(objectSolidVoid);
          }
        } 

        while(i < this.actualAtoms.length ) { 
          this.actualAtoms[i].object3d.visible = true;
          if(arg.reset === true){
            this.actualAtoms[i].viewModeBeen = {'Classic' : false, 'SubtractedSolid' : false, 'GradeLimited' : false, 'SolidVoid' : false};
          }
          //this.actualAtoms[i].classicView(); 
          if(this.actualAtoms[i].subtractedForGear.object3d !== undefined){
            this.actualAtoms[i].subtractedForGear.object3d.visible = false; 
            if(arg.reset === true){ 
              this.actualAtoms[i].removeSubtractedForGear();
            } 
          }
          i++;
        }   
      } 
    } 
    this.menu.progressBarFinish();   
  };
  Lattice.prototype.subtractedSolidView = function(box, mesh) {
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
  var bbHelper = [];
  Lattice.prototype.lineHelper = function(a,b, color, pass){
     
    var material = [ new THREE.LineBasicMaterial({ color: color  }) ];
    var geometry = new THREE.Geometry();
    
    var scene = Explorer.getInstance().object3d;
    
     
    var g=0;
    if(pass === 8) {  
      while(g<bbHelper.length) {   
        scene.remove(bbHelper[g] );
        g++;
      }
      bbHelper.splice(0);
    } 
     

    geometry.vertices.push( a, b );
     
    var mesh = new THREE.Line(geometry, material[0]);
    bbHelper.push(mesh);
    scene.add(mesh); 
  }
  Lattice.prototype.toggleRadius = function(arg) {
    
    arg = arg.atomRadius;
  
    if(arg > 10) return ;
    var radius = arg/10;
    for (var i = this.actualAtoms.length - 1; i >= 0; i--) { 
      var ratio = this.actualAtoms[i].radius * radius ; 
      this.actualAtoms[i].object3d.scale.set(ratio,ratio,ratio); 
    };  
  };
  Lattice.prototype.destroyPoints = function() {
    var _this = this; 
    _.each(this.points, function(point, reference) {
      point.destroy();
      delete _this.points[reference];
    });
  }; 
  Lattice.prototype.destroyGrids = function() {
    var _this = this; 
    _.each(this.grids, function(grid, reference) {
      grid.grid.destroy(); 
    });
    this.grids.splice(0);
  }; 
  Lattice.prototype.updateLatticeUI = function(params){
   
    this.menu.setSliderValue("beta", params.beta );
    this.menu.setSliderValue("gamma", params.gamma );
    this.menu.setSliderValue("alpha", params.alpha );

    if(params.x !== undefined){
       
      this.menu.setSliderValue("scaleX", params.x );
      this.menu.setSliderValue("scaleY", params.y );
      this.menu.setSliderValue("scaleZ", params.z );
    }
    else{
       
      this.menu.setSliderValue("scaleX", params.scaleX );
      this.menu.setSliderValue("scaleY", params.scaleY );
      this.menu.setSliderValue("scaleZ", params.scaleZ );
    }
    
  
  }
  Lattice.prototype.setMotif = function(motif, params){
    var _this = this ; 

    this.updateLatticeUI(params);

    this.currentMotif = motif ;

    _.each(this.actualAtoms, function(atom,k) {
      atom.destroy();   
    }); 
    this.actualAtoms.splice(0); 

    this.backwardTransformations();
     
    this.parameters.scaleX = params.x ;
    this.parameters.scaleY = params.y ;
    this.parameters.scaleZ = params.z ;
    this.parameters.alpha = params.alpha ;
    this.parameters.beta = params.beta ;
    this.parameters.gamma = params.gamma ;

    this.forwardTransformations();  
    
    _.each(this.points, function(point,kk) { 
      var p = point.object3d.position.clone(); 
      _.each(motif, function(atom) {  
        var opacity,wireframe,color,a;
        if(atom.object3d === undefined){
          opacity = atom.opacity/10;
          wireframe = atom.wireframe;
          color = atom.color;
          a = atom.position.clone();
        }  
        else{
          opacity = atom.object3d.children[0].material.opacity;
          wireframe = atom.object3d.children[1].material.wireframe;
          color = atom.color;
          a = atom.object3d.position.clone(); 
        }

        _this.actualAtoms.push( 
          new CrystalAtom(
            new THREE.Vector3(p.x + a.x, p.y + a.y, p.z + a.z), 
            atom.getRadius(), 
            color,
            atom.elementName, 
            atom.getID(),
            a.x,
            a.y,
            a.z,
            p,
            '/Images/'+atom.texture+'.png',
            opacity,
            _this.renderingMode,
            kk
          )  
        );
      });
    });  

    this.updateLatticeTypeRL();
     
  }; 
  Lattice.prototype.createGrid = function() {

    var gridPoints = this.lattice.gridPoints;
    var usedGridOrigins = [];
     
    if (_.isUndefined(gridPoints) && (this.latticeName !== 'hexagonal')) { 
      return;
    }
    
    var parameters = this.parameters;
    var origin, g,destinationReference;
    var destination;
    var _this = this;
    var visible = (this.gradeChoice.grid  ) ;
     
    // erase previous grid 
    this.destroyGrids();
     
    _.times(parameters.repeatX , function(_x) {
      _.times(parameters.repeatY , function(_y) {
        _.times(parameters.repeatZ , function(_z) {
             
          _.each(gridPoints, function(xyz, which){

            switch(which) {
              case 'first':  
                var originReference = 'r_' + (xyz[0]+_x) +'_'+ (xyz[1]+_y) + '_'+ (xyz[2]+_z) + '_0';
                 
                if (_.isUndefined(usedGridOrigins[originReference])) {
                    
                    origin = _this.points[originReference];

                    destinationReference = 'r_' + (1+_x) + '_' + _y + '_' + _z + '_0';
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({ grid:g, origin:originReference, destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0 });
                    
                    destinationReference = 'r_' + _x + '_' + (1+_y) + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + _x + '_' + _y + '_' + (1+_z) + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    usedGridOrigins[originReference] = 1;
                     
                }
                
                break;

              case 'left':
                var originReference = 'r_' + (xyz[0]+_x) +'_'+ (xyz[1]+_y) +'_'+ (xyz[2]+_z) + '_0'; 

                if (_.isUndefined(usedGridOrigins[originReference])) { 

                    origin = _this.points[originReference];

                    destinationReference = 'r_' + (1+_x) + '_' + _y + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + _x + '_' + (1+_y) + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + (1+_x) + '_' + (1+_y) + '_' + (1+_z) + '_0' ; 
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    usedGridOrigins[originReference] = 1;
                }
                break;
              case 'right':
                var originReference = 'r_' + (xyz[0]+_x) +'_'+ (xyz[1]+_y) +'_'+ (xyz[2]+_z) + '_0'; 

                if (_.isUndefined(usedGridOrigins[originReference])) { 

                    origin = _this.points[originReference];

                    destinationReference = 'r_' + (1+_x) + '_' + _y + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + _x + '_' + _y + '_' + (1+_z) + '_0' ; 
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + (1+_x) + '_' + (1+_y) + '_' + (1+_z) + '_0' ; 
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    usedGridOrigins[originReference] = 1;
                }
                break;
              case 'front':
                var originReference = 'r_' + (xyz[0]+_x) +'_'+ (xyz[1]+_y) +'_'+ (xyz[2]+_z) + '_0'; 
                if (_.isUndefined(usedGridOrigins[originReference])) { 

                    origin = _this.points[originReference];

                    destinationReference = 'r_' + _x + '_' + (1+_y) + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + _x + '_' + _y + '_' + (1+_z) + '_0';
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + (1+_x) + '_' + (1+_y) + '_' + (1+_z) + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    usedGridOrigins[originReference] = 1;
                }
                break; 
            } 
          }); 
        });
      });
    }); 
     
  }; 
  var _times = {'a':0,'b':0,'c':0};
   
  Lattice.prototype.updatePoints = function(callbacks) { 
    var spawnCounter, spawns = 0;
     
    var lattice = this.lattice;  
    
    this.destroyPoints();
    this.destroyGrids();

    _.each(this.faces, function(face, reference) {
      face.destroy();
    });
    this.faces.splice(0);
    this.viewBox.splice(0); 

    if (_.isEmpty(lattice)) return; 

    var parameters = this.parameters;
    var origin = lattice.originArray[0];
    var vector = lattice.vector;
  
    var limit = new THREE.Vector3(
      parameters.repeatX * vector.x + origin.x,
      parameters.repeatY * vector.y + origin.y,
      parameters.repeatZ * vector.z + origin.z
    );
    var index;
    var originLength = lattice.originArray.length, currentPoint, previousPoint;    
    var position;
    var reference;

    var _this = this;

    var aa = new Date(); 
 
    parameters.repeatX = parseInt(parameters.repeatX);
    parameters.repeatY = parseInt(parameters.repeatY);
    parameters.repeatZ = parseInt(parameters.repeatZ);

    spawnCounter = (parameters.repeatX +1) * (parameters.repeatY +1) * (parameters.repeatZ + 1);
    
    
    _times['c'] = new Date();

    if(_this.latticeName !== 'hexagonal'){ 
      
      // the above concept of execution keeps the speed of execution high but also prevents the js thread to be idle processing only the above
        
      _.times(parameters.repeatZ +1, function(_z) {
          _.times(parameters.repeatY +1, function(_y) { 
            _.times(parameters.repeatX +1, function(_x) {   
              setTimeout( function(){ 
                spawns++; 
                for (var index = 0; index < originLength; index++) {  
                  origin = lattice.originArray[index];
                  position = new THREE.Vector3(
                    _x * vector.x + origin.x,
                    _y * vector.y + origin.y,
                    _z * vector.z + origin.z
                  ); 
                  if (position.x <= limit.x && position.y <= limit.y && position.z <= limit.z) 
                  {     
                    reference = 'r_' + _x + '_' + _y + '_' + _z + '_' + index;
                     
                    if (_.isUndefined(_this.points[reference])) {  
                      _this.points[reference] = new Point(position);   
                    }
                  }                   
                }  
                if(spawns === spawnCounter){  
                  for (var countF = 0; countF < callbacks.length ; countF++) { 
                    callbacks[countF].bind(_this)();
                  }; 
                }
              },
              0);
            });      
          });  
      });
       
    }
    else{  

      _.each(_this.hexGrids, function(g, reference) {
        _this.hexGrids[reference] = false;
      });  

      var a = parameters.scaleZ ;
      var c = parameters.scaleY ;
      var co = 0 , previousPoint, currentPoint;

      var vertDist = a*Math.sqrt(3);
      _this.hexagonalShapes.splice(0);
      _.times(parseInt(parameters.repeatY) + 1, function(_y) {
        _.times(parseInt(parameters.repeatX)   , function(_x) {
          _.times(parseInt(parameters.repeatZ)  , function(_z) {
            var hexPoints = [];
            // point in the middle
            var z = (_x % 2==0) ? (_z*vertDist) : ((_z*vertDist + vertDist/2));
            var y =  _y*c ;
            var x = _x*a*1.5 ;
            var reference = 'h_'+(x).toFixed(2)+(y).toFixed(2)+(z).toFixed(2) ; 
            _this.points[reference] = new Point(new THREE.Vector3(x,y,z)); 
            // point in the middle 

            _.times(6 , function(_r) {

              var v = new THREE.Vector3( a, 0, 0 ); 
              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
              
              var position = new THREE.Vector3( x, y, z);
              z = z.toFixed(2) ;
              if(z==0) z = '0.00'; // check for negative zeros  

              var reference = 'h_'+(x).toFixed(2)+(y).toFixed(2)+z ;
              hexPoints.push(position);
              if (_.isUndefined( _this.points[reference])) { 
                _this.points[reference] = new Point(position);   
                if(_y>0) _this.createHexGrid([position, new THREE.Vector3(position.x, position.y - c, position.z)],true);
              }  

            });

            _this.createHexGrid(hexPoints,false);
            _this.hexagonalShapes.push(hexPoints); 
          });
        });
      }); 
    };  
  };
  Lattice.prototype.createHexGrid = function(hexPoints, vertical) {
    var _this = this;
    var visible = (this.gradeChoice.grid ); //recreate motif inm lattice and add atom in motif
    if(vertical){
      var a = hexPoints[0];
      var b = hexPoints[1];

      var x = (a.x).toFixed(2);
      var y = (a.y).toFixed(2);
      var z = (a.z).toFixed(2);

      var k = (b.x).toFixed(2);
      var l = (b.y).toFixed(2);
      var m = (b.z).toFixed(2); 
          
      if(z==0) z = '0.00';
      if(m==0) m = '0.00'; 

      var originReference = 'h_'+x+y+z ;
      var destinationReference = 'h_'+k+l+m ; 
      var g = new Grid(hexPoints[0], hexPoints[1],  visible);

      _this.grids.push({ grid:g, origin:originReference, destination:destinationReference, a:a, b:b, updated:0 });
      updateGrid(_this.grids[_this.grids.length-1]);
         
    }
    else{ 
      for (var i = 0 ; i< hexPoints.length ; i++) {
        var a = hexPoints[i];
        var b = (i === 5 ) ? hexPoints[0] : hexPoints[i+1];

        var x = (a.x).toFixed(2);
        var y = (a.y).toFixed(2);
        var z = (a.z).toFixed(2);

        var k = (b.x).toFixed(2);
        var l = (b.y).toFixed(2);
        var m = (b.z).toFixed(2); 
            
        if(z==0) z = '0.00';
        if(m==0) m = '0.00';

        var reference = 'h_'+x+y+z+k+l+m ;
        var reference2 = 'h_'+k+l+m+x+y+z ;
        var originReference = 'h_'+x+y+z ;
        var destinationReference = 'h_'+k+l+m ;
         
        /*if(_this.hexGrids[reference] == undefined) _this.hexGrids[reference] = false;

        if(_this.hexGrids[reference] === false && _this.hexGrids[reference2] === undefined){  
          _this.hexGrids[reference] = true; */
  
          var g = new Grid(a,b, visible);
          _this.grids.push({ grid:g, origin:originReference, destination:destinationReference, a:a, b:b, updated:0  });
          updateGrid(_this.grids[_this.grids.length-1]);
        //}
      };
    }  
  };
  Lattice.prototype.recreateMotif = function() {
    
    var _this = this;
     
    if(_this.currentMotif.length === 0 ) return ;
    _.each(_this.points, function(point,kk) { 
      var p = point.object3d.position; 
      _.each(_this.currentMotif, function(atom) {  
        var a = atom.object3d.position; 
        var color, texture, opacity, wireframe;
        if(!_.isUndefined(atom.object3d) && !atom.object3d.children) { 
          color = atom.color; 
          texture = undefined;
          opacity = atom.opacity/10;
          wireframe = atom.wireframe; 
        }
        else{ 
          atom.object3d.children[0].material.color ; 
          texture = undefined;
          opacity = atom.object3d.children[0].material.opacity ;
          wireframe = atom.object3d.children[1].material.wireframe ;
          color = atom.color ;
        }
        _this.actualAtoms.push( 
          new CrystalAtom(
            new THREE.Vector3(p.x + a.x, p.y + a.y, p.z + a.z), 
            atom.getRadius(), 
            color,
            atom.elementName, 
            atom.getID(),
            a.x,
            a.y,
            a.z,
            p,
            texture,
            opacity ,
            _this.renderingMode,
            kk
          )  
        );
      });
    });  
  };
  Lattice.prototype.getAnglesScales = function(){
    if(!this.lattice) {
      return;
    }
    var anglesScales = {  
      "alpha" : this.lattice.defaults.alpha, 
      "beta" : this.lattice.defaults.beta, 
      "gamma" : this.lattice.defaults.gamma,
      "scaleX" : this.parameters.scaleX,
      "scaleY" : this.parameters.scaleY,
      "scaleZ" : this.parameters.scaleZ  
    }; 
     
    return anglesScales ; 
  };
  Lattice.prototype.load = function(latticeName) {   
    if (_.isEmpty(latticeName)) {
      this.lattice = null;
      this.destroyPoints();
      this.destroyGrids();
      _.each(this.faces, function(face, reference) {
        face.destroy();
      });
      this.faces.splice(0);
      this.viewBox.splice(0);
      PubSub.publish(events.LOAD, null);
      return;
    }

    var _this = this;

    _this.latticeName = latticeName;
    require(['lattice/' + latticeName], function(lattice) {
      _this.lattice = lattice; 
      _this.latticeSystem = _this.lattice.latticeSystem ;
      _this.latticeType = _this.lattice.latticeType ; 
      if(_this.latticeType === 'hexagonal' && _this.latticeSystem === 'hexagonal'){ 
        _this.menu.toggleExtraParameter('i', 'block');
        _this.menu.toggleExtraParameter('t', 'block');
      }
      else{
        _this.menu.toggleExtraParameter('i', 'none');
        _this.menu.toggleExtraParameter('t', 'none');
      }
      _this.update();
      PubSub.publish(events.LOAD, lattice); 
    }); 
  };

  var transformationMatrix = function(parameter) {
      
    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - (( parameter.alpha) || 90)) * Math.PI / 180);

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleY || 1;
    var sc = parameter.scaleZ || 1;

    /* if we do not have scales :  

      1, ab, ac,       x        x*1 + ab*y + ac*z
      0,  1,  0,   X   y   =          y*1
      0, bc,  1,       z           bc*y + z*1
      0,  0,  0,                      0         
          
    */
    
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
     
    return m;
  }; 
  var times_ = {
    'actualatoms' : 0,
    'planes' : 0,
    'directions' : 0,
    'pointsANDgrids' : 0,
    'faces' : 0,
    'grids' : 0
  };
  Lattice.prototype.transform = function(caller, parameterKeys, operation) {  
    var matrix; 
    var argument;
    var points = this.points;
    var actualAtoms = this.actualAtoms;
    var parameters = this.parameters;
    var _this = this;
      
    _.each(parameterKeys, function(k) { 

      ///////////////////////////////////
      var startTime1 = new Date();

      if (_.isUndefined(parameters[k]) === false) { 
        argument = {};
        argument[k] = operation(parameters[k]); 
        matrix = transformationMatrix(argument);  
        _.each(_this.actualAtoms, function(atom) {
          if(!_.isUndefined(atom.object3d)){     
            atom.centerOfMotif.applyMatrix4(matrix);  
            atom.object3d.position.x = atom.centerOfMotif.x + atom.offsetX;  
            atom.object3d.position.y = atom.centerOfMotif.y + atom.offsetY;  
            atom.object3d.position.z = atom.centerOfMotif.z + atom.offsetZ; 
          } 
        }); 

        var endTime1 = new Date();
        times_['actualatoms'] +=(endTime1 - startTime1);

        ///////////////////////

        var startTime2 = new Date();
        _.each(points, function(point, reference) { 
          var pos = point.object3d.position.applyMatrix4(matrix);   
          if(caller==0) { 
            _.each(_this.grids, function(grid){ 
              if(grid.origin == reference) {  
                grid.a = pos;
                grid.updated++; 
                if(grid.updated==2) { 
                  grid.updated = 0;
                  updateGrid(grid);
                }
              }
              else if(grid.destination == reference){ 
                grid.b = pos;
                grid.updated++; 
                if(grid.updated==2){ 
                  grid.updated = 0;
                  updateGrid(grid);
                } 
              }
            }); 
          } 
        });   
        var endTime2 = new Date();
        times_['pointsANDgrids'] +=(endTime2 - startTime2); 

        ////////////////////

        var startTime3 = new Date();
        _.each(_this.faces, function(face, k) {
          _.each(face.object3d.geometry.vertices, function(vertex , k){ 
            face.object3d.geometry.verticesNeedUpdate = true ; 
            vertex.applyMatrix4(matrix); 
          });   
        });  
        var endTime3 = new Date();   
        times_['faces'] +=(endTime3 - startTime3);        
      } 

      var startTime4 = new Date();
      _.each(_this.millerPlanes, function(plane, reference) { 
        plane.plane.object3d.geometry.verticesNeedUpdate = true ;
        var vertices = plane.plane.object3d.geometry.vertices;
        _.each(vertices, function(vertex , k){  
          vertex.applyMatrix4(matrix); 
        });
      });
      var endTime4 = new Date();   
      times_['planes'] +=(endTime4 - startTime4);

      var startTime5 = new Date();
      _.each(_this.millerDirections, function(directional, reference) {
        directional.startPoint.applyMatrix4(matrix);
        directional.endpointPoint.applyMatrix4(matrix)
        updateMillerVector(directional);   
      }); 
      var endTime5 = new Date(); 
      times_['directions'] +=(endTime5 - startTime5);

    });  
  };
 
  Lattice.prototype.createFaces = function(){ 
    var _this = this;
    var parameters = this.parameters;
    var gradeParameters = this.gradeParameters;
    var visible = (this.gradeChoice.face  );

    _.each(this.faces, function(face, reference) {
      face.destroy();
    });
    _this.faces.splice(0);
    _this.viewBox.splice(0);
    
    if(this.latticeName !== 'hexagonal'){
      for (var _z = 0; _z <= parameters.repeatZ; _z++) {   
           
        _this.faces.push(
          new Face(
            _this.points['r_0_0_'+_z+'_0'].object3d.position , 
            _this.points['r_0_'+parameters.repeatY+'_'+_z+'_0'].object3d.position , 
            _this.points['r_'+parameters.repeatX+'_0_'+_z+'_0'].object3d.position ,
            _this.points['r_'+parameters.repeatX+'_'+parameters.repeatY+'_'+_z+'_0'].object3d.position,
            gradeParameters.faceOpacity, 
            gradeParameters.faceColor,
            visible 
            )
        );
        
        if(_z == 0) {   
           _this.viewBox['_000'] = _this.points['r_0_0_'+_z+'_0'].object3d; 
           _this.viewBox['_010'] = _this.points['r_0_'+parameters.repeatY+'_'+_z+'_0'].object3d; 
           _this.viewBox['_100'] = _this.points['r_'+parameters.repeatX+'_0_'+_z+'_0'].object3d;
           _this.viewBox['_110'] = _this.points['r_'+parameters.repeatX+'_'+parameters.repeatY+'_'+_z+'_0'].object3d;
        }
        else if(_z == parameters.repeatZ){  
          _this.viewBox['_001'] = _this.points['r_0_0_'+_z+'_0'].object3d ; 
          _this.viewBox['_011'] = _this.points['r_0_'+parameters.repeatY+'_'+_z+'_0'].object3d; 
          _this.viewBox['_101'] = _this.points['r_'+parameters.repeatX+'_0_'+_z+'_0'].object3d ;
          _this.viewBox['_111'] = _this.points['r_'+parameters.repeatX+'_'+parameters.repeatY+'_'+_z+'_0'].object3d;
        }
      };
          
      for (var _y = 0; _y <= parameters.repeatY; _y++) {   
         
        _this.faces.push(
          new Face(
            _this.points['r_0_'+_y+'_0_0'].object3d.position , 
            _this.points['r_'+parameters.repeatX+'_'+_y+'_0_0'].object3d.position , 
            _this.points['r_0_'+_y+'_'+parameters.repeatZ+'_0'].object3d.position ,
            _this.points['r_'+parameters.repeatX+'_'+_y+'_'+parameters.repeatZ+'_0'].object3d.position,
            gradeParameters.faceOpacity, 
            gradeParameters.faceColor,
            visible 
            )
        );
         
      }; 

      for (var _x = 0; _x <= parameters.repeatX; _x++) {   
         
        _this.faces.push(
          new Face(
            _this.points['r_'+_x+'_0_0_0'].object3d.position , 
            _this.points['r_'+_x+'_'+parameters.repeatY+'_0_0'].object3d.position , 
            _this.points['r_'+_x+'_0_'+parameters.repeatZ+'_0'].object3d.position ,
            _this.points['r_'+_x+'_'+parameters.repeatY+'_'+parameters.repeatZ+'_0'].object3d.position,
            gradeParameters.faceOpacity, 
            gradeParameters.faceColor,
            visible  
            )
        );
         
      }; 
    } 
    else{
      for (var i = 0; i < _this.hexagonalShapes.length ; i++) { 
        var oneHex = _this.hexagonalShapes[i]; 
        _this.createHexFace(oneHex, gradeParameters.faceOpacity, gradeParameters.faceColor, visible);  
      }; 
    }   
  };
  Lattice.prototype.createHexFace = function(hexagon, faceOpacity, faceColor, visible){

    var _this = this ;
    var parameters = this.parameters;
    _this.faces.push(
      new Face(
        hexagon[0] , 
        hexagon[1] , 
        hexagon[2] , 
        hexagon[3] ,  
        faceOpacity, 
        faceColor,
        visible ,
        hexagon[4] , 
        hexagon[5]  
      )
    );
    if(hexagon[0].y>0){  
      for (var i = 0; i<6; i++) {
        var next = (i==5) ? hexagon[0] : hexagon[i+1] ;
        _this.faces.push(
          new Face(
            hexagon[i] , 
            next , 
            new THREE.Vector3(next.x, next.y - parameters.scaleY, next.z) , 
            new THREE.Vector3(hexagon[i].x, hexagon[i].y - parameters.scaleY, hexagon[i].z) ,  
            faceOpacity, 
            faceColor,
            visible ,
            0  
          )
        );
      }; 
    }; 
  };
  function updateMillerVector(directional) { 
     
    var arrow = directional.direction.object3d;
    var start = directional.startPoint.clone();
    var end = directional.endpointPoint.clone();

    var length =  start.distanceTo(end) ; 
    var direction = new THREE.Vector3().subVectors( end,  start).normalize();
 
    arrow.position.set(start.x, start.y, start.z);
    arrow.setDirection(direction.normalize());
    arrow.setLength(length,  length/8, length/20); 
    directional.direction.updateDirectionPos(start, end); 
  };
  Lattice.prototype.atomVisibility = function(arg){ 

    for (var i = this.actualAtoms.length - 1; i >= 0; i--) { 
      if(this.actualAtoms[i].identity === arg.id){
        this.actualAtoms[i].object3d.visible = arg.visible;
      }
    }
    for (var i = this.actualAtoms.length - 1; i >= 0; i--) { 
      if(this.actualAtoms[i].identity === arg.id){
        this.actualAtoms[i].object3d.visible = arg.visible;
      }
    }  
  };
  Lattice.prototype.directionParameterChange = function(arg) {

    var checkParams = this.menu.getDirectionInputs();
        
    if(checkParams.millerU.length === 0 || checkParams.millerV.length === 0 || checkParams.millerW.length === 0){ 
      return;
    }
    else if(this.directionalState.state === 'creating'){
      this.directionPreview('current');
      PubSub.publish(events.DIRECTION_STATE,"editing");
      return; 
    }

    var _this = this, parameters = this.parameters ;
     
    if( !_.isUndefined(arg.dirRadius)) { 
      _.each(_this.tempDirs, function(directional, ref) { 
        directional.direction.updateTubeRadius(arg.dirRadius);   
      });
    }   
    else if( !_.isUndefined(arg.directionColor)) { 
      _.each(_this.tempDirs, function(directional, ref) { 
        directional.direction.setColor('0x'+arg.directionColor);
      });   
    } 
    else if( !_.isUndefined(arg.millerU) || !_.isUndefined(arg.millerV) || !_.isUndefined(arg.millerW) || !_.isUndefined(arg.millerT) ) { 
       
      var u = (_.isUndefined(arg.millerU)) ? _this.tempDirs[0].u : parseInt(arg.millerU); 
      var v = (_.isUndefined(arg.millerV)) ? _this.tempDirs[0].v : parseInt(arg.millerV); 
      var w = (_.isUndefined(arg.millerW)) ? _this.tempDirs[0].w : parseInt(arg.millerW); 
      var t = (_.isUndefined(arg.millerT)) ? _this.tempDirs[0].t : parseInt(arg.millerT); 
       
      if((this.latticeName === 'hexagonal')){
         
      }
      else{ 
        var devider = Math.max(Math.abs(u),Math.abs(v),Math.abs(w)), counter = 0;
        u/=devider;
        v/=devider;
        w/=devider;  

        _.times(parameters.repeatX , function(_x) {
          _.times(parameters.repeatY , function(_y) {
            _.times(parameters.repeatZ , function(_z) { 

              var directional = _this.tempDirs[counter];
              var startPoint = (new THREE.Vector3 ( (v < 0 ? (v*(-1)) : 0 ) , (w < 0 ? (w*(-1)) : 0 ) , (u < 0 ? (u*(-1)) : 0 ))) ; 
              var endpointPoint = new THREE.Vector3 (  (v < 0 ? 0 : v ) , (w < 0 ? 0 : w ) , (u < 0 ? 0 : u ) ) ; 
              startPoint.x += _x ; 
              startPoint.y += _y ; 
              startPoint.z += _z ; 
              endpointPoint.x += _x ; 
              endpointPoint.y += _y ; 
              endpointPoint.z += _z ;  
               
              directional.u = parseInt($('#millerU').val()) ; 
              directional.v = parseInt($('#millerV').val()) ; 
              directional.w = parseInt($('#millerW').val()) ; 
              directional.t = parseInt($('#millerT').val()) ; 
              directional.startPoint = startPoint; 
              directional.endpointPoint = endpointPoint; 
              directional.id = ("_"+($('#millerU').val())+""+($('#millerV').val())+""+($('#millerW').val())+"") ;
              
              _this.forwardTransformationsMiller(_this.tempDirs[counter]);   
              directional.direction.updateDirectionPos(startPoint, endpointPoint); 
            
              counter++;
            });
          });
        });
      } 
    }     
  };
  Lattice.prototype.planeParameterChange = function(arg) {

    var checkParams = this.menu.getPlaneInputs();
       
    if(checkParams.millerH.length === 0 || checkParams.millerK.length === 0 || checkParams.millerL.length === 0){ 
      return;
    }
    else if(this.planeState.state === 'creating'){
      this.planePreview('current');
      PubSub.publish(events.PLANE_STATE,"editing");
      return; 
    }
     
    var _this = this, parameters = this.parameters ;
     
    if( !_.isUndefined(arg.planeColor)) { 
      _.each(_this.tempPlanes, function(plane, ref) { 
        plane.plane.setColor('0x'+arg.planeColor);  
      }); 
    }   
    else if( !_.isUndefined(arg.planeOpacity)) { 
      _.each(_this.tempPlanes, function(plane, ref) {
        plane.plane.setOpacity(arg.planeOpacity);   
      });
    } 
    else if( !_.isUndefined(arg.millerH) || !_.isUndefined(arg.millerK) || !_.isUndefined(arg.millerL) || !_.isUndefined(arg.millerI) ) { 
      var counter = 0 ;
      var h = parseInt(($('#millerH').val())); 
      var k = parseInt(($('#millerK').val())); 
      var l = parseInt(($('#millerL').val())); 
      var i = parseInt(($('#millerI').val())); 
      
      h = (h!=0) ? 1/h : 0 ;
      k = (k!=0) ? 1/k : 0 ;
      l = (l!=0) ? 1/l : 0 ;
        
      if(_this.latticeName !== 'hexagonal'){
        if( h!=0 && k!=0 && l!=0) { 
          _.times(parameters.repeatX , function(_x) {
            _.times(parameters.repeatY , function(_y) {
              _.times(parameters.repeatZ , function(_z) {        
                var a = new THREE.Vector3( (k<0 ? (1+k) : k) + _x,  (l<0 ? 1 : 0 ) + _y , (h<0 ? 1 : 0) + _z); 
                var b = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x,  (l<0 ? (1+l) : l ) + _y, (h<0 ? 1 : 0) + _z ); 
                var c = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x, (l<0 ? 1 : 0 ) + _y, (h<0 ? (1+h) : h) + _z );
                var plane = _this.tempPlanes[counter];
                 
                plane.a = a ; 
                plane.b = b ; 
                plane.c = c ; 
                plane.h = parseInt(($('#millerH').val())) ; 
                plane.k = parseInt(($('#millerK').val())) ;  
                plane.l = parseInt(($('#millerL').val())) ;  
                plane.id =  ("_"+($('#millerH').val())+""+($('#millerK').val())+""+($('#millerL').val())+"");
                 
                var vertices = plane.plane.object3d.geometry.vertices;
                vertices[0] = a ;
                vertices[1] = b ;
                vertices[2] = c ;

                _this.forwardTransformationsMiller(plane);  
                
                counter++;
              });
            });
          });
        }
        else{ 
          var a = new THREE.Vector3(0,0,0), b = new THREE.Vector3(0,0,0), c = new THREE.Vector3(0,0,0) , d = new THREE.Vector3(0,0,0);  
          if (h!=0){
            a.z = h;
            if(k!=0){
              b.z = h;
              b.y = 1;
              c.x = k;
              c.y = 1;
              d.x = k;
            }
            else if(l!=0){
              b.z = h;
              b.x = 1;
              c.x = 1;
              c.y = l;
              d.y = l;
            }
            else{
              b.z = h;
              b.y = 1;
              c.x = 1;
              c.y = 1;
              c.z = h;
              d.x = 1;
              d.z = h;
            }
          }
          else if(k!=0){
            a.x = k;
            if(l!=0){
              b.z = 1;
              b.x = k;
              c.y = l;
              c.z = 1;
              d.y = l;     
            }
            else{
              b.x = k;
              b.y = 1;
              c.z = 1;
              c.x = k;
              c.y = 1;
              d.z = 1;
              d.x = k;
            } 
          }
          else{
            a.y = l;
            b.y = l;
            b.x = 1;
            c.x = 1;
            c.y = l;
            c.z = 1;
            d.y = l;
            d.z = 1; 
          }
          if(h<0) {
            a.z+=1;
            b.z+=1;
            c.z+=1;
            d.z+=1;
          }
          if(k<0) {
            a.x+=1;
            b.x+=1;
            c.x+=1;
            d.x+=1;
          }
          if(l<0) {
            a.y+=1;
            b.y+=1;
            c.y+=1;
            d.y+=1;
          }
          _.times(parameters.repeatX , function(_x) {
            _.times(parameters.repeatY , function(_y) {
              _.times(parameters.repeatZ , function(_z) { 
                var plane = _this.tempPlanes[counter];
                 
                plane.a = a ; 
                plane.b = b ; 
                plane.c = c ; 
                plane.d = d ; 
                plane.h = parseInt(($('#millerH').val())) ; 
                plane.k = parseInt(($('#millerK').val())) ;  
                plane.l = parseInt(($('#millerL').val())) ;  
                plane.id =  ("_"+($('#millerH').val())+""+($('#millerK').val())+""+($('#millerL').val())+"");
                
                var _a = new THREE.Vector3(a.x + _x , a.y + _y, a.z + _z);
                var _b = new THREE.Vector3(b.x + _x , b.y + _y, b.z + _z);
                var _c = new THREE.Vector3(c.x + _x , c.y + _y, c.z + _z);
                var _d = new THREE.Vector3(d.x + _x , d.y + _y, d.z + _z); 

                var vertices = plane.plane.object3d.geometry.vertices;
                vertices[0] = _a ;
                vertices[1] = _b ;
                vertices[2] = _c ;
                vertices[3] = _d ;

                _this.forwardTransformationsMiller(plane); 

                counter++;
              });
            });
          });
        }
      }   
    }   
        
  };
  Lattice.prototype.revertShearing = function() {
    this.transform(1,reverseShearing, function(value) {  
      return -value;
    });
  }; 
  Lattice.prototype.revertScaling = function() {
    this.transform(1, reverseScaling, function(value) { 
      return (value === 0 ? 0 : 1 / value);
    }); 
  }; 
  var calculateDelta = function(original, update) {
    var delta = {};
    if (_.isObject(update)) {
        _.each(update, function(value, k) {
          if ( _.isUndefined(original[k]) === false && value !== original[k]) {
            delta[k] = value;
          }
        });
    }
    return delta;
  }; 
  Lattice.prototype.backwardTransformations = function() {   
    this.revertShearing();
    this.revertScaling();
  }; 
  Lattice.prototype.forwardTransformations = function() {  
    this.transform(0,_.union(scaling, shearing), function(value) {
      return value;
    }); 
  }; 
  Lattice.prototype.update = function() {  
     
    if(this.latticeName !== 'hexagonal'){
      this.backwardTransformations();  
      this.updatePoints([this.createGrid,this.createFaces,this.forwardTransformations]);   
    }
    else{ 
      this.updatePoints([]); 
    }   
  }; 
  Lattice.prototype.setGrade = function(gradeParameters) { 
    
    var _this = this; 
    _.each(gradeParameters, function(param, k) { 
      _this.gradeParameters[k] = param ; 
    }); 
    this.setGradeParameters(); 
  }; 
  Lattice.prototype.setGradeChoices = function(gradeChoices) { 
     
    if(!_.isUndefined(gradeChoices["faceCheckButton"])) {
     
      this.gradeChoice.face = gradeChoices["faceCheckButton"];

      if(this.gradeChoice.face == false){
        _.each(this.faces, function(face) {
          face.setVisible(false);
        });
      }
      else{
        _.each(this.faces, function(face) {
          face.setVisible(true);
       });
      }

    };

    if(!_.isUndefined(gradeChoices["gridCheckButton"])) { 
      this.gradeChoice.grid = gradeChoices["gridCheckButton"];
      if(this.gradeChoice.grid == false){
        _.each(this.grids, function(grid) {
          grid.grid.setVisible(false);
        });
      }
      else{
        _.each(this.grids, function(grid) {
          grid.grid.setVisible(true);
        });
      } 
    }; 
  };

  Lattice.prototype.setGradeParameters = function() { 

    // TODO improvement: if parameter does not change loops shouldn't run

    var _this = this;
     
    if(_.isUndefined(_this.gradeParameters)) return;
      
    _.each(this.grids, function(grid) { 
      grid.grid.setRadius(_this.gradeParameters.radius);
      grid.grid.setColor( _this.gradeParameters.cylinderColor); 
    });

    _.each(this.faces, function(face) {
      face.setOpacity(_this.gradeParameters.faceOpacity);
      face.setColor( _this.gradeParameters.faceColor);
    });
 
  }
  Lattice.prototype.updateLatticeTypeRL = function(){ return 0;
    var params = this.parameters ;
    if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){ 
      $("select option[value='cubic_primitive']").attr("selected","selected");
    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
  }; 
  Lattice.prototype.setParameters = function(latticeParameters) { 
    
    var lparams = this.menu.getLatticeParameters();

    if((lparams.repeatX >= 3 || lparams.repeatY >= 3 || lparams.repeatZ >= 3) && (latticeParameters.repeatX !== undefined || latticeParameters.repeatY !== undefined || latticeParameters.repeatZ !== undefined)) { 
      this.menu.resetProgressBar('Constructing lattice...');
    }
 
    if(this.latticeName !== 'hexagonal'){  
      var delta = calculateDelta(this.parameters, latticeParameters);
      var _this = this;
      var deltaKeys = _.keys(delta); // keys : retrieve all names of object properties
       
      this.backwardTransformations(); 
   
      _.extend(this.parameters, delta);  

      if (_.indexOf(deltaKeys, 'repeatX') !== -1 || _.indexOf(deltaKeys, 'repeatY') !== -1 || _.indexOf(deltaKeys, 'repeatZ') !== -1) {  
         
        _.each(_this.actualAtoms, function(atom,k) {  atom.destroy(); });
         
        this.actualAtoms.splice(0); 
        
        this.updatePoints(
          [ 
            this.createGrid,   
            this.createFaces, 
            this.setGradeParameters, 
            this.forwardTransformations,   
            this.reCreateMillers, 
            this.recreateMotif
          ]
        ); 

      }
      else{
        this.forwardTransformations();   
      }  
    }
    else{ 
      var delta = calculateDelta(this.parameters, latticeParameters);
      var _this = this;
      var deltaKeys = _.keys(delta);  
      _.extend(this.parameters, delta); 
      _.each(_this.actualAtoms, function(atom,k) { 
        atom.destroy(); 
      });
      this.actualAtoms.splice(0); 
      this.updatePoints();   
      this.createFaces();
      this.setGradeParameters(); 
      this.recreateMotif();

    }   
    _this.updateLatticeTypeRL(); 
    
    this.menu.progressBarFinish();

  };
  Lattice.prototype.getParameters = function() {
    return this.parameters ;
  }; 
  Lattice.prototype.onLoad = function(callback) {
    PubSub.subscribe(events.LOAD, callback);
  };
  
 
  // Millers
 
  Lattice.prototype.reCreateMillers = function() {
    var _this = this; 

    this.planesUnique = _.uniq(_this.millerPlanes, function(p) { return p.id; });

    for (var i = 0; i < this.millerPlanes.length; i++) {
      this.millerPlanes[i].plane.destroy();
    }  
    this.millerPlanes.splice(0);
 
    for (var i = 0; i < this.planesUnique.length; i++) { 
      var plane = this.planesUnique[i];
      var params = {
        millerH : plane.h, 
        millerK :  plane.k, 
        millerL : plane.l,
        millerI : plane.i,
        planeColor : plane.planeColor,
        planeOpacity : plane.planeOpacity,
        planeName : plane.planeName  
      };    
      this.createMillerPlane(params, false, true);   
    }
    
    ///////////////////////////////////////////////

    this.directionsUnique = _.uniq(_this.millerDirections, function(p) { return p.id; });

    for (var i = 0; i < this.millerDirections.length; i++) {
      this.millerDirections[i].direction.destroy();
    }

    this.millerDirections.splice(0);

    for (var i = 0; i < this.directionsUnique.length; i++) { 
      var directional = this.directionsUnique[i];
      var params = {
        millerU : directional.u, 
        millerV :  directional.v, 
        millerW : directional.w,
        millerT : directional.t,
        directionColor : directional.directionColor,
        directionName : directional.directionName,
        dirRadius : directional.direction.radius
      };   
      this.createMillerDirection(params, false, true); 
    }  
  };
  Lattice.prototype.transformMiller = function( shape, parameterKeys, operation ) {
    var matrix; 
    var argument;
    var parameters = this.parameters;
    var _this = this;
     
    _.each(parameterKeys, function(k) { // TODO performance imporvement - no need to be executed so many times
 
        if (_.isUndefined(parameters[k]) === false) {
          argument = {};
          argument[k] = operation(parameters[k]);
          matrix = transformationMatrix(argument);
          if(_.isUndefined ( shape.plane) ){ 
            shape.startPoint.applyMatrix4(matrix);
            shape.endpointPoint.applyMatrix4(matrix); 

          }  
          else{ 
            shape.plane.object3d.geometry.verticesNeedUpdate = true ;
            var vertices = shape.plane.object3d.geometry.vertices;
            _.each(vertices, function(vertex , k){
              vertex.applyMatrix4(matrix); 
            }); 
          } 
        } 
    }); 
  }; 
  Lattice.prototype.revertShearingMiller = function() { 
    this.transformMiller(reverseShearing, function(value) {  
      return -value;
    });
  };
  Lattice.prototype.onDirectionStateChange = function(callback) {
    PubSub.subscribe(events.DIRECTION_STATE, callback);
  };
  Lattice.prototype.onPlaneStateChange = function(callback) { 
    PubSub.subscribe(events.PLANE_STATE, callback);
  };

  // planes
  Lattice.prototype.createMillerPlane = function(millerParameters, temp, transform, _lastSaved) {
    var _this = this ;
    var parameters = this.parameters ;
    var h = parseInt(millerParameters.millerH ); 
    var k = parseInt(millerParameters.millerK ); 
    var l = parseInt(millerParameters.millerL );
    var id;  
   
    h = (h!=0) ? 1/h : 0 ;  
    k = (k!=0) ? 1/k : 0 ;
    l = (l!=0) ? 1/l : 0 ;
    
    if(this.latticeName !== 'hexagonal'){
      if( h!=0 && k!=0 && l!=0) { 
        _.times(parameters.repeatX , function(_x) {
          _.times(parameters.repeatY , function(_y) {
            _.times(parameters.repeatZ , function(_z) {        
              var a = new THREE.Vector3( (k<0 ? (1+k) : k) + _x,  (l<0 ? 1 : 0 ) + _y , (h<0 ? 1 : 0) + _z); 
              var b = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x,  (l<0 ? (1+l) : l ) + _y, (h<0 ? 1 : 0) + _z ); 
              var c = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x, (l<0 ? 1 : 0 ) + _y, (h<0 ? (1+h) : h) + _z );
              
              var x =  new MillerPlane(a, b, c, undefined, parseInt(millerParameters.planeOpacity) , millerParameters.planeColor );
            
              id = _this.generatePlaneKey();
              if(!temp){ 
                _this.millerPlanes[id] = {
                  visible: true,
                  plane : x, 
                  a : a, 
                  b : b, 
                  c : c, 
                  id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                  h : parseInt(millerParameters.millerH),
                  k : parseInt(millerParameters.millerK),
                  l : parseInt(millerParameters.millerL),
                  planeOpacity : parseInt(millerParameters.planeOpacity),
                  planeColor : millerParameters.planeColor,
                  planeName : millerParameters.planeName,
                  lastSaved : { 
                    visible: true,  
                    a : a, 
                    b : b, 
                    c : c, 
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName
                  }
                };  
                _this.forwardTransformationsMiller(_this.millerPlanes[id]); 
              }
              else{ 
                if(_lastSaved !== undefined){
                  _this.tempPlanes.push({
                    visible: true,
                    plane : x, 
                    a : a, 
                    b : b, 
                    c : c ,  
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName,
                    lastSaved : { 
                      visible: true, 
                      a : a, 
                      b : b, 
                      c : c, 
                      id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                      h : parseInt(millerParameters.millerH),
                      k : parseInt(millerParameters.millerK),
                      l : parseInt(millerParameters.millerL),
                      planeOpacity : parseInt(millerParameters.planeOpacity),
                      planeColor : millerParameters.planeColor,
                      planeName : millerParameters.planeName
                    }
                  }); 
                }
                else{ 
                  _this.tempPlanes.push({
                    visible: true,
                    plane : x, 
                    a : a, 
                    b : b, 
                    c : c ,  
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName,
                  }); 
                }
                _this.forwardTransformationsMiller(_this.tempPlanes[_this.tempPlanes.length-1]);  
              }
            });
          });
        });
      }
      else{ 
        var a = new THREE.Vector3(0,0,0), b = new THREE.Vector3(0,0,0), c = new THREE.Vector3(0,0,0) , d = new THREE.Vector3(0,0,0);  
        if (h!=0){
          a.z = h;
          if(k!=0){
            b.z = h;
            b.y = 1;
            c.x = k;
            c.y = 1;
            d.x = k;
          }
          else if(l!=0){
            b.z = h;
            b.x = 1;
            c.x = 1;
            c.y = l;
            d.y = l;
          }
          else{
            b.z = h;
            b.y = 1;
            c.x = 1;
            c.y = 1;
            c.z = h;
            d.x = 1;
            d.z = h;
          }
        }
        else if(k!=0){
          a.x = k;
          if(l!=0){
            b.z = 1;
            b.x = k;
            c.y = l;
            c.z = 1;
            d.y = l;     
          }
          else{
            b.x = k;
            b.y = 1;
            c.z = 1;
            c.x = k;
            c.y = 1;
            d.z = 1;
            d.x = k;
          }

        }
        else{
          a.y = l;
          b.y = l;
          b.x = 1;
          c.x = 1;
          c.y = l;
          c.z = 1;
          d.y = l;
          d.z = 1;

        }
        if(h<0) {
          a.z+=1;
          b.z+=1;
          c.z+=1;
          d.z+=1;
        }
        if(k<0) {
          a.x+=1;
          b.x+=1;
          c.x+=1;
          d.x+=1;
        }
        if(l<0) {
          a.y+=1;
          b.y+=1;
          c.y+=1;
          d.y+=1;
        }
        _.times(parameters.repeatX , function(_x) {
          _.times(parameters.repeatY , function(_y) {
            _.times(parameters.repeatZ , function(_z) {
             
              var _a = new THREE.Vector3(a.x + _x , a.y + _y, a.z + _z);
              var _b = new THREE.Vector3(b.x + _x , b.y + _y, b.z + _z);
              var _c = new THREE.Vector3(c.x + _x , c.y + _y, c.z + _z);
              var _d = new THREE.Vector3(d.x + _x , d.y + _y, d.z + _z);
              var x = new MillerPlane(_a,_b,_c,_d, millerParameters.planeOpacity , millerParameters.planeColor );
              id = _this.generatePlaneKey();
              if(!temp){ 
                _this.millerPlanes[id] = {
                  visible: true,
                  plane : x, 
                  a : a, 
                  b : b, 
                  c : c , 
                  d : d , 
                  id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                  h : parseInt(millerParameters.millerH),
                  k : parseInt(millerParameters.millerK),
                  l : parseInt(millerParameters.millerL),
                  planeOpacity : parseInt(millerParameters.planeOpacity),
                  planeColor : millerParameters.planeColor,
                  planeName : millerParameters.planeName,
                  lastSaved : { 
                    visible: true,  
                    a : a, 
                    b : b, 
                    c : c, 
                    l : parseInt(millerParameters.millerL),
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName
                  }
                }; 
                _this.forwardTransformationsMiller(_this.millerPlanes[id]); 
              }
              else{
                if(_lastSaved !== undefined){ 
                  _this.tempPlanes.push({
                    visible: true,
                    plane : x, 
                    a : a, 
                    b : b, 
                    c : c , 
                    d : d , 
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName,
                    lastSaved : { 
                      visible: true,  
                      a : a, 
                      b : b, 
                      c : c, 
                      l : parseInt(millerParameters.millerL),
                      id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                      h : parseInt(millerParameters.millerH),
                      k : parseInt(millerParameters.millerK),
                      l : parseInt(millerParameters.millerL),
                      planeOpacity : parseInt(millerParameters.planeOpacity),
                      planeColor : millerParameters.planeColor,
                      planeName : millerParameters.planeName
                    }
                  }); 
                }
                else{
                  _this.tempPlanes.push({
                    visible: true,
                    plane : x, 
                    a : a, 
                    b : b, 
                    c : c , 
                    d : d , 
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName
                  }); 
                }
                _this.forwardTransformationsMiller(_this.tempPlanes[_this.tempPlanes.length-1]);
              }
            });
          });
        });
      }
    }
    else{
      if( h!=0 && k!=0 && l!=0) { 
        _.times(parameters.repeatX , function(_x) {
          _.times(parameters.repeatY , function(_y) {
            _.times(parameters.repeatZ , function(_z) {        
              var a = new THREE.Vector3( (k<0 ? (1+k) : k) + _x,  (l<0 ? 1 : 0 ) + _y , (h<0 ? 1 : 0) + _z); 
              var b = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x,  (l<0 ? (1+l) : l ) + _y, (h<0 ? 1 : 0) + _z ); 
              var c = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x, (l<0 ? 1 : 0 ) + _y, (h<0 ? (1+h) : h) + _z );
              
              var x =  new MillerPlane(a, b, c, undefined, parseInt(millerParameters.planeOpacity) , millerParameters.planeColor );
            
              id = _this.generatePlaneKey();
              if(!temp){ 
                _this.millerPlanes[id] = {
                  visible: true,
                  plane : x, 
                  a : a, 
                  b : b, 
                  c : c, 
                  id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                  h : parseInt(millerParameters.millerH),
                  k : parseInt(millerParameters.millerK),
                  l : parseInt(millerParameters.millerL),
                  planeOpacity : parseInt(millerParameters.planeOpacity),
                  planeColor : millerParameters.planeColor,
                  planeName : millerParameters.planeName,
                  lastSaved : { 
                    visible: true,  
                    a : a, 
                    b : b, 
                    c : c, 
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName
                  }
                };  
                _this.forwardTransformationsMiller(_this.millerPlanes[id]); 
              }
              else{ 
                if(_lastSaved !== undefined){
                  _this.tempPlanes.push({
                    visible: true,
                    plane : x, 
                    a : a, 
                    b : b, 
                    c : c ,  
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName,
                    lastSaved : { 
                      visible: true, 
                      a : a, 
                      b : b, 
                      c : c, 
                      id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                      h : parseInt(millerParameters.millerH),
                      k : parseInt(millerParameters.millerK),
                      l : parseInt(millerParameters.millerL),
                      planeOpacity : parseInt(millerParameters.planeOpacity),
                      planeColor : millerParameters.planeColor,
                      planeName : millerParameters.planeName
                    }
                  }); 
                }
                else{ 
                  _this.tempPlanes.push({
                    visible: true,
                    plane : x, 
                    a : a, 
                    b : b, 
                    c : c ,  
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName,
                  }); 
                }
                _this.forwardTransformationsMiller(_this.tempPlanes[_this.tempPlanes.length-1]);  
              }
            });
          });
        });
      }
      else{ 
        var a = new THREE.Vector3(0,0,0), b = new THREE.Vector3(0,0,0), c = new THREE.Vector3(0,0,0) , d = new THREE.Vector3(0,0,0);  
        if (h!=0){
          a.z = h;
          if(k!=0){
            b.z = h;
            b.y = 1;
            c.x = k;
            c.y = 1;
            d.x = k;
          }
          else if(l!=0){
            b.z = h;
            b.x = 1;
            c.x = 1;
            c.y = l;
            d.y = l;
          }
          else{
            b.z = h;
            b.y = 1;
            c.x = 1;
            c.y = 1;
            c.z = h;
            d.x = 1;
            d.z = h;
          }
        }
        else if(k!=0){
          a.x = k;
          if(l!=0){
            b.z = 1;
            b.x = k;
            c.y = l;
            c.z = 1;
            d.y = l;     
          }
          else{
            b.x = k;
            b.y = 1;
            c.z = 1;
            c.x = k;
            c.y = 1;
            d.z = 1;
            d.x = k;
          }

        }
        else{
          a.y = l;
          b.y = l;
          b.x = 1;
          c.x = 1;
          c.y = l;
          c.z = 1;
          d.y = l;
          d.z = 1;

        }
        if(h<0) {
          a.z+=1;
          b.z+=1;
          c.z+=1;
          d.z+=1;
        }
        if(k<0) {
          a.x+=1;
          b.x+=1;
          c.x+=1;
          d.x+=1;
        }
        if(l<0) {
          a.y+=1;
          b.y+=1;
          c.y+=1;
          d.y+=1;
        }
        _.times(parameters.repeatX , function(_x) {
          _.times(parameters.repeatY , function(_y) {
            _.times(parameters.repeatZ , function(_z) {
             
              var _a = new THREE.Vector3(a.x + _x , a.y + _y, a.z + _z);
              var _b = new THREE.Vector3(b.x + _x , b.y + _y, b.z + _z);
              var _c = new THREE.Vector3(c.x + _x , c.y + _y, c.z + _z);
              var _d = new THREE.Vector3(d.x + _x , d.y + _y, d.z + _z);
              var x = new MillerPlane(_a,_b,_c,_d, millerParameters.planeOpacity , millerParameters.planeColor );
              id = _this.generatePlaneKey();
              if(!temp){ 
                _this.millerPlanes[id] = {
                  visible: true,
                  plane : x, 
                  a : a, 
                  b : b, 
                  c : c , 
                  d : d , 
                  id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                  h : parseInt(millerParameters.millerH),
                  k : parseInt(millerParameters.millerK),
                  l : parseInt(millerParameters.millerL),
                  planeOpacity : parseInt(millerParameters.planeOpacity),
                  planeColor : millerParameters.planeColor,
                  planeName : millerParameters.planeName,
                  lastSaved : { 
                    visible: true,  
                    a : a, 
                    b : b, 
                    c : c, 
                    l : parseInt(millerParameters.millerL),
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName
                  }
                }; 
                _this.forwardTransformationsMiller(_this.millerPlanes[id]); 
              }
              else{
                if(_lastSaved !== undefined){ 
                  _this.tempPlanes.push({
                    visible: true,
                    plane : x, 
                    a : a, 
                    b : b, 
                    c : c , 
                    d : d , 
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName,
                    lastSaved : { 
                      visible: true,  
                      a : a, 
                      b : b, 
                      c : c, 
                      l : parseInt(millerParameters.millerL),
                      id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                      h : parseInt(millerParameters.millerH),
                      k : parseInt(millerParameters.millerK),
                      l : parseInt(millerParameters.millerL),
                      planeOpacity : parseInt(millerParameters.planeOpacity),
                      planeColor : millerParameters.planeColor,
                      planeName : millerParameters.planeName
                    }
                  }); 
                }
                else{
                  _this.tempPlanes.push({
                    visible: true,
                    plane : x, 
                    a : a, 
                    b : b, 
                    c : c , 
                    d : d , 
                    id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                    h : parseInt(millerParameters.millerH),
                    k : parseInt(millerParameters.millerK),
                    l : parseInt(millerParameters.millerL),
                    planeOpacity : parseInt(millerParameters.planeOpacity),
                    planeColor : millerParameters.planeColor,
                    planeName : millerParameters.planeName
                  }); 
                }
                _this.forwardTransformationsMiller(_this.tempPlanes[_this.tempPlanes.length-1]);
              }
            });
          });
        });
      }
    }  
  };  
  Lattice.prototype._planeState = function (state){ 
    var _this = this ;
    _this.planeState.state = state;
    switch(state) {
        case "initial":  
          this.menu.disablePlaneButtons(
            {
              'newPlane' : false,
              'deletePlane' : true,
              'savePlane' : true 
            }
          );
          this.menu.editPlaneInputs(
            {
              'millerH' : '',
              'millerK' : '',
              'millerL' : '',
              'millerI' : '',
              'planeColor' : "#1F2227",
              'planeOpacity' : 10,
              'planeName' : ""
            } 
          );
          this.menu.disablePlaneInputs(
            {
              'millerH' : true,
              'millerK' : true,
              'millerL' : true,
              'millerI' : true,
              'planeColor' : true,
              'planeOpacity' : true,
              'planeName' : true
            } 
          );  
          break;
        case "creating": 
          this.menu.disablePlaneButtons(
            {
              'newPlane' : true,
              'deletePlane' : false,
              'savePlane' : false
            }
          );
          this.menu.disablePlaneInputs(
            {
              'millerH' : false,
              'millerK' : false,
              'millerL' : false,
              'millerI' : false,
              'planeColor' : false,
              'planeOpacity' : false,
              'planeName' : false
            } 
          ); 
          this.menu.editPlaneInputs(
            {
              'millerH' : '',
              'millerK' : '',
              'millerL' : '',
              'millerI' : '',
              'planeColor' : "#1F2227",
              'planeOpacity' : 10,
              'planeName' : ""
            } 
          );
          break;
        case "editing": 
          this.menu.disablePlaneButtons(
            {
              'newPlane' : true,
              'deletePlane' : false,
              'savePlane' : false
            }
          );
          this.menu.disablePlaneInputs(
            {
              'millerH' : false,
              'millerK' : false,
              'millerL' : false,
              'millerI' : false,
              'planeColor' : false,
              'planeOpacity' : false,
              'planeName' : false
            } 
          ); 
          break;
      }
  };
  Lattice.prototype.selectPlane = function (which){ 
    var _this = this, alreadyExists = false; 

    if(which === this.planeState.editing){
      return;
    }

    if(this.planeState.editing !== '-'){
      
      var r = confirm("Your changes will be lost. Are you sure you want to proceed?");
      
      if (r !== true) {
          return;
      }  
 
      this.menu.highlightPlaneEntry({id : this.planeState.editing, color : 'bg-dark-gray'});

      if(this.tempPlanes.length === 0){
        // plane hasn't yet been created  
        this.updatePlaneList(
          undefined , 
          'current', 
          'delete'
        );
      }
      else{
        // plane has been created but we don't know if it has an old save or it is brand new

        if(this.tempPlanes[0].lastSaved !== undefined){
          // case were we have retrieve old save and recreate plane
          this.createMillerPlane(
            { 
              'millerH' : this.tempPlanes[0].lastSaved.h,
              'millerK' : this.tempPlanes[0].lastSaved.k,
              'millerL' : this.tempPlanes[0].lastSaved.l,
              'planeColor' : this.tempPlanes[0].lastSaved.planeColor,
              'planeOpacity' : this.tempPlanes[0].lastSaved.planeOpacity,
              'planeName' : this.tempPlanes[0].lastSaved.planeName   
            }, 
            false, 
            false, 
            true
          );  
          this.updatePlaneList(
            { 
              'millerH' : this.tempPlanes[0].lastSaved.h,
              'millerK' : this.tempPlanes[0].lastSaved.k,
              'millerL' : this.tempPlanes[0].lastSaved.l,
              'planeColor' : this.tempPlanes[0].lastSaved.planeColor,
              'planeOpacity' : this.tempPlanes[0].lastSaved.planeOpacity, 
              'planeName' : this.tempPlanes[0].lastSaved.planeName  
            }, 
            this.planeState.editing, 
            'edit'
          );
          alreadyExists = true;
        }
      } 
    }
 
    this.menu.highlightPlaneEntry({id : which, color : 'bg-light-purple'});
 
    for (var i = 0; i < this.tempPlanes.length; i++) {
      this.tempPlanes[i].plane.destroy(); 
    };  
    this.tempPlanes.splice(0); 
     
    PubSub.publish(events.PLANE_STATE,"editing"); 

    if(this.planeState.editing !== '-' && alreadyExists !== true){
      this.updatePlaneList(undefined, this.planeState.editing, 'delete');  
    }
    var h,k,l,name,color,visible, opacity, index, cnt = 0; 
  
    for (var j = 0; j < this.millerPlanes.length; j++) {  
      if(this.millerPlanes[j].id === which) { 
        if(color === undefined){   
          h = this.millerPlanes[j].h; 
          k = this.millerPlanes[j].k;
          l = this.millerPlanes[j].l;
          name = this.millerPlanes[j].planeName;
          color =  this.millerPlanes[j].planeColor;
          opacity =  this.millerPlanes[j].planeOpacity;   
        }
        this.millerPlanes[j].plane.destroy(); 
        cnt++;
        index = j;
      }
    }   
    this.millerPlanes.splice(index-cnt+1,cnt);
     
    this.createMillerPlane(
      { 
        'millerH' : h,
        'millerK' : k,
        'millerL' : l,
        'planeColor' : color,
        'planeOpacity' : opacity,
        'planeName' : name
      }, 
      true, 
      false, 
      true
    );

    this.planeState.editing = which; 
  
    this.menu.editPlaneInputs(
      {
        'millerH' : h,
        'millerK' : k,
        'millerL' : l,
        'millerI' : -1,
        'planeColor' : color,
        'planeOpacity' : opacity,
        'planeName' : name
      } 
    );   
  }
  Lattice.prototype.planePreview = function (which){ 
     
    var _this = this; 
 
    if((which !== this.planeState.editing || this.planeState.state === 'initial') && which !=='current' ){
      return;
    }
   
    var params = this.menu.getPlaneInputs();

    if ( isNaN(params.millerH) || isNaN(params.millerK) || isNaN(params.millerL) ) {
      return;
    }
      
    for (var i = 0; i < this.tempPlanes.length; i++) {
      this.tempPlanes[i].plane.destroy(); 
    };
    this.tempPlanes.splice(0);
    
    if(this.planeState.editing !== '-' && this.planeState.editing !== which ){
       
      this.updatePlaneList(
        undefined , 
        this.planeState.editing, 
        'delete'
      );
    }
     
    this.createMillerPlane(params, true, false); 
  }; 
  Lattice.prototype.submitPlane = function(millerParameters) {  
    if(
      ( millerParameters.millerH === "" || 
        millerParameters.millerK === "" || 
        millerParameters.millerL === ""
      )
      && ( millerParameters.button === "savePlane")) {
      return;
    }
    var _this = this ;
    var buttonClicked = millerParameters.button ;
    var planeID = "_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+"";
 
    if (this.planeState.state === "initial"){
      if( buttonClicked === "newPlane"){  
        this.updatePlaneList(
          { 
            'action' : 'save', 
            'id' : 'current', 
            'millerH' : '',
            'millerK' : '',
            'millerL' : '',
            'millerI' : '',
            'planeName' : '',  
            'planeColor' : '#1F2227'
          } , 
          'current', 
          'save'
        );
        
        this.planeState.editing = 'current';
        this.menu.highlightPlaneEntry({id : 'current', color : 'bg-light-purple'});
        PubSub.publish(events.PLANE_STATE,"creating");
      }
    }
    else if (_this.planeState.state === "creating"){
      switch(buttonClicked) {  
        case "savePlane":
            
        var found = _.find(_this.planeList, function(plane){ return plane.id === planeID; });
        if(_.isUndefined(found)){ 
          for (var i = 0; i < this.tempPlanes.length; i++) {
            this.tempPlanes[i].plane.destroy(); 
          };  
          this.tempPlanes.splice(0);
          millerParameters.planeColor = (millerParameters.planeColor.charAt( 0 ) === '#') ? (millerParameters.planeColor) : ('#'+millerParameters.planeColor);
          this.createMillerPlane(millerParameters, false, false);
          this.updatePlaneList(millerParameters, 'current', 'edit');  
          this.menu.highlightPlaneEntry({id : this.planeState.editing, color : 'bg-dark-gray'});
          this.planeState.editing = '-';
          PubSub.publish(events.PLANE_STATE,"initial");
        }
        else{
          this.menu.showTooltip({id : 'planesTooltip', title : ' This plane already exists!'})
        }
        break; 
          
      }
    }
    else if (_this.planeState.state === "editing"){

      switch(buttonClicked) {  
        case "savePlane": 
           
          millerParameters.planeColor = (millerParameters.planeColor.charAt( 0 ) === '#') ? (millerParameters.planeColor) : ('#'+millerParameters.planeColor);
          var suc = this.updatePlaneList(millerParameters, this.planeState.editing, 'edit');

          if( suc === undefined){ 
            for (var i = 0; i < this.tempPlanes.length; i++) {
              this.tempPlanes[i].plane.destroy(); 
            };  
            this.tempPlanes.splice(0);

            this.createMillerPlane(millerParameters, false, false);   
            this.menu.highlightPlaneEntry({id : this.planeState.editing, color : 'bg-dark-gray'});
            this.planeState.editing = '-';
            PubSub.publish(events.PLANE_STATE,"initial");
          }
          else{
            this.menu.showTooltip({id : 'planesTooltip', title : ' This plane already exists!'})
          }
          
          break;

        case "deletePlane": 
          PubSub.publish(events.PLANE_STATE,"initial"); 
          for (var i = 0; i < this.tempPlanes.length; i++) {
            this.tempPlanes[i].plane.destroy(); 
          };  
          this.tempPlanes.splice(0); 
          this.updatePlaneList(undefined, this.planeState.editing, 'delete'); 
          this.planeState.editing = '-';
          break;
      } 
    } 
  };
  Lattice.prototype.updatePlaneList = function(millerParameters, oldId, action)  {
    var _this = this ; 
 
    if( oldId !== undefined){ 
      _.each(_this.planeList, function(x, reference) {
        if(x.id === oldId) {
          delete _this.planeList[reference];
        }
      }); 
    } 

    var id = 'nonexistent';

    if(millerParameters !== undefined){
      if(this.planeState.state === 'initial'){
        id = 'current';
      }
      else{
        id = "_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+"";
      } 
    } 
    
    var found = (action === 'edit') ? _.find(_this.planeList, function(plane){ return plane.id === id; }) : undefined; 
     
    if( found === undefined){ 
      if(millerParameters !== undefined){ 
        this.menu.editSavedPlane(
          { 
            'action' : action,
            'h' : millerParameters.millerH,
            'k' : millerParameters.millerK,
            'l' : millerParameters.millerL,
            'i' : undefined,
            'name' : millerParameters.planeName,
            'id' : id,
            'oldId' : oldId,
            'color' : millerParameters.planeColor
          } 
        );
      }
      else{
        this.menu.editSavedPlane(
          { 
            'action' : action, 
            'id' : id,
            'oldId' : oldId 
          } 
        );
      }
    
      if( action !== 'delete'){
        var item = { id : id};
        _this.planeList.push(item); 
      }    
    }
    return found;
  };
  Lattice.prototype.planeVisibility = function (arg){  
    if(this.planeState.editing === 'current'){
      for (var i = 0; i < this.tempPlanes.length; i++) {    
        this.tempPlanes[i].plane.setVisible(arg.visible); 
      }
    }
    else{  
      for (var i = 0; i < this.millerPlanes.length; i++) {  
        if(this.millerPlanes[i].id === arg.id) { 
          this.millerPlanes[i].plane.setVisible(arg.visible);
        }
      }
    }
  };

  // directions 
  Lattice.prototype.createMillerDirection = function(millerParameters, temp, transform, _lastSaved) {
    var _this = this ;
    var hexagonal = (this.latticeName === 'hexagonal' && this.latticeType === 'hexagonal') ? true : false ;
    var parameters = this.parameters ;
    var u = parseInt(millerParameters.millerU), v = parseInt(millerParameters.millerV), w = parseInt(millerParameters.millerW), t = parseInt(millerParameters.millerT) ; 
    var id, checkVals = parseInt(u + v) * -1 ; 
 
    if(hexagonal){
      if(t != checkVals ) {   
        return null ;
      }
      var devider = Math.max(Math.abs(u),Math.abs(v),Math.abs(w),Math.abs(t));
      var aLength = parseInt(this.parameters.scaleZ) ;
      var cLength = parseInt(this.parameters.scaleY) ;

      var axis = new THREE.Vector3(0, 1, 0);

      var a3 = new THREE.Vector3( aLength, 0, 0 ); 
      var rotA3 = (t>0) ? ((Math.PI*2) / 3) : ((Math.PI*5) / 3) ;
      a3.applyAxisAngle( axis, rotA3) ;

      var a2 = new THREE.Vector3( aLength, 0, 0 );  
      var rotA2 = (v>0) ? (0) : ( Math.PI ) ;
      a2.applyAxisAngle( axis, rotA2) ;

      var a1 = new THREE.Vector3( aLength, 0, 0 ); 
      var rotA1 = (u>0) ? ((Math.PI*4) / 3) : ( Math.PI/3 ) ;
      a1.applyAxisAngle( axis, rotA1) ;

      var c = new THREE.Vector3(0,cLength,0);  
      a1.setLength(Math.abs(u/devider));
      a2.setLength(Math.abs(v/devider));
      a3.setLength(Math.abs(t/devider));
      c.setLength(Math.abs(w/devider)); 
      
      a1.add(a2.add(a3.add(c)));
      new MillerVector(new THREE.Vector3(0,0,0) , a1, millerParameters.directionColor, millerParameters.dirRadius) ;  
       
    }
    else{ 
      var devider = Math.max(Math.abs(u),Math.abs(v),Math.abs(w));
      u/=devider;
      v/=devider;
      w/=devider;  

      _.times(parameters.repeatX , function(_x) {
        _.times(parameters.repeatY , function(_y) {
          _.times(parameters.repeatZ , function(_z) {
            id = _this.generateDirectionKey() ;
            var startPoint = (new THREE.Vector3 ( (v < 0 ? (v*(-1)) : 0 ) , (w < 0 ? (w*(-1)) : 0 ) , (u < 0 ? (u*(-1)) : 0 ))) ; 
            var endpointPoint = new THREE.Vector3 (  (v < 0 ? 0 : v ) , (w < 0 ? 0 : w ) , (u < 0 ? 0 : u ) ) ; 
            startPoint.x += _x ; 
            startPoint.y += _y ; 
            startPoint.z += _z ; 
            endpointPoint.x += _x ; 
            endpointPoint.y += _y ; 
            endpointPoint.z += _z ; 
            if(!temp){ 
              _this.millerDirections[id] = {
                visible: true,
                direction : undefined,
                startPoint : startPoint , 
                endpointPoint : endpointPoint,
                id : ("_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
                u : parseInt(millerParameters.millerU),
                v : parseInt(millerParameters.millerV),
                w : parseInt(millerParameters.millerW),
                directionColor : millerParameters.directionColor,
                name : millerParameters.directionName,
                lastSaved : { 
                  visible: true, 
                  startPoint : startPoint , 
                  endpointPoint : endpointPoint,
                  id : ("_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
                  u : parseInt(millerParameters.millerU),
                  v : parseInt(millerParameters.millerV),
                  w : parseInt(millerParameters.millerW),
                  directionColor : millerParameters.directionColor,
                  name : millerParameters.directionName,
                  dirRadius : millerParameters.dirRadius
                }
              };
               
              _this.forwardTransformationsMiller(_this.millerDirections[id]); 
              _this.millerDirections[id].direction  = new MillerVector(startPoint , endpointPoint, millerParameters.directionColor, millerParameters.dirRadius) ;
            
            }
            else{  
              if(_lastSaved !== undefined){
                _this.tempDirs.push({
                  visible: true,
                  direction : undefined,
                  startPoint : startPoint , 
                  endpointPoint : endpointPoint,
                  id : ("_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
                  u : parseInt(millerParameters.millerU),
                  v : parseInt(millerParameters.millerV),
                  w : parseInt(millerParameters.millerW),
                  directionColor : millerParameters.directionColor,
                  name : millerParameters.directionName,
                  lastSaved : { 
                    visible: true, 
                    startPoint : startPoint , 
                    endpointPoint : endpointPoint,
                    id : ("_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
                    u : parseInt(millerParameters.millerU),
                    v : parseInt(millerParameters.millerV),
                    w : parseInt(millerParameters.millerW),
                    directionColor : millerParameters.directionColor,
                    name : millerParameters.directionName,
                    dirRadius : millerParameters.dirRadius
                  }
                });
              }
              else{
                _this.tempDirs.push({
                  visible: true,
                  direction : undefined,
                  startPoint : startPoint , 
                  endpointPoint : endpointPoint,
                  id : ("_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
                  u : parseInt(millerParameters.millerU),
                  v : parseInt(millerParameters.millerV),
                  w : parseInt(millerParameters.millerW),
                  directionColor : millerParameters.directionColor,
                  name : millerParameters.directionName
                });
              }
              _this.forwardTransformationsMiller(_this.tempDirs[_this.tempDirs.length-1]); 
              _this.tempDirs[_this.tempDirs.length-1].direction  = new MillerVector(startPoint , endpointPoint, millerParameters.directionColor, millerParameters.dirRadius) ;
            }
          });
        });
      });
    }
  }; 
  Lattice.prototype.directionState = function (state){
    var _this = this ;
    this.directionalState.state = state;
   
    switch(state) {
        case "initial": 
          this.menu.disableDirectionButtons(
            {
              'saveDirection' : true,
              'deleteDirection' : true,
              'newDirection' : false
            }
          );
          this.menu.disableDirectionInputs(
            {
              'millerU' : true,
              'millerV' : true,
              'millerW' : true,
              'millerT' : true,
              'directionColor' : true,
              'dirRadius' : true,
              'directionName' : true
            }
          );
          this.menu.editDirectionInputs(
            {
              'millerU' : '',
              'millerV' : '',
              'millerW' : '',
              'millerT' : '',
              'directionColor' : '#1F2227',
              'dirRadius' : 1,
              'directionName' : ""
            }
          );  
          break;
        case "creating": 
          this.menu.disableDirectionButtons(
            {
              'saveDirection' : false,
              'deleteDirection' : false,
              'newDirection' : true 
            }
          );

          this.menu.disableDirectionInputs(
            {
              'millerU' : false,
              'millerV' : false,
              'millerW' : false,
              'millerT' : false,
              'directionColor' : false,
              'dirRadius' : false,
              'directionName' : false
            }
          );
          this.menu.editDirectionInputs(
            {
              'millerU' : '',
              'millerV' : '',
              'millerW' : '',
              'millerT' : '',
              'directionColor' : '#1F2227',
              'dirRadius' : 1,
              'directionName' : ""
            }
          );
          break;
        case "editing":  
          this.menu.disableDirectionButtons( 
            {
              'saveDirection' : false,
              'deleteDirection' : false,
              'newDirection' : true
            }
          );
          this.menu.disableDirectionInputs(
            {
              'millerU' : false,
              'millerV' : false,
              'millerW' : false,
              'millerT' : false,
              'directionColor' : false,
              'dirRadius' : false,
              'directionName' : false
            }
          );
          break;
      }
  };  
  Lattice.prototype.selectDirection = function (which){ 
     
    var _this = this, alreadyExists = false; 

    if(which === this.directionalState.editing){
      return;
    }
     
    if(this.directionalState.editing !== '-'){
     
      var r = confirm("Your changes will be lost. Are you sure you want to proceed?");
      
      if (r !== true) {
          return;
      }  

      this.menu.highlightDirectionEntry({id : this.directionalState.editing, color : 'bg-dark-gray'});

      if(this.tempDirs.length === 0){ 
        // plane hasn't yet been created  
        this.updateDirectionList(
          undefined , 
          'current', 
          'delete'
        );
      }
      else{ 
        // plane has been created but we don't know if it has an old save or it is brand new
         
        if(this.tempDirs[0].lastSaved !== undefined){
          // case were we have retrieve old save and recreate plane
          this.createMillerDirection(
            { 
              'millerU' : this.tempDirs[0].lastSaved.u,
              'millerV' : this.tempDirs[0].lastSaved.v,
              'millerW' : this.tempDirs[0].lastSaved.w,
              'directionColor' : this.tempDirs[0].lastSaved.directionColor, 
              'directionName' : this.tempDirs[0].lastSaved.directionName,  
              'dirRadius' : this.tempDirs[0].lastSaved.radius   
            }, 
            false, 
            false, 
            true
          );  
          this.updateDirectionList(
            { 
              'millerU' : this.tempDirs[0].lastSaved.u,
              'millerV' : this.tempDirs[0].lastSaved.v,
              'millerW' : this.tempDirs[0].lastSaved.w,
              'directionColor' : this.tempDirs[0].lastSaved.directionColor,  
              'directionName' : this.tempDirs[0].lastSaved.name  
            }, 
            this.directionalState.editing, 
            'edit'
          );
          alreadyExists = true;
        }
      } 
    }
  
    this.menu.highlightDirectionEntry({id : which, color : 'bg-light-purple'});
 
    for (var i = 0; i < this.tempDirs.length; i++) {
      this.tempDirs[i].direction.destroy();  
    };  
    this.tempDirs.splice(0); 
    
    if(this.directionalState.editing !== '-' && alreadyExists !== true){
      this.updateDirectionList(undefined, this.directionalState.editing, 'delete');  
    }

    var u,v,w,name,color, dirRadius, index;
    PubSub.publish(events.DIRECTION_STATE,"editing"); 
   
    var index,cnt=0 ; 
 
    for (var j = 0; j < this.millerDirections.length; j++) {  
      if(this.millerDirections[j].id === which) { 
        if(color === undefined){  
          u = this.millerDirections[j].u;
          v = this.millerDirections[j].v;
          w = this.millerDirections[j].w;
          name = this.millerDirections[j].name;
          color = this.millerDirections[j].directionColor; 
          dirRadius = this.millerDirections[j].direction.radius ;  
        }
        this.millerDirections[j].direction.destroy();
        cnt++;
        index = j;
      }
    }   
    this.millerDirections.splice(index-cnt+1,cnt);
      
    this.createMillerDirection({
      'millerU' : u,
      'millerV' : v,
      'millerW' : w,
      'directionColor' : color,
      'dirRadius' : dirRadius, 
      'directionName' : name
      }, 
      true, 
      false, 
      true
    );

    this.directionalState.editing = which; 
     
    this.menu.editDirectionInputs(
      {
        'millerU' : u,
        'millerV' : v,
        'millerW' : w,
        'millerT' : -1,
        'directionColor' : color,
        'dirRadius' : dirRadius,
        'directionName' : name
      } 
    );  
  }; 
  Lattice.prototype.directionPreview = function (which){ 
     
    var _this = this; 
 
    if((which !== this.directionalState.editing || this.directionalState.state === 'initial') && which !=='current' ){
      return;
    }
   
    var params = this.menu.getDirectionInputs();

    if ( isNaN(params.millerU) || isNaN(params.millerV) || isNaN(params.millerW) ) {
      return;
    }
      
    for (var i = 0; i < this.tempDirs.length; i++) {
      this.tempDirs[i].direction.destroy(); 
    };
    this.tempDirs.splice(0);
    
    if(this.directionalState.editing !== '-' && this.directionalState.editing !== which ){ 
      this.updateDirectionList(millerParameters, this.directionalState.editing, 'delete'); 
    }
     
    this.createMillerDirection(params, true, false); 
  };  
  Lattice.prototype.submitDirectional = function(millerParameters) {  
    if(
      ( millerParameters.millerU === "" || 
        millerParameters.millerV === "" || 
        millerParameters.millerW === ""
      )
      && ( millerParameters.button === "saveDirection")) {
      return;
    }
    var _this = this ;
    var buttonClicked = millerParameters.button ;
    var directionID = "_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+"";
 
    if (this.directionalState.state === "initial"){
      if( buttonClicked === "newDirection"){    
        this.updateDirectionList(
          { 
            'action' : 'save', 
            'id' : 'current', 
            'millerU' : '',
            'millerV' : '',
            'millerW' : '',
            'millerT' : '',
            'directionName' : '',
            'directionColor' : '#1F2227'
          } , 
          'current', 
          'save'
        );

        this.directionalState.editing = 'current';
        this.menu.highlightDirectionEntry({id : 'current', color : 'bg-light-purple'});
        PubSub.publish(events.DIRECTION_STATE,"creating");
      }
    }
    else if (_this.directionalState.state === "creating"){
      switch(buttonClicked) {  
        case "saveDirection":
            
        var found = _.find(_this.directionalList, function(dir){ return dir.id === directionID; });
        if(_.isUndefined(found)){ 
          for (var i = 0; i < this.tempDirs.length; i++) {
            this.tempDirs[i].direction.destroy(); 
          };  
          this.tempDirs.splice(0);
          millerParameters.directionColor = (millerParameters.directionColor.charAt( 0 ) === '#') ? (millerParameters.directionColor) : ('#'+millerParameters.directionColor);
          this.createMillerDirection(millerParameters, false, false);
          this.updateDirectionList(millerParameters, 'current', 'edit');  
          this.menu.highlightDirectionEntry({id : this.directionalState.editing, color : 'bg-dark-gray'});
          this.directionalState.editing = '-';
          PubSub.publish(events.DIRECTION_STATE,"initial");
        }
        else{
          this.menu.showTooltip({id : 'directionsTooltip', title : ' This direction already exists!'})
        }
        break; 
          
      }
    }
    else if (_this.directionalState.state === "editing"){

      switch(buttonClicked) {  
        case "saveDirection": 
           
          millerParameters.directionColor = (millerParameters.directionColor.charAt( 0 ) === '#') ? (millerParameters.directionColor) : ('#'+millerParameters.directionColor);
          var suc = this.updateDirectionList(millerParameters, this.directionalState.editing, 'edit');

          if( suc === undefined){ 
            for (var i = 0; i < this.tempDirs.length; i++) {
              this.tempDirs[i].direction.destroy(); 
            };  
            this.tempDirs.splice(0);

            this.createMillerDirection(millerParameters, false, false);   
            this.menu.highlightDirectionEntry({id : this.directionalState.editing, color : 'bg-dark-gray'});
            this.directionalState.editing = '-';
            PubSub.publish(events.DIRECTION_STATE,"initial");
          }
          else{
            this.menu.showTooltip({id : 'directionsTooltip', title : ' This direction already exists!'})
          }
          
          break;

        case "deleteDirection": 
          PubSub.publish(events.DIRECTION_STATE,"initial"); 
          for (var i = 0; i < this.tempDirs.length; i++) {
            this.tempDirs[i].direction.destroy(); 
          };  // delete
          this.tempDirs.splice(0); 
          this.updateDirectionList(millerParameters, this.directionalState.editing, 'delete'); 
          this.directionalState.editing = '-';
          break;
      } 
    }  
  };
  Lattice.prototype.updateDirectionList = function(millerParameters, oldId, action)  {
    var _this = this ; 
    
    if( oldId !== undefined){ 
      _.each(_this.directionalList, function(x, reference) {
        if(x.id === oldId) {
          delete _this.directionalList[reference];
        }
      }); 
    } 

    var id = 'nonexistent';

    if(millerParameters !== undefined){
      if(this.directionalState.state === 'initial'){
        id = 'current';
      }
      else{
        id = "_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+"";
      } 
    } 
 
    var found = (action === 'edit') ? _.find(_this.directionalList, function(dir){ return dir.id === id; }) : undefined; 

    if( found === undefined){ 
      if(millerParameters !== undefined){ 
        this.menu.editSavedDirection(
          { 
            'action' : action,
            'u' : millerParameters.millerU,
            'v' : millerParameters.millerV,
            'w' : millerParameters.millerW,
            't' : undefined,
            'name' : millerParameters.directionName,
            'id' : id,
            'oldId' : oldId,
            'dirRadius' : dirRadius,
            'color' : millerParameters.directionColor
          } 
        );
      } 
      else{
        this.menu.editSavedDirection(
          { 
            'action' : action, 
            'id' : id,
            'oldId' : oldId 
          } 
        );
      }
      if( action !== 'delete'){
        var item = { id : id};
        _this.directionalList.push(item); 
      }    
    }
    return found;
  };
  Lattice.prototype.directionVisibility = function (arg){ 
    if(this.directionalState.editing === 'current'){
      for (var i = 0; i < this.tempDirs.length; i++) {    
        this.tempDirs[i].direction.setVisible(arg.visible); 
      }
    }
    else{  
      for (var i = 0; i < this.millerDirections.length; i++) {  
        if(this.millerDirections[i].id === arg.id) { 
          this.millerDirections[i].direction.setVisible(arg.visible);
        }
      }
    }
  };
  //

  Lattice.prototype.getLatticeType = function(){
    if(!this.lattice){
      return;
    }
    var lattice = this.lattice;
    var l = lattice.latticeType; 
    return l;
  };
  Lattice.prototype.getLatticeSystem = function(){
    if(!this.lattice){
      return;
    }
    var lattice = this.lattice;
    var l = lattice.latticeSystem; 
    return l;
  };
  Lattice.prototype.atomToggle = function(arg){ 
    var visible = arg.atomToggle ;
    this.actualAtoms.forEach(function(atom, i) {  
      atom.object3d.visible = visible ;
    });
  };
  Lattice.prototype.planeToggle = function(arg){ 
    var _this = this;
    _.each(this.millerPlanes, function(p, reference) {
      p.plane.setVisible(arg.planeToggle); 
    });
    _.each(this.tempPlanes, function(p, reference) {
      p.plane.setVisible(arg.planeToggle);  
    }); 
  };
  Lattice.prototype.directionToggle = function(arg){
  var _this = this;
    _.each(this.millerDirections, function(d, reference) {
      d.direction.setVisible(arg.directionToggle); 
    }); 
    _.each(this.tempDirs, function(d, reference) {
      d.direction.setVisible(arg.directionToggle); 
    }); 
  };
  Lattice.prototype.togglePoints = function(arg){  
    var _this = this;
    _.each(this.points, function(point, reference) {
      point.object3d.visible = arg.latticePoints; 
    }); 
  };
  Lattice.prototype.getLatticeName = function(){ 
    if(!this.lattice){
      return;
    }
    return this.latticeName;
  };
  Lattice.prototype.revertScalingMiller = function() {
    this.transformMiller(reverseScaling, function(value) {
      return (value === 0 ? 0 : 1 / value);
    });
  };

  Lattice.prototype.backwardTransformationsMiller = function() { 
    this.revertShearingMiller();
    this.revertScalingMiller();
  };

  Lattice.prototype.forwardTransformationsMiller = function(shape) { 

    this.transformMiller(shape,_.union(scaling, shearing), function(value) {
      return value;
    });
  };
  function updateGrid ( grid) {
    
    var _grid = grid.grid.object3d;
    var pointA = grid.a;
    var pointB = grid.b; 
    var distance = pointA.distanceTo(pointB) ; 
    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(distance/2);

    var newPoint =  pointA.clone().add(dir) ;  
    var direction = new THREE.Vector3().subVectors( pointB, newPoint );
    var direcNorm = direction;
    direcNorm.normalize(); 

    var arrow = new THREE.ArrowHelper( direcNorm ,newPoint );

    _grid.rotation.set(arrow.rotation.x,arrow.rotation.y,arrow.rotation.z);
    _grid.scale.y = distance/0.001; //distance/grid.geometry.parameters.height;
    _grid.position.set(newPoint.x,newPoint.y,newPoint.z);

  }; 
  Lattice.prototype.generatePlaneKey = function() {
    return (this.millerPlanes.length); 
  }
  Lattice.prototype.generateDirectionKey = function() {
    return (this.millerDirections.length); 
  }
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
  Lattice.prototype.customBoxForHexCell = function() { 
    var vertices = [];
    var faces = [];
    var _this = this ;

    var bottomFacePoints=[];
    var upperFacePoints=[]; 

    _.times(2, function(_y) {  
      _.times(6 , function(_r) { 

        var v = new THREE.Vector3( _this.parameters.scaleZ, 0, 0 ); 
        var axis = new THREE.Vector3( 0, 1, 0 );
        var angle = (Math.PI / 3) * _r ; 
        v.applyAxisAngle( axis, angle );

        var z = v.z ;
        var y = v.y + _y*_this.parameters.scaleY ;
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
     
    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;

    geom.mergeVertices();

    return geom;
  };
  Lattice.prototype.customBox = function(points) { 

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

          var v = new THREE.Vector3( _this.parameters.scaleZ, 0, 0 ); 
          var axis = new THREE.Vector3( 0, 1, 0 );
          var angle = (Math.PI / 3) * _r ; 
          v.applyAxisAngle( axis, angle );

          var z = v.z ;
          var y = v.y + _y*_this.parameters.scaleY ;
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

    return geom;
  }

  return Lattice;

});
