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
    // Module References //
    var $setUIValue = undefined;
    var $getUIValue = undefined;
    var $menuRibbon = undefined;
    var $disableUIElement = undefined;
    var $messages = undefined;
    var $latticeTab = undefined;
    
    // Selectors //
    var $bravaisLatticeBlock = jQuery('.mh_bravais_lattice_block');
    var $periodicElement = jQuery('.ch');
    var $ionicValues = jQuery('.property-block');
    var $preview = jQuery('#tempSelection').find('p');
    var $atomsData = undefined;
    var $QRModal = jQuery('#openQR');
    
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
        
        // Atom Ionic Values //
        require(['atoms'], function(atomsInfo) {
            $atomsData = atomsInfo;
        });
        
        // Handlers //
        $bravaisLatticeBlock.on('click',function(){
            
            // Update Button and publish event
            $setUIValue.setValue({
                 selectedLattice:{
                    value: $messages.getMessage(jQuery(this).attr('id')) 
                 }
            });
            PubSub.publish('menu.lattice_change', jQuery(this).attr('id'));
            
            // Enable Motif Tab //
            $menuRibbon.disableTab({ 'motifTab': false });
            $menuRibbon.blockTab({ 'motifTab': false });
            
            // Enable Lattice Padlock
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
        $periodicElement.on('click',function(){
            // Element is not disabled or is the preview on footer //
            if ( !jQuery(this).hasClass('disabled') && !jQuery(this).parent().parent().hasClass('element-symbol-container') ){
                
                // Clear preselected values, then select element //
                $periodicElement.removeClass('selected');
                $ionicValues.removeClass('selected');
                jQuery(this).addClass('selected');
                
                // Fix preview selection on footer //
                elementPreview(jQuery(this));
                
                // Show footer and possible ionic values //
                jQuery('.modal-pre-footer').show();
                _.each($ionicValues, function($parameter, k){
                    var ionicIndex = jQuery($parameter).find('p').html();
                    
                    // If system has data for this element //
                    if ( $atomsData[$preview.html()] !== undefined ){
                        
                        // If this atom radius(iteration) is defined //
                        if ($atomsData[$preview.html()]['ionic'][ionicIndex] !== undefined ){
                            
                            // If we're searching for a triple bond //
                            if ( ionicIndex === '≡') showIonicOption($parameter, parseFloat($atomsData[$preview.html()]['ionic']['≡']));
                            else showIonicOption($parameter, parseFloat($atomsData[$preview.html()]['ionic'][ionicIndex]));
                        }
                        else if ($atomsData[$preview.html()]['radius'] !== undefined ) {
                            if ( ionicIndex === '0') showIonicOption($parameter, parseFloat($atomsData[$preview.html()]['radius']));
                            else hideIonicOption($parameter);
                        }
                        else hideIonicOption($parameter); 
                    }
                    else hideIonicOption($parameter); 
                });
            }
        });
        $ionicValues.click(function(){
            
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
            publish.atomOpacity = jQuery('#atomOpacity').val();
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
            
            // Unlock motif padlock and disable lattice parameters //
            if (!(jQuery('#latticePadlock').hasClass('disabled'))){
                $disableUIElement.disableElement({
                    motifPadlock:{
                        value: false   
                    },
                    latticeParameters:{
                        value: true   
                    }
                });
            }
            
            // Reset periodic modal //
            $ionicValues.addClass('disabled');
            $preview.hide('fast');
            jQuery('.modal-pre-footer').hide('fast');
            
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
        $QRModal.on('click', function(){
            $setUIValue.setValue({
                openQRModal:{
                    publish: true   
                }
            });
        });
    };
    function elementPreview(caller){
        $preview.html(caller.html());
        $preview.attr('class',caller.attr('class'));
        $preview.show();
    };
    function hideIonicOption(option){
        jQuery(option).addClass('disabled');
        jQuery(option).hide();
        jQuery(option).find('.resolution p').html('-');
    };
    function showIonicOption(option,value){
        jQuery(option).show();
        jQuery(option).removeClass('disabled');
        jQuery(option).find('.resolution p').html((value/100).toFixed(3) + ' &Aring;');
    };
    
    return modals;
});