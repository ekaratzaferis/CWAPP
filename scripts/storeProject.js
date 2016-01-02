"use strict";

define([
  "three", 
  "underscore",
  "jquery",
  "jszip"
], function(
  THREE, 
  _,
  jQuery,
  jszip
) {
    // Zipper //
   var zip = new jszip();
    
    // Constructor //
    function StoreProject(lattice, motifeditor, camera, cellCamera, motifXcam,motifYcam,motifZcam,crystalRenderer,stlExporter,menu) { 
        this.idle = false;
        this.lattice = lattice;
        this.motifeditor = motifeditor;
        this.cellCamera = cellCamera;
        this.motifXcam = motifXcam;
        this.motifYcam = motifYcam;
        this.motifZcam = motifZcam;
        this.camera = camera;
        this.crystalRenderer = crystalRenderer;
        this.stlExporter = stlExporter;
        this.menu = menu;
    };
    
    // Randomizer //
    function createRandomName() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    
    // Send JSON to Database - With Callback //
    function sendToDatabase(text,callback){
        
        var obj =  JSON.parse(text);  
        var str =  JSON.stringify(obj);
            
        // Send Request //
        var service = 'https://cwgl.herokuapp.com';
        var hash ='';

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
            callback(hash);
        });
    };
    
    // Update Library Tab
    function updateLibraryTab(slug){
        var link = 'cw.gl/#'+slug;
        // Update QR //
        jQuery('#QRImage').trigger('update',[link]);
        // Update Links //
        jQuery('#saveOnlineLink').val(link);
        jQuery('#saveOnlineLinkQR').val(link);
        jQuery('#info_modal').trigger('finish');
    };
    
    // Construct JSON File //
    StoreProject.prototype.constructJSONString = function (argument){
        var checkIteration = false;

        // Start with App Info //
        var jsonText = '{"info":{';
        jsonText = jsonText + '"name":"'+argument.name+'","description":"'+argument.description+'",';
        if(argument.tags.length > 0){
            jsonText = jsonText + '"tags":{';
            _.each(argument.tags,function($parameter,k){
                jsonText = jsonText + '"tag' + k + '":"' + $parameter + '",';
                checkIteration = true;
            });
            // Remove last comma //
            if (checkIteration === true){
                jsonText = jsonText.slice(0, -1);
                checkIteration = false;
            }
            jsonText = jsonText + '}},';
        }
        else {
            jsonText = jsonText.slice(0, -1);
            jsonText = jsonText + '},';
        }

        // App UI //
        jsonText = jsonText + '"appUI":{';
        
        // Menu Ribbon // 
        jsonText = jsonText + '"menuRibbon":{ "activeTab":"' + argument.app.activeTab + '", "disabledTabs":{';
        _.each(argument.app.tabDisable, function($parameter,k){ jsonText = jsonText + '"' + k + '":' + $parameter + ','; });
        jsonText = jsonText.slice(0, -1);
        jsonText = jsonText + '}, "toggleButtons":{';
        _.each(argument.app.toggleButtons, function($parameter,k){ jsonText = jsonText + '"' + k + '":' + $parameter + ','; });
        jsonText = jsonText.slice(0, -1);
        jsonText = jsonText + '}},'; // Close Toggle Buttons and Menu Ribbon //
        
        // Lattice Tab //
        jsonText = jsonText + '"latticeTab":{ "latticeSelecion": { "selectedLattice":"' + argument.app.selectedLattice + '", "selectedLatticeDisable":' + argument.app.selectedLatticeDisable + '},';
        jsonText = jsonText + '"latticeRepetition": { "repeatX":' + parseFloat(argument.app.repeatX) + ', "repeatY":' + parseFloat(argument.app.repeatY) + ', "repeatZ":' + parseFloat(argument.app.repeatZ) + '},';
        jsonText = jsonText + '"latticeLength": { "scaleX":' + parseFloat(argument.app.scaleX) + ', "scaleY":' + parseFloat(argument.app.scaleY) + ', "scaleZ":' + parseFloat(argument.app.scaleZ) + '},';
        jsonText = jsonText + '"latticeAngle": { "alpha":' + parseFloat(argument.app.alpha) + ', "beta":' + parseFloat(argument.app.beta) + ', "gamma":' + parseFloat(argument.app.gamma) + '},';
        jsonText = jsonText + '"padlocks": { "lattice": { "state":' + argument.app.latticePadlock + ', "disabled":' + argument.app.latticePadlockDisable + '}, "motif": { "state":' + argument.app.motifPadlock + ', "disabled":' + argument.app.motifPadlockDisable + '}},';
        jsonText = jsonText + '"cellVisualization": { "cellEdge": { "color":"' + argument.app.borderColor + '", "radius":' + parseFloat(argument.app.radius) + '}, "cellFace": { "color":"' + argument.app.filledColor + '", "opacity":' + parseFloat(argument.app.opacity) + '}}},';
        
        // Motif Tab //
        jsonText = jsonText + '"motifTab": { "lockCameras":' + argument.app.lockCameras + ', "tangency":' + argument.app.tangency + ', "cellVolume":' + parseFloat(argument.app.cellVolume) + ',';
        jsonText = jsonText + '"motifLabels": { "a":"' + argument.app.motifLabels.a + '", "b":"' + argument.app.motifLabels.b + '", "c":"' + argument.app.motifLabels.c + '", "alpha":"' + argument.app.motifLabels.alpha + '", "beta":"' + argument.app.motifLabels.beta + '", "gamma":"' + argument.app.motifLabels.gamma + '"}},';
        
        // Visual Tab //
        jsonText = jsonText + '"visualTab": { "visualParameters": { "renderizationMode": { "wireframe":' + argument.app.wireframe + ', "toon":' + argument.app.toon + ', "flat":' + argument.app.flat + ', "realistic":' + argument.app.realistic + '},';
        jsonText = jsonText + '"lights" : { "lights":' + argument.app.lights + ', "ssao":' + argument.app.ssao + ', "shadows":' + argument.app.shadows + '},';
        jsonText = jsonText + '"visualizationMode" : { "distortionOn":' + argument.app.distortionOn + ', "distortionOff":' + argument.app.distortionOff + '},';
        jsonText = jsonText + '"stereoscopicEffect" : { "anaglyph":' + argument.app.anaglyph + ', "oculus":' + argument.app.oculus + ', "sideBySide3D":' + argument.app.sideBySide3D + ', "OnTop3D":' + argument.app.onTop3D + '},';
        jsonText = jsonText + '"focalPoint" : { "crystalCamTargetOn":' + argument.app.crystalCamTargetOn + ', "crystalCamTargetOff":' + argument.app.crystalCamTargetOff + '},';
        jsonText = jsonText + '"fullScreen":' + argument.app.fullScreen + ', "leapMotion":' + argument.app.leapMotion + ',';
        jsonText = jsonText + '"crystalModelRepresentation":{ "crystalClassic":' + argument.app.crystalClassic + ', "crystalSubstracted":' + argument.app.crystalSubstracted + ', "crystalSolidVoid":' + argument.app.crystalSolidVoid + ', "crystalGradeLimited":' + argument.app.crystalGradeLimited + '},';
        jsonText = jsonText + '"unitCellModelRepresentation":{ "cellClassic":' + argument.app.cellClassic + ', "cellSubstracted":' + argument.app.cellSubstracted + ',"cellSolidVoid":' + argument.app.cellSolidVoid + ', "cellGradeLimited":' + argument.app.cellGradeLimited + '}},';
        jsonText = jsonText + '"visualTools": { "menuZoom": { "autoZoom":' + argument.app.autoZoom + ', "zoom70":' + argument.app.zoom70 + ', "zoom80":' + argument.app.zoom80 + ', "zoom90":' + argument.app.zoom90 + ', "zoom100":' + argument.app.zoom100 + '},';
        jsonText = jsonText + '"fog": { "state":' + argument.app.fog + ', "color":"' + argument.app.fogColor + '", "density":' + parseFloat(argument.app.fogDensity) + '},';
        jsonText = jsonText + '"sound": { "state":' + argument.app.sounds + ', "volume":' + parseFloat(argument.app.soundVolume) + '},';
        jsonText = jsonText + '"colorization": { "crystalScreenColor":"' + argument.app.crystalScreenColor + '", "cellScreenColor":"' + argument.app.cellScreenColor + '", "motifXScreenColor":"' + argument.app.motifXScreenColor + '", "motifYScreenColor":"' + argument.app.motifYScreenColor + '", "motifZScreenColor":"' + argument.app.motifZScreenColor + '"}}}';
        
        jsonText = jsonText + '},'; // Close App UI //
        
        // Notes //
        jsonText = jsonText + '"notes":{';
        _.each(argument.notes, function($parameter,k){
            checkIteration = true;
            if (k === 'activeEntry') jsonText = jsonText + '"activeEntry":false,';
            else {
                jsonText = jsonText + '"' + k + '":{'
                jsonText = jsonText + '"title":"' + $parameter.title + '",';
                jsonText = jsonText + '"body":"' + $parameter.body + '",';
                jsonText = jsonText + '"color":"' + $parameter.color + '",';
                jsonText = jsonText + '"opacity":"' + $parameter.opacity + '",';
                jsonText = jsonText + '"atomNote":"' + $parameter.atomNote + '",';
                jsonText = jsonText + '"x":"' + $parameter.x + '",';
                jsonText = jsonText + '"y":"' + $parameter.y + '"},';
            }
        });
        // Remove last comma //
        if (checkIteration === true){
            jsonText = jsonText.slice(0, -1);
            checkIteration = false;
        }
        jsonText = jsonText + '},'; // Close Notes //

        // System //
        jsonText = jsonText + '"system": '+ this.getSystemState() +' ';

        jsonText = jsonText + '}'; // Close Object //
        return jsonText;
    };
    StoreProject.prototype.downLoadfile = function(argument){
        // json = application/json
        // text = application/text        
        if (argument.extention === 'json'){
            var blob = new Blob([JSON.stringify(JSON.parse(argument.data),null,2)], {type: argument.type});
            saveAs(blob, argument.name + '.' + argument.extention);
        }
        else if (argument.extention === 'png'){
            // Caprture Snapshot //
            this.crystalRenderer.renderer.clear();
            this.crystalRenderer.renderer.render( this.crystalRenderer.explorer.object3d, this.crystalRenderer.cameras[0] );
            var imgURL = document.getElementsByTagName("canvas")[1].toDataURL();

            // Create Download Link //
            var dlLink = document.createElement('a');
            dlLink.download = argument.name + '.' + argument.extention;
            dlLink.href = imgURL;
            dlLink.dataset.downloadurl = [argument.type, dlLink.download, dlLink.href].join(':');

            // Trigger and Dispose Link //
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
        }
        else if (argument.extention === 'zip'){
            
            // Gather Info //
            var content = null;
            var settings = JSON.stringify(JSON.parse(this.constructJSONString(argument.details)),null,2);
            this.crystalRenderer.renderer.clear();
            this.crystalRenderer.renderer.render( this.crystalRenderer.explorer.object3d, this.crystalRenderer.cameras[0] );
            var imgURL = document.getElementsByTagName("canvas")[1].toDataURL();
            var stl = this.stlExporter.saveSTL(this.crystalRenderer.explorer.object3d);
            
            // Zip File //
            zip.file('CrystalWalk/settings.json',settings);
            zip.file('CrystalWalk/snapShot.png',imgURL);
            zip.file('CrystalWalk/object.stl',stl);
            content = zip.generate();
            
            // Create Download Link //
            var dlLink = document.createElement('a');
            dlLink.download = argument.name + '.' + argument.extention;
            dlLink.href = "data:application/zip;base64,"+content;
            dlLink.dataset.downloadurl = [argument.type, dlLink.download, dlLink.href].join(':');

            // Trigger and Dispose Link //
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
        }
    };
    StoreProject.prototype.downloadProject = function(argument){
        this.downLoadfile({
            extention: 'zip',
            name: 'cw_bandle',
            details: argument,
            crystalRenderer: this.crystalRenderer
        });
    };
    StoreProject.prototype.saveOnline = function(argument){
        var json = this.constructJSONString(argument);
        sendToDatabase(json,updateLibraryTab);
    };
    StoreProject.prototype.exportJSON = function(argument){ 
        // Force User Download //
        this.downLoadfile({
            data: this.constructJSONString(argument),
            type: 'application/json;charset=utf-8;',
            extention: 'json',
            name: 'cwSettings_: ' + argument.name
        });
    };
    StoreProject.prototype.exportPNG = function(argument){ 
        // Force User Download //
        this.downLoadfile({
            type: 'image/png',
            extention: 'png',
            name: 'cwSnapshot',
            crystalRenderer: this.crystalRenderer
        });
    };  
    StoreProject.prototype.getLatticeState = function() {
        var latticeParams;

        if(this.lattice.lattice){ 
            var restrictions = JSON.stringify(this.lattice.lattice.restrictions);
            var gridPoints =  JSON.stringify(this.lattice.lattice.gridPoints);
            var originArray = JSON.stringify(this.lattice.lattice.originArray);

            latticeParams = 
                '{"latticeParams": { "type": "object", "lattice" : {"defaults" : {  "scaleX":'+this.lattice.parameters.scaleX+',  "scaleY":'+this.lattice.parameters.scaleY+', "scaleZ":'+this.lattice.parameters.scaleZ+',"alpha":'+this.lattice.parameters.alpha+', "beta":'+this.lattice.parameters.beta+', "gamma":'+this.lattice.parameters.gamma+' }, "latticeType":"'+this.lattice.lattice.latticeType+'", "latticeSystem":"'+this.lattice.lattice.latticeSystem+'",  "vector" : { "x" : '+this.lattice.lattice.vector.x+', "y" :'+this.lattice.lattice.vector.y+', "z" : '+this.lattice.lattice.vector.z+'}, "restrictions" :  '+restrictions+', "gridPoints" :  '+gridPoints+',"originArray" :  '+originArray+' }, "repeatX":'+this.lattice.parameters.repeatX+', "repeatY":'+this.lattice.parameters.repeatY+', "repeatZ":'+this.lattice.parameters.repeatZ+',  "viewState": "todo"  },  ';
        }
        else{
            latticeParams = '{"latticeParams": { "type": "object" ,"lattice" : '+null+', "repeatX":'+this.lattice.parameters.repeatX+', "repeatY":'+this.lattice.parameters.repeatY+', "repeatZ":'+this.lattice.parameters.repeatZ+',  "viewState": "todo"  },  ';
        }

        return latticeParams;
    };
    StoreProject.prototype.getCamerasStates = function() {
        var cameraSettings  = '"cameraSettings" :{ "crystalCamera" :{  "position" : { "x" : '+this.camera.position.x+', "y" :'+this.camera.position.y+', "z" : '+this.camera.position.z+'}},"cellCamera" :{   "position" : { "x" : '+this.cellCamera.position.x+', "y" :'+this.cellCamera.position.y+', "z" : '+this.cellCamera.position.z+'}},  "motifCameras" :{  "xCam" :{"position" : { "x" : '+this.motifXcam.position.x+', "y" :'+this.motifXcam.position.y+', "z" : '+this.motifXcam.position.z+'}},"yCam" :{"position" : { "x" : '+this.motifYcam.position.x+', "y" :'+this.motifYcam.position.y+', "z" : '+this.motifYcam.position.z+'}},"zCam" :{"position" : { "x" : '+this.motifZcam.position.x+', "y" :'+this.motifZcam.position.y+', "z" : '+this.motifZcam.position.z+'} } } }';

        return cameraSettings;
    };
    StoreProject.prototype.getSystemState = function() {
        var _this = this ;
        if(!this.idle){   
  
            var start =  " "  ;
 
            var cellVisualization = '"cellVisualization" :{ "edges" : { "visible":'+this.lattice.gradeChoice.grid+', "radius":'+this.lattice.gradeParameters.radius+', "color":"'+this.lattice.gradeParameters.cylinderColor+'"}, "faces": { "visible": '+this.lattice.gradeChoice.face +', "opacity": '+this.lattice.gradeParameters.faceOpacity +', "color": "'+this.lattice.gradeParameters.faceColor +'"} },';
       
            var end = "}" ;

            var text =  start+
                this.getLatticeState()+
                cellVisualization+
                this.getMillerState()+
                this.getMotifState()+ 
                this.getUnitCellState()+
                this.getCamerasStates()+ 
                this.createJsonVisualizationParams()+ 
                end ;

            return (text); 

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
    StoreProject.prototype.getUnitCellState = function(){
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
    StoreProject.prototype.getMotifState = function(){

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
    StoreProject.prototype.getMillerState = function(){

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
