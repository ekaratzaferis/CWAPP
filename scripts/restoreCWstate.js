/*global define*/
'use strict';

define([
  'jquery',
  'jquery-ui',
  'pubsub',
  'underscore',  
  'millervector',
  'millerplane' 
], function(
  jQuery,
  jQuery_ui,
  PubSub,
  _,
  MillerVector,
  MillerPlane 
) {
 
  function RestoreCWstate( menu, lattice, motifEditor, orbitCrystal , orbitUnitCell, motifXcam,motifYcam,motifZcam, crystalRenderer, unitCellRenderer,crystalScene,hudCube, hudArrows )  {  
    this.menu = menu ;
    this.lattice = lattice ;
    this.motifEditor = motifEditor ;
    this.orbitCrystal = orbitCrystal ;
    this.orbitUnitCell = orbitUnitCell ;
    this.motifXcam = motifXcam ;
    this.motifYcam = motifYcam ;
    this.motifZcam = motifZcam ;
    this.crystalRenderer = crystalRenderer ;
    this.unitCellRenderer = unitCellRenderer ;
    this.crystalScene = crystalScene ;
    this.hudCube = hudCube ;
    this.hudArrows = hudArrows ;
    this.cwObj; 
  }; 
  RestoreCWstate.prototype.configureState = function(cwObj) { 
 
    $("body").css("cursor", "wait");
    var overlay = $('<div></div>').prependTo('body').attr('id', 'overlay');

    this.cwObj = cwObj ;  
    this.configureCameras();
    this.configureAxisSelection();
    this.configureTextArea();
    this.configureGradeParams();
    this.configureLatticeParams();
    this.configureCellVisualization();
    this.configureMillerObjects();
 
    // AFTER ADDING EVERYTHING

    if(this.cwObj.latticeParams.lattice){
      _.each(this.lattice.actualAtoms, function(atom,k) {  atom.destroy(); });
      this.lattice.actualAtoms.splice(0);   
      this.lattice.updatePoints();  
      this.lattice.createGrid();  
      this.lattice.createFaces();
      this.lattice.setGradeParameters();
      this.lattice.forwardTransformations();  // todo may be useless
      this.lattice.reCreateMillers();
      this.lattice.recreateMotif();
      this.lattice.setGradeChoices( {'faceCheckButton': this.cwObj.cellVisualization.faces.visible} );
      this.lattice.setGradeChoices( {'gridCheckButton': this.cwObj.cellVisualization.edges.visible} );
      this.lattice.setGradeParameters();
    }
     
    overlay.remove();
    $("body").css("cursor", "default");

  }; 
  RestoreCWstate.prototype.configureMillerObjects = function() {
    var dirs = this.cwObj.millerObjects.directions;
    var planes = this.cwObj.millerObjects.planes; 
    
    for (var i = 0; i < this.lattice.millerDirections.length; i++) {
      this.lattice.millerDirections[i].direction.destroy();
    } 
    this.lattice.millerDirections.splice(0);

    for (var i = 0; i < this.lattice.millerPlanes.length; i++) {
      this.lattice.millerPlanes[i].plane.destroy();
    } 
    this.lattice.millerPlanes.splice(0);

    this.lattice.planeList.splice(0);
    this.lattice.directionalList.splice(0);

    $('#planes option').remove();
    $('#vectors option').remove();  
    $('#vectors').append("<option  >---</option>") ;
    $('#planes').append("<option  >---</option>") ;

    for (var i = dirs.length - 1; i >= 0; i--) {
      
      this.lattice.millerDirections[i] = {
        visible: dirs[i].visible,
        direction : undefined,
        startPoint : new THREE.Vector3( dirs[i].startPoint.x, dirs[i].startPoint.y, dirs[i].startPoint.z ) , 
        endpointPoint : new THREE.Vector3( dirs[i].endPoint.x, dirs[i].endPoint.y, dirs[i].endPoint.z ),
        id : dirs[i].id,
        u : dirs[i].u,
        v : dirs[i].v,
        w : dirs[i].w,
        directionColor : dirs[i].color,
        name : dirs[i].name
      };
      this.lattice.forwardTransformationsMiller(this.lattice.millerDirections[i]); 
       
      this.lattice.millerDirections[i].direction  = new MillerVector(new THREE.Vector3( dirs[i].startPoint.x, dirs[i].startPoint.y, dirs[i].startPoint.z ), new THREE.Vector3( dirs[i].endPoint.x, dirs[i].endPoint.y, dirs[i].endPoint.z )  , dirs[i].color) ;
      
      var text = "Vector : "+dirs[i].name+"  ["+dirs[i].u+","+dirs[i].v+","+dirs[i].w+"] ";
      var id = "_"+dirs[i].u+""+dirs[i].v+""+dirs[i].w+"";
      var option = "<option id="+id+" value="+id+">"+text+"</option>" ;
      $('#vectors').append(option) ;

      this.lattice.planeList.push({ id : id }); //selectPlane

    }

    for (var i = planes.length - 1; i >= 0; i--) {
      
      var x =  new MillerPlane(planes[i].a, planes[i].b, planes[i].c, undefined, planes[i].opacity , planes[i].color ); 
      this.lattice.millerPlanes[i] = {
        visible: planes[i].visible,
        plane : x, 
        a : planes[i].a, 
        b : planes[i].b, 
        c : planes[i].c, 
        id : planes[i].id,
        h : planes[i].h,
        k : planes[i].k,
        l : planes[i].l,
        planeOpacity : planes[i].opacity,
        planeColor : planes[i].color,
        planeName : planes[i].name
      }; 

      this.lattice.forwardTransformationsMiller(this.lattice.millerPlanes[i]); 
    
      var text = "Plane : "+planes[i].name+"  ["+planes[i].h+","+planes[i].k+","+planes[i].l+"] ";
      var id = "_"+planes[i].h+""+planes[i].k+""+planes[i].l+"";
      var option = "<option id="+id+" value="+id+">"+text+"</option>" ;
      $('#planes').append(option) ;

      this.lattice.directionalList.push({ id : id });

    }   

  }; 
  RestoreCWstate.prototype.configureGradeParams = function() {
    this.lattice.gradeParameters = {"radius" : this.cwObj.cellVisualization.edges.radius, "cylinderColor" : this.cwObj.cellVisualization.edges.color , "faceOpacity" : this.cwObj.cellVisualization.faces.opacity , "faceColor" : this.cwObj.cellVisualization.faces.color};

    $('#radius').val(this.cwObj.cellVisualization.edges.radius);
    $('#faceOpacity').val(this.cwObj.cellVisualization.faces.opacity);

    this.menu.setSliderValue("radius",this.cwObj.cellVisualization.edges.radius );
    this.menu.setSliderValue("faceOpacity",this.cwObj.cellVisualization.faces.opacity);


  }; 
  RestoreCWstate.prototype.configureCellVisualization = function() {

    var _this = this ;
     
    $("input[name='faceCheckButton']").prop('checked', this.cwObj.cellVisualization.faces.visible);
    $("input[name='gridCheckButton']").prop('checked', this.cwObj.cellVisualization.edges.visible);
  
  }; 
  RestoreCWstate.prototype.configureLatticeParams = function() { 
    var _this = this ;
    var params = this.cwObj.latticeParams.properties ;

    this.lattice.gradeChoice = {"face":this.cwObj.cellVisualization.faces.visible, "grid":this.cwObj.cellVisualization.edges.visible};

    $('#bravaisLattice').val(this.cwObj.latticeParams.bravaisLattice); 

    /*if(!_.isUndefined(this.lattice.lattice.latticeType )){
      this.lattice.destroyPoints();
      this.lattice.destroyGrids();
      this.lattice.destroyPoints();
    };*/

    this.lattice.lattice = this.cwObj.latticeParams.lattice ; 
    if(this.cwObj.latticeParams.lattice){  
      this.lattice.parameters =  {
        'repeatX': this.cwObj.latticeParams.repeatX, 'repeatY': this.cwObj.latticeParams.repeatY, 'repeatZ':this.cwObj.latticeParams.repeatZ,
        'scaleX': this.cwObj.latticeParams.lattice.defaults.scaleX, 'scaleY': this.cwObj.latticeParams.lattice.defaults.scaleY, 'scaleZ': this.cwObj.latticeParams.lattice.defaults.scaleZ,
        'alpha': this.cwObj.latticeParams.lattice.defaults.alpha, 'beta': this.cwObj.latticeParams.lattice.defaults.beta, 'gamma': this.cwObj.latticeParams.lattice.defaults.gamma
      }; 
    }

    this.lattice.update(); 

    //// forgot other camerasssssssssss!

    $('#repeatX').val(this.cwObj.latticeParams.repeatX);
    $('#repeatY').val(this.cwObj.latticeParams.repeatY);
    $('#repeatZ').val(this.cwObj.latticeParams.repeatZ);

    if(this.cwObj.latticeParams.lattice){  

      $('#scaleX').val(this.cwObj.latticeParams.lattice.defaults.scaleX);
      $('#scaleY').val(this.cwObj.latticeParams.lattice.defaults.scaleY);
      $('#scaleZ').val(this.cwObj.latticeParams.lattice.defaults.scaleZ);

      $('#alpha').val(this.cwObj.latticeParams.lattice.defaults.alpha);
      $('#beta').val(this.cwObj.latticeParams.lattice.defaults.beta);
      $('#gamma').val(this.cwObj.latticeParams.lattice.defaults.gamma);
      

      this.menu.setSliderValue("alpha",this.cwObj.latticeParams.lattice.defaults.alpha);
      this.menu.setSliderValue("beta",this.cwObj.latticeParams.lattice.defaults.beta);
      this.menu.setSliderValue("gamma",this.cwObj.latticeParams.lattice.defaults.gamma);
    }

  };
  RestoreCWstate.prototype.configureTextArea = function() { 
    $('#mynotes').append(this.cwObj.notes);
  };

  RestoreCWstate.prototype.configureAxisSelection = function() { 
    var choices = this.cwObj.axisSelection;
 
    this.crystalScene.axisMode({'xyzAxes' : choices.xyzVisible});
    $('#xyzAxes').prop('checked', choices.xyzVisible);

    this.crystalScene.axisMode({'abcAxes' : choices.abcVisible}); 
    $('#abcAxes').prop('checked', choices.abcVisible);

  };
  RestoreCWstate.prototype.configureCameras = function() { 

    var settings = this.cwObj.cameraSettings ;
    var crystalCam = this.orbitCrystal.camera ;
    var cellCamera = this.orbitUnitCell.camera ; 

    crystalCam.position.set(settings.crystalCamera.position.x, settings.crystalCamera.position.y, settings.crystalCamera.position.z);
    cellCamera.position.set(settings.cellCamera.position.x, settings.crystalCamera.position.y, settings.crystalCamera.position.z);
 
    this.motifXcam.left =  settings.motifCameras.xCam.left ;  
    this.motifXcam.top =  settings.motifCameras.xCam.top ;  
    this.motifXcam.right =  settings.motifCameras.xCam.right ;  
    this.motifXcam.bottom =  settings.motifCameras.xCam.bottom ; 

    this.motifYcam.left =  settings.motifCameras.yCam.left ;  
    this.motifYcam.top =  settings.motifCameras.yCam.top ;  
    this.motifYcam.right =  settings.motifCameras.yCam.right ;  
    this.motifYcam.bottom =  settings.motifCameras.yCam.bottom ; 

    this.motifZcam.left =  settings.motifCameras.zCam.left ;  
    this.motifZcam.top =  settings.motifCameras.zCam.top ;  
    this.motifZcam.right =  settings.motifCameras.zCam.right ;  
    this.motifZcam.bottom =  settings.motifCameras.zCam.bottom ;  
    
    this.motifXcam.updateProjectionMatrix();
    this.motifYcam.updateProjectionMatrix();
    this.motifZcam.updateProjectionMatrix();
 
    // center at
    if(settings.crystalCamera.centeredAtAxis){
      this.orbitCrystal.control.target = new THREE.Vector3(0,0,0) ;
    }
    else{
      var params = this.cwObj.latticeParams.properties ;
      var x = params.scaleX * params.repeatX/2 ;
      var y = params.scaleY * params.repeatY /2;
      var z = params.scaleZ * params.repeatZ/2 ;
      var target = new THREE.Vector3(x,y,z) ;
      this.orbitCrystal.control.target = target ;
    } 
    $('#crystalCamTarget').prop('checked', settings.crystalCamera.centeredAtAxis);

    // distortion
    var cPos = this.crystalRenderer.cameras[0].position ;
    var currDistance = (this.crystalRenderer.cameras[0].position).distanceTo(new THREE.Vector3(0,0,0)) ;
    var vFOV = this.crystalRenderer.cameras[0].fov * Math.PI / 180;         
    var Visheight = 2 * Math.tan( vFOV / 2 ) * currDistance;   

    if(settings.crystalCamera.distortion){
      this.crystalRenderer.cameras[0].fov = 75;
      var distance = Visheight/(2 * Math.tan( (75* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      this.crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }
    else{ 
      this.crystalRenderer.cameras[0].fov = 15;
      var distance = Visheight/(2 * Math.tan( (15* Math.PI / 180) / 2 ) );
      var factor = distance/currDistance; 
      this.crystalRenderer.cameras[0].position.set(cPos.x * factor, cPos.y * factor, cPos.z * factor);
    }  
    $('#distortion').prop('checked', settings.crystalCamera.enableDistortion); 

    // sync cameras 

    if(settings.crystalCamera.synced){    
      crystalCam.position.set( cellCamera.position.x, cellCamera.position.y, cellCamera.position.z );  
      this.orbitCrystal.currPos.set(cellCamera.position.x,cellCamera.position.y,cellCamera.position.z ); 
      this.orbitUnitCell.currPos.set(cellCamera.position.x,cellCamera.position.y,cellCamera.position.z ) ; 
      this.orbitCrystal.sync = true;
      this.orbitUnitCell.sync = true;  
    }
    else
    {
      this.orbitCrystal.sync = false;
      this.orbitUnitCell.sync = false; 
    }
    $('#syncCameras').prop('checked', settings.crystalCamera.synced); 
  };  
 
  return RestoreCWstate;
});
