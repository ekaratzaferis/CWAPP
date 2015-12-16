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
    
    // Module References //
    var $setUIValue = undefined;
    var $tooltipGenerator = undefined;
    var $messages = undefined;
    
    // Toggable DIV from the Save Online Button [Public Library]
    var $alt_atn_target = jQuery('#cnt_alternate_actions');
    var $alt_png_target = jQuery('#png_alternate_actions');
    var $alt_stl_target = jQuery('#stl_alternate_actions');
    
    // [Public Library]
    /* Save Online */
    var $alt_atn_toggler = jQuery('.btn_alternate_action_toggler');
    var $alt_png_toggler = jQuery('.btn_alternate_png_toggler');
    var $alt_stl_toggler = jQuery('.btn_alternate_stl_toggler');
    
    // Selectors //
    var $downloadProject = jQuery('#downloadProject');
    var $saveOnlineLink = jQuery('#saveOnlineLink');
    var $selectLink = jQuery('#selectLink');
    var $saveOnlineLinkQR = jQuery('#saveOnlineLinkQR');
    var $selectLinkQR = jQuery('#selectLinkQR');
    var $downloadQR = jQuery('#downloadQR');
    var $QRImage = jQuery('#QRImage');
    var $projectName = jQuery('#projectName');
    var $projectTags = jQuery('#projectTags');
    var $projectDescription = jQuery('#projectDescription');
    var $saveProject = jQuery('#saveProject');
    var $lowResolution = jQuery('#lowPNG');
    var $mediumResolution = jQuery('#mediumPNG');
    var $highResolution = jQuery('#highPNG');
    
    // Contructor //
    function libraryTab(argument) {
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        
        // Save Project Section //
        // Download to your PC //
        $downloadProject.on('click', function(){
            $setUIValue.setValue({
                downloadProject:{
                    publish: true   
                }
            });
        }); 
        
        // Save Online //
        $alt_atn_toggler.on('click', function(){
            if ($alt_atn_target.is(':visible'))
            {
                $alt_atn_target.slideUp('fast');
                jQuery(this).removeClass('active');
            }
            else
            {
                $alt_atn_target.slideDown('fast');
                jQuery(this).addClass('active');
            }
            return false;
        });
        $selectLink.on('click', function(){
            $saveOnlineLink.focus();
        });
        $selectLinkQR.on('click', function(){
            $saveOnlineLinkQR.focus();
        });
        $saveOnlineLink.val('cwgl.com/105/');
        $saveOnlineLinkQR.val('cwgl.com/105/');
        $saveOnlineLink.focus(function(){
            $saveOnlineLink.select();
            $tooltipGenerator.showTooltip({
                'target': 'saveOnlineLink',
                'placement': 'top',
                'message': $messages.getMessage(23)
            });
        });
        $saveOnlineLinkQR.focus(function(){
            $saveOnlineLinkQR.select(); 
            $tooltipGenerator.showTooltip({
                'target': 'saveOnlineLinkQR',
                'placement': 'right',
                'message': $messages.getMessage(23)
            });
        });
        
        // SnapShot //
        $alt_png_toggler.on('click', function(){
            if ($alt_png_target.is(':visible'))
            {
                $alt_png_target.slideUp('fast');
                jQuery(this).removeClass('active');
            }
            else
            {
                $alt_png_target.slideDown('fast');
                jQuery(this).addClass('active');
            }
            return false;
        });
        $tooltipGenerator.addOnHoverTooltip({
            'target': 'lowPNG',
            'placement': 'top',
            'message': $messages.getMessage(25)
        });
        $tooltipGenerator.addOnHoverTooltip({
            'target': 'mediumPNG',
            'placement': 'top',
            'message': $messages.getMessage(26)
        });
        $tooltipGenerator.addOnHoverTooltip({
            'target': 'highPNG',
            'placement': 'top',
            'message': $messages.getMessage(27)
        });
        
        // STL //
        $alt_stl_toggler.on('click', function(){
            if ($alt_stl_target.is(':visible'))
            {
                $alt_stl_target.slideUp('fast');
                jQuery(this).removeClass('active');
            }
            else
            {
                $alt_stl_target.slideDown('fast');
                jQuery(this).addClass('active');
            }
            return false;
        });
        $tooltipGenerator.addOnHoverTooltip({
            'target': 'lowSTL',
            'placement': 'top',
            'message': $messages.getMessage(25)
        });
        $tooltipGenerator.addOnHoverTooltip({
            'target': 'mediumSTL',
            'placement': 'top',
            'message': $messages.getMessage(26)
        });
        $tooltipGenerator.addOnHoverTooltip({
            'target': 'highSTL',
            'placement': 'top',
            'message': $messages.getMessage(27)
        });
        
        // Detail Forms //
        $QRImage.qrcode({
            render: 'image',
            size: 174,
            fill: '#6f6299',
            text: 'thano mpine'
        }); 
        $projectTags.tagit();
        $projectTags.tagit("createTag", "CrystalWalk");
        $saveProject.on('click',function(){
            
        });
    };
    
    libraryTab.prototype.setSaveOnlineLink = function(link){
        $saveOnlineLink.val(link);  
        $saveOnlineLinkQR.val(link);  
    };
    libraryTab.prototype.setQRImage = function(imgLink){
        $QRImage.attr('src',imgLink);  
    };
    
    return libraryTab;
});