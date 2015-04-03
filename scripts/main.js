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
  'menu', 'lattice', 'snapshot','hudExplorer','motifeditor','unitCellExplorer','motifExplorer', 'mouseEvents', 'hud'
], function(
  PubSub, _, THREE,
  Explorer, Renderer, Orbit,
  Menu, Lattice, Snapshot, HudExplorer, Motifeditor, UnitCellExplorer, MotifExplorer, MouseEvents, Hud
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
  var hudScene = HudExplorer.getInstance();  
  var hud = new Hud(hudScene.object3d, lattice);
   
  var canvasSnapshot = new Snapshot(crystalRenderer);

  //  WebGL Renderers and cameras
  var crystalRenderer = new Renderer(crystalScene.object3d, 'crystalRenderer', 'crystal' ); 
  crystalRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 30,30,60, 15);
  crystalRenderer.initHud(hudScene.object3d);

  var unitCellRenderer = new Renderer(unitCellScene.object3d, 'unitCellRenderer', 'cell');
  unitCellRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 20,20,40, 15);

  var motifRenderer = new Renderer(motifScene.object3d, 'motifRenderer','motif'); 
  motifRenderer.createOrthographicCamera(width/3,height/2,  0, 200,  0,  0, 12);
  motifRenderer.createOrthographicCamera(width/3,height/2,  0, 200, 12,  0,  0);
  motifRenderer.createOrthographicCamera(width/3,height/2,  0, 200,  0, 12,  0);

  crystalRenderer.startAnimation();
  unitCellRenderer.startAnimation();
  motifRenderer.startAnimation();
 
 
  // Orbit Controls
  //var orbitHud = new Orbit(crystalRenderer.hudCamera, '#crystalRenderer', "perspective", false, 'crystal', null );

  var orbitCrystal    = new Orbit(crystalRenderer.getMainCamera(),    '#crystalRenderer',   "perspective",  false, 'crystal', unitCellRenderer.getMainCamera() );
  var orbitHud        = new Orbit(crystalRenderer.hudCamera,          '#crystalRenderer',   "perspective",  false, 'hud'      );
  var orbitUnitCell   = new Orbit(unitCellRenderer.getMainCamera(),   '#unitCellRenderer',  "perspective",  false, 'cell',    crystalRenderer.getMainCamera());
  var cameraControls1 = new Orbit(motifRenderer.getSpecificCamera(0), '#motifPosX',         "orthographic", false, 'motifX'   );
  var cameraControls2 = new Orbit(motifRenderer.getSpecificCamera(1), '#motifPosY',         "orthographic", false, 'motifY'   );
  var cameraControls3 = new Orbit(motifRenderer.getSpecificCamera(2), '#motifPosZ',         "orthographic", false, 'motifZ'   );

  crystalRenderer.onAnimationUpdate(orbitCrystal.update.bind(orbitCrystal));

  unitCellRenderer.onAnimationUpdate(orbitUnitCell.update.bind(orbitUnitCell)); 
  motifRenderer.onAnimationUpdate(cameraControls1.update.bind(cameraControls1));
  motifRenderer.onAnimationUpdate(cameraControls2.update.bind(cameraControls2));
  motifRenderer.onAnimationUpdate(cameraControls3.update.bind(cameraControls3));

  // Motif editor
  var motifEditor = new Motifeditor(menu);
  motifEditor.loadAtoms();

  var dragNdropX = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(0), 'motifPosX');
  var dragNdropY = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(1), 'motifPosY');
  var dragNdropZ = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(2), 'motifPosZ');

  // lattice
  menu.onLatticeChange(function(message, latticeName) {
    lattice.load(latticeName);
  });
  menu.onLatticeParameterChange(function(message, latticeParameters) { 
    lattice.setParameters(latticeParameters); 
    motifEditor.updateFixedDimensions(latticeParameters);
  });
  menu.onLatticeParameterChangeForHud(function(message, latticeParameters) {  
    hud.updateAngles(latticeParameters);
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

  // motif
  $("#list li").click(function() {
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
      motifEditor.updateLatticeParameters(lattice.getAnglesScales(), lattice.getLatticeType(), lattice.getLatticeName());

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
  menu.onAtomTangencyChange(function(message, param) { 
    motifEditor.setAtomsTangency(param);
  });
  menu.onFixedLengthChange(function(message, param) { 
    motifEditor.fixedLengthMode(param); 
  }); 
  menu.onCameraSyncChange(function(message, param) { 
    var cellCamera = unitCellRenderer.getMainCamera();
    var crystalCamera = crystalRenderer.getMainCamera();

    if(param.syncCameras){    
      crystalCamera.position.set( cellCamera.position.x, cellCamera.position.y, cellCamera.position.z ); 

     
      orbitCrystal.currPos.x = cellCamera.position.x ;
      orbitCrystal.currPos.y = cellCamera.position.y ;
      orbitCrystal.currPos.z = cellCamera.position.z ;
     
      orbitUnitCell.currPos.x = cellCamera.position.x ;
      orbitUnitCell.currPos.y = cellCamera.position.y ;
      orbitUnitCell.currPos.z = cellCamera.position.z ; 
      orbitCrystal.sync = true;
      orbitUnitCell.sync = true; 
    }
    else{
      orbitCrystal.sync = false;
      orbitUnitCell.sync = false; 
    }
  });  
  menu.onCameraDistortionChange(function(message, mode){
    motifEditor.cameraDist(mode, crystalRenderer) ;
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
  lattice.onLoad(function(message, lattice) {
    if (_.isObject(lattice)) {
      menu.setLatticeParameters(lattice.defaults);
      menu.setLatticeRestrictions(lattice.restrictions);   
    }
  });
  
});
 