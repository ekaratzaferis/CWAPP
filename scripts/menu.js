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
    'jColor',
    'individualAtomController',
    'stringEditor',
    'tooltipGenerator',
    'setUIValue',
    'getUIValue',
    'interfaceResizer',
    'messages',
    'visualTab',
    'pndTab',
    'userDialog',
    'menuRibbon',
    'modals',
    'disableUIElement',
    'latticeTab',
    'motifTab',
    'libraryTab',
    'notesTab'
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
    jColor,
    individualAtomController,
    stringEditor,
    tooltipGenerator,
    setUIValue,
    getUIValue,
    interfaceResizer,
    messages,
    visualTab,
    pndTab,
    userDialog,
    menuRibbon,
    modals,
    disableUIElement,
    latticeTab,
    motifTab,
    libraryTab,
    notesTab
) 
{

    // Module References //
    var individualAtomControllerModule = undefined;
    var toolTipGeneratorModule = undefined;
    var stringEditorModule = undefined;
    var interfaceResizerModule = undefined;
    var pndTabModule = undefined;
    var setUIValueModule = undefined;
    var getUIValueModule = undefined;
    var messagesModule = undefined;
    var userDialogModule = undefined;
    var visualTabModule = undefined;
    var menuRibbonModule = undefined;
    var modalsModule = undefined;
    var disableUIElementModule = undefined;
    var latticeTabModule = undefined;
    var motifTabModule = undefined;
    var libraryTabModule = undefined;
    var notesTabModule = undefined;

    // Events //
    var events = {
        SIDE_BY_SIDE_3D: 'menu.side_by_side_3d',
        ON_TOP_3D: 'menu.on_top_3d',
        DOWNLOAD_PROJECT: 'menu.download_project',
        AUTO_UPDATE: 'menu.auto_update',
        OPEN_QR: 'menu.open_qr',
        DOWNLOAD_QR: 'menu.download_qr',
        PLANE_INTERCEPTION: 'menu.plane_interception',
        PLANE_PARALLEL: 'menu.plane_parallel',
        THREE_D_PRINTING: 'menu.three_d_printing',
        ATOM_CUSTOMIZATION: 'menu.atom_customization',
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
        DIALOG_RESULT: 'menu.dialog_result',
        LABEL_TOGGLE: 'menu.label_toggle',
        HIGHLIGHT_TANGENCY: 'menu.highlight_tangency'
    };
            
    function Menu() {

        // Independent Modules //
        toolTipGeneratorModule = new tooltipGenerator();
        stringEditorModule = new stringEditor();
        messagesModule = new messages();

        // 1st level dependency //
        userDialogModule = new userDialog({
            messages:messagesModule
        });
        interfaceResizerModule = new interfaceResizer({
            tooltipGenerator:toolTipGeneratorModule
        });
        getUIValueModule = new getUIValue({
            stringEditor: stringEditorModule,
        });
        disableUIElementModule = new disableUIElement({
            messages: messagesModule 
        });
        
        // 2nd level dependency //
        setUIValueModule = new setUIValue({
            interfaceResizer:interfaceResizerModule,
            messages: messagesModule,
            stringEditor: stringEditorModule,
            getUIValue: getUIValueModule,
            tooltipGenerator: toolTipGeneratorModule
        });      
        latticeTabModule = new latticeTab({
            messages: messagesModule,
            disableUIElement: disableUIElementModule,
            setUIValue: setUIValueModule,
            userDialog: userDialogModule,
            stringEditor: stringEditorModule,
            tooltipGenerator: toolTipGeneratorModule
        });
        visualTabModule = new visualTab({
            userDialog: userDialogModule,
            getUIValue: getUIValueModule,
            setUIValue: setUIValueModule,
            disableUIElement: disableUIElementModule
        });
        pndTabModule = new pndTab({
            getUIValue: getUIValueModule,   
            setUIValue: setUIValueModule, // Co-dependent
            disableUIElement: disableUIElementModule,   
            tooltipGenerator: toolTipGeneratorModule,   
            messages: messagesModule 
        });
        menuRibbonModule = new menuRibbon({
            messages:messagesModule,
            tooltipGenerator:toolTipGeneratorModule,
            interfaceResizer:interfaceResizerModule, 
            userDialog:userDialogModule, 
            setUIValue:setUIValueModule,
            latticeTab:latticeTabModule
        });
        notesTabModule = new notesTab({
            tooltipGenerator:toolTipGeneratorModule,
            disableUIElement:disableUIElementModule,
            menuRibbon:menuRibbonModule,
            setUIValue:setUIValueModule,
            stringEditor:stringEditorModule
        });
        individualAtomControllerModule = new individualAtomController({
            stringEditor:stringEditorModule,
            tooltipGenerator:toolTipGeneratorModule,
            interfaceResizer:interfaceResizerModule,
            setUIValue:setUIValueModule,
            notesTab:notesTabModule
        });
        modalsModule = new modals({
            setUIValue: setUIValueModule,
            menuRibbon: menuRibbonModule,
            getUIValue: getUIValueModule,
            disableUIElement: disableUIElementModule,
            latticeTab: latticeTabModule,
            messages: messagesModule
        });
        motifTabModule = new motifTab({
            getUIValue: getUIValueModule,   
            setUIValue: setUIValueModule,   
            disableUIElement: disableUIElementModule,   
            tooltipGenerator: toolTipGeneratorModule,   
            messages: messagesModule,
            latticeTab: latticeTabModule,
            menuRibbon: menuRibbonModule
        });
        libraryTabModule = new libraryTab({
            setUIValue: setUIValueModule, 
            tooltipGenerator: toolTipGeneratorModule,
            messages: messagesModule
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
            'notesButton':'left',
            'motifZScreenColor':'top'
        };
        var i = 0;
        _.each(listLeft, function($element, k){
            toolTipGeneratorModule.addOnHoverTooltip({ target: k.toString(), message: i, placement: $element.toString() });
            i++;
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
        */

    };

    // Interface //
    Menu.prototype.highlightElement = function(argument){
        interfaceResizerModule.highlightElement(argument);
    };
    Menu.prototype.moveLabel = function(argument){
        interfaceResizerModule.moveLabel(argument);
    };
    Menu.prototype.switchTab = function(tab){
        menuRibbonModule.switchTab(tab);
    };
    Menu.prototype.setTabDisable = function(argument){
        menuRibbonModule.disableTab(argument);
    };
    Menu.prototype.disableLatticeChoice = function(state){
        disableUIElementModule.disableElement({
            select_lattice:{
                value: state   
            }
        });
    };

    // Tooltips //
    Menu.prototype.canvasTooltip = function(argument){
        toolTipGeneratorModule.canvasTooltip(argument); 
    };
    Menu.prototype.showTooltip = function(argument){
        toolTipGeneratorModule.showTooltip(argument);
    };
    Menu.prototype.addHoverTooltip = function(argument){
        toolTipGeneratorModule.addOnHoverTooltip(argument);
    }; 

    // Progress Bar //
    Menu.prototype.resetProgressBar = function(title) {
        interfaceResizerModule.resetProgressBar(title);
    };
    Menu.prototype.progressBarFinish = function(){
        interfaceResizerModule.progressBarFinish();
    };
    Menu.prototype.editProgressTitle = function(title){
        interfaceResizerModule.editProgressBarTitle(title);
    };
        
    // User Dialog //
    Menu.prototype.showErrorDialog = function(argument){
        userDialogModule.showErrorDialog(argument);
    };
    Menu.prototype.showInfoDialog = function(argument){
        userDialogModule.showInfoDialog(argument);
    };
    Menu.prototype.showWarningDialog = function(argument){
        userDialogModule.showWarningDialog(argument);
    };

    // Individual Atom Customizer //
    Menu.prototype.openAtomCustomizer = function(argument){
        individualAtomControllerModule.showBox(argument);
    };
    Menu.prototype.moveAtomCustomizer = function(argument){
        individualAtomControllerModule.moveBox(argument);
    };
    Menu.prototype.closeAtomCustomizer = function(){
        individualAtomControllerModule.hideBox();
    };
                
    // Lattice Tab //
    Menu.prototype.setMotifPadlock = function(state){
        latticeTabModule.setMotifPadlock(state);
    };
    Menu.prototype.getLatticeParameters = function() {
        return getUIValueModule.getValue({
            repeatX: {id:'repeatX'}, 
            repeatY: {id:'repeatY'}, 
            repeatZ: {id:'repeatZ'}, 
            scaleX: {id:'scaleX'}, 
            scaleY: {id:'scaleY'}, 
            scaleZ: {id:'scaleZ'}, 
            alpha: {id:'alpha'}, 
            beta: {id:'beta'}, 
            gamma: {id:'gamma'}
        });

    };
    Menu.prototype.setLatticeParameters = function(argument) {
        latticeTabModule.setLatticeParameters(argument);
    };
    Menu.prototype.disableLatticeParameters = function(argument){
        latticeTabModule.disableLatticeParameters(argument);
    };
    Menu.prototype.setLatticeRestrictions = function(restrictions) {
        latticeTabModule.setLatticeRestrictions(restrictions);
    };

    // Motif Tab //
    Menu.prototype.toggleExtraParameter = function(choice, action){
        motifTabModule.toggleExtraParameter(choice,action);
    };
    Menu.prototype.editSavedAtom = function(argument){
        motifTabModule.editAtom(argument);
    };
    Menu.prototype.editMEInputs = function(values){
        var argument = {};
        _.each(values, function($parameter, k) {
            if (k === 'atomName'){
                argument[k] = {
                    value: {atomName: values.atomName, ionicIndex: values.ionicIndex, atomColor: values.atomColor},
                    other: jQuery('.element-symbol-container')
                }
            }
            else{
                argument[k] = {
                    value: values[k]
                }
            }
        });
        setUIValueModule.setValue(argument); 
    };
    Menu.prototype.getMEInputs = function(inputName){
        return getUIValueModule.getValue({
            atomColor: {id:'atomColor'}, 
            atomOpacity: {id:'atomOpacity'}, 
            atomPosX: {id:'atomPosX'}, 
            atomPosY: {id:'atomPosY'}, 
            atomPosZ: {id:'atomPosZ'}, 
            rotAngleTheta: {id:'rotAngleTheta'}, 
            rotAnglePhi: {id:'rotAnglePhi'},
            rotAngleX: {id:'rotAngleX'},
            rotAngleY: {id:'rotAngleY'},
            rotAngleZ: {id:'rotAngleZ'},
            cellVolume: {id:'cellVolume'},
            atomPositioningXYZ: {id:'atomPositioningXYZ'},
            atomPositioningABC: {id:'atomPositioningABC'},
            tangency: {id:'tangency'},
            atomName: {id:'atomName'},
            tangentR: {id:'tangentR'}
        });
    };
    Menu.prototype.disableMEInputs = function(values){
        var argument = {};
        _.each(values, function($parameter, k) {
            argument[k] = {
                value: values[k]
            }
            if  ( (k === 'atomPosX') || (k === 'atomPosY') || (k === 'atomPosZ') || (k === 'atomOpacity')){
                argument[k+'Slider'] = {
                    value: values[k]
                }
            }
        });
        disableUIElementModule.disableElement(argument);
    };
    Menu.prototype.disableMEButtons = function(values){
        var argument = {};
        _.each(values, function($parameter, k) {
            if (k !== 'atomPalette') argument[k] = {
                other: jQuery('.'+k),
                value: values[k]
            }
            else {
                argument[k] = {
                    value: values[k]
                }
            }
        });
        disableUIElementModule.disableElement(argument);
    };
    Menu.prototype.highlightAtomEntry = function(argument){
        motifTabModule.highlightAtomEntry(argument);
    };
    Menu.prototype.rotAnglesSection = function(visibility){
        disableUIElementModule.disableElement({
            rotAngleSection:{
                value: visibility   
            }
        });
    };
    Menu.prototype.hideChainIcon = function(argument){
        disableUIElementModule.disableElement({
            hideChainIcon:{
                value: {
                    value: argument.hide,
                    id: argument.id
                }
            }
        });
    };
    Menu.prototype.btnTangentState = function(argument){
        motifTabModule.btnTangentState(argument);
    };
    Menu.prototype.setAtomEntryVisibility = function(argument){
        motifTabModule.setAtomEntryVisibility(argument);
    };
    Menu.prototype.breakChain = function(argument){
        motifTabModule.breakChain(argument);
    };
    Menu.prototype.getChainLevel = function(id){
        motifTabModule.getChainLevel(id);
    };
                
    // PnD Tab //
    Menu.prototype.editPlaneInputs = function(values){
        var argument = {};
        _.each(values, function($parameter, k) {
            argument[k] = {
                value: values[k]
            }
        });
        setUIValueModule.setValue(argument); 
    };
    Menu.prototype.getPlaneInputs = function(){
        return getUIValueModule.getValue({
            planeColor: {id:'planeColor'}, 
            planeName: {id:'planeName'}, 
            planeOpacity: {id:'planeOpacity'}, 
            millerH: {id:'millerH'}, 
            millerK: {id:'millerK'}, 
            millerL: {id:'millerL'}, 
            millerI: {id:'millerI'}
        });
    };
    Menu.prototype.disablePlaneInputs = function(values){
        var argument = {};
        _.each(values, function($parameter, k) {
            argument[k] = {
                value: values[k]
            }
        });
        disableUIElementModule.disableElement(argument); 
    };
    Menu.prototype.disablePlaneButtons = function(values){
        var argument = {};
        _.each(values, function($parameter, k){
            argument[k] = {
                value: values[k]
            }
        });
        disableUIElementModule.disableElement(argument);
    };
    Menu.prototype.highlightPlaneEntry = function(argument){
         pndTabModule.highlightPlaneEntry(argument);
    };
    Menu.prototype.editSavedPlane = function(argument){
        pndTabModule.editPlane(argument);
    };
    Menu.prototype.setPlaneEntryVisibility = function(argument){
        pndTabModule.setPlaneEntryVisibility(argument);
    };

    Menu.prototype.editDirectionInputs = function(values){
        var argument = {};
        _.each(values, function($parameter, k) {
            argument[k] = {
                value: values[k]
            }
        });
        setUIValueModule.setValue(argument);
    };
    Menu.prototype.getDirectionInputs = function(argument){
        return getUIValueModule.getValue({
            directionColor: {id:'directionColor'}, 
            directionName: {id:'directionName'}, 
            dirRadius: {id:'dirRadius'}, 
            millerU: {id:'millerU'}, 
            millerV: {id:'millerV'}, 
            millerW: {id:'millerW'}, 
            millerT: {id:'millerT'}
        });
    };
    Menu.prototype.disableDirectionInputs = function(values){
        var argument = {};
        _.each(values, function($parameter, k) {
            argument[k] = {
                value: values[k]
            }
        });
        disableUIElementModule.disableElement(argument);   
    };
    Menu.prototype.disableDirectionButtons = function(values){
        var argument = {};
        _.each(values, function($parameter, k) {
            argument[k] = {
                value: values[k]
            }
        });
        disableUIElementModule.disableElement(argument);
    };
    Menu.prototype.highlightDirectionEntry = function(argument){
        pndTabModule.highlightDirectionEntry(argument);
    };
    Menu.prototype.editSavedDirection = function(argument){
        pndTabModule.editDirection(argument);
    };
    Menu.prototype.setDirectionEntryVisibility = function(argument){
        pndTabModule.setDirectionEntryVisibility(argument);
    };

    // Visual Tab //
    Menu.prototype.chooseActiveRenderMode = function(id){
        visualTabModule.chooseActiveRenderMode(id);
    };
    Menu.prototype.chooseActiveCrystalMode = function(id){
        visualTabModule.chooseActiveCrystalMode(id);
    };
    Menu.prototype.chooseActiveUnitCellMode = function(id){
        visualTabModule.chooseActiveUnitCellMode(id);
    };
    Menu.prototype.disableRenderizationButtons = function(argument){
        visualTabModule.disableRenderizationButtons(argument);
    };
    Menu.prototype.disableCrystalButtons = function(argument){
        visualTabModule.disableCrystalButtons(argument);
    };
    Menu.prototype.disableUnitCellButtons = function(argument){
        visualTabModule.disableUnitCellButtons(argument);
    };
    
    // Public Library Tab //
    Menu.prototype.setSaveOnlineLink = function(link){
        libraryTabModule.setSaveOnlineLink(link);  
    };
    Menu.prototype.setQRImage = function(imgLink){
        libraryTabModule.setQRImage(imgLink);  
    };
            
    // Sliders (Direct Edit) //
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
        latticeTabModule.updateLatticeLabels();
    };
    Menu.prototype.changeSliderValue = function(name, val, event) {
        // Also publishes the event //
        var sliderName = name+'Slider';
        jQuery('#'+sliderName).slider('value',val);
        jQuery('#'+name).val(val);
        PubSub.publish(event, {sliderName,val});
    };
                
    // Subscribers //
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
    Menu.prototype.onAtomCustomization  = function(callback){
        PubSub.subscribe(events.ATOM_CUSTOMIZATION, callback);
    }
    Menu.prototype.on3DPrinting = function(callback){
        PubSub.subscribe(events.THREE_D_PRINTING, callback);
    };
    Menu.prototype.onPlaneParallel = function(callback){
        PubSub.subscribe(events.PLANE_PARALLEL, callback);
    };
    Menu.prototype.onPlaneInterception = function(callback){
        PubSub.subscribe(events.PLANE_INTERCEPTION, callback);
    };
    Menu.prototype.onLabelToggle = function(callback){
        PubSub.subscribe(events.LABEL_TOGGLE, callback);
    };
    Menu.prototype.onHighlightTangency = function(callback){
        PubSub.subscribe(events.HIGHLIGHT_TANGENCY, callback);
    };
    Menu.prototype.onAutoUpdate = function(callback){
        PubSub.subscribe(events.AUTO_UPDATE, callback);
    };
    Menu.prototype.onDownloadProject = function(callback){
        PubSub.subscribe(events.DOWNLOAD_PROJECT, callback);
    };
    Menu.prototype.onDownloadQR = function(callback){
        PubSub.subscribe(events.DOWNLOAD_QR, callback);
    };
    Menu.prototype.onOpenQR = function(callback){
        PubSub.subscribe(events.OPEN_QR, callback);
    };
    Menu.prototype.onSideBySide3D = function(callback){
        PubSub.subscribe(events.SIDE_BY_SIDE_3D, callback);
    };
    Menu.prototype.onOnTop3D = function(callback){
        PubSub.subscribe(events.ON_TOP_3D, callback);
    };

    return Menu;
});