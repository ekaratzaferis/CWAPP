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
        
        HOW TO IMPORT SEARCH RESULTS
        importSearchResults({
            result1: {
                id: 3,           <- 1st Level
                slug: '#91',     <- 2nd Level
                data: {          <- Data response OR JSON entry
                    info: {      <- 3rd Level 
                        name: "Fernando's Project",
                        description: 'Old unsatiable our now but considered travelling impression. In excuse hardly summer in basket misery. By rent an part need. At wrong of of water those linen. Needed oppose seemed how all. Very mrs shed shew gave you.',
                        tags: {
                            1: 'Old',
                            2: 'considered',
                            3: 'impression'
                        }
                    }
                }
            }
        },'Name'); <-- Name OR Desc OR Tags, depending on what we're searching for!
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
        
        var _this = this;
        
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
        html.library.search.searchName.hide();
        html.library.search.searchTags.hide();
        html.library.search.searchDesc.hide();
        html.library.search.databaseLoader.hide();
        
        // Database Service //
        html.library.search.searchField.on('submit', function(){
            
            // Loader //
            html.interface.screen.body.mCustomScrollbar("scrollTo",'bottom');
            
            // Hide Headers and clear previous results //
            html.library.search.databaseLoader.show();
            html.library.search.searchName.hide();
            html.library.search.searchTags.hide();
            html.library.search.searchDesc.hide();
            html.library.search.preview.hide();
            _.each(jQuery(html.library.search.sResults.selector), function($param, a){
                $param.remove();
            });
            
            var service = 'https://cwgl.herokuapp.com?format=json&';
            var prefix1 = 'qs=';
            var prefix2 = 'qv=';
            var nameQuery = '{"info":{"name":"'+html.library.search.searchQuery.val()+'"}}';
            var descQuery = '{"info":{"description":"'+html.library.search.searchQuery.val()+'"}}';
            var tagsQuery = '{"info":{"tags":["'+html.library.search.searchQuery.val()+'"]}}';
            
            // Request Search by Name //
            $.ajax(service + prefix1 + encodeURIComponent(nameQuery),{
                method: 'GET',
                beforeSend: function(xmlHttpRequest) {
                    xmlHttpRequest.withCredentials = true;
                }
            })
            .done(function(res) {
                _this.importSearchResults(res.documents,'Name');
            });
            
            // Request Search by Description //
            $.ajax(service + prefix1 + encodeURIComponent(descQuery),{
                method: 'GET',
                beforeSend: function(xmlHttpRequest) {
                    xmlHttpRequest.withCredentials = true;
                }
            })
            .done(function(res) {
                _this.importSearchResults(res.documents,'Desc');
            });
            
            // Request Search by Tags //
            $.ajax(service + prefix2 + encodeURIComponent(tagsQuery),{
                method: 'GET',
                beforeSend: function(xmlHttpRequest) {
                    xmlHttpRequest.withCredentials = true;
                }
            })
            .done(function(res) {
                _this.importSearchResults(res.documents,'Tags');
                // Hide Loader //
                html.library.search.databaseLoader.hide();
            });
            
            // Cancel Submit //
            return false;
        });
        
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
    
    // Module Interface / category = 'Name' OR 'Desc' OR 'Tags' //
    libraryTab.prototype.importSearchResults = function(results, category){
        // Update Headers //
        jQuery('#search'+category).find('a').html(category + ': '+ results.length +' matches found.');
        jQuery('#search'+category).show();
        

        _.each(results, function($parameter, k){
            // Read project information //
            var projectName = $parameter.data.info.name;
            var projectDescription = $parameter.data.info.description;
            var projectTags = $parameter.data.info.tags;
            var projectSlug = $parameter.slug;
            var projectID = $parameter.id;
            var thumbnail = ($parameter.data.info.preview) ? $parameter.data.info.preview : ' '  ; 
            
            // Create HTML query and append to the search results area //
            var query = '<div class="col col-sm-6 searchResults"><div class="project-block" id="'+projectID+category+'"><div class="block-image"><img src="'+thumbnail+'" class="img-responsive img-fullwidth" alt=""/></div><div class="block-title"><h4>'+projectName+'</h4></div></div></div>';
            jQuery('#search'+category).after(query);
            
            // Hover //
            jQuery('#'+projectID+category).hover(
                function(){
                    jQuery('#'+projectID+category).find('.block-image').css('background','#6f6299');
                    jQuery('#'+projectID+category).find('.block-title').css('background','#443771');
                    jQuery('#'+projectID+category).find('h4').css('color','#fff');
                    jQuery('#'+projectID+category).css('cursor','pointer');
                },
                function(){
                    jQuery('#'+projectID+category).find('.block-image').css('background','#25272b');
                    jQuery('#'+projectID+category).find('.block-title').css('background','#1c1d21');
                    jQuery('#'+projectID+category).find('h4').css('color','#6a6a6e');
                    jQuery('#'+projectID+category).css('cursor','auto');
                }
            );
            
            // Handler //
            jQuery('#'+projectID+category).on('click',function(){
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
                html.library.search.openPreview.attr('href','https://cw.gl/'+projectSlug)
                
                html.library.search.preview.show();
                html.library.search.previewResultImg.prop('src', thumbnail);

                html.interface.screen.body.mCustomScrollbar("scrollTo",html.library.search.preview);
            });
        });
        if (Object.keys(results).length > 1) {
            //html.library.search.results.append('<a class="footerLink">Load More Results</a>');   
        }
        else html.library.search.footer.remove();
    };
    libraryTab.prototype.updateLibrary = function(link){
        // Update QR Image //
        html.modals.qr.image.trigger('update',[link]);
        // Update Links //
        html.library.saveOnline.link.val(link);
        html.modals.qr.link.val(link);
        // Hide user dialog //
        menu.hideInfoDialog();
    };
    
    return libraryTab;
});