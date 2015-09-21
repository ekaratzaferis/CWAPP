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
    'threeCSG': '../vendor/ThreeCSG',
    'keyboardState': '../vendor/keyboardState',
    'rStats': '../vendor/rStats',
    'rStatsExtras': '../vendor/rStatsExtras',
    'leapMotion': '../vendor/leap-0.6.4',
    'icheck': '../vendor/icheck/icheck',
    'jquery.matchHeight': '../vendor/jquery-match-height/jquery.matchHeight-min',
    'bootstrap-select': '../vendor/bootstrap-select/dist/js/bootstrap-select.min',
    'jquery.mCustomScrollbar.concat.min': '../vendor/malihu-custom-scrollbar/jquery.mCustomScrollbar.concat.min',
    'bootstrap': '../vendor/bootstrap/assets/javascripts/bootstrap',
    'jColor': '../vendor/colorpicker/spectrum'
  },
  shim: {
    'three': { exports: 'THREE' },
    'threejs-controls/OrbitControls': { deps: [ 'three' ] },
    'keyboardState': { deps: [ 'three' ] },
    'threejs-controls/OrbitAndPanControls': { deps: [ 'three' ] },
    'scg': { deps: [ 'three' ] },
    'threeCSG': { deps: [ 'three' ] },
    'rStats': { deps: [ 'three' ] }
  }
});

require([
  'pubsub', 
  'underscore', 
  'three', 
  'explorer', 
  'renderer', 
  'orbit', 
  'menu', 
  'lattice', 
  'snapshot',
  'navArrowsHud',
  'navCubeHud',
  'motifeditor',
  'unitCellExplorer',
  'motifExplorer',
  'mouseEvents',
  'navArrows',
  'navCube',
  'crystalMouseEvents',
  'storeProject',
  'restoreCWstate',
  'sound',
  'animate',
  'gearTour',
  'doll', 
  'dollExplorer',
  'keyboardKeys',
  'keyboardState',
  'fullScreen',
  'sceneResizer',
  'rStats', 
  'rStatsExtras', 
  'leapMotionHandler'
], function(
  PubSub, 
  _, 
  THREE,
  Explorer, 
  Renderer, 
  Orbit, 
  Menu, 
  Lattice, 
  Snapshot, 
  NavArrowsHud, 
  NavCubeHud, 
  Motifeditor, 
  UnitCellExplorer, 
  MotifExplorer, 
  MouseEvents, 
  NavArrows, 
  NavCube, 
  CrystalMouseEvents, 
  StoreProject, 
  RestoreCWstate, 
  Sound, 
  Animate, 
  GearTour, 
  Doll, 
  DollExplorer, 
  KeyboardKeys, 
  KeyboardState, 
  FullScreen, 
  SceneResizer, 
  RStats, 
  RStatsExtras, 
  LeapMotionHandler
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

  var crystalRenderer = new Renderer(crystalScene, 'crystalRenderer', 'crystal' ); 
  crystalRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 30,30,60, 15);

  // crystal scene stats
  var glS = new glStats();
  var tS = new threeStats( crystalRenderer.renderer );

  var rS = rStats(  {
    values: {
      frame: { caption: 'Total frame time (ms)', over: 16 },
      fps: { caption: 'Framerate (FPS)', below: 30 },
      calls: { caption: 'Calls (three.js)', over: 3000 },
      raf: { caption: 'Time since last rAF (ms)' },
      rstats: { caption: 'rStats update (ms)' }
    },
    groups: [
      { caption: 'Framerate', values: [ 'fps', 'raf' ] },
      { caption: 'Frame Budget', values: [ 'frame', 'texture', 'setup', 'render' ] }
    ],
    fractions: [
      { base: 'frame', steps: [ 'texture', 'setup', 'render' ] }
    ],
    plugins: [
      tS,
      glS
    ]
  } );

  crystalRenderer.rS = rS;
  crystalRenderer.glS = glS;

  // sound & animations
  var animationMachine = new Animate(crystalScene);
  var soundMachine = new Sound(animationMachine); 
  animationMachine.soundMachine = soundMachine;
  crystalRenderer.externalFunctions.push(animationMachine.animation.bind(animationMachine));
 
  var menu = new Menu();
  var lattice = new Lattice(menu, soundMachine);
  
  // HUD  
  var navArrowsScene = NavArrowsHud.getInstance();  
  var hudArrows = new NavArrows(navArrowsScene.object3d, lattice);
  
  var navCubeScene = NavCubeHud.getInstance();  
  var hudCube = new NavCube(navCubeScene.object3d, lattice);
 
  //  WebGL Renderers and cameras
  var displayFactor = 6 ; // changes how big or small will be the Hud 
  crystalRenderer.initHud(navArrowsScene.object3d, navCubeScene.object3d, displayFactor);

  var unitCellRenderer = new Renderer(unitCellScene, 'unitCellRenderer', 'cell');
  unitCellRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 20,20,40, 15);

  var motifRenderer = new Renderer(motifScene, 'motifRenderer','motif'); 
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 0,0,50, 15);
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 50,0,0, 15);
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 0,50,0, 15);

  crystalRenderer.startAnimation();  
  
  var canvasSnapshot = new Snapshot(crystalRenderer);

  var orbitCrystal   = new Orbit(crystalRenderer.getMainCamera(),    '#crystalRenderer',   "perspective",  false, 'crystal', unitCellRenderer.getMainCamera(),[crystalRenderer.getHudCameraCube(), crystalRenderer.getHudCamera()] ); 
    
  soundMachine.crystalCameraOrbit = orbitCrystal ;
   
  var orbitUnitCell   = new Orbit(unitCellRenderer.getMainCamera(),   '#unitCellRenderer',  "perspective",  false, 'cell',    crystalRenderer.getMainCamera());

  var motifCamX = new Orbit(motifRenderer.getSpecificCamera(0), '#motifPosX', "perspective", true, 'motif'   );
  var motifCamY = new Orbit(motifRenderer.getSpecificCamera(1), '#motifPosY', "perspective", true, 'motif'   );
  var motifCamZ = new Orbit(motifRenderer.getSpecificCamera(2), '#motifPosZ', "perspective", true, 'motif'   );

  crystalRenderer.onAnimationUpdate(orbitCrystal.update.bind(orbitCrystal));

  unitCellRenderer.onAnimationUpdate(orbitUnitCell.update.bind(orbitUnitCell)); 

  motifRenderer.onAnimationUpdate(motifCamX.update.bind(motifCamX));
  motifRenderer.onAnimationUpdate(motifCamY.update.bind(motifCamY));
  motifRenderer.onAnimationUpdate(motifCamZ.update.bind(motifCamZ));

  // Motif editor
  var motifEditor = new Motifeditor(menu, soundMachine);
  motifEditor.loadAtoms();
 
  var dragNdropXevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(0), 'motifPosX');
  var dragNdropYevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(1), 'motifPosY');
  var dragNdropZevent = new MouseEvents(motifEditor, 'dragNdrop', motifRenderer.getSpecificCamera(2), 'motifPosZ');

  // navigation cube
  var CubeEvent = new MouseEvents(lattice, 'navCubeDetect', crystalRenderer.hudCameraCube , 'hudRendererCube',  [orbitUnitCell,orbitCrystal], soundMachine );
 
  // storing mechanism  
  var storingMachine = new StoreProject( lattice, motifEditor, crystalRenderer.getMainCamera(), unitCellRenderer.getMainCamera(),motifRenderer.getSpecificCamera(0),motifRenderer.getSpecificCamera(1),motifRenderer.getSpecificCamera(2), crystalRenderer );

  // Gear Bar Tour
  var gearTour = new GearTour(crystalScene, motifEditor, lattice);
 
  // handel keyboard keys
  var keyboard = new KeyboardKeys(new THREEx.KeyboardState(), crystalScene, orbitCrystal, motifEditor);
  animationMachine.keyboard = keyboard;
  crystalRenderer.externalFunctions.push(keyboard.handleKeys.bind(keyboard));
  crystalRenderer.externalFunctions.push(crystalScene.updateXYZlabelPos.bind(crystalScene, crystalRenderer.getMainCamera()));

  // CW Doll
  var dollScene = DollExplorer.getInstance();  
  crystalRenderer.setDoll(dollScene.object3d ); 
  var dollEditor = new Doll(crystalRenderer.dollCamera, orbitCrystal, lattice, animationMachine, keyboard, soundMachine, gearTour);
  crystalRenderer.setDoll(undefined, dollEditor.doll);  
  dollEditor.rePosition();

  // mouse events happen in crytal screen 
  var crystalScreenEvents = new CrystalMouseEvents(lattice, 'info', crystalRenderer.getMainCamera(), 'crystalRenderer', 'default', dollEditor);

  // full screen
  var fullScreen = new FullScreen();

  // resizer
  var sceneResizer = new SceneResizer(crystalRenderer, motifRenderer, unitCellRenderer, displayFactor, dollEditor);
  $( document ).ready(function() {
    sceneResizer.resize( 'crystal');
  });
  window.addEventListener('resize', function () {
    sceneResizer.resize( crystalScreenEvents.state);
  }, false);

  // leap motion
  var leapM = new LeapMotionHandler( motifEditor, lattice, orbitCrystal, soundMachine, dollEditor, keyboard);

  // lattice events binding
  menu.onLatticeChange(function(message, latticeName) {
    lattice.load(latticeName);
  });
  menu.onLatticeParameterChange(function(message, latticeParameters) { 
    lattice.setParameters(latticeParameters); 
    motifEditor.updateFixedDimensions(latticeParameters);
  });
  menu.onLatticeParameterChangeForHud(function(message, latticeParameters) {  
    hudArrows.updateLengths(latticeParameters);
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
  menu.directionParameterChange(function(message, arg) {  
    lattice.directionParameterChange(arg);
  });
  menu.planeParameterChange(function(message, arg) { 
    lattice.planeParameterChange(arg);
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
  menu.setAnaglyph(function(message, arg) {
    crystalRenderer.setAnaglyph(arg);
    motifRenderer.setAnaglyph(arg);
    unitCellRenderer.setAnaglyph(arg);
  }); 
  menu.onSoundsSet(function(message, arg) { 
    soundMachine.switcher(arg.sounds); 
  });
  menu.onRadiusToggle(function(message, arg) { 
    lattice.toggleRadius(arg); 
  });
  menu.onAtomPosModeChange(function(message, arg) { 
    motifEditor.atomPosMode(arg); 
  });
  menu.onLightsSet(function(message, arg) { 
     
    if(arg.lights){
      crystalScene.AmbLight.color.setHex( 0x4D4D4C ); 
      crystalScene.light.intensity = 1 ;
      crystalScene.light.castShadow = true;  

      unitCellScene.AmbLight.color.setHex( 0x4D4D4C ); 
      unitCellScene.light.intensity = 1 ;
      unitCellScene.light.castShadow = true;  
    }
    else{
      crystalScene.AmbLight.color.setHex( 0xffffff ); 
      crystalScene.light.intensity = 0 ;
      crystalScene.light.castShadow = false;  

      unitCellScene.AmbLight.color.setHex( 0xffffff ); 
      unitCellScene.light.intensity = 0.0;
      unitCellScene.light.castShadow = false;  

    } 

  });
  menu.onLeapMotionSet(function(message, arg) { 
    leapM.toggle(arg.leap);
  });
  menu.onFogParameterChange(function(message, arg) { 
    if(crystalScene.fogActive === true){ 
      if(!_.isUndefined(arg.fogColor)){
        crystalScene.object3d.fog.color.setHex( "0x"+arg.fogColor );  
      }
      else if(!_.isUndefined(arg.fogDensity)){
        crystalScene.object3d.fog.density = parseInt(arg.fogDensity)/3000 ;
      }
    }
  });
  menu.onFogChange(function(message, arg) { 
    crystalScene.fogActive = arg.fog ;
    if(arg.fog === true){  
      crystalScene.object3d.fog.density = parseInt($('#fogDensity').val())/2000;
      crystalScene.object3d.fog.color.setHex( "0x"+($('#fogColor').val()) );  
    }
    else{ 
      crystalScene.object3d.fog.density = 0 ;
    } 
  });
  menu.onRendererColorChange(function(message, arg) { 

    if(!_.isUndefined(arg.crystalScreenColor)){ 
      crystalRenderer.backgroundColor = ('#'+arg.crystalScreenColor);
    }
    else if(!_.isUndefined(arg.cellScreenColor)){
      unitCellRenderer.backgroundColor = ('#'+arg.cellScreenColor);
    } 
    else if(!_.isUndefined(arg.motifXScreenColor)){ 
      motifRenderer.viewportColors[0] = ('#'+arg.motifXScreenColor);
    } 
    else if(!_.isUndefined(arg.motifYScreenColor)){  
      motifRenderer.viewportColors[1] = ('#'+arg.motifYScreenColor);
    } 
    else if(!_.isUndefined(arg.motifZScreenColor)){  
      motifRenderer.viewportColors[2] = ('#'+arg.motifZScreenColor);
    } 
  });
  
  // motif editor events binding
  $("#list li").click(function(e) { 
    
    height = $(window).height() ;
    width = $('#app-container').width(); ;
 
    gearTour.removeSubtractedCell();
    //

    if($(this).attr('id') === "millerPI" ){ 
      if(lattice.latticeName === 'hexagonal'){
        $(".hexagonalMiller").css('display','block');
      }
      else{
        $(".hexagonalMiller").css('display','none'); 
      } 
    } 
    if($(this).attr('id') === "motifLI" ){     
      
      sceneResizer.resize('motifScreen');
        
      unitCellRenderer.startAnimation();                                                                    
      motifRenderer.startAnimation(); 
      motifEditor.updateLatticeParameters(lattice.getAnglesScales(), lattice.getLatticeType(), lattice.getLatticeName(), lattice.getLatticeSystem());

      crystalScreenEvents.state = 'motifScreen';
    }
    else{  

      sceneResizer.resize('crystal');
       
      crystalRenderer.changeContainerDimensions(width,height);
      unitCellRenderer.changeContainerDimensions(0,0);
      motifRenderer.changeContainerDimensions(0, 0);

      unitCellRenderer.stopAtomAnimation();
      motifRenderer.stopAtomAnimation(); 
      crystalScreenEvents.state = 'default';
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
      var parameters = motifEditor.getDimensions() ;
      lattice.setMotif(motifEditor.getMotif(), parameters)  ;
      
      var params = {
        alpha : parameters.alpha,
        beta : parameters.beta,
        gamma : parameters.gamma, 
        scaleX : parameters.x,
        scaleY : parameters.y,
        scaleZ : parameters.z,
      }
      hudArrows.updateLengths(params);
      hudArrows.updateAngles(params); 
      hudCube.updateAngles(params);
      crystalScene.updateAbcAxes(params);

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
    motifEditor.setManuallyCellLengths(param);
  });
  menu.onManuallyCellVolumeChange(function(message, param) { 
    motifEditor.setManuallyCellVolume(param);
  });
  menu.onManuallyCellAnglesChange(function(message, param) { 
    motifEditor.setManuallyCellAngles(param);
  });
  menu.onAtomTangencyChange(function(message, param) { 
    motifEditor.setAtomsTangency(param);
  });
  menu.setDimsManually(function(message, param) { 
    motifEditor.setDimsManually(param);
  });
  menu.setAnglesManually(function(message, param) { 
    motifEditor.setAnglesManually(param);
  });
  menu.onFixedLengthChange(function(message, param) {  
    motifEditor.padlockMode(param); 
  }); 
  menu.padlockSet(function(message, param) {  
    motifEditor.padlockMode(param); 
  });  
  menu.fullScreenApp(function(message, param) {  
    fullScreen.fs();
  });  
  menu.updateNotes(function(message, arg) {  
      
    var length = arg.text.length;
    var divWidth ;
    if(length < 50 ){
      divWidth = 100 ;
    }
    else if ( length < 100 ){
      divWidth = 150 ;
    }
    else if ( length < 200 ){
      divWidth = 200 ;
    }
    else if ( length < 400 ){
      divWidth = 250 ;
    }
    else if ( length < 700 ){
      divWidth = 350 ;
    }
    else if ( length < 1000 ){
      divWidth = 450 ;
    }
    else{
      divWidth = 700 ;
    }
    
    var p = $( ".noteTransparent:first" ) ;
    var position = p.position();
   
    $('.noteTransparent').remove();
      
    $('<div>', {  
      style: 'width:'+(divWidth+5)+'px; position:fixed; bottom : 20px; left :20px;',
    })
    .addClass( "noteTransparent" ) 
    .draggable()
    .append( $('<span>', { 
      id:'close',
      text:'X',
      style: 'margin-left:15px',
    }).click(function(e) {  
        $(this).parent().remove();
      })
    )
    .append( $('<div>', { 
      style: 'width:'+divWidth+'px',
      text: arg.text
    })) 
    .appendTo(document.body);

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
    lattice.setMotif(motifEditor.getMotif(), motifEditor.getDimensions()) ; 
    var parameters = motifEditor.getDimensions() ;
    var params = {
      alpha : parameters.alpha,
      beta : parameters.beta,
      gamma : parameters.gamma, 
      scaleX : parameters.x,
      scaleY : parameters.y,
      scaleZ : parameters.z,
    }
    hudArrows.updateLengths(params);
    hudArrows.updateAngles(params); 
    hudCube.updateAngles(params);
    crystalScene.updateAbcAxes(params);

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
  menu.onLeapTrackingSystemChange(function(message, arg) { 
    leapM.selectTS(arg);
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
      //menu.setLatticeRestrictions(lattice.restrictions);   
    }
  });
  
  // to read the json file
  var restore = new RestoreCWstate(menu, lattice, motifEditor, orbitCrystal, orbitUnitCell, motifRenderer.getSpecificCamera(0),motifRenderer.getSpecificCamera(1),motifRenderer.getSpecificCamera(2), crystalRenderer, unitCellRenderer, crystalScene, unitCellScene, hudCube, hudArrows, motifRenderer, soundMachine );
  
  //document.getElementById('localJSON').addEventListener('change', parseJSON, false);

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


  var hash = window.location.hash.substr(1);
  var service = 'https://cwgl.herokuapp.com' ;

  if(hash.length>0){
     //console.log(service + '/' + hash + '.json') 

    var slug = hash.replace(/^#/, '');
    $.ajax(service + '/' + slug + '.json', {
      method: 'GET',
      beforeSend: function(xmlHttpRequest) {
          xmlHttpRequest.withCredentials = true;
      }
    })
    .done(function(res) {  
      restore.configureState(res.data);
    }); 
  } 

  $("#noteTransparent").draggable();
 

});
 