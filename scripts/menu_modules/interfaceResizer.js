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
    
    /* This module takes care of: 
        - resizing/readjustment of the app's menu 
        - the canvas HTML elements 
        - creating the scrollbars 
        - adding the highlight effect on UI elements
        - the progress bar
    */
    
    // Variables //
    var canvasHeight = undefined;
    var canvasWidth = undefined;
    var screenHeight = undefined;
    var screenWidth = undefined;
    var $viewport = false;
    var $animating = undefined;
    var autoZoom = false;
    
    // How many pixels does the menu occupy on screen //
    var $menuWidthOpen;
    var $menuWidthClose;
    // How many pixels is the menu shifted when it's toggled //
    var $menuShiftRight;
    var $menuShiftLeft;
    
    // Module References //
    var $tooltipGenerator = undefined;
    var $messages = undefined;
    var html = undefined;
    
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
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
       
        // Create scrollbars //
        html.interface.screen.scrollBars.mCustomScrollbar();
        
        // Cancel Animation (Highlight Effect) //
        html.interface.screen.body.on('click', function(){
            if (!(_.isUndefined($animating))){
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
        
        // Add tooltip on the swap button //
        $tooltipGenerator.addOnHoverTooltip({
            target: 'swapButton',
            message: $messages.getMessage(32),
            placement: 'left'
        });
        
        // Window //
        jQuery(window).ready(function(){
            // Hide Progress bar and then show canvas and menu //
            html.interface.progress.wrapper.hide(2000);
            html.interface.screen.body.css('background-color','black');
            html.interface.screen.wrapper.show();
            html.interface.sidebar.menu.show();
        });
        jQuery(window).resize(function() { resizeScene(); });
        jQuery(window).on('change update', function(){
            init_dimensions();
            html.interface.screen.bravaisModal.on('shown.bs.modal', function()
            {
                init_dimensions();
            });
        });
        jQuery(document).ready(function(){
            init_dimensions();
            resizeScene();
        });

        // Strech Progress Bar all over the screen //
        refreshDimensions();
        html.interface.progress.wrapper.width(screenWidth);
        html.interface.progress.wrapper.height(screenHeight);    
        
        // Init Labels //
        this.showCanvasXYZLabels(false);
    };
    // Refresh canvas and screen width/height //
    function refreshDimensions(){
        screenHeight = jQuery(window).height();
        screenWidth = jQuery(window).width();
        canvasHeight = html.interface.screen.appContainer.height();
        canvasWidth = html.interface.screen.appContainer.width();   
    };
    // Re-apply match-height on certain UI elements // 
    function init_dimensions(){
        jQuery('.mh_controls').matchHeight();
        jQuery('.mh_pnd_para_box').matchHeight();
        jQuery('.mh_lattice_length_para_box').matchHeight();
        jQuery('.mh_bravais_lattice_block').matchHeight({byRow: false});
        jQuery('.mh_bravais_lattice_block').find('.bravais-lattice-block').matchHeight({byRow: false});
        jQuery('.mh_bravais_lattice_block').find('.block-image').matchHeight({byRow: false});
    };
    // Re-adjust canvases + HTML elements //
    function resizeScene(){
        // Calculate current screen size.
        refreshDimensions();
        
        // Calculate canvas resizing amount and adjust menu if auto-zoom is enabled //
        var x = 0;
        if (html.interface.sidebar.menu.hasClass('controls-open')) {
            adjustMenu(true);
            x = $menuWidthOpen;
        }
        else {
            adjustMenu(false);
            x = $menuWidthClose;
        }

        // Resize canvasses and slowly fade in.
        html.interface.screen.wrapper.width(screenWidth-x);
        html.interface.screen.wrapper.fadeIn(800);
        html.interface.screen.appContainer.width(screenWidth-x);
        html.interface.progress.wrapper.width(screenWidth);
        html.interface.canvas.appLogo.width(screenWidth-x);
        html.interface.sidebar.menuInner.height(screenHeight);
        
        // Resize Atom Radius Slider
        html.interface.canvas.atomRadiusSlider.width((screenWidth-x)*0.18);
        html.interface.canvas.atomRadiusSlider.css('left',(screenWidth-x)*0.08);

        // Resize labels
        _.each(html.interface.canvas.xyz, function($parameter,k){
            $parameter.css('width',screenWidth*0.015); 
            $parameter.css('height',screenWidth*0.015); 
        });
        _.each(html.interface.canvas.abc, function($parameter,k){
            $parameter.css('width',screenWidth*0.015); 
            $parameter.css('height',screenWidth*0.015); 
        });

        // Render unit cell viewport //
        if ($viewport === true ) {
            html.interface.canvas.unitCellRenderer.width(html.interface.screen.appContainer.width()/5);
            html.interface.canvas.unitCellRendererMouse.width(html.interface.screen.appContainer.width()/5);
            html.interface.canvas.unitCellRenderer.height(screenHeight/5);
            html.interface.canvas.unitCellRendererMouse.height(screenHeight/5);
        }
    };
    // Resize Menu (zoom in/out) //
    function transformMenu(percentage,open){
        // Transform HTML //
        html.interface.sidebar.menuContainer.css('-webkit-transform','scale('+percentage+')');
        html.interface.sidebar.menuContainer.css('-webkit-transform-origin','0 0');
        html.interface.sidebar.menuContainer.css('transform','scale('+percentage+')');
        html.interface.sidebar.menuContainer.css('transform-origin','0 0');
        // Update scrollbar //
        var elem = html.interface.sidebar.menuContainer, scaledHeight = elem[0].getBoundingClientRect().height;
        elem.parents(".mCSB_container").css({
            "height": elem.outerHeight()!==scaledHeight ? scaledHeight : "auto"
        }); 
        html.interface.screen.body.mCustomScrollbar('update');
        // Calculate key values //
        switch(percentage){
            case 0.7:
                $menuWidthOpen = 370;
                $menuWidthClose = 78.3;
                $menuShiftRight = -442;
                $menuShiftLeft = -150;
                if(open === true) html.interface.sidebar.menuContainer.css('right','-150px');
                break;
            case 0.8:
                $menuWidthOpen = 420;
                $menuWidthClose = 86.6;
                $menuShiftRight = -434;
                $menuShiftLeft = -100;
                if(open === true)  html.interface.sidebar.menuContainer.css('right','-100px');
                break;
            case 0.9:
                $menuWidthOpen = 470;
                $menuWidthClose = 94.9;
                $menuShiftRight = -427;
                $menuShiftLeft = -50;
                if(open === true) html.interface.sidebar.menuContainer.css('right','-50px');
                break;
            case 1:
                $menuWidthOpen = 520;
                $menuWidthClose = 103;
                $menuShiftRight = -417;
                $menuShiftLeft = 0;
                if(open === true) html.interface.sidebar.menuContainer.css('right','0px');
                break;
        };
    };
    // Choose a zoom value depending on the current screen width //
    function adjustMenu(open){
        if (autoZoom === true){
            var zoom = 1;
            if (screenWidth > 1300) zoom = 1;
            else if (screenWidth > 1100) zoom = 0.9;
            else if (screenWidth > 1000) zoom = 0.8;
            else if (screenWidth > 800) zoom = 0.7;
            transformMenu(zoom,open);
        }   
    };
    
    // Module Interface //
    // Transforms Menu (zoom in/out) //
    interfaceResizer.prototype.transformMenu = function(percentage){
        transformMenu(percentage,true);
        // Force Resize //
        window.dispatchEvent(new Event('resize'));
    };
    // Transforms any HTML element //
    interfaceResizer.prototype.transform = function(argument){
        argument.selector.css('-webkit-transform','scale('+argument.percentage+')');
        argument.selector.css('-webkit-transform-origin','0 0');
        argument.selector.css('transform','scale('+argument.percentage+')');
        argument.selector.css('transform-origin','0 0');
    };
    // Checks if an HTML element fits inside the canvas //
    interfaceResizer.prototype.fitsCanvas = function(argument){
        refreshDimensions();
        if ( (argument.x + argument.width) > canvasWidth ) return 'width';
        if ( (argument.y + argument.height) > canvasHeight ) return 'height';
        return true;
    };
    // Checks if an HTML element fits inside the screen //
    interfaceResizer.prototype.fitsScreen = function(argument){
        refreshDimensions();
        if ( (argument.x + argument.width) > screenWidth ) return 'width';
        if ( (argument.y + argument.height) > screeHeight ) return 'height';
        return false;
    };
    // Slides Menu to the right //
    interfaceResizer.prototype.closeMenu = function(){
        html.interface.sidebar.toggler.find('.img-close').fadeOut('fast', function()
        {
            html.interface.sidebar.toggler.find('.img-open').fadeIn('fast')
        });
        html.interface.screen.wrapper.fadeOut('slow');
        html.interface.sidebar.menu.animate({'right': $menuShiftRight}, 500, function()
        {
            html.interface.sidebar.menu.removeClass('controls-open');
            html.interface.sidebar.menu.addClass('controls-close');
            window.dispatchEvent(new Event('resize'));
        });
    };
    // Slide Menu to the left //
    interfaceResizer.prototype.openMenu = function(tab){
        if( !( tab.hasClass('toggle_menu') ) ){
            if( !( tab.parent().hasClass('disabled') ) ){
                html.interface.sidebar.toggler.find('.img-open').fadeOut('fast', function()
                {
                    html.interface.sidebar.toggler.find('.img-close').fadeIn('fast')
                });
                if (! (html.interface.sidebar.menu.hasClass('controls-open')) ) {
                    html.interface.screen.wrapper.fadeOut('slow');
                    html.interface.sidebar.menu.animate({'right': $menuShiftLeft}, 500, function()
                    {
                        html.interface.sidebar.menu.removeClass('controls-close');
                        html.interface.sidebar.menu.addClass('controls-open');
                        window.dispatchEvent(new Event('resize'));
                    });
                }
            }
        }
    };
    // Hide/Show xyz labels //
    interfaceResizer.prototype.showCanvasXYZLabels = function(state){
        if (state === false) _.each(html.interface.canvas.xyz, function($parameter,k){ $parameter.addClass('hiddenLabel'); });
        else _.each(html.interface.canvas.xyz, function($parameter,k){ $parameter.removeClass('hiddenLabel'); });
    };
    // Hide/Show abc labels //
    interfaceResizer.prototype.showCanvasABCLabels = function(state){
        if (state === false) _.each(html.interface.canvas.abc, function($parameter,k){ $parameter.addClass('hiddenLabel'); });
        else _.each(html.interface.canvas.abc, function($parameter,k){ $parameter.removeClass('hiddenLabel'); });
    };
    // Hide/Show Unit Cell Viewport //
    interfaceResizer.prototype.viewport = function(state){
        $viewport = state;
    };
    // Reset and show Progress Bar //
    interfaceResizer.prototype.resetProgressBar = function(title) {
        html.interface.progress.wrapper.find('.progressLabel').text(title);
        html.interface.progress.wrapper.show();
    };
    // Hide Progress Bar //
    interfaceResizer.prototype.progressBarFinish = function(){
        html.interface.progress.wrapper.fadeOut('slow');
    };
    // Highlight HTML element (creates a white pulse around it) //
    interfaceResizer.prototype.highlightElement = function(argument){
        jQuery('#'+argument.id).addClass('highlight');
        $animating = jQuery('#'+argument.id);
    };
    // Highlight HTML element fot tutorial //
    interfaceResizer.prototype.tutorialElementOn = function(argument){
        jQuery('#'+argument.id).addClass('highlight animating');
        $animating = jQuery('#'+argument.id);
    };
    // Dehighlight HTML element for tutorial //
    interfaceResizer.prototype.tutorialElementOff = function(){
        if (!(_.isUndefined($animating))){
            if ($animating.hasClass('stop')){
                $animating.removeClass('highlight');
                $animating.removeClass('animating');
                $animating.removeClass('stop');
                $animating.stop();
            }
            if ($animating.hasClass('animating')) $animating.addClass('stop');
            if ($animating.hasClass('highlight')) $animating.addClass('animating');
        }  
    };
    // Pick new label position inside the canvas //
    interfaceResizer.prototype.moveLabel = function(argument){
        var x = argument['xCoord'] - ( parseFloat(html.interface.canvas.xyz.xLabel.css('width')) / 2);
        var y = argument['yCoord'] - ( parseFloat(html.interface.canvas.xyz.xLabel.css('height')) / 2);
        switch(argument['label']){
            case 'x':
                html.interface.canvas.xyz.xLabel.css('left',x);
                html.interface.canvas.xyz.xLabel.css('top',y);
                break;
            case 'y':
                html.interface.canvas.xyz.yLabel.css('left',x);
                html.interface.canvas.xyz.yLabel.css('top',y);
                break;
            case 'z':
                html.interface.canvas.xyz.zLabel.css('left',x);
                html.interface.canvas.xyz.zLabel.css('top',y);
                break;
            case 'a':
                html.interface.canvas.abc.aLabel.css('left',x);
                html.interface.canvas.abc.aLabel.css('top',y);
                break;
            case 'b':
                html.interface.canvas.abc.bLabel.css('left',x);
                html.interface.canvas.abc.bLabel.css('top',y);
                break;
            case 'c':
                html.interface.canvas.abc.cLabel.css('left',x);
                html.interface.canvas.abc.cLabel.css('top',y);
                break;
        }  
    };
    // Change Progress Bar Title //
    interfaceResizer.prototype.editProgressBarTitle = function(title){
        html.interface.progress.bar.siblings('.progressLabel').text(title);  
    };
    // Enable auto-zoom feature //
    interfaceResizer.prototype.autoZoom = function(state){
        autoZoom = state;  
    };
    // Hide/Show Menu //
    interfaceResizer.prototype.hideMenu = function(state){
        if (state === false) html.interface.sidebar.menu.show();
        else if (state === true) html.interface.sidebar.menu.hide();
    };
    
    return interfaceResizer;
});