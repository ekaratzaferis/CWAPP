"use strict";

define([
  "three", 
  "underscore",
  "jquery"
], function(
  THREE, 
  _,
  jQuery
) {

    // Constructor //
    function StoreProject(lattice, motifeditor, camera, cellCamera, motifXcam,motifYcam,motifZcam,crystalRenderer) { 
        this.idle = false;
        this.lattice = lattice;
        this.motifeditor = motifeditor;
        this.cellCamera = cellCamera;
        this.motifXcam = motifXcam;
        this.motifYcam = motifYcam;
        this.motifZcam = motifZcam;
        this.camera = camera;
        this.crystalRenderer = crystalRenderer;
    };
    function createRandomName() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }; 
    StoreProject.prototype.downloadProject = function(argument){
        console.log(argument);  
    };
    StoreProject.prototype.saveOnline = function(argument){
        console.log(argument);  
    };
    StoreProject.prototype.exportJSON = function(argument){
        console.log(argument);  
    }; 
    StoreProject.prototype.createJSONfile = function() {
        var _this = this ;
        if(!this.idle){   

            $("body").css("cursor", "wait");
            var overlay = $('<div></div>').prependTo('body').attr('id', 'overlay');

            var centeredAtAxis = ($('#crystalCamTarget').is(':checked')) ? true : false ;
            var synced = ($('#syncCameras').is(':checked')) ? true : false ;
            var enableDistortion = ($('#distortion').is(':checked')) ? true : false ;

            var xyzAxes = ($('#xyzAxes').is(':checked')) ? true : false ;
            var abcAxes = ($('#abcAxes').is(':checked')) ? true : false ;
            var start =  " "  ;

            var latticeParams;

            if(this.lattice.lattice){ 
                var restrictions = JSON.stringify(this.lattice.lattice.restrictions);
                var gridPoints =  JSON.stringify(this.lattice.lattice.gridPoints);
                var originArray = JSON.stringify(this.lattice.lattice.originArray);

                latticeParams = 
                    '{"latticeParams": { "type": "object",  "bravaisLattice" : "'+($('#bravaisLattice').val())+'"  ,"lattice" : {"defaults" : {  "scaleX":'+this.lattice.parameters.scaleX+',  "scaleY":'+this.lattice.parameters.scaleY+', "scaleZ":'+this.lattice.parameters.scaleZ+',"alpha":'+this.lattice.parameters.alpha+', "beta":'+this.lattice.parameters.beta+', "gamma":'+this.lattice.parameters.gamma+' }, "latticeType":"'+this.lattice.lattice.latticeType+'", "latticeSystem":"'+this.lattice.lattice.latticeSystem+'",  "vector" : { "x" : '+this.lattice.lattice.vector.x+', "y" :'+this.lattice.lattice.vector.y+', "z" : '+this.lattice.lattice.vector.z+'}, "restrictions" :  '+restrictions+', "gridPoints" :  '+gridPoints+',"originArray" :  '+originArray+' }, "repeatX":'+this.lattice.parameters.repeatX+', "repeatY":'+this.lattice.parameters.repeatY+', "repeatZ":'+this.lattice.parameters.repeatZ+',  "viewState": "todo"  },  ';
            }
            else{
                latticeParams = '{"latticeParams": { "type": "object",  "bravaisLattice" : "'+($('#bravaisLattice').val())+'"  ,"lattice" : '+null+', "repeatX":'+this.lattice.parameters.repeatX+', "repeatY":'+this.lattice.parameters.repeatY+', "repeatZ":'+this.lattice.parameters.repeatZ+',  "viewState": "todo"  },  ';
            }

            var cellVisualization = '"cellVisualization" :{ "edges" : { "visible":'+this.lattice.gradeChoice.grid+', "radius":'+this.lattice.gradeParameters.radius+', "color":"'+this.lattice.gradeParameters.cylinderColor+'"}, "faces": { "visible": '+this.lattice.gradeChoice.face +', "opacity": '+this.lattice.gradeParameters.faceOpacity +', "color": "'+this.lattice.gradeParameters.faceColor +'"} },';

            var millerObjects = this.createJsonMillerObjects();

            var motif = this.createJsonMotif();

            var notes = '"notes" : "'+($("#mynotes").val())+'" , ';

            var cameraSettings  = '"cameraSettings" :{ "crystalCamera" :{  "centeredAtAxis" : '+centeredAtAxis+', "synced":'+synced+', "enableDistortion":'+enableDistortion+', "position" : { "x" : '+this.camera.position.x+', "y" :'+this.camera.position.y+', "z" : '+this.camera.position.z+'}},"cellCamera" :{   "position" : { "x" : '+this.cellCamera.position.x+', "y" :'+this.cellCamera.position.y+', "z" : '+this.cellCamera.position.z+'}},  "motifCameras" :{  "xCam" :{"position" : { "x" : '+this.motifXcam.position.x+', "y" :'+this.motifXcam.position.y+', "z" : '+this.motifXcam.position.z+'}},"yCam" :{"position" : { "x" : '+this.motifYcam.position.x+', "y" :'+this.motifYcam.position.y+', "z" : '+this.motifYcam.position.z+'}},"zCam" :{"position" : { "x" : '+this.motifZcam.position.x+', "y" :'+this.motifZcam.position.y+', "z" : '+this.motifZcam.position.z+'} } } },';


            var unitCell = this.createJsonUnitCell() ;

            var axisSelection = '"axisSelection" :{ "xyzVisible" : '+xyzAxes+', "abcVisible":'+abcAxes+' }';
            var prName = ( ($('#projectName').val()).length === 0) ? (createRandomName()) : ($('#projectName').val()) ; 
            var projectName = ', "projectName" : "'+prName+'"';
            var tags = this.createJsonTags();  
            var visualizationParams = this.createJsonVisualizationParams();

            // thumbnail
            this.crystalRenderer.renderer.clear();
            this.crystalRenderer.renderer.render( this.crystalRenderer.scene, this.crystalRenderer.cameras[0] );

            var base64thumbnail = document.getElementsByTagName("canvas")[0].toDataURL("image/png", 1.0);

            var thumbnail = ', "thumbnailBase64" : "'+base64thumbnail+'" ';

            var sounds = ', "sounds" : '+($('#anaglyph').is(':checked'));   

            var end = "}" ;

            var text =  start+
                latticeParams+
                cellVisualization+
                millerObjects+
                motif+
                notes+
                unitCell+
                cameraSettings+
                axisSelection+
                projectName+
                tags+
                visualizationParams+
                thumbnail+
                sounds+
                end ;

            console.log(text);

            var obj =  JSON.parse(text) ;  
            var str =  JSON.stringify(obj)

            // send request

            var hash = window.location.hash;
            var service = 'https://cwgl.herokuapp.com';
            var shortener = window.location.href;
            var hash ='' ;

            var data = {
                url: document.location.origin,
                data: str
            };

            $.ajax(service + '/add', {
                method: 'POST',
                data: data,
                beforeSend: function(xmlHttpRequest) {
                    xmlHttpRequest.withCredentials = true;
                }
            })
            .done(function(res) {  
                hash = res.slug;  

                var blob = new Blob([str], {type: "application/json"});
                var url  = URL.createObjectURL(blob);

                var a = document.createElement('a');  
                a.download    = "save.json";
                a.href        = url;
                a.textContent = "save.json";

                var input = document.createElement("input");
                input.type = "text";
                input.className = " ";  
                input.value = shortener + hash;   

                document.getElementById('downloadJSON').appendChild(a);
                $("#downloadJSON").append('  Your url : ');
                document.getElementById('downloadJSON').appendChild(input);
                overlay.remove();
                $("body").css("cursor", "default");

            });

        } 
    }; 
    StoreProject.prototype.createJsonVisualizationParams = function() {
        var text =[];
        var fog = ($('#fog').is(':checked')) ? true : false ;
        var anaglyph = ($('#anaglyph').is(':checked')) ? true : false ;
        var lights = ($('#lights').is(':checked')) ? true : false ;

        text.push(',"visualizationParams": { "anaglyph": '+anaglyph+', "fog" : ' +fog+', "fogColor" : "'+($( "#fogColor" ).val())+'", "fogDensity" : "'+($( "#fogDensity" ).val())+'" , "crystalScreenColor" : "'+($( "#crystalScreenColor" ).val())+'", "cellScreenColor" : "'+($( "#cellScreenColor" ).val())+'", "motifXScreenColor" : "'+($( "#motifXScreenColor" ).val())+'", "motifYScreenColor" : "'+($( "#motifYScreenColor" ).val())+'", "motifZScreenColor" : "'+($( "#motifZScreenColor" ).val())+'", "lights" : '+lights+' }');

        return text ;
    };
    StoreProject.prototype.createJsonTags = function(){
        var tags = $('#tags').val(), text =[];
        var tagsSplit =  tags.split(',');

        text.push(',"tags": [');

        for (var i = 0; i < tagsSplit.length ; i++) {  
            if(tagsSplit[i].length>0){  
                if(i>0) text.push(',');
                text.push( '"'+tagsSplit[i]+'"' );
            }
        }; 
        text.push(']');
        return (text.join('')); 
    };
    StoreProject.prototype.createJsonUnitCell = function(){
        var _this = this ;

        var lastSpAd = (this.motifeditor.lastSphereAdded === undefined) ? undefined : this.motifeditor.lastSphereAdded.getID();
        var tangentTothis = (this.motifeditor.tangentToThis === undefined) ? 'undefined' : this.motifeditor.tangentToThis.id;
        var start = '"unitCell" :{ "padlock" : '+this.motifeditor.padlock+', "viewState":"'+this.motifeditor.viewState+'" , "dragMode" : '+this.motifeditor.dragMode+',"editorState" : "'+this.motifeditor.editorState.state+'", "dimensions" : { "x" : '+this.motifeditor.cellParameters.scaleX+', "y" :'+this.motifeditor.cellParameters.scaleY+', "z" : '+this.motifeditor.cellParameters.scaleZ+'}, "lastSphereAdded" : "'+lastSpAd+'", "tangentToThis" : "'+tangentTothis+'", "tangency" : '+this.motifeditor.globalTangency+', "leastCellLengths" : { "x" : '+this.motifeditor.leastCellLengths.x+', "y" :'+this.motifeditor.leastCellLengths.y+', "z" : '+this.motifeditor.leastCellLengths.z+' }, "newSphere": {';

        var newSphere = [];
        /*
        if(this.motifeditor.newSphere !== undefined){  
            newSphere.push('"visible" : ');
            newSphere.push(this.motifeditor.newSphere.visible );

            newSphere.push(',');

            newSphere.push('"manualSetCellDims" : ');
            newSphere.push(this.motifeditor.manualAabc );

            newSphere.push(','); 

            newSphere.push('"id" : "');

            newSphere.push(this.motifeditor.newSphere.myID );

            newSphere.push('",');

            newSphere.push('"radius" : ');
            newSphere.push(this.motifeditor.newSphere.radius );

            newSphere.push(',');

            newSphere.push('"elementName" : "');
            newSphere.push(this.motifeditor.newSphere.elementName );

            newSphere.push('",');

            newSphere.push('"color" : "');
            newSphere.push(this.motifeditor.newSphere.color );

            newSphere.push('",');

            newSphere.push('"blinking" : "');
            newSphere.push(this.motifeditor.newSphere.blinkingMode );

            newSphere.push('",');

            newSphere.push('"position" : { "x" : '+this.motifeditor.newSphere.object3d.position.x+', "y" :'+this.motifeditor.newSphere.object3d.position.y+', "z" : '+this.motifeditor.newSphere.object3d.position.z+'}'  );

            newSphere.push(',');

            newSphere.push('"opacity" : ');
            newSphere.push(this.motifeditor.newSphere.radius );

            newSphere.push(','); 

            newSphere.push('"texture" : "');
            newSphere.push(this.motifeditor.newSphere.texture );

            newSphere.push('",');

            newSphere.push('"wireframe" : ' );
            newSphere.push(this.motifeditor.newSphere.wireframe );
        }*/

        newSphere.push(' }, "positions" : [  ');

        var i = 0 , positions = [];

        _.each(this.motifeditor.unitCellPositions, function(p, r ) {
            if(i>0)  {
                positions.push(', ') ; 
            }
            i++;

            positions.push(' { "x" : '+p.position.x+', "y" :'+p.position.y+', "z" : '+p.position.z+', "reference": "'+r+'"}'  );
        }); 

        var end = ']},'
        return (start+newSphere.join('')+positions.join('')+end) ;

    };
    StoreProject.prototype.createJsonMotif = function(){

        var _this = this ;

        var start = '"motif": [' ;
        var motif = [] ;
        var counter = 0; 

        for (var i = 0 ; i < _this.motifeditor.motifsAtoms.length ; i++) {
            var atom = this.motifeditor.motifsAtoms[i] ;

            if(i>0)  motif.push(', ') ; 

            motif.push('{"visible" : ');
            motif.push(atom.visible );

            motif.push(',');

            motif.push('"id" : "');
            motif.push(atom.myID );

            motif.push('",');

            motif.push('"radius" : ');
            motif.push(atom.radius );

            motif.push(',');

            motif.push('"elementName" : "');
            motif.push(atom.elementName );

            motif.push('",');

            motif.push('"color" : "');
            motif.push(atom.color );

            motif.push('",');

            motif.push('"blinking" : "');
            motif.push(atom.blinkingMode );

            motif.push('",');

            motif.push('"position" : { "x" : '+atom.object3d.position.x+', "y" :'+atom.object3d.position.y+', "z" : '+atom.object3d.position.z+'}'  );

            motif.push(',');

            motif.push('"opacity" : ');
            motif.push(atom.opacity/10);

            motif.push(','); 

            motif.push('"texture" : "');
            motif.push(atom.texture );

            motif.push('",');

            motif.push('"wireframe" : ' );
            motif.push(atom.wireframe );

            motif.push('} ');

        };

        motif.push('],');

        return (start+motif.join('')) ;
    };
    StoreProject.prototype.createJsonMillerObjects = function(){

        var _this = this ;

        var start = '"millerObjects": { "directions":[' ;
        var directions = [], planes = [] ;
        var counter = 0;
        var directionsUnique = _.uniq(_this.lattice.millerDirections, function(d) { return d.id; }); 

        _.each(directionsUnique, function(directional ) {
            if(counter>0) directions.push(', ');
            counter++;

            directions.push('{"visible" : ');
            directions.push(directional.visible );

            directions.push(',');

            directions.push('"id" : "');

            directions.push(directional.id );

            directions.push('",');

            directions.push('"startPoint" : { "x" : '+directional.startPoint.x+', "y" :'+directional.startPoint.y+', "z" : '+directional.startPoint.z+'},'  );

            directions.push('"endPoint" : { "x" : '+directional.endpointPoint.x+', "y" :'+directional.endpointPoint.y+', "z" : '+directional.endpointPoint.z+'}'  );

            directions.push(',');

            directions.push('"name" : "');
            directions.push(directional.name );

            directions.push('",');

            directions.push('"color" : "');
            directions.push(directional.directionColor );

            directions.push('",');

            directions.push('"u" : ');
            directions.push(directional.u );

            directions.push(',');

            directions.push('"v" : ');
            directions.push(directional.v );

            directions.push(',');

            directions.push('"w" : ');
            directions.push(directional.w );

            directions.push('} ');

        });

        directions.push('], "planes":[ ');

        counter = 0;

        var planesIDs = [];
        var planesUnique = _.uniq(_this.lattice.millerPlanes, function(p) { return p.id; });

        _.each(planesUnique, function(plane ) {
            if(counter>0) planes.push(', ') ;
            counter++;
            planes.push('{"visible" : ');
            planes.push(plane.visible );

            planes.push(',');

            planes.push('"id" : "');
            planes.push(plane.id );

            planes.push('",');

            planes.push('"a" : { "x" : '+plane.a.x+', "y" :'+plane.a.y+', "z" : '+plane.a.z+'},'  );

            planes.push('"b" : { "x" : '+plane.b.x+', "y" :'+plane.b.y+', "z" : '+plane.b.z+'},'  );

            planes.push('"c" : { "x" : '+plane.c.x+', "y" :'+plane.c.y+', "z" : '+plane.c.z+'},'  );

            if(plane.d !== undefined) {  
                planes.push('"d" : { "x" : '+plane.d.x+', "y" :'+plane.d.y+', "z" : '+plane.d.z+'},'  ); 
            } 

            planes.push('"name" : "');
            planes.push(plane.planeName );

            planes.push('",');

            planes.push('"color" : "');
            planes.push(plane.planeColor );

            planes.push('",');

            planes.push('"opacity" : ');
            planes.push(plane.planeOpacity );

            planes.push(',');

            planes.push('"h" : ');
            planes.push(plane.h );

            planes.push(',');

            planes.push('"k" : ');
            planes.push(plane.k );

            planes.push(',');

            planes.push('"l" : ');
            planes.push(plane.l );

            planes.push('} ');

        });

        planes.push(']},');

        return (start+directions.join('')+planes.join('')) ;
    };
    return StoreProject;
});
