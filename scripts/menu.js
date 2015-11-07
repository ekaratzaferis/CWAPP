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
    
        // Viewport state
        var $viewport = false;
    
        // Restrictions
        var localRestrictions = {};
    
        // Attach different event to Lattice Parameters
        var latticeEvent = false;
    
        // Auto refresh state
        var autoChange = false;
    
    
    
    /* --------------
       Modal Elements
       -------------- */
    
        var $bravaisModal = jQuery('.mh_bravais_lattice_block');
        var $periodicModal = jQuery('.ch');
        var $errorModal = jQuery('#error_modal');
        var $infoModal = jQuery('#info_modal');
        var $warningModal = jQuery('#warning_modal');
        $warningModal.caller = 'none';
    
    
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
        var $cellVolume = jQuery('#cellVolume');
        var $meLengthA = jQuery('#meLengthA');
        var $meLengthB = jQuery('#meLengthB');
        var $meLengthC = jQuery('#meLengthC');
        var $meAngleA = jQuery('#meAngleA');
        var $meAngleB = jQuery('#meAngleB');
        var $meAngleG = jQuery('#meAngleG');
    
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
        var $autoRefresh = jQuery('.autoRefresh');
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
        var $realistic = jQuery('#realistic');
        var $wireframe = jQuery('#wireframe');
        var $toon = jQuery('#toon');
        var $flat = jQuery('#flat');
        var $crystalClassic = jQuery('#crystalClassic');
        var $crystalSubstracted = jQuery('#crystalSubstracted');
        var $crystalSolidVoid = jQuery('#crystalSolidVoid');
        var $crystalGradeLimited = jQuery('#crystalGradeLimited');
        var $cellClassic = jQuery('#cellClassic');
        var $cellSubstracted = jQuery('#cellSubstracted');
        var $cellSolidVoid = jQuery('#cellSolidVoid');
        var $cellGradeLimited = jQuery('#cellGradeLimited');
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
        var latticeLabels = {
            'scaleX' : $meLengthA,
            'scaleY' : $meLengthB,
            'scaleZ' : $meLengthC,
            'alpha' : $meAngleA,
            'beta' : $meAngleB,
            'gamma' : $meAngleG
        };
    
        // [Motif Tab]
        var $atomButtons = {
            'atomPalette': $atomPalette,
            'previewAtomChanges': $previewAtomChanges,
            'saveAtomChanges': $saveAtomChanges,
            'deleteAtom': $deleteAtom
        };
        var motifSliders = ['atomPosX', 'atomPosY', 'atomPosZ'];
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
            'realistic': $realistic,
            'wireframe': $wireframe,
            'toon': $toon,
            'flat': $flat
        };
        var crystalMode = {
            'crystalClassic': $crystalClassic,
            'crystalSubstracted': $crystalSubstracted,
            'crystalSolidVoid': $crystalSolidVoid,
            'crystalGradeLimited': $crystalGradeLimited
        };
        var unitCellMode = {
            'cellClassic': $cellClassic,
            'cellSubstracted': $cellSubstracted,
            'cellSolidVoid': $cellSolidVoid,
            'cellGradeLimited': $cellGradeLimited
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
            'motifZScreenColor' : $motifZScreenColor ,
            'screenMode' : jQuery('#screenMode'),
            'printMode' : jQuery('#printMode')
        };    
    
    
    
    /* ------------------------
       List of Published Events
       ------------------------ */
        var events = {
            SOUND_VOLUME: 'menu.sound_volume',
            CHANGE_REND_MODE: 'menu.change_rend_mode',
            CHANGE_CRYSTAL_MODE: 'menu.change_crystal_mode',
            CHANGE_UNIT_CELL_MODE: 'menu.change_unit_cell_mode',
            TANGENTR: 'menu.tangetnr',
            ATOM_VISIBILITY: 'menu.atom_visibility',
            PLANE_VISIBILITY: 'menu.plane_visibility',
            DIRECTION_VISIBILITY: 'menu.direction_visibility',
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
            AXIS_MODE: 'menu.axis_mode',
            CELL_VOLUME_CHANGE: 'menu.cell_volume_change',
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
            UC_CRYSTAL_VIEWPORT: 'menu.uc_crystal_viewport',
            LEAP_TRACKING_SYSTEM: 'menu.leap_tracking_system',
            AXYZ_CHANGE: 'menu.axyz_change',
            MAN_ANGLE_CHANGE: 'menu.man_angle_change',
            SWAP_SCREEN: 'menu.swap_screen',
            DIALOG_RESULT: 'menu.dialog_result'
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

    
    /* ------------
       Restrictions
       ------------*/
        var restrictionList = {};
    
    
    /* --------
       Messages
       ---------*/
        var messages = {
            '1':'<p>You have unlocked the lattice restrictions. <br/><br/> From now on no autopilot nor lattice restrictions will be applied.</p>',
            '2':'<p>You have unlocked the autopilot restrictions. <br/><br/>From now on atoms no longer behave as rigid spheres and you will be able to change lattice parameters within the restrictions of the lattice you have chosen.</p>',
            '3':'<p>This functionality is CPU intensive and your computer may be unavailable for a few minutes. <br/><br/> Are you sure you want to continue?</p>'
        }
    
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
            
            if ($viewport === true) {
                $('#unitCellRenderer').width($appContainer.width()/5);
                $('#unitCellRendererMouse').width($appContainer.width()/5);
                $('#unitCellRenderer').height(screen_height/5);
                $('#unitCellRendererMouse').height(screen_height/5);
            }
        };

        function init_dimensions(){
            jQuery('.mh_controls').matchHeight();
            jQuery('.mh_pnd_para_box').matchHeight();
            jQuery('.mh_lattice_length_para_box').matchHeight();
            jQuery('.mh_bravais_lattice_block').matchHeight({byRow: false});
            jQuery('.mh_bravais_lattice_block').find('.bravais-lattice-block').matchHeight({byRow: false});
            jQuery('.mh_bravais_lattice_block').find('.block-image').matchHeight({byRow: false});
        };
    
        function inputErrorHandler(string){
            var result = false;
            if (isNaN(string)) {
                if (string.indexOf(',') !== -1) {
                    var temp = string.split(',');
                    if (temp.length === 2) result = string.replace(',','.');
                }
                else if (string.indexOf('/') !== -1) {
                    var temp = string.split('/');
                    if (temp.length === 2) result = (parseFloat(temp[0])/parseFloat(temp[1])).toString();
                }
            }
            else result = string;
            return result;
        };
    
        function integerInput(string){
            var result = false;
            if (!(isNaN(string))) {
                if (string.indexOf('.') === -1) result = string;
            }
            return result;
        };
    
        function translateParameter(string){
            switch(string){
                case 'scaleX': return 'b';
                case 'scaleY': return 'c';
                case 'scaleZ': return 'a';
                case 'alpha': return 'β';
                case 'beta': return 'α';
                case 'gamma': return 'υ';
                case 'scaleXSlider': return 'b';
                case 'scaleYSlider': return 'c';
                case 'scaleZSlider': return 'a';
                case 'alphaSlider': return 'β';
                case 'betaSlider': return 'α';
                case 'gammaSlider': return 'γ';
                default: return 'Unknown';
            }
        };
    
        function applyRestrictions(caller,value,context,noTooltips){
            // Run restrictions
            var _this = context;
            var result = {};
            var returnValue = 'success';
            
            _.each(restrictionList, function($parameter,pk){
                result[pk] = $parameter(caller,value);
            });
            
            // Evaluate Resutls
            // ORDER [ ≠X > =X >  ≠Number,=Number]
            _.each(result, function($param, a){
                if ($param.action === 'undo') {
                    if (noTooltips !== true){
                        _this.showTooltip({
                            'element': $param.source.attr('id'),
                            'placement': 'top',
                            'message': translateParameter($param.source.attr('id'))+' should be ≠ '+translateParameter($param.target.attr('id'))
                        });
                        $param.source.trigger($param.action, [$param.value]);
                        returnValue = 'abort';
                    }
                }
            });
            if (returnValue !== 'abort') {
                _.each(result, function($param, a){
                    if ($param.action === 'reflect') {
                        $param.source.trigger($param.action, [$param.value]);
                        $param.target.trigger($param.action, [$param.value]);
                        returnValue = 'reflect';
                    }
                });
            }
            if (returnValue !== 'abort') {
                _.each(result, function($param, a){
                    if ($param.action === 'fail') {
                        var message;
                        if ($param.restriction === 'equalTo') message = translateParameter($param.source.attr('id'))+' should be = '+$param.target;
                        else message = translateParameter($param.source.attr('id'))+' should be ≠ '+$param.target;
                        if (noTooltips !== true){
                            _this.showTooltip({
                                'element': $param.source.attr('id'),
                                'placement': 'top',
                                'message': message
                            });
                            $param.source.trigger($param.action, [$param.value]);
                            returnValue = 'fail';
                        }
                    }
                });
            }
            return returnValue;
        }
    
        function Menu() {
            
            // Local Variables
            var _this = this;
            var argument;
            
            // Atom Ionic Values
            require(['atoms'], function(atomsInfo) {
                $atomsData = atomsInfo;
            });
            
        /* --------------
           Hover Tooltips
           -------------- */
            var listLeft = {
                'controls_toggler':'left',
                'latticeTab':'left',
                'millerPI':'left',
                'motifLI':'left',
                'visualTab':'left',
                'publicTab':'left',
                'selected_lattice':'top',
                'latticePadlock':'top',
                'repeatZ':'top',
                'repeatX':'top',
                'repeatY':'top',
                'scaleZ':'top',
                'scaleZSlider':'top',
                'scaleX':'top',
                'scaleXSlider':'top',
                'scaleY':'top',
                'scaleYSlider':'top',
                'beta':'top',
                'betaSlider':'top',
                'alpha':'top',
                'alphaSlider':'top',
                'gamma':'top',
                'gammaSlider':'top',
                'motifPadlock':'left',
                'cube_color_border':'top',
                'cube_color_filled':'top',
                'radius':'top',
                'radiusSlider':'top',
                'faceOpacity':'top',
                'faceOpacitySlider':'top',
                'newPlane':'top',
                'millerH':'top',
                'millerK':'top',
                'millerL':'top',
                'millerI':'top',
                'savePlane':'top',
                'planeOpacity':'top',
                'planeColor':'top',
                'planeName':'top',
                'deletePlane':'top',
                'millerU':'top',
                'millerV':'top',
                'millerW':'top',
                'millerT':'top',
                'newDirection':'top',
                'saveDirection':'top',
                'dirRadius':'top',
                'directionColor':'top',
                'directionName':'top',
                'deleteDirection':'top',
                'atomPalette':'top',
                'tangency':'top',
                'atomPositioningXYZ':'top',
                'atomPositioningABC':'top',
                'atomPosZ':'top',
                'atomPosZSlider':'top',
                'atomPosX':'top',
                'atomPosXSlider':'top',
                'atomPosY':'top',
                'atomPosYSlider':'top',
                'atomColor':'top',
                'atomOpacity':'top',
                'atomOpacitySlider':'top',
                'previewAtomChanges':'top',
                'saveAtomChanges':'top',
                'deleteAtom':'top',
                'cellVolume':'top',
                'cellVolumeSlider':'top',
                'meLengthA':'top',
                'meLengthB':'top',
                'meLengthC':'top',
                'meAngleA':'top',
                'meAngleB':'top',
                'meAngleG':'top',
                'wireframe':'top',
                'toon':'top',
                'flat':'top',
                'realistic':'top',
                'distortionOn':'top',
                'distortionOff':'top',
                'anaglyph':'top',
                'oculus':'top',
                'crystalCamTargetOn':'top',
                'crystalCamTargetOff':'top',
                'fullScreen':'top',
                'leapMotion':'top',
                'crystalClassic':'top',
                'crystalSubstracted':'top',
                'crystalSolidVoid':'top',
                'crystalGradeLimited':'top',
                'unitCellViewport':'top',
                'cellClassic':'top',
                'cellSubstracted':'top',
                'cellSolidVoid':'top',
                'cellGradeLimited':'top',
                'fogColor':'top',
                'fogDensity':'top',
                'fogDensitySlider':'top',
                'sounds':'top',
                'lights':'top',
                'crystalScreenColor':'top',
                'cellScreenColor':'top',
                'motifXScreenColor':'top',
                'motifYScreenColor':'top',
                'motifZScreenColor':'top',
                'notesButton':'top',
                'motifZScreenColor':'top'
            };
            var i = 0;
            _.each(listLeft, function($element, k){
                _this.addHoverTooltip({ 'element': k.toString(), 'message': i, 'placement': $element.toString() });
                i++;
            });
            
            
        /* ---------------------
           ScrollBars and Window
           --------------------- */
            $scrollBars.mCustomScrollbar();
            jQuery(window).ready(function(){
                $progressBarWrapper.hide(2000);
                jQuery('body').css('background-color','black');
                jQuery('#screenWrapper').show(0);
                jQuery('#main_controls_container').show(0);
            });
            jQuery(window).resize(function() {
              app_container();
            });
            jQuery(window).on('change update', function(){
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
                        
                    case 'unitCellViewport':
                        argument ={};
                        argument[name] = true;
                        PubSub.publish(events.UC_CRYSTAL_VIEWPORT, argument);
                        $viewport = true;
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
                        
                    case 'unitCellViewport':
                        argument ={};
                        argument[name] = false;
                        PubSub.publish(events.UC_CRYSTAL_VIEWPORT, argument);
                        $viewport = false;
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
                    case 'screenMode' : k = 'screenMode'; eventColor = 'x'; break;
                    case 'printMode' : k = 'printMode'; eventColor = 'x'; break;
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
                LastLatticeParameters[k] = 1;
                if ((k === 'repeatX')||(k === 'repeatY')||(k === 'repeatZ')){
                    $parameter.val(1);
                    $parameter.on('change',function(){
                        argument = {};
                        if (inputErrorHandler($parameter.val()) !== false) {
                            argument[k] = inputErrorHandler($parameter.val());
                            PubSub.publish(events.LATTICE_PARAMETER_CHANGE, argument);
                        }
                    });
                }
                else{
                    if ((k === 'scaleX')||(k === 'scaleY')||(k === 'scaleZ')){
                        $parameter.val(1.000);
                        LastLatticeParameters[k] = 1;
                    }
                    else{
                        $parameter.val(90.000);
                        LastLatticeParameters[k] = 90;
                    }
                    $parameter.on('change', function() {
                        argument = {};
                        if (inputErrorHandler($parameter.val()) !== false) {
                            argument[k] = inputErrorHandler($parameter.val());
                            var restrictionsMet = applyRestrictions(k,argument[k],_this,false);
                            if ( restrictionsMet === 'success' ) $parameter.trigger('success', [argument[k]]);
                        }
                    });      
                    $parameter.on('reflect',function(event, value) {
                        $parameter.val(value);
                        $parameter.trigger('success',[value]);
                    });
                    $parameter.on('success',function(event, value) {
                        var pubEventLength;
                        var pubEventAngle;
                        if (latticeEvent === false) {
                            pubEventLength = events.LATTICE_PARAMETER_CHANGE;
                            pubEventAngle = events.LATTICE_PARAMETER_CHANGE;
                        }
                        else {
                            pubEventLength = events.AXYZ_CHANGE;
                            pubEventAngle = events.MAN_ANGLE_CHANGE;   
                        }
                        argument = {};
                        argument[k] = value;
                        LastLatticeParameters[k] = argument[k];
                        jQuery('#'+k+'Slider').slider('value',argument[k]);
                        if ((k === 'scaleX')||(k === 'scaleY')||(k === 'scaleZ')) PubSub.publish(pubEventLength, argument);
                        else PubSub.publish(pubEventAngle, argument);
                        if (autoChange === true) PubSub.publish(events.MOTIF_TO_LATTICE, 0);
                    });
                    $parameter.on('fail',function(event, value) {
                        $parameter.val(value);
                        LastLatticeParameters[k] = value;
                        jQuery('#'+k+'Slider').slider('value',value);
                    });
                    $parameter.on('undo',function(event, value) {
                        $parameter.trigger('fail',[value]);
                    });
                }
            });
            _.each(lengthSlider, function(name) {
                LastLatticeParameters[name] = 1;
                jQuery('#'+name+'Slider').on('fail', function(event, value){
                    var pubEvent;
                    if (latticeEvent === false) pubEvent = events.LATTICE_PARAMETER_CHANGE;
                    else pubEventLength = events.AXYZ_CHANGE;
                    jQuery('#'+name+'Slider').slider('value',value);
                    jQuery('#'+name).val(value);
                    LastLatticeParameters[name] = value;
                    argument = {};
                    argument[name] = value;
                    PubSub.publish(pubEvent, argument);
                });
                jQuery('#'+name+'Slider').on('undo', function(event, value){
                    jQuery('#'+name+'Slider').trigger('fail',[value]);
                });
                jQuery('#'+name+'Slider').on('reflect', function(event, value){
                    var pubEvent;
                    if (latticeEvent === false) pubEvent = events.LATTICE_PARAMETER_CHANGE;
                    else pubEvent = events.AXYZ_CHANGE;
                    argument = {};
                    argument[name] = value;
                    LastLatticeParameters[name] = argument[name]; 
                    jQuery('#'+name).val(value);
                    jQuery('#'+name+'Slider').slider('value',value);
                    PubSub.publish(pubEvent, argument);
                });
               _this.setSlider(name,1,1,20,0.001,events.LATTICE_PARAMETER_CHANGE);
            });
            _.each(angleSliders, function(name) {
                LastLatticeParameters[name] = 1;
                jQuery('#'+name+'Slider').on('fail', function(event, value){
                    var pubEvent;
                    if (latticeEvent === false) pubEvent = events.LATTICE_PARAMETER_CHANGE;
                    else pubEvent = events.MAN_ANGLE_CHANGE;
                    jQuery('#'+name+'Slider').slider('value',value);
                    jQuery('#'+name).val(value);
                    LastLatticeParameters[name] = value;
                    argument = {};
                    argument[name] = value;
                    PubSub.publish(pubEvent, argument);
                });
                jQuery('#'+name+'Slider').on('undo', function(event, value){
                    jQuery('#'+name+'Slider').trigger('fail',[value]);
                });
                jQuery('#'+name+'Slider').on('reflect', function(event, value){
                    var pubEvent;
                    if (latticeEvent === false) pubEvent = events.LATTICE_PARAMETER_CHANGE;
                    else pubEvent = events.MAN_ANGLE_CHANGE;
                    argument = {};
                    argument[name] = value;
                    LastLatticeParameters[name] = argument[name]; 
                    jQuery('#'+name).val(value);
                    jQuery('#'+name+'Slider').slider('value',value);
                    PubSub.publish(pubEvent, argument);
                });
                _this.setSlider(name,90,1,180,1,events.LATTICE_PARAMETER_CHANGE);
            });
            _.each(gradeParameters, function($parameter, k) {
                $parameter.val(1);
                $parameter.on('change', function() {
                    argument = {};
                    if (inputErrorHandler($parameter.val()) !== false) {
                        argument[k] = inputErrorHandler($parameter.val());
                        jQuery('#'+k+'Slider').slider('value',argument[k]);
                        PubSub.publish(events.GRADE_PARAMETER_CHANGE, argument);
                    }
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
                    if (k === 'planeColor') {
                        argument[k] = $parameter.spectrum("get").toHex();
                        PubSub.publish(events.PLANE_PARAMETER_CHANGE, argument);
                    }
                    else if (k === 'planeName') {
                        argument[k] = $parameter.val();
                        console.log(argument[k]);
                        PubSub.publish(events.PLANE_PARAMETER_CHANGE, argument);
                    }
                    else if (integerInput($parameter.val()) !== false) {
                        argument[k] = integerInput($parameter.val());
                        PubSub.publish(events.PLANE_PARAMETER_CHANGE, argument);
                    }
                    else { 
                        _this.showTooltip({
                            'element': $parameter.attr('id'),
                            'placement': 'top',
                            'message': 'insert integer'
                        });
                        $parameter.val('');
                    }
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
                    if (k === 'directionColor') {
                        argument[k] = $parameter.spectrum("get").toHex();
                        PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, argument);
                    }
                    else if (k === 'directionName') {
                        argument[k] = $parameter.val();
                        PubSub.publish(events.PLANE_PARAMETER_CHANGE, argument);
                    }
                    else if (inputErrorHandler($parameter.val()) !== false) {
                        argument[k] = inputErrorHandler($parameter.val());
                        PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, argument);
                    }
                    else { 
                        _this.showTooltip({
                            'element': $parameter.attr('id'),
                            'placement': 'top',
                            'message': 'insert integer'
                        });
                        $parameter.val('');
                    }
                });
            });

            /* [Motif Tab] */
            $atomTable.hide();
            _this.setSlider('atomOpacity',10,0,10,0.1,events.ATOM_PARAMETER_CHANGE);
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
                            PubSub.publish(events.ATOM_PARAMETER_CHANGE, argument);
                            break;
                        case 'atomOpacity':
                            if (inputErrorHandler($parameter.val()) !== false) {
                                argument[k] = inputErrorHandler($parameter.val());
                                jQuery('#'+k+'Slider').slider('value',argument[k]);
                                PubSub.publish(events.ATOM_PARAMETER_CHANGE, argument);
                            }
                            break;
                    }
                }); 
            });
            _.each(motifInputs, function($parameter, k) {
                $parameter.prop('disabled',true);
                $parameter.on('change', function() {
                    argument = {};
                    if (inputErrorHandler($parameter.val()) !== false) {
                        argument[k] = inputErrorHandler($parameter.val()); 
                        jQuery('#'+k+'Slider').slider('value',argument[k]);  
                        argument['trigger'] = 'textbox';
                        PubSub.publish(events.ATOM_POSITION_CHANGE, argument);
                    }
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
                if (inputErrorHandler($cellVolume.val()) !== false) {
                    argument['cellVolume'] = inputErrorHandler($cellVolume.val()); 
                    jQuery('#cellVolumeSlider').slider('value',argument['cellVolume']);
                    PubSub.publish(events.CELL_VOLUME_CHANGE, argument);
                }
            });
            _this.setSlider('cellVolume',100,0,400,0.1,events.CELL_VOLUME_CHANGE);

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
                                _this.showTooltip({
                                    'element': 'motifLI',
                                    'placement': 'left',
                                    'message': 'You have to choose a Lattice before opening the Motif Tab'
                                });
                            }
                        }
                    }
                    return false;
                }
                else if (jQuery(this).attr('id') === 'motifLI'){
                    _.each(latticeLabels, function($parameter,k){
                        var labelLength = parseFloat(latticeParameters[k].val()).toFixed(3);
                        var labelAngle = parseFloat(latticeParameters[k].val()).toFixed(0);
                        if ( (k !== 'alpha') && (k !== 'beta') && (k !== 'gamma') ) $parameter.text(labelLength+'Å'); 
                        else $parameter.text(labelAngle+'°'); 
                    });
                    jQuery('#swapBtn').hide('fast');
                    jQuery('#swapBtn').attr('class','');
                }
                else if (jQuery(this).attr('id') === 'latticeTab'){
                    if (latticeEvent !== false) jQuery('#swapBtn').show('fast');
                }
                else {
                    jQuery('#swapBtn').hide('fast');
                    jQuery('#swapBtn').attr('class','');
                }
             });
            jQuery('#swapBtn').tooltip({
                container : 'body',
                trigger: 'hover',
                title: 'Swap between crystal and motif screen.'
            });

            /* [Lattice Tab] */
            $latticePadlock.find('a').prop('disabled', true);
            $latticePadlock.addClass('disabled');
            $motifPadlock.find('a').prop('disabled', true);
            $motifPadlock.addClass('disabled');
            
            $latticePadlock.on('click', function() {
                if (!($latticePadlock.hasClass('disabled'))) {
                    if (!($latticePadlock.children().hasClass('active'))) {
                        if (!( jQuery('#selected_lattice').html() === 'Choose a Lattice' )) {
                            jQuery('#selected_lattice').html('User Custom Defined');
                            $latticePadlock.find('a').button('toggle');
                            $latticePadlock.find('a').prop('disabled', true);
                            $latticePadlock.addClass('disabled');
                            _this.removeLatticeRestrictions();
                            $motifPadlock.trigger('unlock');
                            if (!($motifPadlock.children().hasClass('active'))) $motifPadlock.find('a').button('toggle');
                            $motifPadlock.find('a').prop('disabled', true);
                            $motifPadlock.addClass('disabled');
                            _this.showInfoDialog({
                                'messageID':1
                            });
                        }
                    }
                }
            });
            $motifPadlock.on('unlock', function(event,value){
                $tangency.trigger('turnOff');
                argument = {};
                argument["padlock"] = true;
                _.each(latticeParameters, function($parameter,k){
                    if ( (k !== 'repeatY') && (k !== 'repeatX') && (k !== 'repeatZ') ){
                        $parameter.prop('disabled',false);
                        jQuery('#'+k+'Slider').slider('enable');
                    }
                });
                if (!($latticePadlock.children().hasClass('active'))) {
                    _this.removeLatticeRestrictions();
                    _this.setLatticeRestrictions(localRestrictions);
                }
                PubSub.publish(events.SET_PADLOCK, argument);
            });
            $motifPadlock.on('lock', function(event,value){
                $tangency.trigger('turnOn');
                argument = {};
                argument["padlock"] = false;
                _.each(latticeParameters, function($parameter,k){
                    if ( (k !== 'repeatY') && (k !== 'repeatX') && (k !== 'repeatZ') ){
                        $parameter.prop('disabled',true);
                        jQuery('#'+k+'Slider').slider('disable');
                    }
                });
                PubSub.publish(events.SET_PADLOCK, argument);
            });
            $motifPadlock.on('click', function() {
                if (!($motifPadlock.hasClass('disabled'))) {
                    if (!($motifPadlock.children().hasClass('active'))) {
                        _this.showInfoDialog({
                            'messageID':2
                        });
                        $motifPadlock.trigger('unlock');
                    }
                    else $motifPadlock.trigger('lock');
                }
            });
            
            jQuery('.latticeButtons').hide();
            $autoRefresh.on('click', function(){
                if (!($autoRefresh.hasClass('off'))) {
                    $autoRefresh.addClass('off');
                    autoChange = false;
                }
                else{
                    $autoRefresh.removeClass('off');
                    autoChange = true;
                }
            });

            /* [P&D Tab] */
            _.each(directionButtons, function($parameter, k ) {
                $parameter.on('click', function(){
                    if (!($parameter.hasClass('disabled'))){
                        argument = {};
                        argument["button"]=this.id;
                        _.each(directionParameters, function($param, a ) {
                            if (a == 'directionColor') argument[a] = $param.spectrum("get").toHex();
                            else if (inputErrorHandler($param.val()) !== false) argument[a] = inputErrorHandler($param.val());
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
                            else if (inputErrorHandler($param.val()) !== false) argument[a] = inputErrorHandler($param.val());
                        });
                        PubSub.publish(events.MILLER_PLANE_SUBMIT, argument);
                    }
                });
            });

            
            /* [Motif Tab] */
            $tangency.on('click',function(){
                if ( !($tangency.parent().hasClass('disabled')) ){
                    argument = {};
                    argument["button"]=this.id;
                    if (!($tangency.parent().hasClass('purpleThemeActive'))) {
                        _this.changeSliderValue('cellVolume',100,events.CELL_VOLUME_CHANGE);
                        argument['tangency'] = true;
                    }
                    else argument['tangency'] = false;
                    $tangency.parent().toggleClass('purpleThemeActive');
                    PubSub.publish(events.ATOM_TANGENCY_CHANGE, argument);
                }
            });
            $tangency.on('turnOff',function(){
                argument = {};
                argument["button"]=this.id;
                argument['tangency'] = false;
                $tangency.parent().removeClass('purpleThemeActive');
                PubSub.publish(events.ATOM_TANGENCY_CHANGE, argument);
            });
            $tangency.on('turnOn',function(){
                argument = {};
                argument["button"]=this.id;
                argument['tangency'] = true;
                $tangency.parent().addClass('purpleThemeActive');
                PubSub.publish(events.ATOM_TANGENCY_CHANGE, argument);
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
            _.each(latticeLabels, function($parameter, k){
                $parameter.parent().parent().on('click', function(){
                    _this.switchTab('latticeTab');
                    if (latticeEvent !== false) jQuery('#swapBtn').trigger('click');
                });
            });
            jQuery('#swapBtn').on('click', function(){
                argument = {};
                if (jQuery('#swapBtn').hasClass('motif')){
                    argument['swap'] = 'latticeTab';
                    jQuery('#swapBtn').removeClass('motif');
                }
                else {
                    argument['swap'] = 'motifLI';
                    jQuery('#swapBtn').addClass('motif');
                }
                PubSub.publish(events.SWAP_SCREEN, argument);
            });

            /* [Visualization Tab] */
            $fogDensity.on('change',function(){
                argument = {}; 
                argument['fogDensity'] = $fogDensity.val();
                PubSub.publish(events.FOG_PARAMETER_CHANGE, argument);
            });
            _this.setSlider('sound',75,0,100,1,events.SOUND_VOLUME);
            jQuery('#soundSlider').slider('disable');
            $sounds.on('click', function(){  
                var argument = {};
                $sounds.toggleClass('active');
                argument["sounds"] = ($sounds.hasClass('active')) ? true : false ;
                if (argument['sounds'] === true) jQuery('#soundSlider').slider('enable');
                else jQuery('#soundSlider').slider('disable');
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
                            PubSub.publish(events.CHANGE_REND_MODE, argument);
                            _.each(renderizationMode, function($param, a) { if ( a !== k) $param.removeClass('active');});
                        }
                    }
                });
            });
            _.each(crystalMode, function($parameter, k) {
                $parameter.on('click', function() {
                    if (!($parameter.hasClass('disabled'))) {
                        if ( (k === 'crystalSubstracted') || (k === 'crystalSolidVoid') ) {
                            _this.showWarningDialog({ 'messageID': 3, 'caller': $parameter });
                        }
                        else $parameter.trigger('action');
                    }
                });
                $parameter.on('action', function() {
                    if (!($parameter.hasClass('active'))) {
                        $parameter.addClass('active');
                        argument = {};
                        argument['mode'] = k;
                        PubSub.publish(events.CHANGE_CRYSTAL_MODE, argument);
                        _.each(crystalMode, function($param, a) { if ( a !== k) $param.removeClass('active');});
                    }
                });
            });
            _.each(unitCellMode, function($parameter, k) {
                $parameter.on('click', function() {
                    if (!($parameter.hasClass('disabled'))) {
                        if (!($parameter.hasClass('active'))) {
                            $parameter.addClass('active');
                            argument = {};
                            argument['mode'] = k;
                            PubSub.publish(events.CHANGE_UNIT_CELL_MODE, argument);
                            _.each(unitCellMode, function($param, a) { if ( a !== k) $param.removeClass('active');});
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
            $notepad.on('resize',function(){
                jQuery('#notesScroll').css('height',jQuery('#noteWrapper').height()-45);
            });
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
            });
            $oculus.click(function() {
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
                jQuery('#selected_lattice').text(latticeNames[jQuery(this).attr('id')]);
                jQuery('#selected_lattice').parent().addClass('disabled');
                jQuery('#selected_lattice').addClass('disabled');
                PubSub.publish(events.LATTICE_CHANGE,jQuery(this).attr('id'));
                // Enable Motif Tab.
                $motifMEButton.find('a').attr('href','#scrn_motif');
                $motifMEButton.removeClass('disabled');
                $motifMEButton.removeClass('blocked');
                _this.disableLatticeChoice(true);
                $latticePadlock.find('a').prop('disabled', false);
                $latticePadlock.removeClass('disabled');
            });  
            $periodicModal.on('click',function(){
                if ( !jQuery(this).hasClass('disabled') && !jQuery(this).parent().parent().hasClass('element-symbol-container') ){   
                    $periodicModal.removeClass('selected');
                    $ionicValues.removeClass('selected');
                    jQuery(this).addClass('selected');
                    var preview = jQuery('#tempSelection').find('p');
                    var caller = jQuery(this);
                    var selected = false;
                    preview.html(caller.html());
                    preview.attr('class',caller.attr('class'));
                    preview.show(0);
                    jQuery('.modal-pre-footer').show(0);
                    _.each($ionicValues, function($parameter, k){
                        var ionicValue;
                        var ionicIndex = jQuery($parameter).find('p').html();
                        if ( $atomsData[preview.html()] !== undefined ){
                            if ($atomsData[preview.html()]['ionic'][ionicIndex] !== undefined ){
                                if ( ionicIndex === '≡') ionicValue = parseFloat($atomsData[preview.html()]['ionic']['≡']);
                                else ionicValue = parseFloat($atomsData[preview.html()]['ionic'][ionicIndex]);
                                jQuery($parameter).show(0);
                                jQuery($parameter).removeClass('disabled');
                                jQuery($parameter).find('.resolution p').html((ionicValue/100).toFixed(3) + ' &Aring;');
                            }
                            else if ( ionicIndex === '0' ){
                                if ( $atomsData[preview.html()]['radius'] !== 0 ) {
                                    jQuery($parameter).show(0);
                                    jQuery($parameter).removeClass('disabled');
                                    jQuery($parameter).find('.resolution p').html(($atomsData[preview.html()]['radius']/100).toFixed(3) + ' &Aring;');
                                }
                                else {
                                    jQuery($parameter).addClass('disabled');
                                    jQuery($parameter).hide(0);
                                    jQuery($parameter).find('.resolution p').html('-');
                                }
                            }
                            else {
                                jQuery($parameter).addClass('disabled');
                                jQuery($parameter).hide(0);
                                jQuery($parameter).find('.resolution p').html('-');
                            }
                        }
                        else{
                            jQuery($parameter).addClass('disabled');
                            jQuery($parameter).hide(0);
                            jQuery($parameter).find('.resolution p').html('-');
                        }    
                    });
                }
            });
            $ionicValues.click(function(){
                var selected = jQuery('td.ch.selected');
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
                    argument['ionicIndex'] = jQuery(this).find('.serial p').html();
                    var tempValue = jQuery(this).find('.resolution p').html().split(" ");
                    argument['ionicValue'] = tempValue[0];
                    argument["tangency"]= (!($tangency.hasClass('buttonPressed'))) ? false : true;
                    PubSub.publish(events.ATOM_SELECTION, argument);
                    $elementContainer.show('slow');
                    $elementContainer.find('a').removeAttr('class');
                    $elementContainer.find('a').attr('class',selected.attr('class'));
                    if ( (argument['ionicIndex']) !== '0' && (argument['ionicIndex'] !== '3b')) $elementContainer.find('a').html('<span style="font-size:17px;">'+selected.html()+'<sup>'+argument['ionicIndex']+'</sup></span>');
                    else $elementContainer.find('a').html(selected.html());
                    if (!($latticePadlock.hasClass('disabled'))){
                        $motifPadlock.removeClass('disabled');
                        $motifPadlock.find('a').prop('disabled', false);
                        _.each(latticeParameters, function($parameter,k){
                            if ( (k !== 'repeatY') && (k !== 'repeatX') && (k !== 'repeatZ') ){
                                $parameter.prop('disabled',true);
                                jQuery('#'+k+'Slider').slider('disable');
                            }
                        });
                    }
                    latticeEvent = true;
                    jQuery('.latticeButtons').show();
                }
                $ionicValues.addClass('disabled');
                jQuery('#tempSelection').find('p').hide('fast');
                jQuery('.modal-pre-footer').hide('fast');
                autoChange = true;
            });
            
            // Listen User Input in Dialog box
            jQuery('#cancelWarning').on('click',function(){
                argument = {};
                argument['result'] = false;
                PubSub.publish(events.DIALOG_RESULT, argument);
                $warningModal.caller = 'none';
            });
            jQuery('#continueWarning').on('click',function(){
                argument = {};
                argument['result'] = true;
                PubSub.publish(events.DIALOG_RESULT, argument);
                if ($warningModal.caller !== 'none') {
                    $warningModal.caller.trigger('action');
                    $warningModal.caller = 'none';
                }
            });
            $warningModal.on('hide.bs.modal', function(){
                argument = {};
                argument['result'] = false;
                PubSub.publish(events.DIALOG_RESULT, argument);
                $warningModal.caller = 'none';
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
        Menu.prototype.showErrorDialog = function(argument){
            var screen_height = jQuery(window).height();
            $errorModal.find('#errorLabel h2').html('Error '+argument['code']);
            $errorModal.find('#errorMessage').html(messages[argument['messageID']]);
            $errorModal.modal('show').css('margin-top',(screen_height/2)-100);
        };
        Menu.prototype.showInfoDialog = function(argument){
            var screen_height = jQuery(window).height();
            $infoModal.find('#infoMessage').html(messages[argument['messageID']]);
            $infoModal.modal('show').css('margin-top',(screen_height/2)-100);
        };
        Menu.prototype.showWarningDialog = function(argument){
            var screen_height = jQuery(window).height();
            $warningModal.find('#warningMessage').html(messages[argument['messageID']]);
            $warningModal.modal('show').css('margin-top',(screen_height/2)-100);
            $warningModal.caller = argument['caller'];
        };
        Menu.prototype.setMotifPadlock = function(state){
            if (state === 'lock') {
                if (($motifPadlock.children().hasClass('active'))) $motifPadlock.buttton('toggle');
                $motifPadlock.trigger('lock');
            }
            else if (state === 'unlock') {
                if (!($motifPadlock.children().hasClass('active'))) $motifPadlock.buttton('toggle');
                $motifPadlock.trigger('unlock');
            }
        };
        Menu.prototype.chooseActiveRenderMode = function(id){
            _.each(renderizationMode, function($parameter, k) {
                if ( k === id ){
                    if (!($parameter.hasClass('disabled'))) {
                        if (!($parameter.hasClass('active'))) {
                            $parameter.addClass('active');
                            _.each(renderizationMode, function($param, a) { if ( a !== k) $param.removeClass('active');});
                        }
                    }
                }
            });
        };
        Menu.prototype.chooseActiveCrystalMode = function(id){
            _.each(crystalMode, function($parameter, k) {
                if ( k === id ){
                    if (!($parameter.hasClass('disabled'))) {
                        if (!($parameter.hasClass('active'))) {
                            $parameter.addClass('active');
                            _.each(crystalMode, function($param, a) { if ( a !== k) $param.removeClass('active');});
                        }
                    }
                }
            });
        };
        Menu.prototype.chooseActiveUnitCellMode = function(id){
            _.each(unitCellMode, function($parameter, k) {
                if ( k === id ){
                    if (!($parameter.hasClass('disabled'))) {
                        if (!($parameter.hasClass('active'))) {
                            $parameter.addClass('active');
                            _.each(unitCellMode, function($param, a) { if ( a !== k) $param.removeClass('active');});
                        }
                    }
                }
            });
        };
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
        };
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
            var target = jQuery('#'+argument['element']);
            target.attr('data-original-title', argument['message']);
            target.tooltip({
                container : 'body',
                placement : argument['placement'],
                trigger: 'manual',
                title: argument['message']
            });
            target.tooltip('show');
            setTimeout(function(){
                target.tooltip('hide');
            }, 2500);
        };
        Menu.prototype.addHoverTooltip = function(argument){
            var target = jQuery('#'+argument['element']);
            target.attr('data-original-title', argument['message']);
            target.tooltip({
                container : 'body',
                placement : argument['placement'],
                trigger: 'hover',
                title: argument['message']
            });
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
                    LastLatticeParameters[k] = parameters[k];
                }
            });
            PubSub.publish(events.LATTICE_PARAMETER_CHANGE, this.getLatticeParameters());
        };
        Menu.prototype.disableLatticeParameters = function(argument){
            _.each(latticeParameters, function($parameter, k) {
                if (argument[k] !== undefined) $parameter.prop('disabled', argument[k]);
            });
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
            var _this = this;
            var sliderName = name+'Slider';
            jQuery('#'+sliderName).slider('value',val);
            jQuery('#'+name).val(val);
            _.each(latticeLabels, function($parameter,k){
                var labelLength = parseFloat(latticeParameters[k].val()).toFixed(3);
                var labelAngle = parseFloat(latticeParameters[k].val()).toFixed(0);
                if ( (k !== 'alpha') && (k !== 'beta') && (k !== 'gamma') ) $parameter.text(labelLength+'Å'); 
                else $parameter.text(labelAngle+'°'); 
            });
        };
        Menu.prototype.changeSliderValue = function(name, val, event) {
            var sliderName = name+'Slider';
            jQuery('#'+sliderName).slider('value',val);
            jQuery('#'+name).val(val);
            PubSub.publish(event, {sliderName,val});
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
                    var result = true;
                    if ( (inputName === 'cellVolume') && ($tangency.parent().hasClass('purpleThemeActive')) ){
                        if (ui.value < 90) {
                            jQuery(sliderName).slider('value',90);
                            argument[inputName] = 90;
                            PubSub.publish(eventIn, argument);
                            jQuery('#'+inputName).val(90);
                            return false;
                        }
                    }
                    _.each(latticeParameters, function($parameter,k){
                        if (k === inputName) {
                            applyRestrictions(k+'Slider',ui.value.toString(),_this,true);
                            if (latticeEvent !== false){
                                if ((k === 'scaleX')||(k === 'scaleY')||(k === 'scaleZ')) eventIn = events.AXYZ_CHANGE;
                                else eventIn = events.MAN_ANGLE_CHANGE;
                            }
                            else eventIn = events.LATTICE_PARAMETER_CHANGE;
                        }
                    });
                    argument[inputName] = ui.value;
                    PubSub.publish(eventIn, argument);
                    jQuery('#'+inputName).val(ui.value);
                },
                stop: function(event,ui){
                    _.each(latticeParameters, function($parameter,k){
                        if (k === inputName) {
                            var result = applyRestrictions(k+'Slider',ui.value.toString(),_this,false);
                            if ( (result === 'success') || (result === 'reflect') ) {
                                LastLatticeParameters[k] = ui.value;
                                if (autoChange === true) PubSub.publish(events.MOTIF_TO_LATTICE, 0);
                            }
                        }
                    });
                }
            });
        };
        Menu.prototype.toggleExtraParameter = function(choice, action){
            if ( (choice === 'i') && (action === 'block') ) jQuery('#hexICoord').show('fast');
            else if ( (choice === 'i')) jQuery('#hexICoord').hide('fast');
            else if ( (choice === 't') && (action === 'block') ) jQuery('#hexTCoord').show('fast');
            else jQuery('#hexTCoord').hide('fast');
            setTimeout(function(){$.fn.matchHeight._update();},500);
        };
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
            var ionicIndex = '';

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
                    case 'ionicIndex':
                        if ($parameter !== '0' && $parameter !== '3b') elementName = '<span style="font-size:13px;">'+elementName+'<sup>'+argument['ionicIndex']+'</sup></span>';
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
            
            var HTMLQuery = '<tr id="'+argument['id']+'" role="'+role+'" tangentTo="'+tangentTo+'" class="bg-light-gray"><td class="visibility atomButton '+visible+'"><a><img src="Images/'+eyeButton+'-icon-sm.png" class="img-responsive" alt=""/></a></td"><td class="hiddenIcon blank"></td><td class="'+chain+'"><a id="level">'+level+'</a><img src="Images/chain-icon.png" class="img-responsive" alt=""/></td><td class="element ch-'+elementCode+'">'+elementName+'</td><td  class="element-serial '+small+' selectable"><a>'+atomPos+'</a></td><td class="'+btnState+'"><a href="#"><img src="Images/tangent-icon.png" class="img-responsive" alt=""/></a></td></tr>';

            switch(argument['action']){
                case 'save':
                    $atomTable.find('tbody').append(HTMLQuery);
                    break;  

                case 'edit':
                    current.replaceWith(HTMLQuery);
                    setTimeout(function(){
                        current.find('.element').attr('class','element').css('background',argument['atomColor']);
                    },300);
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
        };
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
            if (argument['tangency'] !== undefined){
                if (argument['tangency'] === true) $tangency.parent().addClass('purpleThemeActive');
                else $tangency.parent().removeClass('purpleThemeActive');
            }
            if (argument['atomName'] !== undefined){
                if (argument['atomName'] === '-') $elementContainer.hide('slow');
                else {
                    var newAtom = 'ch-' + argument['atomName'];
                    var newAtomName = argument['atomName'].capitalizeFirstLetter();
                    $elementContainer.find('a').attr('class','ch');
                    if (argument['ionicIndex'] !== '0' && argument['ionicIndex'] !== '3b')
                        $elementContainer.find('a').html('<span style="font-size:17px;">'+newAtomName+'<sup>'+argument['ionicIndex']+'</sup></span>');
                    else $elementContainer.find('a').html(newAtomName);
                    $elementContainer.find('a').css('background',argument['atomColor']);
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
            if (inputName === 'cellVolume'){ return $cellVolume.val(); }
            if (inputName === 'atomPositioningXYZ'){
                if ($atomPositioningXYZ.hasClass('buttonPressed')) return true;
                else return false;
            }
            if (inputName === 'atomPositioningABC'){
                if ($atomPositioningABC.hasClass('buttonPressed')) return true;
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
        Menu.prototype.disableCrystalButtons = function(argument){
            _.each(crystalMode, function($parameter, k) {
                if (argument[k] !== undefined){
                    if (argument[k] === true){
                        $parameter.css('background','white');
                        $parameter.removeClass('active');
                        $parameter.addClass('disabled');
                    }
                }
            });
        };
        Menu.prototype.disableUnitCellButtons = function(argument){
            _.each(unitCellMode, function($parameter, k) {
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
        Menu.prototype.removeLatticeRestrictions = function() {
            restrictionList = {};
            _.each(latticeParameters, function($parameter, pk) {
                $parameter.prop('disabled',false);
                jQuery('#'+pk+'Slider').slider('enable');
            });
        };
        Menu.prototype.setLatticeRestrictions = function(restrictions) {

            // Return is restrictions is not an object
            if (_.isObject(restrictions) === false) {
                return;
            }

            localRestrictions = restrictions;
            
            var left = {};
            var right = {};
            var _this = this;

            _.each(latticeParameters, function($parameter, pk) {
                
                $parameter.prop('disabled',false);
                jQuery('#'+pk+'Slider').slider('enable');

                if (_.isUndefined(restrictions[pk]) === false) {

                    // Left side of expression
                    left[pk] = $parameter;

                    _.each(restrictions[pk], function(operator, rk) {

                        // Right side of expression
                        right[rk] = latticeParameters[rk];
                        
                        var restrictionName = 'restriction'+Object.keys(restrictionList).length;

                        if (operator === '=') {
                            // Add equalToNumber restriction
                            if (_.isUndefined(right[rk])) {
                                left[pk].prop('disabled',true);
                                jQuery('#'+pk+'Slider').slider('disable');
                                restrictionList[restrictionName] = function(caller,value){
                                    if (caller === pk){
                                        if (parseFloat(value) !== parseFloat(rk)) {
                                            return { 
                                                action: 'fail',
                                                source: left[pk],
                                                target: parseFloat(rk),
                                                value: parseFloat(rk),
                                                restriction: 'equalTo'
                                            };
                                        }
                                    }
                                    else if (caller === pk+'Slider'){
                                        if (parseFloat(value) !== parseFloat(rk)) {
                                            return { 
                                                action: 'fail',
                                                source: jQuery('#'+pk+'Slider'),
                                                target: parseFloat(rk),
                                                value: parseFloat(rk),
                                                restriction: 'equalTo'
                                            };
                                        }
                                    }
                                    return { action: 'success' };
                                }
                            }
                            // Add equalToInput restriction
                            else {
                                if (right[rk].prop('disabled') === false){
                                    right[rk].prop('disabled',true);
                                    jQuery('#'+rk+'Slider').slider('disable');
                                }
                                restrictionList[restrictionName] = function(caller,value){
                                    if(caller === pk){
                                        return {
                                            action: 'reflect',
                                            source: left[pk],
                                            target: right[rk],
                                            value: value
                                        };
                                    }
                                    else if (caller === pk+'Slider'){
                                        return {
                                            action: 'reflect',
                                            source: jQuery('#'+pk+'Slider'),
                                            target: jQuery('#'+rk+'Slider'),
                                            value: value
                                        };
                                    }
                                    return { action: 'success' };
                                }
                            }
                        } 
                        else if (operator === '≠') {
                            
                            // Add differentThanNumber restriction
                            if (_.isUndefined(right[rk])) {
                                restrictionList[restrictionName] = function(caller,value){
                                    if (caller === pk){
                                        if (parseFloat(value) === parseFloat(rk)) {
                                            return { 
                                                action: 'fail',
                                                source: left[pk],
                                                target: parseFloat(rk),
                                                value: LastLatticeParameters[pk],
                                                restriction: 'differentThan'
                                            };
                                        }
                                    }
                                    else if (caller === pk+'Slider'){
                                        if (parseFloat(value) === parseFloat(rk)) {
                                            return { 
                                                action: 'fail',
                                                source: jQuery('#'+pk+'Slider'),
                                                target: parseFloat(rk),
                                                value: LastLatticeParameters[pk],
                                                restriction: 'differentThan'
                                            };
                                        }
                                    }
                                    return { action: 'success' };
                                }
                            }
                            // Add differentThanInput restriction
                            else {
                                restrictionList[restrictionName] = function(caller,value){
                                    if (caller === pk){
                                        if (value === right[rk].val()) {
                                            return { 
                                                action: 'undo',
                                                source: left[pk],
                                                target: right[rk],
                                                value: LastLatticeParameters[pk]
                                            };
                                        }
                                    }
                                    else if (caller === pk+'Slider'){
                                        if (value === right[rk].val()) {
                                            return { 
                                                action: 'undo',
                                                source: jQuery('#'+pk+'Slider'),
                                                target: jQuery('#'+rk+'Slider'),
                                                value: LastLatticeParameters[pk]
                                            };
                                        }
                                    }
                                    return { action: 'success' };
                                }
                            }
                        }
                    });
                }
            }); 
        };
        String.prototype.capitalizeFirstLetter = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
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
        Menu.prototype.onManuallyCellVolumeChange = function(callback) {
            PubSub.subscribe(events.CELL_VOLUME_CHANGE, callback);
        };
        Menu.prototype.onAtomTangencyChange = function(callback) {
            PubSub.subscribe(events.ATOM_TANGENCY_CHANGE, callback);
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
        Menu.prototype.onRendModeChange = function(callback) { 
            PubSub.subscribe(events.CHANGE_REND_MODE, callback);
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
        Menu.prototype.onUnitCellViewport = function(callback){
            PubSub.subscribe(events.UC_CRYSTAL_VIEWPORT, callback);
        };
        Menu.prototype.onUnitCellChange = function(callback){
            PubSub.subscribe(events.CHANGE_UNIT_CELL_MODE, callback);
        };
        Menu.prototype.onCrystalChange = function(callback){
            PubSub.subscribe(events.CHANGE_CRYSTAL_MODE, callback);
        };
        Menu.prototype.onManuallyCellDimsChange = function(callback) {
            PubSub.subscribe(events.AXYZ_CHANGE, callback);
        };
        Menu.prototype.onManuallyCellAnglesChange = function(callback) {
            PubSub.subscribe(events.MAN_ANGLE_CHANGE, callback);
        };
        Menu.prototype.onSwapScreen = function(callback) {
            PubSub.subscribe(events.SWAP_SCREEN, callback);
        };
        Menu.prototype.onDialogResult = function(callback){
            PubSub.subscribe(events.DIALOG_RESULT, callback);
        };
        Menu.prototype.onSoundVolume = function(callback){
            PubSub.subscribe(events.SOUND_VOLUME, callback);
        };

  return Menu;
});