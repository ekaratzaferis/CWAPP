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
    
    var thanos = 'mpines';
    // Module References //
    var $setUIValue = undefined;
    var $getUIValue = undefined;
    var $tooltipGenerator = undefined;
    var $messages = undefined;
    var $notesTab = undefined;
    var $userDialog = undefined;
    
    // Toggable DIV from the Save Online Button [Public Library]
    var $alt_atn_target = jQuery('#cnt_alternate_actions');
    var $alt_png_target = jQuery('#png_alternate_actions');
    var $alt_stl_target = jQuery('#stl_alternate_actions');
    
    // [Public Library]
    /* Save Online */
    var $alt_atn_toggler = jQuery('.btn_alternate_action_toggler');
    var $exportPNG = jQuery('.btn_alternate_png_toggler');
    var $alt_stl_toggler = jQuery('.btn_alternate_stl_toggler');
    
    // Selectors //
    var $downloadProject = jQuery('#downloadProject');
    var $exportJSON = jQuery('#exportJSON');
    var $openJSON = jQuery('#openJSON');
    var $openJSONDialog = jQuery('#openJSONInput');
    var $saveOnlineLink = jQuery('#saveOnlineLink');
    var $selectLink = jQuery('#selectLink');
    var $saveOnlineLinkQR = jQuery('#saveOnlineLinkQR');
    var $selectLinkQR = jQuery('#selectLinkQR');
    var $QRImage = jQuery('#QRImage');
    var $projectName = jQuery('#projectName');
    var $projectTags = jQuery('#projectTags');
    var $projectDescription = jQuery('#projectDescription');
    var $saveProject = jQuery('#saveProject');
    var $lowResSTL = jQuery('#lowSTL');
    var $mediumResSTL = jQuery('#mediumSTL');
    var $highResSTL = jQuery('#highSTL');
    
    // Contructor //
    function libraryTab(argument) {
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.getUIValue))) $getUIValue = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.notesTab))) $notesTab = argument.notesTab;
        else return false;
        if (!(_.isUndefined(argument.userDialog))) $userDialog = argument.userDialog;
        else return false;
        
        // Save Project Section //
        
        // Tags //
        $projectTags.tagit({
            placeholderText: 'Type your tags'   
        });
        
        // Download to your PC //
        $downloadProject.on('click', function(){
            var details = readDetails();
            if (details !== false) PubSub.publish('menu.download_project', details);
        });
        
        // Export JSON //
        $exportJSON.on('click', function(){
            var details = readDetails();
            if (details !== false) PubSub.publish('menu.export_json', details);
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
                var details = readDetails();
                if (details !== false) {
                    $userDialog.showInfoDialog({ messageID: 29 });
                    PubSub.publish('menu.save_online', details);
                    $alt_atn_target.slideDown('fast');
                    jQuery(this).addClass('active');
                }
            }
            return false;
        });
        // Update QR Image //
        $QRImage.on('update',function(event, value){
            $QRImage.empty();
            $QRImage.qrcode({
                render: 'image',
                size: 174,
                fill: '#6f6299',
                text: value
            });
        });
        
        $selectLink.on('click', function(){
            $saveOnlineLink.focus();
        });
        $selectLinkQR.on('click', function(){
            $saveOnlineLinkQR.focus();
        });
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
        $exportPNG.on('click', function(){
            PubSub.publish('menu.export_png', 'png'); 
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
        $lowResSTL.on('click',function(){
            $setUIValue.setValue({
                '3DPrinting':{
                    publish:{
                        threeD:true,
                        resolution: 'low'
                    }
                }
            });
        });
        $mediumResSTL.on('click',function(){
            $setUIValue.setValue({
                '3DPrinting':{
                    publish:{
                        threeD:true,
                        resolution: 'medium'
                    }
                }
            });
        });
        $highResSTL.on('click',function(){
            $setUIValue.setValue({
                '3DPrinting':{
                    publish:{
                        threeD:true,
                        resolution: 'high'
                    }
                }
            });
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
        
        // Open JSON File //
        $openJSON.on('click', function(){
            jQuery('#openJSONInput').trigger('click');
        });
        $openJSONDialog.change(function(event){
            $userDialog.showInfoDialog({ messageID: 30 });
            var f = event.target.files[0];  
            if (f) {
                var r = new FileReader();
                r.onload = function(e) {  
                    var st = JSON.parse(e.target.result);  
                    PubSub.publish('menu.open_json', st);
                    $setUIValue.restore(st.appUI,st.info);
                    $notesTab.restoreNotes(st.notes);
                    $userDialog.hideInfoDialog();
                }
                r.readAsText(f);
            } 
            else { 
                $userDialog.hideInfoDialog();
                $userDialog.showErrorDialog({ messageID: 31, code: '402' });
            }
        });
        
    };
    function readDetails(){
        var details = {};
        
        // Gather Library Form Data //
        details.name = $projectName.val();
        details.description = $projectDescription.val();
        details.tags = $projectTags.tagit("assignedTags");
        
        // Gather App UI State //
        details.app = $getUIValue.getAppState();
        details.notes = $notesTab.getNotes();
        
        if (details.name !== '') return details;
        else {
            $tooltipGenerator.showTooltip({
                'target': 'projectName',
                'placement': 'top',
                'message': $messages.getMessage(28)
            });
            $projectName.focus();
            return false;
        }
    };
    
    return libraryTab;
});