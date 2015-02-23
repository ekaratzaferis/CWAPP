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
 
  function AtomSphere(position, radius, color, tangency, elementName, id) {
    var _this = this; 
    this.radius = (_.isUndefined(radius)) ? 0.04 : radius;  
    this.material;
    this.materialLetter;
    this.materials;
    this.tangency = tangency; 
    this.myID = id; 
    
    this.elementName = elementName;
    
    var geometry = new THREE.SphereGeometry(this.radius,32, 32); 

    var textureLoader = new THREE.TextureLoader();
    //textureLoader.load("Images/atoms/"+elementName+".png",
      textureLoader.load("Images/atoms/Be.png",
        function(tex){ 
        tex.mapping = THREE.SphericalReflectionMapping;
        _this.addMaterial(tex, geometry, color, position) ;
        }
    ); 
   
  }
  AtomSphere.prototype.addMaterial = function(letterText, geometry, color, position) {
    var _this = this ;
    _this.colorMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide   }) ;
    _this.materialLetter = new THREE.MeshBasicMaterial({ map : letterText, side: THREE.DoubleSide, transparent:true,opacity:1  }) ;

    _this.materials =  [  
      _this.materialLetter,
      _this.colorMaterial
    ];

    var sphere = THREE.SceneUtils.createMultiMaterialObject( geometry, _this.materials);
    sphere.name = 'atom';
    _this.object3d = sphere;
    _this.object3d.position.fromArray(position.toArray());
    MotifExplorer.add(_this); 

  };  
  AtomSphere.prototype.getID = function() {
    var _this = this ;
    return _this.myID ;
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
  AtomSphere.prototype.setMaterial = function(color) {
    var _this = this;
    _this.colorMaterial = new THREE.MeshBasicMaterial({ color:color,side: THREE.DoubleSide  });
    _this.object3d.children[1].material  = new THREE.MeshBasicMaterial({ color:color,side: THREE.DoubleSide  });
    _this.object3d.children[1].material.needsUpdate = true;

  };
  AtomSphere.prototype.collided = function() {
    var _this = this;
    _this.object3d.children[1].material  = new THREE.MeshBasicMaterial({ color:"#FF0000",side: THREE.DoubleSide  });
    _this.object3d.children[1].material.needsUpdate = true;
    setTimeout(function() { 
      _this.object3d.children[1].material = _this.colorMaterial;
      _this.object3d.children[1].material.needsUpdate = true;

    },200);
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
  return AtomSphere;
});
