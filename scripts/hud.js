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

  function Hud( scene, camera, latticeParams) {
    var width = jQuery('#app-container').width() ;
    var height = jQuery(window).height() ; 
    var offsetX = 70 ;
    var offsetY = 70 ;
    var arrowLength = 70 ;

    console.log(camera);
    var startB = new THREE.Vector3(-width/2 + offsetX , -height/2 + offsetY, -100);
    var endB = new THREE.Vector3(-width/2 + offsetX + arrowLength, -height/2 + offsetY, -100);
    var length =  startB.distanceTo(endB) ; 
    var directionB = new THREE.Vector3().subVectors( endB,  startB).normalize();
    var arrowB = new THREE.ArrowHelper( directionB , startB, length , "#FF0000", 10, 10);

    var startC = new THREE.Vector3(-width/2 + offsetX, -height/2 + offsetY, -100);
    var endC = new THREE.Vector3(-width/2 + offsetX, -height/2 + offsetY + arrowLength, -100);
    var directionC = new THREE.Vector3().subVectors( endC,  startC).normalize();
    var arrowC = new THREE.ArrowHelper( directionC , startC, length , "#80FF00", 10, 10);

    var startA = new THREE.Vector3(-width/2 + offsetX, -height/2 + offsetY, -100);
    var endA = new THREE.Vector3(-width/2 + offsetX - 30 , -height/2 + offsetY - 30 , -100 + arrowLength);
    var directionA = new THREE.Vector3().subVectors( endA,  startA).normalize();
    var arrowA = new THREE.ArrowHelper( directionA , startA, length , "#2E64FE", 10, 10);
    
    var mesh = new THREE.Mesh(new THREE.BoxGeometry( 110,110,110, 1, 1, 1), new THREE.MeshBasicMaterial({ color:"#FFFFBE",     wireframe: true}) );

    //mesh.position.set(0,0,-560 );
    //mesh.rotation.set(camera.rotation.x,camera.rotation.y,camera.rotation.z  );
     
    //scene.add(mesh); 

    var group = new THREE.Object3D();//create an empty container

    group.add( arrowC );//add a mesh with geometry to it
    group.add( arrowB );//add a mesh with geometry to it
    group.add( arrowA );//add a mesh with geometry to it
    scene.add( group );//when done, add the group to the scene

    mesh.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/4);

    var aLabel = THREE.ImageUtils.loadTexture( "Images/a.png" );  
    var aMaterial = new THREE.SpriteMaterial( { map: aLabel, color: 0xffffff, fog: true } );
    var spriteA = new THREE.Sprite( aMaterial );
     
    spriteA.position.set(endA.x - 5, endA.y - 5, endA.z);
    spriteA.scale.set(20,20,20);
    scene.add( spriteA );

    var bLabel = THREE.ImageUtils.loadTexture( "Images/b.png" );
    var bMaterial = new THREE.SpriteMaterial( { map: bLabel, color: 0xffffff, fog: true } );
    var spriteB = new THREE.Sprite( bMaterial );
     
    spriteB.position.set(endB.x + 10, endB.y , endB.z);
    spriteB.scale.set(20,20,20);
    scene.add( spriteB );

    var cLabel = THREE.ImageUtils.loadTexture( "Images/c.png" );  
    var cMaterial = new THREE.SpriteMaterial( { map: cLabel, color: 0xffffff, fog: true } );
    var spriteC = new THREE.Sprite( cMaterial );
     
    spriteC.position.set(endC.x +5, endC.y + 10, endC.z);
    spriteC.scale.set(20,20,20);
    scene.add( spriteC );

    // angles
    var alpha = makeTextSprite( " α : 90° ", 
      { fontsize: 40, fontface: "Arial", borderColor: {r:0, g:0, b:255, a:1.0}, fontColor: {r:99, g:34, b:99, a:1.0} } );
    alpha.position.set(-width/2 + offsetX + 55, -height/2 + offsetY, -100);
    scene.add( alpha );
    
    var beta = makeTextSprite( " β : 90° ", 
      { fontsize: 40, fontface: "Arial", borderColor: {r:0, g:0, b:255, a:1.0}, fontColor: {r:22, g:110, b:2, a:1.0} } );
    beta.position.set(-width/2 + offsetX, -height/2 + offsetY - 10, -100);
    scene.add( beta );
    
    var gamma = makeTextSprite( " γ : 90° ", 
      { fontsize: 40, fontface: "Arial", borderColor: {r:0, g:0, b:255, a:1.0}, fontColor: {r:234, g:0, b:2, a:1.0}  } );
    gamma.position.set(-width/2 + offsetX + 50, -height/2 + offsetY - 30, -100);
    scene.add( gamma );

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
    context.font = " bold " + fontsize + "px " + fontface;
      
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
    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( 
      { map: texture, useScreenCoordinates: false, transparent:true, opacity:1 } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;  
  }

  // function for drawing rounded rectangles
  function roundRect(ctx, x, y, w, h, r) 
  {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();   
  }
  return Hud;
  
});
