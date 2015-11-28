/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'jquery.mCustomScrollbar.concat.min',
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    customScrollbar
) 
{
    // Variables //
    var canvasHeight = undefined;
    var canvasWidth = undefined;
    var screenHeight = undefined;
    var screenWidth = undefined;
    var $viewport = false;
    var $animating = undefined;
    var autoZoom = false;
    
    // Canvases //
    var $screenWrapper = jQuery('#screenWrapper');
    var $appContainer = jQuery("#app-container");
    
    var $menuWidthOpen;
    var $menuWidthClose;
    var $menuShiftRight;
    var $menuShiftLeft;
    
    // Selectors //
    var $menuToggler = jQuery('#controls_toggler');
    var $menu = jQuery('#main_controls_container');
    var $xLabel = jQuery('#xLabel');
    var $yLabel = jQuery('#yLabel');
    var $zLabel = jQuery('#zLabel');
    var $aLabel = jQuery('#aLabel');
    var $bLabel = jQuery('#bLabel');
    var $cLabel = jQuery('#cLabel');
    var $unitCellRenderer = jQuery('#unitCellRenderer');
    var $unitCellRendererMouse = jQuery('#unitCellRenderer');
    var $appLogo = jQuery('#appLogo');
    var $progressBarWrapper = jQuery('#progressBarWrapper');
    var $progressBar = jQuery('#progressBar');
    var $scrollBars = jQuery('.custom_scrollbar');
    
    // Module References //
    var $tooltipGenerator = undefined;
    
    //Grouping //
    var canvasXYZLabels = {
        xLabel: jQuery('#xLabel'), 
        yLabel: jQuery('#yLabel'),  
        zLabel: jQuery('#zLabel')
    }
    var canvasABCLabels = {
        aLabel: jQuery('#aLabel'), 
        bLabel: jQuery('#bLabel'),  
        cLabel: jQuery('#cLabel')
    }
    
    // Contructor //
    function interfaceResizer(argument) {
        
        // Initiation values //
        $menuWidthOpen = 520;
        $menuWidthClose = 103;
        $menuShiftRight = -417;
        $menuShiftLeft = 0;
        
        // Acquire Module References //
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        
        // Create scrollbars //
        $scrollBars.mCustomScrollbar();
        
        // Cancel Animation //
        jQuery('body').on('click', function(){
            if (!(_.isUndefined($animating))){
                console.log($animating);
                if ($animating.hasClass('stop')){
                    $animating.removeClass('highlight');
                    $animating.removeClass('animating');
                    $animating.removeClass('stop');
                    $animating.stop();
                }
                if ($animating.hasClass('animating')) $animating.addClass('stop');
                if ($animating.hasClass('highlight')) $animating.addClass('animating');
            }
        });
        
        // Swap Button //
        $tooltipGenerator.addOnHoverTooltip({
            target: 'swapButton',
            message: 'Swap between crystal and motif screen',
            placement: 'left'
        });
        
        // Window //
        jQuery(window).ready(function(){
            $progressBarWrapper.hide(2000);
            jQuery('body').css('background-color','black');
            $screenWrapper.show();
            $menu.show();
        });
        jQuery(window).resize(function() { resizeScene(); });
        jQuery(window).on('change update', function(){
            init_dimensions();
            jQuery('#bravais_lattice_modal').on('shown.bs.modal', function()
            {
                init_dimensions();
            });
        });
        jQuery(document).ready(function(){
            init_dimensions();
            resizeScene();
        });

        // Progress Bar //
        refreshDimensions();
        $progressBarWrapper.width(screenWidth);
        $progressBarWrapper.height(screenHeight);        
    };
    function refreshDimensions(){
        screenHeight = jQuery(window).height();
        screenWidth = jQuery(window).width();
        canvasHeight = jQuery('#app-container').height();
        canvasWidth = jQuery('#app-container').width();   
    };
    function init_dimensions(){
        jQuery('.mh_controls').matchHeight();
        jQuery('.mh_pnd_para_box').matchHeight();
        jQuery('.mh_lattice_length_para_box').matchHeight();
        jQuery('.mh_bravais_lattice_block').matchHeight({byRow: false});
        jQuery('.mh_bravais_lattice_block').find('.bravais-lattice-block').matchHeight({byRow: false});
        jQuery('.mh_bravais_lattice_block').find('.block-image').matchHeight({byRow: false});
    };
    function resizeScene(){
        // Calculate current screen size.
        refreshDimensions();
        
        // Calculate canvas resizing amount.
        var x = 0;
        if ($menu.hasClass('controls-open')) {
            adjustMenu(true);
            x = $menuWidthOpen;
        }
        else {
            adjustMenu(false);
            x = $menuWidthClose;
        }

        // Resize canvasses and slowly fade in.
        $screenWrapper.width(screenWidth-x);
        $screenWrapper.fadeIn(800);
        $appContainer.width(screenWidth-x);
        $progressBarWrapper.width(screenWidth);
        $appLogo.width(screenWidth-x);
        jQuery('.main-controls-inner').height(screenHeight);
        
        // Resize Atom Radius Slider
        jQuery('#atomRadiusSliderContainer').width((screenWidth-x)*0.18);
        jQuery('#atomRadiusSliderContainer').css('left',(screenWidth-x)*0.08);

        // Resize labels
        _.each(canvasXYZLabels, function($parameter,k){
            $parameter.css('width',screenWidth*0.015); 
            $parameter.css('height',screenWidth*0.015); 
        });
        _.each(canvasABCLabels, function($parameter,k){
            $parameter.css('width',screenWidth*0.015); 
            $parameter.css('height',screenWidth*0.015); 
        });

        if ($viewport === true) {
            $unitCellRenderer.width($appContainer.width()/5);
            $unitCellRendererMouse.width($appContainer.width()/5);
            $unitCellRenderer.height(screenHeight/5);
            $unitCellRendererMouse.height(screenHeight/5);
        }
    };
    function transformMenu(percentage,open){
        jQuery('.main-controls-container').css('-webkit-transform','scale('+percentage+')');
        jQuery('.main-controls-container').css('-webkit-transform-origin','0 0');
        jQuery('.main-controls-container').css('transform','scale('+percentage+')');
        jQuery('.main-controls-container').css('transform-origin','0 0');
        var elem = jQuery(".main-controls-container"), scaledHeight = elem[0].getBoundingClientRect().height;
        elem.parents(".mCSB_container").css({
            "height": elem.outerHeight()!==scaledHeight ? scaledHeight : "auto"
        }); 
        jQuery('body').mCustomScrollbar('update');
        switch(percentage){
            case 0.7:
                $menuWidthOpen = 370;
                $menuWidthClose = 78.3;
                $menuShiftRight = -442;
                $menuShiftLeft = -150;
                if(open === true) jQuery('.main-controls-container').css('right','-150px');
                break;
            case 0.8:
                $menuWidthOpen = 420;
                $menuWidthClose = 86.6;
                $menuShiftRight = -434;
                $menuShiftLeft = -100;
                if(open === true)  jQuery('.main-controls-container').css('right','-100px');
                break;
            case 0.9:
                $menuWidthOpen = 470;
                $menuWidthClose = 94.9;
                $menuShiftRight = -427;
                $menuShiftLeft = -50;
                if(open === true) jQuery('.main-controls-container').css('right','-50px');
                break;
            case 1:
                $menuWidthOpen = 520;
                $menuWidthClose = 103;
                $menuShiftRight = -417;
                $menuShiftLeft = 0;
                if(open === true) jQuery('.main-controls-container').css('right','0px');
                break;
        };
    };
    function adjustMenu(open){
        // Menu Zoom //
        if (autoZoom === true){
            var zoom = 1;
            if (screenWidth > 1300) zoom = 1;
            else if (screenWidth > 1100) zoom = 0.9;
            else if (screenWidth > 1000) zoom = 0.8;
            else if (screenWidth > 800) zoom = 0.7;
            transformMenu(zoom,open);
        }   
    };
    
    interfaceResizer.prototype.transformMenu = function(percentage){
        transformMenu(percentage,true);
        window.dispatchEvent(new Event('resize'));
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
    interfaceResizer.prototype.closeMenu = function(){
        $menuToggler.find('.img-close').fadeOut('fast', function()
        {
            $menuToggler.find('.img-open').fadeIn('fast')
        });
        $screenWrapper.fadeOut('slow');
        $menu.animate({'right': $menuShiftRight}, 500, function()
        {
            $menu.removeClass('controls-open');
            $menu.addClass('controls-close');
            window.dispatchEvent(new Event('resize'));
        });
    };
    interfaceResizer.prototype.openMenu = function(tab){
        if( !( tab.hasClass('toggle_menu') ) ){
            if( !( tab.parent().hasClass('disabled') ) ){
                $menuToggler.find('.img-open').fadeOut('fast', function()
                {
                    $menuToggler.find('.img-close').fadeIn('fast')
                });
                if (! ($menu.hasClass('controls-open')) ) {
                    $screenWrapper.fadeOut('slow');
                    $menu.animate({'right': $menuShiftLeft}, 500, function()
                    {
                        $menu.removeClass('controls-close');
                        $menu.addClass('controls-open');
                        window.dispatchEvent(new Event('resize'));
                    });
                }
            }
        }
    };
    interfaceResizer.prototype.showCanvasXYZLabels = function(state){
        if (state === false) _.each(canvasXYZLabels, function($parameter,k){ $parameter.addClass('hiddenLabel'); });
        else _.each(canvasXYZLabels, function($parameter,k){ $parameter.removeClass('hiddenLabel'); });
    };
    interfaceResizer.prototype.showCanvasABCLabels = function(state){
        if (state === false) _.each(canvasABCLabels, function($parameter,k){ $parameter.addClass('hiddenLabel'); });
        else _.each(canvasABCLabels, function($parameter,k){ $parameter.removeClass('hiddenLabel'); });
    };
    interfaceResizer.prototype.viewport = function(state){
        $viewport = state;
    };
    interfaceResizer.prototype.resetProgressBar = function(title) {
        $progressBarWrapper.find('.progressLabel').text(title);
        $progressBarWrapper.show();
    };
    interfaceResizer.prototype.progressBarFinish = function(){
        $progressBarWrapper.fadeOut('slow');
    };
    interfaceResizer.prototype.highlightElement = function(argument){
        jQuery('#'+argument.id).addClass('highlight');
        $animating = jQuery('#'+argument.id);
    };
    interfaceResizer.prototype.moveLabel = function(argument){
        var x = argument['xCoord'] - ( parseFloat($xLabel.css('width')) / 2);
        var y = argument['yCoord'] - ( parseFloat($xLabel.css('height')) / 2);
        switch(argument['label']){
            case 'x':
                $xLabel.css('left',x);
                $xLabel.css('top',y);
                break;
            case 'y':
                $yLabel.css('left',x);
                $yLabel.css('top',y);
                break;
            case 'z':
                $zLabel.css('left',x);
                $zLabel.css('top',y);
                break;
            case 'a':
                $aLabel.css('left',x);
                $aLabel.css('top',y);
                break;
            case 'b':
                $bLabel.css('left',x);
                $bLabel.css('top',y);
                break;
            case 'c':
                $cLabel.css('left',x);
                $cLabel.css('top',y);
                break;
        }  
    };
    interfaceResizer.prototype.editProgressBarTitle = function(title){
        $progressBar.siblings('.progressLabel').text(title);  
    };
    interfaceResizer.prototype.autoZoom = function(state){
        autoZoom = state;  
    };
    
    return interfaceResizer;
});