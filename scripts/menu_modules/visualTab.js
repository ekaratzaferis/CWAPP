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
    var value = undefined;
    
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
    var $distortionOn = jQuery('#distortionOn');
    var $distortionOff = jQuery('#distortionOff');
    var $3DPrinting = jQuery('#DDDprinting');
    
    // Grouping
    var renderizationMode = {
        'realistic': jQuery('#realistic'),
        'wireframe': jQuery('#wireframe'),
        'toon': jQuery('#toon'),
        'flat': jQuery('#flat')
    };
    var crystalMode = {
        'crystalClassic': jQuery('#crystalClassic'),
        'crystalSubstracted': jQuery('#crystalSubstracted'),
        'crystalSolidVoid': jQuery('#crystalSolidVoid'),
        'crystalGradeLimited': jQuery('#crystalGradeLimited')
    };
    var unitCellMode = {
        'cellClassic': jQuery('#cellClassic'),
        'cellSubstracted': jQuery('#cellSubstracted'),
        'cellSolidVoid': jQuery('#cellSolidVoid'),
        'cellGradeLimited': jQuery('#cellGradeLimited')
    };
    var colorPickers = {
        'fogColor' : jQuery('#fogColor'),
        'crystalScreenColor' : jQuery('#crystalScreenColor'),
        'cellScreenColor' : jQuery('#cellScreenColor'),
        'motifXScreenColor' : jQuery('#motifXScreenColor'),
        'motifYScreenColor' : jQuery('#motifYScreenColor'),
        'motifZScreenColor' : jQuery('#motifZScreenColor')
    }
    
    // Contructor //
    function visualTab(argument) {
        
        // Acquire Module References
        if (!(_.isUndefined(argument.getUIValue))) $getUI = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUI = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.userDialog))) $userDialog = argument.userDialog;
        else return false;
        
        
        // Visual Parameters
        _.each(renderizationMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    ($parameter.hasClass('active')) ? value = false : value = true;
                    if (value === true){
                        $setUI.setValue({
                            k:{
                                'publish':{'mode':k},
                                'value':value
                            }
                        });
                    }
                }
            });
        });
        $lights.on('click', function(){
            ($lights.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                'lights':{
                    'publish':{'lights':value},
                    'value':value
                }
            });
        });
        $distortionOn.on('click', function() {
            ($distortionOn.hasClass('active')) ? value = false : value = true;
            if (value === true){
                $setUI.setValue({
                    'distortionOn':{
                        'publish':{'distortionOn':value},
                        'value':value
                    }
                });  
            }
        });
        $distortionOff.on('click', function() {  
            ($distortionOff.hasClass('active')) ? value = false : value = true;
            if (value === true){
                $setUI.setValue({
                    'distortionOff':{
                        'publish':{'distortionOff':value},
                        'value':value
                    }
                });
            }
        });
        $anaglyph.on('click', function() {
            ($anaglyph.hasClass('active')) ? value = false : value = true;
            if (value === true){
                $setUI.setValue({
                    'anaglyph':{
                        'publish':{'anaglyph':value},
                        'value':value
                    }
                });
            }
        });
        $oculus.on('click', function() {
            ($oculus.hasClass('active')) ? value = false : value = true;
            if (value === true){
                $setUI.setValue({
                    'oculus':{
                        'publish':{'oculus':value},
                        'value':value
                    }
                });
            }
        });
        $crystalCamTargetOn.on('click', function(){
            ($crystalCamTargetOn.hasClass('active')) ? value = false : value = true;
            if (value === true) {
                $setUI.setValue({
                    'crystalCamTargetOn':{
                        'publish':{'center':value},
                        'value':value
                    }
                });
            }
        });
        $crystalCamTargetOff.on('click', function(){
            ($crystalCamTargetOff.hasClass('active')) ? value = false : value = true;
            if (value === true) {
                $setUI.setValue({
                    'crystalCamTargetOff':{
                        'publish':{'center':value},
                        'value':value
                    }
                });
            }
        });
        $fullScreen.on('click', function(){
            $setUI.setValue({
                'fullScreen':{
                    'publish':{}
                }
            });
        }); 
        $leapMotion.click(function() {
            ($leapMotion.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                'leapMotion':{
                    'publish':{'leap':value}
                }
            });          
        });
        _.each(crystalMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    if ( (k === 'crystalSubstracted') || (k === 'crystalSolidVoid') ) {
                        $userDialog.showWarningDialog({ 'messageID': 3, 'caller': $parameter });
                    }
                    else $parameter.trigger('action');
                }
            });
            $parameter.on('action', function() {
                ($parameter.hasClass('active')) ? value = false : value = true;
                if (value === true){
                    $setUI.setValue({
                        k:{
                            'publish':{'mode':k},
                            'value':value
                        }
                    });
                }
            });
        });
        _.each(unitCellMode, function($parameter, k) {
            $parameter.on('click', function() {
                if (!($parameter.hasClass('disabled'))) {
                    ($parameter.hasClass('active')) ? value = false : value = true;
                    if (value === true){
                        $setUI.setValue({
                            k:{
                                'publish':{'mode':k},
                                'value':value
                            }
                        });
                    }
                }
            });
        });
        
        // Visualization Tools
        _.each(zoomOptions, function($parameter, k) {
            $parameter.on('click', function() {
                ($parameter.hasClass('active')) ? value = false : value = true;
                $setUI.setValue({
                    k:{
                        'value':true
                    }
                });
            });
        });
        $fogCheckbox.iCheck({
            checkboxClass: 'icheckbox_square-grey',
            radioClass: 'iradio_square-grey'
        });
        $fogCheckbox.on('ifChecked',function(){
            $fogCheckbox.addClass('active');
            $setUI.setValue({
                'fog':{
                    'publish':{'fog':true}
                }
            });
        });
        $fogCheckbox.on('ifUnchecked',function(){
            $fogCheckbox.removeClass('active');
            $setUI.setValue({
                'fog':{
                    'publish':{'fog':false}
                }
            });
        });
        $fogDensity.val(1);
        $fogDensity.on('change',function(){
            $setUI.setValue({
                'fogDensity':{
                    'publish':{'fogDensity': $fogDensity.val()},
                    'value': $fogDensity.val()
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
                $setUIValue.setValue({
                    'fogDensity':{
                        'publish':{'fogDensity': $fogDensity.val()}
                    }
                });
                $fogDensity.val(ui.value);
            }
        });
        $sounds.on('click', function(){
            ($sounds.hasClass('active')) ? value = false : value = true;
            $setUI.setValue({
                'sounds':{
                    'publish':{'sounds':value},
                    'value':value
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
                $setUIValue.setValue({
                    'soundVolume':{
                        'publish':{'soundVolume': ui.value}
                    }
                });
            }
        });
        _.each(colorPickers, function($parameter, k) {
            $parameter.spectrum({
                color: "#ffffff",
                allowEmpty:true,
                chooseText: "Choose",
                cancelText: "Close",
                move: function(){
                    $setUI.setValue({
                        k:{
                            'publish':{k: $parameter.spectrum("get").toHex()}
                        }
                    });
                    $parameter.children().css('background','#'+$parameter.spectrum("get").toHex());
                },
                change: function(){
                    $setUI.setValue({
                        k:{
                            'publish':{k: $parameter.spectrum("get").toHex()}
                        }
                    });
                    $parameter.children().css('background','#'+$parameter.spectrum("get").toHex());
                }
            });
        });
        $3DPrinting.on('click',function(){
            $setUI.setValue({
                '3DPrinting':{
                    'publish':{'threeD':true}
                }
            });
        });
    };
    
    return visualTab;
});