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
    /* This module handles any store/open/search process related to the project.
        
        * QR Image and link are updated through this module.
        * All files are constructed in the storeProject.js module.
    */
    
    // Module References //
    var $setUIValue = undefined;
    var $getUIValue = undefined;
    var $tooltipGenerator = undefined;
    var $messages = undefined;
    var $disableUIElement = undefined;
    var $notesTab = undefined;
    var $userDialog = undefined;
    var html = undefined;
    var menu = undefined;
    
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
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        if (!(_.isUndefined(argument.menu))) menu = argument.menu;
        else return false;
        
        // Save Project Section //
        
        // Tags //
        html.library.project.tags.tagit({
            placeholderText: 'Type your tags'   
        });
        
        // Download to your PC //
        html.library.project.download.on('click', function(){
            var details = readDetails();
            if (details !== false) PubSub.publish('menu.download_project', details);
        });
        
        // Export JSON //
        html.library.json.export.on('click', function(){
            var details = readDetails();
            if (details !== false) PubSub.publish('menu.export_json', details);
        }); 
        
        // Save Online //
        html.library.saveOnline.toggler.on('click', function(){
            if (html.library.saveOnline.target.is(':visible'))
            {
                html.library.saveOnline.target.slideUp('fast');
                jQuery(this).removeClass('active');
            }
            else
            {
                var details = readDetails();
                if (details !== false) {
                    $userDialog.showInfoDialog({ messageID: 29 });
                    PubSub.publish('menu.save_online', details);
                    html.library.saveOnline.target.slideDown('fast');
                    jQuery(this).addClass('active');
                }
            }
            return false;
        });
        // Update QR Image //
        html.modals.qr.image.on('update',function(event, value){
            html.modals.qr.image.empty();
            html.modals.qr.image.qrcode({
                render: 'image',
                size: 174,
                fill: '#6f6299',
                text: value
            });
        });
        // Focus input field //
        html.library.saveOnline.selectLink.on('click', function(){
            html.library.saveOnline.link.focus();
        });
        html.modals.qr.selectLink.on('click', function(){
            html.modals.qr.link.focus();
        });
        // On focus, select link and display tooltip //
        html.library.saveOnline.link.focus(function(){
            html.library.saveOnline.link.select();
            $tooltipGenerator.showTooltip({
                'target': 'saveOnlineLink',
                'placement': 'top',
                'message': $messages.getMessage(23)
            });
        });
        html.modals.qr.link.focus(function(){
            html.modals.qr.link.select(); 
            $tooltipGenerator.showTooltip({
                'target': 'saveOnlineLinkQR',
                'placement': 'right',
                'message': $messages.getMessage(23)
            });
        });
        
        // SnapShot //
        html.library.png.toggler.on('click', function(){
            PubSub.publish('menu.export_png', 'png'); 
        });
        
        // STL //
        html.library.stl.toggler.on('click', function(){
            if (html.library.stl.target.is(':visible'))
            {
                html.library.stl.target.slideUp('fast');
                jQuery(this).removeClass('active');
            }
            else
            {
                html.library.stl.target.slideDown('fast');
                jQuery(this).addClass('active');
            }
            return false;
        });
        html.library.stl.lowRes.on('click',function(){
            $setUIValue.setValue({
                '3DPrinting':{
                    publish:{
                        threeD:true,
                        resolution: 'low'
                    }
                }
            });
        });
        html.library.stl.mediumRes.on('click',function(){
            $setUIValue.setValue({
                '3DPrinting':{
                    publish:{
                        threeD:true,
                        resolution: 'medium'
                    }
                }
            });
        });
        html.library.stl.highRes.on('click',function(){
            $setUIValue.setValue({
                '3DPrinting':{
                    publish:{
                        threeD:true,
                        resolution: 'high'
                    }
                }
            });
        });
        // Tooltips //
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
        html.library.json.open.on('click', function(){
            html.library.json.openDialog.trigger('click');
        });
        html.library.json.openDialog.change(function(event){
            var f = event.target.files[0];  
            if (f) {
                var r = new FileReader();
                // Once the file is upload //
                r.onload = function(e) {  
                    var st = JSON.parse(e.target.result);  
                    PubSub.publish('menu.open_json', st);
                }
                r.readAsText(f);
            } 
            else {
                // Display Error Message //
                $userDialog.showErrorDialog({ messageID: 31, code: '402' });
            }
        });
        
        // Search Area //
        html.library.search.preview.hide();
        
    };
    // Read mandatory project details before allowing any save/open process //
    function readDetails(){
        var details = {};
        
        // Gather Library Form Data //
        details.name = html.library.project.name.val();
        details.description = html.library.project.description.val();
        details.tags = html.library.project.tags.tagit("assignedTags");
        
        // Gather App UI State //
        details.app = $getUIValue.getAppState();
        details.notes = $notesTab.getNotes();
        details.atomList = menu.getAtomList();
        
        // Require project name before moving on //
        if (details.name !== '') return details;
        else {
            $tooltipGenerator.showTooltip({
                'target': 'projectName',
                'placement': 'top',
                'message': $messages.getMessage(28)
            });
            html.library.project.name.focus();
            return false;
        }
    };
    
    // Module Interface //
    libraryTab.prototype.importSearchResults = function(data){
        _.each(data, function($parameter, k){
            // Read project information //
            var projectName = $parameter.name;
            var projectDescription = $parameter.description;
            var projectTags = $parameter.tags;
            var projectSlug = $parameter.slug;
            var thumbnail = 'Images/project-screenshot.png';
            
            // Create HTML query and append to the search results area //
            var query = '<div class="col col-sm-6"><div class="project-block" id="'+k+'"><div class="block-image"><img src="'+thumbnail+'" class="img-responsive img-fullwidth" alt=""/></div><div class="block-title"><h4>'+projectName+'</h4></div></div></div>';
            html.library.search.results.append(query);
            
            // Hover //
            jQuery('#'+k).hover(
                function(){
                    jQuery('#'+k).find('.block-image').css('background','#6f6299');
                    jQuery('#'+k).find('.block-title').css('background','#443771');
                    jQuery('#'+k).find('h4').css('color','#fff');
                    jQuery('#'+k).css('cursor','pointer');
                },
                function(){
                    jQuery('#'+k).find('.block-image').css('background','#25272b');
                    jQuery('#'+k).find('.block-title').css('background','#1c1d21');
                    jQuery('#'+k).find('h4').css('color','#6a6a6e');
                    jQuery('#'+k).css('cursor','auto');
                }
            );
            
            // Handler //
            jQuery('#'+k).on('click',function(){
                // Fill in Preview information //
                html.library.search.previewTitle.html(projectName);
                html.library.search.previewDescription.html(projectDescription);
                html.library.search.previewTags.html('');
                _.each(projectTags, function($param,a){
                    html.library.search.previewTags.append('<a class="tag tag-purple">'+$param+'</a>');
                });
                
                // Update QR Modal //
                html.modals.qr.image.empty();
                html.modals.qr.image.qrcode({
                    render: 'image',
                    size: 174,
                    fill: '#6f6299',
                    text: projectSlug
                });
                html.modals.qr.link.val('cw.gl/'+projectSlug);
                
                // Update Project Link //
                html.library.search.openPreview.attr('href','http://cw.gl/'+projectSlug)
                
                html.library.search.preview.show();
                html.interface.screen.body.mCustomScrollbar("scrollTo",html.library.search.preview);
            });
        });
        if (Object.keys(data).length > 1) {
            html.library.search.results.append('<a class="footerLink">Load More Results</a>');   
        }
        else html.library.search.footer.remove();
    };
    
    return libraryTab;
});