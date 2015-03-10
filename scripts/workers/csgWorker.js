
importScripts('../../vendor/three.js');
importScripts('../../vendor/csg.js');
importScripts('../../vendor/ThreeCSG.js');

self.addEventListener('message', function(e) {  var a = performance.now();
    var objs = e.data, geometries = [], i = 0;
    var box = new THREE.Mesh( new THREE.BoxGeometry(objs[objs.length-1].dims.x, objs[objs.length-1].dims.y, objs[objs.length-1].dims.z  ), new THREE.MeshBasicMaterial()  );
    box.position.set(objs[objs.length-1].dims.x/2, objs[objs.length-1].dims.y/2, objs[objs.length-1].dims.z/2);
    var cube = THREE.CSG.toCSG(box);

    while(i < objs.length-1 ) { 
        
      var atomMesh = new THREE.Mesh( new THREE.SphereGeometry(objs[i].radius, 32, 32), new THREE.MeshBasicMaterial() );
      atomMesh.position.x = objs[i].pos.x ;
      atomMesh.position.y = objs[i].pos.y ;
      atomMesh.position.z = objs[i].pos.z ;
 
      var sphere = THREE.CSG.toCSG(atomMesh); 
      var geometry = sphere.intersect(cube);
      var geom = THREE.CSG.fromCSG(geometry);
      var finalGeom = assignUVs(geom);
      geometries[i] = finalGeom ;
      i++;
    }    var b = performance.now();

    console.log('It took ' + (b - a) + ' ms.');
    self.postMessage(geometries);
}, false);

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