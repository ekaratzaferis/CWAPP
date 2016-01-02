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
        this.iac.toggleVisibility = jQuery('#iacToggle');
        this.iac.atomSymbol = jQuery('#iacSymbol');
        this.iac.atomRadius = jQuery('#radiusLabelValue');
        this.iac.atomRadiusLabel = jQuery('#radiusLabel');
        this.iac.doll = jQuery('#iacDoll');
        this.iac.colorPicker = jQuery('#iacColor');
        
        
        var $opacity = jQuery('#iacOpacity');
        var $opacitySlider = jQuery('#iacOpacitySlider');
        var $notes = jQuery('#iacNotes');
        var $sound = jQuery('#iacSound');
        var $box = jQuery('#iacBox');
        var $closeButton = jQuery('#iacClose');
        var $boxTitle = jQuery('#iacLabel h2');
        // Modals //
        
        // Notes //
        
        // Other //
    };
    
    return userDialog;
});