'use strict';

define([
  'three',
  'unitCellExplorer',
  'underscore',
  'csg',
  'threeCSG' 
], function(
  THREE,
  UnitCellExplorer,
  _,
  csg,
  ThreeCSG,
  Worker
) {
 
 
  function UnitCellAtom(position, radius, color, tangency, elementName, id, latticeIndex) {

    var _this = this; 
    this.radius = (_.isUndefined(radius)) ? 0.04 : radius;  
    this.material;
    this.latticeIndex = latticeIndex;
    this.materialLetter;
    this.materials;
    this.tangency = tangency; 
    this.myID = id; 
    this.elementName = elementName; 
    this.userOffset = {"x":0, "y":0, "z":0};

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
  UnitCellAtom.prototype.addSubstracted = function(pos){
    /*
    var toDestroy = _this.object3d;
    var pos = new THREE.Vector3(_this.object3d.position.x ,_this.object3d.position.y , _this.object3d.position.z  );   
    var atomMesh = new THREE.Mesh( new THREE.SphereGeometry(_this.radius, 32, 32), new THREE.MeshBasicMaterial() );
    atomMesh.position.x = pos.x ;
    atomMesh.position.y = pos.y ;
    atomMesh.position.z = pos.z ;
    var cube = THREE.CSG.toCSG(box);
    var sphere = THREE.CSG.toCSG(atomMesh);
    var geometry = sphere.intersect(cube);
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);

    var sphereCut = THREE.SceneUtils.createMultiMaterialObject( finalGeom, [_this.materialLetter, _this.colorMaterial ]);
    _this.object3d = sphereCut; 
    UnitCellExplorer.add(_this); 
    UnitCellExplorer.remove({'object3d':toDestroy}); */

  };
  UnitCellAtom.prototype.subtractedSolidView = function(dimsOfBox, worker) {
    var _this = this;

    var toDestroy = _this.object3d;
 
    
 /*
   
    var sphereCut = THREE.SceneUtils.createMultiMaterialObject( finalGeom, [_this.materialLetter, _this.colorMaterial ]);
    _this.object3d = sphereCut; 
    UnitCellExplorer.add(_this); 
    UnitCellExplorer.remove({'object3d':toDestroy}); */
  };
  UnitCellAtom.prototype.classicView = function() {
    var _this = this;
    var toDestroy = _this.object3d;

    var pos = new THREE.Vector3(_this.object3d.position.x ,_this.object3d.position.y , _this.object3d.position.z  ); 
    var geometry = new THREE.SphereGeometry(_this.radius,32, 32);  
    var sphere = THREE.SceneUtils.createMultiMaterialObject( geometry, [_this.materialLetter, _this.colorMaterial ]);
    _this.object3d = sphere; 
    UnitCellExplorer.add(_this); 
    UnitCellExplorer.remove({'object3d':toDestroy}); 
  };
  UnitCellAtom.prototype.getUserOffset = function() {
    var _this = this ;
    return _this.userOffset ;
  };
  UnitCellAtom.prototype.setUserOffset = function(axes, val) {
    var _this = this ;
    _this.userOffset[axes] = val ;
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
  
  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }
  function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  return UnitCellAtom;
});
