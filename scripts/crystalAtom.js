
'use strict';

define([
  'three',
  'explorer',
  'underscore'
], function(
  THREE,
  Explorer,
  _
) {
 
  function CrystalAtom(position, radius, color, elementName, id, offsetX, offsetY, offsetZ, centerOfMotif) { 
     
    var _this = this; 
    this.radius = radius;  
    this.material;
    this.materialLetter;
    this.materials; 
    this.offsetX = offsetX; 
    this.offsetY = offsetY; 
    this.offsetZ = offsetZ; 
    this.centerOfMotif = new THREE.Vector3(centerOfMotif.x, centerOfMotif.y, centerOfMotif.z); ; 
    
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
  CrystalAtom.prototype.addMaterial = function(letterText, geometry, color, position) {
    var _this = this ;
    _this.colorMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide   }) ;
    _this.materialLetter = new THREE.MeshBasicMaterial({ map : letterText, side: THREE.DoubleSide, transparent:true,opacity:1  }) ;

    _this.materials =  [  
      _this.materialLetter,
      _this.colorMaterial
    ];

    var sphere = THREE.SceneUtils.createMultiMaterialObject( geometry, _this.materials);
    
    _this.object3d = sphere;
    _this.object3d.position.set(position.x, position.y, position.z);
    Explorer.add(_this); 

  };  
  CrystalAtom.prototype.getID = function() {
    var _this = this ;
    return _this.myID ;
  };  
  CrystalAtom.prototype.getName = function() {
    var _this = this ;
    return _this.elementName ;
  };
  CrystalAtom.prototype.setName = function(name) {
    var _this = this ;
    _this.elementName = name ;
  };
  CrystalAtom.prototype.getRadius = function() {
    var _this = this ;
    return _this.radius ;
  }; 
  CrystalAtom.prototype.setMaterial = function(color) {
    var _this = this;
    _this.colorMaterial = new THREE.MeshBasicMaterial({ color:color,side: THREE.DoubleSide  });
    _this.object3d.children[1].material  = new THREE.MeshBasicMaterial({ color:color,side: THREE.DoubleSide  });
    _this.object3d.children[1].material.needsUpdate = true;

  };
  CrystalAtom.prototype.collided = function() {
    var _this = this;
    _this.object3d.children[1].material  = new THREE.MeshBasicMaterial({ color:"#FF0000",side: THREE.DoubleSide  });
    _this.object3d.children[1].material.needsUpdate = true;
    setTimeout(function() { 
      _this.object3d.children[1].material = _this.colorMaterial;
      _this.object3d.children[1].material.needsUpdate = true;

    },200);
  }; 
  CrystalAtom.prototype.destroy = function() {
    Explorer.remove(this);  
  };
  return CrystalAtom;
});
