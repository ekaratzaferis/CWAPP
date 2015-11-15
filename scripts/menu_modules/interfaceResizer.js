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
    var canvasHeight = undefined;
    var canvasWidth = undefined;
    var screenHeight = undefined;
    var screenWidth = undefined;
    
    // Contructor //
    function interfaceResizer() {
        
    };
    function refreshDimensions(){
        screenHeight = jQuery(window).height();
        screenWidth = jQuery(window).width();
        canvasHeight = jQuery('#app-container').height();
        canvasWidth = jQuery('#app-container').width();   
    }
    
    interfaceResizer.prototype.transform = function(argument){
        argument.selector.css('-webkit-transform','scale('+argument.percentage+')');
        argument.selector.css('-webkit-transform-origin','0 0');
        argument.selector.css('transform','scale('+argument.percentage+')');
        argument.selector.css('transform-origin','0 0');
    };
    interfaceResizer.prototype.fitsCanvas = function(argument){
        refreshDimensions();
        if ( (argument.x + argument.width) > canvasWidth ) return 'width';
        if ( (argument.y + argument.height) > canvasHeight ) return 'height';
        return true;
    };
    interfaceResizer.prototype.fitsScreen = function(argument){
        refreshDimensions();
        if ( (argument.x + argument.width) > screenWidth ) return 'width';
        if ( (argument.y + argument.height) > screeHeight ) return 'height';
        return false;
    };
    
    return interfaceResizer;
});