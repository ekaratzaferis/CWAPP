 /*unused:false*/
'use strict';

require.config({
  baseUrl: 'scripts',
  paths: {
    'pubsub': '../vendor/pubsub',
    'three': '../vendor/three',
    'threejs-controls/OrbitControls': '../vendor/threejs-controls/OrbitControls',
    'threejs-controls/OrbitAndPanControls': '../vendor/threejs-controls/OrbitAndPanControls',
    'underscore': '../vendor/underscore',
    'jquery': '../vendor/jquery',
    'jquery-ui': '../vendor/jquery-ui/jquery-ui',
    'csg': '../vendor/csg',
    'threeCSG': '../vendor/ThreeCSG' 
  },
  shim: {
    'three': { exports: 'THREE' },
    'threejs-controls/OrbitControls': { deps: [ 'three' ] },
    'threejs-controls/OrbitAndPanControls': { deps: [ 'three' ] },
    'scg': { deps: [ 'three' ] },
    'threeCSG': { deps: [ 'three' ] }
  }
});

require([
  'pubsub', 'underscore', 'three',
  'explorer', 'renderer', 'orbit',
  'menu', 'lattice', 'snapshot','navArrowsHud','navCubeHud','motifeditor','unitCellExplorer','motifExplorer', 'mouseEvents', 'navArrows', 'navCube',
  'infobox', 'storeProject', 'restoreCWstate'
], function(
  PubSub, _, THREE,
  Explorer, Renderer, Orbit,
  Menu, Lattice, Snapshot, NavArrowsHud, NavCubeHud, Motifeditor, UnitCellExplorer, MotifExplorer, MouseEvents, NavArrows, NavCube,
  Infobox, StoreProject, RestoreCWstate
) {
  // Scenes
  var crystalScene = Explorer.getInstance();
  var unitCellScene = UnitCellExplorer.getInstance();
  var motifScene = MotifExplorer.getInstance();

  // Canvas Containers
  var width = $('#app-container').width();
  var height = $(window).height(); 
  $('#crystalRenderer').width(width);
  $('#crystalRenderer').height(height);

  var menu = new Menu();
  var lattice = new Lattice();

  // HUD  
  var navArrowsScene = NavArrowsHud.getInstance();  
  var hudArrows = new NavArrows(navArrowsScene.object3d, lattice);
  
  var navCubeScene = NavCubeHud.getInstance();  
  var hudCube = new NavCube(navCubeScene.object3d, lattice);

  var canvasSnapshot = new Snapshot(crystalRenderer);

  //  WebGL Renderers and cameras
  var crystalRenderer = new Renderer(crystalScene.object3d, 'crystalRenderer', 'crystal' ); 
  crystalRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 30,30,60, 15);
  crystalRenderer.initHud(navArrowsScene.object3d, navCubeScene.object3d);

  var unitCellRenderer = new Renderer(unitCellScene.object3d, 'unitCellRenderer', 'cell');
  unitCellRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 20,20,40, 15);

  var motifRenderer = new Renderer(motifScene.object3d, 'motifRenderer','motif'); 
  motifRenderer.createOrthographicCamera(width/3,height/2,  0, 200,  0,  0, 12);
  motifRenderer.createOrthographicCamera(width/3,height/2,  0, 200, 12,  0,  0);
  motifRenderer.createOrthographicCamera(width/3,height/2,  0, 200,  0, 12,  0);

  crystalRenderer.startAnimation();  
  
  // Orbit Controls
  //var orbitHud = new Orbit(crystalRenderer.hudCamera, '#crystalRenderer', "perspective", false, 'crystal', null );

  var orbitCrystal    = new Orbit(crystalRenderer.getMainCamera(),    '#crystalRenderer',   "perspective",  false, 'crystal', unitCellRenderer.getMainCamera(),[crystalRenderer.getHudCameraCube(), crystalRenderer.getHudCamera()] ); 
  var orbitUnitCell   = new Orbit(unitCellRenderer.getMainCamera(),   '#unitCellRenderer',  "perspective",  false, 'cell',    crystalRenderer.getMainCamera());

  var motifCamX = new Orbit(motifRenderer.getSpecificCamera(0), '#motifPosX',         "orthographic", false, 'motifX'   );
  var motifCamY = new Orbit(motifRenderer.getSpecificCamera(1), '#motifPosY',         "orthographic", false, 'motifY'   );
  var motifCamZ = new Orbit(motifRenderer.getSpecificCamera(2), '#motifPosZ',         "orthographic", false, 'motifZ'   );

  crystalRenderer.onAnimationUpdate(orbitCrystal.update.bind(orbitCrystal));

  unitCellRenderer.onAnimationUpdate(orbitUnitCell.update.bind(orbitUnitCell)); 

  motifRenderer.onAnimationUpdate(motifCamX.update.bind(motifCamX));
  motifRenderer.onAnimationUpdate(motifCamY.update.bind(motifCamY));
  motifRenderer.onAnimationUpdate(motifCamZ.update.bind(motifCamZ));

  // Motif editor
  var motifEditor = new Motifeditor(menu);
  motifEditor.loadAtoms();
 
  var dragNdropXevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(0), 'motifPosX');
  var dragNdropYevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(1), 'motifPosY');
  var dragNdropZevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(2), 'motifPosZ');

  var CubeEvent = new MouseEvents(lattice, 'navCubeDetect', crystalRenderer.hudCameraCube , 'hudRendererCube',  [orbitUnitCell,orbitCrystal] );

  // infobox
  var infoBoxEvents = new Infobox(lattice, 'info', crystalRenderer.getMainCamera(), 'crystalRenderer', 'default');

  // storing mechanism  
  var storingMachine = new StoreProject( lattice, motifEditor, crystalRenderer.getMainCamera(), unitCellRenderer.getMainCamera(),motifRenderer.getSpecificCamera(0),motifRenderer.getSpecificCamera(1),motifRenderer.getSpecificCamera(2) );

  // lattice
  menu.onLatticeChange(function(message, latticeName) {
    lattice.load(latticeName);
  });
  menu.onLatticeParameterChange(function(message, latticeParameters) { 
    lattice.setParameters(latticeParameters); 
    motifEditor.updateFixedDimensions(latticeParameters);
  });
  menu.onLatticeParameterChangeForHud(function(message, latticeParameters) {  
    hudArrows.updateAngles(latticeParameters);
    hudCube.updateAngles(latticeParameters);
    crystalScene.updateAbcAxes(latticeParameters);
  });
  // grade
  menu.onGradeParameterChange(function(message, gradeParameters) {
    lattice.setGrade(gradeParameters);
  });
  menu.onGradeChoices(function(message, gradeChoices) {
    lattice.setGradeChoices(gradeChoices);
  });

  // miller
  menu.onDirectionalSubmit(function(message, millerParameters) {
    lattice.millerParameters = millerParameters ;
    lattice.submitDirectional(millerParameters);
  });
  menu.onPlaneSubmit(function(message, millerParameters) {
    lattice.millerParameters = millerParameters ;
    lattice.submitPlane(millerParameters);
  });
  menu.directionSelection(function(message, which) {
    lattice.selectDirection(which);
  });
  menu.planeSelection(function(message, which) {
    lattice.selectPlane(which);
  });
  lattice.onPlaneStateChange(function(message, state) {
    lattice._planeState(state);
  });
  lattice.onDirectionStateChange(function(message, state) {
    lattice.directionState(state);
  });  

  $('#MotifEditor').prop('disabled', true);

  // motif
  $("#list li").click(function(e) { 
    if($(this).attr('id') === "millerPI" ){ 
      if(lattice.latticeName === 'hexagonal'){
        $(".hexagonalMiller").css('display','block');
      }
      else{
        $(".hexagonalMiller").css('display','none'); 
      } 
    } 
    if($(this).attr('id') === "motifLI" ){     
      
      $('#crystalRenderer').width(width/2);
      $('#crystalRenderer').height(height/2);
      $('#crystalRenderer').css( "left", width/2 );

      $('#unitCellRenderer').width(width/2);
      $('#unitCellRenderer').height(height/2);

      $('#motifRenderer').width(width);
      $('#motifRenderer').height(height/2);
      $('#motifRenderer').css( "top", height/2 );

      $('#motifPosX').css( "width", width/3 );
      $('#motifPosX').css( "height", height/2 );

      $('#motifPosY').css( "width", width/3 );
      $('#motifPosY').css( "height", height/2 );

      $('#motifPosZ').css( "width", width/3 );
      $('#motifPosZ').css( "height", height/2 );
      
      crystalRenderer.changeContainerDimensions(width/2, height/2);
      unitCellRenderer.changeContainerDimensions(width/2, height/2);
      motifRenderer.changeContainerDimensions(width, height/2);  
      unitCellRenderer.startAnimation();                                                                    
      motifRenderer.startAnimation(); 
      motifEditor.updateLatticeParameters(lattice.getAnglesScales(), lattice.getLatticeType(), lattice.getLatticeName(), lattice.getLatticeSystem());

      infoBoxEvents.state = 'motifScreen';
    }
    else{  
      $('#crystalRenderer').width(width);
      $('#crystalRenderer').height(height);
      $('#crystalRenderer').css( "left", 0 );

      $('#unitCellRenderer').width(0);
      $('#unitCellRenderer').height(0);

      $('#motifRenderer').width(0); 
      $('#motifRenderer').height(0);

      $('#motifPosX').css( "width", 0 );
      $('#motifPosX').css( "height", 0 );

      $('#motifPosY').css( "width", 0 );
      $('#motifPosY').css( "height", 0 );

      $('#motifPosZ').css( "width", 0 );
      $('#motifPosZ').css( "height", 0 );

      crystalRenderer.changeContainerDimensions(width,height);
      unitCellRenderer.changeContainerDimensions(0,0);

      unitCellRenderer.stopAtomAnimation();
      motifRenderer.stopAtomAnimation();

      motifRenderer.changeContainerDimensions(0, 0);

      infoBoxEvents.state = 'default';
    }
  });
  menu.atomSelection(function(message , arg) {
    motifEditor.selectElem(arg);
  }); 
  motifEditor.onEditorStateChange(function(message, state) {
    motifEditor.editorState_(state);
  });
  motifEditor.onViewStateChange(function(message, state) {
    motifEditor.viewState_(state);
  });
  menu.onAtomSubmit(function(message, atomParam) {
    if(atomParam.button === 'saveChanges'){
      lattice.setMotif(motifEditor.getMotif(), motifEditor.getDimensions())  ;
    }
    motifEditor.submitAtom(atomParam);
  });
  menu.savedAtomSelection(function(message, which) { 
    motifEditor.selectAtom(which);
  });
  menu.onAtomParameterChange(function(message, param) { 
    motifEditor.setAtomsParameter(param);
  });
  menu.onAtomPositionChange(function(message, param) { 
    motifEditor.setAtomsPosition(param);
  });
  menu.onManuallyCellDimsChange(function(message, param) { 
    motifEditor.setManuallyCellDims(param);
  });
  menu.onAtomTangencyChange(function(message, param) { 
    motifEditor.setAtomsTangency(param);
  });
  menu.setDimsManually(function(message, param) { 
    motifEditor.setDimsManually(param);
  });
  menu.onFixedLengthChange(function(message, param) { 
    motifEditor.fixedLengthMode(param); 
  }); 
  menu.onCameraSyncChange(function(message, param) { 
    var cellCamera = unitCellRenderer.getMainCamera();
    var crystalCamera = crystalRenderer.getMainCamera();

    if(param.syncCameras){    
      crystalCamera.position.set( cellCamera.position.x, cellCamera.position.y, cellCamera.position.z );  
      orbitCrystal.currPos.set(cellCamera.position.x,cellCamera.position.y,cellCamera.position.z ); 
      orbitUnitCell.currPos.set(cellCamera.position.x,cellCamera.position.y,cellCamera.position.z ) ; 
      orbitCrystal.sync = true;
      orbitUnitCell.sync = true; 
 
    }
    else
    {
      orbitCrystal.sync = false;
      orbitUnitCell.sync = false; 
    }
  });  
  menu.onCameraDistortionChange(function(message, mode){ 
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
  });
  menu.cellDimensionChange(function(message, param){
    motifEditor.updateCellDimens(param) ;
  });
  menu.motifToLattice(function(message, param){
    lattice.setMotif(motifEditor.getMotif(), motifEditor.getDimensions())  ;
  });
  menu.setDragMode(function(message, param){
    motifEditor.setDraggableAtom(param)  ;
  });
  menu.onRotatingAngleChange(function(message, param){ 
    motifEditor.changeRotatingAngle(param)  ;
  }); 
  menu.onCellViewChange(function(message, which) { 
    motifEditor.setCSGmode(which);
  });
  menu.onCrystalViewChange(function(message, which) { 
    lattice.changeView(which);
  }); 
  menu.onAxisModeChange(function(message, arg) { 
    crystalScene.axisMode(arg);
  }); 
  menu.storeProject(function(message, arg) { 
    storingMachine.createJSONfile();
  });
  menu.targetOfCamChange(function(message, arg) { 
    if(arg.center){
      orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
    }
    else{
      var params = lattice.getParameters() ;
      var x = params.scaleX * params.repeatX/2 ;
      var y = params.scaleY * params.repeatY /2;
      var z = params.scaleZ * params.repeatZ/2 ;
      var target = new THREE.Vector3(x,y,z) ;
      orbitCrystal.control.target = target ;
    } 
  });
  lattice.onLoad(function(message, lattice) {
    if (_.isObject(lattice)) {
      menu.setLatticeParameters(lattice.defaults);  
      menu.setLatticeRestrictions(lattice.restrictions);   
    }
  });
  
  // to read the json file
  var restore = new RestoreCWstate(menu, lattice, motifEditor, orbitCrystal, orbitUnitCell, motifRenderer.getSpecificCamera(0),motifRenderer.getSpecificCamera(1),motifRenderer.getSpecificCamera(2), crystalRenderer, unitCellRenderer, crystalScene, hudCube, hudArrows );
  
  document.getElementById('localJSON').addEventListener('change', parseJSON, false);

  function parseJSON(evt) { 
     
    var f = evt.target.files[0];  
    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
        var st = JSON.parse(e.target.result); 
        restore.configureState(st);

      }
      r.readAsText(f);
    } 
    else { 
      alert("Failed to load file");
    }
  } 

});
 