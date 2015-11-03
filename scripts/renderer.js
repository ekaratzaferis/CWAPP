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

  function Renderer(scene, container, type) {
     
    var width = (type==='crystal') ? jQuery('#app-container').width() : 0;
    var height = (type==='crystal') ? jQuery(window).height() : 0; 

    this.rType = type;
    this.rstatsON = false;
    this.containerWidth = width ;
    this.containerHeight = height ;
    this.scene = scene.object3d;
    this.doll;
    this.viewportColors = ['#0B0800', '#000600', '#08000A'];
    this.cameras = [];
    this.motifView = false;
    this.ucViewport = false;
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
    this.container = container;
    this.externalFunctions = [];

    this.dollScene;
    this.dollCamera;

    // stats
    this.glS;
    this.rS;

    jQuery('#'+container).append(this.renderer.domElement);
 
  }; 
  Renderer.prototype.setAnaglyph = function(arg){  
    this.anaglyph = arg.anaglyph ;
  };
  Renderer.prototype.createPerspectiveCamera = function(lookat,xPos, yPos, zPos, fov){  
    var camera = new THREE.PerspectiveCamera(fov, 1, 0.1 , 5000);
    camera.lookAt(lookat);
    camera.position.set(xPos, yPos, zPos); 
    this.cameras.push(camera);
    
  };
  Renderer.prototype.createOrthographicCamera = function(width, height, near, far, x, y, z){  
    var viewSize = 50 ;
    var aspectRatio = width/height;
    var camera = new THREE.OrthographicCamera( viewSize*aspectRatio / - 2, viewSize*aspectRatio / 2, viewSize / 2, viewSize / - 2, near, far );
    camera.position.set(x,y,z);
    camera.lookAt(new THREE.Vector3(0,0,0) );
    this.cameras.push(camera); 
  };
  Renderer.prototype.changeContainerDimensions = function(width, height) { 
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
 
    if (this.animationIsActive === false) {
      return;
    }
    window.requestAnimationFrame(this.animate.bind(this));
    PubSub.publish(events.ANIMATION_UPDATE + '_' + this.rType, true);

    if(this.rS !== undefined && this.rstatsON === true){  
      this.rS( 'frame' ).start();
      this.glS.start();
      
      this.rS( 'rAF' ).tick();
      this.rS( 'FPS' ).frame();

      this.rS( 'texture' ).start();
        
      this.rS( 'texture' ).end();

      this.rS( 'setup' ).start();
    
      this.rS( 'setup' ).end();
    
      this.rS( 'render' ).start();
    }

    if(this.cameras.length === 1){ 
      if(this.container === 'unitCellRenderer') {
        this.renderer.clear();
      }

      this.cameras[0].aspect =this.containerWidth/this.containerHeight;
      this.renderer.setViewport(0, 0, this.containerWidth, this.containerHeight); 
      this.renderer.setScissor(0, 0, this.containerWidth, this.containerHeight); 
      this.renderer.enableScissorTest ( true );  
      
      this.cameras[0].updateProjectionMatrix();  

      if(this.anaglyph){  
        this.effect.render( this.scene, this.cameras[0] );
      }
      else{  
        if(this.container === 'crystalRenderer') {
         
          this.renderer.render( this.scene, this.cameras[0], undefined, true);

          if(this.doll !== undefined){  
            this.renderer.clearDepth(); // celar depth buffer to have gear bar and doll on top
            this.dollCamera.aspect = this.containerWidth/this.containerHeight;   
            this.renderer.setViewport(0, 0, this.containerWidth, this.containerHeight); 
            this.renderer.setScissor(0, 0, this.containerWidth, this.containerHeight); 
            this.dollCamera.updateProjectionMatrix();  
            this.renderer.render( this.dollScene, this.dollCamera);        
          }

        }
        else if(this.container === 'unitCellRenderer') {
          
          this.renderer.setClearColor( this.backgroundColor );
          this.renderer.render( this.scene, this.cameras[0] );
        }
      } 

      // hud arrows
      if(this.hudCamera !== undefined ){  
        this.renderer.clearDepth(); 
         
        var tempW8 = 1.3 * this.containerWidth/this.displayFactor ;
        var tempH8 = 1.3 * this.containerHeight/this.displayFactor ;

        this.hudCamera.aspect = (this.containerWidth) / (this.containerHeight ); 
        this.renderer.setViewport(
          this.containerWidth-tempW8, 
          0, 
          tempW8, 
          tempH8  
        );

        this.renderer.setScissor(  
          this.containerWidth-tempW8, 
          0, 
          tempW8, 
          tempH8  
        ); 
          
        this.renderer.enableScissorTest ( true );  
         
        this.hudCamera.updateProjectionMatrix();

        this.renderer.setClearColor( this.backgroundColor );
        this.renderer.render( this.hudScene, this.hudCamera); 
      }
      // hud cube
      if(this.hudCameraCube !== undefined ){  
         
        this.hudCameraCube.aspect = (this.containerWidth) / (this.containerHeight  ); 
        this.renderer.setViewport(
          0, 
          this.containerHeight - this.containerHeight/this.displayFactor,  
          this.containerWidth/this.displayFactor, 
          this.containerHeight/this.displayFactor  
        );

        this.renderer.setScissor( 
          0, 
          this.containerHeight - this.containerHeight/this.displayFactor,  
          this.containerWidth/this.displayFactor, 
          this.containerHeight/this.displayFactor  
        ); 
  
        this.hudCameraCube.updateProjectionMatrix();

        this.renderer.enableScissorTest ( true ); 

        this.renderer.setClearColor( this.backgroundColor ); 
         
        this.renderer.render( this.hudSceneCube, this.hudCameraCube);
        
        var arrowL = this.hudSceneCube.getObjectByName( "arrowLine" );
        var arrowH = this.hudSceneCube.getObjectByName( "arrowHead" );
        arrowL.lookAt(this.hudCameraCube.position);
        arrowH.lookAt(this.hudCameraCube.position); 
      } 
    }
    else if( this.cameras.length>1 ){
      for ( var i = 0; i < this.cameras.length; ++i ) {
        var camera = this.cameras[i]; 
        camera.aspect =this.containerWidth/(3*this.containerHeight); 

        if(this.anaglyph){     
          this.effect.render( this.scene, camera, i , this.containerWidth , this.containerHeight, this.viewportColors[i]);
        }
        else{ 
          this.renderer.setViewport( 1/3 *i * this.containerWidth, 0,  this.containerWidth/3, this.containerHeight );
          this.renderer.setScissor(  1/3 *i * this.containerWidth, 0,  this.containerWidth/3, this.containerHeight );
          this.renderer.enableScissorTest ( true );

          this.renderer.setClearColor( this.viewportColors[i] );
 
          camera.updateProjectionMatrix();

          this.renderer.clear(); 
          this.renderer.render( this.scene, camera);
        }
      }
    }  
    
    if(this.rS !== undefined && this.rstatsON === true){ 

      this.rS( 'render' ).end();

      this.rS( 'frame' ).end();

      this.rS( 'memory.limit' ).set( performance.memory.jsHeapSizeLimit );
      this.rS( 'memory.used' ).set( performance.memory.usedJSHeapSize );
      this.rS( 'memory.total' ).set( performance.memory.totalJSHeapSize );

      //this.rS( 'mouse' ).set( mouseOps );
      this.rS( 'rStats' ).start();
      this.rS().update();
      this.rS( 'rStats' ).end();
    }

    for (var i = 0; i < this.externalFunctions.length ; i++) {
      this.externalFunctions[i]();
    }; 
  };
  Renderer.prototype.setUCviewport = function(bool) { 
    this.ucViewport = bool;
  }; 
  Renderer.prototype.setGamma = function(bool) {  
    this.renderer.gammaOutput = bool;
    this.renderer.gammaInput = bool;
  };
  Renderer.prototype.setDoll = function(scene, doll) { 
    if( doll !== undefined) {
      this.doll = doll;
    } 
    else { 
      this.dollScene = scene;
      this.dollCamera = new THREE.PerspectiveCamera(90, 1, 0.1 , 1000); 
      this.dollCamera.lookAt(new THREE.Vector3(0,0,0));
      this.dollCamera.position.set(0,0,20); 
      this.dollCamera.aspect = this.containerWidth/this.containerHeight;  

      this.dollScene.add(this.dollCamera);
    }

    if(this.doll !== undefined){  
      this.dollCamera.aspect = this.containerWidth/this.containerHeight;   
      this.renderer.setViewport(0, 0, this.containerWidth, this.containerHeight); 
      this.renderer.setScissor(0, 0, this.containerWidth, this.containerHeight); 
      this.dollCamera.updateProjectionMatrix();  
      this.renderer.render( this.dollScene, this.dollCamera);        
    }

  };
  Renderer.prototype.initHud = function(scene1, scene2, displayFactor) {  
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

    this.displayFactor = displayFactor;
  }; 
  Renderer.prototype.getHudCameraCube = function() {
     
    return this.hudCameraCube;
  };
  Renderer.prototype.getHudCamera = function() {
     
    return this.hudCamera;
  };
  Renderer.prototype.getMainCamera = function() {
     return this.cameras[0];
  };
  Renderer.prototype.getSpecificCamera = function(x) {
     return this.cameras[x];
  };
  Renderer.prototype.onAnimationUpdate = function(callback) { 
    PubSub.subscribe(events.ANIMATION_UPDATE + '_' + this.rType, callback);
  }; 
  Renderer.prototype.renderHud = function(mode) {   // preserveDrawingBuffer: true
    //this.renderer.render( this.hudScene, this.hudCamera);
  };

  return Renderer;
  
});
