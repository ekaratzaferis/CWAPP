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
    
        // Hold last value in case of none acceptable entered value
        var LastLatticeParameters = []; 

        // Menu Size
        var $menuWidthOpen = 520;
        var $menuWidthClose = 103;
    
    
    
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
        var $cellVolume = jQuery('#cellVolume');
    
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
        var $atomToggle = jQuery("#atomToggle");
        var $atomRadius = jQuery("#atomRadius");
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
        var $lockCameras = jQuery('#lockCameraIcon');
    
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
    
        // Atom Data
        var $atomsData;
    
        // Labels
        var $xLabel = jQuery('#xLabel');
        var $yLabel = jQuery('#yLabel');
        var $zLabel = jQuery('#zLabel');
        var $aLabel = jQuery('#aLabel');
        var $bLabel = jQuery('#bLabel');
        var $cLabel = jQuery('#cLabel');
    
        // All custom scrollbars
        var $scrollBars = jQuery('.custom_scrollbar');
    
        // Tables
        var $planesTable = jQuery('#planesTable');
        var $directionTable = jQuery('#directionTable');
        var $atomTable = jQuery('#atomTable');
        var $periodicTable = jQuery('.periodic-table');
    
        // Ionic values from periodic table
        var $ionicValues = jQuery('.property-block');
    
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
    
        // Logo
        var $appLogo = jQuery('#appLogo');
    
        // Menu Zoom
        var $menuZoom = jQuery('#menuZoom');
    
    
    /* ----------------------
       Unimplemented Elements
       ---------------------- */
        var $atomTexture = jQuery('#atomTexture');
        var $wireframe = jQuery('#wireframe');
    

    
    /* ---------------------------
       Organize Elements to Arrays
       --------------------------- */
    
        // Labels
        var labels = {
            'xLabel': $xLabel,
            'yLabel': $yLabel,
            'zLabel': $zLabel,
            'aLabel': $aLabel,
            'bLabel': $bLabel,
            'cLabel': $cLabel
        };
    
        // Toggle Buttons [Menu Ribbon]
        var toggles = {
            'xyzAxes': $xyzAxes,
            'abcAxes': $abcAxes,
            'edges': $edges,
            'faces': $faces,
            'latticePoints': $latticePoints,
            'planes': $planes,
            'directions': $directions,
            'atomToggle': $atomToggle,
            'atomRadius': $atomRadius
        };
        
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
        };

        // [Visualization Tab]
        var renderizationMode = {
            'Classic': $Classic,
            'Subtracted': $Subtracted,
            'SolidVoid': $SolidVoid,
            'gradeLimited': $GradeLimited
        };
    
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
            TANGENTR: 'menu.tangetnr',
            ATOM_VISIBILITY: 'menu.atom_visibility',
            PLANE_VISIBILITY: 'menu.plane_visibility',
            DIRECTION_VISIBILITY: 'menu.direction_visibility',
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
            $appLogo.width(screen_width-x);
            
            jQuery('.main-controls-inner').height(screen_height);
            jQuery('#atomRadiusSliderContainer').width((screen_width-x)*0.18);
            jQuery('#atomRadiusSliderContainer').css('left',(screen_width-x)*0.08);
        
            _.each(labels, function($parameter,k){
                $parameter.css('width',screen_width*0.015); 
                $parameter.css('height',screen_width*0.015); 
            });
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
            
            // Atom Ionic Values
            require(['atoms'], function(atomsInfo) {
                $atomsData = atomsInfo;
                _.each($periodicModal, function($parameter, k){
                   //console.log($parameter); 
                });
            });
            
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
            
            // Help (Tooltips)
            // P&D Tooltip
            jQuery('.coordinates-pnd-blocks-container').tooltip({
                container : 'body',
                trigger: 'manual',
                title: 'Help'
            });
            
            
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
               _this.setSlider(name,1,1,20,0.01,events.LATTICE_PARAMETER_CHANGE); 
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
                jQuery('#hexICoord').hide('slow');
                $planesTable.hide('slow');
                switch(k)
                {
                    case 'planeName':
                        $parameter.prop('disabled',true);
                        break;

                    case 'planeOpacity':
                        $parameter.html('<option>0</option><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option>');
                        $parameter.selectpicker();
                        $parameter.prop('disabled',true);
                        break;

                    case 'millerI':
                        $parameter.prop('disabled',true);
                        break;

                    case 'planeColor':
                        $parameter.spectrum("disable");
                        break;

                    default:
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
                jQuery('#hexTCoord').hide('slow');
                $directionTable.hide();
                switch(k)
                {
                    case 'directionName':
                        $parameter.prop('disabled',true);
                        break;

                    case 'dirRadius':
                        $parameter.html('<option>1</option><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option>');
                        $parameter.selectpicker();
                        $parameter.prop('disabled',true);
                        break;

                    case 'millerT':
                        $parameter.prop('disabled',true);
                        break;

                    case 'directionColor':
                        $parameter.spectrum("disable");
                        break;

                    default:
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
            $atomTable.hide();
            _this.setSlider('atomOpacity',10,1,10,0.1,events.ATOM_PARAMETER_CHANGE);
            _.each(atomParameters, function($parameter, k ) {
                switch(k){
                    case 'atomOpacity':
                        $parameter.prop('disabled',true);
                        _this.setOnOffSlider(k,true);
                        break;
                    case 'atomColor':
                        $parameter.spectrum("disable");
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
                $parameter.prop('disabled',true);
                $parameter.on('change', function() {
                    argument = {}; 
                    argument[k] = $parameter.val(); 
                    jQuery('#'+k+'Slider').slider('value',argument[k]); 
                    PubSub.publish(events.AXYZ_CHANGE, argument);
                });
            });
            _.each(cellManAngles, function($parameter, k) {
                $parameter.prop('disabled',true);
                $parameter.on('change', function() {
                    argument = {}; 
                    argument[k] = $parameter.val(); 
                    jQuery('#'+k+'Slider').slider('value',argument[k]); 
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
                $parameter.prop('disabled',true);
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
                _this.setOnOffSlider(name,true);
            });
            _.each(rotatingAngles, function($parameter, k) {
                $parameter.on('change', function() {
                    argument = {};
                    argument['rotAnglePhi'] =  $('#rotAnglePhi').val()
                    argument['rotAngleTheta'] =  $('#rotAngleTheta').val()
                    PubSub.publish(events.SET_ROTATING_ANGLE, argument);
                });
            });
            $tangentR.prop('disabled',true);
            $tangentR.on('change', function() {
                argument = {}; 
                argument['tangentR'] = $tangentR.val();  
                PubSub.publish(events.TANGENTR, argument);
            });
            $cellVolume.val(100);
            $cellVolume.on('change', function() {
                argument = {}; 
                argument['cellVolume'] = $cellVolume.val(); 
                jQuery('#cellVolumeSlider').slider('value',argument['cellVolume']);
                PubSub.publish(events.CELL_VOLUME_CHANGE, argument);
            });
            _this.setSlider('cellVolume',100,10,400,0.1,events.CELL_VOLUME_CHANGE);

            /* [Visualization Tab] */
            $fogDensity.val(1);
            _this.setSlider('fogDensity',5,1,10,0.1,events.FOG_PARAMETER_CHANGE);
            $menuZoom.html('<option>100%</option><option>90%</option><option>80%</option><option>70%</option>');
            $menuZoom.selectpicker();
            
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
                    case 'atomRadius':
                        title = 'Atom Radius';
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
                if ( !jQuery('#motifLI').hasClass('active') ){
                    $xLabel.toggleClass('hiddenLabel');
                    $yLabel.toggleClass('hiddenLabel');
                    $zLabel.toggleClass('hiddenLabel');
                }
            });
            $abcAxes.click(function() {
                argument = {};
                if (!($abcAxes.parent().hasClass('lightThemeActive'))) argument['abcAxes'] = true;
                else argument['abcAxes'] = false;
                $abcAxes.parent().toggleClass('lightThemeActive');
                PubSub.publish(events.AXIS_MODE, argument);
                if ( !jQuery('#motifLI').hasClass('active') ){
                    $aLabel.toggleClass('hiddenLabel');
                    $bLabel.toggleClass('hiddenLabel');
                    $cLabel.toggleClass('hiddenLabel');
                }
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
                if (!($planes.parent().hasClass('lightThemeActive'))) {
                    $planesTable.find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
                    argument['planeToggle'] = true;
                }
                else {
                    $planesTable.find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    argument['planeToggle'] = false;
                }
                $planes.parent().toggleClass('lightThemeActive');
                PubSub.publish(events.PLANE_TOGGLE, argument);
            });  
            $directions.click(function() {
                argument = {};
                if (!($directions.parent().hasClass('lightThemeActive'))) {
                    $directionTable.find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
                    argument['directionToggle'] = true;
                }
                else {
                    $directionTable.find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    argument['directionToggle'] = false;
                }
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
            _this.setSlider('atomRadius',10.2,1,10.2,0.2,events.CHANGE_CRYSTAL_ATOM_RADIUS);
            $atomRadius.click(function() {
                if (!$motifMEButton.hasClass('active')){
                    $atomRadius.parent().toggleClass('lightThemeActive');
                    if (jQuery('#atomRadiusSliderContainer').hasClass('disabled') ) jQuery('#atomRadiusSliderContainer').show('slow');
                    else jQuery('#atomRadiusSliderContainer').hide('slow');
                    jQuery('#atomRadiusSliderContainer').toggleClass('disabled');
                }
            });
            
            
            // Handle Motif access without a chosen Lattice
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
                    var openTab = jQuery('.main-tab-nav-container').find('li.active');
                    if (!(openTab.hasClass('disabled'))) openTab.find('a').trigger('click');  
                    else {
                        openTab = jQuery('.main-tab-nav-container').find('li:not(.disabled):first');
                        openTab.find('a').trigger('click');
                    }
                }

                return false;
            });
            jQuery('.control-open').on('click', function(){
                if( !( jQuery(this).hasClass('toggle_menu') ) ){
                    if( !( jQuery(this).parent().hasClass('disabled') ) ){
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
            $('[role=presentation]').click(function(event){
                if (jQuery(this).hasClass('disabled') ) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (jQuery(this).attr('id') === 'motifLI'){
                        if ($motifMEButton.hasClass('blocked')) {
                            if ( jQuery('#selected_lattice').html() === 'Choose a Lattice' ) {
                                $motifMEButton.tooltip('show');
                                setTimeout(function(){
                                    $motifMEButton.tooltip('hide');
                                }, 2500);
                            }
                            else {
                                $motifMEButton.removeClass('disabled');
                                $motifMEButton.removeClass('blocked');
                                _this.disableLatticeChoice(true);
                            }
                        }
                    }
                    return false;
                }
             });    

            /* [Lattice Tab] */
            $latticePadlock.on('click', function() {
                argument = {};
                if ($latticePadlock.children().hasClass('active')) {
                    argument["padlock"] = true;
                    argument["manualSetCellDims"] = true;
                    argument["manualSetCellAngles"] = true;
                }
                else {
                    argument["padlock"] = false;
                    argument["manualSetCellDims"] = false;
                    argument["manualSetCellAngles"] = false;
                }
                PubSub.publish(events.SET_PADLOCK, argument);
                PubSub.publish(events.MANUAL_SET_DIMS, argument);
                PubSub.publish(events.MANUAL_SET_ANGLES, argument);
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
            $atomPalette.click(function(){
                
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
            $atomPositioningXYZ.addClass('disabled');
            $atomPositioningXYZ.parent().addClass('disabled');
            $atomPositioningABC.addClass('disabled');
            $atomPositioningABC.parent().addClass('disabled');
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
                        jQuery('label[for=txt_coordinates_x]').html('x');
                        jQuery('label[for=txt_coordinates_y]').html('y');
                        jQuery('label[for=txt_coordinates_z]').html('z');
                    }
                    else{  
                        $atomPositioningXYZ.removeClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-purple');
                        $atomPositioningXYZ.addClass('btn-light');
                        $atomPositioningABC.addClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-light');
                        $atomPositioningABC.addClass('btn-purple');
                        argument['abc'] = true;
                        jQuery('label[for=txt_coordinates_x]').html('a');
                        jQuery('label[for=txt_coordinates_y]').html('b');
                        jQuery('label[for=txt_coordinates_z]').html('c');
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
                        jQuery('label[for=txt_coordinates_x]').html('a');
                        jQuery('label[for=txt_coordinates_y]').html('b');
                        jQuery('label[for=txt_coordinates_z]').html('c');
                    }
                    else{
                        $atomPositioningABC.removeClass('buttonPressed');
                        $atomPositioningABC.removeClass('btn-purple');
                        $atomPositioningABC.addClass('btn-light');
                        $atomPositioningXYZ.addClass('buttonPressed');
                        $atomPositioningXYZ.removeClass('btn-light');
                        $atomPositioningXYZ.addClass('btn-purple');
                        argument['xyz'] = true;
                        jQuery('label[for=txt_coordinates_x]').html('x');
                        jQuery('label[for=txt_coordinates_y]').html('y');
                        jQuery('label[for=txt_coordinates_z]').html('z');
                    }
                    PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, argument);
                }
            });
            _this.disableMEButtons({'previewAtomChanges':true,'saveAtomChanges':true});
            $atomTable.find('tbody').sortable({
                appendTo: document.body,
                axis: 'y',
                containment: "parent",
                cursor: "move",
                items: "> tr",
                tolerance: "pointer",
                cancel: 'td.atomButton, td.btn-tangent',
                update: function(e,ui){ 
                    if (jQuery(ui.item).attr('role') !== 'empty'){
                        $atomTable.find('tbody').sortable("cancel");
                    }
                    else if (ui.item.prev('tr').length > 0){
                        if (ui.item.prev('tr').attr('role') === 'parent') $atomTable.find('tbody').sortable("cancel");
                        else if (ui.item.prev('tr').attr('role') === 'parentChild') $atomTable.find('tbody').sortable("cancel");
                    }
                }
            });
            $lockCameras.click(function() {  
                var argument = {};
                if ($lockCameras.hasClass('active')) {
                    $lockCameras.find('img').attr('src','Images/lockCameras.png');
                    argument['syncCameras'] = false;
                }
                else {
                    $lockCameras.find('img').attr('src','Images/lockCamerasActive.png');
                    argument['syncCameras'] = true;
                }
                $lockCameras.toggleClass('active');
                PubSub.publish(events.MOTIF_CAMERASYNC_CHANGE, argument);           
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
            $leapMotion.click(function() {  
                var argument = {};
                argument["leap"]= ($leapMotion.hasClass('active')) ? false : true ;
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
            $notepad.find('.mCSB_1_scrollbar_vertical').show();
            $notepad.find('img').on('click',function(){
                $notepadButton.parent().addClass('btn-light');
                $notepadButton.parent().removeClass('btn-purple');
                $notepad.hide('slow');
            });
            $notepadButton.on('click',function(){
                $notepadButton.parent().removeClass('btn-light');
                $notepadButton.parent().addClass('btn-purple');
                $notepad.show('slow');
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
                    $motifMEButton.removeClass('disabled');
                    $motifMEButton.removeClass('blocked');
                }
            });   
            $periodicModal.on('click',function(){
                if ( !jQuery(this).hasClass('disabled')){   
                    $periodicModal.removeClass('selected');
                    jQuery(this).addClass('selected');
                    var preview = jQuery('#tempSelection').find('p');
                    var caller = jQuery(this);
                    preview.html(caller.html());
                    preview.attr('class',caller.attr('class'));
                    _.each($ionicValues, function($parameter, k){
                        var ionicValue;
                        var ionicIndex = jQuery($parameter).find('p').html();
                        if ( $atomsData[preview.html()] !== undefined ){
                            if ($atomsData[preview.html()]['ionic'][ionicIndex] !== undefined ){
                                if ( ionicIndex === '≡') {
                                    ionicValue = parseFloat($atomsData[preview.html()]['ionic']['≡']);
                                    jQuery($parameter).addClass('selected');
                                }
                                else ionicValue = parseFloat($atomsData[preview.html()]['ionic'][ionicIndex]);
                                jQuery($parameter).show('fast');
                                jQuery($parameter).removeClass('disabled');
                                jQuery($parameter).find('.resolution p').html((ionicValue/100).toFixed(3) + ' &Aring;');
                            }
                            else if ( ionicIndex === '0' ){
                                if ( $atomsData[preview.html()]['radius'] !== 0 ) {
                                    jQuery($parameter).show('fast');
                                    jQuery($parameter).addClass('selected');
                                    jQuery($parameter).find('.resolution p').html(($atomsData[preview.html()]['radius']/100).toFixed(3) + ' &Aring;');
                                }
                                else {
                                    jQuery($parameter).addClass('disabled');
                                    jQuery($parameter).hide('fast');
                                    jQuery($parameter).find('.resolution p').html('-');
                                }
                            }
                            else {
                                jQuery($parameter).addClass('disabled');
                                jQuery($parameter).hide('fast');
                                jQuery($parameter).find('.resolution p').html('-');
                            }
                        }
                        else{
                            jQuery($parameter).addClass('disabled');
                            jQuery($parameter).hide('fast');
                            jQuery($parameter).find('.resolution p').html('-');
                        }
                    });
                }
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
                                argument[a] = $atomsData[argument["element"]]['color'];
                                break;
                            default:
                                argument[a] = $param.val();
                                break;
                        }
                    });
                    argument['ionicIndex'] = jQuery('.property-block.selected .serial p').html();
                    var tempValue = jQuery('.property-block.selected .resolution p').html().split(" ");
                    argument['ionicValue'] = tempValue[0];
                    argument["tangency"]= (!($tangency.hasClass('buttonPressed'))) ? false : true;
                    console.log(argument);
                    PubSub.publish(events.ATOM_SELECTION, argument);
                    $elementContainer.show('slow');
                    $elementContainer.find('a').removeAttr('class');
                    $elementContainer.find('a').attr('class',selected.attr('class'));
                    $elementContainer.find('a').html(selected.html());
                }
            });
            $ionicValues.click(function(){
                if (!(jQuery(this).hasClass('disabled'))){
                    $ionicValues.removeClass('selected');
                    jQuery(this).addClass('selected');
                }
            });
            
            
        
    /*$
    
    _.each(fixedDimensions, function($parameter, k) {
      $parameter.on('change', function() {
        argument = {};
        argument[k] = $parameter.val();
        PubSub.publish(events.MOTIF_CELLDIMENSIONS_CHANGE, argument);
      });
    });
    
    $storeState.on('click', function() {
      PubSub.publish(events.STORE_PROJECT, argument);   
    });
    
    
    this.restrictionEvents = []; */
     
  };
    
    
    
    /* --------------------
       Prototypes - Editors
       -------------------- */
        
        Menu.prototype.moveLabel = function(argument){
            var x = argument['xCoord'] - ( parseFloat($xLabel.css('width')) / 2);
            var y = argument['yCoord'] - ( parseFloat($xLabel.css('height')) / 2);
            switch(argument['label']){
                case 'x':
                    $xLabel.css('left',x);
                    $xLabel.css('top',y);
                    break;
                case 'y':
                    $yLabel.css('left',x);
                    $yLabel.css('top',y);
                    break;
                case 'z':
                    $zLabel.css('left',x);
                    $zLabel.css('top',y);
                    break;
                case 'a':
                    $aLabel.css('left',x);
                    $aLabel.css('top',y);
                    break;
                case 'b':
                    $bLabel.css('left',x);
                    $bLabel.css('top',y);
                    break;
                case 'c':
                    $cLabel.css('left',x);
                    $cLabel.css('top',y);
                    break;
            }
        };
        Menu.prototype.switchTab = function(tab){
            switch(tab){
                case 'latticeTab': 
                    jQuery('#latticeTab').find('a').trigger('click');
                    break;        
                case 'millerPI': 
                    jQuery('#millerPI').find('a').trigger('click'); 
                    break;
                case 'motifLI': 
                    jQuery('#motifLI').find('a').trigger('click'); 
                    break;
                case 'visualTab': 
                    jQuery('#visualTab').find('a').trigger('click'); 
                    break;
                case 'publicTab': 
                    jQuery('#publicTab').find('a').trigger('click');
                    break;
            }
        }
        Menu.prototype.setTabDisable = function(argument){
            _.each(argument, function($parameter, k){
                if ($parameter === true) {
                    jQuery('#'+k).addClass('disabled');
                    jQuery('#'+k).find('a').removeAttr('href');
                }
                else {
                    jQuery('#'+k).removeClass('disabled');
                    switch(k){
                        case 'latticeTab': 
                            jQuery('#'+k).find('a').attr('href','#scrn_lattice');
                            break;        
                        case 'millerPI': 
                            jQuery('#'+k).find('a').attr('href','#scrn_pnd'); 
                            break;
                        case 'motifLI': 
                            jQuery('#'+k).find('a').attr('href','#scrn_motif'); 
                            break;
                        case 'visualTab': 
                            jQuery('#'+k).find('a').attr('href','#scrn_visualize'); 
                            break;
                        case 'publicTab': 
                            jQuery('#'+k).find('a').attr('href','#scrn_public_library');
                            break;
                    }
                }
            });
        };
        Menu.prototype.disableLatticeChoice = function(argument){
            if (argument === true) {
                jQuery('#selected_lattice').addClass('disabled');
                jQuery('#selected_lattice').parent().addClass('disabled');
            }
            else {
                jQuery('#selected_lattice').removeClass('disabled');
                jQuery('#selected_lattice').parent().removeClass('disabled');
            }
        };
        Menu.prototype.showTooltip = function(argument){
            jQuery('#'+argument['id']).attr('data-original-title', argument['title']).tooltip('fixTitle');
            jQuery('#'+argument['id']).tooltip('show');
            setTimeout(function() {
                jQuery('#'+argument['id']).tooltip('hide');
            }, 2500);
        };
        Menu.prototype.resetProgressBar = function(title) {
            $progressBarWrapper.find('.progressLabel').text(title);
            $progressBarWrapper.show();
        };
        Menu.prototype.progressBarFinish = function(){
            $progressBarWrapper.fadeOut('slow');
        };
        Menu.prototype.editProgressTitle = function(title){
            $progressBar.siblings('.progressLabel').text(title);
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
            if ( (choice === 'i') && (action === 'block') ) jQuery('#hexICoord').show('fast');
            else if ( (choice === 'i')) jQuery('#hexICoord').hide('fast');
            else if ( (choice === 't') && (action === 'block') ) jQuery('#hexTCoord').show('fast');
            else jQuery('#hexTCoord').hide('fast');
            setTimeout(function(){$.fn.matchHeight._update();},500);
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
        };
        Menu.prototype.disablePlaneButtons = function(argument){
            _.each(planeButtons, function($parameter, k) {
                if (argument[k] !== undefined){
                    if (argument[k] === true) $parameter.addClass('disabled');
                    else $parameter.removeClass('disabled');
                }
            });
        };
        Menu.prototype.disableDirectionButtons = function(argument){
            _.each(directionButtons, function($parameter, k) {
                if (argument[k] !== undefined){
                    if (argument[k] === true) $parameter.addClass('disabled');
                    else $parameter.removeClass('disabled');
                }
            });
        };
        Menu.prototype.highlightPlaneEntry = function(argument){
             $planesTable.find('#'+argument['id']).removeAttr('class');
             $planesTable.find('#'+argument['id']).attr('class',argument['color']);
        };
        Menu.prototype.editSavedPlane = function(argument){
            var parameters;
            if ( argument['i'] === undefined ) parameters = '['+argument['h']+','+argument['k']+','+argument['l']+']';
            else parameters = '['+argument['h']+','+argument['k']+','+argument['l']+','+argument['i']+']';
            switch(argument['action']){
                case 'save':
                    $planesTable.find('tbody').append('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="planeButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                    $planesTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                    break;  

                case 'edit':
                    $planesTable.find('#'+argument['oldId']).replaceWith('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="planeButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                    $planesTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                    break;

                case 'delete':
                    $planesTable.find('#'+argument['oldId']).remove();
                    break;

            }
            if ( (argument['action']==='save') | (argument['action']==='edit') ){
                $planesTable.find('#'+argument['id']).find('.selectable').on('click',function(){
                    PubSub.publish(events.PLANE_SELECTION, argument['id']);
                });
                $planesTable.find('#'+argument['id']).find('.planeButton').on('click', function(){
                    var arg = {};
                    arg['id'] = argument['id'];
                    if ($planesTable.find('#'+argument['id']).find('.planeButton').hasClass('visible')) {
                        $planesTable.find('#'+argument['id']).find('img').attr('src','Images/hidden-icon-sm.png');
                        arg['visible'] = false;
                    }
                    else {
                        arg['visible'] = true;
                        $planesTable.find('#'+argument['id']).find('img').attr('src','Images/visible-icon-sm.png');
                    }
                    $planesTable.find('#'+argument['id']).find('.planeButton').toggleClass('visible');
                    PubSub.publish(events.PLANE_VISIBILITY, arg);
                });
            }

            if ($planesTable.find('tr').length > 0) $planesTable.show('slow');
            else $planesTable.hide('slow');
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
        };
        Menu.prototype.highlightDirectionEntry = function(argument){
             $directionTable.find('#'+argument['id']).removeAttr('class');
             $directionTable.find('#'+argument['id']).attr('class',argument['color']);
        };
        Menu.prototype.editSavedDirection = function(argument){
            var parameters;
            if ( argument['t'] === undefined ) parameters = '['+argument['u']+','+argument['v']+','+argument['w']+']';
            else parameters = '['+argument['u']+','+argument['v']+','+argument['w']+','+argument['t']+']';
            switch(argument['action']){
                case 'save':
                    $directionTable.find('tbody').append('<tr id="'+ argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="directionButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                    $directionTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                    break;  

                case 'edit':
                    $directionTable.find('#'+argument['oldId']).replaceWith('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="directionButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                    $directionTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                    break;

                case 'delete':
                    $directionTable.find('#'+argument['oldId']).remove();
                    break;

            }
            if ( (argument['action']==='save') | (argument['action']==='edit') ){
                $directionTable.find('#'+argument['id']).find('.selectable').on('click',function(){
                    PubSub.publish(events.DIRECTION_SELECTION, argument['id']);
                });
                $directionTable.find('#'+argument['id']).find('.directionButton').on('click', function(){ 
                    var arg = {};
                    arg['id'] = argument['id'];
                    if ($directionTable.find('#'+argument['id']).find('.directionButton').hasClass('visible')) {
                        $directionTable.find('#'+argument['id']).find('img').attr('src','Images/hidden-icon-sm.png');
                        arg['visible'] = false;
                    }
                    else {
                        arg['visible'] = true;
                        $directionTable.find('#'+argument['id']).find('img').attr('src','Images/visible-icon-sm.png');
                    }
                    $directionTable.find('#'+argument['id']).find('.directionButton').toggleClass('visible');
                    PubSub.publish(events.DIRECTION_VISIBILITY, arg);
                });
            }
            if ($directionTable.find('tr').length > 0) $directionTable.show('slow');
            else $directionTable.hide('slow');
        };
        Menu.prototype.editSavedAtom = function(argument){
    
            //visible hidden
            var eyeButton = '';
            var visible = '';
            var elementCode = '';
            //Capitalized
            var elementName;
            var atomPos = '';
            var ref = this;
            var small = '';
            var role = 'empty';
            var chain = 'hiddenIcon chain';
            var tangentTo = 'x';
            var btnState = 'btn-tangent blocked';
            var current = $atomTable.find('#'+argument['id']);
            var level = '';

            _.each(argument, function($parameter, k){
                switch(k){
                    case 'visible':
                        if ($parameter === true) { visible = 'visible'; eyeButton = visible; }
                        else { visible = ''; eyeButton = 'hidden'; }   
                        break;
                    case 'elementCode':
                        elementCode = $parameter;
                        break;
                    case 'elementName':
                        elementName = $parameter;
                        break;
                    case 'atomPos':
                        atomPos = $parameter;
                        break;
                }
            });
            
            if (argument['action']==='edit') {
                // Role
                role = current.attr('role');
                tangentTo = current.attr('tangentTo');
                // Element serial size
                if (role === 'child') small = 'small';
                else if (role === 'parentChild') small = 'small';
                // Chain
                chain = current.find('.chain').attr('class');
                level = ref.getChainLevel(argument['id']);
                //Color
                btnState = current.find('.btn-tangent').attr('class');
            }
            
            var HTMLQuery = '<tr id="'+argument['id']+'" role="'+role+'" tangentTo="'+tangentTo+'" class="bg-light-gray"><td class="visibility atomButton '+visible+'"><a><img src="Images/'+eyeButton+'-icon-sm.png" class="img-responsive" alt=""/></a></td"><td class="hiddenIcon blank"></td><td class="'+chain+'"><a id="level">'+level+'</a><img src="Images/chain-icon.png" class="img-responsive" alt=""/></td><td td class="element ch-'+elementCode+'">'+elementName+'</td><td  class="element-serial '+small+' selectable"><a>'+atomPos+'</a></td><td class="'+btnState+'"><a href="#"><img src="Images/tangent-icon.png" class="img-responsive" alt=""/></a></td></tr>';

            switch(argument['action']){
                case 'save':
                    $atomTable.find('tbody').append(HTMLQuery);
                    break;  

                case 'edit':
                    current.replaceWith(HTMLQuery);
                    break;

                case 'delete':
                    current.remove();
                    break;

            }
            current = $atomTable.find('#'+argument['id']);
            if ( (argument['action']==='save') || (argument['action']==='edit') ){
                current.find('.btn-tangent').on('click', function(){
                    ref.tangent(argument['id']);
                });
                current.find('.selectable').on('click',function(){
                    /*$elementContainer.find('a').removeAttr('class');
                    $elementContainer.find('a').attr('class','ch-'+elementCode);
                    $elementContainer.find('a').html(elementName);
                    $elementContainer.show('slow');*/
                    PubSub.publish(events.SAVED_ATOM_SELECTION, argument['id']);
                });
                current.find('.atomButton').on('click', function(){
                    var arg = {};
                    arg['id'] = argument['id'];
                    if (current.find('.atomButton').hasClass('visible')) {
                        current.find('.atomButton').find('img').attr('src','Images/hidden-icon-sm.png');
                        arg['visible'] = false;
                    }
                    else {
                        arg['visible'] = true;
                        current.find('.atomButton').find('img').attr('src','Images/visible-icon-sm.png');
                    }
                    current.find('.atomButton').toggleClass('visible');
                    PubSub.publish(events.ATOM_VISIBILITY, arg);
                });
            }
            if ($atomTable.find('tr').length > 0) $atomTable.css('display','block');
            else {
                $atomTable.css('display','none');
                $atomTable.find('tbody').sortable('disable');
            }
        };
        Menu.prototype.getChainLevel = function(id){
            var level = 0;
            var tangent = $atomTable.find('#'+id).attr('tangentTo');
            if (tangent !== 'x'){
                level =  1 + this.getChainLevel(tangent);               
            }
            return level;
        }
        Menu.prototype.tangent = function(id){
            var arg = {};
            var current = $atomTable.find('#'+id);
            var above = current.prev('tr');
            var parent = $atomTable.find('#'+current.attr('tangentTo'));
            //UNLINK
            if ( (current.find('.btn-tangent').hasClass('active')) && !(current.find('.btn-tangent').hasClass('blocked')) ) {

                // If atom is a child
                if (current.attr('role') === 'child') {

                    // Publish Event
                    arg["dragMode"]= false;
                    arg["parentId"]= current.attr('tangentTo');
                    PubSub.publish(events.DRAG_ATOM, arg);

                    // Assign role empty and deactivate button
                    current.attr('role','empty');
                    current.find('.btn-tangent').removeClass('active');

                    // Remove role if only parent
                    if (parent.attr('role') === 'parent'){
                        parent.attr('role','empty');
                    }
                    // Assign child role again
                    else{
                        parent.attr('role','child');
                        parent.find('.btn-tangent').addClass('active');
                    }

                    //UNLINK and hide icon
                    current.attr('tangentTo','x');
                    current.find('.chain').addClass('hiddenIcon');
                    current.find('.element-serial').toggleClass('small');
                }
            }
            //LINK
            else if (!(current.find('.btn-tangent').hasClass('blocked'))) {
                if (current.attr('role') === 'empty') {
                    // If there's an atom above
                    if (above.length !== 0 ) {

                        // If atom above isn't a parent
                        if (above.attr('role') !== 'parent'){

                            // Make child and activate button
                            current.attr('role','child');
                            current.find('.btn-tangent').addClass('active');

                            // Make atom above a parent or parentChild
                            if (above.attr('role') === 'empty') above.attr('role','parent');
                            else above.attr('role','parentChild');
                            
                            // Link Parent-Child and show icon
                            current.attr('tangentTo',above.attr('id'));
                            current.find('.element-serial').toggleClass('small');
                            current.find('.chain').removeClass('hiddenIcon');
                            current.find('.chain').find('a').html(this.getChainLevel(id));
                        
                            // Publish Event
                            arg["dragMode"]= true;
                            arg["parentId"]= above.attr('id');
                            PubSub.publish(events.DRAG_ATOM, arg);
                        }
                    }
                }
            }   
        };
        Menu.prototype.breakChain = function(argument){
            var current = $atomTable.find('#'+argument['id']);
            var above = current.prev('tr');
            var below = current.next('tr');
            var ref = this;
            
            // Handle parent
            if (current.attr('role') === 'child'){
                if (above.attr('role') === 'parent') {
                    above.attr('role','empty');
                    above.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
                }
                else above.attr('role','child');
            }
            else if (current.attr('role') === 'parent'){
                if (below.attr('role') === 'child') below.attr('role','empty');
                else below.attr('role','parent');
                below.attr('tangentTo','x');
                below.find('.chain').addClass('hiddenIcon');
                below.find('.element-serial').removeClass('small');
                below.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
            }
            else if (current.attr('role') === 'parentChild'){
                if (above.attr('role') === 'parent') {
                    above.attr('role','empty');
                    above.attr('tangentTo','x');
                    above.find('.chain').addClass('hiddenIcon');
                    above.find('.element-serial').removeClass('small');
                    above.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
                }
                else above.attr('role','child');
                if (below.attr('role') === 'child') below.attr('role','empty');
                else below.attr('role','parent');
                below.attr('tangentTo','x');
                below.find('.chain').addClass('hiddenIcon');
                below.find('.element-serial').removeClass('small');
                below.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
            }
            
            // Update list
            if (argument['remove'] === true) current.remove();
            else{
                current.attr('role','empty');
                current.find('.chain').addClass('hiddenIcon');
                current.find('.element-serial').removeClass('small');
                current.find('.btn-tangent').attr('class','btn-tangent');
                current.attr('tangentTo','x');
                if (above.attr('tangentTo') !== 'x') ref.tangent(current.attr('id'));
                else current.find('.btn-tangent').addClass('blocked');
            }
            jQuery('#tableAtom tbody tr').each(function(){
                jQuery(this).find('.chain').find('a').html(ref.getChainLevel(jQuery(this).attr('id')));
            });
        };
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
            if (argument['cellVolume'] !== undefined){
                $cellVolume.val(argument['cellVolume']);
                $('#cellVolumeSlider').slider('value',argument['cellVolume']);
            }
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
            }
            if (argument['padlock'] !== undefined){
                if (argument['padlock'] === true) {
                    $motifPadlock.find('a').removeClass('active');
                    $motifPadlock.find('a').attr('aria-pressed','false');
                }
                else {
                    $motifPadlock.find('a').addClass('active');
                    $motifPadlock.find('a').attr('aria-pressed','true');
                }
            }
            if (argument['tangency'] !== undefined){
                if (argument['tangency'] === true) $tangency.parent().addClass('purpleThemeActive');
                else $tangency.parent().removeClass('purpleThemeActive');
            }
            if (argument['atomName'] !== undefined){
                if (argument['atomName'] === '-') $elementContainer.hide('slow');
                else {
                    var newAtom = 'ch-' + argument['atomName'];
                    var newAtomName = jQuery('.'+newAtom).html();
                    $elementContainer.find('a').removeAttr('class');
                    $elementContainer.find('a').attr('class',newAtom+' ch');
                    $elementContainer.find('a').html(newAtomName);
                    $elementContainer.show('slow');
                }
            }
            if (argument['tangentR'] !== undefined){
                $tangentR.val(argument['tangentR']);
            }
        };
        Menu.prototype.getMEInputs = function(inputName){
            _.each(atomParameters, function($parameter, k) {
                if (inputName === k){
                    switch(inputName){
                        case 'atomColor': return atomParameters['atomColor'].spectrum('get');
                        case 'atomOpacity': return atomParameters['atomOpacity'].val();
                    }
                }
            });
            _.each(motifInputs, function($parameter, k) {
                if (inputName === k) return $parameter.val();
            });
            _.each(rotatingAngles, function($parameter, k) {
                if (inputName === k) return $parameter.val();
            });
            _.each(rotLables, function($parameter, k) {
                if (inputName === k) return $parameter.text();
            });
            _.each(cellManDimensions, function($parameter, k) {
                if (inputName === k) return $parameter.val();
            });
             _.each(cellManAngles, function($parameter, k) {
                if (inputName === k) return $parameter.val();
            });
            if (inputName === 'cellVolume'){ return $cellVolume.val(); }
            if (inputName === 'atomPositioningXYZ'){
                if ($atomPositioningXYZ.hasClass('buttonPressed')) return true;
                else return false;
            }
            if (inputName === 'atomPositioningABC'){
                if ($atomPositioningABC.hasClass('buttonPressed')) return true;
                else return false;
            }
            if (inputName === 'padlock'){
                if ($motifPadlock.find('a').hasClass('active')) return true;
                else return false;
            }
            if (inputName === 'tangency'){
                if ($tangency.parent().hasClass('purpleThemeActive')) return true;
                else return false;
            }
            if (inputName === 'atomName'){ return $elementContainer.find('a').html(); }
            if (inputName === 'tangentR'){ return $tangentR.val(); }
        };
        Menu.prototype.disableMEInputs = function(argument){
            _.each(atomParameters, function($parameter, k) {
                if (argument[k] !== undefined){
                    switch(k){
                        case 'atomColor':
                            if(argument[k] === true) $parameter.spectrum("disable");
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
            if (argument['cellVolume'] !== undefined){
                $cellVolume.prop('disabled', argument['cellVolume']);
                $('#cellVolumeSlider').slider('option','disabled',argument['cellVolume']);
            }
            if (argument['atomPositioningXYZ'] !== undefined){
                if (argument['atomPositioningXYZ']) {
                    $atomPositioningXYZ.addClass('disabled');
                    $atomPositioningXYZ.parent().addClass('disabled');
                }
                else {
                    $atomPositioningXYZ.removeClass('disabled');
                    $atomPositioningXYZ.parent().removeClass('disabled');
                }
            }
            if (argument['atomPositioningABC'] !== undefined) {
                if (argument['atomPositioningABC']) {
                    $atomPositioningABC.addClass('disabled');
                    $atomPositioningABC.parent().addClass('disabled');
                }
                else {
                    $atomPositioningABC.removeClass('disabled');
                    $atomPositioningABC.parent().removeClass('disabled');
                }
            }
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
        };
        Menu.prototype.disableMEButtons = function(argument){
           _.each($atomButtons, function($parameter, k) {
                if (argument[k] !== undefined){
                    if (argument[k] === true) {
                        if (k === 'deleteAtom') $parameter.addClass('disabled');
                        else if (k === 'atomPalette') {
                            $parameter.children().removeAttr('data-toggle');
                            $parameter.addClass('disabled');
                        }
                        else{
                            $parameter.each(function(){$parameter.addClass('disabled');});
                        }
                    }
                    else {
                        if (k === 'deleteAtom') $parameter.removeClass('disabled');
                        else if (k === 'atomPalette') {
                            if (k === 'atomPalette') $parameter.children().attr('data-toggle','modal');
                            $parameter.removeClass('disabled');
                        }
                        else{
                            $parameter.each(function(){$parameter.removeClass('disabled');});
                        }
                    }
                }
            });
        };
        Menu.prototype.highlightAtomEntry = function(argument){
            if (argument['color'] === 'bg-light-purple') {
                $atomTable.find('#'+argument['id']).find('.btn-tangent').removeClass('blocked');
                $atomTable.find('#'+argument['id']).find('.btn-tangent').removeClass('disabled');
            }
            else if ($atomTable.find('#'+argument['id']).find('.btn-tangent').hasClass('active')){
                $atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('blocked');
            }
            else {
                $atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('disabled');
                $atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('blocked');
            }
            $atomTable.find('#'+argument['id']).removeAttr('class');
            $atomTable.find('#'+argument['id']).attr('class',argument['color']); 
        };
        Menu.prototype.rotAnglesSection = function(visibility){
            if (visibility === true) jQuery('.tangent-properties-container').show('slow');
            else jQuery('.tangent-properties-container').hide('slow');
        };
        Menu.prototype.disableRenderizationButtons = function(argument){
            _.each(renderizationMode, function($parameter, k) {
                if (argument[k] !== undefined){
                    if (argument[k] === true){
                        $parameter.css('background','white');
                        $parameter.removeClass('active');
                        $parameter.addClass('disabled');
                    }
                }
            });
        };
        Menu.prototype.setPlaneEntryVisibility = function(argument){
            if(argument['action'] === true){ 
                $planesTable.find('#'+argument['id']).find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
                $planesTable.find('#'+argument['id']).find('.planeButton').addClass('visible');
            }
            else{
                $planesTable.find('#'+argument['id']).find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
                $planesTable.find('#'+argument['id']).find('.planeButton').removeClass('visible');
            }
        };
        Menu.prototype.setDirectionEntryVisibility = function(argument){
            if(argument['action'] === true) {
                $directionTable.find('#'+argument['id']).find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
                $directionTable.find('#'+argument['id']).find('.directionButton').addClass('visible');
            }
            else {
                $directionTable.find('#'+argument['id']).find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
                $directionTable.find('#'+argument['id']).find('.directionButton').removeClass('visible');
            }
        };
        Menu.prototype.setAtomEntryVisibility = function(argument){
            if(argument['action'] === true){ 
                $atomTable.find('#'+argument['id']).find('.atomButton').find('img').attr('src','Images/visible-icon-sm.png');
                $atomTable.find('#'+argument['id']).find('.atomButton').addClass('visible');
            }
            else {
                $atomTable.find('#'+argument['id']).find('.atomButton').find('img').attr('src','Images/hidden-icon-sm.png');
                $atomTable.find('#'+argument['id']).find('.atomButton').removeClass('visible');
            }
        };
        Menu.prototype.hideChainIcon = function(argument){
            if (argument['hide'] === true) $atomTable.find('#'+argument['id']).find('.chain').addClass('hiddenIcon');
            else $atomTable.find('#'+argument['id']).find('.chain').removeClass('hiddenIcon');
        };
        Menu.prototype.btnTangentState = function(argument){
            var current = $atomTable.find('#'+argument['id']).find('.btn-tangent');
            switch(argument['state']){
                case 'reset':
                    current.attr('class','btn-tangent');
                    break;
                case 'activate':
                    current.attr('class','btn-tangent active');
                    break;
                case 'block':
                    current.addClass('blocked');
                    break;
                case 'unblock':
                    current.removeClass('blocked');
                    break;
                case 'disable':
                    current.attr('class','btn-tangent disabled');
                    break;
            }
        };
   
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
        Menu.prototype.onPlaneVisibility = function(callback) { 
            PubSub.subscribe(events.PLANE_VISIBILITY, callback);
        };
        Menu.prototype.onDirectionVisibility = function(callback) { 
            PubSub.subscribe(events.DIRECTION_VISIBILITY, callback);
        };
        Menu.prototype.onAtomVisibility = function(callback) { 
            PubSub.subscribe(events.ATOM_VISIBILITY, callback);
        };
        Menu.prototype.onTangentR = function(callback){
            PubSub.subscribe(events.TANGENTR, callback);
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
