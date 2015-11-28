/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'bootstrap',
    'icheck',
    'jColor'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    bootstrap,
    icheck,
    jColor
) 
{    
    
    // TO AVOID INFITE LOOPING, INPUTS CHANGE SLIDERS FROM THIS MODULE, BUT SLIDERS SHOULD CHANGE INPUTS LOCALLY FROM, THEIR HANDLER.
    // TO SUM UP, IN ORDER FOR THE SYSTEM TO MOVE A SLIDER, IT HAS TO CHANGE THE INPUT FROM THIS MODULE.
    
    // Variables
    var $selector = undefined;
    var allowPublish = false;
    
    // Modules References
    var $interfaceResizer = undefined;
    var $messages = undefined;
    var $tooltipGenerator = undefined;
    var $stringEditor = undefined;
    var $getUIValue = undefined;
    
    // Grouping
    var renderizationMode = {
        'realistic': jQuery('#realistic'),
        'wireframe': jQuery('#wireframe'),
        'toon': jQuery('#toon'),
        'flat': jQuery('#flat')
    };
    var stereoscopic = {
        'anaglyph': jQuery('#anaglyph'),
        'oculus': jQuery('#oculus'),
        'onTop': jQuery('#3DonTop'),
        'sideBySide': jQuery('#3DsideBySide')
    };
    var crystalMode = {
        'crystalClassic': jQuery('#crystalClassic'),
        'crystalSubstracted': jQuery('#crystalSubstracted'),
        'crystalSolidVoid': jQuery('#crystalSolidVoid'),
        'crystalGradeLimited': jQuery('#crystalGradeLimited')
    };
    var unitCellMode = {
        'cellClassic': jQuery('#cellClassic'),
        'cellSubstracted': jQuery('#cellSubstracted'),
        'cellSolidVoid': jQuery('#cellSolidVoid'),
        'cellGradeLimited': jQuery('#cellGradeLimited')
    };
    var zoomOptions = {
        70: jQuery('#zoom70'),   
        80: jQuery('#zoom80'),   
        90: jQuery('#zoom90'),   
        100: jQuery('#zoom100'),
        auto: jQuery('#autoZoom')
    };
    
    // Published Events
    var events = {
        AUTO_UPDATE: 'menu.auto_update',
        SIDE_BY_SIDE_3D: 'menu.side_by_side_3d',
        ON_TOP_3D: 'menu.on_top_3d',
        OPEN_QR: 'menu.open_qr',
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
        DIALOG_RESULT: 'menu.dialog_result',
        LABEL_TOGGLE: 'menu.label_toggle',
        DOWNLOAD_PROJECT: 'menu.download_project',
        DOWNLOAD_QR: 'menu.download_qr',
        HIGHLIGHT_TANGENCY: 'menu.highlight_tangency'
    }; 
    
    // Contructor //
    function setUIValue(argument) {
        
        // Acquire Module References //
        if (!(_.isUndefined(argument.interfaceResizer))) $interfaceResizer = argument.interfaceResizer;
        else return false;
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.getUIValue))) $getUIValue = argument.getUIValue;
        else return false;
    };
    function takeAction(index,selector,value){
        
        // If setting a new value fails, block publish //
        var success = true;
        switch(index){
            
            // Menu Ribbon
            case 'xyzAxes':{
                if (value === true) selector.parent().addClass('lightThemeActive');
                else selector.parent().removeClass('lightThemeActive');
                $interfaceResizer.showCanvasXYZLabels(value);
                break;
            }
            case 'abcAxes':{
                if (value === true) selector.parent().addClass('lightThemeActive');
                else selector.parent().removeClass('lightThemeActive');
                $interfaceResizer.showCanvasABCLabels(value);
                break;
            }
            case 'edges':{
                if (value === true) {
                    jQuery('[name=gridCheckButton]').iCheck('check');
                    selector.parent().addClass('lightThemeActive');
                }
                else {
                    jQuery('[name=gridCheckButton]').iCheck('uncheck');
                    selector.parent().removeClass('lightThemeActive');
                }
                break;
            }
            case 'faces':{
                if (value === true) {
                    jQuery('[name=faceCheckButton]').iCheck('check');
                    selector.parent().addClass('lightThemeActive');
                }
                else {
                    jQuery('[name=faceCheckButton]').iCheck('uncheck');
                    selector.parent().removeClass('lightThemeActive');
                }
                break;
            }
            case 'latticePoints':{
                if (value === true) selector.parent().addClass('lightThemeActive');
                else selector.parent().removeClass('lightThemeActive');
                break;
            }
            case 'planes':{
                if (value === true) {
                    jQuery('#planesTable').find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.parent().addClass('lightThemeActive');
                }
                else {
                    jQuery('#planesTable').find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.parent().removeClass('lightThemeActive');
                }
                publishAction('planes',value);
                break;
            }
            case 'directions':{
                if (value === true) {
                    jQuery('#directionTable').find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.parent().addClass('lightThemeActive');
                }
                else {
                    jQuery('#directionTable').find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.parent().removeClass('lightThemeActive');
                }
                publishAction('directions',value);
                break;
            }
            case 'atomToggle':{
                if (value === true) selector.parent().addClass('lightThemeActive');
                else selector.parent().removeClass('lightThemeActive');
                break;
            }
            case 'atomRadius':{
                if (value === true) {
                    jQuery('#atomRadiusSliderContainer').show('slow');
                    selector.parent().addClass('lightThemeActive');
                }
                else {
                    jQuery('#atomRadiusSliderContainer').hide('slow');
                    selector.parent().removeClass('lightThemeActive');
                }
                break;
            }
            case 'unitCellViewport':{
                if (value === true) selector.parent().addClass('lightThemeActive');
                else selector.parent().removeClass('lightThemeActive');
                $interfaceResizer.viewport(value);
                break;
            }
            case 'labelToggle':{
                if (value === true) selector.parent().addClass('lightThemeActive');
                else selector.parent().removeClass('lightThemeActive');
                break;
            }
            case 'highlightTangency':{
                if (value === true) selector.parent().addClass('lightThemeActive');
                else selector.parent().removeClass('lightThemeActive');
                break;
            }
            
            // Lattice Tab
            case 'latticePadlock':{
                if (value === true) {
                    if (!(selector.children().addClass('active'))) selector.find('a').button('toggle');
                    selector.children().addClass('active');
                }
                else {
                    if (selector.children().addClass('active')) selector.find('a').button('toggle');
                    selector.children().removeClass('active');
                }
                break;
            }
            case 'selectedLattice':{
                jQuery('#selected_lattice').html(value);
                break;
            }
            case 'gridCheckButton':{
                if (value === true) selector.addClass('active');
                else selector.removeClass('active');
                takeAction('edges',jQuery('#edges'),value);
                break;
            }
            case 'faceCheckButton':{
                if (value === true) selector.addClass('active');
                else selector.removeClass('active');
                takeAction('faces',jQuery('#faces'),value);
                break;
            }
            case 'cylinderColor':{
                selector.children().css('background','#'+value);
                break;  
            }
            case 'faceColor':{
                selector.children().css('background','#'+value);
                break;  
            }
            case 'repeatX':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'repeatY':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'repeatZ':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'radius':{
                var newVal = $stringEditor.inputIsInteger(value);
                if (newVal !== false) {
                    takeAction('radiusSlider',jQuery('#radiusSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'radiusSlider':{
                selector.slider('value',value);
                break;
            }
            case 'faceOpacity':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) {
                    takeAction('faceOpacitySlider',jQuery('#faceOpacitySlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'faceOpacitySlider':{
                selector.slider('value',value);
                break;
            }
            case 'alpha':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('alphaSlider',jQuery('#alphaSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'alphaSlider':{
                selector.slider('value',value);
                break;
            }
            case 'beta':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('betaSlider',jQuery('#betaSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'betaSlider':{
                selector.slider('value',value);
                break;
            }
            case 'gamma':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('gammaSlider',jQuery('#gammaSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'gammaSlider':{
                selector.slider('value',value);
                break;
            }
            case 'scaleX':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleXSlider',jQuery('#scaleXSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'scaleXMotif':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleXSlider',jQuery('#scaleXSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'scaleXSlider':{
                selector.slider('value',value);
                break;
            }
            case 'scaleY':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleYSlider',jQuery('#scaleYSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'scaleYMotif':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleYSlider',jQuery('#scaleYSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'scaleYSlider':{
                selector.slider('value',value.toString());
                break;
            }
            case 'scaleZ':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleZSlider',jQuery('#scaleZSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'scaleZMotif':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    takeAction('scaleZSlider',jQuery('#scaleZSlider'),newVal);
                    selector.val(newVal);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'scaleZSlider':{
                selector.slider('value',value);
                break;
            }
                
            // PnD Tab
            case 'planesColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
            case 'planesOpacity':{
                selector.val(value);
                break;
            }
            case 'planesName':{
                selector.val(value);
                break;
            }
            case 'millerH':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'millerK':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'millerL':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'millerI':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'directionColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
            case 'dirRadius':{
                selector.val(value);
                break;
            }
            case 'directionName':{
                selector.val(value);
                break;
            }
            case 'millerU':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'millerV':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'millerW':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'millerT':{
                var newVal = $stringEditor.inputIsInteger(value.toString());
                if (newVal !== false) selector.val(newVal);
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(19)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'planeVisibility':{
                if (value === false) {
                    selector.find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.find('.planeButton').removeClass('visible');
                }
                else {
                    selector.find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.find('.planeButton').addClass('visible');
                }
                break; 
            }
            case 'planeParallel':{
                if (value === false) selector.find('.parallel').removeClass('active');
                else selector.find('.parallel').addClass('active');
                break; 
            }
            case 'planeInterception':{
                if (value === false) selector.find('.interception').removeClass('active');
                else selector.find('.interception').addClass('active');
                break; 
            }
            case 'directionVisibility':{
                if (value === false) {
                    selector.find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.find('.directionButton').removeClass('visible');
                }
                else {
                    selector.find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.find('.directionButton').addClass('visible');
                }
                break; 
            }
            
            // Motif Tab
            case 'atomName':{
                if (value.atomName === '-') selector.hide('slow');
                else {
                    var newAtom = 'ch-' + value.atonName;
                    var newAtomName = $stringEditor.capitalizeFirstLetter(value.atomName);
                    selector.find('a').attr('class','ch');
                    if (value.ionicIndex !== '0' && value.ionicIndex !== '3b')
                        selector.find('a').html('<span style="font-size:17px;">'+newAtomName+'<sup>'+value.ionicIndex+'</sup></span>');
                    else selector.find('a').html(newAtomName);
                    selector.find('a').css('background',value.atomColor);
                    selector.show('slow');
                }   
                break;
            }
            case 'elementContainer':{
                jQuery('.element-symbol-container').find('a').removeAttr('class');
                jQuery('.element-symbol-container').find('a').attr('class',selector.attr('class'));
                if ( value !== '0' && (value !== '3b')) jQuery('.element-symbol-container').find('a').html('<span style="font-size:17px;">'+selector.html()+'<sup>'+value+'</sup></span>');
                else jQuery('.element-symbol-container').find('a').html(selector.html());
                jQuery('.element-symbol-container').show('slow');
                break;  
            }
            case 'atomPosX':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    selector.val(newVal);
                    takeAction('atomPosXSlider',jQuery('#atomPosXSlider'),value);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;
            }
            case 'atomPosXSlider':{
                selector.slider('value',value);
                break;   
            }
            case 'atomPosY':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    selector.val(newVal);
                    takeAction('atomPosYSlider',jQuery('#atomPosYSlider'),value);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;   
            }
            case 'atomPosYSlider':{
                selector.slider('value',value);
                break;   
            }
            case 'atomPosZ':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                if (newVal !== false) {
                    selector.val(newVal);
                    takeAction('atomPosZSlider',jQuery('#atomPosZSlider'),value);
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(20)
                    });
                    selector.val('');
                    success = false;
                }
                break;  
            }
            case 'atomPosZSlider':{
                selector.slider('value',value);
                break;   
            }
            case 'cellVolume':{
                var newVal = $stringEditor.inputIsNumber(value.toString());
                var tangency = $getUIValue.getValue({ 'tangency': { 'id': 'tangency' } });
                if (newVal !== false){
                    if (tangency.tangency === true){
                        if (newVal > 90) takeAction('cellVolumeSlider',jQuery('#cellVolumeSlider'),newVal);
                        else {
                            $tooltipGenerator.showTooltip({
                                'target': index,
                                'placement': 'top',
                                'message': $messages.getMessage(22)
                            });
                            takeAction('cellVolumeSlider',jQuery('#cellVolumeSlider'),90);
                            selector.val(90);
                            success = false;
                        }
                    }
                    else if (newVal > 0) takeAction('cellVolumeSlider',jQuery('#cellVolumeSlider'),newVal);
                    else {
                        $tooltipGenerator.showTooltip({
                            'target': index,
                            'placement': 'top',
                            'message': $messages.getMessage(22)
                        });
                        takeAction('cellVolumeSlider',jQuery('#cellVolumeSlider'),0);
                        selector.val(0);
                        success = false;
                    }
                }
                else {
                    $tooltipGenerator.showTooltip({
                        'target': index,
                        'placement': 'top',
                        'message': $messages.getMessage(22)
                    });
                    takeAction('cellVolumeSlider',jQuery('#cellVolumeSlider'),100);
                    selector.val(100);
                    success = false;
                }
                break;   
            }
            case 'cellVolumeSlider':{
                selector.slider('value',value);
                break;   
            }
            case 'tangency':{
                if (value === true) selector.parent().removeClass('purpleThemeActive');
                else selector.parent().addClass('purpleThemeActive');
                break;   
            }
            case 'atomPositioningXYZ':{
                var tempValue = undefined;
                if ((_.isUndefined(value.toggle))) {
                    takeAction('atomPositioningABC',jQuery('#atomPositioningABC'),{value:!value,toggle:true});
                    tempValue = value;
                }
                else tempValue = value.value;
                if (tempValue === true){
                    selector.addClass('buttonPressed');
                    selector.removeClass('btn-light');
                    selector.addClass('btn-purple');
                    jQuery('label[for=txt_coordinates_x]').html('x');
                    jQuery('label[for=txt_coordinates_y]').html('y');
                    jQuery('label[for=txt_coordinates_z]').html('z');
                }
                else{  
                    selector.removeClass('buttonPressed');
                    selector.removeClass('btn-purple');
                    selector.addClass('btn-light');
                }
                break;
            }
            case 'atomPositioningABC':{
                var tempValue = undefined;
                if ((_.isUndefined(value.toggle))) {
                    takeAction('atomPositioningXYZ',jQuery('#atomPositioningXYZ'),{value:!value,toggle:true});
                    tempValue = value;
                }
                else tempValue = value.value;
                if (tempValue === true){
                    selector.addClass('buttonPressed');
                    selector.removeClass('btn-light');
                    selector.addClass('btn-purple');
                    jQuery('label[for=txt_coordinates_x]').html('a');
                    jQuery('label[for=txt_coordinates_y]').html('b');
                    jQuery('label[for=txt_coordinates_z]').html('c');
                }
                else{  
                    selector.removeClass('buttonPressed');
                    selector.removeClass('btn-purple');
                    selector.addClass('btn-light');
                }
                break;
            }
            case 'lockCameras':{
                if (value === true) {
                    selector.addClass('active');
                    selector.find('img').attr('src','Images/lockCamerasActive.png');
                }
                else {
                    selector.removeClass('active');
                    selector.find('img').attr('src','Images/lockCameras.png');
                }
                break; 
            }
            case 'swapButton':{
                if (value === true) selector.addClass('motif');
                else selector.removeClass('motif');
                break;
            }
            case 'atomVisibility':{
                if (value === false) {
                    selector.find('.atomButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.find('.atomButton').removeClass('visible');
                }
                else {
                    selector.find('.atomButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.find('.atomButton').addClass('visible');
                }
                break; 
            }
            case 'atomColor':{
                selector.children().css('background',value);
                selector.spectrum('set',value);
                break;
            }
            case 'atomOpacity':{
                selector.val(value);
                takeAction('atomOpacitySlider',jQuery('#atomOpacitySlider'),value);
                break;
            }
            case 'atomOpacitySlider':{
                selector.slider('value',value);
                break;
            }
            case 'rotAngleTheta':{
                selector.val(value);
                break;
            }
            case 'rotAnglePhi':{
                selector.val(value);
                break;
            }
            case 'rotAngleX':{
                selector.text(value);
                break;
            }
            case 'rotAngleY':{
                selector.text(value);
                break;
            }
            case 'rotAngleZ':{
                selector.text(value);
                break;
            }
                
            // Visual Tab
            case 'wireframe':{} //Move to realistic handler
            case 'toon':{} //Move to realistic handler
            case 'flat':{} //Move to realistic handler
            case 'realistic':{
                if (value === true){
                    _.each(renderizationMode, function($param, a) { $param.removeClass('active');});
                    selector.addClass('active');
                }
                else selector.removeClass('active');
                break;
            }
            case 'lights':{
                if (value === true) selector.addClass('active');
                else selector.removeClass('active');
                break;
            }
            case 'distortionOn':{
                if (value === true) {
                    selector.addClass('active');
                    jQuery('#distortionOff').removeClass('active');
                }
                else {
                    selector.removeClass('active');
                    jQuery('#distortionOff').addClass('active');
                }
                break;
            }
            case 'distortionOff':{
                if (value === true) {
                    selector.addClass('active');
                    jQuery('#distortionOn').removeClass('active');
                }
                else {
                    selector.removeClass('active');
                    jQuery('#distortionOn').addClass('active');
                }
                break;
            }
            case 'anaglyph':{
                if (value === true){
                    _.each(stereoscopic, function($param, a) { $param.removeClass('active');});
                    selector.addClass('active');
                }
                else selector.removeClass('active');
                break;
            }
            case 'oculus':{
                if (value === true){
                    _.each(stereoscopic, function($param, a) { $param.removeClass('active');});
                    selector.addClass('active');
                }
                else selector.removeClass('active');
                break;
            }
            case 'sideBySide':{
                if (value === true){
                    _.each(stereoscopic, function($param, a) { $param.removeClass('active');});
                    selector.addClass('active');
                }
                else selector.removeClass('active');
                break;
            }
            case 'onTop':{
                if (value === true){
                    _.each(stereoscopic, function($param, a) { $param.removeClass('active');});
                    selector.addClass('active');
                }
                else selector.removeClass('active');
                break;
            }
            case 'crystalCamTargetOn':{
                if (value === true) {
                    selector.addClass('active');
                    jQuery('#crystalCamTargetOff').removeClass('active');
                }
                else {
                    selector.removeClass('active');
                    jQuery('#crystalCamTargetOff').addClass('active');
                }
                break;
            }
            case 'crystalCamTargetOff':{
                if (value === true) {
                    selector.addClass('active');
                    jQuery('#crystalCamTargetOn').removeClass('active');
                }
                else {
                    selector.removeClass('active');
                    jQuery('#crystalCamTargetOn').addClass('active');
                }
                break;
            }
            case 'fullScreen':{
                if (value === false) {
                    if (selector.hasClass('active')) selector.button('toggle');
                }
                else {
                    if (!(selector.hasClass('active'))) selector.button('toggle');   
                }
                break;
            }
            case 'leapMotion':{
                if (value === false) {
                    if (selector.hasClass('active')) selector.button('toggle');
                }
                else {
                    if (!(selector.hasClass('active'))) selector.button('toggle');   
                }
                break;
            }
            case 'crystalClassic':{} // Move to crystalGradeLimited handler
            case 'crystalSubstracted':{} // Move to crystalGradeLimited handler
            case 'crystalSolidVoid':{} // Move to crystalGradeLimited handler
            case 'crystalGradeLimited':{ 
                if (value === true){
                    _.each(crystalMode, function($param, a) { $param.removeClass('active');});
                    selector.addClass('active');
                }
                else selector.removeClass('active');
                break;
            }
            case 'cellClassic':{} // Move to cellGradeLimited handler
            case 'cellSubstracted':{} // Move to cellGradeLimited handler
            case 'cellSolidVoid':{} // Move to cellGradeLimited handler
            case 'cellGradeLimited':{
                if (value === true){
                    _.each(unitCellMode, function($param, a) { $param.removeClass('active');});
                    selector.addClass('active');
                }
                else selector.removeClass('active');
                break;
            }
            case 'autoZoom':{
                _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                selector.addClass('active');
                $interfaceResizer.autoZoom(true);
                window.dispatchEvent(new Event('resize'));
                break;
            }
            case 'zoom100':{
                _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                selector.addClass('active');
                $interfaceResizer.autoZoom(false);
                $interfaceResizer.transformMenu(1);
                break;
            } 
            case 'zoom90':{
                _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                selector.addClass('active');
                $interfaceResizer.autoZoom(false);
                $interfaceResizer.transformMenu(0.9);
                break;
            } 
            case 'zoom80':{
                _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                selector.addClass('active');
                $interfaceResizer.autoZoom(false);
                $interfaceResizer.transformMenu(0.8);
                break;
            } 
            case 'zoom70':{
                _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                selector.addClass('active');
                $interfaceResizer.autoZoom(false);
                $interfaceResizer.transformMenu(0.7);
                break;
            }
            case 'fog':{
                if (value === true) {
                    selector.addClass('active');
                    selector.icheck('check');
                }
                else {
                    selector.addClass('active');
                    selector.icheck('uncheck');
                }
                break;
            }
            case 'fogColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
            case 'fogDensity':{
                selector.val(value);
                takeAction('fogDensitySlider',jQuery('#fogDensitySlider'),value);
                break;
            }
            case 'fogDensitySlider':{
                selector.slider('value',value);
                break;
            }
            case 'sounds':{
                if (value === true) {
                    selector.addClass('active');
                    takeAction('soundSliderToggle',jQuery('#soundSlider'),true);
                }
                else {
                    selector.removeClass('active');
                    takeAction('soundSliderToggle',jQuery('#soundSlider'),false);
                }
                break;
            }
            case 'soundSliderToggle':{
                if (value === true) selector.slider('enable');
                else selector.slider('disable');
                break;
            }
            case 'crystalScreenColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
            case 'cellScreenColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
            case 'motifXScreenColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
            case 'motifYScreenColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
            case 'motifZScreenColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
                
            // Library Tab
            case 'noteColor':{
                selector.spectrum('set',value);
                selector.children().css('background',value);
                break;
            }
            case 'noteVisibility':{
                if (value === false) {
                    selector.find('.noteButton').find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.find('.noteButton').removeClass('visible');
                }
                else {
                    selector.find('.noteButton').find('img').attr('src','Images/visible-icon-sm.png');
                    selector.find('.noteButton').addClass('visible');
                }
                break; 
            }
                
            //IAC Box
            case 'iacVisibility':{
                if (value === true) {
                    selector.find('img').attr('src','Images/visible-icon-sm.png');
                    selector.removeClass('notVisible');
                }
                else {
                    selector.find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.addClass('notVisible');
                } 
                break;
            }
            case 'iacColor':{
                selector.children().css('background',value);
                break;
            }
            case 'iacOpacity':{
                selector.val(value);
                takeAction('iacOpacitySlider',jQuery('#iacOpacitySlider'),value);
                break;
            }
            case 'iacOpacitySlider':{
                selector.slider('value',value);
                break;
            }
            
            case 'reset':{
                takeAction('selectedLattice',jQuery('#selected_lattice'),$messages.getMessage(18));
                takeAction('latticePadlock',jQuery('#latticePadlock'),false);
                takeAction('repeatX',jQuery('#repeatX'),1);
                takeAction('repeatY',jQuery('#repeatY'),1);
                takeAction('repeatZ',jQuery('#repeatZ'),1);
                break;
            }
                
        };
        allowPublish = success;
    };
    function publishAction(index,value){
        switch(index){
            
            // Menu Ribbon
            case 'xyzAxes':{
                PubSub.publish(events.AXIS_MODE, value);
                break;
            }
            case 'abcAxes':{
                PubSub.publish(events.AXIS_MODE, value);
                break;
            }
            case 'latticePoints':{
                PubSub.publish(events.LATTICE_POINTS_TOGGLE, value);
                break;
            }
            case 'planes':{
                PubSub.publish(events.PLANE_TOGGLE, value);
                break;
            }
            case 'directions':{
                PubSub.publish(events.DIRECTION_TOGGLE, value);
                break;
            }
            case 'atomToggle':{
                PubSub.publish(events.ATOM_TOGGLE, value);
                break;
            }
            case 'atomRadius':{
                PubSub.publish(events.CHANGE_CRYSTAL_ATOM_RADIUS, value);
                break;
            }
            case 'unitCellViewport':{
                PubSub.publish(events.UC_CRYSTAL_VIEWPORT, value);
                break;
            }
            case 'labelToggle':{
                PubSub.publish(events.LABEL_TOGGLE, value);
                break;
            }
            case 'highlightTangency':{
                PubSub.publish(events.HIGHLIGHT_TANGENCY, value);
                break;
            }
            
            // Motif tab
            case 'atomOpacity':{
                PubSub.publish(events.ATOM_PARAMETER_CHANGE, value);
                break;
            }
            case 'atomColor':{
                PubSub.publish(events.ATOM_PARAMETER_CHANGE, value);
                break;
            }
            case 'atomPosX':{
                PubSub.publish(events.ATOM_POSITION_CHANGE, value);
                break;
            }
            case 'atomPosY':{
                PubSub.publish(events.ATOM_POSITION_CHANGE, value);
                break;
            }
            case 'atomPosZ':{
                PubSub.publish(events.ATOM_POSITION_CHANGE, value);
                break;
            }
            case 'cellVolume':{
                PubSub.publish(events.CELL_VOLUME_CHANGE, value);
                break;
            }
            case 'tangentR':{
                PubSub.publish(events.TANGENTR, value);
                break;
            }
            case 'tangency':{
                PubSub.publish(events.ATOM_TANGENCY_CHANGE, value);
                break;
            }
            case 'previewAtomChanges':{
                PubSub.publish(events.MOTIF_TO_LATTICE, value);
                break;
            }
            case 'saveAtomChanges':{
                PubSub.publish(events.ATOM_SUBMIT, value);
                break;
            }
            case 'deleteAtom':{
                PubSub.publish(events.ATOM_SUBMIT, value);
                break;
            }
            case 'atomPositioningXYZ':{
                PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, value);
                break;
            }
            case 'atomPositioningABC':{
                PubSub.publish(events.CHANGE_ATOM_POSITIONING_MODE, value);
                break;
            }
            case 'lockCameras':{
                PubSub.publish(events.MOTIF_CAMERASYNC_CHANGE, value);
                break;
            }
            case 'swapButton':{
                PubSub.publish(events.SWAP_SCREEN, value);
                break;
            }
            case 'rotatingAngles':{
                PubSub.publish(events.SET_ROTATING_ANGLE, value);
                break;
            }
               
            // Lattice Tab
            case 'motifPadlock':{
                PubSub.publish(events.SET_PADLOCK, value);
                break;  
            }
            case 'gridCheckButton':{
                PubSub.publish(events.GRADE_CHOICES, value);
                break;  
            }
            case 'faceCheckButton':{
                PubSub.publish(events.GRADE_CHOICES, value);
                break;  
            }
            case 'cylinderColor':{
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, value);
                break;  
            }
            case 'faceColor':{
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, value);
                break;  
            }
            case 'repeatX':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'repeatY':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'repeatZ':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'faceOpacity':{
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, value);
                break;
            }
            case 'radius':{
                PubSub.publish(events.GRADE_PARAMETER_CHANGE, value);
                break;
            }
            case 'alpha':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'alphaMotif':{
                PubSub.publish(events.MAN_ANGLE_CHANGE, value);
                break;
            }
            case 'beta':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'betaMotif':{
                PubSub.publish(events.MAN_ANGLE_CHANGE, value);
                break;
            }
            case 'gamma':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'gammaMotif':{
                PubSub.publish(events.MAN_ANGLE_CHANGE, value);
                break;
            }
            case 'scaleX':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'scaleXMotif':{
                PubSub.publish(events.AXYZ_CHANGE, value);
                break;
            }
            case 'scaleY':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'scaleYMotif':{
                PubSub.publish(events.AXYZ_CHANGE, value);
                break;
            }
            case 'scaleZ':{
                PubSub.publish(events.LATTICE_PARAMETER_CHANGE, value);
                break;
            }
            case 'scaleZMotif':{
                PubSub.publish(events.AXYZ_CHANGE, value);
                break;
            }
            case 'motifRefresh':{
                PubSub.publish(events.MOTIF_TO_LATTICE, value);
                break;
            }
            case 'selectAtom':{
                PubSub.publish(events.SAVED_ATOM_SELECTION, value);
                break;
            }
            case 'atomVisibility':{
                PubSub.publish(events.ATOM_VISIBILITY, value);
                break;
            }
            case 'autoUpdate':{
                PubSub.publish(events.AUTO_UPDATE, value);
                break;
            }
                
            // PnD Tab
            case 'planesColor':{
                console.log('asd');
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'planesOpacity':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'planesName':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerH':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerK':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerL':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerI':{
                PubSub.publish(events.PLANE_PARAMETER_CHANGE, value);
                break;
            }
            case 'directionColor':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'dirRadius':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'directionName':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerU':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerV':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerW':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'millerT':{
                PubSub.publish(events.DIRECTION_PARAMETER_CHANGE, value);
                break;
            }
            case 'selectPlane':{
                PubSub.publish(events.PLANE_SELECTION, value);
                break;
            }
            case 'planeVisibility':{
                PubSub.publish(events.PLANE_VISIBILITY, value);
                break;
            }
            case 'planeParallel':{
                PubSub.publish(events.PLANE_PARALLEL, value);
                break;
            }
            case 'planeInterception':{
                PubSub.publish(events.PLANE_INTERCEPTION, value);
                break;
            }
            case 'selectDirection':{
                PubSub.publish(events.DIRECTION_SELECTION, value);
                break;
            }
            case 'directionVisibility':{
                PubSub.publish(events.DIRECTION_VISIBILITY, value);
                break;
            }
                
            // Visual Tab
            case 'wireframe': {
                PubSub.publish(events.CHANGE_REND_MODE, value);
                break;
            }
            case 'toon': {
                PubSub.publish(events.CHANGE_REND_MODE, value);
                break;
            }
            case 'flat': {
                PubSub.publish(events.CHANGE_REND_MODE, value);
                break;
            }
            case 'realistic': {
                PubSub.publish(events.CHANGE_REND_MODE, value);
                break;
            }
            case 'lights':{
                PubSub.publish(events.SET_LIGHTS, value);
                break;
            }
            case 'distortionOn':{
                PubSub.publish(events.MOTIF_DISTORTION_CHANGE, value);
                break;
            }
            case 'distortionOff':{
                PubSub.publish(events.MOTIF_DISTORTION_CHANGE, value);
                break;
            }
            case 'anaglyph':{
                PubSub.publish(events.ANAGLYPH_EFFECT, value);
                break;
            }
            case 'oculus':{
                PubSub.publish(events.OCULUS, value);
                break;
            }
            case 'sideBySide':{
                PubSub.publish(events.SIDE_BY_SIDE_3D, value);
                break;
            }
            case 'onTop':{
                PubSub.publish(events.ON_TOP_3D, value);
                break;
            }
            case 'crystalCamTargetOn':{
                PubSub.publish(events.CRYSTAL_CAM_TARGET, value);
                break;
            }
            case 'crystalCamTargetOff':{
                PubSub.publish(events.CRYSTAL_CAM_TARGET, value);
                break;
            }
            case 'fullScreen':{
                PubSub.publish(events.FULL_SCREEN_APP, value);
                break;
            }
            case 'leapMotion':{
                PubSub.publish(events.LEAP_MOTION, value);
                break;
            }
            case 'crystalClassic':{
                PubSub.publish(events.CHANGE_CRYSTAL_MODE, value);
                break;
            }
            case 'crystalSubstracted':{
                PubSub.publish(events.CHANGE_CRYSTAL_MODE, value);
                break;
            }
            case 'crystalSolidVoid':{
                PubSub.publish(events.CHANGE_CRYSTAL_MODE, value);
                break;
            }
            case 'crystalGradeLimited':{
                PubSub.publish(events.CHANGE_CRYSTAL_MODE, value);
                break;
            }
            case 'cellClassic':{
                PubSub.publish(events.CHANGE_UNIT_CELL_MODE, value);
                break;
            }
            case 'cellSubstracted':{
                PubSub.publish(events.CHANGE_UNIT_CELL_MODE, value);
                break;
            }
            case 'cellSolidVoid':{
                PubSub.publish(events.CHANGE_UNIT_CELL_MODE, value);
                break;
            }
            case 'cellGradeLimited':{
                PubSub.publish(events.CHANGE_UNIT_CELL_MODE, value);
                break;
            }
            case 'fog': {
                PubSub.publish(events.FOG_CHANGE, value);
                break;
            }
            case 'fogDensity': {
                PubSub.publish(events.FOG_PARAMETER_CHANGE, value);
                break;
            }
            case 'fogColor': {
                PubSub.publish(events.FOG_PARAMETER_CHANGE, value);
                break;
            }
            case 'sounds': {
                PubSub.publish(events.SET_SOUNDS, value);
                break;
            }
            case 'soundVolume': {
                PubSub.publish(events.SOUND_VOLUME, value);
                break;
            }
            case 'crystalScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case 'cellScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case 'motifXScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case 'motifYScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case 'motifZScreenColor':{
                PubSub.publish(events.RENDERER_COLOR_CHANGE, value);
                break;
            }
            case '3DPrinting':{
                PubSub.publish(events.THREE_D_PRINTING, value);
                break;
            }
                
            // Public Library Tab
            case 'downloadProject':{
                PubSub.publish(events.DOWNLOAD_PROJECT, value);
                break;
            }
            case 'downloadQR':{
                PubSub.publish(events.DOWNLOAD_QR, value);
                break;
            }
            case 'openQRModal':{
                PubSub.publish(events.OPEN_QR, value);
                break;
            }
                
            // IAC Box
            case 'iacSound': {
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacVisibility':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacDoll':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacColor':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacClose':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
            case 'iacOpacity':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }

        };
    };
    
    setUIValue.prototype.setValue = function(argument){
        if (Object.keys(argument).length <= 0) return false;
        else {
            _.each(argument,function($parameter, k){
                
                // Read Value adn run action
                if (!(_.isUndefined($parameter.value))) {
                    // Select Element
                    if (_.isUndefined($parameter.other)) $selector = jQuery('#'+k);
                    else $selector = $parameter.other;
                    takeAction(k,$selector,$parameter.value);
                }
                else allowPublish = true;
                
                // Publish Event
                if (!(_.isUndefined($parameter.publish))) {
                    if (allowPublish === true) publishAction(k,$parameter.publish);
                }
                allowPublish = false;
            });
        }
    };
    
    return setUIValue;
});