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
    
    // Local Variables [Canvas Size] //
    var canvasHeight = 0;
    var canvasWidth = 0;
    
    // String Editor //
    var $se = undefined;
    
    // HTML Elements //
    var $visibility = jQuery('#iacToggle');
    var $symbol = jQuery('#iacSymbol');
    var $radius = jQuery('#radiusLabelValue');
    var $doll = jQuery('#iacDoll');
    var $color = jQuery('#iacColor');
    var $opacity = jQuery('#iacOpacity');
    var $opacitySlider = jQuery('#iacOpacitySlider');
    var $notes = jQuery('#iacNotes');
    var $box = jQuery('#iacBox');
    var $closeButton = jQuery('#iacClose');
    
    // Published Event //
    var $pubEvent = 'menu.atom_customization';
    var $atomID = undefined;
    
    // Contructor //
    function individualAtomController(argument) {
        
        // Acquire String Editor //
        if (!(_.isUndefined(argument.se))) $se = argument.se;
        
        // Bind Event Listeners //
        $visibility.on('click',function(){
            var argument = {};
            argument.id = $atomID;
            $visibility.hasClass('notVisible') ? $visibility.find('img').attr('src','Images/visible-icon-sm.png') : $visibility.find('img').attr('src','Images/hidden-icon-sm.png');
            $visibility.hasClass('notVisible') ? argument.visibility = true : argument.visibility = false;
            $visibility.toggleClass('notVisible');
            PubSub.publish($pubEvent, argument);
        });
        $doll.on('click',function(){
            var argument = {};
            argument.id = $atomID;
            argument.dollMode = true;
            PubSub.publish($pubEvent, argument);
        });
        $color.spectrum({
            color: "#ffffff",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                var argument = {};
                argument.id = $atomID;
                argument.color = '#'+$color.spectrum("get").toHex();
                PubSub.publish($pubEvent, argument);
                $color.children().css('background','#'+$color.spectrum("get").toHex());
            },
            change: function(){
                var argument = {};
                argument.id = $atomID;
                argument.color = $color.spectrum("get").toHex();
                $color.children().css('background','#'+$color.spectrum("get").toHex());
                PubSub.publish($pubEvent, argument);
            }
        });
        $opacity.on('change', function(){
            var argument = {};
            argument.id = $atomID;
            argument.opacity = $se.divide10($opacity.val());
            PubSub.publish($pubEvent, argument);
        });
        $opacitySlider.slider({
            value: 1,
            min: 1,
            max: 10,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                var argument = {};
                argument.id = $atomID;
                var result = true;
                argument.opacity = $se.divide10(ui.value);
                PubSub.publish($pubEvent, argument);
                $opacity.val(ui.value);
            }
        });
        $closeButton.on('click', function(){
            var argument = {};
            argument.id = $atomID;
            argument.finish = true;
            PubSub.publish($pubEvent, argument);
            $box.hide('fast');
        });
        
    };
    
    // Module Interface //
    individualAtomController.prototype.showBox = function(argument){
        
        // Atom ID //
        if (_.isUndefined(argument.id)) {
            $box.hide();
            return false;
        }
        else $atomID = argument.id;
        
        // Fix Element Symbol //
        if (_.isUndefined(argument.name)) {
            $box.hide();
            return false;
        }
        else $symbol.find('a').attr('class','ch ch-'+argument.name);
        
        if (_.isUndefined(argument.ionicIndex)) {
            $box.hide();
            return false;
        }
        else {
            if (argument.ionicIndex !== '0') $symbol.find('a').html('<span style="font-size:15px;">'+$se.capitalizeFirstLetter(argument.name)+'<sup>'+argument.ionicIndex+'</sup></span>');
            else $symbol.find('a').html($se.capitalizeFirstLetter(argument.name));
        }
        
        // Insert Atom Radius //
        if (_.isUndefined(argument.radius)) {
            $box.hide();
            return false;
        }
        else $radius.html(argument.radius+ ' &Aring;');
        
        // Initialize Atom Color //
        if (_.isUndefined(argument.color)) {
            $box.hide();
            return false;
        }
        else {
            $color.spectrum('set',argument.color);
            $color.children().css('background','#'+$color.spectrum("get").toHex());
        }
        
        // Initialize Atom Opacity //
        if (_.isUndefined(argument.opacity)) {
            $box.hide();
            return false;
        }
        else {
            $opacity.val($se.multiply10(argument.opacity));
            $opacitySlider.slider('value',$se.multiply10(argument.opacity));
        }
        
        // Initialize Atom Opacity //
        if (_.isUndefined(argument.visibility)) {
            $box.hide();
            return false;
        }
        else {
            if ((argument.visibility === true) && ($visibility.hasClass('notVisible'))) $visibility.trigger('click');
            else if ((argument.visibility === false) && (!($visibility.hasClass('notVisible')))) $visibility.trigger('click');
        }
        
        $box.show('slow');
        return true;
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