/**
 * Based on https://github.com/mrdoob/three.js/blob/a72347515fa34e892f7a9bfa66a34fdc0df55954/examples/js/exporters/STLExporter.js
 * Tested on r68 and r70
 * @author jcarletto / https://github.com/jcarletto27
 * @author kjlubick / https://github.com/kjlubick
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/
 * and edited by Thanos Saringelos
 */

define([
  'three',
  'jquery', 
  'underscore', 
  'explorer',
  'unitCellExplorer',
  'motifExplorer'
], function(
  THREE,
  jQuery, 
  _, 
  Explorer,
  UnitCellExplorer,
  MotifExplorer
  
) {  
	function STLExporter() {
	    THREE.STLExporter = function () {};
	      
	    THREE.STLExporter.prototype = {

	        constructor: THREE.STLExporter,

	        parse: ( function () {

              var atomUUIDs = {};

	            var vector = new THREE.Vector3();
	            var normalMatrixWorld = new THREE.Matrix3();

	            return function ( scene ) {

	                var output = '';

	                output += 'solid exported\n';

	                scene.traverse( function ( object ) { 

	                    if ( 
                            object instanceof THREE.ArrowHelper ||
                            (   
                                object instanceof THREE.Mesh && 
                                (
                                    object.visible === true &&
                                    (
                                        
                                        object.parent.name === 'subtractedAtom' || 
                                        object.name === 'grid' || 
                                        object.name === 'plane' || 
                                        object.name === 'point' || 
                                        object.name === 'direction' || 
                                        object.name === 'dirLine' || 
                                        object.name === 'crystalSolidVoid' ||  
                                        object.name === 'face'
                                    )  
                                ) 
                                ||
                                (   
                                    object.parent &&
                                    object.parent.visible === true && 
                                    atomUUIDs[object.parent.uuid] === undefined && 
                                    object.parent.name === 'atom' 
                                          
                                )
                            )
                        )
                        {

                          atomUUIDs[object.parent.uuid] = object.parent.uuid;

                          console.log(atomUUIDs);

                          var geometry;
                          
                          if(object.name === 'direction'){
                              geometry = new THREE.Geometry();

                              object.cone.updateMatrix();
                              geometry.merge( object.cone.geometry.clone(), object.cone.matrix ); 

                          }
	                        else{
                              object.updateMatrix();
                              geometry = object.geometry;
                          }
	                        var matrixWorld = object.matrixWorld;

	                        if ( geometry instanceof THREE.Geometry ) {

	                            var vertices = geometry.vertices;
	                            var faces = geometry.faces;

	                            normalMatrixWorld.getNormalMatrix( matrixWorld );

	                            for ( var i = 0, l = faces.length; i < l; i ++ ) {

	                                var face = faces[ i ];

	                                vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

	                                output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
	                                output += '\t\touter loop\n';

	                                var indices = [ face.a, face.b, face.c ];

	                                for ( var j = 0; j < 3; j ++ ) {

	                                    vector.copy( vertices[ indices[ j ] ] ).applyMatrix4( matrixWorld );

	                                    output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';

	                                }

	                                output += '\t\tendloop\n';
	                                output += '\tendfacet\n';

	                            }

	                        }

	                    }

	                } );

	                output += 'endsolid exported\n';

	                return output;

	            };

	        }() )

	    };
        
    }

    STLExporter.prototype.saveSTL = function(scene, name){

    	
    	var exporter = new THREE.STLExporter();
      var stlString = exporter.parse(scene);

      if(name === undefined){
        return stlString;
      }
      
      var blob = new Blob([stlString], {
          type : 'text/plain'
      });

      saveAs(blob, name + '.stl');

    }  

    return STLExporter;
});

var BinaryStlWriter = (function() {
  var that = {};

  var writeVector = function(dataview, offset, vector, isLittleEndian) {
    offset = writeFloat(dataview, offset, vector.x, isLittleEndian);
    offset = writeFloat(dataview, offset, vector.y, isLittleEndian);
    return writeFloat(dataview, offset, vector.z, isLittleEndian);
  };

  var writeFloat = function(dataview, offset, float, isLittleEndian) {
    dataview.setFloat32(offset, float, isLittleEndian);
    return offset + 4;
  };

  var geometryToDataView = function(geometry) {
    var tris = geometry.faces;
    var verts = geometry.vertices;
    
    var isLittleEndian = true; // STL files assume little endian, see wikipedia page
    
    var bufferSize = 84 + (50 * tris.length);
    var buffer = new ArrayBuffer(bufferSize);
    var dv = new DataView(buffer);
    var offset = 0;

    offset += 80; // Header is empty

    dv.setUint32(offset, tris.lengtb, isLittleEndian);
    offset += 4;

    for(var n = 0; n < tris.length; n++) {
      offset = writeVector(dv, offset, tris[n].normal, isLittleEndian);
      offset = writeVector(dv, offset, verts[tris[n].a], isLittleEndian);
      offset = writeVector(dv, offset, verts[tris[n].b], isLittleEndian);
      offset = writeVector(dv, offset, verts[tris[n].c], isLittleEndian);
      offset += 2; // unused 'attribute byte count' is a Uint16
    }

    return dv;
  };

  var save = function(geometry, filename) {
    var dv = geometryToDataView(geometry);
    var blob = new Blob([dv], {type: 'application/octet-binary'});
    
    // FileSaver.js defines `saveAs` for saving files out of the browser
    saveAs(blob, filename);
  };

  that.save = save;
  return that;
}());