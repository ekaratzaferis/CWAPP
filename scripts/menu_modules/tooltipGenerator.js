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
    // Variables
    var target = undefined;
    var message = undefined;
    var placement = undefined;
    var xCoord = undefined;
    var yCoord = undefined;
    
    var $canvasTooltip = jQuery('#canvasTooltip');
    
    // Contructor //
    function tooltipGenerator() {
        $canvasTooltip.tooltip({
            container : 'body',
            placement : 'right',
            trigger: 'manual',
            title: 'empty',
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" style="color: white; border-right-color: white;"></div><div class="tooltip-inner" style="background-color: white;"></div></div>'
        });
    };
    
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