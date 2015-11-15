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
  
) { var gg =0;
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
                        gg++;
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
                                    object.parent !== undefined &&
                                    object.parent.visible === true &&
                                    (
                                        
                                        object.parent.name === 'atom' 
                                         
                                    ) 
                                )
                            )
                        )
                        {

                            
                            var geometry;
                            console.log(object);
                            console.log(object.parent.centerOfMotif);
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
        console.log(gg);
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