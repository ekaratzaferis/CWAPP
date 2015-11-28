/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'bootstrap',
    'icheck',
    'jColor'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    bootstrap,
    icheck,
    jColor
) 
{
    // Variables
    var $getUI = undefined;
    var $setUI = undefined;
    var $userDialog = undefined;
    var $disableUIElement = undefined;
    var value = undefined;
    var argument = undefined;
    var publish = undefined;
    
    // Inputs
    var $fogCheckbox = jQuery('input[name="fog"]');
    var $fogDensity = jQuery('#fogDensity');
    var $fogDensitySlider = jQuery('#fogDensitySlider');
    var $soundSlider = jQuery('#soundSlider');
    
    // Buttons
    var $sounds = jQuery('#sounds');
    var $lights = jQuery('#lights');
    var $fullScreen = jQuery('#fullScreen');
    var $leapMotion = $('#leapMotion');
    var $crystalCamTargetOn = jQuery("#crystalCamTargetOn");
    var $crystalCamTargetOff = jQuery("#crystalCamTargetOff");
    var $anaglyph = jQuery('#anaglyph');
    var $oculus = jQuery('#oculus');
    var $3DsideBySide = jQuery('#3DsideBySide');
    var $3DonTop = jQuery('#3DonTop');
    var $distortionOn = jQuery('#distortionOn');
    var $distortionOff = jQuery('#distortionOff');
    var $3DPrinting = jQuery('#DDDprinting');
    var $reset = jQuery('#reset');
    
    // Grouping
    var renderizationMode = {
        realistic: jQuery('#realistic'),
        wireframe: jQuery('#wireframe'),
        toon: jQuery('#toon'),
        flat: jQuery('#flat')
    };
    var crystalMode = {
        crystalClassic: jQuery('#crystalClassic'),
        crystalSubstracted: jQuery('#crystalSubstracted'),
        crystalSolidVoid: jQuery('#crystalSolidVoid'),
        crystalGradeLimited: jQuery('#crystalGradeLimited')
    };
    var unitCellMode = {
        cellClassic: jQuery('#cellClassic'),
        cellSubstracted: jQuery('#cellSubstracted'),
        cellSolidVoid: jQuery('#cellSolidVoid'),
        cellGradeLimited: jQuery('#cellGradeLimited')
    };
    var colorPickers = {
        fogColor : jQuery('#fogColor'),
        crystalScreenColor : jQuery('#crystalScreenColor'),
        cellScreenColor : jQuery('#cellScreenColor'),
        motifXScreenColor : jQuery('#motifXScreenColor'),
        motifYScreenColor : jQuery('#motifYScreenColor'),
        motifZScreenColor : jQuery('#motifZScreenColor')
    };
    var zoomOptions = {
        zoom70: jQuery('#zoom70'),   
        zoom80: jQuery('#zoom80'),   
        zoom90: jQuery('#zoom90'),   
        zoom100: jQuery('#zoom100'),
        autoZoom: jQuery('#autoZoom')
    };
    
    // Contructor //
    function visualTab(argument) {
        
        // Acquire Module References
        if (!(_.isUndefined(argument.getUIValue))) $getUI = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUI = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.userDialog))) $userDialog = argument.userDialog;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        
        
        // Visual Parameters
        _.each(renderizationMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    ($parameter.hasClass('active')) ? value = false : value = true;
                    if (value === true){
                        publish = {};
                        publish.mode = k;
                        argument = {};
                        argument[k] = {
                            publish: publish,
                            value: value
                        };
                        $setUI.setValue(argument);
                    }
                }
            });
        });
        $lights.on('click', function(){
            ($lights.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                lights:{
                    publish:{lights:value},
                    value:value
                }
            });
        });
        $distortionOn.on('click', function() {
            ($distortionOn.hasClass('active')) ? value = false : value = true;
            if (value === true){
                $setUI.setValue({
                    distortionOn:{
                        publish:{distortionOn:value},
                        value:value
                    }
                });  
            }
        });
        $distortionOff.on('click', function() {  
            ($distortionOff.hasClass('active')) ? value = false : value = true;
            if (value === true){
                $setUI.setValue({
                    distortionOff:{
                        publish:{distortionOff:value},
                        value:value
                    }
                });
            }
        });
        $anaglyph.on('click', function() {
            ($anaglyph.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                anaglyph:{
                    publish:{anaglyph:value},
                    value:value
                }
            });
        });
        $oculus.on('click', function() {
            ($oculus.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                oculus:{
                    publish:{oculus:value},
                    value:value
                }
            });
        });
        $3DsideBySide.on('click', function() {
            ($3DsideBySide.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                sideBySide:{
                    publish:{sideBySide:value},
                    value:value,
                    other: $3DsideBySide
                }
            });
        });
        $3DonTop.on('click', function() {
            ($3DonTop.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                onTop:{
                    publish:{onTop:value},
                    value:value,
                    other: $3DonTop
                }
            });
        });
        $crystalCamTargetOn.on('click', function(){
            ($crystalCamTargetOn.hasClass('active')) ? value = false : value = true;
            if (value === true) {
                $setUI.setValue({
                    crystalCamTargetOn:{
                        publish:{center:value},
                        value:value
                    }
                });
            }
        });
        $crystalCamTargetOff.on('click', function(){
            ($crystalCamTargetOff.hasClass('active')) ? value = false : value = true;
            if (value === true) {
                $setUI.setValue({
                    crystalCamTargetOff:{
                        publish:{center:value},
                        value:value
                    }
                });
            }
        });
        $fullScreen.on('click', function(){
            $setUI.setValue({
                fullScreen:{
                    publish:{}
                }
            });
        }); 
        $leapMotion.click(function() {
            ($leapMotion.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                leapMotion:{
                    publish:{leap:value}
                }
            });          
        });
        _.each(crystalMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    if ( (k === 'crystalSubstracted') || (k === 'crystalSolidVoid') ) {
                        $userDialog.showWarningDialog({ messageID: 3, caller: $parameter });
                    }
                    else $parameter.trigger('action');
                }
            });
            $parameter.on('action', function() {
                ($parameter.hasClass('active')) ? value = false : value = true;
                if (value === true){
                    publish = {};
                    publish.mode = k;
                    argument = {};
                    argument[k] = {
                        publish: publish,
                        value: value
                    };
                    $setUI.setValue(argument);
                }
            });
        });
        _.each(unitCellMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    ($parameter.hasClass('active')) ? value = false : value = true;
                    if (value === true){
                        publish = {};
                        publish.mode = k;
                        argument = {};
                        argument[k] = {
                            publish: publish,
                            value: value
                        };
                        $setUI.setValue(argument);
                    }
                }
            });
        });
        
        // Visualization Tools
        _.each(zoomOptions, function($parameter, k) {
            $parameter.on('click', function() {
                ($parameter.hasClass('active')) ? value = false : value = true;
                if (value === true){
                    argument = {};
                    argument[k] = {value:value};
                    $setUI.setValue(argument);
                }
            });
        });
        $fogCheckbox.iCheck({
            checkboxClass: 'icheckbox_square-grey',
            radioClass: 'iradio_square-grey'
        });
        $fogCheckbox.on('ifChecked',function(){
            $fogCheckbox.addClass('active');
            $setUI.setValue({
                fog:{
                    publish:{fog:true}
                }
            });
        });
        $fogCheckbox.on('ifUnchecked',function(){
            $fogCheckbox.removeClass('active');
            $setUI.setValue({
                fog:{
                    publish:{fog:false}
                }
            });
        });
        $fogDensity.val(1);
        $fogDensity.on('change',function(){
            $setUI.setValue({
                fogDensity:{
                    publish:{fogDensity: $fogDensity.val()},
                    value: $fogDensity.val()
                }
            });
        });
        $fogDensitySlider.slider({
            value: 5,
            min: 1,
            max: 10,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                $setUI.setValue({
                    fogDensity:{
                        publish:{fogDensity: $fogDensity.val()}
                    }
                });
                $fogDensity.val(ui.value);
            }
        });
        $sounds.on('click', function(){
            ($sounds.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                sounds:{
                    publish:{sounds:value},
                    value:value
                }
            });
        });
        $soundSlider.slider({
            value: 75,
            min: 0,
            max: 100,
            step: 1,
            animate: true,
            slide: function(event, ui){
                $setUI.setValue({
                    soundVolume:{
                        publish:{soundVolume: ui.value}
                    }
                });
            }
        });
        $soundSlider.slider('disable');
        _.each(colorPickers, function($parameter, k) {
            $parameter.spectrum({
                color: "#ffffff",
                allowEmpty:true,
                chooseText: "Choose",
                cancelText: "Close",
                move: function(){
                    publish = {};
                    publish[k] = $parameter.spectrum("get").toHex();
                    argument = {};
                    argument[k] = {
                        publish: publish
                    };
                    $setUI.setValue(argument);
                    $parameter.children().css('background','#'+$parameter.spectrum("get").toHex());
                },
                change: function(){
                    publish = {};
                    publish[k] = $parameter.spectrum("get").toHex();
                    argument = {};
                    argument[k] = {
                        publish: publish
                    };
                    $setUI.setValue(argument);
                    $parameter.children().css('background','#'+$parameter.spectrum("get").toHex());
                }
            });
        });
        $3DPrinting.on('click',function(){
            $setUI.setValue({
                '3DPrinting':{
                    publish:{threeD:true}
                }
            });
        });
        $reset.on('click',function(){
            jQuery('#latticeTab').find('a').trigger('click');
            setTimeout(function(){
                jQuery('body').mCustomScrollbar("scrollTo",'top');
            },200);
            $setUI.setValue({
                reset: {
                    value: true
                }
            });
        });
    };
    
    visualTab.prototype.chooseActiveRenderMode = function(id){
        var argument = {};
        argument[id] = {value: true};
        $setUI.setValue(argument);
    };
    visualTab.prototype.chooseActiveCrystalMode = function(id){
        var argument = {};
        argument[id] = {value: true};
        $setUI.setValue(argument);
    };
    visualTab.prototype.chooseActiveUnitCellMode = function(id){
        var argument = {};
        argument[id] = {value: true};
        $setUI.setValue(argument);
    };
    visualTab.prototype.disableRenderizationButtons = function(values){
        var argument = {};
        _.each(values, function($parameter,k){
            argument[k] = {value: $parameter};
        });
        $disableUIElement.disableElement(argument);
    };
    visualTab.prototype.disableCrystalButtons = function(values){
        var argument = {};
        _.each(values, function($parameter,k){
            argument[k] = {value: $parameter};
        });
        $disableUIElement.disableElement(argument);
    };
    visualTab.prototype.disableUnitCellButtons = function(values){
        var argument = {};
        _.each(values, function($parameter,k){
            argument[k] = {value: $parameter};
        });
        $disableUIElement.disableElement(argument);
    };
    return visualTab;
});