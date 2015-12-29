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
    var value = undefined;
    
    // Module References
    var $messageList = undefined;
    var $interfaceResizer = undefined;
    var $tooltipGenerator = undefined;
    var $latticeTab = undefined;
    var $setUI = undefined;
    var $userDialog = undefined;
    
    // Menu Button
    var $menuToggler = jQuery('#controls_toggler');
    var $menu = jQuery('#main_controls_container');
    
    // Tabs
    var latticeTab = jQuery('#latticeTab');
    var motifTab = jQuery('#motifLI');
    var visualTab = jQuery('#visualTab');
    var pndTab = jQuery('#millerPI');
    var publicTab = jQuery('#publicTab');
    var notesTab = jQuery('#notesTab');
    var helpTab = jQuery('#helpTab');
    
    // Grouping
    var tabs = {
       'latticeTab':latticeTab,
       'motifTab':motifTab,
       'visualTab':visualTab,
       'pndTab':pndTab,
       'publicTab':publicTab,
       'notesTab':notesTab,
       'helpTab':helpTab
    };
    var toggles = {
        'xyzAxes': jQuery('#xyzAxes'),
        'abcAxes': jQuery('#abcAxes'),
        'edges': jQuery('#edges'),
        'faces': jQuery('#faces'),
        'latticePoints': jQuery('#latticePoints'),
        'planes': jQuery('#planes'),
        'directions': jQuery('#directions'),
        'atomToggle': jQuery('#atomToggle'),
        'atomRadius': jQuery('#atomRadius'),
        'unitCellViewport': jQuery('#unitCellViewport'),
        'labelToggle': jQuery('#labelToggle'),
        'highlightTangency': jQuery('#highlightTangency')
    };
    var $atomRadiusSlider = jQuery('#atomRadiusSlider');
    
    // Check if swap button should be visible
    var swapState = false;
    var $swapButton = jQuery('#swapBtn');
    
    // Contructor //
    function menuRibbon(argument) {
        
        // Acquire module references
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.interfaceResizer))) $interfaceResizer = argument.interfaceResizer;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.userDialog))) $userDialog = argument.userDialog;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUI = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.latticeTab))) $latticeTab = argument.latticeTab;
        else return false;
        
        // Assign handlers
        latticeTab.on('click', function(event){
            if (latticeTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
            }
            else if(swapState === true) {
                $interfaceResizer.openMenu(latticeTab);
                $swapButton.show();
            }
            else {
                $interfaceResizer.openMenu(latticeTab);
                $swapButton.hide();
                $swapButton.attr('class','');   
            }
        });
        motifTab.on('click', function(event){
            if (motifTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
                if (motifTab.hasClass('blocked')) {
                    if ( jQuery('#selected_lattice').html() === 'Choose a Lattice' ) $tooltipGenerator.showTooltip({target:'motifLI',placement:'left',message:$messageList.getMessage(5)});
                }
            }
            else {
                $interfaceResizer.openMenu(motifTab);
                $latticeTab.updateLatticeLabels();
            }
            $swapButton.hide();
        });
        visualTab.on('click', function(event){
            if (visualTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
                if (visualTab.hasClass('blocked')) {
                    if ( jQuery('#selected_lattice').html() === 'Choose a Lattice' ) $tooltipGenerator.showTooltip({target:'visualTab',placement:'left',message:$messageList.getMessage(5)});
                }
            }
            else $interfaceResizer.openMenu(visualTab);
            $swapButton.hide();
        });
        pndTab.on('click', function(event){
            if (pndTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
                if (pndTab.hasClass('blocked')) {
                    if ( jQuery('#selected_lattice').html() === 'Choose a Lattice' ) $tooltipGenerator.showTooltip({target:'millerPI',placement:'left',message:$messageList.getMessage(5)});
                }
            }
            else $interfaceResizer.openMenu(pndTab);
            $swapButton.hide();
        });
        publicTab.on('click', function(event){
            if (publicTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
            }
            else $interfaceResizer.openMenu(publicTab);
            $swapButton.hide();
        });
        notesTab.on('click', function(event){
            if (notesTab.hasClass('disabled')){
                event.preventDefault();
                event.stopPropagation();
            }
            else $interfaceResizer.openMenu(notesTab);
            $swapButton.hide();
        });
        helpTab.on('click', function(){
            if (!(helpTab.hasClass('disabled'))) $userDialog.showInfoDialog({ messageID: 4 });
        });
        
        // Block Tabs
        disableTab({'tab':'motifTab','value':true});
        blockTab({'tab':'motifTab','value':true});
        disableTab({'tab':'pndTab','value':true});
        blockTab({'tab':'pndTab','value':true});
        disableTab({'tab':'visualTab','value':true});
        blockTab({'tab':'visualTab','value':true});
        
        // Reset Handler
        $menu.on('reset',function(){
            disableTab({'tab':'motifTab','value':true});
            blockTab({'tab':'motifTab','value':true});
            disableTab({'tab':'pndTab','value':true});
            blockTab({'tab':'pndTab','value':true});
            disableTab({'tab':'visualTab','value':true});
            blockTab({'tab':'visualTab','value':true});
            latticeTab.find('a').trigger('click');
            setTimeout(function(){
                jQuery('body').mCustomScrollbar("scrollTo",'top');
            },200);
        });
        
        // Top Menu Button
        $menuToggler.on('click', function(){
            if ($menu.hasClass('controls-open')) $interfaceResizer.closeMenu();
            else openFirstActiveTab();
        });
        
        // Toggle Buttons
        _.each(toggles, function($parameter, k){
            var title;
            switch(k){
                case 'xyzAxes':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(6);
                    break;
                 case 'abcAxes':
                    title = $messageList.getMessage(7);
                    break;
                case 'edges':
                    title = $messageList.getMessage(8);
                    break;
                case 'faces':
                    title = $messageList.getMessage(9);
                    break;
                case 'latticePoints':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(10);
                    break;
                case 'directions':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(11);
                    break;
                case 'planes':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(12);
                    break;
                case 'atomToggle':
                    $parameter.parent().toggleClass('lightThemeActive');
                    title = $messageList.getMessage(13);
                    break;
                case 'atomRadius':
                    title = $messageList.getMessage(14);
                    break;
                case 'unitCellViewport':
                    title = $messageList.getMessage(15);
                    break;
                case 'labelToggle':
                    title = $messageList.getMessage(16);
                    break;
                case 'highlightTangency':
                    title = $messageList.getMessage(17);
                    break;
            }
            $tooltipGenerator.addOnHoverTooltip({
                other: $parameter.parent(),
                message: title,
                placement: 'left'
            });
        });
        toggles.xyzAxes.on('click', function() {
            (toggles.xyzAxes.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                xyzAxes:{
                    value: value,
                    publish: {xyxAxes:value}
                }
            });
        });
        toggles.abcAxes.on('click', function() {
            (toggles.abcAxes.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                abcAxes:{
                    value: value,
                    publish: {abcAxes:value}
                }
            });
        });
        toggles.edges.on('click', function() {
            (toggles.edges.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                edges:{
                    value: value
                }
            });
        });  
        toggles.faces.on('click', function() {
            (toggles.faces.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                faces:{
                    value: value
                }
            });
        }); 
        toggles.latticePoints.parent().on('click', function() {
            (toggles.latticePoints.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                latticePoints:{
                    value: value,
                    publish: {latticePoints:value}
                }
            });
        });
        toggles.planes.on('click', function() {
            (toggles.planes.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                planes:{
                    value: value,
                    publish: {planeToggle:value}
                }
            });
        });  
        toggles.directions.on('click', function() {
            (toggles.directions.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                directions:{
                    value: value,
                    publish: {directionToggle:value}
                }
            });
        });
        toggles.atomToggle.on('click', function() {
            (toggles.atomToggle.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                atomToggle:{
                    value: value,
                    publish: {atomToggle:value}
                }
            });
        });
        $atomRadiusSlider.slider({
            value: 10.2,
            min: 1,
            max: 10.2,
            step: 0.2,
            animate: true,
            slide: function(event, ui){
                $setUI.setValue({
                    atomRadius:{
                        publish:{atomRadius: ui.value}
                    }
                });
            }
        });
        toggles.atomRadius.on('click', function() {
            if (!(motifTab.hasClass('active'))){
                (toggles.atomRadius.parent().hasClass('lightThemeActive')) ? value = false : value = true;
                $setUI.setValue({
                    atomRadius:{
                        value: value
                    }
                });
            }
        });
        toggles.unitCellViewport.on('click', function(){
            (toggles.unitCellViewport.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                unitCellViewport:{
                    value: value,
                    publish: {unitCellViewport:value}
                }
            });
        });
        toggles.labelToggle.on('click', function(){
            (toggles.labelToggle.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                labelToggle:{
                    value: value,
                    publish: {labelToggle:value}
                }
            });
        });
        toggles.highlightTangency.on('click', function(){
            (toggles.highlightTangency.parent().hasClass('lightThemeActive')) ? value = false : value = true;
            $setUI.setValue({
                highlightTangency:{
                    value: value,
                    publish: {highlightTangency:value}
                }
            });
        });
    };
    function openFirstActiveTab(){
        var openTab = jQuery('.main-tab-nav-container').find('li.active');
        if (!(openTab.hasClass('disabled'))) openTab.trigger('click');  
        else {
            openTab = jQuery('.main-tab-nav-container').find('li:not(.disabled):first');
            openTab.trigger('click');
        }
    };
    function blockTab(argument){
        _.each(tabs, function($param,a){
            if (argument.value === true) {
                if (a === argument.tab) $param.addClass('blocked');
            }
            else $param.removeClass('blocked');
        });
    }
    function disableTab(argument){
        _.each(tabs, function($param,a){
            if (argument.value === true) {
                if (a === argument.tab) {
                    $param.addClass('disabled');
                    $param.find('a').removeAttr('href');
                }
            }
            else {
                $param.removeClass('disabled');
                switch(argument.tab){
                    case 'latticeTab': 
                        jQuery('#latticeTab').find('a').attr('href','#scrn_lattice');
                        break;        
                    case 'pndTab': 
                        jQuery('#millerPI').find('a').attr('href','#scrn_pnd'); 
                        break;
                    case 'motifTab': 
                        jQuery('#motifLI').find('a').attr('href','#scrn_motif'); 
                        break;
                    case 'visualTab': 
                        jQuery('#visualTab').find('a').attr('href','#scrn_visualize'); 
                        break;
                    case 'publicTab': 
                        jQuery('#publicTab').find('a').attr('href','#scrn_public_library');
                        break;
                    case 'notesTab': 
                        jQuery('#notesTab').find('a').attr('href','#scrn_notes');
                        break;
                }
            }
        });
    }
    
    menuRibbon.prototype.setSwapButtonState = function(state){
        if (!(_.isUndefined(state))) swapState = state;
    };
    menuRibbon.prototype.switchTab = function(tab){
        switch(tab){
            case 'latticeTab': 
                latticeTab.find('a').trigger('click');
                break;        
            case 'motifTab': 
                motifTab.find('a').trigger('click'); 
                break;
            case 'visualTab': 
                visualTab.find('a').trigger('click'); 
                break;
            case 'pndTab': 
                pndTab.find('a').trigger('click'); 
                break;
            case 'publicTab': 
                publicTab.find('a').trigger('click');
                break;
            case 'notesTab': 
                notesTab.find('a').trigger('click');
                break;
            case 'helpTab': 
                helpTab.find('a').trigger('click');
                break;
        }
        if (tab !== 'latticeTab') $swapButton.hide();
    };
    menuRibbon.prototype.disableTab = function(argument){
        _.each(argument, function($parameter, k){
            disableTab({
                tab:k,
                value:$parameter
            });
        });
    };
    menuRibbon.prototype.blockTab = function(argument){
        _.each(argument, function($parameter, k){
            blockTab({
                tab:k,
                value:$parameter   
            });
        });
    };
    menuRibbon.prototype.restoreTabs = function(active,disabled){
        this.switchTab(active);
        _.each(tabs, function($parameter,k){
            if (_.isUndefined(disabled[k])){
                disableTab({'tab':k,'value':false});
                blockTab({'tab':k,'value':false});
            }
            else {
                disableTab({'tab':k,'value':true});
                blockTab({'tab':k,'value':true});
            }
        });
    };
    
    return menuRibbon;
});