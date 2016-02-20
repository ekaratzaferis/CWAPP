/*global define*/
'use strict';

// Dependecies

define([
    'pubsub',
    'underscore'
], function(
    PubSub, 
    _
) 
{
    /* This module handles the UI Modals.
        Lattice Modal: Lattice Selection
        Periodic Table Modal: Atom selection, in 2 stages
            -> Select Atom
            -> Select Ionic Value
        QR Modal: QR Image Information
    */
    // Module References //
    var $setUIValue = undefined;
    var $getUIValue = undefined;
    var $menuRibbon = undefined;
    var $disableUIElement = undefined;
    var $messages = undefined;
    var $latticeTab = undefined;
    var $atomsData = undefined;
    var html = undefined;
    
    // Contructor //
    function modals(argument) {
        
        // Acquire Module References //
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.getUIValue))) $getUIValue = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.menuRibbon))) $menuRibbon = argument.menuRibbon;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.latticeTab))) $latticeTab = argument.latticeTab;
        else return false;
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Atom Ionic Values //
        require(['atoms'], function(atomsInfo) {
            $atomsData = atomsInfo;
        });
        
        // Handlers //
        html.modals.lattice.block.on('click',function(){
            
            // Update Button and publish event //
            $setUIValue.setValue({
                 selectedLattice:{
                    value: $messages.getMessage(jQuery(this).attr('id')) 
                 }
            });
            PubSub.publish('menu.lattice_change', jQuery(this).attr('id'));
            
            // Enable Motif Tab //
            $menuRibbon.disableTab({ 'motifTab': false });
            $menuRibbon.blockTab({ 'motifTab': false });
            $menuRibbon.disableTab({ 'pndTab': false });
            $menuRibbon.blockTab({ 'pndTab': false });
            $menuRibbon.disableTab({ 'visualTab': false });
            $menuRibbon.blockTab({ 'visualTab': false });
            
            // Enable Lattice Padlock //
            $disableUIElement.disableElement({
                latticePadlock:{
                    value: false
                }
            });
            
            // Reset Values in case user is choosing lattice for the 2nd+ time //
            $setUIValue.setValue({
                latticePadlock:{
                    value: false
                },
                repeatX:{
                    value: 1,
                    publish: {
                        repeatX: 1   
                    }
                },
                repeatY:{
                    value: 1,
                    publish: {
                        repeatY: 1   
                    }
                },
                repeatZ:{
                    value: 1,
                    publish: {
                        repeatZ: 1   
                    }
                }
            });
        });
        html.modals.periodicTable.element.on('click',function(){
            // Element is not disabled or is the preview on footer //
            if ( !jQuery(this).hasClass('disabled') && !jQuery(this).parent().parent().hasClass('element-symbol-container') ){
                
                // Clear preselected values, then select element //
                html.modals.periodicTable.element.removeClass('selected');
                html.modals.periodicTable.ionicValues.removeClass('selected');
                jQuery(this).addClass('selected');
                
                // Fix preview selection on footer //
                elementPreview(jQuery(this));
                
                // Show footer and possible ionic values //
                jQuery('.modal-pre-footer').show();
                _.each(html.modals.periodicTable.ionicValues, function($parameter, k){
                    var ionicIndex = jQuery($parameter).find('p').html();
                    
                    // If system has data for this element //
                    if ( $atomsData[html.modals.periodicTable.ionicPreview.html()] !== undefined ){
                        
                        // If this atom radius(iteration) is defined //
                        if ($atomsData[html.modals.periodicTable.ionicPreview.html()]['ionic'][ionicIndex] !== undefined ){
                            
                            // If we're searching for a triple bond //
                            if ( ionicIndex === '≡') showIonicOption($parameter, parseFloat($atomsData[html.modals.periodicTable.ionicPreview.html()]['ionic']['≡']));
                            else showIonicOption($parameter, parseFloat($atomsData[html.modals.periodicTable.ionicPreview.html()]['ionic'][ionicIndex]));
                        }
                        else if ($atomsData[html.modals.periodicTable.ionicPreview.html()]['radius'] !== undefined ) {
                            if ( ionicIndex === '0') showIonicOption($parameter, parseFloat($atomsData[html.modals.periodicTable.ionicPreview.html()]['radius']));
                            else hideIonicOption($parameter);
                        }
                        else hideIonicOption($parameter); 
                    }
                    else hideIonicOption($parameter); 
                });
            }
        });
        html.modals.periodicTable.ionicValues.click(function(){
            
            // Selected Element //
            var selected = jQuery('td.ch.selected');
            
            // Collect values
            var ionicValue = jQuery(this).find('.resolution p').html().split(" ");
            var tangency = $getUIValue.getValue({
                'tangency':
                    {'id':'tangency'}
            });
            
            // Publish Object //
            var publish = {};
            publish.element = selected.html();
            publish.atomTexture = 'None';
            publish.wireframe = false;
            publish.atomColor = $atomsData[publish.element]['color'];
            publish.atomOpacity = html.motif.atomParameters.atomOpacity.val();
            publish.ionicIndex = jQuery(this).find('.serial p').html();
            publish.ionicValue = ionicValue[0];
            publish.tangency = tangency.tangency;
            PubSub.publish('menu.atom_selection', publish);
            
            // Show Element Indicator in Motif Tab //
            $setUIValue.setValue({
                elementContainer:{
                    other: selected,
                    value: publish.ionicIndex
                }
            });
            
            // Enable motif padlock //
            if (!(html.lattice.padlocks.lattice.hasClass('disabled'))){
                $disableUIElement.disableElement({
                    motifPadlock:{
                        value: false   
                    }
                });
            }
            
            // Disable lattice parameters //
            if (!(html.lattice.padlocks.motif.find('a').hasClass('active'))){
                $disableUIElement.disableElement({
                    latticeParameters:{
                        value: true
                    }
                });
            }
            
            // Reset periodic modal //
            html.modals.periodicTable.ionicValues.addClass('disabled');
            html.modals.periodicTable.ionicPreview.hide('fast');
            html.modals.periodicTable.footer.hide('fast');
            
            // Update Lattice Tab Conditions
            $latticeTab.updateCondition({
                atomAdded: true, 
                autoRefresh: true
            });
            
            // Show refresh button on lattice tab //
            $disableUIElement.disableElement({
                latticeRefreshButtons:{
                    value: false   
                },
                select_lattice:{
                    value: true
                }
            });
            
            // Show swap //
            $menuRibbon.setSwapButtonState(true);
        });
        html.modals.qr.modal.on('click', function(){
            html.modals.qr.download.attr('href',html.modals.qr.image.find('img').attr('src'));
        });
    };
    // Update preview symbol from the periodic table modal //
    function elementPreview(caller){
        html.modals.periodicTable.ionicPreview.html(caller.html());
        html.modals.periodicTable.ionicPreview.attr('class',caller.attr('class'));
        html.modals.periodicTable.ionicPreview.show();
    };
    // Removes Ionic Value from the bottom of the periodic table modal //
    function hideIonicOption(option){
        jQuery(option).addClass('disabled');
        jQuery(option).hide();
        jQuery(option).find('.resolution p').html('-');
    };
    // Insert Ionic Value at the bottom of the periodic table modal //
    function showIonicOption(option,value){
        jQuery(option).show();
        jQuery(option).removeClass('disabled');
        jQuery(option).find('.resolution p').html((value/100).toFixed(3) + ' &Aring;');
    };
    
    return modals;
});