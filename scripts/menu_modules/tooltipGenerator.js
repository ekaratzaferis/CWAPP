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
    tooltipGenerator.showCanvasTooltip = function(argument){
        if (!(_.isUndefined(argument.message))) message = argument.message;
        else return false;
        if (!(_.isUndefined(argument.x))) xCoord = argument.x;
        else return false;
        if (!(_.isUndefined(argument.message))) yCoord = argument.y;
        else return false;
        
        jQuery('#canvasTooltip').css('top',argument.yCoord);
        jQuery('#canvasTooltip').css('left',argument.xCoord);
        
    };
    
    return tooltipGenerator;
});