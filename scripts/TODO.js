 
onomata planes undefined

1 allagi legnths na allazei kai to relative
2. den kanei swst oretireve tis times relative  
 
 3. na dw ti paizei me grids faces.
 4. thelw gia to progres bar mia sunarthsh pou na to tleeiwnei ksafnika
5. fps drop in unit cell renderern motif renderer
  6. suggest merge in crystal because atoms do not move.
7. kleidwma geometriwn gia performance
8. share material by atom for better perf
 small todo : 
 /* allages se updateDirectionList kai na kaleitai mono auti kai selectDirection
    setPlaneEntryVisibility
    setDirectionEntryVisibility
    setAtomEntryVisibility 
{'action':true,'id':'eimai mpines'}
*/
 
gia kapoio logo planes/directions me dekadiko exoun themata sto idi

TODO list 
    
    6.  hex faces optimization 
    33. na svisw ola ta textures
    9.  change the recreate of hex and use transform function as others
    10. focal point na einai synced me to synced cameras
    16. miller objects recreate function can be optimized
    17. delete the restore function object after scene has restored to prevent memory usage 
    18. sync cameras when autoratating do not work great 
    19. check every global array for memory leaks
    20. available atoms list for rotating in drag mode shouldnt have the NewSphere atom in. 
    22. http://jsfiddle.net/kgxeuz24/7/ xyz label positions
    25. when change view, if you change tab and return in MT bug   
    33. ta materials na ginoun global (px wireframe)
    
List with Ideas

    1. Syncing with user dropbox to store a project there and reopen it later
    2. Public library of CW Projects - search by keywords, most popular etc
    3. Miller object use sliders for indexes
    4. all screens resizable 
    5. parameters for lighting (maybe this is too much)
    6. When applying new motif to crystal auto position camera far from crystal.
        
 
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

    function saveSTL(scene, name) {
        var exporter = new THREE.STLExporter();
        var stlString = exporter.parse(scene);

        var blob = new Blob([stlString], {
                type : 'text/plain'
            });

        saveAs(blob, name + '.stl');
    }
    var exporter = new THREE.STLExporter();
    var exportString = function (output, filename) {

        var blob = new Blob([output], {
                type : 'text/plain'
            });
        var objectURL = URL.createObjectURL(blob);

        var link = document.createElement('a');
        link.href = objectURL;
        link.download = filename || 'data.json';
        link.target = '_blank';
        link.click();

    };

});