
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
  function AtomSphere(visible, position, radius, color, tangency, elementName, id, opacity, wireframe, ionicIndex ) {
     
    var _this = this; 
    this.radius = radius;  
    this.ionicIndex = ionicIndex;  
    this.fresh = true;  
    this.material; 
    this.materials;
    this.tangency = tangency; 
    this.color = color; 
    this.myID = id; 
    this.blinking;
    this.blinkingMode = false;
    this.visible = visible; 
    this.elementName = elementName;
    this.wireframe = wireframe ;
    this.opacity = opacity; 
    this.position = position;  
    this.addMaterial(color, position) ;
       
  }
  AtomSphere.prototype.addMaterial = function(color, position) {
    var _this = this ;
    
    this.color = color ; 

    this.colorMaterial = new THREE.MeshBasicMaterial({ color: color, transparent:true, opacity : 0.7 }) ; 
    
    if(this.wireframe == true){
      this.materials =  [  
        this.colorMaterial, 
        new THREE.MeshBasicMaterial({color : "#ffffff", wireframe: true, opacity:0})
      ];
    }
    else{
      this.materials =  [  
        this.colorMaterial, 
         new THREE.MeshPhongMaterial({transparent:true, opacity:0})
      ]; 
    }

    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometry, this.materials);
    sphere.name = 'atom';
    sphere.scale.set(this.radius, this.radius, this.radius);

    this.object3d = sphere;
    this.object3d.position.fromArray(position.toArray());
    MotifExplorer.add(this); 

  }; 
  AtomSphere.prototype.setOpacity = function( opacity) {
    
    if(_.isUndefined(opacity)) return;
    this.opacity = opacity/10 ;
    this.object3d.children[0].material.opacity = 0.7 ;
    this.object3d.children[0].material.needsUpdate = true;
  }; 
  AtomSphere.prototype.wireframeMat = function(bool){
    this.wireframe = bool ;
    if(bool){ 
      this.object3d.children[1].material  = new THREE.MeshBasicMaterial({color : "#000000", wireframe: bool, opacity:0}) ;
    }
    else{
      this.object3d.children[1].material  = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
    }
    this.object3d.children[1].material.needsUpdate = true;  
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
  AtomSphere.prototype.setColorMaterial = function(color) {
    var _this = this;
    this.color = color ; 
    
    this.object3d.children[0].material.color = new THREE.Color( this.color );

  };   
  AtomSphere.prototype.changeColor = function(color, forTime) { 
    var _this = this; 

    this.object3d.children[0].material.color = new THREE.Color( color );

    setTimeout(function() { 
      _this.object3d.children[0].material.color = new THREE.Color( _this.color );
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
      this.object3d.children[0].material.color = new THREE.Color( this.color );
    } 
  };
  return AtomSphere;
});
