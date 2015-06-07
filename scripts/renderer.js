/*jslint browser: true*/
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore'
], function(
  THREE,
  jQuery,
  PubSub,
  _
) {
  var events = {
    ANIMATION_UPDATE: 'renderer.animation_update'
  };

  function Renderer( scene, container, type ) {
     
    var width = (type==='crystal') ? jQuery('#app-container').width() : 0;
    var height = (type==='crystal') ? jQuery(window).height() : 0; 

    this.containerWidth = width ;
    this.containerHeight = height ;
    this.scene = scene;
    this.viewportColors = ['#0B0800', '#000600', '#08000A'];
    this.cameras = [];
    this.motifView = false;

    this.hudCamera;
    this.hudCameraCube;

    this.animateAtom = false;
    this.atom;
    this.renderer = new THREE.WebGLRenderer({ alpha:true, antialias: true, preserveDrawingBuffer: false }); // preserveDrawingBuffer: true
    this.backgroundColor =  '#000000' ;
    this.renderer.setClearColor( '#000000', 0 );
    this.renderer.setSize( width, height);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.renderer.physicallyBasedShading = true; 
    this.renderer.shadowMapSoft = true; 
    this.renderer.shadowCameraNear = 0.1;
    this.renderer.shadowCameraFar = 400;
    this.renderer.shadowCameraFov = 200;
    this.renderer.shadowMapBias = 0.0039;
    this.renderer.shadowMapDarkness = 0.4;
    this.renderer.shadowMapWidth = 1024;
    this.renderer.shadowMapHeight = 1024; 
    this.renderer.autoClear = false; // 2 scenes render 
    this.animationIsActive = false;
    
    this.effect = new THREE.AnaglyphEffect( this.renderer  ); 
    this.anaglyph = false;

    jQuery('#'+container).append(this.renderer.domElement);
 
  }; 
  Renderer.prototype.setAnaglyph = function(arg){  
    this.anaglyph = arg.anaglyph ;
  };
  Renderer.prototype.createPerspectiveCamera = function(lookat,xPos, yPos, zPos, fov){ 
    var _this = this ; 
    var camera = new THREE.PerspectiveCamera(fov, 1, 0.1 , 1000);
    camera.lookAt(lookat);
    camera.position.set(xPos, yPos, zPos); 
    _this.cameras.push(camera);
  };
  Renderer.prototype.createOrthographicCamera = function(width, height, near, far, x, y, z){ 
    var _this = this ;
    var viewSize = 50 ;
    var aspectRatio = width/height;
    var camera = new THREE.OrthographicCamera( viewSize*aspectRatio / - 2, viewSize*aspectRatio / 2, viewSize / 2, viewSize / - 2, near, far );
    camera.position.set(x,y,z);
    camera.lookAt(new THREE.Vector3(0,0,0) );
    _this.cameras.push(camera); 
  };
  Renderer.prototype.changeContainerDimensions = function(width, height) {
    var _this = this ;
    this.containerWidth = width ;
    this.containerHeight = height ; 
    this.renderer.setSize(width,height); 
    this.effect.setSize( width,height );  
  };
  Renderer.prototype.atomAnimation = function(atom) {
    this.atom = atom;
    this.animateAtom = true;
  };
  Renderer.prototype.startAtomAnimation = function() { 
    this.animateAtom = true;
  };
  Renderer.prototype.stopAtomAnimation = function() {
    this.animateAtom = false;
  }; 
  Renderer.prototype.getRenderer = function() {
    return this.renderer;
  };
  Renderer.prototype.startAnimation = function() {
    if (this.animationIsActive === false) {
      this.animationIsActive = true;
      this.animate(); 
    } 
  }; 
  Renderer.prototype.stopAnimation = function() {
    this.animationIsActive = false;
  }; 
  Renderer.prototype.animate = function() {
    var _this = this;
    if (this.animationIsActive === false) {
      return;
    }
    window.requestAnimationFrame(this.animate.bind(this));
    PubSub.publish(events.ANIMATION_UPDATE + '_' + 'explorer', true);

    if(_this.cameras.length === 1){ 
      _this.renderer.clear();

      _this.cameras[0].aspect =_this.containerWidth/_this.containerHeight;
      _this.renderer.setViewport(0, 0, _this.containerWidth, _this.containerHeight); 
      _this.renderer.setScissor(0, 0, _this.containerWidth, _this.containerHeight); 
      _this.renderer.enableScissorTest ( true );  
      
      _this.cameras[0].updateProjectionMatrix(); 
      _this.renderer.setClearColor( _this.backgroundColor, 1  );
      if(this.anaglyph){  
        this.effect.render( _this.scene, _this.cameras[0] );
      }
      else{
        this.renderer.render( _this.scene, _this.cameras[0]);
      } 
      // hud arrows
      if(_this.hudCamera !== undefined ){  
        _this.renderer.clearDepth(); 
        if(_this.containerWidth < 800 ){ 
          _this.hudCamera.aspect = (_this.containerWidth)/(_this.containerHeight);
          _this.renderer.setViewport(0, 0,  _this.containerWidth/3, _this.containerHeight/3 );
          _this.renderer.setScissor( 0, 0,  _this.containerWidth/3, _this.containerHeight/3 );
        }
        else{ 
          _this.hudCamera.aspect = (_this.containerWidth)/(_this.containerHeight); 
          _this.renderer.setViewport(0, 0,  _this.containerWidth/5, _this.containerHeight/5 );
          _this.renderer.setScissor( 0, 0,  _this.containerWidth/5, _this.containerHeight/5 );
        }
        
        _this.renderer.enableScissorTest ( true );  
         
        _this.hudCamera.updateProjectionMatrix();

        _this.renderer.setClearColor( 0x000000, 1 );
        this.renderer.render( _this.hudScene, _this.hudCamera);
         
      }
      // hud cube
      if(_this.hudCameraCube !== undefined  ){  
          
        if(_this.containerWidth < 800 ){ 
          _this.hudCameraCube.aspect = (_this.containerWidth) / (_this.containerHeight );
          _this.renderer.setViewport(0, _this.containerHeight*2/3,  _this.containerWidth/3, _this.containerHeight/3  );
          _this.renderer.setScissor( 0, _this.containerHeight*2/3,  _this.containerWidth/3, _this.containerHeight/3  );
          $('#hudRendererCube').width(_this.containerWidth/3);
          $('#hudRendererCube').height(_this.containerHeight/3);
        }
        else{ 
          _this.hudCameraCube.aspect = (_this.containerWidth) / (_this.containerHeight  ); 
          _this.renderer.setViewport(0, _this.containerHeight*4/5,  _this.containerWidth/5, _this.containerHeight/5  );
          _this.renderer.setScissor( 0, _this.containerHeight*4/5,  _this.containerWidth/5, _this.containerHeight/5  );
          $('#hudRendererCube').width(_this.containerWidth/5);
          $('#hudRendererCube').height(_this.containerHeight/5);
        }
        
        _this.renderer.enableScissorTest ( true ); 

        _this.renderer.setClearColor( 0x000000, 1 ); 
        _this.hudCameraCube.updateProjectionMatrix();
          
        this.renderer.render( _this.hudSceneCube, _this.hudCameraCube);
        
        var arrowL = _this.hudSceneCube.getObjectByName( "arrowLine" );
        var arrowH = _this.hudSceneCube.getObjectByName( "arrowHead" );
        arrowL.lookAt(_this.hudCameraCube.position);
        arrowH.lookAt(_this.hudCameraCube.position);
      }
    }
    else if( _this.cameras.length>1 ){
      for ( var i = 0; i < _this.cameras.length; ++i ) {
        var camera = _this.cameras[i]; 
        camera.aspect =_this.containerWidth/(3*_this.containerHeight); 

        if(this.anaglyph){     
          this.effect.render( _this.scene, camera, i , _this.containerWidth , _this.containerHeight, _this.viewportColors[i]);
        }
        else{ 
          _this.renderer.setViewport( 1/3 *i * _this.containerWidth, 0,  _this.containerWidth/3, _this.containerHeight );
          _this.renderer.setScissor(  1/3 *i * _this.containerWidth, 0,  _this.containerWidth/3, _this.containerHeight );
          _this.renderer.enableScissorTest ( true );

          _this.renderer.setClearColor( _this.viewportColors[i] );
 
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld();
          _this.renderer.clear(); 
          this.renderer.render( _this.scene, camera);
        }
      }
    }  
  };
  Renderer.prototype.initHud = function(scene1, scene2) {  
    this.hudScene = scene1; 
    this.hudCamera = new THREE.PerspectiveCamera(15, 1, 0.01 , 500);
    this.hudCamera.lookAt(new THREE.Vector3(0,0,0)); 
    this.hudCamera.position.set(30, 30, 60); 
    this.hudCamera.aspect = this.containerWidth/this.containerHeight;  
    this.hudScene.add(this.hudCamera);

    this.hudSceneCube = scene2; 
    this.hudCameraCube = new THREE.PerspectiveCamera(15, 1, 0.01 , 500);
    this.hudCameraCube.lookAt(new THREE.Vector3(0,0,0)); 
    this.hudCameraCube.position.set(30, 30, 60); 
    this.hudCameraCube.aspect = this.containerWidth/this.containerHeight;  
    this.hudSceneCube.add(this.hudCameraCube);

  }; 
  Renderer.prototype.getHudCameraCube = function() {
    var _this = this;
    return _this.hudCameraCube;
  };
  Renderer.prototype.getHudCamera = function() {
    var _this = this;
    return _this.hudCamera;
  };
  Renderer.prototype.getMainCamera = function() {
    var _this = this;
    return _this.cameras[0];
  };
  Renderer.prototype.getSpecificCamera = function(x) {
    var _this = this;
    return _this.cameras[x];
  };
  Renderer.prototype.onAnimationUpdate = function(callback) { 
    PubSub.subscribe(events.ANIMATION_UPDATE + '_' + 'explorer', callback);
  };
  /*Renderer.prototype.onAnimationUpdate2 = function(callback1,callback2) { 
    PubSub.subscribe(events.ANIMATION_UPDATE + '_' + 'explorer', callback1);
    PubSub.subscribe(events.ANIMATION_UPDATE + '_' + 'explorer', callback2);
  };*/
  Renderer.prototype.renderHud = function(mode) {   // preserveDrawingBuffer: true
    //this.renderer.render( this.hudScene, this.hudCamera);
  };

  return Renderer;
  
});
