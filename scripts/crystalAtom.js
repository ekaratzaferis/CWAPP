
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
  
  var globGeometry = new THREE.SphereGeometry(1,32, 32);

  function CrystalAtom(position, radius, color, elementName, id, offsetX, offsetY, offsetZ, centerOfMotif, texture, opacity, wireframe, latticeIndex) { 
     
    var _this = this; 
    this.radius = radius;  
    this.material;
    this.materialLetter;
    this.identity = id ;
    this.materialls; 
    this.color = color; 
    this.offsetX = offsetX; 
    this.offsetY = offsetY; 
    this.offsetZ = offsetZ; 
    this.centerOfMotif = new THREE.Vector3(centerOfMotif.x, centerOfMotif.y, centerOfMotif.z); ; 
    this.helperPos = {"x":0, "y":0, "z":0};
    this.elementName = elementName; 
    this.latticeIndex = latticeIndex; 
    this.subtractedForGear = { 'object3d': undefined} ;  
    this.viewMode = 'Classic';
    this.viewModeBeen = {'Classic' : false, 'SubtractedSolid' : false, 'GradeLimited' : false, 'SolidVoid' : false};
    //var textureLoader = new THREE.TextureLoader();
    this.addMaterial(color, position, opacity, wireframe,id) ;
        
  }
  CrystalAtom.prototype.addMaterial = function(color, position, opacity, wireframe, identity) {
    var _this = this ;
    this.colorMaterial = new THREE.MeshPhongMaterial({ color: color,  transparent:true,opacity:opacity    }) ;
   // this.materialLetter = new THREE.MeshPhongMaterial({ map : letterText,  transparent:true,opacity:opacity  }) ;
    var wireMat = new THREE.MeshPhongMaterial({transparent:true, opacity:0});
    if(wireframe) {
      wireMat = new THREE.MeshPhongMaterial({color : "#000000", wireframe: true, opacity:0}) ;
    }
  
    this.materials =  [  
      this.colorMaterial, 
      wireMat
    ];

    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometry , this.materials);
    sphere.name = 'atom';
    sphere.scale.set(this.radius, this.radius, this.radius);
    sphere.identity = identity ;
    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    this.object3d = sphere;
    this.object3d.position.set(position.x, position.y, position.z);
    Explorer.add(this); 

  };  
  CrystalAtom.prototype.GradeLimited = function() {
    this.viewMode = 'GradeLimited' ; 
    this.viewModeBeen.GradeLimited = true;
  };
  CrystalAtom.prototype.subtractedSolidView = function(box, pos, gear) {
    var _this = this;  
    this.viewModeBeen.SubtractedSolid = true;
    if(gear === undefined){
      Explorer.remove({'object3d':this.object3d});
    }
      
    var atomMesh = new THREE.Mesh( new THREE.SphereGeometry(_this.radius, 32, 32), new THREE.MeshPhongMaterial() );
    atomMesh.position.set(pos.x, pos.y, pos.z);
    
    var cube = THREE.CSG.toCSG(box); 
    cube = cube.inverse();
    var sphere = THREE.CSG.toCSG(atomMesh); 
    var geometry = sphere.intersect(cube); 
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);
    
    var sphereCut = THREE.SceneUtils.createMultiMaterialObject( finalGeom, [/*_this.materialLetter,*/ _this.colorMaterial ]); 
    
    if(gear !== undefined){
      this.subtractedForGear.object3d  = sphereCut ;
      Explorer.add(this.subtractedForGear);
    }
    else{
      this.object3d = sphereCut; 
      Explorer.add(this); 
    }
     
    this.helperPos.x = pos.x ;
    this.helperPos.y = pos.y ;
    this.helperPos.z = pos.z ;

    this.viewMode = 'SubtractedSolid';
  };
  CrystalAtom.prototype.removeSubtractedForGear = function() {
    Explorer.remove({'object3d' : this.subtractedForGear.object3d});  
    this.subtractedForGear.object3d = undefined;
  };
  CrystalAtom.prototype.SolidVoid = function( pos) {
    var _this = this;   
    this.helperPos.x = pos.x ;
    this.helperPos.y = pos.y ;
    this.helperPos.z = pos.z ;
    
    this.viewMode = 'SolidVoid'; 
    this.viewModeBeen.SolidVoid = true; 
  };
  CrystalAtom.prototype.hideSubtracted = function(bool) {
    this.subtractedForGear.object3d.visible = bool;
  }; 
  CrystalAtom.prototype.classicView = function() {
    var _this = this;
    if(this.viewMode === 'GradeLimited'){
      this.viewMode = 'Classic'; 
      return;
    }
    var toDestroy = _this.object3d;
    var pos = new THREE.Vector3(_this.object3d.position.x ,_this.object3d.position.y , _this.object3d.position.z  ); 
   
    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometry, [/*_this.materialLetter,*/ _this.colorMaterial ]);
   
    sphere.scale.set(this.radius, this.radius, this.radius);
    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    sphere.name = 'atom';
    sphere.identity = _this.identity ;
    this.object3d = sphere;
    this.object3d.position.x = _this.helperPos.x ;
    this.object3d.position.y = _this.helperPos.y ;
    this.object3d.position.z = _this.helperPos.z ;

    Explorer.add(this); 
    Explorer.remove({'object3d':toDestroy}); 
  };
  CrystalAtom.prototype.getID = function() {
    var _this = this ;
    return this.myID ;
  };  
  CrystalAtom.prototype.getName = function() {
    var _this = this ;
    return this.elementName ;
  };
  CrystalAtom.prototype.setName = function(name) {
    var _this = this ;
    this.elementName = name ;
  };
  CrystalAtom.prototype.getRadius = function() {
    var _this = this ;
    return this.radius ;
  }; 
  CrystalAtom.prototype.setMaterial = function(color) {
    var _this = this;
    _this.colorMaterial = new THREE.MeshPhongMaterial({ color:color});
    _this.object3d.children[1].material  = new THREE.MeshPhongMaterial({ color:color });
    _this.object3d.children[1].material.needsUpdate = true;

  };
  CrystalAtom.prototype.collided = function() {
    var _this = this;
    this.object3d.children[1].material  = new THREE.MeshPhongMaterial({ color:"#FF0000" });
    this.object3d.children[1].material.needsUpdate = true;
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
