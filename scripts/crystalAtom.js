
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
    this.helperPos = {"x":0, "y":0, "z":0};
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
  CrystalAtom.prototype.subtractedSolidView = function(box, pos) {
    var _this = this; 

    Explorer.remove({'object3d':_this.object3d}); 
     
    var atomMesh = new THREE.Mesh( new THREE.SphereGeometry(_this.radius, 32, 32), new THREE.MeshBasicMaterial() );
    atomMesh.position.set(pos.x, pos.y, pos.z);
    
    var cube = THREE.CSG.toCSG(box); 
     cube = cube.inverse();
    var sphere = THREE.CSG.toCSG(atomMesh);
    var geometry = sphere.intersect(cube); 
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);
    
    var sphereCut = THREE.SceneUtils.createMultiMaterialObject( finalGeom, [_this.materialLetter, _this.colorMaterial ]); 
    _this.object3d = sphereCut; 
    Explorer.add(_this); 
    _this.helperPos.x = pos.x ;
    _this.helperPos.y = pos.y ;
    _this.helperPos.z = pos.z ;
  };
  CrystalAtom.prototype.SolidVoid = function( pos) {
    var _this = this;   
    _this.helperPos.x = pos.x ;
    _this.helperPos.y = pos.y ;
    _this.helperPos.z = pos.z ;
 
  };
  CrystalAtom.prototype.classicView = function() {
    var _this = this;
    var toDestroy = _this.object3d;
    var pos = new THREE.Vector3(_this.object3d.position.x ,_this.object3d.position.y , _this.object3d.position.z  ); 

    var geometry = new THREE.SphereGeometry(_this.radius,32, 32);  
    var sphere = THREE.SceneUtils.createMultiMaterialObject( geometry, [_this.materialLetter, _this.colorMaterial ]);
    _this.object3d = sphere;
    _this.object3d.position.x = _this.helperPos.x ;
    _this.object3d.position.y = _this.helperPos.y ;
    _this.object3d.position.z = _this.helperPos.z ;
    Explorer.add(_this); 
    Explorer.remove({'object3d':toDestroy}); 
  };
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
  function assignUVs( geometry ){ //todo maybe it doesn't work right
     
    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (var i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;

    return geometry;
  }
  return CrystalAtom;
});
