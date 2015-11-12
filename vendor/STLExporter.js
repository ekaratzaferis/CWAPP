/**
 * Based on https://github.com/mrdoob/three.js/blob/a72347515fa34e892f7a9bfa66a34fdc0df55954/examples/js/exporters/STLExporter.js
 * Tested on r68 and r70
 * @author jcarletto / https://github.com/jcarletto27
 * @author kjlubick / https://github.com/kjlubick
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/
 *and edited by Thanos Saringelos
 */
define([
  'three',
  'jquery', 
  'underscore',
  'explorer',
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

	            var vector = new THREE.Vector3();
	            var normalMatrixWorld = new THREE.Matrix3();

	            return function ( scene ) {

	                var output = '';

	                output += 'solid exported\n';

	                scene.traverse( function ( object ) {

	                    if ( object instanceof THREE.Mesh ) {

	                        var geometry = object.geometry;
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

        var blob = new Blob([stlString], {
                type : 'text/plain'
            });

        saveAs(blob, name + '.stl');

    }  

    return STLExporter;
});