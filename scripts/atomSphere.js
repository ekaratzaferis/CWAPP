'use strict';

define([
  'three',
  'motifExplorer',
  'underscore'
], function(
  THREE,
  MotifExplorer,
  _
) {
  var globGeometry = new THREE.SphereGeometry(1,32, 32);
  // tangency is not used anymore!
  function AtomSphere(visible,position, radius, color, tangency, elementName, id, opacity, wireframe ) {
     
    var _this = this; 
    this.radius = radius;  
    this.material;
    this.materialLetter;
    this.materials;
    this.tangency = tangency; 
    this.color = color; 
    this.myID = id; 
    this.blinking;
    this.blinkingMode = false;
    this.visible = visible;
    this.texture = 'None';
    this.elementName = elementName;
    this.wireframe = wireframe ;
    this.opacity = opacity ; 
  
    var textureLoader = new THREE.TextureLoader();
    //textureLoader.load("Images/atoms/"+elementName+".png",
    textureLoader.load("Images/atoms/None.png",
      function(tex){ 
      tex.mapping = THREE.SphericalReflectionMapping;
      _this.addMaterial(tex, color, position) ;
      }
    ); 
  }
  AtomSphere.prototype.setOpacity = function( opacity) { 
    if(_.isUndefined(opacity)) return;
    this.opacity = opacity ;
    this.colorMaterial = new THREE.MeshBasicMaterial({ color:this.colorMaterial.color,  transparent: true, opacity: opacity/10  });
    this.object3d.children[0].material.opacity = opacity/10  ;
    this.object3d.children[1].material.opacity = opacity/10  ;
    this.object3d.children[0].material.needsUpdate = true;
    this.object3d.children[1].material.needsUpdate = true;
  };
  AtomSphere.prototype.addMaterial = function(letterText, color, position) {
    var _this = this ;
     this.color = color ; 

    _this.colorMaterial = new THREE.MeshBasicMaterial({ color: color, transparent:true, opacity : this.opacity/10    }) ;
    _this.materialLetter = new THREE.MeshBasicMaterial({ map : letterText,   transparent:true, opacity: this.opacity/10  }) ;
    
    if(this.wireframe == true){
      _this.materials =  [  
        _this.colorMaterial,
        _this.materialLetter,
        new THREE.MeshBasicMaterial({color : "#000000", wireframe: true, opacity:0})
      ];
    }
    else{
      _this.materials =  [  
        _this.colorMaterial,
        _this.materialLetter,
         new THREE.MeshPhongMaterial({transparent:true, opacity:0})
      ]; 
    }

    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometry, _this.materials);
    sphere.name = 'atom';
    sphere.scale.set(this.radius, this.radius, this.radius);

    _this.object3d = sphere;
    _this.object3d.position.fromArray(position.toArray());
    MotifExplorer.add(_this); 

  };  
  AtomSphere.prototype.wireframeMat = function(bool){
    this.wireframe = bool ;
    if(bool){ 
      this.object3d.children[2].material  = new THREE.MeshBasicMaterial({color : "#000000", wireframe: bool, opacity:0}) ;
    }
    else{
      this.object3d.children[2].material  = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
    }
    this.object3d.children[2].material.needsUpdate = true;  
  };
  AtomSphere.prototype.getID = function() {
    var _this = this ;
    return _this.myID ;
  };  
  AtomSphere.prototype.getName = function() {
    var _this = this ;
    return _this.elementName ;
  };
  AtomSphere.prototype.setName = function(name) {
    var _this = this ;
    _this.elementName = name ;
  };
  AtomSphere.prototype.getRadius = function() {
    var _this = this ;
    return _this.radius ;
  }; 
  AtomSphere.prototype.setMaterial = function(color, opacity) {
    var _this = this;
    this.color = color ; 
    _this.colorMaterial = new THREE.MeshBasicMaterial({ color:color  });
    _this.object3d.children[0].material  = new THREE.MeshBasicMaterial({ color:color , transparent: true, opacity : opacity });
    _this.object3d.children[0].material.needsUpdate = true;

  };
  AtomSphere.prototype.setMaterialTexture = function(texture) {
    var _this = this;
    this.texture = texture ;
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("Images/atoms/"+texture+".png",
      function(tex){ 
        tex.mapping = THREE.SphericalReflectionMapping;
        _this.updateText(tex) ;
      }
    );  
  };
  AtomSphere.prototype.updateText = function(texture){
    var _this = this;
    _this.object3d.children[1].material  = new THREE.MeshBasicMaterial({ map : texture , transparent:true,opacity:this.opacity/10  });
    _this.object3d.children[1].material.needsUpdate = true;

  };
  AtomSphere.prototype.changeColor = function(color, forTime) { 
    var _this = this;
    this.color = color ;
    _this.object3d.children[0].material = new THREE.MeshBasicMaterial({ color: color  });
    _this.object3d.children[0].material.needsUpdate = true;
    setTimeout(function() { 
      _this.object3d.children[0].material = _this.colorMaterial;
      _this.object3d.children[0].material.needsUpdate = true; 
    }, 250);
  };
  AtomSphere.prototype.getTangency = function() {
    var _this = this; 
    return _this.tangency;
  };
  AtomSphere.prototype.setTangency = function(tangency) {
    var _this = this; 
    _this.tangency = tangency ;
  };
  AtomSphere.prototype.destroy = function() {
    MotifExplorer.remove(this);
  };
  AtomSphere.prototype.blinkMode = function(bool, color) {
    var _this = this; 
    this.blinkingMode = bool;

    if(bool){
      this.blinking = setInterval(function() { 
        _this.changeColor(color);

      }, 500);
    }
    else{
      clearInterval(this.blinking);
      _this.object3d.children[0].material = _this.colorMaterial;
      _this.object3d.children[0].material.needsUpdate = true;
    } 
  };
  return AtomSphere;
});
