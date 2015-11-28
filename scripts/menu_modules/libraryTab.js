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
    
    // [Public Library]
    /* Save Online */
    var $alt_atn_toggler = jQuery('.btn_alternate_action_toggler');
    /* Save to Public Library */
    var $btn_form_toggler = jQuery('.btn_form_toggler');
    
    // Selectors //
    var $downloadProject = jQuery('#downloadProject');
    var $saveOnlineLink = jQuery('#saveOnlineLink');
    var $selectLink = jQuery('#selectLink');
    var $saveOnlineLinkQR = jQuery('#saveOnlineLinkQR');
    var $selectLinkQR = jQuery('#selectLinkQR');
    var $downloadQR = jQuery('#downloadQR');
    var $QRImage = jQuery('#QRImage');
    var $projectName = jQuery('#projectName');
    var $projectDescription = jQuery('#projectDescription');
    var $saveProject = jQuery('#saveProject');
    
    // Contructor //
    function libraryTab(argument) {
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        
        // Inputs //
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
        
        // Buttons //
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
        $btn_form_toggler.on('click', function(){
            var $cnt_form = jQuery(this).closest('.save-public-library-box').find('.box-body');

            if ($cnt_form.is(':visible'))
            {
                $cnt_form.slideUp('fast');
                jQuery(this).removeClass('open');
            }
            else
            {
                $cnt_form.slideDown('fast');
                jQuery(this).addClass('open');
            }

            return false;
        });
        $downloadProject.on('click', function(){
            $setUIValue.setValue({
                downloadProject:{
                    publish: true   
                }
            });
        });
        $downloadQR.on('click', function(){
            $setUIValue.setValue({
                downloadQR:{
                    publish: true   
                }
            });
        });
        $selectLink.on('click', function(){
            $saveOnlineLink.focus();
        });
        $selectLinkQR.on('click', function(){
            $saveOnlineLinkQR.focus();
        });
        $saveProject.on('click', function(){
            console.log('asd'); 
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