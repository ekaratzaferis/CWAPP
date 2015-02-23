'use strict';

define([
  'three',
  'unitCellExplorer',
  'underscore'
], function(
  THREE,
  UnitCellExplorer,
  _
) {
 
 
  function UnitCellAtom(position, radius, color, tangency, elementName, id, latticeIndex) {

    var _this = this;
    //console.log(latticeIndex);
    this.radius = (_.isUndefined(radius)) ? 0.04 : radius;  
    this.material;
    this.latticeIndex = latticeIndex;
    this.materialLetter;
    this.materials;
    this.tangency = tangency; 
    this.myID = id; 
    this.elementName = elementName; 
    this.userOffset = {"x":0, "y":0, "z":0};
    this.latticeOffset = {"x":0, "y":0, "z":0};
    this.latticePosIndex ;

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
  UnitCellAtom.prototype.addMaterial = function(letterText, geometry, color, position) {
    var _this = this ;
    _this.colorMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide   }) ;
    _this.materialLetter = new THREE.MeshBasicMaterial({ map : letterText, side: THREE.DoubleSide, transparent:true,opacity:1  }) ;

    _this.materials =  [  
    _this.materialLetter,
    _this.colorMaterial
    ];

    var sphere = THREE.SceneUtils.createMultiMaterialObject( geometry, _this.materials);

    _this.object3d = sphere;
    _this.object3d.position.fromArray(position.toArray()); 
    UnitCellExplorer.add(_this); 

  };

  UnitCellAtom.prototype.getUserOffset = function() {
    var _this = this ;
    return _this.userOffset ;
  };
  UnitCellAtom.prototype.setUserOffset = function(axes, val) {
    var _this = this ;
    _this.userOffset[axes] = val ;
  };
  UnitCellAtom.prototype.getLattOffset = function() {
    var _this = this ;
    return _this.latticeOffset ;
  };
  UnitCellAtom.prototype.setLatticePosIndex = function( val) {
    var _this = this ;
    _this.latticePosIndex = val ;
  };
  UnitCellAtom.prototype.getLatticePosIndex = function() {
    var _this = this ;
    return _this.latticePosIndex ;
  };

  UnitCellAtom.prototype.setLattOffset = function(pos) {
    var _this = this ; 
    _this.latticeOffset["x"] = pos.x ;
    _this.latticeOffset["y"] = pos.y ;
    _this.latticeOffset["z"] = pos.z ;
  };

  UnitCellAtom.prototype.getID = function() {
    var _this = this ;
    return _this.myID ;
  };  
  UnitCellAtom.prototype.getName = function() {
    var _this = this ;
    return _this.elementName ;
  };
  UnitCellAtom.prototype.setName = function(name) {
    var _this = this ;
    _this.elementName = name ;
  };
  UnitCellAtom.prototype.getRadius = function() {
    var _this = this ;
    return _this.radius ;
  }; 
  UnitCellAtom.prototype.setMaterial = function(color) {
    var _this = this;
    _this.colorMaterial = new THREE.MeshBasicMaterial({ color:color,side: THREE.DoubleSide  });
    _this.object3d.children[1].material  = new THREE.MeshBasicMaterial({ color:color,side: THREE.DoubleSide  });
    _this.object3d.children[1].material.needsUpdate = true;

  };
  UnitCellAtom.prototype.collided = function() {
    var _this = this;
    _this.object3d.children[1].material  = new THREE.MeshBasicMaterial({ color:"#FF0000",side: THREE.DoubleSide  });
    _this.object3d.children[1].material.needsUpdate = true;
    setTimeout(function() { 
      _this.object3d.children[1].material = _this.colorMaterial;
      _this.object3d.children[1].material.needsUpdate = true;

    },200);
  };
  UnitCellAtom.prototype.getTangency = function() {
    var _this = this; 
    return _this.tangency;
  };
  UnitCellAtom.prototype.setTangency = function(tangency) {
    var _this = this; 
    _this.tangency = tangency ;
  };
  UnitCellAtom.prototype.destroy = function() {
    UnitCellExplorer.remove(this);
  };
  return UnitCellAtom;
});
