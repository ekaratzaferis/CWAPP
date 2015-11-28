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
    // Variables
    var $selector = undefined;
    
    // Module References
    var $messages = undefined;
    
    // Grouping //
    var latticeParameters = {
        scaleX: jQuery('#scaleX'),
        scaleY: jQuery('#scaleY'),
        scaleZ: jQuery('#scaleZ'),
        alpha: jQuery('#alpha'),
        beta: jQuery('#beta'),
        gamma: jQuery('#gamma')
    };
    
    // Contructor //
    function disableUIElement(argument) {
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
    };
    function takeAction(index,selector,value){
        switch(index){
            
            
            // Lattice Tab //
            case 'latticePadlock':{
                if (value === false){
                    selector.find('a').prop('disabled', false);
                    selector.removeClass('disabled');
                }
                else {
                    selector.find('a').prop('disabled', true);
                    selector.addClass('disabled');
                }
                break;   
            }
            case 'motifPadlock':{
                if (value === false){
                    selector.find('a').prop('disabled', false);
                    selector.removeClass('disabled');
                }
                else {
                    selector.find('a').prop('disabled', true);
                    selector.addClass('disabled');
                }
                break;   
            }
            case 'latticeParameters':{
                _.each(latticeParameters, function($parameter,k){
                    if (value === true){
                        $parameter.prop('disabled',value);
                        jQuery('#'+k+'Slider').slider('disable');
                    }
                    else {
                        $parameter.prop('disabled',value);
                        jQuery('#'+k+'Slider').slider('enable');
                    }
                });   
            }
            case 'select_lattice': {
                if (value === true) {
                    jQuery('#selected_lattice').parent().addClass('disabled');
                    jQuery('#selected_lattice').addClass('disabled');
                }
                else {
                    jQuery('#selected_lattice').parent().removeClass('disabled');
                    jQuery('#selected_lattice').removeClass('disabled');
                }
                break;
            }
            case 'latticeRefreshButtons':{
                if (value === true) jQuery('.latticeButtons').hide();
                else jQuery('.latticeButtons').show();
                break;   
            }
            case 'repeatX':{
                selector.prop('disabled', value);
                break;
            }
            case 'repeatY':{
                selector.prop('disabled', value);
                break;
            }
            case 'repeatZ':{
                selector.prop('disabled', value);
                break;
            }
            case 'scaleX':{
                selector.prop('disabled', value);
                break;
            }
            case 'scaleY':{
                selector.prop('disabled', value);
                break;
            }
            case 'scaleZ':{
                selector.prop('disabled', value);
                break;
            }
            case 'alpha':{
                selector.prop('disabled', value);
                break;
            }
            case 'beta':{
                selector.prop('disabled', value);
                break;
            }
            case 'gamma':{
                selector.prop('disabled', value);
                break;
            }
                
            // PnD Tab //
            case 'planeName':{
                selector.prop('disabled', value);
                break;
            }
            case 'planeColor':{
                if (value === true) selector.spectrum('disable');
                else selector.spectrum('enable');
                break;
            }
            case 'planeOpacity':{
                selector.prop('disabled', value);
                break;
            }
            case 'millerH':{
                selector.prop('disabled', value);
                break;
            }
            case 'millerK':{
                selector.prop('disabled', value);
                break;
            }
            case 'millerL':{
                selector.prop('disabled', value);
                break;
            }
            case 'millerI':{
                selector.prop('disabled', value);
                break;
            }
            case 'directionName':{
                selector.prop('disabled', value);
                break;
            }
            case 'directionColor':{
                if (value === true) selector.spectrum('disable');
                else selector.spectrum('enable');
                break;
            }
            case 'dirRadius':{
                selector.prop('disabled', value);
                break;
            }
            case 'millerU':{
                selector.prop('disabled', value);
                break;
            }
            case 'millerV':{
                selector.prop('disabled', value);
                break;
            }
            case 'millerW':{
                selector.prop('disabled', value);
                break;
            }
            case 'millerT':{
                selector.prop('disabled', value);
                break;
            }
            case 'savePlane':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'deletePlane':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'newPlane':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'parallelPlane':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'saveDirection':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'deleteDirection':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'newDirection':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
                
            
            // Motif Tab //
            case 'motifPadlock':{
                if (value === false){
                    selector.find('a').prop('disabled', false);
                    selector.removeClass('disabled');
                }
                else {
                    selector.find('a').prop('disabled', true);
                    selector.add('disabled');
                }
                break;   
            }
            case 'atomPosX':{
                selector.prop('disabled', value);
                break;
            }
            case 'atomPosXSlider':{
                if(value === true) selector.slider('disable');
                else selector.slider('enable');
                break;
            }
            case 'atomPosY':{
                selector.prop('disabled', value);
                break;
            }
            case 'atomPosYSlider':{
                if(value === true) selector.slider('disable');
                else selector.slider('enable');
                break;
            }
            case 'atomPosZ':{
                selector.prop('disabled', value);
                break;
            }
            case 'atomPosZSlider':{
                if(value === true) selector.slider('disable');
                else selector.slider('enable');
                break;
            }
            case 'tangentR':{
                selector.prop('disabled', value);
                break;
            }
            case 'rotAngleTheta':{
                selector.prop('disabled', value);
                break;
            }
            case 'rotAnglePhi':{
                selector.prop('disabled', value);
                break;
            }
            case 'atomOpacity':{
                selector.prop('disabled', value);
                takeAction('atomOpacitySlider',jQuery('#atomOpacitySlider'),value);
                break;
            }
            case 'atomOpacitySlider':{
                if(value === true) selector.slider('disable');
                else selector.slider('enable');
                break;
            }
            case 'atomColor':{
                if (value === true) selector.spectrum('disable');
                else selector.spectrum('enable');
                break;
            }
            case 'atomPositioningXYZ':{
                if (value === true){
                    selector.addClass('disabled');
                    selector.parent().addClass('disabled');
                }
                else {
                    selector.removeClass('disabled');
                    selector.parent().removeClass('disabled');
                }
                break;
            }
            case 'atomPositioningABC':{
                if (value === true){
                    selector.addClass('disabled');
                    selector.parent().addClass('disabled');
                }
                else {
                    selector.removeClass('disabled');
                    selector.parent().removeClass('disabled');
                }
                break;
            }
            case 'saveAtomChanges':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'atomPalette':{
                if (value === true) {
                    selector.children().removeAttr('data-toggle');
                    selector.addClass('disabled');
                }
                else {
                    selector.children().attr('data-toggle','modal');
                    selector.removeClass('disabled');   
                }
                break;
            }
            case 'deleteAtom':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'tangency':{
                if (value === true) selector.parent().addClass('disabled');
                else selector.parent().removeClass('disabled');
                break;
            }
            case 'cellVolume':{
                selector.prop('disabled', value);
                takeAction('cellVolumeSlider',jQuery('#cellVolumeSlider'),value);
                break;
            }
            case 'cellVolumeSlider':{
                if(value === true) selector.slider('disable');
                else selector.slider('enable');
                break;
            }
            case 'rotAngleSection':{
                if (value === true) jQuery('.tangent-properties-container').show('slow');
                else jQuery('.tangent-properties-container').hide('slow');
                break;   
            }
            case 'hideChainIcon':{
                if (value.value === true) jQuery('#atomTable').find('#'+value.id).find('.chain').addClass('hiddenIcon');
                else jQuery('#atomTable').find('#'+value.id).find('.chain').removeClass('hiddenIcon');
                break;
            }
            case 'entryVisibility':{
                if(value === true){ 
                    selector.find('img').attr('src','Images/visible-icon-sm.png');
                    selector.addClass('visible');
                }
                else {
                    selector.find('img').attr('src','Images/hidden-icon-sm.png');
                    selector.removeClass('visible');
                }
                break;   
            }
                
            // Library Tab
            case 'noteOpacity':{
                selector.prop('disabled', value);
                break;
            }
            case 'noteTitle':{
                selector.prop('disabled', value);
                break;
            }
            case 'noteBody':{
                selector.prop('disabled', value);
                break;
            }
            case 'noteColor':{
                if (value === true) selector.spectrum('disable');
                else selector.spectrum('enable');
                break;
            }
            case 'newNote':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'deleteNote':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
            case 'saveNote':{
                if (value === true) selector.addClass('disabled');
                else selector.removeClass('disabled');
                break;
            }
                
            // Visual Tab
            case 'realistic':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'wireframe':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'toon':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'flat':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'crystalClassic':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'crystalSubstracted':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'crystalSolidVoid':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'crystalGradeLimited':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'cellClassic':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'cellSubstracted':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'cellSolidVoid':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
            case 'cellGradeLimited':{
                if (value === true){
                    selector.css('background','white');
                    selector.removeClass('active');
                    selector.addClass('disabled');
                }
                else {
                    selector.css('background','#36383d');
                    selector.removeClass('disabled');
                }
                break;   
            }
        };
    };
    
    disableUIElement.prototype.disableElement = function(argument){
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
        
            });
        }
    };
    
    return disableUIElement;
});