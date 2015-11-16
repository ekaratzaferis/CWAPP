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
    
    var $menuWidthOpen;
    var $menuWidthClose;
    var $menuShiftRight;
    var $menuShiftLeft;
    
    // Contructor //
    function interfaceResizer() {
        
    };
    function refreshDimensions(){
        screenHeight = jQuery(window).height();
        screenWidth = jQuery(window).width();
        canvasHeight = jQuery('#app-container').height();
        canvasWidth = jQuery('#app-container').width();   
    };
    
    interfaceResizer.prototype.transformMenu = function(percentage){
        jQuery('.main-controls-container').css('-webkit-transform','scale('+argument.percentage+')');
        jQuery('.main-controls-container').css('-webkit-transform-origin','0 0');
        jQuery('.main-controls-container').css('transform','scale('+argument.percentage+')');
        jQuery('.main-controls-container').css('transform-origin','0 0');
        var elem = jQuery(".main-controls-container"), scaledHeight = elem[0].getBoundingClientRect().height;
        elem.parents(".mCSB_container").css({
            "height": elem.outerHeight()!==scaledHeight ? scaledHeight : "auto"
        }); 
        window.dispatchEvent(new Event('resize'));
        jQuery('body').mCustomScrollbar('update');
        switch(percentage){
            case '70':
                $menuWidthOpen = 370;
                $menuWidthClose = 78.3;
                $menuShiftRight = -442;
                $menuShiftLeft = -150;
                jQuery('.main-controls-container').css('right','-150px');
                break;
            case '80':
                $menuWidthOpen = 420;
                $menuWidthClose = 86.6;
                $menuShiftRight = -434;
                $menuShiftLeft = -100;
                jQuery('.main-controls-container').css('right','-100px');
                break;
            case '90':
                $menuWidthOpen = 470;
                $menuWidthClose = 94.9;
                $menuShiftRight = -427;
                $menuShiftLeft = -50;
                jQuery('.main-controls-container').css('right','-50px');
                break;
            case '100':
                $menuWidthOpen = 520;
                $menuWidthClose = 103;
                $menuShiftRight = -417;
                $menuShiftLeft = 0;
                jQuery('.main-controls-container').css('right','0px');
                break;
        };
    };
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