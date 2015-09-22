/*global define*/
'use strict';

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'icheck',
    'jquery.matchHeight',
    'jquery.mCustomScrollbar.concat.min',
    'bootstrap',
    'bootstrap-select',
    'jColor'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    iCheck,
    matchHeight,
    customScrollbar,
    bootstrap,
    bootstrapSelect,
    jColor
) 
{
    // ZOOM LEVEL SOS IMPORTANT (CHANGE IN INDEX.HTML id="main_controls_container")
    //var $zoom = 0.78;
    var $zoom = 1;
    // Move Color Picker indide window area
    var $colorPickerUp = 0.13;
    var $colorPickerLeft = 0.08;
    var $colorPickerLeftLot = 0.18;
    
    // Project-Script Elements
    var $spinner = jQuery('.spinner');
    var $icheck = jQuery('input.icheckbox, input.iradio');
    var $alt_atn_toggler = jQuery('.btn_alternate_action_toggler');
    var $alt_atn_target = jQuery('#cnt_alternate_actions');
    var $scrollBars = jQuery('.custom_scrollbar');
    var $btn_form_toggler = jQuery('.btn_form_toggler');
    var $controls_toggler = jQuery('#controls_toggler');
    var $main_controls = jQuery('#main_controls_container');
    
    var $xyzAxes = jQuery("#xyzAxes");
    var $abcAxes = jQuery("#abcAxes");
    var $edges = jQuery("#edges");
    var $faces = jQuery("#faces");
    var $latticePoints = jQuery("#latticePoints");
    var $planes = jQuery("#planes");
    var $directions = jQuery("#directions");
    var $atomRadius = jQuery("#atomRadius");
    var $atomToggle = jQuery("#atomToggle");
    
    var toggles = {
        'xyzAxes': $xyzAxes,
        'abcAxes': $abcAxes,
        'edges': $edges,
        'faces': $faces,
        'latticePoints': $latticePoints,
        'planes': $planes,
        'directions': $directions,
        'atomToggle': $atomToggle
    }
    
    var events = {
        STEREOSCOPIC: 'menu.stereoscopic',
        PLANE_TOGGLE: 'menu.planes_toggle',
        ATOM_TOGGLE: 'menu.atom_toggle',
        DIRECTION_TOGGLE: 'menu.directions_toggle',
        LATTICE_POINTS_TOGGLE: 'menu.lattice_points_change',
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
        CELL_VOLUME_CHANGE: 'menu.cell_volume_change',
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
        UPDATE_NOTES: 'menu.update_notes',
        LEAP_MOTION: 'menu.leap_motion', 
        LEAP_TRACKING_SYSTEM: 'menu.leap_tracking_system',
    };    
    
    var latticeNames = {
        cubic_primitive: 'Cubic Simple',
        cubic_body_centered: 'Cubic Body Centered',
        cubic_face_centered: 'Cubic Face Centered',
        tetragonal_primitive: 'Tetragonal Simple',
        tetragonal_body_centered: 'Tetragonal Body Centered',
        orthorhombic_primitive: 'Orthorhombic Simple',
        orthorhombic_body_centered: 'Orthorhombic Body Centered',
        orthorhombic_face_centered: 'Orthorhombic Face Centered',
        orthorhombic_base_centered: 'Orthorhombic Base Centered',
        hexagonal_primitive: 'Hexagonal',
        hexagonal: 'Hexagonal Strange',
        rhombohedral_primitive: 'Rhombohedral / Trigonal',
        monoclinic_primitive: 'Monoclinic Simple',
        monoclinic_base_centered: 'Monoclinic Base Centered',
        triclinic_primitive: 'Triclinic Simple'
    };

    var $bravaisLattice = jQuery('#add_lattice_btn');
    var $bravaisModal = jQuery('.mh_bravais_lattice_block');
    
    var $periodicTableButton = jQuery('#add_atom_btn');
    var $periodicModal = jQuery('.ch');
    
    // Lattice parameters
    var $repeatX = jQuery('#repeatX');
    var $repeatY = jQuery('#repeatY');
    var $repeatZ = jQuery('#repeatZ');
    var $scaleX  = jQuery('#scaleX');
    var $scaleY  = jQuery('#scaleY');
    var $scaleZ  = jQuery('#scaleZ');
    var $alpha   = jQuery('#alpha');
    var $beta    = jQuery('#beta');
    var $gamma   = jQuery('#gamma'); 
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
  
    var lengthSlider = ['scaleX','scaleY','scaleZ'];
    var angleSliders = ['alpha','beta','gamma'];
    
    // grade parameters
    var $radius = jQuery('#radius');
    var $faceOpacity = jQuery('#faceOpacity');
    var $colorBorder = jQuery('#cube_color_border');
    var $colorFilled = jQuery('#cube_color_filled');

    var gradeParameters = {
        'radius': $radius,
        'faceOpacity': $faceOpacity
    };

    // miller parameters
    var $millerH = jQuery('#millerH');
    var $millerK = jQuery('#millerK');
    var $millerI = jQuery('#millerI');
    var $millerL = jQuery('#millerL');
    var $planeColor = jQuery('#planeColor');
    var $planeOpacity = jQuery('#planeOpacity');
    var $planeName = jQuery('#planeName');
 
    var $savePlane = jQuery('#savePlane');
    var $deletePlane = jQuery('#deletePlane');
    var $newPlane = jQuery('#newPlane');
    var $planesTable = jQuery('#planesTable');
    var $directionTable = jQuery('#directionTable');

    var $millerU = jQuery('#millerU');
    var $millerV = jQuery('#millerV');
    var $millerW = jQuery('#millerW');
    var $millerT = jQuery('#millerT');
    var $directionColor = jQuery('#directionColor');
    var $directionName = jQuery('#directionName');
    var $dirRadius = jQuery('#dirRadius');

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
    
    var directionButtons = { 
        'saveDirection': $saveDirection,
        'deleteDirection': $deleteDirection,
        'newDirection': $newDirection
    };

    // Motif
    var $atomPalette = jQuery('#atomPalette');
    var $previewAtomChanges = jQuery('.previewAtomChanges');
    var $saveAtomChanges = jQuery('.saveAtomChanges');
    var $deleteAtom = jQuery('#deleteAtom');
    var $atomTable = jQuery('#atomTable');
    var $deleteAtom = jQuery('#deleteAtom');

    var $atomButtons = {
        'atomPalette': $atomPalette,
        'previewAtomChanges': $previewAtomChanges,
        'saveAtomChanges': $saveAtomChanges,
        'deleteAtom': $deleteAtom
    };
    
    var $latticePadlock = jQuery('#latticePadlock');
    var $motifPadlock = jQuery('#motifPadlock');
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
    var $atomColor = jQuery('#atomColor');
    var $atomOpacity = jQuery('#atomOpacity');
    var $tangency = jQuery('#tangency');
    var $atomTexture = jQuery('#atomTexture');
    var $wireframe = jQuery('#wireframe');
    var $atomPositioningXYZ = jQuery('#atomPositioningXYZ');
    var $atomPositioningABC = jQuery('#atomPositioningABC');

    var atomParameters = {
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

    var $elementContainer = jQuery('.element-symbol-container');
    
    var $tangentR = jQuery('#tangentR');
    var $rotAngleTheta = jQuery('#rotAngleTheta');
    var $rotAnglePhi = jQuery('#rotAnglePhi'); 
    var rotatingAngles = {
        'rotAngleTheta' : $rotAngleTheta,
        'rotAnglePhi' : $rotAnglePhi 
    };
    
    var $rotAngleX = jQuery('#rotAngleX');
    var $rotAngleY = jQuery('#rotAngleY');
    var $rotAngleZ = jQuery('#rotAngleZ');
    var rotLables = {
        'rotAngleX' : $rotAngleX,
        'rotAngleY' : $rotAngleY,
        'rotAngleZ' : $rotAngleZ
    }

    var $notes = jQuery('#notes');

    var $storeState = jQuery('#storeState');

    var $fogColor = jQuery('#fogColor');
    var $fogDensity = jQuery('#fogDensity');
    
    var $distortionOn = jQuery('#distortionOn');
    var $distortionOff = jQuery('#distortionOff');

    var $crystalScreenColor = jQuery('#crystalScreenColor');
    var $cellScreenColor = jQuery('#cellScreenColor');
    var $motifXScreenColor = jQuery('#motifXScreenColor');
    var $motifYScreenColor = jQuery('#motifYScreenColor');
    var $motifZScreenColor = jQuery('#motifZScreenColor');

    var $reduceRadius = jQuery('#reduceRadius');
    var $sounds = jQuery('#sounds');
    var $lights = jQuery('#lights');
    var $fullScreen = jQuery('#fullScreen');
    var $leapMotion = $('#leapMotion');
    
    var $Classic = jQuery('#Classic');
    var $Subtracted = jQuery('#Subtracted');
    var $SolidVoid = jQuery('#SolidVoid');
    var $GradeLimited = jQuery('#GradeLimited');
    
    var $notepad = jQuery('#noteWrapper');
    var $progressBarWrapper = jQuery('#progressBarWrapper');
    //var $progressBar = jQuery('#progressBar');
    //var $progressN;

    var $notepadButton = jQuery('#notesButton');
    var $crystalCamTargetOn = jQuery("#crystalCamTargetOn");
    var $crystalCamTargetOff = jQuery("#crystalCamTargetOff");
    var $stereoscopic = false;
    var $anaglyph = jQuery('#anaglyph');
    var $oculus = jQuery('#oculus');
    
    var renderizationMode = {
        'Classic': $Classic,
        'Subtracted': $Subtracted,
        'SolidVoid': $SolidVoid,
        'gradeLimited': $GradeLimited
    }
    
    var colorPickers = {
        'colorBorder': $colorBorder,
        'colorFilled': $colorFilled,
        'planeColor': $planeColor,
        'directionColor': $directionColor,
        'atomColor': $atomColor,
        'fogColor': $fogColor,
        'crystalScreenColor' : $crystalScreenColor,
        'cellScreenColor' : $cellScreenColor,
        'motifXScreenColor' : $motifXScreenColor ,
        'motifYScreenColor' : $motifYScreenColor ,
        'motifZScreenColor' : $motifZScreenColor
    };

    var LastLatticeParameters = []; // Hold last value in case of none acceptable entered value
    
    
    function app_container()
    {
        
        var screen_width = jQuery(window).width();
        var screen_height = jQuery(window).height();
        var x = 0;
        var y = -(screen_height);
        
        if ($main_controls.hasClass('controls-open')) x = (500)*($zoom);
        else x = (83)*($zoom);
        
        $("#screenWrapper").width(screen_width-x);
        $("#screenWrapper").fadeIn(800);

        $("#app-container").width(screen_width-x);
        jQuery('#progressBarWrapper').width(screen_width);
    };

    function init_dimensions()
    {
        jQuery('.mh_controls').matchHeight();
        jQuery('.mh_pnd_para_box').matchHeight();
        jQuery('.mh_lattice_length_para_box').matchHeight();

        jQuery('.mh_bravais_lattice_block').matchHeight(
        {
            byRow: false
        });

        jQuery('.mh_bravais_lattice_block').find('.bravais-lattice-block').matchHeight(
        {
            byRow: false
        });

        jQuery('.mh_bravais_lattice_block').find('.block-image').matchHeight(
        {
            byRow: false
        });
    };
    
    function Menu() {

        var _this = this;
        var argument;
        
        jQuery('#motifLI').tooltip({
            container : 'body',
            trigger: 'click', 
            title: 'You have to choose a Lattice before opening the Motif Tab'
        });
        
        // Initiate Menu Components - Without App Connection
        $scrollBars.mCustomScrollbar();
        
        $alt_atn_toggler.on('click', function(){
            if ($alt_atn_target.is(':visible'))
            {
                $alt_atn_target.slideUp('fast');
                jQuery(this).removeClass('active');
            }
            else
            {
                $alt_atn_target.slideDown('fast');
                jQuery(this).addClass('active');
            }

            return false;
        });
        jQuery($icheck).iCheck({
            checkboxClass: 'icheckbox_square-grey',
            radioClass: 'iradio_square-grey'
        });
        $btn_form_toggler.on('click', function(){
            var $cnt_form = jQuery(this).closest('.save-public-library-box').find('.box-body');

            if ($cnt_form.is(':visible'))
            {
                $cnt_form.slideUp('fast');
                jQuery(this).removeClass('open');
            }
            else
            {
                $cnt_form.slideDown('fast');
                jQuery(this).addClass('open');
            }

            return false;
        });
        $controls_toggler.on('click', function(){
            if ($main_controls.hasClass('controls-open'))
            {
                $controls_toggler.find('.img-close').fadeOut('fast', function()
                {
                    $controls_toggler.find('.img-open').fadeIn('fast')
                });
                $("#screenWrapper").fadeOut('slow');
                $main_controls.animate({'right': '-417px'}, 500, function()
                {
                    $main_controls.removeClass('controls-open');
                    $main_controls.addClass('controls-close');
                    window.dispatchEvent(new Event('resize'));
                });
            }
            else
            {
                $controls_toggler.find('.img-open').fadeOut('fast', function()
                {
                    $controls_toggler.find('.img-close').fadeIn('fast')
                });
                $("#screenWrapper").fadeOut('slow');
                $main_controls.animate({'right': '0'}, 500, function()
                {
                    $main_controls.removeClass('controls-close');
                    $main_controls.addClass('controls-open');
                    window.dispatchEvent(new Event('resize'));
                });
            }

            return false;
        });
        jQuery('.control-open').on('click', function(){
            if( !( jQuery(this).hasClass('toggle_menu') ) ){
                $controls_toggler.find('.img-open').fadeOut('fast', function()
                {
                    $controls_toggler.find('.img-close').fadeIn('fast')
                });
                if (! ($main_controls.hasClass('controls-open')) ) {
                    $("#screenWrapper").fadeOut('slow');
                    $main_controls.animate({'right': '0'}, 500, function()
                    {
                        $main_controls.removeClass('controls-close');
                        $main_controls.addClass('controls-open');
                        window.dispatchEvent(new Event('resize'));
                    });
                } 
            }
        });
        
        
        // Overwrite Events
        jQuery(window).resize(function() {
          app_container();
        });
        jQuery(window).on('load change update', function(){
            init_dimensions();
            jQuery('#bravais_lattice_modal').on('shown.bs.modal', function()
            {
                init_dimensions();
            });
        });
        jQuery(document).ready(function(){
            init_dimensions();
            app_container();
        });
        
        
        //Padlocks
        $latticePadlock.on('click', function() {
            var argument = {};
            if ($latticePadlock.children().hasClass('active')) argument["padlock"] = true;
            else argument["padlock"] = false;
            PubSub.publish(events.SET_PADLOCK, argument);          
        });
        $motifPadlock.on('click', function() {
            if ( !($motifPadlock.hasClass('disabled')) ){
                var argument = {};
                if ($motifPadlock.children().hasClass('active')) {
                    argument["padlock"] = true;
                    argument["manualSetCellDims"] = true;
                    argument["manualSetCellAngles"] = true;
                }
                else{ 
                    argument["padlock"] = false;
                    argument["manualSetCellDims"] = false;
                    argument["manualSetCellAngles"] = false;
                }
                PubSub.publish(events.SET_PADLOCK, argument);
                PubSub.publish(events.MANUAL_SET_DIMS, argument);
                PubSub.publish(events.MANUAL_SET_ANGLES, argument);
            }
        });
        $motifPadlock.hover(
            function(){$motifPadlock.css('background','#08090b');},
            function(){$motifPadlock.css('background','#15171b');}
        );
        
        // Bravais Lattice
        $bravaisModal.on('click',function(){
            $bravaisModal.removeClass('selected');
            jQuery(this).addClass('selected');
        });
        $bravaisLattice.on('click', function() {
            var selected = jQuery('.mh_bravais_lattice_block.selected');
            if (selected.length > 0) {
                jQuery('#selected_lattice').text(latticeNames[selected.attr('id')]);
                PubSub.publish(events.LATTICE_CHANGE,selected.attr('id'));
                jQuery('#motifLI').find('a').attr('href','#scrn_motif');
            }
        });
        
        
        // Latice Parameters (Repetition, Length, Angle)
        _.each(latticeParameters, function($parameter, k) {
            if ( ($parameter.attr('id') == 'alpha')|($parameter.attr('id') == 'beta')|($parameter.attr('id') == 'gamma')) $parameter.val(90);
            else $parameter.val(1);
            
            if ( ($parameter.attr('id') !== 'repeatX')&&($parameter.attr('id') !== 'repeatY')&&($parameter.attr('id') !== 'repeatZ')){
                $parameter.on('change', function() {
                    argument = {};
                    argument[k] = $parameter.val();
                    jQuery('#'+k+'Slider').slider('value',argument[k]);
                    PubSub.publish(events.LATTICE_PARAMETER_CHANGE, argument);
                });
            }
            else{
                $parameter.on('change',function(){
                    argument = {};
                    argument[k] = $parameter.val();
                    PubSub.publish(events.LATTICE_PARAMETER_CHANGE, argument);
                });
            }
        });
        $spinner.spinner({
            min: 1,
            spin: function(event,ui){
                argument = {};
                argument[jQuery(this).attr('id')] = ui.value;
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, argument);
            }
        });
        _.each(lengthSlider, function(name) {
           _this.setSlider(name,1,1,100,0.01,events.LATTICE_PARAMETER_CHANGE); 
        });
        _.each(angleSliders, function(name) {
            _this.setSlider(name,90,1,180,1,events.LATTICE_PARAMETER_CHANGE);
        });
        
                         
        // Cell Visualization Checkboxes
        $icheck.on('ifChecked',function(){
            var name = jQuery(this).attr('name');
            switch(name){
                case 'gridCheckButton':
                    argument ={};
                    argument[name] = true;
                    PubSub.publish(events.GRADE_CHOICES, argument);
                    $edges.parent().css('background','#2F3238');
                    $edges.addClass('buttonPressed');
                    break;
                    
                case 'faceCheckButton':
                    argument ={};
                    argument[name] = true;
                    PubSub.publish(events.GRADE_CHOICES, argument);
                    $faces.parent().css('background','#2F3238');
                    $faces.addClass('buttonPressed');
                    break;
                    
                case 'fog':
                    argument ={};
                    argument[name] = true;
                    PubSub.publish(events.FOG_CHANGE, argument);
                    break;
                    
                case 'stereoscopic':
                    $stereoscopic = true;
                    argument ={};
                    argument['anaglyph'] = $anaglyph.hasClass('active');
                    argument['oculus'] = false;
                    PubSub.publish(events.STEREOSCOPIC, argument);
                    break;
            }
        });
        $icheck.on('ifUnchecked',function(){
            var name = jQuery(this).attr('name');
            switch(name){
                case 'gridCheckButton':
                    argument ={};
                    argument[name] = false;
                    PubSub.publish(events.GRADE_CHOICES, argument);
                    $edges.parent().css('background','transparent');
                    $edges.removeClass('buttonPressed');
                    break;
                    
                case 'faceCheckButton':
                    argument ={};
                    argument[name] = false;
                    PubSub.publish(events.GRADE_CHOICES, argument);
                    $faces.parent().css('background','transparent');
                    $faces.removeClass('buttonPressed');
                    break;
                
                case 'fog':
                    argument ={};
                    argument[name] = false;
                    PubSub.publish(events.FOG_CHANGE, argument);
                    break;
                    
                case 'stereoscopic':
                    $stereoscopic = false;
                    argument ={};
                    argument['anaglyph'] = $anaglyph.hasClass('active');
                    argument['oculus'] = false;
                    PubSub.publish(events.STEREOSCOPIC, argument);
                    break;
            }
        });
        
        
        
        // Cell Visualization Parametes (Radius,Face Opacity,Colors)
        _.each(gradeParameters, function($parameter, k) {
            $parameter.val(1);
            $parameter.on('change', function() {
                argument = {};
                argument[k] = $parameter.val();
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, argument);
            });
        });
        _this.setSlider("radius",1,1,10,1,events.GRADE_PARAMETER_CHANGE);
        _this.setSlider("faceOpacity",1,1,10,1,events.GRADE_PARAMETER_CHANGE);
        

        //ColorPickers
        _.each(colorPickers,function($parameter, k){
            var eventColor;
            switch(k){
                case 'colorBorder' : k = 'cylinderColor'; eventColor = events.GRADE_PARAMETER_CHANGE; break;
                case 'colorFilled' : k = 'faceColor'; eventColor = events.GRADE_PARAMETER_CHANGE; break;
                case 'planeColor' : k = 'planeColor'; eventColor = events.PLANE_PARAMETER_CHANGE; break;
                case 'directionColor' : k = 'directionColor'; eventColor = events.DIRECTION_PARAMETER_CHANGE; break;
                case 'atomColor' : k = 'atomColor'; eventColor = events.ATOM_PARAMETER_CHANGE; break;
                case 'fogColor' : k = 'fogColor'; eventColor = events.FOG_PARAMETER_CHANGE; break;
                case 'crystalScreenColor' : k = 'crystalScreenColor'; eventColor = events.RENDERER_COLOR_CHANGE; break;
                case 'cellScreenColor' : k = 'cellScreenColor'; eventColor = events.RENDERER_COLOR_CHANGE; break;
                case 'motifXScreenColor' : k = 'motifXScreenColor'; eventColor = events.RENDERER_COLOR_CHANGE; break;
                case 'motifYScreenColor' : k = 'motifYScreenColor'; eventColor = events.RENDERER_COLOR_CHANGE; break;
                case 'motifZScreenColor' : k = 'motifZScreenColor'; eventColor = events.RENDERER_COLOR_CHANGE; break;
            }
            $parameter.spectrum({
                color: "#ffffff",
                allowEmpty:true,
                chooseText: "Choose",
                cancelText: "Close",
                move: function(){
                    argument = {};
                    argument[k] = $parameter.spectrum("get").toHex();
                    PubSub.publish(eventColor, argument);
                    $parameter.children().css('background','#'+$parameter.spectrum("get").toHex());
                },
                change: function(){
                    argument = {};
                    argument[k] = $parameter.spectrum("get").toHex();
                    $parameter.children().css('background','#'+$parameter.spectrum("get").toHex());
                    PubSub.publish(eventColor, argument);
                }
            });
        });
        
        
        // Planes and Directions
        _.each(planeParameters, function($parameter, k) {
            
            //Initialization
            $planesTable.css('display','none');
            switch(k)
            {
                case 'planeName':
                    $parameter.attr('placeholder','Enter a name ...');
                    $parameter.prop('disabled',true);
                    break;
                    
                case 'planeOpacity':
                    $parameter.html('<option>0</option><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option>');
                    $parameter.selectpicker();
                    $parameter.selectpicker('val',10);
                    $parameter.prop('disabled',true);
                    break;
                    
                case 'millerI':
                    $parameter.val(1);
                    $parameter.parent().parent().parent().css('display','none');
                    break;
                    
                case 'planeColor':
                    $parameter.spectrum("disable");
                    break;
                    
                default:
                    $parameter.val(1);
                    $parameter.prop('disabled',true);
                    break;
            }
            
            // Change Handlers
            $parameter.on('change', function() {
                argument = {};
                if (k == 'planeColor') argument[k] = $parameter.spectrum("get").toHex();
                else argument[k] = $parameter.val();
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, argument);
            });
        });
        _.each(planeButtons, function($select, k ) {
            $select.on('click', function(){
                if (!($select.hasClass('disabled'))){
                    argument = {};
                    argument["button"] = k;
                    _.each(planeParameters, function($param, a ) {
                        if (a == 'planeColor') argument[a] = $param.spectrum("get").toHex();
                        else argument[a] = $param.val();
                    });
                    PubSub.publish(events.MILLER_PLANE_SUBMIT, argument);
                    return false;
                }
            });
        });        
        
        _.each(directionParameters, function($parameter, k) {
            
            //Initialization
            $directionTable.css('display','none');
            switch(k)
            {
                case 'directionName':
                    $parameter.attr('placeholder','Enter a name ...');
                    $parameter.prop('disabled',true);
                    break;
                    
                case 'dirRadius':
                    $parameter.html('<option>1</option><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option>');
                    $parameter.selectpicker();
                    $parameter.prop('disabled',true);
                    break;
                    
                case 'millerT':
                    $parameter.val(1);
                    $parameter.parent().parent().parent().css('display','none');
                    break;
                    
                case 'directionColor':
                    $parameter.spectrum("disable");
                    break;
                    
                default:
                    $parameter.val(1);
                    $parameter.prop('disabled',true);
                    break;
            }
            // Handlers
            $parameter.on('change', function() {
                argument = {};
                if (k == 'directionColor') argument[k] = $parameter.spectrum("get").toHex();
                else argument[k] = $parameter.val();
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, argument);
            });
        });
        _.each(directionButtons, function($parameter, k ) {
            $parameter.on('click', function(){
                if (!($parameter.hasClass('disabled'))){
                    argument = {};
                    argument["button"]=this.id;
                    _.each(directionParameters, function($param, a ) {
                        if (a == 'directionColor') argument[a] = $param.spectrum("get").toHex();
                        else argument[a] = $param.val();
                    });
                    PubSub.publish(events.MILLER_DIRECTIONAL_SUBMIT, argument);
                }
            });
        });
    
        
        //Toggle Buttons
        _.each(toggles, function($parameter, k){
            var title;
            switch(k){
                case 'xyzAxes':
                    $parameter.parent().css('background','#43464b');
                    $parameter.addClass('buttonPressed');
                    title = 'xyz Axes';
                    break;
                 case 'abcAxes':
                    title = 'abc Axes';
                    break;
                case 'edges':
                    title = 'Cell Edges';
                    break;
                case 'faces':
                    title = 'Cell Faces';
                    break;
                case 'latticePoints':
                    $parameter.parent().css('background','#43464b');
                    $parameter.addClass('buttonPressed');
                    title = 'Lattice Points';
                    break;
                case 'directions':
                    $parameter.parent().css('background','#43464b');
                    $parameter.addClass('buttonPressed');
                    title = 'Directions';
                    break;
                case 'planes':
                    $parameter.parent().css('background','#43464b');
                    $parameter.addClass('buttonPressed');
                    title = 'Planes';
                    break;
                case 'atomToggle':
                    $parameter.parent().css('background','#43464b');
                    $parameter.addClass('buttonPressed');
                    title = 'Atoms';
                    break;
            }
            $parameter.parent().tooltip({
                container : 'body',
                trigger: 'hover', 
                title: title
            });
            $parameter.hover(
                function(){
                    $parameter.parent().css('background','#43464b');
                },
                function(){
                    if ($parameter.hasClass('buttonPressed')) $parameter.parent().css('background','#43464b');
                    else $parameter.parent().css('background','transparent');
                }
            );
        });
        
        //Handlers
        $xyzAxes.click(function() {
            argument = {};
            if (!($xyzAxes.hasClass('buttonPressed'))) argument['xyzAxes'] = true;
            else argument['xyzAxes'] = false;
            $xyzAxes.toggleClass('buttonPressed');
            PubSub.publish(events.AXIS_MODE, argument);
        });
        $abcAxes.click(function() {
            argument = {};
            if (!($abcAxes.hasClass('buttonPressed'))) argument['abcAxes'] = true;
            else argument['abcAxes'] = false;
            $abcAxes.toggleClass('buttonPressed');
            PubSub.publish(events.AXIS_MODE, argument);
        });
        $edges.click(function() {
            $edges.toggleClass('buttonPressed');
            jQuery('[name=gridCheckButton]').iCheck('toggle');
        });  
        $faces.click(function() {
            $faces.toggleClass('buttonPressed');
            jQuery('[name=faceCheckButton]').iCheck('toggle');
        }); 
        $latticePoints.click(function() {
            argument = {};
            if (!($latticePoints.hasClass('buttonPressed'))) argument['latticePoints'] = true;
            else argument['latticePoints'] = false;
            $latticePoints.toggleClass('buttonPressed');
            PubSub.publish(events.LATTICE_POINTS_TOGGLE, argument);
        });
        $planes.click(function() {
            argument = {};
            if (!($planes.hasClass('buttonPressed'))) argument['planeToggle'] = true;
            else argument['planeToggle'] = false;
            $planes.toggleClass('buttonPressed');
            PubSub.publish(events.PLANE_TOGGLE, argument);
        });  
        $directions.click(function() {
            argument = {};
            if (!($directions.hasClass('buttonPressed'))) argument['directionToggle'] = true;
            else argument['directionToggle'] = false;
            $directions.toggleClass('buttonPressed');
            PubSub.publish(events.DIRECTION_TOGGLE, argument);
        });
        $atomToggle.click(function() {
            argument = {};
            if (!($atomToggle.hasClass('buttonPressed'))) argument['atomToggle'] = true;
            else argument['atomToggle'] = false;
            $atomToggle.toggleClass('buttonPressed');
            PubSub.publish(events.ATOM_TOGGLE, argument);
        });
        
        $atomRadius.parent().tooltip({
            container : 'body',
            trigger: 'manual',
            title: '<div id="customSlider">Atom Radius</div><br/><div class="slider-control slider-control-sm theme-dark"><div id="atomRadiusSlider"></div></div>',
            html: 'true'
        });
        var tempVal = 10;
        $atomRadius.parent().hover(
            function(){
                $atomRadius.parent().tooltip('show');
                jQuery('#customSlider').parent().css('background', '#2c2e33');
                jQuery('#customSlider').parent().css('color', '#fff');
                jQuery('#customSlider').parent().siblings().css('border-left-color', '#2c2e33');
                _this.setSlider('atomRadius',tempVal,1,10,0.2,events.CHANGE_CRYSTAL_ATOM_RADIUS);
                jQuery('#customSlider').parent().hover(
                    function(){},
                    function(){
                        tempVal = $atomRadius.val();
                        $atomRadius.parent().tooltip('hide');
                    }
                );
            },
            function(){}
        );
        
        
        // Lattice Parameters (Motif)
        _.each(cellManDimensions, function($parameter, k) {
            $parameter.val(1);
            $parameter.on('change', function() {
                argument = {}; 
                argument[k] = $parameter.val(); 
                jQuery('#'+k+'Slider').slider('value',argument[k]); 
                PubSub.publish(events.AXYZ_CHANGE, argument);
            });
        });
        _.each(cellManAngles, function($parameter, k) {
            $parameter.val(90);
            $parameter.on('change', function() {
                argument = {}; 
                argument[k] = $parameter.val(); 
                _this.setSliderValue(k,argument[k]); 
                PubSub.publish(events.MAN_ANGLE_CHANGE, argument);
            });
        });
        
        _.each(cellManDimensionsSliders, function(name) {  
            _this.setSlider(name,0.53,0.53,30.000,0.00001,events.AXYZ_CHANGE);
            _this.setOnOffSlider(name,true);
        }); 
        _.each(cellManAnglesSliders, function(name) { 
            _this.setSlider(name,90,2,178,0.1, events.MAN_ANGLE_CHANGE); 
            _this.setOnOffSlider(name,true);
        });
        
        
        // Atom Parameters
        $atomTable.css('display','none');
        _.each(atomParameters, function($parameter, k ) {
            switch(k){
                case 'atomOpacity':
                    $parameter.val(10);
                    break;
                case 'atomColor':
                    break;
                case 'atomTexture':
                    break;
                case 'wireframe':
                    break;
            }
            $parameter.on('change', function() {
                argument = {};
                switch(k){
                    case 'wireframe':
                        // argument[k]= ($('#wireframe').is(':checked')) ? true : false ;
                        argument[k]= false;
                        break;
                    case 'atomTexture':
                        argument[k] = 'None';
                        break;
                    case 'atomColor':
                        argument[k] = $parameter.spectrum("get").toHex();
                        break;
                    case 'atomOpacity':
                        jQuery('#'+k+'Slider').slider('value',argument[k]);
                        argument[k] = $parameter.val();
                        break;
                }
                PubSub.publish(events.ATOM_PARAMETER_CHANGE, argument);
            }); 
        });
        _this.setSlider('atomOpacity',10,1,10,0.1,events.ATOM_PARAMETER_CHANGE);
        $tangency.addClass('buttonPressed');
        $tangency.parent().css('background','#74629c');
        $tangency.on('click',function(){
            if ( !($tangency.hasClass('disabled')) ){
                argument = {};
                argument["button"]=this.id;
                if (!($tangency.hasClass('buttonPressed'))) argument['tangency'] = true;
                else argument['tangency'] = false;
                $tangency.toggleClass('buttonPressed');
                PubSub.publish(events.ATOM_TANGENCY_CHANGE, argument);
            }
        });
        $tangency.hover(
            function(){$tangency.parent().css('background','#74629c');},
            function(){if(!($tangency.hasClass('buttonPressed')))$tangency.parent().css('background','#15171b');}
        );
        $previewAtomChanges.on('click', function(){  
            if (!($previewAtomChanges.hasClass('disabled'))){
                $previewAtomChanges.toggleClass('buttonPressed');
                PubSub.publish(events.MOTIF_TO_LATTICE, 0);
            }
        });
        $saveAtomChanges.on('click', function(){
            if (!($saveAtomChanges.hasClass('disabled'))){
                argument = {};
                argument["button"] = 'saveChanges';
                _.each(atomParameters, function($parameter, k ) {
                    switch(k){
                        case 'wireframe':
                            // argument[k]= ($('#wireframe').is(':checked')) ? true : false ;
                            argument[k]= false;
                            break;
                        case 'atomTexture':
                            argument[k] = 'None';
                            break;
                        case 'atomColor':
                            argument[k] = $parameter.spectrum("get").toHex();
                            break;
                        case 'atomOpacity':
                            jQuery('#'+k+'Slider').slider('value',argument[k]);
                            argument[k] = $parameter.val();
                            break;
                    }
                });
                PubSub.publish(events.ATOM_SUBMIT, argument);
            }
        });
        
        
        // Periodic Table
        $periodicModal.on('click',function(){
            $periodicModal.removeClass('selected');
            jQuery(this).addClass('selected');
        });
        $periodicTableButton.on('click', function() {
            var selected = jQuery('.ch.selected');
            if (selected.length > 0) {
                argument = {};
                argument["element"] = selected.html();
                _.each(atomParameters, function($param, a ) {
                    switch(a){
                        case 'wireframe':
                            argument[a]= false;
                            break;
                        case 'atomTexture':
                            argument[a] = 'None';
                            break;
                        case 'atomColor':
                            argument[a] = $param.spectrum("get").toHex();
                            break;
                        default:
                            argument[a] = $param.val();
                            break;
                    }
                });
                argument["tangency"]= (!($tangency.hasClass('buttonPressed'))) ? false : true;
                PubSub.publish(events.ATOM_SELECTION, argument);
                $elementContainer.css('display','block');
                $elementContainer.find('a').removeAttr('class');
                $elementContainer.find('a').attr('class',selected.attr('class'));
                $elementContainer.find('a').html(selected.html());
            }
        });
        
        
        //Motif Parameters
        _.each(motifInputs, function($parameter, k) {
            $parameter.val(1);
            $parameter.on('change', function() {
                argument = {}; 
                argument[k] = $parameter.val(); 
                jQuery('#'+k+'Slider').slider('value',argument[k]);  
                argument['trigger'] = 'textbox';
                PubSub.publish(events.ATOM_POSITION_CHANGE, argument);
            });
        });
        _.each(motifSliders, function(name) {
            _this.setSlider(name,0,-20.0000000000,20.0000000000,0.0000000001, events.ATOM_POSITION_CHANGE); 
        });
        
        $atomPositioningXYZ.on('click', function() {
            argument = {};
            if (!($atomPositioningXYZ.hasClass('disabled'))){
                if (!($atomPositioningXYZ.hasClass('buttonPressed'))){
                    $atomPositioningXYZ.addClass('buttonPressed');
                    $atomPositioningXYZ.removeClass('btn-light');
                    $atomPositioningXYZ.addClass('btn-purple-light');
                    $atomPositioningABC.removeClass('buttonPressed');
                    $atomPositioningABC.removeClass('btn-purple-light');
                    $atomPositioningABC.addClass('btn-light');
                    argument['xyz'] = true;
                }
                else{
                    $atomPositioningXYZ.removeClass('buttonPressed');
                    $atomPositioningXYZ.removeClass('btn-purple-light');
                    $atomPositioningXYZ.addClass('btn-light');
                    $atomPositioningABC.addClass('buttonPressed');
                    $atomPositioningABC.removeClass('btn-light');
                    $atomPositioningABC.addClass('btn-purple-light');
                    argument['abc'] = true;
                }
                PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, argument);
            }
        });
        $atomPositioningABC.on('click', function() {
            argument = {};
            if (!($atomPositioningABC.hasClass('disabled'))){
                if (!($atomPositioningABC.hasClass('buttonPressed'))){
                    $atomPositioningABC.addClass('buttonPressed');
                    $atomPositioningABC.removeClass('btn-light');
                    $atomPositioningABC.addClass('btn-purple-light');
                    $atomPositioningXYZ.removeClass('buttonPressed');
                    $atomPositioningXYZ.removeClass('btn-purple-light');
                    $atomPositioningXYZ.addClass('btn-light');
                    argument['abc'] = true;
                }
                else{
                    $atomPositioningABC.removeClass('buttonPressed');
                    $atomPositioningABC.removeClass('btn-purple-light');
                    $atomPositioningABC.addClass('btn-light');
                    $atomPositioningXYZ.addClass('buttonPressed');
                    $atomPositioningXYZ.removeClass('btn-light');
                    $atomPositioningXYZ.addClass('btn-purple-light');
                    argument['xyz'] = true;
                }
                PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, argument);
            }
        });
        
        //Fog Density
        $fogDensity.val(1);
        $fogDensity.on('change',function(){
            argument = {}; 
            argument['fogDensity'] = $fogDensity.val();
            PubSub.publish(events.FOG_PARAMETER_CHANGE, argument);
        });
        _this.setSlider('fogDensity',5,1,10,0.1,events.FOG_PARAMETER_CHANGE);
        
    
        // Rotating Angles
        _.each(rotatingAngles, function($parameter, k) {
            $parameter.val(1);
            $parameter.on('change', function() {
                argument = {};
                argument['rotAnglePhi'] =  $('#rotAnglePhi').val()
                argument['rotAngleTheta'] =  $('#rotAngleTheta').val()
                PubSub.publish(events.SET_ROTATING_ANGLE, argument);
            });
        });
        $tangentR.val(1);
        
        // Sounds and Lights 
        $sounds.on('click', function(){  
            var argument = {};
            $sounds.toggleClass('active');
            argument["sounds"] = ($sounds.hasClass('active')) ? true : false ;
            PubSub.publish(events.SET_SOUNDS, argument);
        });
        $lights.on('click', function(){  
            var argument = {};
            $lights.toggleClass('active');
            argument["lights"] = ($lights.hasClass('active')) ? true : false ;
            PubSub.publish(events.SET_LIGHTS, argument);
        });
        
        
        // Full Screen
        $fullScreen.click(function(){
            var argument = {};
            PubSub.publish(events.FULL_SCREEN_APP, argument);
        }); 
        $leapMotion.change(function() {  
            var argument = {};
            argument["leap"]= ($leapMotion.hasClass('active')) ? true : false ;
            PubSub.publish(events.LEAP_MOTION, argument);           
        });
        
        // Renderization Mode
        _.each(renderizationMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    if (!($parameter.hasClass('active'))) {
                        $parameter.addClass('active');
                        argument = {};
                        argument['mode'] = k;
                        PubSub.publish(events.CHANGE_VIEW_IN_CRYSTAL, argument);
                        _.each(renderizationMode, function($param, a) { if ( a !== k) $param.removeClass('active');});
                    }
                }
            });
        });
        

        // Notepad
        $notepad.draggable({
            scroll: false,
            handle: '#noteBar'
        });
        $notepad.find('#notes').on('focus',function(){
            jQuery(this).attr('contenteditable','true');
        });
        $notepad.resizable();
        $notepad.find('.mCSB_1_scrollbar_vertical').css('display','block');
        $notepad.find('img').on('click',function(){$notepad.css('display','none');});
        $notepadButton.on('click',function(){$notepad.css('display','block');});

        
         // Progress Bar
        var screen_width = jQuery(window).width();
        var screen_height = jQuery('.main-controls-container').height();
        $progressBarWrapper.width(screen_width);
        $progressBarWrapper.height(screen_height);
        /*$progressBar.progressbar({
            max: 100,
            value: false,
            complete: function() {
                setTimeout(progressDelay, 500);
            }
        });
        function progressDelay(){
            $progressBarWrapper.fadeOut('slow');
            jQuery('body').css('overflow','auto');
        };*/
        
        
        $crystalCamTargetOn.click(function(){
            if( !($crystalCamTargetOn.hasClass('active')) ){ 
                $crystalCamTargetOn.addClass('active');
                $crystalCamTargetOff.removeClass('active');
                argument = {}; 
                argument["center"]= true;
                PubSub.publish(events.CRYSTAL_CAM_TARGET, argument);
            }
        });
        $crystalCamTargetOff.click(function(){
            if( !($crystalCamTargetOff.hasClass('active')) ){
                $crystalCamTargetOff.addClass('active');
                $crystalCamTargetOn.removeClass('active');
                argument = {}; 
                argument["center"]= false;
                PubSub.publish(events.CRYSTAL_CAM_TARGET, argument);
            }
        });
        
        $distortionOn.click(function() {
            if( !($distortionOn.hasClass('active')) ){ 
                $distortionOn.addClass('active');
                $distortionOff.removeClass('active');
                argument = {}; 
                argument["distortion"]= true;
                PubSub.publish(events.MOTIF_DISTORTION_CHANGE, argument);
            }         
        });
        $distortionOff.click(function() {  
            if( !($distortionOff.hasClass('active')) ){ 
                $distortionOff.addClass('active');
                $distortionOn.removeClass('active');
                argument = {}; 
                argument["distortion"]= false;
                PubSub.publish(events.MOTIF_DISTORTION_CHANGE, argument);
            }            
        });
        
        $anaglyph.click(function() {
            if ($stereoscopic){
                $anaglyph.removeClass('disabled');
                if (!($anaglyph.hasClass('active'))){
                    $oculus.removeClass('active');
                    $anaglyph.addClass('active');
                    argument ={};
                    argument['anaglyph'] = true;
                    PubSub.publish(events.ANAGLYPH_EFFECT, argument);
                }
                else{
                    $anaglyph.removeClass('active');
                    argument ={};
                    argument['anaglyph'] = false;
                    PubSub.publish(events.ANAGLYPH_EFFECT, argument);
                }
            }
            else{
                $anaglyph.addClass('disabled');
            }
        });
        $oculus.click(function() {
            if ($stereoscopic){
                $oculus.removeClass('disabled');
                if (!($oculus.hasClass('active'))){
                    $anaglyph.removeClass('active');
                    $oculus.addClass('active');
                    argument ={};
                    argument['oculus'] = true;
                    PubSub.publish(events.OCULUS, argument);
                }
                else{
                    $oculus.removeClass('active');
                    argument ={};
                    argument['v'] = false;
                    PubSub.publish(events.OCULUS, argument);
                }
            }
            else{
                $oculus.addClass('disabled');
            }
        });
        
    /*$
    
    
    $('#cellVolume').on('change', function() {
      argument = {}; 
      argument['cellVolume'] = $('#cellVolume').val(); 
      _this.setSliderValue('cellVolume',argument['cellVolume']); 
      PubSub.publish(events.CELL_VOLUME_CHANGE, argument);
    });
    
    
    
    $('#syncCameras').change(function() {  
      var argument = {};
      argument["syncCameras"]= ($('#syncCameras').is(':checked')) ? true : false ;
      PubSub.publish(events.MOTIF_CAMERASYNC_CHANGE, argument);           
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
    
    $storeState.on('click', function() {
      PubSub.publish(events.STORE_PROJECT, argument);   
    });
    
     

    this.restrictionEvents = []; */
     
  };
    
    Menu.prototype.resetProgressBar = function(title) {
        //$progressBar.progressbar('value', 0);
        $progressBarWrapper.find('.progressLabel').text(title);
        //$progressN = 100 / (parseFloat(taskNum));
        $progressBarWrapper.css('display','block');
    }
    Menu.prototype.progressBarFinish = function(){
        /*var val;
        val = parseFloat($progressBar.progressbar('value')) + $progressN;
        $progressBar.progressbar("value", val);*/
        $progressBarWrapper.fadeOut('slow');
    }
    Menu.prototype.editProgressTitle = function(title){
        $progressBar.siblings('.progressLabel').text(title);
    }
    Menu.prototype.getLatticeParameters = function() {
        var parameters = {};
        _.each(latticeParameters, function($latticeParameter, k) {
            if( k !== 'repeatX' && k !== 'repeatY' && k !== 'repeatZ'){
                parameters[k] = $latticeParameter.val();
                LastLatticeParameters[k] = parameters[k];
            }
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
        var sliderName = name+'Slider';
        $('#'+sliderName).slider('option','disabled',action);
    }; 
    Menu.prototype.setSliderMin = function(name, val) {
        var sliderName = name+'Slider';
        $('#'+sliderName).slider('option','min',val);
    };
    Menu.prototype.setSliderMax = function(name, val) {
        var sliderName = name+'Slider';
        $('#'+sliderName).slider('option','max',val);
    };
    Menu.prototype.setSliderStep = function(name, val){
        var sliderName = name+'Slider';
        $('#'+sliderName).slider('option','step',val);
    }
    Menu.prototype.forceToLooseEvent = function(name) {
        var sliderName = name+'Slider';
        $('#'+sliderName).trigger($.Event( "mouseup", { which: 1 } ));
    };
    Menu.prototype.setSliderValue = function(name, val) {
        var sliderName = name+'Slider';
        jQuery('#'+sliderName).slider('value',val);
        jQuery('#'+name).val(val);
    };
    Menu.prototype.setSlider = function(inputName,value,min,max,step,eventIn) {
        var _this = this;
        var sliderName = '#'+inputName+'Slider' ;
        jQuery(sliderName).slider({
            value: value,
            min: min,
            max: max,
            step: step,
            animate: true,
            slide: function(event, ui){
                var argument = {};
                argument[inputName] = ui.value;
                PubSub.publish(eventIn, argument);
                jQuery('#'+inputName).val(ui.value);
            }
        });
    };
    Menu.prototype.toggleExtraParameter = function(choice, action){
        if (choice === 'i') $millerI.parent().parent().parent().css('display',action);
        else $millerT.parent().parent().parent().css('display',action);
    }
    Menu.prototype.editPlaneInputs = function(argument){
        _.each(planeParameters, function($parameter, k) {
            switch(k){
                case 'millerH':
                    $parameter.val(argument['millerH']);
                    break;

                case 'millerK':
                    $parameter.val(argument['millerK']);
                    break;

                case 'millerL':
                    $parameter.val(argument['millerL']);
                    break;

                case 'millerI':
                    if(argument['millerI'] !== undefined) $parameter.val(argument['millerI']);
                    break;

                case 'planeColor':
                    $parameter.spectrum('set',argument['planeColor']);
                    $parameter.children().css('background',argument['planeColor']);
                    break;

                case 'planeOpacity':
                    $parameter.selectpicker('val',argument['planeOpacity']);
                    break;

                case 'planeName':
                    $parameter.val(argument['planeName']);
                    break;
                default: break;
            }
        });
    };
    Menu.prototype.disablePlaneInputs = function(argument){
        _.each(planeParameters, function($parameter, k) {
            if (argument[k] !== undefined){
                switch(k){
                    case 'millerH':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'millerK':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'millerL':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'millerI':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'planeColor':
                        if(argument[k]) $parameter.spectrum("disable");
                        else $parameter.spectrum("enable");
                        break;

                    case 'planeOpacity':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'planeName':
                        $parameter.prop('disabled', argument[k]);
                        break;
                    default: break;
                }
            }
        });
    }
    Menu.prototype.disablePlaneButtons = function(argument){
        _.each(planeButtons, function($parameter, k) {
            if (argument[k] !== undefined){
                if (argument[k] === true) {
                    $parameter.children().css('background','#2F3238');
                    $parameter.addClass('disabled');
                }
                else {
                    $parameter.children().css('background','#15171b');
                    $parameter.children().hover(
                        function(){$parameter.children().css('background','#08090b');},
                        function(){$parameter.children().css('background','#15171b');}
                    );
                    $parameter.removeClass('disabled');
                }
            }
        });
    }
    Menu.prototype.disableDirectionButtons = function(argument){
        _.each(directionButtons, function($parameter, k) {
            if (argument[k] !== undefined){
                if (argument[k] === true) {
                    $parameter.children().css('background','#2F3238');
                    $parameter.addClass('disabled');
                }
                else {
                    $parameter.children().css('background','#15171b');
                    $parameter.children().hover(
                        function(){$parameter.children().css('background','#08090b');},
                        function(){$parameter.children().css('background','#15171b');}
                    );
                    $parameter.removeClass('disabled');
                }
            }
        });
    }
    Menu.prototype.editSavedPlane = function(argument){
        var parameters;
        if ( argument['i'] === undefined ) parameters = '['+argument['h']+','+argument['k']+','+argument['l']+']';
        else parameters = '['+argument['h']+','+argument['k']+','+argument['l']+','+argument['i']+']';
        switch(argument['action']){
            case 'save':
                $planesTable.find('tbody').append('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="planeButton"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="pnd-serial">'+parameters+'</td><td class="pnd-name">'+argument['name']+'</td><td class="pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                $planesTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;  

            case 'edit':
                $planesTable.find('#'+argument['oldId']).replaceWith('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="planeButton"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="pnd-serial">'+parameters+'</td><td class="pnd-name">'+argument['name']+'</td><td class="pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                $planesTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;
            
            case 'delete':
                $planesTable.find('#'+argument['oldId']).remove();
                break;
            
        }
        if ( (argument['action']==='save') | (argument['action']==='edit') ){
            $planesTable.find('#'+argument['id']).find('.planeButton').on('click', function(){
                PubSub.publish(events.PLANE_SELECTION, argument['id']);
                $planesTable.find('#'+argument['id']).find('.planeButton').css('background','#08090b');
                $planesTable.find('#'+argument['id']).find('.planeButton').css('border','#08090b');
                if ($planesTable.find('#'+argument['id']).find('.planeButton').hasClass('active')){
                    $planesTable.find('.planeButton').removeClass('active');
                }
                else {
                    $planesTable.find('.planeButton').removeClass('active');
                    $planesTable.find('#'+argument['id']).find('.planeButton').addClass('active');
                }
            });
            $planesTable.find('#'+argument['id']).find('.planeButton').hover(
                function(){
                    $planesTable.find('#'+argument['id']).find('.planeButton').css('background','#08090b');
                    $planesTable.find('#'+argument['id']).find('.planeButton').css('border','#08090b');
                },
                function(){
                    if (!($planesTable.find('#'+argument['id']).find('.planeButton').hasClass('active'))){
                        $planesTable.find('#'+argument['id']).find('.planeButton').css('background','#1f2227');
                        $planesTable.find('#'+argument['id']).find('.planeButton').css('border','#1f2227');
                    }
                }
            );
        }
        
        if ($planesTable.find('tr').length > 0) $planesTable.css('display','block');
        else $planesTable.css('display','none');
    };
    Menu.prototype.editDirectionInputs = function(argument){
        _.each(directionParameters, function($parameter, k) {
            switch(k){
                case 'millerU':
                    $parameter.val(argument['millerU']);
                    break;

                case 'millerV':
                    $parameter.val(argument['millerV']);
                    break;

                case 'millerW':
                    $parameter.val(argument['millerW']);
                    break;

                case 'millerT':
                    if(argument['t'] !== undefined) $parameter.val(argument['millerT']);
                    break;

                case 'directionColor':
                    $parameter.spectrum('set',argument['directionColor']);
                    $parameter.children().css('background',argument['directionColor']);
                    break;

                case 'dirRadius':
                    $parameter.selectpicker('val',argument['dirRadius']);
                    break;

                case 'directionName':
                    $parameter.val(argument['directionName']);
                    break;
                default: break;
            }
        });
    };
    Menu.prototype.disableDirectionInputs = function(argument){
        _.each(directionParameters, function($parameter, k) {
            if (argument[k] !== undefined){
                switch(k){
                    case 'millerU':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'millerV':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'millerW':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'millerT':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'directionColor':
                        if(argument[k]) $parameter.spectrum("disable");
                        else $parameter.spectrum("enable");
                        break;

                    case 'dirRadius':
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'directionName':
                        $parameter.prop('disabled', argument[k]);
                        break;
                    default: break;
                }
            }
        });   
    }
    Menu.prototype.editSavedDirection = function(argument){
        var parameters;
        if ( argument['t'] === undefined ) parameters = '['+argument['u']+','+argument['v']+','+argument['w']+']';
        else parameters = '['+argument['u']+','+argument['v']+','+argument['w']+','+argument['t']+']';
        switch(argument['action']){
            case 'save':
                $directionTable.find('tbody').append('<tr id="'+ argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="directionButton"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="pnd-serial">'+parameters+'</td><td class="pnd-name">'+argument['name']+'</td><td class="pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                $directionTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;  

            case 'edit':
                $directionTable.find('#'+argument['oldId']).replaceWith('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="directionButton"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="pnd-serial">'+parameters+'</td><td class="pnd-name">'+argument['name']+'</td><td class="pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                $directionTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;
            
            case 'delete':
                $directionTable.find('#'+argument['oldId']).remove();
                break;
            
        }
        if ( (argument['action']==='save') | (argument['action']==='edit') ){
            $directionTable.find('#'+argument['id']).find('.directionButton').on('click', function(){
                PubSub.publish(events.DIRECTION_SELECTION, argument['id']);
                $directionTable.find('#'+argument['id']).find('.directionButton').css('background','#08090b');
                $directionTable.find('#'+argument['id']).find('.directionButton').css('border','#08090b');
                if ($directionTable.find('#'+argument['id']).find('.directionButton').hasClass('active')){
                    $directionTable.find('.directionButton').removeClass('active');
                }
                else {
                    $directionTable.find('.directionButton').removeClass('active');
                    $directionTable.find('#'+argument['id']).find('.directionButton').addClass('active');
                }
            });
            $directionTable.find('#'+argument['id']).find('.directionButton').hover(
                function(){
                    $directionTable.find('#'+argument['id']).find('.directionButton').css('background','#08090b');
                    $directionTable.find('#'+argument['id']).find('.directionButton').css('border','#08090b');
                },
                function(){
                    if (!($directionTable.find('#'+argument['id']).find('.directionButton').hasClass('active'))){
                        $directionTable.find('#'+argument['id']).find('.directionButton').css('background','#1f2227');
                        $directionTable.find('#'+argument['id']).find('.directionButton').css('border','#1f2227');
                    }
                }
            );
        }
        if ($directionTable.find('tr').length > 0) $directionTable.css('display','block');
        else $directionTable.css('display','none');
    };
    /*Menu.prototype.editSavedAtoms = function(argument){
        
        
        var backColor; //bg-dark-gray bg-light-gray bg-lighter-gray bg-light-purple
        var buttonState; //visible hidden
        var blankTD; //<td class="blank"></td>
        var chainTD; //<td class="chain"><img src="Images/chain-icon.png" class="img-responsive" alt=""/></td>
        var elementCode; //lowercase
        var elementName; //first cap
        var colSpan; //no, 2 , 3 colspan="3"
        var atomParameters;
        var buttonTangent; // <td class="btn-tangent"><a href="#"><img src="Images/tangent-icon.png" class="img-responsive" alt=""/></a></td> or <td></td> an exei mono vis,ele,eleserial
        
        var HTMLQuery = '<tr class="'+backColor+'"><td class="visibility"><a><img src="Images/'+buttonState+'-icon-sm.png" class="img-responsive" alt=""/></a></td>'+blankTD+chainTD+'<td class="element ch-'+elementCode+'">'+elementName+'</td><td class="element-serial" '+colSpan+'><a>'+atomParameters+'</a></td>'+buttonTangent+'</tr>';
        
        switch(argument['action']){
            case 'save':
                $atomTable.find('tbody').append(HTMLQuery);
                break;  

            case 'edit':
                $atomTable.find('#'+argument['oldId']).replaceWith(HTMLQuery);
                break;
            
            case 'delete':
                $atomTable.find('#'+argument['oldId']).remove();
                break;
            
        }
        if ( (argument['action']==='save') | (argument['action']==='edit') ){
            $atomTable.find('#'+argument['id']).find('.atomButton').on('click', function(){
                PubSub.publish(events.SAVED_ATOM_SELECTION, argument['id']);
                $atomTable.find('#'+argument['id']).find('.atomButton').css('background','#08090b');
                $atomTable.find('#'+argument['id']).find('.atomButton').css('border','#08090b');
                if ($atomTable.find('#'+argument['id']).find('.atomButton').hasClass('active')){
                    $atomTable.find('.atomButton').removeClass('active');
                }
                else {
                    $atomTable.find('.atomButton').removeClass('active');
                    $atomTable.find('#'+argument['id']).find('.atomButton').addClass('active');
                }
            });
            $atomTable.find('#'+argument['id']).find('.atomButton').hover(
                function(){
                    $atomTable.find('#'+argument['id']).find('.atomButton').css('background','#08090b');
                    $atomTable.find('#'+argument['id']).find('.atomButton').css('border','#08090b');
                },
                function(){
                    if (!($atomTable.find('#'+argument['id']).find('.atomButton').hasClass('active'))){
                        $atomTable.find('#'+argument['id']).find('.atomButton').css('background','#1f2227');
                        $atomTable.find('#'+argument['id']).find('.atomButton').css('border','#1f2227');
                    }
                }
            );
        }
        if ($atomTable.find('tr').length > 0) $atomTable.css('display','block');
        else $atomTable.css('display','none');
    }*/
    Menu.prototype.editMEInputs = function(argument){
        _.each(atomParameters, function($parameter, k) {
            if (argument[k] !== undefined){
                switch(k){
                    case 'atomColor':
                        $parameter.spectrum('set',argument['atomColor']);
                        $parameter.children().css('background',argument['atomColor']);
                        break;

                    case 'atomOpacity':
                        $('#atomOpacitySlider').slider('value',argument['atomOpacity']);
                        $parameter.val(argument['atomOpacity']);
                        break;

                    case 'atomTexture':
                        break;

                    case 'wireframe':
                        break;
                    
                    default: break;
                }
            }
        });
        _.each(motifInputs, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.val(argument[k]);
                $('#'+k+'Slider').slider('value',argument[k]);
            }
        }); 
        _.each(rotatingAngles, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.val(argument[k]);
            }
        });
        _.each(rotLables, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.text(argument[k]);
            }
        });
        _.each(cellManDimensions, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.val(argument[k]);
                $('#'+k+'Slider').slider('value',argument[k]);
            }
        });
        _.each(cellManAngles, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.val(argument[k]);
                $('#'+k+'Slider').slider('value',argument[k]);
            }
        });
        if (argument['atomPositioningXYZ'] !== undefined){
            if (argument['atomPositioningXYZ']) if (!($atomPositioningXYZ.hasClass('buttonPressed'))) $atomPositioningXYZ.trigger('click');
        }
        if (argument['atomPositioningABC'] !== undefined){
            if (argument['atomPositioningABC']) if (!($atomPositioningABC.hasClass('buttonPressed'))) $atomPositioningABC.trigger('click');
        }
        if (argument['padlock'] !== undefined){
            if (argument['padlock'] === true) $motifPadlock.find('a').removeClass('active');
            else $motifPadlock.find('a').addClass('active');
        }
        if (argument['tangency'] !== undefined){
            $tangency.trigger('click');
        }
        if (argument['atomName'] !== undefined){
            var newAtom = 'ch-' + argument['atomName'];
            var newAtomName = jQuery('.'+newAtom).html();
            console.log(newAtomName);
            $elementContainer.css('display','block');
            $elementContainer.find('a').removeAttr('class');
            $elementContainer.find('a').attr('class',newAtom+' ch');
            $elementContainer.find('a').html(newAtomName);
        }
        $tangentR.val(argument['tangentR']);
    }
    Menu.prototype.disableMEInputs = function(argument){
        _.each(atomParameters, function($parameter, k) {
            if (argument[k] !== undefined){
                switch(k){
                    case 'atomColor':
                        if(argument[k]) $parameter.spectrum("disable");
                        else $parameter.spectrum("enable");
                        break;

                    case 'atomOpacity':
                        $('#atomOpacitySlider').slider('option','disabled',argument[k]);
                        $parameter.prop('disabled', argument[k]);
                        break;

                    case 'atomTexture':
                        break;

                    case 'wireframe':
                        break;
                    
                    default: break;
                }
            }
        });
        _.each(motifInputs, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.prop('disabled', argument[k]);
                $('#'+k+'Slider').slider('option','disabled',argument[k]);
            }
        }); 
        _.each(rotatingAngles, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.prop('disabled', argument[k]);
            }
        });
        _.each(cellManDimensions, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.prop('disabled', argument[k]);
                $('#'+k+'Slider').slider('option','disabled',argument[k]);
            }
        });
        _.each(cellManAngles, function($parameter, k) {
            if (argument[k] !== undefined){
                $parameter.prop('disabled', argument[k]);
                $('#'+k+'Slider').slider('option','disabled',argument[k]);
            }
        });
        if (argument['atomPositioningXYZ'] !== undefined){
            if (argument['atomPositioningXYZ']) {
                $atomPositioningXYZ.addClass('disabled');
                $atomPositioningXYZ.trigger('click');
            }
            else {
                $atomPositioningXYZ.removeClass('disabled');
                $atomPositioningXYZ.trigger('click');
            }
        }
        if (argument['atomPositioningABC'] !== undefined){
            if (argument['atomPositioningABC']) {
                $atomPositioningABC.addClass('disabled');
                $atomPositioningABC.trigger('click');
            }
            else {
                $atomPositioningABC.removeClass('disabled');
                $atomPositioningABC.trigger('click');
            }
        }
        if (argument['tangency'] !== undefined){
            if (argument['tangency'] === true) {
                $tangency.children().css('background','#2F3238');
                $tangency.children().hover(
                    function(){},
                    function(){}
                );
                $tangency.addClass('disabled');
            }
            else {
                $tangency.children().css('background','#15171b');
                $tangency.children().hover(
                    function(){$tangency.children().css('background','#74629c');},
                    function(){$tangency.children().css('background','#15171b');}
                );
                $tangency.removeClass('disabled');
            }
        }
        if (argument['padlock'] !== undefined){
            if (argument['padlock'] === true) {
                $motifPadlock.children().css('cursor','not-allowed');
                $motifPadlock.children().hover(
                    function(){},
                    function(){}
                );
                $motifPadlock.addClass('disabled');
                $motifPadlock.find('a').removeAttr('data-toggle');
            }
            else {
                $motifPadlock.children().css('background','#15171b');
                $motifPadlock.children().hover(
                    function(){$motifPadlock.children().css('background','#08090b');},
                    function(){$motifPadlock.children().css('background','#15171b');}
                );
                $motifPadlock.removeClass('disabled');
                $motifPadlock.find('a').css('cursor','auto');
            }
        }
        $tangentR.prop('disabled', argument['tangentR']);
    }
    Menu.prototype.disableMEButtons = function(argument){
       _.each($atomButtons, function($parameter, k) {
            if (argument[k] !== undefined){
                if (argument[k] === true) {
                    $parameter.children().css('background','#2F3238');
                    $parameter.children().hover(
                        function(){},
                        function(){}
                    );
                    $parameter.addClass('disabled');
                    if (k === 'atomPalette') $parameter.children().removeAttr('data-toggle');
                }
                else {
                    $parameter.children().css('background','#15171b');
                    $parameter.children().hover(
                        function(){$parameter.children().css('background','#08090b');},
                        function(){$parameter.children().css('background','#15171b');}
                    );
                    $parameter.removeClass('disabled');
                    if (k === 'atomPalette') $parameter.children().attr('data-toggle','modal');
                }
            }
        });
    }
    Menu.prototype.disableRenderizationButtons = function(argument){
        _.each(renderizationMode, function($parameter, k) {
            if (argument[k] !== undefined){
                if (argument[k]){
                    $parameter.css('background','white');
                    $parameter.removeClass('active');
                    $parameter.addClass('disabled');
                }
            }
        });
    }
    Menu.prototype.onPlaneToggle = function(callback){
        PubSub.subscribe(events.PLANE_TOGGLE, callback);  
    };
    Menu.prototype.onDirectionToggle = function(callback){
        PubSub.subscribe(events.DIRECTION_TOGGLE, callback);  
    };
    Menu.prototype.onAtomToggle = function(callback){
        PubSub.subscribe(events.ATOM_TOGGLE, callback);  
    };
    Menu.prototype.onLatticePointsToggle = function(callback) {
        PubSub.subscribe(events.LATTICE_POINTS_TOGGLE, callback);  
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
    Menu.prototype.onManuallyCellVolumeChange = function(callback) {
        PubSub.subscribe(events.CELL_VOLUME_CHANGE, callback);
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
    Menu.prototype.setOculus = function(callback) { 
        PubSub.subscribe(events.OCULUS, callback);
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
    Menu.prototype.onLeapMotionSet = function(callback) { 
        PubSub.subscribe(events.LEAP_MOTION, callback);
    };
    Menu.prototype.onLeapTrackingSystemChange = function(callback) { 
        PubSub.subscribe(events.LEAP_TRACKING_SYSTEM, callback);
    };
    
  /*Menu.prototype.setLatticeRestrictions = function(restrictions) {
    var $body = jQuery('body');

    _.each(this.restrictionEvents, function(restriction) {
      $body.off('change', '#' + restriction.id, restriction.ev);
    });

    //jshint unused:false
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
                          
                          
                          //alert("The value "+rightValue+" you entered for "+pk+" is not valid.");
                          //left[pk].val(LastLatticeParameters[pk]);
                          //left[pk].trigger('change');   
                                
                                     
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
  };*/

  return Menu;
});
