/*global define*/
'use strict';

define([
  'jquery',
  'jquery-ui',
  'pubsub',
  'underscore'
], function(
  jQuery,
  jQuery_ui,
  PubSub,
  _
) {
  var events = {
    LATTICE_CHANGE: 'menu.lattice_change',
    LATTICE_PARAMETER_CHANGE: 'menu.lattice_parameter_change',
    GRADE_PARAMETER_CHANGE: 'menu.grade_parameter_change',
    GRADE_CHOICES: 'menu.grade_choices',
    MILLER_PLANE_SUBMIT : 'menu.miller_plane_submit',
    MILLER_DIRECTIONAL_SUBMIT : 'menu.miller_directional_submit',
    DIRECTION_PARAMETER_CHANGE : 'menu.direction_parameter_change',
    PLANE_PARAMETER_CHANGE : 'menu.plane_parameter_change',
    PLANE_SELECTION : 'menu.plane_selection',
    DIRECTION_SELECTION : 'menu.direction_selection',
    MOTIF_POSITION_CHANGE : 'menu.motif_position_change',
    ATOM_SELECTION : 'menu.atom_selection',
    ATOM_SUBMIT : 'menu.atom_submit',
    SAVED_ATOM_SELECTION : 'menu.saved_atom_selection',
    ATOM_PARAMETER_CHANGE : 'menu.atom_parameter_change',
    ATOM_POSITION_CHANGE : 'menu.atom_position_change',
    ATOM_TANGENCY_CHANGE : 'menu.atom_tangency_change',
    MOTIF_DISTORTION_CHANGE : 'menu.motif_distortion_change',
    MOTIF_LENGTH_CHANGE : 'menu.motif_length_change',
    MOTIF_CAMERASYNC_CHANGE : 'menu.motif_camerasync_change',
    MOTIF_CELLDIMENSIONS_CHANGE : 'menu.motif_celldimensions_change',
    MOTIF_TO_LATTICE: 'menu.motif_to_lattice',
    DRAG_ATOM: 'menu.drag_atom',
    SET_ROTATING_ANGLE: 'menu.set_rotating_angle',
    UNIT_CELL_VIEW: 'menu.unit_cell_view',
    CHANGE_VIEW_IN_CRYSTAL: 'menu.change_view_in_crystal',
    AXIS_MODE: 'menu.axis_mode',
    AXYZ_CHANGE: 'menu.axyz_change',
    MAN_ANGLE_CHANGE: 'menu.man_angle_change',
    MANUAL_SET_DIMS: 'menu.manual_set_dims',
    MANUAL_SET_ANGLES: 'menu.manual_set_angles',
    CRYSTAL_CAM_TARGET: 'menu.crystal_cam_target',
    STORE_PROJECT: 'menu.store_project',
    ANAGLYPH_EFFECT: 'menu.anaglyph_effect',
    SET_PADLOCK: 'menu.set_padlock',
    FOG_CHANGE: 'menu.fog_change',
    FOG_PARAMETER_CHANGE: 'menu.fog_parameter_change',
    RENDERER_COLOR_CHANGE: 'menu.renderer_color_change',
    SET_SOUNDS: 'menu.set_sounds',
    SET_LIGHTS: 'menu.set_lights',
    SET_GEAR_BAR: 'menu.set_gear_bar',
    CHANGE_CRYSTAL_ATOM_RADIUS: 'menu.change_crystal_atom_radius',
    CHANGE_ATOM_POSITIONING_MODE: 'menu.change_atom_positioning_mode',
    FULL_SCREEN_APP: 'menu.full_screen_app', 
    UPDATE_NOTES: 'menu.update_notes'
  };

  // lattice parameters
  var $bravaisLattice = jQuery('#bravaisLattice');
  var $repeatX = jQuery('#repeatX');
  var $repeatY = jQuery('#repeatY');
  var $repeatZ = jQuery('#repeatZ');
  var $scaleX  = jQuery('#scaleX');
  var $scaleY  = jQuery('#scaleY');
  var $scaleZ  = jQuery('#scaleZ');
  var $alpha   = jQuery('#alpha');
  var $beta    = jQuery('#beta');
  var $gamma   = jQuery('#gamma'); 

  var $addRepeatX = jQuery('#addRepeatX'); 
  var $addRepeatY = jQuery('#addRepeatY'); 
  var $addRepeatZ = jQuery('#addRepeatZ'); 
  var $subRepeatX = jQuery('#subRepeatX'); 
  var $subRepeatY = jQuery('#subRepeatY'); 
  var $subRepeatZ = jQuery('#subRepeatZ'); 
  
  var latticeParameters = {
    'repeatX': $repeatX,
    'repeatY': $repeatY,
    'repeatZ': $repeatZ,
    'scaleX': $scaleX,
    'scaleY': $scaleY,
    'scaleZ': $scaleZ,
    'alpha': $alpha,
    'beta': $beta,
    'gamma': $gamma
  };
  var repeatArrows = {
    'addRepeatX' : $addRepeatX,
    'addRepeatY' : $addRepeatY,
    'addRepeatZ' : $addRepeatZ,
    'subRepeatX' : $subRepeatX,
    'subRepeatY' : $subRepeatY,
    'subRepeatZ' : $subRepeatZ 
  };
  var angleSliders = ['alpha','beta','gamma'];

  // miller parameters
  var $millerH = jQuery('#millerH');
  var $millerK = jQuery('#millerK');
  var $millerI = jQuery('#millerI');
  var $millerL = jQuery('#millerL');
  var $planeColor = jQuery('#planeColor');
  var $planeOpacity = jQuery('#planeOpacity');
  var $planeName = jQuery('#planeName');
  var $planes = jQuery('#planes');
 
  var $savePlane = jQuery('#savePlane');
  var $deletePlane = jQuery('#deletePlane');
  var $newPlane = jQuery('#newPlane');

  var $millerU = jQuery('#millerU');
  var $millerV = jQuery('#millerV');
  var $millerW = jQuery('#millerW');
  var $millerT = jQuery('#millerT');
  var $directionColor = jQuery('#directionColor');
  var $directionName = jQuery('#directionName');
  var $dirRadius = jQuery('#dirRadius');
  var $vectors = jQuery('#vectors');
  
  var $saveDirection = jQuery('#saveDirection');
  var $deleteDirection = jQuery('#deleteDirection');
  var $newDirection = jQuery('#newDirection');

  var planeParameters = {
    'millerH': $millerH,
    'millerK': $millerK,
    'millerL': $millerL,
    'millerI': $millerI,
    'planeColor': $planeColor,
    'planeOpacity': $planeOpacity,
    'planeName' : $planeName
  };

  var directionParameters = {
    'millerU': $millerU,
    'millerV': $millerV,
    'millerW': $millerW,
    'millerT': $millerT,
    'directionColor': $directionColor,
    'directionName' : $directionName,
    'dirRadius' : $dirRadius
  };

  var planeButtons = { 
    'savePlane': $savePlane,
    'deletePlane': $deletePlane,
    'newPlane': $newPlane
  };
  var directionalButtons = { 
    'saveDirection': $saveDirection,
    'deleteDirection': $deleteDirection,
    'newDirection': $newDirection
  };
  // grade parameters
  var $radius = jQuery('#radius');
  var $cylinderColor = jQuery('#cylinderColor');
  var $faceColor = jQuery('#faceColor');
  var $faceOpacity = jQuery('#faceOpacity');
  var $gridCheckButton = jQuery("input[name='gridCheckButton']");
  var $faceCheckButton = jQuery("input[name='faceCheckButton']");
 
  var gradeSelections = {
    'gridCheckButton' : $gridCheckButton,
    'faceCheckButton': $faceCheckButton
  };

  var gradeParameters = {
    'radius': $radius,
    'cylinderColor': $cylinderColor,
    'faceColor': $faceColor,
    'faceOpacity': $faceOpacity
  };

  // Motif
  var $previewChanges = jQuery('#previewChanges');
  var $saveChanges = jQuery('#saveChanges');
  var $deleteAtom = jQuery('#deleteAtom');
  var $cancel = jQuery('#cancel');

  var $padlock = jQuery('#padlock');
  var $distortion = jQuery('#distortion');
  var $syncCameras = jQuery('#syncCameras');

  var $fixedX = jQuery('#fixedX');
  var $fixedY = jQuery('#fixedY');
  var $fixedZ = jQuery('#fixedZ');
  var fixedDimensions = {
    'x' : $fixedX,
    'y' : $fixedY,
    'z' : $fixedZ
  };

  var motifSliders = ['atomPosX', 'atomPosY', 'atomPosZ'];
  var cellManDimensionsSliders = ['Aa', 'Ab', 'Ac'];
  var cellManAnglesSliders = ['cellAlpha', 'cellBeta', 'cellGamma'];

  var atomButtons = { 
    'saveChanges': $saveChanges,
    'deleteAtom': $deleteAtom,
    'cancel': $cancel
  };

  var $savedAtoms = jQuery('#savedAtoms');
 
  var $Aa = jQuery('#Aa');
  var $Ab = jQuery('#Ab');
  var $Ac = jQuery('#Ac');

  var $cellAlpha = jQuery('#cellAlpha');
  var $cellBeta = jQuery('#cellBeta');
  var $cellGamma = jQuery('#cellGamma');

  var cellManDimensions = {  
    'Aa' : $Aa,
    'Ab' : $Ab,
    'Ac' : $Ac
  };
  var cellManAngles = {  
    'cellAlpha' : $cellAlpha,
    'cellBeta' : $cellBeta,
    'cellGamma' : $cellGamma
  };

  var $atomPosX = jQuery('#atomPosX');
  var $atomPosY = jQuery('#atomPosY');
  var $atomPosZ = jQuery('#atomPosZ');
  var $atomName = jQuery('#atomName');
  var $atomColor = jQuery('#atomColor');
  var $atomOpacity = jQuery('#atomOpacity');
  var $tangency = jQuery('#tangency');
  var $atomTexture = jQuery('#atomTexture');
  var $wireframe = jQuery('#wireframe');

  var atomParameters = {
    'atomName': $atomName,
    'atomColor': $atomColor,
    'atomOpacity': $atomOpacity,
    'atomTexture': $atomTexture,
    'wireframe': $wireframe
  };
  var motifInputs = {
    'atomPosX' : $atomPosX,
    'atomPosY' : $atomPosY, 
    'atomPosZ' : $atomPosZ
  };

  var $rotAngleTheta = jQuery('#rotAngleTheta');
  var $rotAnglePhi = jQuery('#rotAnglePhi'); 
  var rotatingAngles = {
    'rotAngleTheta' : $rotAngleTheta,
    'rotAnglePhi' : $rotAnglePhi 
  };
    
  var $unitCellView = jQuery('#unitCellView');
  var $showViewInCrystal = jQuery('#showViewInCrystal');

  var $notes = jQuery('#notes');

  var $crystalCamTarget = jQuery('#crystalCamTarget');

  var $storeState = jQuery('#storeState');

  var $fogColor = jQuery('#fogColor');
  var $fogDensity = jQuery('#fogDensity');

  var $crystalScreenColor = jQuery('#crystalScreenColor');
  var $cellScreenColor = jQuery('#cellScreenColor');
  var $motifXScreenColor = jQuery('#motifXScreenColor');
  var $motifYScreenColor = jQuery('#motifYScreenColor');
  var $motifZScreenColor = jQuery('#motifZScreenColor');
   
  var rendererColors = {
    'crystalScreenColor' : $crystalScreenColor,
    'cellScreenColor' : $cellScreenColor,
    'motifXScreenColor' : $motifXScreenColor ,
    'motifYScreenColor' : $motifYScreenColor ,
    'motifZScreenColor' : $motifZScreenColor  
  };

  var fogParameters = {
    'fogDensity' : $fogDensity,
    'fogColor' : $fogColor 
  };

  var $reduceRadius = jQuery('#reduceRadius');

  var LastLatticeParameters = []; // Hold last value in case of none acceptable entered value

  function Menu() {

    var _this = this;

    // Lattice UI Tab
    $bravaisLattice.on('change', function() {  
      return PubSub.publish(events.LATTICE_CHANGE, jQuery(this).val());
    });

    var argument;
    /*jshint unused:false*/
    _.each(latticeParameters, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        PubSub.publish(events.LATTICE_PARAMETER_CHANGE, argument);
      });
    });
    _.each(repeatArrows, function($arrow, k) {
      $arrow.on('click', function() {
        if(k === 'addRepeatX'){
          var val = parseInt( $("#repeatZ").val());
          val++;
          $("#repeatZ").val(val);
          $("#repeatZ").trigger('change');
          
        }
        else if(k === 'addRepeatY'){
          var val = parseInt( $("#repeatX").val());
          val++;
          $("#repeatX").val(val);
          $("#repeatX").trigger('change');
        }
        else if(k === 'addRepeatZ'){
          var val = parseInt( $("#repeatY").val());
          val++;
          $("#repeatY").val(val);
          $("#repeatY").trigger('change');
        }
        else if(k === 'subRepeatX'){
          var val = parseInt( $("#repeatZ").val());
          if(val > 1) { 
            val--;
            $("#repeatZ").val(val);
            $("#repeatZ").trigger('change');
          }
        }
        else if(k === 'subRepeatY'){
          var val = parseInt( $("#repeatX").val());
          if(val > 1) { 
            val--;
            $("#repeatX").val(val);
            $("#repeatX").trigger('change');
          }
        }
        else if(k === 'subRepeatZ'){
          var val = parseInt( $("#repeatY").val());
          if(val > 1) { 
            val--;
            $("#repeatY").val(val);
            $("#repeatY").trigger('change');
          }
        } 
      });
    });
    _.each(angleSliders, function(name) {
      _this.setSlider(name,90,44,136,2);
    });

    // Grade UI Tab
    _.each(gradeParameters, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        PubSub.publish(events.GRADE_PARAMETER_CHANGE, argument);
      });
    });
    
    this.setSlider("radius",1,1,10,1);
    
    this.setSlider("faceOpacity",1,1,10,1);

    _.each(gradeSelections, function($select, k ) {
      $select.on('click', function(){
        argument ={};
        if($select.val()==="on") {
          argument[$select.attr('name')] = false;
          $select.val("off");
        }
        else{
          argument[$select.attr('name')] = true;
          $select.val("on");
        }
        PubSub.publish(events.GRADE_CHOICES, argument);  
        
      });
    });

    // Miller UI Tab
    _.each(planeButtons, function($select, k ) {
      $select.on('click', function(){
        argument = {};
        argument["button"]=this.id ;

        _.each(planeParameters, function($param, a ) {
          argument[a] = $param.val();
        });
        PubSub.publish(events.MILLER_PLANE_SUBMIT, argument);
      });
    });

    _.each(directionalButtons, function($select, k ) {
      $select.on('click', function(){
        argument = {};
        argument["button"]=this.id ;
        _.each(directionParameters, function($param, a ) {
          argument[a] = $param.val();
        });
        PubSub.publish(events.MILLER_DIRECTIONAL_SUBMIT, argument);
      });
    });

    _.each(directionParameters, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, argument);
      });
    });

    this.setSlider("dirRadius",1,1,10,1); 

    _.each(planeParameters, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        PubSub.publish(events.PLANE_PARAMETER_CHANGE, argument);
      });
    });

    $vectors.on('change', function() {
      var id = jQuery(this).val()  ;
      return PubSub.publish(events.DIRECTION_SELECTION, id);
    });
    $planes.on('change', function() {
      var id = jQuery(this).val()  ;
      return PubSub.publish(events.PLANE_SELECTION, id);
    });

    this.setSlider("planeOpacity",10,1,10,1); 

    // Motif
    _.each(motifSliders, function(name) {
      _this.setSliderInp(name,0,-20.0000000000,20.0000000000,0.0000000001, events.ATOM_POSITION_CHANGE);
    }); 
    _.each(cellManDimensionsSliders, function(name) {  
      _this.setSliderInp(name,0,0.000,30.000,0.001, events.AXYZ_CHANGE);
    }); 
    _.each(cellManAnglesSliders, function(name) {  
      _this.setSliderInp(name,90,30,160,0.001, events.MAN_ANGLE_CHANGE); 
    }); 
    $(".periodic").click(function(){
      argument = {};
      argument["element"]=$(this).text() ;
      argument["button"]=this.id ;
      _.each(atomParameters, function($param, a ) {
        argument[a] = $param.val();
      });
      argument["tangency"]= ($('#tangency').is(':checked')) ? true : false ;
      PubSub.publish(events.ATOM_SELECTION, argument);
    }); 
    _.each(atomButtons, function($select, k ) {
      $select.on('click', function(){
        argument = {};
        argument["button"]=this.id ;
        _.each(atomParameters, function($param, a ) {
          argument[a] = $param.val();
        });
        PubSub.publish(events.ATOM_SUBMIT, argument);
      });
    });
    $previewChanges.on('click', function(){  
      PubSub.publish(events.MOTIF_TO_LATTICE, 0);
    });
    $savedAtoms.on('change', function() {
      var id = jQuery(this).val()  ;
      return PubSub.publish(events.SAVED_ATOM_SELECTION, id);
    });
    _.each(atomParameters, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        if(k=='wireframe') argument[k]= ($('#wireframe').is(':checked')) ? true : false ;
        PubSub.publish(events.ATOM_PARAMETER_CHANGE, argument);
      }); 
    }); 
    _.each(motifInputs, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {}; 
        argument[k] = $parameter.val(); 
        _this.setSliderValue(k,parseFloat(argument[k])); 
        argument['trigger'] = 'textbox';
        PubSub.publish(events.ATOM_POSITION_CHANGE, argument);
      });
    });
    _.each(cellManDimensions, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {}; 
        argument[k] = $parameter.val(); 
        _this.setSliderValue(k,argument[k]); 
        PubSub.publish(events.AXYZ_CHANGE, argument);
      });
    });
    _.each(cellManAngles, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {}; 
        argument[k] = $parameter.val(); 
        _this.setSliderValue(k,argument[k]); 
        PubSub.publish(events.MAN_ANGLE_CHANGE, argument);
      });
    });
    _.each(fogParameters, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        PubSub.publish(events.FOG_PARAMETER_CHANGE, argument);
      });
    });
    _.each(rendererColors, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        PubSub.publish(events.RENDERER_COLOR_CHANGE, argument);
      });
    });
    
    $('#fsApp').click(function(){ 
      PubSub.publish(events.FULL_SCREEN_APP, argument);
    }); 

    this.setSlider("fogDensity",1,0,50,1);
    $('#tangency').change(function() {  
      var argument = {};
      argument["tangency"]= ($('#tangency').is(':checked')) ? true : false ;
      PubSub.publish(events.ATOM_TANGENCY_CHANGE, argument);           
    });
    $('#manualSetCellDims').change(function() {  
      var argument = {};
      argument["manualSetCellDims"]= ($('#manualSetCellDims').is(':checked')) ? true : false ;
      PubSub.publish(events.MANUAL_SET_DIMS, argument);           
    });
    $('#manualSetCellAngles').change(function() {  
      var argument = {};
      argument["manualSetCellAngles"]= ($('#manualSetCellAngles').is(':checked')) ? true : false ;
      PubSub.publish(events.MANUAL_SET_ANGLES, argument);           
    });
    $('#padlock').change(function() {  
      var argument = {};
      argument["padlock"]= ($('#padlock').is(':checked')) ? true : false ;
      _.each(fixedDimensions, function($parameter, k) {
        argument[k] = $parameter.val();
      })
      PubSub.publish(events.MOTIF_LENGTH_CHANGE, argument);           
    });
    $('#distortion').change(function() {  
      var argument = {};
      argument["distortion"]= ($('#distortion').is(':checked')) ? true : false ;
      PubSub.publish(events.MOTIF_DISTORTION_CHANGE, argument);           
    });
    $('#syncCameras').change(function() {  
      var argument = {};
      argument["syncCameras"]= ($('#syncCameras').is(':checked')) ? true : false ;
      PubSub.publish(events.MOTIF_CAMERASYNC_CHANGE, argument);           
    });
    $('#fog').change(function() {  
      var argument = {};
      argument["fog"]= ($('#fog').is(':checked')) ? true : false ;
      PubSub.publish(events.FOG_CHANGE, argument);           
    });
    _.each(fixedDimensions, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        PubSub.publish(events.MOTIF_CELLDIMENSIONS_CHANGE, argument);
      });
    });
    $('#dragMode').change(function() {  
      var argument = {};
      argument["dragMode"]= ($('#dragMode').is(':checked')) ? true : false ;
      PubSub.publish(events.DRAG_ATOM, argument);           
    }); 
    _.each(rotatingAngles, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument['rotAnglePhi'] =  $('#rotAnglePhi').val()
        argument['rotAngleTheta'] =  $('#rotAngleTheta').val()
        PubSub.publish(events.SET_ROTATING_ANGLE, argument);
      });
    });
    $unitCellView.on('change', function() {
      var id = jQuery(this).val()  ; 
      return PubSub.publish(events.UNIT_CELL_VIEW, id);
    });
    $showViewInCrystal.on('click', function(){ 
      var arg = jQuery('#unitCellView :selected').val();  
      PubSub.publish(events.CHANGE_VIEW_IN_CRYSTAL, arg); 
    });
    this.setSlider("atomOpacity",10,0,10,1); 
    $('#helperImage').hide(); 
    $('#rotAnglePhi').on('focusin', function(e) { 
        $('#helperImage').css( 'position', 'relative' ); 
        $('#helperImage').show(); 
    });
    $('#rotAngleTheta').on('focusin', function(e) { 
        $('#helperImage').css( 'position', 'relative' ); 
        $('#helperImage').show();
    });
    $('#rotAnglePhi').on('focusout', function(e) {
      $('#helperImage').hide();
    });
    $('#rotAngleTheta').on('focusout', function(e) {
      $('#helperImage').hide();
    });
    $("#xyzAxes").click(function(){
      argument = {}; 
      argument["xyzAxes"]= ($('#xyzAxes').is(':checked')) ? true : false ;
      PubSub.publish(events.AXIS_MODE, argument);
    }); 
    $("#abcAxes").click(function(){
      argument = {}; 
      argument["abcAxes"]= ($('#abcAxes').is(':checked')) ? true : false ;
      PubSub.publish(events.AXIS_MODE, argument);
    }); 
    
    $("#notepad").dialog({ 
      draggable: true,
      resizable: true, 
      width: 400,
      height: 400,
      hide:true,
      buttons: [
        {
          text: "Submit",
          click: function() {
            argument = {}; 
            argument["text"]= $('#mynotes').val();
            PubSub.publish(events.UPDATE_NOTES, argument);
            $( this ).dialog( "close" );
          }
        }
      ]
    });  
    $( "#notepad" ).dialog( "close" ); 
    $( "#notepad" ).on( "dialogresize", function( event, ui ) { 
      $( "#mynotes" ).css({"width":(0.95* ($( "#notepad" ).width())),"height":(0.95* ($( "#notepad" ).height())) });
    } ); 
    $notes.on('click', function() {
      $( "#notepad" ).dialog( "open" );   
    });
    $( "#mynotes" ).css({"width":(0.95* ($( "#notepad" ).width())),"height":(0.95* ($( "#notepad" ).height())) });
  
    $("#crystalCamTarget").click(function(){
      argument = {}; 
      argument["center"]= ($('#crystalCamTarget').is(':checked')) ? true : false ;
      PubSub.publish(events.CRYSTAL_CAM_TARGET, argument);
    });
    
    $storeState.on('click', function() {
      PubSub.publish(events.STORE_PROJECT, argument);   
    });
    
    $('#anaglyph').change(function() {  
      var argument = {};
      argument["anaglyph"]= ($('#anaglyph').is(':checked')) ? true : false ; 
      PubSub.publish(events.ANAGLYPH_EFFECT, argument);           
    });  
    $('#padlock').change(function() {  
      var argument = {};
      argument["padlock"]= ($('#padlock').is(':checked')) ? true : false ; 
      PubSub.publish(events.SET_PADLOCK, argument);           
    });  
    $('#sounds').change(function() {  
      var argument = {};
      argument["sounds"]= ($('#sounds').is(':checked')) ? true : false ;
      PubSub.publish(events.SET_SOUNDS, argument);           
    });
    $('#lights').change(function() {  
      var argument = {};
      argument["lights"]= ($('#lights').is(':checked')) ? true : false ;
      PubSub.publish(events.SET_LIGHTS, argument);           
    }); 

    this.setSlider("reduceRadius",10,1,10.2,0.2);
    $reduceRadius.on('change', function() {
      var arg = jQuery(this).val()  ; 
      PubSub.publish(events.CHANGE_CRYSTAL_ATOM_RADIUS, arg);
    });
    $('input[name=atomPositioning]').on('change', function() {
       var arg = {};
       arg['atomPositioning'] = $('input[name=atomPositioning]:checked' ).val(); 
       PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, arg);

    });

    this.setVerticalSlider('#gearBarSlider', 1, 1, 5, 1);

    this.restrictionEvents = []; 
     
  }; 
  Menu.prototype.getLatticeParameters = function() {
    var parameters = {};
    _.each(latticeParameters, function($latticeParameter, k) {
      parameters[k] = $latticeParameter.val();
      LastLatticeParameters[k] = parameters[k];
    });
    return parameters;
  };

  Menu.prototype.setLatticeParameters = function(parameters) {
    if (_.isObject(parameters) === false) {
      return;
    } 
    var _this = this;
    
    /*jshint unused:false*/
    _.each(latticeParameters, function($latticeParameter, k) {
      if (_.isUndefined(parameters[k]) === false) {
        $latticeParameter.val(parameters[k]); 
      }
    });

    _.each(angleSliders, function(name) {
      _this.setSliderValue(name,parameters[name]);
    });

    PubSub.publish(events.LATTICE_PARAMETER_CHANGE, this.getLatticeParameters());
  };

  Menu.prototype.setOnOffSlider = function(name, action) {
    var name = '#'+name+'Slider'
    require([ "jquery-ui" ], function( slider ) { 
      $(name).slider(action);
    });
  }; 
  Menu.prototype.setSliderMin = function(name, val) {
    var name = '#'+name+'Slider'
    require([ "jquery-ui" ], function( slider ) {  
      $(name).slider( "option", "min", val );
    });
  };
  Menu.prototype.setSliderMax = function(name, val) {
    var name = '#'+name+'Slider'
    require([ "jquery-ui" ], function( slider ) {  
      $(name).slider( "option", "max", val );
    });
  };
  Menu.prototype.setSliderValue = function(name,value) {
    require([ "jquery-ui" ], function( slider ) {
      $("#"+name+"Slider").slider('value',value ); 
      $("#"+name).val(value);
    });
  }; 
 
  Menu.prototype.setSliderInp = function(name,value,min,max,step, eventName) { 
    
    var _this = this ;

    require([ "jquery-ui" ], function( slider ) {
       
      $("#"+name+"Slider").slider({ 
        orientation: "horizontal",
        range: false,
        min: min,
        max: max,
        value: value,
        step: step,
        animate: true,

        slide: function (event, ui) {               
          $("#"+name).val(ui.value); 
          var argument = {}; 
          argument[name] = ui.value;
          argument['trigger'] = 'slider'; 
          PubSub.publish(eventName, argument);
        }
      }); 
    });
  };
  Menu.prototype.setVerticalSlider = function( name, value, min, max, step ){

    require([ "jquery-ui" ], function( slider ) {

      $(name).slider({
        orientation: "vertical",
        range: "min",
        min: 1,
        max: 5,
        value: 1,
        slide: function( event, ui ) { 
          var argument = {'state' : ui.value } ;
          PubSub.publish(events.SET_GEAR_BAR, argument);
        }
      });
      
    });

  }
  Menu.prototype.setSlider = function(name,value,min,max,step) {
    require([ "jquery-ui" ], function( slider ) {
       
      $("#"+name+"Slider").slider({
        orientation: "horizontal",
        range: false,
        min: min,
        max: max,
        value: value,
        step: step,
        animate: true,

        change: function (event, ui) {
          $("#"+name).val(ui.value);
          $("#"+name).trigger('change');
          $("#"+name+"Label").text(ui.value); 
        },

        slide: function (event, ui) {              
          $("#"+name).val(ui.value);
          $("#"+name).trigger('change');
          $("#"+name+"Label").text(ui.value);
        }
      });
        
    });
  };
  Menu.prototype.onLatticeChange = function(callback) {
    PubSub.subscribe(events.LATTICE_CHANGE, callback);
  };
  Menu.prototype.onLatticeParameterChange = function(callback) { 
    PubSub.subscribe(events.LATTICE_PARAMETER_CHANGE, callback);
  };
  Menu.prototype.onLatticeParameterChangeForHud = function(callback) {
    PubSub.subscribe(events.LATTICE_PARAMETER_CHANGE, callback);
  };
  Menu.prototype.onGradeParameterChange = function(callback) {
    PubSub.subscribe(events.GRADE_PARAMETER_CHANGE, callback);
  };
  Menu.prototype.onGradeChoices = function(callback) {
    PubSub.subscribe(events.GRADE_CHOICES, callback);
  };
  Menu.prototype.onDirectionalSubmit = function(callback) {
    PubSub.subscribe(events.MILLER_DIRECTIONAL_SUBMIT, callback);
  };
  Menu.prototype.onPlaneSubmit = function(callback) {
    PubSub.subscribe(events.MILLER_PLANE_SUBMIT, callback);
  };
  Menu.prototype.directionSelection = function(callback) {
    PubSub.subscribe(events.DIRECTION_SELECTION, callback);
  };
  Menu.prototype.directionParameterChange = function(callback) {
    PubSub.subscribe(events.DIRECTION_PARAMETER_CHANGE, callback);
  };
  Menu.prototype.planeParameterChange = function(callback) {
    PubSub.subscribe(events.PLANE_PARAMETER_CHANGE, callback);
  };
  Menu.prototype.planeSelection = function(callback) {
    PubSub.subscribe(events.PLANE_SELECTION, callback);
  };
  Menu.prototype.atomSelection = function(callback) {
    PubSub.subscribe(events.ATOM_SELECTION, callback);
  };
  Menu.prototype.onAtomSubmit = function(callback) {
    PubSub.subscribe(events.ATOM_SUBMIT, callback);
  };
  Menu.prototype.savedAtomSelection = function(callback) {
    PubSub.subscribe(events.SAVED_ATOM_SELECTION, callback);
  };
  Menu.prototype.onAtomParameterChange = function(callback) {
    PubSub.subscribe(events.ATOM_PARAMETER_CHANGE, callback);
  };
  Menu.prototype.onAtomPositionChange = function(callback) {
    PubSub.subscribe(events.ATOM_POSITION_CHANGE, callback);
  }; 
  Menu.prototype.onManuallyCellDimsChange = function(callback) {
    PubSub.subscribe(events.AXYZ_CHANGE, callback);
  };
  Menu.prototype.onManuallyCellAnglesChange = function(callback) {
    PubSub.subscribe(events.MAN_ANGLE_CHANGE, callback);
  };
  Menu.prototype.onAtomTangencyChange = function(callback) {
    PubSub.subscribe(events.ATOM_TANGENCY_CHANGE, callback);
  };
  Menu.prototype.setDimsManually = function(callback) {
    PubSub.subscribe(events.MANUAL_SET_DIMS, callback);
  };
  Menu.prototype.setAnglesManually = function(callback) {
    PubSub.subscribe(events.MANUAL_SET_ANGLES, callback);
  };
  Menu.prototype.onFixedLengthChange = function(callback) {
    PubSub.subscribe(events.MOTIF_LENGTH_CHANGE, callback);
  };
  Menu.prototype.onCameraDistortionChange = function(callback) {
    PubSub.subscribe(events.MOTIF_DISTORTION_CHANGE, callback);
  };
  Menu.prototype.onCameraSyncChange = function(callback) {
    PubSub.subscribe(events.MOTIF_CAMERASYNC_CHANGE, callback);
  }; 
  Menu.prototype.cellDimensionChange = function(callback) {
    PubSub.subscribe(events.MOTIF_CELLDIMENSIONS_CHANGE, callback);
  };
  Menu.prototype.motifToLattice = function(callback) {
    PubSub.subscribe(events.MOTIF_TO_LATTICE, callback);
  };
  Menu.prototype.setDragMode = function(callback) {
    PubSub.subscribe(events.DRAG_ATOM, callback);
  };
  Menu.prototype.onRotatingAngleChange = function(callback) {
    PubSub.subscribe(events.SET_ROTATING_ANGLE, callback);
  };
  Menu.prototype.onCellViewChange = function(callback) { 
    PubSub.subscribe(events.UNIT_CELL_VIEW, callback);
  };
  Menu.prototype.onCrystalViewChange = function(callback) { 
    PubSub.subscribe(events.CHANGE_VIEW_IN_CRYSTAL, callback);
  };
  Menu.prototype.onAxisModeChange = function(callback) { 
    PubSub.subscribe(events.AXIS_MODE, callback);
  };
  Menu.prototype.targetOfCamChange = function(callback) { 
    PubSub.subscribe(events.CRYSTAL_CAM_TARGET, callback);
  };
  Menu.prototype.storeProject = function(callback) { 
    PubSub.subscribe(events.STORE_PROJECT, callback);
  };
  Menu.prototype.setAnaglyph = function(callback) { 
    PubSub.subscribe(events.ANAGLYPH_EFFECT, callback);
  }; 
  Menu.prototype.onFogParameterChange = function(callback) { 
    PubSub.subscribe(events.FOG_PARAMETER_CHANGE, callback);
  };
  Menu.prototype.onFogChange = function(callback) { 
    PubSub.subscribe(events.FOG_CHANGE, callback);
  };
  Menu.prototype.onRendererColorChange = function(callback) { 
    PubSub.subscribe(events.RENDERER_COLOR_CHANGE, callback);
  };
  Menu.prototype.onSoundsSet = function(callback) { 
    PubSub.subscribe(events.SET_SOUNDS, callback);
  };
  Menu.prototype.onLightsSet = function(callback) { 
    PubSub.subscribe(events.SET_LIGHTS, callback);
  };
  Menu.prototype.onRadiusToggle = function(callback) { 
    PubSub.subscribe(events.CHANGE_CRYSTAL_ATOM_RADIUS, callback);
  };
  Menu.prototype.onAtomPosModeChange = function(callback) { 
    PubSub.subscribe(events.CHANGE_ATOM_POSITIONING_MODE, callback);
  };
  Menu.prototype.onGearBarSelection = function(callback) { 
    PubSub.subscribe(events.SET_GEAR_BAR, callback);
  }; 
  Menu.prototype.fullScreenApp = function(callback) { 
    PubSub.subscribe(events.FULL_SCREEN_APP, callback);
  };
  Menu.prototype.updateNotes = function(callback) { 
    PubSub.subscribe(events.UPDATE_NOTES, callback);
  };
  Menu.prototype.setLatticeRestrictions = function(restrictions) {
    var $body = jQuery('body');

    _.each(this.restrictionEvents, function(restriction) {
      $body.off('change', '#' + restriction.id, restriction.ev);
    });

    /*jshint unused:false*/
    _.each(latticeParameters, function($parameter, pk) {
      $parameter.removeAttr('disabled');
    });

    if (_.isObject(restrictions) === false) {
      return;
    }

    var left = {};
    var right = {};
    var id;
    var restrictionEvent;
    var _this = this;
    var rightValue;

    _.each(latticeParameters, function($parameter, pk) {

      if (_.isUndefined(restrictions[pk]) === false) {
          
          left[pk] = $parameter;

          _.each(restrictions[pk], function(operator, rk) {

              right[rk] = latticeParameters[rk];
 
              if (operator === '=') {

                  left[pk].attr('disabled', 'disabled');

                  restrictionEvent = function() {

                      left[pk].val(right[rk].val());
                      left[pk].trigger('change');       

                  };
                  id = right[rk].attr('id');
                  _this.restrictionEvents.push({

                      ev: restrictionEvent,
                      id: id

                  });

                  //$body.on('change', '#' + id, restrictionEvent);

              } 
              else if (operator === '≠') {

                  restrictionEvent = function() {

                      // sometimes right value may be bounded to a number instead of an input
                      rightValue = _.isUndefined(right[rk]) ? parseFloat(rk) : right[rk].val();

                      if (parseFloat(left[pk].val()) == rightValue) {
                          
                          /*
                          alert("The value "+rightValue+" you entered for "+pk+" is not valid.");
                          left[pk].val(LastLatticeParameters[pk]);
                          left[pk].trigger('change');   
                          */       
                                     
                      } 

                  };

                  id = left[pk].attr('id');
                  _this.restrictionEvents.push({

                      ev: restrictionEvent,
                      id: id

                  });

                 // $body.on('change', '#' + id, restrictionEvent);

              }
          });
      }

    });

  };

  return Menu;
});
