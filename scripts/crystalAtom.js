
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
 
  function CrystalAtom(position, radius, color, elementName, id, offsetX, offsetY, offsetZ, centerOfMotif, texture, opacity, wireframe) { 
     
    var _this = this; 
    this.radius = radius;  
    this.material;
    this.materialLetter;
    this.identity = id ;
    this.materialls; 
    this.offsetX = offsetX; 
    this.offsetY = offsetY; 
    this.offsetZ = offsetZ; 
    this.centerOfMotif = new THREE.Vector3(centerOfMotif.x, centerOfMotif.y, centerOfMotif.z); ; 
    this.helperPos = {"x":0, "y":0, "z":0};
    this.elementName = elementName; 
    var geometry = new THREE.SphereGeometry(this.radius,32, 32); 

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load(texture,
      function(tex){
        tex.mapping = THREE.SphericalReflectionMapping;
        _this.addMaterial(tex, geometry, color, position, opacity, wireframe,id) ;
      }
    );  
  }
  CrystalAtom.prototype.addMaterial = function(letterText, geometry, color, position, opacity, wireframe, identity) {
    var _this = this ;
    _this.colorMaterial = new THREE.MeshPhongMaterial({ color: color, side: THREE.FrontSide, transparent:true,opacity:opacity    }) ;
    _this.materialLetter = new THREE.MeshPhongMaterial({ map : letterText, side: THREE.FrontSide, transparent:true,opacity:opacity  }) ;
    var wireMat = new THREE.MeshPhongMaterial({transparent:true, opacity:0});
    if(wireframe) wireMat = new THREE.MeshPhongMaterial({color : "#000000", wireframe: true, transparent:false}) ;
  
    _this.materials =  [  
      _this.colorMaterial,
      _this.materialLetter,
      wireMat
    ];

    var sphere = THREE.SceneUtils.createMultiMaterialObject( geometry, _this.materials);
    sphere.name = 'atom';
    sphere.identity = identity ;
    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    _this.object3d = sphere;
    _this.object3d.position.set(position.x, position.y, position.z);
    Explorer.add(_this); 

  };  
  CrystalAtom.prototype.subtractedSolidView = function(box, pos) {
    var _this = this; 

    Explorer.remove({'object3d':_this.object3d}); 
     
    var atomMesh = new THREE.Mesh( new THREE.SphereGeometry(_this.radius, 32, 32), new THREE.MeshPhongMaterial() );
    atomMesh.position.set(pos.x, pos.y, pos.z);
    
    var cube = THREE.CSG.toCSG(box); 
     cube = cube.inverse();
    var sphere = THREE.CSG.toCSG(atomMesh);
    var geometry = sphere.intersect(cube); 
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);
    
    var sphereCut = THREE.SceneUtils.createMultiMaterialObject( finalGeom, [_this.materialLetter, _this.colorMaterial ]); 
    //sphere.children[0].receiveShadow = true; 
    //sphere.children[0].castShadow = true; 

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
   
    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    sphere.name = 'atom';
    sphere.identity = _this.identity ;
    _this.object3d = sphere;
    _this.object3d.position.x = _this.helperPos.x ;
    _this.object3d.position.y = _this.helperPos.y ;
    _this.object3d.position.z = _this.helperPos.z ;

    Explorer.add(_this); 
    Explorer.remove({'object3d':toDestroy}); 
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
    _this.colorMaterial = new THREE.MeshPhongMaterial({ color:color,side: THREE.FrontSide  });
    _this.object3d.children[1].material  = new THREE.MeshPhongMaterial({ color:color,side: THREE.FrontSide  });
    _this.object3d.children[1].material.needsUpdate = true;

  };
  CrystalAtom.prototype.collided = function() {
    var _this = this;
    _this.object3d.children[1].material  = new THREE.MeshPhongMaterial({ color:"#FF0000",side: THREE.FrontSide  });
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
