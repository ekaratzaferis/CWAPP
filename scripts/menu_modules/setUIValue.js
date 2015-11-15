/*global define*/
'use strict';

// Dependecies

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
) 
{    
    
    // TO AVOID INFITE LOOPING, INPUTS CHANGE SLIDERS FROM THIS MODULE, BUT SLIDERS SHOULD CHANGE INPUTS LOCALLY FROM, THEIR HANDLER.
    // TO SUM UP, IN ORDER FOR THE SYSTEM TO MOVE A SLIDER, IT HAS TO CHANGE THE INPUT FROM THIS MODULE.
    
    // Variables
    var $selector = undefined;
    
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
        DIALOG_RESULT: 'menu.dialog_result'
    }; 
    
    // Contructor //
    function setUIValue() {
        
    };
    function takeAction(index,selector,value){
        switch(index){
                
            // System Sound //
            case 'sounds':{
                if (value === true) {
                    selector.addClass('active');
                    takeAction('soundSliderToggle',jQuery('#soundSlider'),true);
                }
                else {
                    selector.removeClass('active');
                    takeAction('soundSlider',jQuery('#soundSlider'),true);
                }
                break;
            }
                
            // System Sound Slider //
            case 'soundSliderToggle':{
                if (value === true) selector.slider('enable');
                else selector.slider('disable');
                break;
            }
            
            // Change IAC visibility
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
              
            // Change IAC color
            case 'iacColor':{
                selector.children().css('background',value);
                break;
            }
                
            // IAC Opacity Input
            case 'iacOpacity':{
                takeAction('iacOpacitySlider',jQuery('#iacOpacitySlider'),value);
                break;
            }
                
            // IAC Opacity Slider
            case 'iacOpacitySlider':{
                selector.slider('value',value);
                break;
            }
                
        };
    };
    function publishAction(index,value){
        switch(index){
            
            // System Sound 
            case 'sounds': {
                PubSub.publish(events.SET_SOUNDS, value);
                break;
            }
                
            // Sound Source 
            case 'sound': {
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
                
            // IAC visibility
            case 'iacVisibility':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
                
            // IAC Doll Mode
            case 'iacDoll':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
                
            // IAC Color
            case 'iacColor':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
                
            // IAC Close
            case 'iacClose':{
                PubSub.publish(events.ATOM_CUSTOMIZATION, value); 
                break;
            }
                
            // IAC Opacity
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