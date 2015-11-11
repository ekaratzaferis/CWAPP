/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'jquery.matchHeight',
    'bootstrap',
    'bootstrap-select',
    'jColor'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    matchHeight,
    bootstrap,
    bootstrapSelect,
    jColor
) 
{
    
    // Local Variables [Atom Information] //
    var atomName = undefined;
    var atomRadius = undefined;
    var atomID = undefined;
    var atomColor = undefined;
    var atomOpacity = undefined;
    var atomVisibility = undefined;
    
    // Local Variables [Canvas Size] //
    var canvasHeight = 0;
    var canvasWidth = 0;
    
    // HTML Elements //
    var $visibility = jQuery('#iacToggle');
    var $symbol = jQuery('#iacSymbol');
    var $radius = jQuery('#radiusLabelValue');
    var $doll = jQuery('#iacDoll');
    var $color = jQuery('#iacColor');
    var $opacity = jQuery('#iacOpacity');
    var $notes = jQuery('#iacNotes');
    var $box = jQuery('#iacBox');
    
    // Contructor //
    function individualAtomController(argument) {
        
    };
    
    
    // Module Interface //
    individualAtomController.prototype.showBox = function(argument){
        $box.show('slow');
    }
    individualAtomController.prototype.hideBox = function(){
        $box.hide('slow');
    }
    individualAtomController.prototype.moveBox = function(argument){
        
    }
    individualAtomController.prototype.resize = function(argument){
        
    }
    
    return individualAtomController;
});