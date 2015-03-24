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
    this.viewportColors = ['#00000C', '#000600', '#100000'];
    this.cameras = [];
    this.motifView = false;

    this.hudScene ; 
    this.hudCamera;

    this.animateAtom = false;
    this.atom;
    this.renderer = new THREE.WebGLRenderer({ antialias: true,preserveDrawingBuffer: true }); // preserveDrawingBuffer: true
    this.renderer.setClearColor( 0x000000);
    this.renderer.setSize( width, height);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.renderer.physicallyBasedShading = true; 
    this.renderer.shadowMapSoft = true; 
    this.renderer.shadowCameraNear = 0.1;
    this.renderer.shadowCameraFar = 400;
    this.renderer.shadowCameraFov = 200;
    this.renderer.shadowMapBias = 0.0039;
    this.renderer.shadowMapDarkness = 0.7;
    this.renderer.shadowMapWidth = 1024;
    this.renderer.shadowMapHeight = 1024; 
    this.renderer.autoClear = false; // 2 scenes render

    this.animationIsActive = false;
  
    jQuery('#'+container).append(this.renderer.domElement);
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
    _this.containerWidth = width ;
    _this.containerHeight = height ;
    _this.renderer.setSize(width,height);
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

    if(_this.cameras.length===1){
      _this.cameras[0].aspect =_this.containerWidth/_this.containerHeight;
      _this.renderer.clear();
      _this.cameras[0].updateProjectionMatrix();
      _this.renderer.render( _this.scene,_this.cameras[0]);  

      // Render Hud
      if(!_.isUndefined(this.hudScene)){  
        _this.renderHud('full');
      } 
    }
    else if(_this.cameras.length>1){
      for ( var i = 0; i < _this.cameras.length; ++i ) {
        var camera = _this.cameras[i];
 
        _this.renderer.setViewport( 1/3 *i * _this.containerWidth, 0,  _this.containerWidth/3, _this.containerHeight );
        _this.renderer.setScissor(  1/3 *i * _this.containerWidth, 0,  _this.containerWidth/3, _this.containerHeight );
        _this.renderer.enableScissorTest ( true );

        _this.renderer.setClearColor( _this.viewportColors[i] );

        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        _this.renderer.clear();
        _this.renderer.render( _this.scene, camera);
      }

      // Render Hud
      if(!_.isUndefined(this.hudScene)){  
        _this.renderHud('part');
      }  
    } 
  };
  Renderer.prototype.initHud = function(scene) {  
    this.hudScene = scene; 
    this.hudCamera = new THREE.OrthographicCamera( this.containerWidth / -2,  this.containerWidth / 2, this.containerHeight / 2, this.containerHeight / -2, 0.1, 10000); 
    this.hudCamera.position.set(0,0,1); 
    this.hudScene.add(this.hudCamera);

    
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
   Renderer.prototype.renderHud = function(mode) {  
    this.renderer.render( this.hudScene, this.hudCamera);
  };

  return Renderer;
  
});
