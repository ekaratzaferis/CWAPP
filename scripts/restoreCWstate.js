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

    this.cwObj = cwObj.system ;  
    this.configureCameras();
    this.configureAxisSelection();
    this.configureTextArea();
    this.configureGradeParams();

    this.configureVisualizationParams();
    this.soundMachine.switcher(cwObj.sounds);
    $("input[name='sounds']").prop('checked', cwObj.sounds );

    // important to destroy now the crystal atoms
    _.each(_this.lattice.actualAtoms, function(atom,k) {
      atom.destroy();   
    }); 
    this.lattice.actualAtoms.splice(0); 
 
    // AFTER ADDING EVERYTHING

    if(this.cwObj.latticeParams.lattice){  

      this.configureLatticeParams();
      this.configureCellVisualization();
      this.configureMillerObjects();

      this.lattice.updatePoints();  
      this.lattice.createGrid();  
      this.lattice.createFaces();
      this.lattice.setGradeParameters();
      this.lattice.forwardTransformations();  // todo may be useless
      this.lattice.reCreateMillers();
 
      this.lattice.setGradeChoices( {'faceCheckButton': this.cwObj.cellVisualization.faces.visible} );
      this.lattice.setGradeChoices( {'gridCheckButton': this.cwObj.cellVisualization.edges.visible} );
      this.lattice.setGradeParameters();

      this.configureMotifEditor();
    }
  
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
  RestoreCWstate.prototype.configureVisualizationParams = function() {
    var visualizationParams = this.cwObj.visualizationParams ;

    this.crystalScene.fogActive = visualizationParams.fog ;
      
    this.crystalScene.object3d.fog.density = parseInt(visualizationParams.fogDensity)/3000;
    this.crystalScene.object3d.fog.color.setHex( "0x"+(visualizationParams.fogColor) );  
    $('#fogColor').val(visualizationParams.fogColor);
    this.menu.setSliderValue("fogDensity", parseInt(visualizationParams.fogDensity) );
    $("input[name='fog']").prop('checked', visualizationParams.fog ); 

    this.crystalRenderer.backgroundColor = ('#'+visualizationParams.crystalScreenColor); 
    $('#crystalScreenColor').val(visualizationParams.crystalScreenColor); 

    this.unitCellRenderer.backgroundColor = ('#'+visualizationParams.cellScreenColor);
    $('#cellScreenColor').val(visualizationParams.cellScreenColor); 

    this.motifRenderer.viewportColors[0] = ('#'+visualizationParams.motifXScreenColor);
    $('#motifXScreenColor').val(visualizationParams.motifXScreenColor); 

    this.motifRenderer.viewportColors[1] = ('#'+visualizationParams.motifYScreenColor);
    $('#motifYScreenColor').val(visualizationParams.motifYScreenColor); 

    this.motifRenderer.viewportColors[2] = ('#'+visualizationParams.motifZScreenColor);
    $('#motifZScreenColor').val(visualizationParams.motifZScreenColor); 

    if(visualizationParams.lights){ 
      this.crystalScene.AmbLight.color.setHex( 0x4D4D4C ); 
      this.crystalScene.light.intensity = 1 ;
      this.crystalScene.light.castShadow = true;  

      this.unitCellScene.AmbLight.color.setHex( 0x4D4D4C ); 
      this.unitCellScene.light.intensity = 1 ;
      this.unitCellScene.light.castShadow = true;  
    }
    else{ 
      this.crystalScene.AmbLight.color.setHex( 0xffffff ); 
      this.crystalScene.light.intensity = 0 ;
      this.crystalScene.light.castShadow = false;  

      this.unitCellScene.AmbLight.color.setHex( 0xffffff ); 
      this.unitCellScene.light.intensity = 0.0;
      this.unitCellScene.light.castShadow = false;  

    }
    $("input[name='lights']").prop('checked', visualizationParams.lights );

    $("input[name='anaglyph']").prop('checked', visualizationParams.anaglyph ); 
   
    this.crystalRenderer.setAnaglyph(visualizationParams.anaglyph);
    this.motifRenderer.setAnaglyph(visualizationParams.anaglyph);
    this.unitCellRenderer.setAnaglyph(visualizationParams.anaglyph);

  };
  RestoreCWstate.prototype.configureMotifEditor = function() {

    var cell = this.cwObj.unitCell ;
    var atoms = this.cwObj.motif ;
    var latticeParams = this.cwObj.latticeParams.lattice.defaults ;
    
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
    this.motifEditor.editorState_("initial");
    this.motifEditor.viewState_("Classic");
    
    this.motifEditor.leastCellLengths = {'x' : cell.leastCellLengths.x, 'y' : cell.leastCellLengths.y, 'z' : cell.leastCellLengths.z } ;

    $("input[name='padlock']").prop('checked', cell.padlock); 
   
    this.motifEditor.padlockMode({padlock: cell.padlock}, true ) ;
  
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

    this.motifEditor.updateLatticeParameters(anglesScales,this.cwObj.latticeParams.lattice.latticeType, this.cwObj.latticeParams.bravaisLattice, this.cwObj.latticeParams.lattice.latticeSystem,1  );

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
       
      this.motifEditor.updateAtomList(atoms[i].id, atoms[i].radius, atoms[i].elementName,true);
       
      if(atoms[i].id == cell.lastSphereAdded) {
        this.motifEditor.lastSphereAdded = atom ;
      }
    } 
     
    var _this = this ;

    this.lattice.currentMotif = helperMotif ;
    this.lattice.recreateMotif();
    
  };
  RestoreCWstate.prototype.configureMillerObjects = function() {
    var dirs = this.cwObj.millerObjects.directions;
    var planes = this.cwObj.millerObjects.planes; 
    
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

    $('#planes option').remove();
    $('#vectors option').remove();  
    $('#vectors').append("<option  >---</option>") ;
    $('#planes').append("<option  >---</option>") ;

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
      
      var text = "Vector : "+dirs[i].name+"  ["+dirs[i].u+","+dirs[i].v+","+dirs[i].w+"] ";
      var id = "_"+dirs[i].u+""+dirs[i].v+""+dirs[i].w+"";
      var option = "<option id="+id+" value="+id+">"+text+"</option>" ;
      $('#vectors').append(option) ;

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
       
      //this.lattice.forwardTransformationsMiller(this.lattice.millerPlanes[i]); 
    
      var text = "Plane : "+planes[i].name+"  ["+planes[i].h+","+planes[i].k+","+planes[i].l+"] ";
      var id = "_"+planes[i].h+""+planes[i].k+""+planes[i].l+"";
      var option = "<option id="+id+" value="+id+">"+text+"</option>" ;
      $('#planes').append(option) ;

      this.lattice.directionalList.push({ id : id });

    }   

  }; 
  RestoreCWstate.prototype.configureGradeParams = function() {
    this.lattice.gradeParameters = {"radius" : this.cwObj.cellVisualization.edges.radius, "cylinderColor" : this.cwObj.cellVisualization.edges.color , "faceOpacity" : this.cwObj.cellVisualization.faces.opacity , "faceColor" : this.cwObj.cellVisualization.faces.color};

    $('#radius').val(this.cwObj.cellVisualization.edges.radius);
    $('#faceOpacity').val(this.cwObj.cellVisualization.faces.opacity);

    this.menu.setSliderValue("radius",this.cwObj.cellVisualization.edges.radius );
    this.menu.setSliderValue("faceOpacity",this.cwObj.cellVisualization.faces.opacity);


  }; 
  RestoreCWstate.prototype.configureCellVisualization = function() {

    var _this = this ;
     
    $("input[name='faceCheckButton']").prop('checked', this.cwObj.cellVisualization.faces.visible);
    $("input[name='gridCheckButton']").prop('checked', this.cwObj.cellVisualization.edges.visible);
  
  }; 
    
  RestoreCWstate.prototype.configureLatticeParams = function() { 
    var _this = this ;
    var params = this.cwObj.latticeParams.properties ;

    // empty array of crystal atoms
    this.lattice.currentMotif.splice(0);
    _.each(_this.lattice.actualAtoms, function(atom,k) {
      atom.destroy();   
    }); 
    this.lattice.actualAtoms.splice(0); 
      
    this.lattice.gradeChoice = {"face":this.cwObj.cellVisualization.faces.visible, "grid":this.cwObj.cellVisualization.edges.visible};

    $('#bravaisLattice').val(this.cwObj.latticeParams.bravaisLattice); 

    /*if(!_.isUndefined(this.lattice.lattice.latticeType )){
      this.lattice.destroyPoints();
      this.lattice.destroyGrids();
      this.lattice.destroyPoints();
    };*/

    this.lattice.lattice = this.cwObj.latticeParams.lattice ; 
    if(this.cwObj.latticeParams.lattice){  

      this.lattice.parameters =  {
        'repeatX': this.cwObj.latticeParams.repeatX, 'repeatY': this.cwObj.latticeParams.repeatY, 'repeatZ':this.cwObj.latticeParams.repeatZ,
        'scaleX': this.cwObj.latticeParams.lattice.defaults.scaleX, 'scaleY': this.cwObj.latticeParams.lattice.defaults.scaleY, 'scaleZ': this.cwObj.latticeParams.lattice.defaults.scaleZ, 'alpha': this.cwObj.latticeParams.lattice.defaults.alpha, 'beta': this.cwObj.latticeParams.lattice.defaults.beta, 'gamma': this.cwObj.latticeParams.lattice.defaults.gamma
      }; 
    }

    this.lattice.update(); 

    //// forgot other camerasssssssssss!

    $('#repeatX').val(this.cwObj.latticeParams.repeatX);
    $('#repeatY').val(this.cwObj.latticeParams.repeatY);
    $('#repeatZ').val(this.cwObj.latticeParams.repeatZ);

    if(this.cwObj.latticeParams.lattice){  

      $('#scaleX').val(this.cwObj.latticeParams.lattice.defaults.scaleX);
      $('#scaleY').val(this.cwObj.latticeParams.lattice.defaults.scaleY);
      $('#scaleZ').val(this.cwObj.latticeParams.lattice.defaults.scaleZ);

      $('#alpha').val(this.cwObj.latticeParams.lattice.defaults.alpha);
      $('#beta').val(this.cwObj.latticeParams.lattice.defaults.beta);
      $('#gamma').val(this.cwObj.latticeParams.lattice.defaults.gamma);
      

      this.menu.setSliderValue("alpha",this.cwObj.latticeParams.lattice.defaults.alpha);
      this.menu.setSliderValue("beta",this.cwObj.latticeParams.lattice.defaults.beta);
      this.menu.setSliderValue("gamma",this.cwObj.latticeParams.lattice.defaults.gamma);
    }

  };
  RestoreCWstate.prototype.configureTextArea = function() { 
    $('#mynotes').append(this.cwObj.notes);
  };

  RestoreCWstate.prototype.configureAxisSelection = function() { 
    var choices = this.cwObj.axisSelection;
 
    this.crystalScene.axisMode({'xyzAxes' : choices.xyzVisible});
    $('#xyzAxes').prop('checked', choices.xyzVisible);

    this.crystalScene.axisMode({'abcAxes' : choices.abcVisible}); 
    $('#abcAxes').prop('checked', choices.abcVisible);

  }; 
  RestoreCWstate.prototype.configureCameras = function() { 

    var settings = this.cwObj.cameraSettings ;
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
    if(settings.crystalCamera.centeredAtAxis){
      this.orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
    }
    else{
      var params = this.cwObj.latticeParams.properties ;
      var x = params.scaleX * params.repeatX/2 ;
      var y = params.scaleY * params.repeatY /2;
      var z = params.scaleZ * params.repeatZ/2 ;
      var target = new THREE.Vector3(x,y,z) ;
      this.orbitCrystal.control.target = target ;
    } 
    $('#crystalCamTarget').prop('checked', settings.crystalCamera.centeredAtAxis);

    // distortion
    var cPos = this.crystalRenderer.cameras[0].position ;
    var currDistance = (this.crystalRenderer.cameras[0].position).distanceTo(new THREE.Vector3(0,0,0)) ;
    var vFOV = this.crystalRenderer.cameras[0].fov * Math.PI / 180;         
    var Visheight = 2 * Math.tan( vFOV / 2 ) * currDistance;   

    if(settings.crystalCamera.distortion){
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

    if(settings.crystalCamera.synced){    
      crystalCam.position.set( cellCamera.position.x, cellCamera.position.y, cellCamera.position.z );  
      this.orbitCrystal.currPos.set(cellCamera.position.x,cellCamera.position.y,cellCamera.position.z ); 
      this.orbitUnitCell.currPos.set(cellCamera.position.x,cellCamera.position.y,cellCamera.position.z ) ; 
      this.orbitCrystal.sync = true;
      this.orbitUnitCell.sync = true;  
    }
    else
    {
      this.orbitCrystal.sync = false;
      this.orbitUnitCell.sync = false; 
    } 
  };  
 
  return RestoreCWstate;
});
