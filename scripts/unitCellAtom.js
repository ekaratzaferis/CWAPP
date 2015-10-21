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

  function UnitCellAtom(position, radius, color, tangency, elementName, id, latticeIndex, opacity, renderingMode) { 
     
    var _this = this; 
    this.radius = radius;  
    this.material;
    this.latticeIndex = latticeIndex; 
    this.materials;
    this.tangency = tangency;  
    this.color = color; 
    this.opacity = opacity ; 
    this.myID = id; 
    this.elementName = elementName; 
    this.viewMode = 'Classic'; 
    this.userOffset = {"x":0, "y":0, "z":0};
    this.helperPos = {"x":0, "y":0, "z":0};  
    this.addMaterial(color, position, opacity, renderingMode) ;
       
  };
  THREE.ShaderTypes = { 
    'phongDiffuse' : {

        uniforms: {

            "uDirLightPos": { type: "v3", value: new THREE.Vector3() },
            "uDirLightColor": { type: "c", value: new THREE.Color( 0xffffff ) },

            "uMaterialColor":  { type: "c", value: new THREE.Color( 0xffffff ) },

            uKd: {
                type: "f",
                value: 0.7
            },
            uBorder: {
                type: "f",
                value: 0.4
            }
        },

        vertexShader: [

            "varying vec3 vNormal;",
            "varying vec3 vViewPosition;",

            "void main() {",

                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "vNormal = normalize( normalMatrix * normal );",
                "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                "vViewPosition = -mvPosition.xyz;",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform vec3 uMaterialColor;",

            "uniform vec3 uDirLightPos;",
            "uniform vec3 uDirLightColor;",

            "uniform float uKd;",
            "uniform float uBorder;",

            "varying vec3 vNormal;",
            "varying vec3 vViewPosition;",

            "void main() {",

                // compute direction to light
                "vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
                "vec3 lVector = normalize( lDirection.xyz );",

                // diffuse: N * L. Normal must be normalized, since it's interpolated.
                "vec3 normal = normalize( vNormal );",
                //was: "float diffuse = max( dot( normal, lVector ), 0.0);",
                // solution
                "float diffuse = dot( normal, lVector );",
                "if ( diffuse > 0.6 ) { diffuse = 1.0; }",
                "else if ( diffuse > -0.2 ) { diffuse = 0.7; }",
                "else { diffuse = 0.3; }",

                "gl_FragColor = vec4( uKd * uMaterialColor * uDirLightColor * diffuse, 1.0 );",

            "}"

        ].join("\n") 
    } 
  };
  function createShaderMaterial(id) {

      var shader = THREE.ShaderTypes[id];

      var u = THREE.UniformsUtils.clone(shader.uniforms);

      var vs = shader.vertexShader;
      var fs = shader.fragmentShader;

      var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

      material.uniforms.uDirLightPos.value = new THREE.Vector3(300, 300, 60);
      material.uniforms.uDirLightColor.value = new THREE.Color( 0xFFFFFF );
      
      return material;

  };
  UnitCellAtom.prototype.coonMode = function(){ 
 
    var phongMaterial = createShaderMaterial("phongDiffuse");
    phongMaterial.uniforms.uMaterialColor.value.copy(new THREE.Color( this.color )); 

    this.object3d.children[0].material = phongMaterial ;
    this.object3d.children[0].material.needsUpdate = true; 
  } 
  UnitCellAtom.prototype.addMaterial = function(color, position, opacity, renderingMode) {
    var _this = this ;
    var wireMat;

    if(renderingMode === 'wireframe') {
      wireMat = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color : color, wireframe: true, opacity:0}) ;
      this.colorMaterial = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, transparent:true, opacity:0 }) ; 
    }
    else if(renderingMode === 'realistic'){
      wireMat = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
      this.colorMaterial = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: color, transparent:true, opacity:opacity }) ; 
    }
    else if(renderingMode === 'flat'){
      wireMat = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
      this.colorMaterial = new THREE.MeshLambertMaterial({  color: color, transparent:true, opacity:opacity }) ; 
    }
    else if(renderingMode === 'toon'){ 
      var phongMaterial = createShaderMaterial("phongDiffuse");
      phongMaterial.uniforms.uMaterialColor.value.copy(new THREE.Color(color)); 

      wireMat = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
      this.colorMaterial = phongMaterial;
    }
      
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
  UnitCellAtom.prototype.setOpacity = function(opacity, renderingMode) { 
    
    this.opacity = opacity/10;
    
    if(renderingMode === 'wireframe'){
      return;
    }
    else if(renderingMode === 'flat'){
      this.flatMode();
    }
    else if(renderingMode === 'realistic'){
      this.realisticMode();
    } 
  };
  UnitCellAtom.prototype.flatMode = function(bool){
    
    this.object3d.children[0].material =  new THREE.MeshLambertMaterial( { color : this.color, transparent:true, opacity:this.opacity} );  
    this.object3d.children[0].material.needsUpdate = true;    
  };
  UnitCellAtom.prototype.realisticMode = function(bool){
    
    this.object3d.children[0].material =  new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color : this.color, transparent:true, opacity:this.opacity} );  
    this.object3d.children[0].material.needsUpdate = true;    
  };
  UnitCellAtom.prototype.wireframeMat = function(bool){
    this.wireframe = bool ;
    if(bool === true){ 
      this.object3d.children[0].material = new THREE.MeshBasicMaterial({transparent:true, opacity:0}) ;
      this.object3d.children[1].material = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100,color : this.color, wireframe: true, opacity:0}) ;
    }
    else{
      this.object3d.children[0].material = new THREE.MeshPhongMaterial({ specular: 0x050505, shininess : 100, color: this.color, transparent:true, opacity:this.opacity }) ;
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
    var pos = new THREE.Vector3(this.object3d.position.x, this.object3d.position.y, this.object3d.position.z  ); 
  
    var sphere = THREE.SceneUtils.createMultiMaterialObject( globGeometry, [ this.colorMaterial ]);
    sphere.scale.set(this.radius, this.radius, this.radius);

    sphere.children[0].receiveShadow = true; 
    sphere.children[0].castShadow = true; 
    this.object3d = sphere;
    this.object3d.position.x = this.helperPos.x ;
    this.object3d.position.y = this.helperPos.y ;
    this.object3d.position.z = this.helperPos.z ;
    UnitCellExplorer.add(this); 
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
  UnitCellAtom.prototype.setMaterial = function(color, renderingMode) {
    var _this = this;
    this.color = color;
 
    if(renderingMode === 'wireframe'){
      this.wireframeMat(true);
    }
    else if(renderingMode === 'flat'){
      this.flatMode();
    }
    else if(renderingMode === 'realistic'){
      this.realisticMode();
    } 

  }; 
  UnitCellAtom.prototype.changeColor = function(color, forTime, renderingMode) { 

    if(this.renderingMode === 'wireframe'){
      return;
    }
    var _this = this;
    this.color = color ;
    this.object3d.children[0].material = new THREE.MeshBasicMaterial({ color: color  });
    this.object3d.children[0].material.needsUpdate = true;
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
