'use strict';

define([
  'three',
  'pubsub'
], function(
  THREE,
  PubSub
) {
  // singleton
  var instance;

  var events = {
    ADD: 'explorer.add',
    REMOVE: 'explorer.remove'
  };

  function Explorer(options) {
    options = options || {};
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
    this.object3d = new THREE.Scene();
    this.fogActive = false ;
    this.object3d.fog = new THREE.FogExp2( '#000000', 0); //0.0125 );
    this.angles = {'alpha':90, 'beta':90, 'gamma':90 }; 
   
    this.movingCube = new THREE.Mesh( new THREE.BoxGeometry( 0.001, 0.001, 0.001 ), new THREE.MeshBasicMaterial( { color: 0x00ff00} ) );  
    this.movingCube.name = 'movingCube'; 
    this.movingCube.position.set(29.9, 29.9, 59.9);
    this.object3d.add(this.movingCube);

    var _this = this;
    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });

    this.light = new THREE.SpotLight( 0xFFFFFF, 1 );
    this.light.position.set( 300, 300, 60 );
    this.light.castShadow = true;
    this.light.shadowMapWidth = 1024;    // power of 2
    this.light.shadowMapHeight = 1024;

    this.light.shadowCameraNear = 200;   // keep near and far planes as tight as possible
    this.light.shadowCameraFar = 500;    // shadows not cast past the far plane
    this.light.shadowCameraFov = 20;
    this.light.shadowBias = -0.00022;    // a parameter you can tweak if there are artifacts
    this.light.shadowDarkness = 0.3;

    this.AmbLight = new THREE.AmbientLight( 0x4D4D4C );

    //light.shadowCameraVisible = true;
    this.object3d.add(this.light);
    this.object3d.add(this.AmbLight);

    // xyz axes
    var xAxis = new THREE.Geometry();
    xAxis.vertices.push(
      new THREE.Vector3( 1000,0,0 ),
      new THREE.Vector3(-1000,0,0)
    );
   
    var yAxis = new THREE.Geometry();
    yAxis.vertices.push(
      new THREE.Vector3( 0,1000,0 ),
      new THREE.Vector3(0,-1000,0)
    );

    var zAxis = new THREE.Geometry();
    zAxis.vertices.push(
      new THREE.Vector3( 0,0,1000 ),
      new THREE.Vector3( 0,0,-1000 )
    );
     
    this.xAxisLine = new THREE.Line( xAxis, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) );
    this.yAxisLine = new THREE.Line( yAxis, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) );
    this.zAxisLine = new THREE.Line( zAxis, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) ); 
    
    this.object3d.add(this.xAxisLine);
    this.object3d.add(this.yAxisLine);
    this.object3d.add(this.zAxisLine);

    //abc axis
    var bAxis = new THREE.Geometry();
    bAxis.vertices.push(
      new THREE.Vector3( 1000,0,0 ),
      new THREE.Vector3(-1000,0,0)
    );
   
    var cAxis = new THREE.Geometry();
    cAxis.vertices.push(
      new THREE.Vector3( 0,1000,0 ),
      new THREE.Vector3(0,-1000,0)
    );

    var aAxis = new THREE.Geometry();
    aAxis.vertices.push(
      new THREE.Vector3( 0,0,1000 ),
      new THREE.Vector3( 0,0,-1000 )
    );
     
    this.bAxisLine = new THREE.Line( bAxis, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) );
    this.cAxisLine = new THREE.Line( cAxis, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) );
    this.aAxisLine = new THREE.Line( aAxis, new THREE.LineBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  }) ); 

    this.object3d.add(this.bAxisLine);
    this.object3d.add(this.cAxisLine);
    this.object3d.add(this.aAxisLine);

    this.cAxisLine.visible = false;
    this.bAxisLine.visible = false;
    this.aAxisLine.visible = false;

    // xyz labels
    this.zSprite = makeTextSprite( "                      z", 
      { fontsize: 25, 
        fontface: "Arial", 
        borderColor: {r:0, g:0, b:255, a:1.0},     
        fontColor: {r:255, g:255, b:255, a:1.0} } 
        );
    this.zSprite.position.set(0,7,0);
    //this.object3d.add( this.zSprite );
    
    this.xSprite = makeTextSprite( "                        x", 
      { fontsize: 25, 
        fontface: "Arial", 
        borderColor: {r:0, g:0, b:255, a:1.0},     
        fontColor: {r:255, g:255, b:255, a:1.0} } 
        );
    this.xSprite.position.set(0,-2,12);
    //this.object3d.add( this.xSprite );

    this.ySprite = makeTextSprite( "                      y", 
      { fontsize: 25, 
        fontface: "Arial", 
        borderColor: {r:0, g:0, b:255, a:1.0},     
        fontColor: {r:255, g:255, b:255, a:1.0} } 
        );
    this.ySprite.position.set(12,-2,0);
    //this.object3d.add( this.ySprite );

    // abc labels
    this.cSprite = makeTextSprite( "                      c", 
      { fontsize: 25, 
        fontface: "Arial", 
        borderColor: {r:0, g:0, b:255, a:1.0},     
        fontColor: {r:255, g:255, b:255, a:1.0} } 
        );
    this.cSprite.position.set(0,7,0);
    this.object3d.add( this.cSprite );
    
    this.aSprite = makeTextSprite( "                        a", 
      { fontsize: 25, 
        fontface: "Arial", 
        borderColor: {r:0, g:0, b:255, a:1.0},     
        fontColor: {r:255, g:255, b:255, a:1.0} } 
        );
    this.aSprite.position.set(0,-2,12); 
    this.object3d.add( this.aSprite );

    this.bSprite = makeTextSprite( "                      b", 
      { fontsize: 25, 
        fontface: "Arial", 
        borderColor: {r:0, g:0, b:255, a:1.0},     
        fontColor: {r:255, g:255, b:255, a:1.0} } 
        );
    this.bSprite.position.set(12,-2,0);

    this.aSprite.visible = false;
    this.bSprite.visible = false;
    this.cSprite.visible = false;
    this.object3d.add( this.bSprite );
     

  } 
  Explorer.prototype.updateAbcAxes = function(angle){
    var _this = this; 

    var bStart =  new THREE.Vector3( 1000,0,0 );
    var bEnd =  new THREE.Vector3(-1000,0,0);

    var aStart =  new THREE.Vector3(0,0,1000 );
    var aEnd =  new THREE.Vector3(0,0,-1000);

    var cStart =  new THREE.Vector3( 0,1000,0 );
    var cEnd =  new THREE.Vector3(0,-1000,0);
      

    if(angle.alpha !== undefined) _this.angles.alpha = parseInt(angle.alpha);  
    if(angle.beta  !== undefined) _this.angles.beta  = parseInt(angle.beta);  
    if(angle.gamma !== undefined) _this.angles.gamma = parseInt(angle.gamma); 

    _.each(_this.angles, function(angle, a ) {
        var argument ={};
        argument[a] = angle;
        var matrix = transformationMatrix(argument);
        aStart.applyMatrix4(matrix);
        aEnd.applyMatrix4(matrix);
        bStart.applyMatrix4(matrix);
        bEnd.applyMatrix4(matrix);
        cStart.applyMatrix4(matrix);
        cEnd.applyMatrix4(matrix); 
    });
  
    this.aAxisLine.geometry.vertices[0] = aStart ;
    this.aAxisLine.geometry.vertices[1] = aEnd ;
    this.bAxisLine.geometry.vertices[0] = bStart ;
    this.bAxisLine.geometry.vertices[1] = bEnd ;
    this.cAxisLine.geometry.vertices[0] = cStart ;
    this.cAxisLine.geometry.vertices[1] = cEnd ;

    this.aAxisLine.geometry.verticesNeedUpdate = true;
    this.bAxisLine.geometry.verticesNeedUpdate = true;
    this.cAxisLine.geometry.verticesNeedUpdate = true;

    var aLblPos = aStart.clone();  ;
    var bLblPos = bStart.clone();  
    var cLblPos = cStart.clone();  

    aLblPos.setLength(7);
    bLblPos.setLength(7);
    cLblPos.setLength(7);
    this.aSprite.position.set(aLblPos.x, aLblPos.y - 2, aLblPos.z) ;
    this.bSprite.position.set(bLblPos.x, bLblPos.y - 1.5, bLblPos.z) ;
    this.cSprite.position.set(cLblPos.x, cLblPos.y, cLblPos.z) ;  
  }
  Explorer.prototype.axisMode = function(arg){
    var _this = this;
    if(arg.xyzAxes !== undefined){
      if(arg.xyzAxes){ 
        _this.zAxisLine.visible = true;
        _this.yAxisLine.visible = true;
        _this.xAxisLine.visible = true;
        _this.zSprite.visible = true;
        _this.ySprite.visible = true;
        _this.xSprite.visible = true;
      }
      else{
        _this.zAxisLine.visible = false;
        _this.yAxisLine.visible = false;
        _this.xAxisLine.visible = false;
        _this.zSprite.visible = false;
        _this.ySprite.visible = false;
        _this.xSprite.visible = false;
      }
    }
    else if(arg.abcAxes !== undefined){
      if(arg.abcAxes){ 
        _this.aAxisLine.visible = true;
        _this.bAxisLine.visible = true;
        _this.cAxisLine.visible = true;
        _this.aSprite.visible = true;
        _this.bSprite.visible = true;
        _this.cSprite.visible = true;
      }
      else{
        _this.cAxisLine.visible = false;
        _this.bAxisLine.visible = false;
        _this.aAxisLine.visible = false;
        _this.aSprite.visible = false;
        _this.bSprite.visible = false;
        _this.cSprite.visible = false;
      }
    }

  };
  var transformationMatrix = function(parameter) {
      
    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - (( parameter.alpha) || 90)) * Math.PI / 180);

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleY || 1;
    var sc = parameter.scaleZ || 1; 
    
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
    return m;
  };
  Explorer.prototype.add = function(object) {
    this.object3d.add(object.object3d);
  };

  Explorer.prototype.remove = function(object) {  
    this.object3d.remove(object.object3d);
  };
  function makeTextSprite( message, parameters )
  {
    if ( parameters === undefined ) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ?  parameters["fontface"] : "Arial"; 
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18; 
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?   parameters["borderThickness"] : 0; 
    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 }; 
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:0};
  
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "  " + fontsize + "px " + fontface;
      
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    //roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color 
    context.fillStyle = "rgba("+parameters.fontColor.r+", "+parameters.fontColor.g+", "+parameters.fontColor.b+", 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( 
      { map: texture, useScreenCoordinates: false, transparent:true, opacity:1 } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(10,5,1.0);
    return sprite;  
  }
  return {
    getInstance: function(options) {
      return (instance = instance || new Explorer(options));
    },
    add: function(object) {
      PubSub.publish(events.ADD, object);
    },
    remove: function(object) {
      PubSub.publish(events.REMOVE, object);
    }
  };
});
