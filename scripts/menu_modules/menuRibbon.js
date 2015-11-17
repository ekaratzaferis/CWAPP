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
    // Module References
    var $messageList = undefined;
    var $interfaceResizer = undefined;
    var $tooltipGenerator = undefined;
    
    // Contructor //
    function menuRibbon(argument) {
        
        // Acquire module references
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.interfaceResizer))) $interfaceResizer = argument.interfaceResizer;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        
        
    };
    
    menuRibbon.prototype.switchTab = function(argument){
        
    };
    menuRibbon.prototype.disableTab = function(argument){
        
    }
    
    return menuRibbon;
});