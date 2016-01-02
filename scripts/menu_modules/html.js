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
    // Contructor //
    function userDialog() {
        // Menu Ribbon //
        
        // Lattice Tab //
        
        // Motif Tab //
        
        // Visual Tab //
        
        // PnD Tab //
        
        // Public Library Tab //
        
        // IAC //
        this.iac = {};
        this.iac.visibility = jQuery('#iacToggle');
        this.iac.symbol = jQuery('#iacSymbol');
        this.iac.radius = jQuery('#radiusLabelValue');
        this.iac.radiusLabel = jQuery('#radiusLabel');
        this.iac.doll = jQuery('#iacDoll');
        this.iac.colorPicker = jQuery('#iacColor');
        this.iac.opacity = jQuery('#iacOpacity');
        this.iac.opacitySlider = jQuery('#iacOpacitySlider');
        this.iac.notes = jQuery('#iacNotes');
        this.iac.sound = jQuery('#iacSound');
        this.iac.box = jQuery('#iacBox');
        this.iac.boxTitle = jQuery('#iacLabel h2');
        this.iac.closeButton = jQuery('#iacClose');
        // Modals //
        
        // Notes //
        
        // Other //
    };
    
    return userDialog;
});