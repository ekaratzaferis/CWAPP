
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

  var instance;
  var storedTextures = {};

  function AtomMaterialManager( lattice, motifEditor) {

    this.lattice = lattice;
    this.motifEditor = motifEditor;
     
  } 

  function createLabel(element, ionic, x, y, z, size, color, backGroundColor, backgroundMargin) {
 
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = size + "pt Arial";
    var textWidth = context.measureText(element).width;
    canvas.width = (textWidth + backgroundMargin) * 1.5 ;
    canvas.height = size + backgroundMargin; 
    context.font = size + "pt Arial";
    context = canvas.getContext("2d");

    if(backGroundColor) {
      context.fillStyle = backGroundColor;
      context.fillRect(
        canvas.width / 2 - textWidth / 2 - backgroundMargin / 2, 
        canvas.height / 2 - size / 2 - +backgroundMargin / 2, 
        textWidth + backgroundMargin, 
        size + backgroundMargin
      );
    }

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;

    context.fillText( element , canvas.width / 2.5, canvas.height / 2.5);
   
    if(ionic !== '0'){
      context.font = (size/2) + "pt Arial";
      context.fillText( ionic , canvas.width / 2.5 + 1.5*context.measureText(ionic).width , canvas.height / 2.8); 
    }
      
    var texture = new THREE.Texture( canvas  );
    texture.needsUpdate = true;
    //texture.anisotropy = 1;
    texture.mapping = THREE.SphericalReflectionMapping;
    //texture.wrapS = THREE.RepeatWrapping;
    //texture.wrapT = THREE.RepeatWrapping;
    //texture.repeat.set(8,8);
    //texture.magFilter = THREE.NearestFilter;
    //texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.minFilter = THREE.NearestFilter ;
    return texture;
  }
  return {
    getInstance: function(lattice, motifEditor) {
      return (instance = instance || new AtomMaterialManager(lattice, motifEditor));
    }, 
    getTexture : function(elementName, ionic){
 
      var texture = createLabel(elementName, ionic, 1,1, 0, 32, "black", undefined, 256); 

      storedTextures[elementName] = texture; // to be used

      return texture;
   
    }
  };
});  
