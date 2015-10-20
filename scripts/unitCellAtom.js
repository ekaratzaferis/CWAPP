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
  ThreeCSG
) { 
  var globGeometry = new THREE.SphereGeometry(1,32, 32);

  function UnitCellAtom(position, radius, color, tangency, elementName, id, latticeIndex, opacity, wireframe) { 
     
    var _this = this; 
    this.radius = radius;  
    this.material;
    this.latticeIndex = latticeIndex; 
    this.materials;
    this.tangency = tangency; 
    this.wireframe = wireframe; 
    this.color = color; 
    this.opacity = opacity ; 
    this.myID = id; 
    this.elementName = elementName; 
    this.viewMode = 'Classic'; 
    this.userOffset = {"x":0, "y":0, "z":0};
    this.helperPos = {"x":0, "y":0, "z":0}; 
    this.wireframe = wireframe ;
    this.addMaterial(color, position) ;
       
  };
  UnitCellAtom.prototype.addMaterial = function(color, position, opacity) {
    var _this = this ;

    this.colorMaterial = new THREE.MeshPhongMaterial({  color: color,  transparent:true, opacity:this.opacity }) ; 
    var wireMat = new THREE.MeshBasicMaterial({transparent:true, opacity:0});
      
    this.materials =  [  
      this.colorMaterial, 
      wireMat
    ];
  
    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometry, this.materials);
   
    sphere.scale.set(this.radius, this.radius, this.radius);
    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true;  
    
    this.object3d = sphere;
    this.object3d.position.fromArray(position.toArray()); 
    UnitCellExplorer.add(this);  
  };
  UnitCellAtom.prototype.setOpacity = function( opacity) { 
    if(_.isUndefined(opacity)) return;
    this.colorMaterial = new THREE.MeshPhongMaterial({ color:this.colorMaterial.color, transparent: true, opacity: opacity/10  });
    this.object3d.children[0].material.opacity = opacity/10  ; 
    this.object3d.children[0].material.needsUpdate = true; 
  };
  UnitCellAtom.prototype.flatMode = function(bool){
   
    if(bool === true){ 
      this.object3d.children[0].material =  new THREE.MeshLambertMaterial( { shading: THREE.SmoothShading, color : this.color, transparent:true, opacity:this.opacity} ); 
    }
    else{
      this.object3d.children[0].material = new THREE.MeshPhongMaterial({ color: this.color, transparent:true, opacity:this.opacity }) ; 
    }
    this.object3d.children[0].material.needsUpdate = true;    
  };
  UnitCellAtom.prototype.realisticMode = function(bool){
   
    if(bool === true){ 
      this.object3d.children[0].material =  new THREE.MeshPhongMaterial( { shading: THREE.SmoothShading, color : this.color, transparent:true, opacity:this.opacity} ); 
    }
    else{
      this.object3d.children[0].material = new THREE.MeshPhongMaterial({ shading: THREE.SmoothShading, color: this.color, transparent:true, opacity:this.opacity }) ; 
    }
    this.object3d.children[0].material.needsUpdate = true;    
  };
  UnitCellAtom.prototype.wireframeMat = function(bool){
    this.wireframe = bool ;
    if(bool === true){ 
      this.object3d.children[0].material = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
      this.object3d.children[1].material = new THREE.MeshBasicMaterial({color : this.color, wireframe: true, opacity:0}) ;
    }
    else{
      this.object3d.children[0].material = new THREE.MeshPhongMaterial({ color: this.color, transparent:true, opacity:this.opacity }) ;
      this.object3d.children[1].material = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
    }
    this.object3d.children[0].material.needsUpdate = true;  
    this.object3d.children[1].material.needsUpdate = true;  
  };
  UnitCellAtom.prototype.subtractedSolidView = function(box, pos) {
    var _this = this; 

    UnitCellExplorer.remove({'object3d':_this.object3d}); 
     
    var atomMesh = new THREE.Mesh( new THREE.SphereGeometry(_this.radius, 32, 32), new THREE.MeshPhongMaterial() );
    atomMesh.position.set(pos.x, pos.y, pos.z);
    
    var cube = THREE.CSG.toCSG(box);
    cube = cube.inverse();
    var sphere = THREE.CSG.toCSG(atomMesh);
    var geometry = sphere.intersect(cube);
    var geom = THREE.CSG.fromCSG(geometry);
    var finalGeom = assignUVs(geom);
    
    var sphereCut = THREE.SceneUtils.createMultiMaterialObject( finalGeom, [this.colorMaterial ]); 
    sphereCut.children[0].receiveShadow = true; 
    sphereCut.children[0].castShadow = true; 

    _this.object3d = sphereCut; 
    UnitCellExplorer.add(_this);
    _this.helperPos.x = pos.x ;
    _this.helperPos.y = pos.y ;
    _this.helperPos.z = pos.z ;
    _this.viewMode = 'SubtractedSolid';

  };
  UnitCellAtom.prototype.SolidVoid = function( pos) {
    var _this = this; 
    _this.helperPos.x = pos.x ;
    _this.helperPos.y = pos.y ;
    _this.helperPos.z = pos.z ;
    _this.viewMode = 'SolidVoid'; 
  };
  UnitCellAtom.prototype.GradeLimited = function() {
    this.viewMode = 'GradeLimited' ; 
  };
  UnitCellAtom.prototype.classicView = function() {
    var _this = this;
    if(_this.viewMode === 'GradeLimited'){
      this.viewMode = 'Classic'; 
      return;
    }
    var toDestroy = _this.object3d;
    var pos = new THREE.Vector3(_this.object3d.position.x ,_this.object3d.position.y , _this.object3d.position.z  ); 
  
    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometry, [ this.colorMaterial ]);
    sphere.scale.set(this.radius, this.radius, this.radius);

    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    _this.object3d = sphere;
    _this.object3d.position.x = _this.helperPos.x ;
    _this.object3d.position.y = _this.helperPos.y ;
    _this.object3d.position.z = _this.helperPos.z ;
    UnitCellExplorer.add(_this); 
    UnitCellExplorer.remove({'object3d':toDestroy}); 
  };
  UnitCellAtom.prototype.getUserOffset = function() {
    var _this = this ;
    return _this.userOffset ;
  };
  UnitCellAtom.prototype.setUserOffset = function(axes, val) {
    var _this = this ;
    this.userOffset[axes] = val ;
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
  UnitCellAtom.prototype.setMaterial = function(color, opacity) {
    var _this = this;
    _this.colorMaterial = new THREE.MeshPhongMaterial({ color:color, });
    _this.object3d.children[0].material  = new THREE.MeshPhongMaterial({ color:color, transparent: true, opacity : opacity/10  });
    _this.object3d.children[0].material.needsUpdate = true; 
  }; 
  UnitCellAtom.prototype.changeColor = function(color, forTime) { 
    var _this = this;
    this.color = color ;
    _this.object3d.children[0].material = new THREE.MeshBasicMaterial({ color: color  });
    _this.object3d.children[0].material.needsUpdate = true;
    setTimeout(function() { 
      _this.object3d.children[0].material = _this.colorMaterial;
      _this.object3d.children[0].material.needsUpdate = true; 
    }, 250);
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
  return UnitCellAtom;
});
