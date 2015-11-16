/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'bootstrap'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    bootstrap
) 
{
    // Variables
    var target = undefined;
    var message = undefined;
    var placement = undefined;
    var xCoord = undefined;
    var yCoord = undefined;
    
    var $canvasTooltip = jQuery('#canvasTooltip');
    
    // Contructor //
    function tooltipGenerator() {
        
    };
    
    tooltipGenerator.prototype.addOnHoverTooltip = function(argument){
        if (!(_.isUndefined(argument.target))) target = jQuery('#'+argument['target']);
        else return false;
        if (!(_.isUndefined(argument.message))) message = argument['message'];
        else return false;
        if (!(_.isUndefined(argument.placement))) placement = argument['placement'];
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
        if (!(_.isUndefined(argument.show))) {
            if (argument.show === true) $canvasTooltip.tooltip('show');
            else $canvasTooltip.tooltip('hide');
        }
        else {
            if (!(_.isUndefined(argument.message))) message = argument.message;
            else return false;
            if (!(_.isUndefined(argument.x))) xCoord = argument.x;
            else return false;
            if (!(_.isUndefined(argument.y))) yCoord = argument.y;
            else return false;

            $canvasTooltip.css('top',yCoord+'px');
            $canvasTooltip.css('left',xCoord+'px');
            $canvasTooltip.attr('data-original-title', message);
            $canvasTooltip.tooltip({
                container : 'body',
                placement : 'right',
                trigger: 'hover',
                title: message,
                template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="color: white; border-right-color: white;"></div><div class="tooltip-inner" style="background-color: white;"></div></div>'
            });
        }
    };
    
    return tooltipGenerator;
});