/*global define*/
'use strict';

define([
  'jquery',
  'jquery-ui',
  'pubsub',
  'underscore',  
  'millervector',
  'millerplane',
  'atomSphere' 
], function(
  jQuery,
  jQuery_ui,
  PubSub,
  _,
  MillerVector,
  MillerPlane ,
  AtomSphere
) {
  
  function RestoreCWstate( menu, lattice, motifEditor, orbitCrystal , orbitUnitCell, motifXcam,motifYcam,motifZcam, crystalRenderer, unitCellRenderer,crystalScene, unitCellScene, hudCube, hudArrows, motifRenderer, soundMachine )  {  
    this.menu = menu ;
    this.lattice = lattice ;
    this.motifEditor = motifEditor ;
    this.orbitCrystal = orbitCrystal ;
    this.orbitUnitCell = orbitUnitCell ;
    this.motifXcam = motifXcam ;
    this.motifYcam = motifYcam ;
    this.motifZcam = motifZcam ;
    this.crystalRenderer = crystalRenderer ;
    this.unitCellRenderer = unitCellRenderer ;
    this.crystalScene = crystalScene ;
    this.hudCube = hudCube ;
    this.hudArrows = hudArrows ;
    this.motifRenderer = motifRenderer ;
    this.unitCellScene = unitCellScene ;
    this.soundMachine = soundMachine
    this.cwObj; 
  }; 
  RestoreCWstate.prototype.configureState = function(cwObj) { 
      
    var _this = this; 

    this.cwObj = cwObj;  

    this.configureCameraSettings();
    this.configureAxisSettings(); 
    this.configureGradeSettings(); 
    this.configureVisualizationSettings();

    this.soundMachine.switcher(this.cwObj.appUI.visualTab.visualTools.sound.state);
    this.soundMachine.changeVolume(this.cwObj.appUI.visualTab.visualTools.sound.volume);
 
    // important to destroy now the crystal atoms
    _.each(_this.lattice.actualAtoms, function(atom,k) {
      atom.destroy();   
    }); 
    this.lattice.actualAtoms.splice(0); 
 
    // AFTER ADDING EVERYTHING

    if(this.cwObj.system.latticeParams.lattice){  

      this.configureLatticeSettings(); 
      this.configureMillerObjectsSettings();

      this.lattice.updatePoints([this.lattice.createGrid,this.lattice.createFaces,this.lattice.forwardTransformations]);  
       
      this.lattice.reCreateMillers();
 
      this.lattice.setGradeChoices( {'faceCheckButton': this.cwObj.system.cellVisualization.faces.visible} );
      this.lattice.setGradeChoices( {'gridCheckButton': this.cwObj.system.cellVisualization.edges.visible} );
      this.lattice.setGradeParameters();

      this.configureMotifEditorSettings();
    }
    
    console.log(999999);
  }; 
  RestoreCWstate.prototype.globalReset = function(arg) { 

  // LATTICE 

    // remove 3d objects

    for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) {
      this.lattice.actualAtoms[i].destroy();
    }; 
    for (var i = 0; i < this.lattice.millerDirections.length; i++) {
      this.lattice.millerDirections[i].direction.destroy();
    }  
    for (var i = 0; i < this.lattice.tempDirs.length; i++) {
      this.lattice.tempDirs[i].direction.destroy();  
    };   
    for (var i = 0; i < this.lattice.millerPlanes.length; i++) {
      this.lattice.millerPlanes[i].plane.destroy(); 
    }; 
    for (var i = 0; i < this.lattice.millerPlanes.length; i++) {
      this.lattice.millerPlanes[i].plane.destroy();
    } 
    for (var i = 0; i < this.lattice.tempPlanes.length; i++) {
      this.lattice.tempPlanes[i].plane.destroy(); 
    }; 
    for (var i = 0; i < this.lattice.cachedAtoms.length; i++) { 
      this.cachedAtoms[i].destroy();  
    } 
    for (var i = 0; i<this.lattice.actualAtoms.length; i++) { 
      this.lattice.actualAtoms[i].removesubtractedForCache();  
    } 
    for (var i = 0; i<this.lattice.cachedAtoms.length; i++) { 
      this.lattice.cachedAtoms[i].removesubtractedForCache();  
    }  
    _.each(this.lattice.points, function(point, reference) {
      point.destroy(); 
    }); 
    _.each(this.lattice.grids, function(grid, reference) {
      grid.grid.destroy(); 
    }); 
    _.each(this.lattice.faces, function(face, reference) {
        face.destroy();
      });

    // reset global variables

    this.lattice.lattice = null;

    this.lattice.parameters = {
      repeatX: 1, repeatY: 1, repeatZ: 1,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      alpha: 90, beta: 90, gamma: 90
    };

    this.lattice.points = {}; 
    this.lattice.mutex = false;
    this.lattice.currentMotif = [];
    this.lattice.latticeName = 'none';  
    this.lattice.latticeType = 'none';  
    this.lattice.latticeSystem = 'none';  
    this.lattice.actualAtoms = []; 

    // grade
    this.lattice.gradeChoice = {"face":false, "grid":false};
    this.lattice.gridPointsPos = [];
    this.lattice.grids = [];
    this.lattice.hexGrids = {};
    this.lattice.faces = [];
    this.lattice.gradeParameters = {"radius" : 2, "cylinderColor" : "A19EA1" , "faceOpacity" : 3 , "faceColor" : "907190"};
    this.lattice.hexagonalShapes = [] ;
    // miller
    this.lattice.millerParameters = []; 

    this.lattice.millerPlanes = [];
    this.lattice.planeState = {state:"initial", editing : undefined };
    this.lattice.planeList = [];
    this.lattice.tempPlanes = [];

    this.lattice.millerDirections = [];
    this.lattice.directionalState = {state:"initial", editing : undefined };    
    this.lattice.directionalList = [];
    this.lattice.tempDirs = [] ;
    this.lattice.planesUnique = [];
    this.lattice.directionsUnique = [] ;

    //view
    this.lattice.viewBox = [];
    this.lattice.viewMode = 'crystalClassic'; 
    this.lattice.crystalNeedsRecalculation = {'cellSolidVoid' : false, 'cellSubstracted' : false};
    this.lattice.cachedAtoms = [];
    // visualization
    this.lattice.renderingMode = 'realistic';
    this.lattice.confirmationFunction = { id : ' ', object : ' '};
 
    this.lattice.labeling = false;
 
  // MOTIF EDITOR

    // remove 3d objects

    if(this.motifEditor.newSphere !== undefined){
      this.motifEditor.newSphere.destroy() ; 
    }  
    for (var i = 0; i<this.motifEditor.unitCellAtoms.length; i++) { 
      this.motifEditor.unitCellAtoms[i].destroy();  
    } 
    for (var i = 0; i<this.motifEditor.unitCellAtoms.length; i++) { 
      this.motifEditor.unitCellAtoms[i].removesubtractedForCache();  
    } 
    for (var i = 0; i<this.motifEditor.cachedAtoms.length; i++) { 
      this.motifEditor.cachedAtoms[i].removesubtractedForCache();  
    }  
    for (var i = 0; i<this.motifEditor.motifsAtoms.length; i++) { 
      this.motifEditor.motifsAtoms[i].destroy();  
    } 
    for (var i = 0; i<this.motifEditor.cachedAtoms.length; i++) { 
      this.motifEditor.cachedAtoms[i].destroy();  
    } 

    if( this.motifEditor.newSphere !== undefined){
      this.motifEditor.newSphere.removesubtractedForCache();
    }
     
    // global variables 
   
    this.motifEditor.cellParameters = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 
    this.motifEditor.initialLatticeParams = { "alpha" : 90, "beta" : 90, "gamma" : 90, "scaleX" : 1, "scaleY" : 1, "scaleZ" : 1 }; 
    
    this.motifEditor.motifsAtoms = [];
    this.motifEditor.unitCellAtoms = [];
    this.motifEditor.unitCellPositions = {}; 
    this.motifEditor.viewMode = 'cellClassic';
    this.motifEditor.editorState = {state : "initial", fixed: false, atomPosMode : 'absolute', updated : false } ; 
    this.motifEditor.isEmpty = true ;
    this.motifEditor.latticeName = 'none';
    this.motifEditor.latticeType = 'none';  
    this.motifEditor.latticeSystem = 'none';
 
    this.motifEditor.manualSetCellAngles = false;
    this.motifEditor.leastCellLengths = {'x' : 0, 'y' : 0, 'z' : 0 };
    this.motifEditor.leastCellAngles = {'alpha' : 2, 'beta' : 2, 'gamma' : 2 };
    this.motifEditor.cellVolume =  {col : false, xInitVal : 0.5, yInitVal : 0.5, zInitVal : 0.5, aCol : false, bCol : false, cCol : false};

    this.motifEditor.newSphere = undefined;
    this.motifEditor.lastSphereAdded = undefined;
    this.motifEditor.dragMode = false;
    this.motifEditor.tangentToThis = undefined;
    this.motifEditor.rotAxis = 'x';
    this.motifEditor.mutex = true ;
    this.motifEditor.cellMutex = true ;
    this.motifEditor.globalTangency = true;
    this.motifEditor.padlock = true;
 
    // rendering mode
    this.motifEditor.renderingMode = 'realistic';  
    this.motifEditor.cellNeedsRecalculation = {'cellSolidVoid' : false, 'cellSubstracted' : false};
    this.motifEditor.cachedAtoms = [];
    this.motifEditor.cachedAtomsPositions = {};
    this.motifEditor.box3 = {bool : false, pos : undefined};  
 
    this.motifEditor.labeling = false;
    
    // CAMERAS
    
    this.motifXcam.position.set(0,0,50);  
    this.motifYcam.position.set(50,0,0);  
    this.motifZcam.position.set(0,50,0);  
    
    this.orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
    this.orbitUnitCell.control.target = new THREE.Vector3(0,0,0) ;
    
    this.crystalRenderer.cameras[0].fov = 15 ;  
    this.orbitCrystal.camera.position.set(30,30,60);
    this.orbitUnitCell.camera.position.set(20,20,40);
 
    this.orbitCrystal.sync = false;
    this.orbitUnitCell.sync = false; 
    
    // OTHER SCENE FEATURES

    this.crystalScene.AmbLight.color.setHex( 0x4D4D4C ); 
    this.crystalScene.light.intensity = 1 ;
    this.crystalScene.light.castShadow = true;  
    this.crystalScene.object3d.fog.density = 0 ;
    this.motifEditor.editObjectsInScene('crystalSolidVoid', 'remove', true);

    this.unitCellScene.AmbLight.color.setHex( 0x4D4D4C ); 
    this.unitCellScene.light.intensity = 1 ;
    this.unitCellScene.light.castShadow = true;
    this.lattice.editObjectsInScene('crystalSolidVoid', 'remove', true);

    // RENDERERS

    this.crystalRenderer.setAnaglyph(false);
    this.crystalRenderer.setUCviewport(false);

    this.crystalRenderer.backgroundColor = 0x000000;  
    this.unitCellRenderer.backgroundColor = 0x000000; 
    this.motifRenderer.viewportColors[0] = 0x000000;  
    this.motifRenderer.viewportColors[1] = 0x000000;  
    this.motifRenderer.viewportColors[2] = 0x000000;   
 
    // SOUNDS

    this.soundMachine.switcher(false);
    this.soundMachine.changeVolume(75);
  };
  RestoreCWstate.prototype.configureVisualizationSettings = function() {
    var visualTab = this.cwObj.appUI.visualTab ; 

    this.crystalScene.fogActive = visualTab.visualTools.fog.state ;
      
    this.crystalScene.setFogProperties({
      "fogDensity" : visualTab.visualTools.fog.density,
      "fogColor" : visualTab.visualTools.fog.color,
      "fog" : visualTab.visualTools.fog.state,
    })
  
    this.crystalRenderer.backgroundColor = visualTab.visualTools.colorization.crystalScreenColor ; 
    this.unitCellRenderer.backgroundColor = visualTab.visualTools.colorization.cellScreenColor ; 
    this.motifRenderer.viewportColors[0] = visualTab.visualTools.colorization.motifXScreenColor ; 
    this.motifRenderer.viewportColors[1] = visualTab.visualTools.colorization.motifYScreenColor ; 
    this.motifRenderer.viewportColors[2] = visualTab.visualTools.colorization.motifZScreenColor ; 
    
    this.crystalScene.setLightProperties(visualTab.visualParameters.lights.lights);
    this.unitCellScene.setLightProperties(visualTab.visualParameters.lights.lights); 
    
    this.crystalRenderer.ssaoEffect(visualTab.visualParameters.lights.ssao); 
    this.unitCellRenderer.ssaoEffect(visualTab.visualParameters.lights.ssao);

    this.crystalRenderer.shadowing(visualTab.visualParameters.lights.shadows); 
    this.unitCellRenderer.shadowing(visualTab.visualParameters.lights.shadows);
 
    this.crystalRenderer.setAnaglyph(visualTab.visualParameters.stereoscopicEffect.anaglyph);
    this.motifRenderer.setAnaglyph(visualTab.visualParameters.stereoscopicEffect.anaglyph);
    this.unitCellRenderer.setAnaglyph(visualTab.visualParameters.stereoscopicEffect.anaglyph);

  };
  RestoreCWstate.prototype.configureMotifEditorSettings = function() {

    var cell = this.cwObj.system.unitCell ;
    var atoms = this.cwObj.system.motif ;
    var latticeParams = this.cwObj.system.latticeParams.lattice.defaults ;
    
    var anglesScales = { 'alpha': latticeParams.alpha, 'beta': latticeParams.beta, 'gamma': latticeParams.gamma, 'scaleX': latticeParams.scaleX, 'scaleY': latticeParams.scaleY, 'scaleZ':latticeParams.scaleZ  };

    this.motifEditor.cellParameters = { 'alpha': latticeParams.alpha, 'beta': latticeParams.beta, 'gamma': latticeParams.gamma, 'scaleX': latticeParams.scaleX, 'scaleY': latticeParams.scaleY, 'scaleZ':latticeParams.scaleZ  };

    // empty array of motif
    for (var i = this.motifEditor.motifsAtoms.length - 1; i >= 0; i--) {
      this.motifEditor.motifsAtoms[i].destroy(); 
    };
    this.motifEditor.motifsAtoms.splice(0);

    // empty array of cell
    for (var i = this.motifEditor.unitCellAtoms.length - 1; i >= 0; i--) {
      this.motifEditor.unitCellAtoms[i].destroy(); 
    };
    this.motifEditor.unitCellAtoms.splice(0);

    if(this.motifEditor.newSphere){ 
      this.motifEditor.newSphere.destroy();
      this.motifEditor.newSphere = undefined ;
    }
    ////////----
    this.motifEditor.editorState_("initial");
    this.motifEditor.setCSGmode("cellClassic");
     
    this.motifEditor.leastCellLengths = {'x' : cell.leastCellLengths.x, 'y' : cell.leastCellLengths.y, 'z' : cell.leastCellLengths.z } ;
  
    this.motifEditor.padlockMode({padlock : cell.padlock}, true ) ;
    
    this.motifEditor.unitCellPositions ={};

    for (var i = cell.positions.length - 1; i >= 0; i--) { 
      this.motifEditor.unitCellPositions[cell.positions[i].reference] = {"position" : new THREE.Vector3(  cell.positions[i].x, cell.positions[i].y, cell.positions[i].z), "latticeIndex" : cell.positions[i].reference }  ;
    };
 
    /*if( (this.cwObj.latticeParams.lattice.latticeSystem === 'hexagonal'  && this.cwObj.latticeParams.lattice.latticeType === 'hexagonal')){

      var a = latticeParams.scaleZ ;
      var c = latticeParams.scaleY ; 

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

                
                this.motifEditor.unitCellPositions[reference] = {"position" : new THREE.Vector3( position.x, position.y, position.z), "latticeIndex" : reference} ;  
                this.motifEditor.unitCellPositions[referenceC] = {"position" : new THREE.Vector3( positionC.x, positionC.y, positionC.z), "latticeIndex" : referenceC} ;  
                 
              }    
            });
          });
        });
      }); 
    }
    else{  
      switch(this.cwObj.latticeParams.lattice.latticeType) {
        case "primitive":    
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                
                this.motifEditor.unitCellPositions["_"+_x+_y+_z] = {
                    "position" : new THREE.Vector3(cell.positions[i].x, cell.positions[i].y, cell.positions[i].z), 
                    "latticeIndex" : "_"+_x+_y+_z 
                    
                } 
              });
            });
          }); 
          break;
        case "face":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                 
                this.motifEditor.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( cell.positions[i].x, cell.positions[i].y, cell.positions[i].z), "latticeIndex" : "_"+_x+_y+_z } ;  
                  
              });
            });
          }); 
          for (var i = 0; i <= 1; i ++) {
            if(recreate){
              this.motifEditor.unitCellPositions["_"+i] = {"position" : new THREE.Vector3( dimensions.xDim *i, dimensions.yDim *0.5, dimensions.zDim *0.5), "latticeIndex" : "_"+i } ;  
              this.motifEditor.unitCellPositions["__"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *i, dimensions.zDim *0.5), "latticeIndex" : "__"+i } ;  
              this.motifEditor.unitCellPositions["___"+i] = {"position" : new THREE.Vector3( dimensions.xDim *0.5, dimensions.yDim *0.5, dimensions.zDim *i), "latticeIndex" : "___"+i } ;  
            } 
          };
          break;
        case "body":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                
                this.motifEditor.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3(  dimensions.xDim *_x, dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                 
              });
            });
          }); 
          
          this.motifEditor.unitCellPositions["_c"] = {"position" : new THREE.Vector3( (1/2) * dimensions.xDim , (1/2) * dimensions.yDim , (1/2) * dimensions.zDim ), "latticeIndex" : '_c' } ;  
           
          break;
        case "base":   
          _.times(2 , function(_x) {
            _.times(2 , function(_y) {
              _.times(2 , function(_z) {
                if(recreate){
                  this.motifEditor.unitCellPositions["_"+_x+_y+_z] = {"position" : new THREE.Vector3( dimensions.xDim *_x,  dimensions.yDim *_y, dimensions.zDim *_z), "latticeIndex" : "_"+_x+_y+_z } ;  
                }
                else{
                  this.motifEditor.unitCellPositions["_"+_x+_y+_z].position = new THREE.Vector3( dimensions.xDim *_x,  dimensions.yDim *_y, dimensions.zDim *_z) ;
                }
              });
            });
          });  
          
          this.motifEditor.unitCellPositions["_up"] = {"position" : new THREE.Vector3( dimensions.xDim /2 ,  dimensions.yDim , dimensions.zDim /2 ), "latticeIndex" : "_up" } ;  
          this.motifEditor.unitCellPositions["_down"] = {"position" : new THREE.Vector3( dimensions.xDim /2, 0 ,  dimensions.zDim /2), "latticeIndex" : "_down" } ;  
           
          break; 
      } 
    }  */
    /////////-------

    this.motifEditor.updateLatticeParameters(
      anglesScales,
      this.cwObj.system.latticeParams.lattice.latticeType, 
      this.cwObj.system.latticeParams.bravaisLattice, 
      this.cwObj.system.latticeParams.lattice.latticeSystem,
      1  
    );

    if ( atoms.length>0 ) {
      this.motifEditor.isEmpty = false;
    }

    var helperMotif = [];

    for (var i = 0; i < atoms.length; i++) { 
       
      var atom = new AtomSphere( atoms[i].visible, (new THREE.Vector3(atoms[i].position.x,atoms[i].position.y,atoms[i].position.z)) , atoms[i].radius , atoms[i].color, undefined, atoms[i].elementName, atoms[i].id, atoms[i].opacity*10, atoms[i].wireframe);

      this.motifEditor.motifsAtoms.push(atom); 
       
      var radius = atoms[i].radius ;
      
      helperMotif.push(

        {
          "object3d" : {
            "position" : { 
              "x": atoms[i].position.x, 
              "y":atoms[i].position.y, 
              "z": atoms[i].position.z
            }
          }, 
          getRadius: function() { return this.radius; },
          getID: function() { return this.id; }, 
          'color' : atoms[i].color,
          'radius' : atoms[i].radius,
          'id' : atoms[i].id,
          'texture' : 'Images/atoms/'+atoms[i].texture+'.png',
          'opacity' : atoms[i].opacity,
          'wireframe' : atoms[i].wireframe  
        }

      );

      this.motifEditor.addAtomInCell(  
        (new THREE.Vector3(atoms[i].position.x,atoms[i].position.y,atoms[i].position.z)) , 
        atoms[i].radius , 
        atoms[i].color, 
        undefined, 
        atoms[i].elementName, 
        atoms[i].id,  
        atoms[i].opacity*10,
        atoms[i].wireframe,
        1); 
       
      // this.motifEditor.updateAtomList(atoms[i].id, atoms[i].radius, atoms[i].elementName,true);
       
      if(atoms[i].id == cell.lastSphereAdded) {
        this.motifEditor.lastSphereAdded = atom ;
      }
    } 
     
    var _this = this ;

    this.lattice.currentMotif = helperMotif ;
    this.lattice.recreateMotif();
    
  };
  RestoreCWstate.prototype.configureMillerObjectsSettings = function() {
    var dirs = this.cwObj.system.millerObjects.directions;
    var planes = this.cwObj.system.millerObjects.planes; 
    
    for (var i = 0; i < this.lattice.millerDirections.length; i++) {
      this.lattice.millerDirections[i].direction.destroy();
    } 
    this.lattice.millerDirections.splice(0);

    for (var i = 0; i < this.lattice.millerPlanes.length; i++) {
      this.lattice.millerPlanes[i].plane.destroy();
    } 
    this.lattice.millerPlanes.splice(0);

    this.lattice.planeList.splice(0);
    this.lattice.directionalList.splice(0);
 
    for (var i = dirs.length - 1; i >= 0; i--) {
      
      this.lattice.millerDirections[i] = {
        visible: dirs[i].visible,
        direction : undefined,
        startPoint : new THREE.Vector3( dirs[i].startPoint.x, dirs[i].startPoint.y, dirs[i].startPoint.z ) , 
        endpointPoint : new THREE.Vector3( dirs[i].endPoint.x, dirs[i].endPoint.y, dirs[i].endPoint.z ),
        id : dirs[i].id,
        u : dirs[i].u,
        v : dirs[i].v,
        w : dirs[i].w,
        directionColor : dirs[i].color,
        name : dirs[i].name
      };
      this.lattice.forwardTransformationsMiller(this.lattice.millerDirections[i]); 
       
      this.lattice.millerDirections[i].direction  = new MillerVector(new THREE.Vector3( dirs[i].startPoint.x, dirs[i].startPoint.y, dirs[i].startPoint.z ), new THREE.Vector3( dirs[i].endPoint.x, dirs[i].endPoint.y, dirs[i].endPoint.z )  , dirs[i].color) ;
       
      var id = "_"+dirs[i].u+""+dirs[i].v+""+dirs[i].w+"";
     
      this.lattice.planeList.push({ id : id }); //selectPlane

    }

    for (var i = planes.length - 1; i >= 0; i--) {
      
      var x =  new MillerPlane(planes[i].a, planes[i].b, planes[i].c, planes[i].d, planes[i].opacity , planes[i].color ); 
      if(planes[i].d){  
        this.lattice.millerPlanes[i] = {
          visible: planes[i].visible,
          plane : x, 
          a : planes[i].a, 
          b : planes[i].b, 
          c : planes[i].c, 
          d : planes[i].d, 
          id : planes[i].id,
          h : planes[i].h,
          k : planes[i].k,
          l : planes[i].l,
          planeOpacity : planes[i].opacity,
          planeColor : planes[i].color,
          planeName : planes[i].name
        }; 
      }
      else{ 
        this.lattice.millerPlanes[i] = {
          visible: planes[i].visible,
          plane : x, 
          a : planes[i].a, 
          b : planes[i].b, 
          c : planes[i].c,   
          id : planes[i].id,
          h : planes[i].h,
          k : planes[i].k,
          l : planes[i].l,
          planeOpacity : planes[i].opacity,
          planeColor : planes[i].color,
          planeName : planes[i].name
        }; 
      }
   
      this.lattice.directionalList.push({ id : id });

    }   

  }; 
  RestoreCWstate.prototype.configureGradeSettings = function() {
    
    this.lattice.gradeParameters = {
      "radius" : this.cwObj.appUI.latticeTab.cellVisualization.cellEdge.radius, 
      "cylinderColor" : this.cwObj.appUI.latticeTab.cellVisualization.cellEdge.color, 
      "faceOpacity" : this.cwObj.appUI.latticeTab.cellVisualization.cellFace.opacity, 
      "faceColor" : this.cwObj.appUI.latticeTab.cellVisualization.cellFace.color
    };
  
  };   
  RestoreCWstate.prototype.configureLatticeSettings = function() { 
    var _this = this ;
    var params = this.cwObj.system.latticeParams ;

    // empty array of crystal atoms
    this.lattice.currentMotif.splice(0);
    _.each(_this.lattice.actualAtoms, function(atom,k) {
      atom.destroy();   
    }); 
    this.lattice.actualAtoms.splice(0); 
      
    this.lattice.gradeChoice = {"face":this.cwObj.system.cellVisualization.edges.visible, "grid":this.cwObj.system.cellVisualization.faces.visible};
    
    this.lattice.setCSGmode("crystalClassic");

    this.lattice.lattice = this.cwObj.system.latticeParams.lattice ; 
 
    this.lattice.parameters =  {
      'repeatX': params.repeatX, 
      'repeatY': params.repeatY, 
      'repeatZ': params.repeatZ,
      'scaleX': params.lattice.defaults.scaleX, 
      'scaleY': params.lattice.defaults.scaleY, 
      'scaleZ': params.lattice.defaults.scaleZ, 
      'alpha': params.lattice.defaults.alpha, 
      'beta': params.lattice.defaults.beta, 
      'gamma': params.lattice.defaults.gamma
    }; 
      
    this.lattice.update(); 
 
  };  
  RestoreCWstate.prototype.configureAxisSettings = function() { 
 
    this.crystalScene.axisMode({'xyzAxes' : this.cwObj.appUI.menuRibbon.toggleButtons.xyzAxes}); 
    this.crystalScene.axisMode({'abcAxes' : this.cwObj.appUI.menuRibbon.toggleButtons.abcAxes}); 
     
  }; 
  RestoreCWstate.prototype.configureCameraSettings = function() { 

    var settings = this.cwObj.system.cameraSettings ;
    var crystalCam = this.orbitCrystal.camera ;
    var cellCamera = this.orbitUnitCell.camera ; 

    crystalCam.position.set(settings.crystalCamera.position.x, settings.crystalCamera.position.y, settings.crystalCamera.position.z);
    cellCamera.position.set(settings.cellCamera.position.x, settings.crystalCamera.position.y, settings.crystalCamera.position.z);
 
    this.motifXcam.position.set(settings.motifCameras.xCam.position.x, settings.motifCameras.xCam.position.y, settings.motifCameras.xCam.position.z);  
    this.motifYcam.position.set(settings.motifCameras.yCam.position.x, settings.motifCameras.yCam.position.y, settings.motifCameras.yCam.position.z);  
    this.motifZcam.position.set(settings.motifCameras.zCam.position.x, settings.motifCameras.zCam.position.y, settings.motifCameras.zCam.position.z);  
  
    this.motifXcam.updateProjectionMatrix();
    this.motifYcam.updateProjectionMatrix();
    this.motifZcam.updateProjectionMatrix();
 
    // center at
    if(this.cwObj.appUI.visualTab.visualParameters.focalPoint.crystalCamTargetOn === true){
      this.orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
    }
    else{ 
      this.orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
      /*
      var g = lattice.customBox(lattice.viewBox);
      var centroid = new THREE.Vector3(0,0,0);

      if(g !== undefined){ 
        centroid = new THREE.Vector3(); 
        for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
          centroid.add( g.vertices[ z ] ); 
        }  
        centroid.divideScalar( g.vertices.length );
      }
 
      this.orbitCrystal.control.target = centroid ;
      */
    } 
 
    // distortion
    var cPos = this.crystalRenderer.cameras[0].position ;
    var currDistance = (this.crystalRenderer.cameras[0].position).distanceTo(new THREE.Vector3(0,0,0)) ;
    var vFOV = this.crystalRenderer.cameras[0].fov * Math.PI / 180;         
    var Visheight = 2 * Math.tan( vFOV / 2 ) * currDistance;   

    if(this.cwObj.appUI.visualTab.visualParameters.visualizationMode.distortionOn === true){
      this.crystalRenderer.cameras[0].fov = 75;
      var distance = Visheight/(2 * Math.tan( (75* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      this.crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }
    else{ 
      this.crystalRenderer.cameras[0].fov = 15;
      var distance = Visheight/(2 * Math.tan( (15* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      this.crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }   

    // sync cameras 
 
    if(this.cwObj.appUI.motifTab.lockCameras !== undefined && this.cwObj.appUI.motifTab.lockCameras === true){    
      cellCamera.position.set( crystalCam.position.x, crystalCam.position.y, crystalCam.position.z );   
      this.orbitUnitCell.control.target = this.orbitCrystal.control.target.clone();
      this.orbitCrystal.syncCams(true);
      this.orbitUnitCell.syncCams(true); 
    }
    else
    { 
      this.orbitUnitCell.control.target = new THREE.Vector3(0,0,0);
      this.orbitCrystal.syncCams(false);
      this.orbitUnitCell.syncCams(false);
    }

  };  
 
  return RestoreCWstate;
});
