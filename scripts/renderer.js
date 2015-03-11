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
    this.HudScene = null;
    this.HudCamera = new THREE.OrthographicCamera( width / -2,  width / 2, height / 2, height / -2, 0.1, 10000);
    this.HudCamera.position.z = 1;
    this.animateAtom = false;
    this.atom;
    this.renderer = new THREE.WebGLRenderer({ antialias: true,preserveDrawingBuffer: true }); // preserveDrawingBuffer: true
    this.renderer.setClearColor( 0x000000);
    this.renderer.setSize( width, height);
   // this.renderer.autoClear = false;  

    this.animationIsActive = false;
  
    jQuery('#'+container).append(this.renderer.domElement);
  };
  Renderer.prototype.mouseEvents = function(objects) {
     

  }
  Renderer.prototype.createPerspectiveCamera = function(lookat,xPos, yPos, zPos, fov){ 
    var _this = this ;
    var camera = new THREE.PerspectiveCamera(fov, 1, 0.1 , 10000);
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
  Renderer.prototype.atomAnimation = function(atom) {
    this.atom = atom;
    this.animateAtom = true;
  };
  Renderer.prototype.getRenderer = function() {
    return this.renderer;
  };
  Renderer.prototype.initHud = function(scene) {  
    this.HudScene = scene; 
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
      _this.cameras[0].updateProjectionMatrix();
      _this.renderer.setClearColor( 0x000000 );
      _this.renderer.render( _this.scene,_this.cameras[0]);  
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
    }
    
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
   Renderer.prototype.renderHud = function(callback) {

    this.renderer.setViewport( 0, 0, this.containerWidth, this.containerHeight );
    this.renderer.setScissor( 0, 0, this.containerWidth, this.containerHeight );
    this.renderer.enableScissorTest ( true );
    this.HudCamera.updateProjectionMatrix();
    this.renderer.render( this.HudScene, this.HudCamera);
  };

  return Renderer;
  
});
