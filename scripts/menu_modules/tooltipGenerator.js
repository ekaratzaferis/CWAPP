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
    // Variables //
    var target = undefined;
    var message = undefined;
    var placement = undefined;
    var xCoord = undefined;
    var yCoord = undefined;
    
    // Element List //
    var elementList = {
        'controls_toggler': 'left',
        'latticeTab': 'left',
        'motifLI': 'left',
        'visualTab': 'left',
        'millerPI': 'left',
        'notesTab': 'left',
        'publicTab': 'left',
        'helpTab': 'left',
        'selected_lattice':'top',
        'latticePadlock':'top',
        'repeatZ':'top',
        'repeatX':'top',
        'repeatY':'top',
        'scaleZ':'top',
        'scaleX':'top',
        'scaleY':'top',
        'beta':'top',
        'alpha':'top',
        'gamma':'top',
        'motifPadlock':'left',
        'latticePreview':'top',
        'latticeAutoRefresh':'top',
        'cube_color_border':'top',
        'cube_color_filled':'top',
        'radius':'top',
        'faceOpacity':'top',
        'newPlanett':'top',
        'millerH':'top',
        'millerK':'top',
        'millerL':'top',
        'millerI':'top',
        'savePlane':'top',
        'planeOpacity':'top',
        'planeColor':'top',
        'planeName':'top',
        'deletePlanett':'top',
        'millerU':'top',
        'millerV':'top',
        'millerW':'top',
        'millerT':'top',
        'newDirectiontt':'top',
        'saveDirection':'top',
        'dirRadius':'top',
        'directionColor':'top',
        'directionName':'top',
        'deleteDirectiontt':'top',
        'atomPalettett':'top',
        'tangency':'top',
        'atomPositioningXYZ':'top',
        'atomPositioningABC':'bottom',
        'atomPosZ':'top',
        'atomPosZSlider':'top',
        'atomPosX':'top',
        'atomPosXSlider':'top',
        'atomPosY':'top',
        'atomPosYSlider':'top',
        'atomColor':'top',
        'atomOpacity':'top',
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
        '3DsideBySide':'top',
        '3DonTop':'top',
        'anaglyphCell':'top',
        'oculusCell':'top',
        '3DsideBySideCell':'top',
        '3DonTopCell':'top',
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
        'motifZScreenColor':'top'
    };
    
    var $messageList = undefined;
    var $canvasTooltip = jQuery('#canvasTooltip');
    
    // Contructor //
    function tooltipGenerator(argument) {
        
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
        else return false;
        
        // UI Tooltips //
        _.each(elementList, function($element, k){
            tooltipOnHover({ target: k.toString(), message: $messageList.getMessage(k.toString()), placement: $element.toString() });
        });
        
        
        // Canvas Tooltip for system messages //
        $canvasTooltip.tooltip({
            container : 'body',
            placement : 'right',
            trigger: 'manual',
            title: 'empty',
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="color: white; border-right-color: white;"></div><div class="tooltip-inner" style="background-color: white;"></div></div>'
        });
    };
    
    // Adds Tooltip on mouse hover //
    function tooltipOnHover(argument) {
        if (!(_.isUndefined(argument.target))) target = jQuery('#'+argument.target);
        else if (!(_.isUndefined(argument.other))) target = argument.other;
        else return false;
        if (!(_.isUndefined(argument.message))) message = argument.message;
        else return false;
        if (!(_.isUndefined(argument.placement))) placement = argument.placement;
        else return false;
        
        if (target.length > 0) {
            target.attr('data-original-title', message);
            target.tooltip({
                container : 'body',
                placement : placement,
                trigger: 'hover',
                title: message
            });
        }
        else return false;
        
        return true;  
    };
    
    // UI Interface //
    tooltipGenerator.prototype.addStaticTooltip = function(argument){
        if (!(_.isUndefined(argument.target))) target = jQuery('#'+argument.target);
        else if (!(_.isUndefined(argument.other))) target = argument.other;
        else return false;
        if (!(_.isUndefined(argument.message))) message = argument.message;
        else return false;
        if (!(_.isUndefined(argument.placement))) placement = argument.placement;
        else return false;
        
        if (target.length > 0) {
            target.attr('data-original-title', message);
            target.tooltip({
                container : 'body',
                placement : placement,
                trigger: 'manual',
                title: message
            });
        }
        else return false;
        target.tooltip('show');
        return true; 
    };
    tooltipGenerator.prototype.addOnHoverTooltip = function(argument){
        tooltipOnHover(argument);
    };
    tooltipGenerator.prototype.showTooltip = function(argument){
        if (!(_.isUndefined(argument.target))) target = jQuery('#'+argument.target);
        else return false;
        if (!(_.isUndefined(argument.message))) message = argument.message;
        else return false;
        if (!(_.isUndefined(argument.placement))) placement = argument.placement;
        else return false;
        
        if (target.length > 0) {
            target.attr('data-original-title', message);
            target.tooltip({
                container : 'body',
                placement : placement,
                trigger: 'manual',
                title: message
            });
            target.tooltip('show');
            setTimeout(function(){
                target.tooltip('hide');
            }, 2500);
        }
        else return false;
        return true;
    };
    tooltipGenerator.prototype.canvasTooltip = function(argument){

        if (!(_.isUndefined(argument.message))) {
            $canvasTooltip.attr('data-original-title', argument.message);
            $canvasTooltip.tooltip({
                container : 'body',
                placement : 'right',
                trigger: 'manual',
                title: argument.message,
                template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="color: white; border-right-color: white;"></div><div class="tooltip-inner" style="background-color: white;"></div></div>'
            });
        }
        if (!(_.isUndefined(argument.y))) $canvasTooltip.css('top',argument.y+'px');
        if (!(_.isUndefined(argument.x))) $canvasTooltip.css('left',argument.x+'px');

        if (!(_.isUndefined(argument.show))) {
            if (argument.show === true) $canvasTooltip.tooltip('show');
            else if (argument.show === false) $canvasTooltip.tooltip('hide');
        }
        
    };
    
    return tooltipGenerator;
});