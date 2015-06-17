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
  'crystalMouseEvents', 'storeProject', 'restoreCWstate', 'sound', 'animate', 'gearTour', 'doll', 'dollExplorer'
], function(
  PubSub, _, THREE,
  Explorer, Renderer, Orbit,
  Menu, Lattice, Snapshot, NavArrowsHud, NavCubeHud, Motifeditor, UnitCellExplorer, MotifExplorer, MouseEvents, NavArrows, NavCube,
  CrystalMouseEvents, StoreProject, RestoreCWstate, Sound, Animate, GearTour, Doll, DollExplorer
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

  // sound & animations
  var animationMachine = new Animate(crystalScene);
  var soundMachine = new Sound(animationMachine); 
  crystalRenderer.externalFunctions.push(animationMachine.animation.bind(animationMachine));

  var menu = new Menu();
  var lattice = new Lattice(menu, soundMachine);
  
  // HUD  
  var navArrowsScene = NavArrowsHud.getInstance();  
  var hudArrows = new NavArrows(navArrowsScene.object3d, lattice);
  
  var navCubeScene = NavCubeHud.getInstance();  
  var hudCube = new NavCube(navCubeScene.object3d, lattice);
 
  //  WebGL Renderers and cameras
   
  crystalRenderer.initHud(navArrowsScene.object3d, navCubeScene.object3d);

  var unitCellRenderer = new Renderer(unitCellScene, 'unitCellRenderer', 'cell');
  unitCellRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 20,20,40, 15);

  var motifRenderer = new Renderer(motifScene, 'motifRenderer','motif'); 
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 0,0,50, 15);
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 50,0,0, 15);
  motifRenderer.createPerspectiveCamera(new THREE.Vector3(0,0,0), 0,50,0, 15);

  crystalRenderer.startAnimation();  
  
  var canvasSnapshot = new Snapshot(crystalRenderer);
  // Orbit Controls
  //var orbitHud = new Orbit(crystalRenderer.hudCamera, '#crystalRenderer', "perspective", false, 'crystal', null );

  var orbitCrystal    = new Orbit(crystalRenderer.getMainCamera(),    '#crystalRenderer',   "perspective",  false, 'crystal', unitCellRenderer.getMainCamera(),[crystalRenderer.getHudCameraCube(), crystalRenderer.getHudCamera()] ); 
    
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
  var CubeEvent = new MouseEvents(lattice, 'navCubeDetect', crystalRenderer.hudCameraCube , 'hudRendererCube',  [orbitUnitCell,orbitCrystal] );
 
  // storing mechanism  
  var storingMachine = new StoreProject( lattice, motifEditor, crystalRenderer.getMainCamera(), unitCellRenderer.getMainCamera(),motifRenderer.getSpecificCamera(0),motifRenderer.getSpecificCamera(1),motifRenderer.getSpecificCamera(2), crystalRenderer );

  // Gear Bar Tour
  var gearTour = new GearTour(crystalScene, motifEditor, lattice);

  // CW Doll
  var dollScene = DollExplorer.getInstance(); 
  crystalRenderer.setDoll(dollScene.object3d, dollScene.doll);
  var dollMachine = new Doll(dollScene.doll, crystalRenderer.dollCamera, orbitCrystal, lattice);
  
  // mouse events happen in crytal screen 
  var crystalScreenEvents = new CrystalMouseEvents(lattice, 'info', crystalRenderer.getMainCamera(), 'crystalRenderer', 'default', dollMachine);

  // lattice
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
  menu.setPadlock(function(message, arg) { 
    motifEditor.setPadlock(arg); 
  });
  menu.onSoundsSet(function(message, arg) { 
    soundMachine.switcher(arg.sounds); 
  });
  menu.onRadiusToggle(function(message, arg) { 
    lattice.toggleRadius(arg); 
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
    //motifEditor
    //lattice

  });
  menu.onFogParameterChange(function(message, arg) { 
    if(crystalScene.fogActive === true){ 
      if(!_.isUndefined(arg.fogColor)){
        crystalScene.object3d.fog.color.setHex( "0x"+arg.fogColor );  
      }
      else if(!_.isUndefined(arg.fogDensity)){
        crystalScene.object3d.fog.density = parseInt(arg.fogDensity)/2000 ;
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
  
  // motif
  $("#list li").click(function(e) { 
    
    // gear bar tour
    if(lattice.actualAtoms.length > 0){
      menu.setOnOffSlider('gearBar', 'enable'); 
    }
    else{
      menu.setOnOffSlider('gearBar', 'disable');
    }
    menu.setSliderValue('gearBar', 1);
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

      crystalScreenEvents.state = 'motifScreen';
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
    motifEditor.setManuallyCellDims(param);
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
  menu.onGearBarSelection(function(message, arg) { 
    gearTour.setState( arg.state );
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

});
 