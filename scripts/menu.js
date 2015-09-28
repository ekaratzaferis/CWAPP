/*global define*/
'use strict';

// Dependecies

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
    /* -----------------------
       Menu JS Local Variables
       ----------------------- */
    
        // Zoom Level [Working value = 0.78]
        var $zoom = 1;

        // ColorPicker Offset When we're using Zoom
        var $colorPickerUp = 0.13;
        var $colorPickerLeft = 0.08;
        var $colorPickerLeftMore = 0.18;
    
        // Temporary Value for the Atom Radius Slider
        var $tempValRadius = 0;
    
        // Hold last value in case of none acceptable entered value
        var LastLatticeParameters = []; 

        // Menu Size
        var $menuWidthOpen = 500;
        var $menuWidthClose = 83;
    
    
    
    /* --------------
       Modal Elements
       -------------- */
    
        var $bravaisModal = jQuery('.mh_bravais_lattice_block');
        var $periodicModal = jQuery('.ch');
    
        // Add Buttons
        var $bravaisLattice = jQuery('#add_lattice_btn');
        var $periodicTableButton = jQuery('#add_atom_btn');
    
    
    
    /* ---------------
       Inputs Elements
       --------------- */
    
        // All Check-Boxes used in the HTML
        var $icheck = jQuery('input.icheckbox, input.iradio');
    
        // Lattice Parameters [Lattice Tab]
        var $spinner = jQuery('.spinner');
        var $repeatX = jQuery('#repeatX');
        var $repeatY = jQuery('#repeatY');
        var $repeatZ = jQuery('#repeatZ');
        var $scaleX  = jQuery('#scaleX');
        var $scaleY  = jQuery('#scaleY');
        var $scaleZ  = jQuery('#scaleZ');
        var $alpha   = jQuery('#alpha');
        var $beta    = jQuery('#beta');
        var $gamma   = jQuery('#gamma');
    
        // Grade parameters [Lattice Tab]
        var $radius = jQuery('#radius');
        var $faceOpacity = jQuery('#faceOpacity');
        var $colorBorder = jQuery('#cube_color_border');
        var $colorFilled = jQuery('#cube_color_filled');
    
        // Plane parameters [P&D Tab]
        var $millerH = jQuery('#millerH');
        var $millerK = jQuery('#millerK');
        var $millerI = jQuery('#millerI');
        var $millerL = jQuery('#millerL');
        var $planeColor = jQuery('#planeColor');
        var $planeOpacity = jQuery('#planeOpacity');
        var $planeName = jQuery('#planeName');
    
        // Direction Parameters [P&D Tab]
        var $millerU = jQuery('#millerU');
        var $millerV = jQuery('#millerV');
        var $millerW = jQuery('#millerW');
        var $millerT = jQuery('#millerT');
        var $directionColor = jQuery('#directionColor');
        var $directionName = jQuery('#directionName');
        var $dirRadius = jQuery('#dirRadius');
        
        // Atom Parameters [Motif Tab]
        var $atomPosX = jQuery('#atomPosX');
        var $atomPosY = jQuery('#atomPosY');
        var $atomPosZ = jQuery('#atomPosZ');
        var $atomColor = jQuery('#atomColor');
        var $atomOpacity = jQuery('#atomOpacity');
        var $tangentR = jQuery('#tangentR');
        var $rotAngleTheta = jQuery('#rotAngleTheta');
        var $rotAnglePhi = jQuery('#rotAnglePhi'); 
    
        // Lattice Parameters [Motif Tab]
        var $Aa = jQuery('#Aa');
        var $Ab = jQuery('#Ab');
        var $Ac = jQuery('#Ac');
        var $cellAlpha = jQuery('#cellAlpha');
        var $cellBeta = jQuery('#cellBeta');
        var $cellGamma = jQuery('#cellGamma');
    
        // [Visualization Tab]
        var $fogColor = jQuery('#fogColor');
        var $fogDensity = jQuery('#fogDensity');
        var $distortionOn = jQuery('#distortionOn');
        var $distortionOff = jQuery('#distortionOff');
        var $crystalScreenColor = jQuery('#crystalScreenColor');
        var $cellScreenColor = jQuery('#cellScreenColor');
        var $motifXScreenColor = jQuery('#motifXScreenColor');
        var $motifYScreenColor = jQuery('#motifYScreenColor');
        var $motifZScreenColor = jQuery('#motifZScreenColor');
        var $stereoscopic = false;
        
    
    
    /* ---------------
       Button Elements
       --------------- */

        // [Menu Ribbon]
        /* Toggles */
        var $xyzAxes = jQuery("#xyzAxes");
        var $abcAxes = jQuery("#abcAxes");
        var $edges = jQuery("#edges");
        var $faces = jQuery("#faces");
        var $latticePoints = jQuery("#latticePoints");
        var $planes = jQuery("#planes");
        var $directions = jQuery("#directions");
        var $atomRadius = jQuery("#atomRadius");
        var $atomToggle = jQuery("#atomToggle");
        /* Tabs */
        var $controls_toggler = jQuery('#controls_toggler');
        var $motifMEButton = jQuery('#motifLI');
    
        // [P&D Tab]
        var $savePlane = jQuery('#savePlane');
        var $deletePlane = jQuery('#deletePlane');
        var $newPlane = jQuery('#newPlane');
        var $saveDirection = jQuery('#saveDirection');
        var $deleteDirection = jQuery('#deleteDirection');
        var $newDirection = jQuery('#newDirection');
    
        // [Motif Tab]
        var $atomPalette = jQuery('#atomPalette');
        var $previewAtomChanges = jQuery('.previewAtomChanges');
        var $saveAtomChanges = jQuery('.saveAtomChanges');
        var $deleteAtom = jQuery('#deleteAtom');
        var $tangency = jQuery('#tangency');
        var $atomPositioningXYZ = jQuery('#atomPositioningXYZ');
        var $atomPositioningABC = jQuery('#atomPositioningABC');
    
        // [Visualization Tab]
        var $sounds = jQuery('#sounds');
        var $lights = jQuery('#lights');
        var $fullScreen = jQuery('#fullScreen');
        var $leapMotion = $('#leapMotion');
        var $Classic = jQuery('#Classic');
        var $Subtracted = jQuery('#Subtracted');
        var $SolidVoid = jQuery('#SolidVoid');
        var $GradeLimited = jQuery('#GradeLimited');
        var $notepadButton = jQuery('#notesButton');
        var $crystalCamTargetOn = jQuery("#crystalCamTargetOn");
        var $crystalCamTargetOff = jQuery("#crystalCamTargetOff");
        var $anaglyph = jQuery('#anaglyph');
        var $oculus = jQuery('#oculus');
    
        // [Public Library]
        /* Save Online */
        var $alt_atn_toggler = jQuery('.btn_alternate_action_toggler');
        /* Save to Public Library */
        var $btn_form_toggler = jQuery('.btn_form_toggler');
    
        /* Padlocks */
        var $latticePadlock = jQuery('#latticePadlock');
        var $motifPadlock = jQuery('#motifPadlock');
    
        /* Sync Cameras */
        var $syncCameras = jQuery('#syncCameras');
    
    
    
    /* ---------------
       Other Selectors
       --------------- */
    
        // All custom scrollbars
        var $scrollBars = jQuery('.custom_scrollbar');
    
        // Tables
        var $planesTable = jQuery('#planesTable');
        var $directionTable = jQuery('#directionTable');
        var $atomTable = jQuery('#atomTable');
    
        // Toggable DIV from the Save Online Button [Public Library]
        var $alt_atn_target = jQuery('#cnt_alternate_actions');

        // Menu Body Selector
        var $main_controls = jQuery('#main_controls_container');
    
        // Element Tag [Motif Tab]
        var $elementContainer = jQuery('.element-symbol-container');
    
        // Rotating Labels [Motif Tab]
        var $rotAngleX = jQuery('#rotAngleX');
        var $rotAngleY = jQuery('#rotAngleY');
        var $rotAngleZ = jQuery('#rotAngleZ');
    
        // Notepad DIVs
        var $notes = jQuery('#notes');
        var $notepad = jQuery('#noteWrapper');
    
        // Progress Bar
        var $progressBarWrapper = jQuery('#progressBarWrapper');
    
        // Canvasses
        var $screenWrapper = jQuery('#screenWrapper');
        var $appContainer = jQuery("#app-container");
    
    
    
    /* ----------------------
       Unimplemented Elements
       ---------------------- */
        var $atomTexture = jQuery('#atomTexture');
        var $wireframe = jQuery('#wireframe');
    

    
    /* ---------------------------
       Organize Elements to Arrays
       --------------------------- */
    
        // Toggle Buttons [Menu Ribbon]
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
        
        // [Lattice Tab]
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
        var gradeParameters = {
            'radius': $radius,
            'faceOpacity': $faceOpacity
        };
    
        // [P&D Tab]
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
    
        // [Motif Tab]
        var $atomButtons = {
            'atomPalette': $atomPalette,
            'previewAtomChanges': $previewAtomChanges,
            'saveAtomChanges': $saveAtomChanges,
            'deleteAtom': $deleteAtom
        };
        var motifSliders = ['atomPosX', 'atomPosY', 'atomPosZ'];
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
        var cellManDimensionsSliders = ['Aa', 'Ab', 'Ac'];
        var cellManAnglesSliders = ['cellAlpha', 'cellBeta', 'cellGamma'];
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
        var rotatingAngles = {
            'rotAngleTheta' : $rotAngleTheta,
            'rotAnglePhi' : $rotAnglePhi 
        };
        var rotLables = {
            'rotAngleX' : $rotAngleX,
            'rotAngleY' : $rotAngleY,
            'rotAngleZ' : $rotAngleZ
        }

        // [Visualization Tab]
        var renderizationMode = {
            'Classic': $Classic,
            'Subtracted': $Subtracted,
            'SolidVoid': $SolidVoid,
            'gradeLimited': $GradeLimited
        }
    
        // ColorPickers
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
    
    
    
    /* ------------------------
       List of Published Events
       ------------------------ */
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
    
    
    
    /* ------------------------
       List of Lattice Names
       ------------------------ */
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

    
    
    /* ---------
       Functions
       --------- */
    
        function app_container(){
            // Calculate current screen size.
            var screen_width = jQuery(window).width();
            var screen_height = jQuery(window).height();
            
            // Calculate canvas resizing amount.
            var x = 0;
            if ($main_controls.hasClass('controls-open')) x = ($menuWidthOpen)*($zoom);
            else x = ($menuWidthClose)*($zoom);

            // Resize canvasses and slowly fade in.
            $screenWrapper.width(screen_width-x);
            $screenWrapper.fadeIn(800);
            $appContainer.width(screen_width-x);
            $progressBarWrapper.width(screen_width);
        };

        function init_dimensions(){
            jQuery('.mh_controls').matchHeight();
            jQuery('.mh_pnd_para_box').matchHeight();
            jQuery('.mh_lattice_length_para_box').matchHeight();
            jQuery('.mh_bravais_lattice_block').matchHeight({byRow: false});
            jQuery('.mh_bravais_lattice_block').find('.bravais-lattice-block').matchHeight({byRow: false});
            jQuery('.mh_bravais_lattice_block').find('.block-image').matchHeight({byRow: false});
        };
    
        function Menu() {

            // Local Variables
            var _this = this;
            var argument;
        
            
        /* ---------------------
           ScrollBars and Window
           --------------------- */
            $scrollBars.mCustomScrollbar();
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
            
            // Progress Bar
            var screen_width = jQuery(window).width();
            var screen_height = jQuery('.main-controls-container').height();
            $progressBarWrapper.width(screen_width);
            $progressBarWrapper.height(screen_height);

        
        /* ------
           Inputs
           ------ */
            jQuery($icheck).iCheck({
                checkboxClass: 'icheckbox_square-grey',
                radioClass: 'iradio_square-grey'
            });
            $icheck.on('ifChecked',function(){
                var name = jQuery(this).attr('name');
                switch(name){
                    case 'gridCheckButton':
                        argument ={};
                        argument[name] = true;
                        PubSub.publish(events.GRADE_CHOICES, argument);
                        $edges.parent().addClass('lightThemeActive');
                        break;

                    case 'faceCheckButton':
                        argument ={};
                        argument[name] = true;
                        PubSub.publish(events.GRADE_CHOICES, argument);
                        $faces.parent().addClass('lightThemeActive');
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
                        $edges.parent().removeClass('lightThemeActive');
                        break;

                    case 'faceCheckButton':
                        argument ={};
                        argument[name] = false;
                        PubSub.publish(events.GRADE_CHOICES, argument);
                        $faces.parent().removeClass('lightThemeActive');
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
            
            /* [Lattice Tab] */
            $spinner.spinner({
                min: 1,
                spin: function(event,ui){
                    argument = {};
                    argument[jQuery(this).attr('id')] = ui.value;
                    PubSub.publish(events.LATTICE_PARAMETER_CHANGE, argument);
                }
            });
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
            _.each(lengthSlider, function(name) {
               _this.setSlider(name,1,1,100,0.01,events.LATTICE_PARAMETER_CHANGE); 
            });
            _.each(angleSliders, function(name) {
                _this.setSlider(name,90,1,180,1,events.LATTICE_PARAMETER_CHANGE);
            });
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

            /* [P&D Tab] */
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

            /* [Motif Tab] */
            $atomTable.css('display','none');
            _this.setSlider('atomOpacity',10,1,10,0.1,events.ATOM_PARAMETER_CHANGE);
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
                _this.setSlider(name,0.53,0.53,10.000,0.001,events.AXYZ_CHANGE);
                _this.setOnOffSlider(name,true);
            }); 
            _.each(cellManAnglesSliders, function(name) { 
                _this.setSlider(name,90,2,178,0.1, events.MAN_ANGLE_CHANGE); 
                _this.setOnOffSlider(name,true);
            });
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
                _this.setSlider(name,0,-20.000,20.000,0.001, events.ATOM_POSITION_CHANGE); 
            });
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

            /* [Visualization Tab] */
            $fogDensity.val(1);
            _this.setSlider('fogDensity',5,1,10,0.1,events.FOG_PARAMETER_CHANGE);
            
            /* [Public Library Tab] */
            
            
            
        /* -----------------
           On Click Handlers
           ----------------- */

            /* [Menu] */
            $motifMEButton.tooltip({
                container : 'body',
                trigger: 'manual',
                placement: 'left',
                title: 'You have to choose a Lattice before opening the Motif Tab'
            }); 
            _.each(toggles, function($parameter, k){
                var title;
                switch(k){
                    case 'xyzAxes':
                        $parameter.parent().toggleClass('lightThemeActive');
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
                        $parameter.parent().toggleClass('lightThemeActive');
                        title = 'Lattice Points';
                        break;
                    case 'directions':
                        $parameter.parent().toggleClass('lightThemeActive');
                        title = 'Directions';
                        break;
                    case 'planes':
                        $parameter.parent().toggleClass('lightThemeActive');
                        title = 'Planes';
                        break;
                    case 'atomToggle':
                        title = 'Atoms';
                        break;
                }
                $parameter.parent().tooltip({
                    container : 'body',
                    trigger: 'hover', 
                    title: title
                });
            });
            $xyzAxes.click(function() {
                argument = {};
                if (!($xyzAxes.parent().hasClass('lightThemeActive'))) argument['xyzAxes'] = true;
                else argument['xyzAxes'] = false;
                $xyzAxes.parent().toggleClass('lightThemeActive');
                PubSub.publish(events.AXIS_MODE, argument);
            });
            $abcAxes.click(function() {
                argument = {};
                if (!($abcAxes.parent().hasClass('lightThemeActive'))) argument['abcAxes'] = true;
                else argument['abcAxes'] = false;
                $abcAxes.parent().toggleClass('lightThemeActive');
                PubSub.publish(events.AXIS_MODE, argument);
            });
            $edges.click(function() {
                $edges.parent().toggleClass('lightThemeActive');
                jQuery('[name=gridCheckButton]').iCheck('toggle');
            });  
            $faces.click(function() {
                $faces.parent().toggleClass('lightThemeActive');
                jQuery('[name=faceCheckButton]').iCheck('toggle');
            }); 
            $latticePoints.parent().click(function() {
                argument = {};
                if (!($latticePoints.parent().hasClass('lightThemeActive'))) argument['latticePoints'] = true;
                else argument['latticePoints'] = false;
                $latticePoints.parent().toggleClass('lightThemeActive');
                PubSub.publish(events.LATTICE_POINTS_TOGGLE, argument);
            });
            $planes.click(function() {
                argument = {};
                if (!($planes.parent().hasClass('lightThemeActive'))) argument['planeToggle'] = true;
                else argument['planeToggle'] = false;
                $planes.parent().toggleClass('lightThemeActive');
                PubSub.publish(events.PLANE_TOGGLE, argument);
            });  
            $directions.click(function() {
                argument = {};
                if (!($directions.parent().hasClass('lightThemeActive'))) argument['directionToggle'] = true;
                else argument['directionToggle'] = false;
                $directions.parent().toggleClass('lightThemeActive');
                PubSub.publish(events.DIRECTION_TOGGLE, argument);
            });
            $atomToggle.click(function() {
                argument = {};
                if (!($atomToggle.parent().hasClass('lightThemeActive'))) argument['atomToggle'] = true;
                else argument['atomToggle'] = false;
                $atomToggle.parent().toggleClass('lightThemeActive');
                PubSub.publish(events.ATOM_TOGGLE, argument);
            });
            $atomRadius.parent().tooltip({
                container : 'body',
                trigger: 'manual',
                title: 'Atom Radius',
                html: true
            });
            $atomRadius.parent().click(function(){
                    if( $atomRadius.parent().hasClass('lightThemeActive') ){
                        $atomRadius.parent().removeClass('lightThemeActive');
                        $atomRadius.parent().tooltip('hide').attr('data-original-title', 'Atom Radius').tooltip('fixTitle');
                    }
                    else{
                        $atomRadius.parent().addClass('lightThemeActive');
                        $atomRadius.parent().tooltip('hide').attr('data-original-title', '<div id="customSlider">Atom Radius</div><br/><div class="slider-control slider-control-sm theme-dark"><div id="atomRadiusSlider"></div></div>').tooltip('fixTitle');
                        setTimeout(function() {
                            $atomRadius.parent().tooltip("show");
                        }, 250);
                        setTimeout(function() {
                            jQuery('.tooltip-inner').css('background', '#2c2e33');
                            jQuery('.tooltip-inner').css('color', '#fff');
                            jQuery('.tooltip-inner').siblings().css('border-left-color', '#2c2e33');
                            _this.setSlider('atomRadius',$tempValRadius,1,10,0.2,events.CHANGE_CRYSTAL_ATOM_RADIUS);
                        }, 250);
                    }
            });
            $atomRadius.hover(
                function(){
                    if (! ($atomRadius.parent().hasClass('lightThemeActive'))) {
                        $atomRadius.parent().tooltip('show');
                        jQuery('.tooltip-inner').css('background', '#fff');
                        jQuery('.tooltip-inner').css('color', '#473473');
                        jQuery('.tooltip-inner').siblings().css('border-left-color', '#fff');
                    }
                },
                function(){
                    if (! ($atomRadius.parent().hasClass('lightThemeActive'))) $atomRadius.parent().tooltip('hide');
                }
            );
            
            // Handle Motif access without a chosen Lattice
            $motifMEButton.on('click',function(){
                if ( jQuery('#selected_lattice').html() === 'Choose a Lattice' ) {
                    $motifMEButton.tooltip('show');
                    setTimeout(function(){
                        $motifMEButton.tooltip('hide');
                    }, 2500);
                }
            });
            $controls_toggler.on('click', function(){
                if ($main_controls.hasClass('controls-open'))
                {
                    $controls_toggler.find('.img-close').fadeOut('fast', function()
                    {
                        $controls_toggler.find('.img-open').fadeIn('fast')
                    });
                    $screenWrapper.fadeOut('slow');
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
                    $screenWrapper.fadeOut('slow');
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
                    if (!(( jQuery('#selected_lattice').html() === 'Choose a Lattice' ) && (jQuery(this).attr('aria-controls') === 'scrn_motif'))) {
                        $controls_toggler.find('.img-open').fadeOut('fast', function()
                        {
                            $controls_toggler.find('.img-close').fadeIn('fast')
                        });
                        if (! ($main_controls.hasClass('controls-open')) ) {
                            $screenWrapper.fadeOut('slow');
                            $main_controls.animate({'right': '0'}, 500, function()
                            {
                                $main_controls.removeClass('controls-close');
                                $main_controls.addClass('controls-open');
                                window.dispatchEvent(new Event('resize'));
                            });
                        }
                    } 
                }
            });

            /* [Lattice Tab] */
            $latticePadlock.on('click', function() {
                argument = {};
                if ($latticePadlock.children().hasClass('active')) argument["padlock"] = true;
                else argument["padlock"] = false;
                PubSub.publish(events.SET_PADLOCK, argument);          
            });

            /* [P&D Tab] */
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
            
            /* [Motif Tab] */
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
            $tangency.on('click',function(){
                if ( !($tangency.parent().hasClass('disabled')) ){
                    argument = {};
                    argument["button"]=this.id;
                    if (!($tangency.hasClass('purpleThemeActive'))) argument['tangency'] = true;
                    else argument['tangency'] = false;
                    $tangency.parent().toggleClass('purpleThemeActive');
                    PubSub.publish(events.ATOM_TANGENCY_CHANGE, argument);
                }
            });
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
            $deleteAtom.on('click', function(){
                if (!($deleteAtom.hasClass('disabled'))){
                    argument = {};
                    argument["button"] = 'deleteAtom';
                }
                PubSub.publish(events.ATOM_SUBMIT, argument);
            });
            $atomPositioningXYZ.on('click', function() {
                argument = {};  
                if (!($atomPositioningXYZ.hasClass('disabled'))){ 
                    if (!($atomPositioningXYZ.hasClass('buttonPressed'))){
                        $atomPositioningXYZ.addClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-light');
                        $atomPositioningXYZ.addClass('btn-purple');
                        $atomPositioningABC.removeClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-purple');
                        $atomPositioningABC.addClass('btn-light');
                        argument['xyz'] = true;
                    }
                    else{  
                        $atomPositioningXYZ.removeClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-purple');
                        $atomPositioningXYZ.addClass('btn-light');
                        $atomPositioningABC.addClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-light');
                        $atomPositioningABC.addClass('btn-purple');
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
                        $atomPositioningABC.addClass('btn-purple');
                        $atomPositioningXYZ.removeClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-purple');
                        $atomPositioningXYZ.addClass('btn-light');
                        argument['abc'] = true;
                    }
                    else{
                        $atomPositioningABC.removeClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-purple');
                        $atomPositioningABC.addClass('btn-light');
                        $atomPositioningXYZ.addClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-light');
                        $atomPositioningXYZ.addClass('btn-purple');
                        argument['xyz'] = true;
                    }
                    PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, argument);
                }
            });

            /* [Visualization Tab] */
            $fogDensity.on('change',function(){
                argument = {}; 
                argument['fogDensity'] = $fogDensity.val();
                PubSub.publish(events.FOG_PARAMETER_CHANGE, argument);
            });
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
            $fullScreen.click(function(){
                var argument = {};
                PubSub.publish(events.FULL_SCREEN_APP, argument);
            }); 
            $leapMotion.change(function() {  
                var argument = {};
                argument["leap"]= ($leapMotion.hasClass('active')) ? true : false ;
                PubSub.publish(events.LEAP_MOTION, argument);           
            });
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
            $notepad.draggable({
                scroll: false,
                handle: '#noteBar'
            });
            $notepad.find('#notes').on('focus',function(){
                jQuery(this).attr('contenteditable','true');
            });
            $notepad.resizable();
            $notepad.find('.mCSB_1_scrollbar_vertical').css('display','block');
            $notepad.find('img').on('click',function(){
                $notepadButton.parent().addClass('btn-light');
                $notepadButton.parent().removeClass('btn-purple');
                $notepad.css('display','none');
            });
            $notepadButton.on('click',function(){
                $notepadButton.parent().removeClass('btn-light');
                $notepadButton.parent().addClass('btn-purple');
                $notepad.css('display','block');
            });
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
            
            /* [Public Library Tab] */
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
            
            /* [Modals] */
            $bravaisModal.on('click',function(){
                $bravaisModal.removeClass('selected');
                jQuery(this).addClass('selected');
            });
            $bravaisLattice.on('click', function() {
                // Read selected Lattice.
                var selected = jQuery('.mh_bravais_lattice_block.selected');
                if (selected.length > 0) {
                    jQuery('#selected_lattice').text(latticeNames[selected.attr('id')]);
                    PubSub.publish(events.LATTICE_CHANGE,selected.attr('id'));
                    // Enable Motif Tab.
                    $motifMEButton.find('a').attr('href','#scrn_motif');
                }
            });   
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
    
    
    
    /* --------------------
       Prototypes - Editors
       -------------------- */
    
        Menu.prototype.resetProgressBar = function(title) {
            $progressBarWrapper.find('.progressLabel').text(title);
            $progressBarWrapper.css('display','block');
        }
        Menu.prototype.progressBarFinish = function(){
            $progressBarWrapper.fadeOut('slow');
        }
        Menu.prototype.editProgressTitle = function(title){
            $progressBar.siblings('.progressLabel').text(title);
        }
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
                },
                stop: function(){
                    if (sliderName === '#atomRadiusSlider') {
                        $atomRadius.parent().removeClass('lightThemeActive');
                        $tempValRadius = $atomRadius.val();
                        $atomRadius.parent().tooltip('hide').attr('data-original-title', 'Atom Radius').tooltip('fixTitle');
                    }
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
        Menu.prototype.getPlaneInputs = function(){
            var argument = {};
            _.each(planeParameters, function($parameter, k) {
                switch(k){
                    case 'millerI':
                        if($parameter !== undefined) argument[k] = $parameter.val();
                        break;

                    case 'planeColor':
                        argument['planeColor'] = $parameter.spectrum('get').toHexString();
                        break;

                    case 'planeOpacity':
                        argument['planeOpacity'] = $parameter.selectpicker('val');
                        break;
                        
                    default: 
                        argument[k] = $parameter.val();
                        break;
                }
            });
            return argument;
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
                    if (argument[k] === true) $parameter.addClass('disabled');
                    else $parameter.removeClass('disabled');
                }
            });
        }
        Menu.prototype.disableDirectionButtons = function(argument){
            _.each(directionButtons, function($parameter, k) {
                if (argument[k] !== undefined){
                    if (argument[k] === true) $parameter.addClass('disabled');
                    else $parameter.removeClass('disabled');
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
                $planesTable.find('#'+argument['id']).on('click',function(){console.log('asd');});
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
        Menu.prototype.getDirectionInputs = function(argument){
            var argument = {};
            _.each(directionParameters, function($parameter, k) {
                switch(k){
                        
                    case 'millerT':
                        if($parameter !== undefined) argument[k] = $parameter.val();
                        break;

                    case 'directionColor':
                        argument['directionColor'] = $parameter.spectrum('get').toHexString();
                        break;

                    case 'dirRadius':
                        argument['dirRadius'] = $parameter.selectpicker('val');
                        break;
                        
                    default: 
                        argument[k] = $parameter.val();
                        break;
                }
            });
            return argument;
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
        Menu.prototype.editSavedAtom = function(argument){

            //bg-dark-gray bg-light-gray bg-lighter-gray bg-light-purple
            var backColor = 'bg-light-gray';
            //visible hidden
            var eyeButton = 'hidden';
            //<td class="blank"></td>
            var blankTD = '';
            //<td class="chain"><img src="Images/chain-icon.png" class="img-responsive" alt=""/></td>
            var chainTD = '';
            //Lowercase
            var elementCode = '';
            //Capitalized
            var elementName;
            //'', 2 , 3 [colspan="3"]
            var colSpan = 'colspan="3"';
            var atomPos = '';
            // <td class="btn-tangent"><a href="#"><img src="Images/tangent-icon.png" class="img-responsive" alt=""/></a></td>
            var buttonTangent;

            _.each(argument, function($parameter, k){
                switch(k){
                    case 'backColor':
                        backColor = 'bg-' + $parameter;
                        break;
                    case 'eyeButton':
                        eyeButton = $parameter;
                        break;
                    case 'blankTD':
                        if ($parameter) blankTD = '<td class="blank"></td>';
                        break;
                    case 'chainTD':
                        if ($parameter) chainTD = '<td class="chain"><img src="Images/chain-icon.png" class="img-responsive" alt=""/></td>';
                        break;
                    case 'elementCode':
                        elementCode = $parameter;
                        break;
                    case 'elementName':
                        elementName = $parameter;
                        break;
                    case 'colSpan':
                        if ($parameter !== '') colSpan = 'colspan="'+$parameter+'"';
                        else colSpan = $parameter;
                        break;
                    case 'atomPos':
                        atomPos = $parameter;
                        break;
                    case 'buttonTangent':
                        if ($parameter) buttonTangent = '<td class="btn-tangent"><a href="#"><img src="Images/tangent-icon.png" class="img-responsive" alt=""/></a></td>';
                        break;
                }
            });

            var HTMLQuery = '<tr id="'+argument['id']+'" class="'+backColor+'"><td class="visibility atomButton"><a><img src="Images/'+eyeButton+'-icon-sm.png" class="img-responsive" alt=""/></a></td>'+blankTD+chainTD+'<td class="element ch-'+elementCode+'">'+elementName+'</td><td class="element-serial" '+colSpan+'><a>'+atomPos+'</a></td>'+buttonTangent+'</tr>';

            switch(argument['action']){
                case 'save':
                    $atomTable.find('tbody').append(HTMLQuery);
                    break;  

                case 'edit':
                    $atomTable.find('#'+argument['id']).replaceWith(HTMLQuery);
                    break;

                case 'delete':
                    $atomTable.find('#'+argument['id']).remove();
                    break;

            }
            if ( (argument['action']==='save') || (argument['action']==='edit') ){
                $atomTable.find('#'+argument['id']).find('.atomButton').on('click', function(){
                    PubSub.publish(events.SAVED_ATOM_SELECTION, argument['id']);
                    $atomTable.find('#'+argument['id']).find('.atomButton').find('a').css('background','#08090b');
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
                        $atomTable.find('#'+argument['id']).find('.atomButton').find('a').css('background','#08090b');
                    },
                    function(){
                        if (!($atomTable.find('#'+argument['id']).find('.atomButton').hasClass('active'))){
                            $atomTable.find('#'+argument['id']).find('.atomButton').find('a').css('background','#1f2227');
                        }
                    }
                );
            }
            if ($atomTable.find('tr').length > 0) $atomTable.css('display','block');
            else $atomTable.css('display','none');
        }
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
                if (!($atomPositioningXYZ.hasClass('disabled'))){ 
                    if (!($atomPositioningXYZ.hasClass('buttonPressed'))){
                        $atomPositioningXYZ.addClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-light');
                        $atomPositioningXYZ.addClass('btn-purple');
                        $atomPositioningABC.removeClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-purple');
                        $atomPositioningABC.addClass('btn-light');
                    }
                    else{  
                        $atomPositioningXYZ.removeClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-purple');
                        $atomPositioningXYZ.addClass('btn-light');
                        $atomPositioningABC.addClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-light');
                        $atomPositioningABC.addClass('btn-purple');
                    } 
                }
            }
            if (argument['atomPositioningABC'] !== undefined){
                if (!($atomPositioningABC.hasClass('disabled'))){
                    if (!($atomPositioningABC.hasClass('buttonPressed'))){
                        $atomPositioningABC.addClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-light');
                        $atomPositioningABC.addClass('btn-purple');
                        $atomPositioningXYZ.removeClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-purple');
                        $atomPositioningXYZ.addClass('btn-light');
                    }
                    else{
                        $atomPositioningABC.removeClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-purple');
                        $atomPositioningABC.addClass('btn-light');
                        $atomPositioningXYZ.addClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-light');
                        $atomPositioningXYZ.addClass('btn-purple');
                    }
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
                $elementContainer.css('display','block');
                $elementContainer.find('a').removeAttr('class');
                $elementContainer.find('a').attr('class',newAtom+' ch');
                $elementContainer.find('a').html(newAtomName);
            }
            $tangentR.val(argument['tangentR']);
        }
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
            if (argument['atomPositioningXYZ'] !== undefined) $atomPositioningXYZ.toggleClass('disabled');
            if (argument['atomPositioningABC'] !== undefined) $atomPositioningABC.toggleClass('disabled');
            if (argument['tangency'] !== undefined){
                $tangency.parent().toggleClass('disabled');
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
                        $parameter.addClass('disabled');
                        if (k === 'atomPalette') $parameter.children().removeAttr('data-toggle');
                    }
                    else {
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
   
    
    /* ------------------------
       Prototypes - Subscribers
       ------------------------ */
    
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
        Menu.prototype.padlockSet = function(callback) {
            PubSub.subscribe(events.SET_PADLOCK, callback);                             
        }
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
