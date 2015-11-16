/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'bootstrap',
    'icheck'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    bootstrap,
    icheck
) 
{    
    
    // TO AVOID INFITE LOOPING, INPUTS CHANGE SLIDERS FROM THIS MODULE, BUT SLIDERS SHOULD CHANGE INPUTS LOCALLY FROM, THEIR HANDLER.
    // TO SUM UP, IN ORDER FOR THE SYSTEM TO MOVE A SLIDER, IT HAS TO CHANGE THE INPUT FROM THIS MODULE.
    
    // Variables
    var $selector = undefined;
    
    // Modules References
    var $interfaceResizer = undefined;
    
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
        '3D': jQuery('#3D')
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
        '70': jQuery('#zoom70'),   
        '80': jQuery('#zoom80'),   
        '90': jQuery('#zoom90'),   
        '100': jQuery('#zoom100')   
    }
    
    // Published Events
    var events = {
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
        HIGHLIGHT_TANGENCY: 'menu.highlight_tangency'
    }; 
    
    // Contructor //
    function setUIValue(argument) {
        
        // Acquire Module References //
        if (!(_.isUndefined(argument.interfaceResizer))) $interfaceResizer = argument.interfaceResizer;
        else return false;
        
    };
    function takeAction(index,selector,value){
        switch(index){
            
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
            case 'anaglyph':{} // Move to 3D handler
            case 'oculus':{} // Move to 3D handler
            case '3D':{
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
            case 'zoom100':{
                if (value === true){
                    var percentage = undefined;
                    _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                    selector.addClass('active');
                    $interfaceResizer.transformMenu(1);
                }
                else selector.removeClass('active');
                break;
            } 
            case 'zoom90':{
                if (value === true){
                    var percentage = undefined;
                    _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                    selector.addClass('active');
                    $interfaceResizer.transformMenu(0.9);
                }
                else selector.removeClass('active');
                break;
            } 
            case 'zoom80':{
                if (value === true){
                    var percentage = undefined;
                    _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                    selector.addClass('active');
                    $interfaceResizer.transformMenu(0.8);
                }
                else selector.removeClass('active');
                break;
            } 
            case 'zoom70':{
                if (value === true){
                    var percentage = undefined;
                    _.each(zoomOptions, function($param, a) { $param.removeClass('active'); });
                    selector.addClass('active');
                    $interfaceResizer.transformMenu(0.7);
                }
                else selector.removeClass('active');
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
                    takeAction('soundSliderToggle',jQuery('#soundSlider'),true);
                }
                break;
            }
            case 'soundSliderToggle':{
                if (value === true) selector.slider('enable');
                else selector.slider('disable');
                break;
            }
            case 'crystalScreenColor':{
                selector.children().css('background',value);
                break;
            }
            case 'cellScreenColor':{
                selector.children().css('background',value);
                break;
            }
            case 'motifXScreenColor':{
                selector.children().css('background',value);
                break;
            }
            case 'motifYScreenColor':{
                selector.children().css('background',value);
                break;
            }
            case 'motifZScreenColor':{
                selector.children().css('background',value);
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
                
        };
    };
    function publishAction(index,value){
        switch(index){
            
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
            case '3D':{
                
                break;
            } // empty
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
                
                // Publish Event
                if (!(_.isUndefined($parameter.publish))) publishAction(k,$parameter.publish);
            });
        }
    };
    
    return setUIValue;
});