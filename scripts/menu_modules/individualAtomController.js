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
    
    // Local Variables //
    var boxWidth = 340;
    var boxHeight = 207;
    
    // Module References //
    var $stringEditor = undefined;
    var $tooltipGenerator = undefined;
    var $setUIValue = undefined;
    var $interfaceResizer = undefined;
    
    // HTML Elements //
    var $visibility = jQuery('#iacToggle');
    var $symbol = jQuery('#iacSymbol');
    var $radius = jQuery('#radiusLabelValue');
    var $doll = jQuery('#iacDoll');
    var $color = jQuery('#iacColor');
    var $opacity = jQuery('#iacOpacity');
    var $opacitySlider = jQuery('#iacOpacitySlider');
    var $notes = jQuery('#iacNotes');
    var $sound = jQuery('#iacSound');
    var $box = jQuery('#iacBox');
    var $closeButton = jQuery('#iacClose');
    var $boxTitle = jQuery('#iacLabel h2');
    
    // Local ID //
    var $atomID = undefined;
    
    // Functions //
    function individualAtomController(argument) {
        
        // Acquire Module References //
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.interfaceResizer))) $interfaceResizer = argument.interfaceResizer;
        else return false;
        
        // Bind Event Listeners //
        $visibility.on('click',function(){
            if ($visibility.hasClass('notVisible')) $setUIValue.setValue({
                'iacVisibility':{
                    'other':$visibility,
                    'publish':{'id':$atomID,'visibility':true},
                    'value':true
                }
            });
            else $setUIValue.setValue({
                'iacVisibility':{
                    'other':$visibility,
                    'publish':{'id':$atomID,'visibility':false},
                    'value':false
                }
            });
        });
        $doll.on('click',function(){
            $setUIValue.setValue({
                'iacDoll':{
                    'publish':{'id':$atomID,'dollMode':true}
                }
            });
            $box.hide('slow');
        });
        $color.spectrum({
            color: "#ffffff",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    'iacColor':{
                        'other': $color,
                        'publish':{'id':$atomID,'color':'#'+$color.spectrum("get").toHex()},
                        'value': '#'+$color.spectrum("get").toHex()
                    }
                });
            },
            change: function(){
                $setUIValue.setValue({
                    'iacColor':{
                        'other': $color,
                        'publish':{'id':$atomID,'color':'#'+$color.spectrum("get").toHex()},
                        'value': '#'+$color.spectrum("get").toHex()
                    }
                });
            }
        });
        $opacity.on('change', function(){
            $setUIValue.setValue({
                'iacOpacity':{
                    'publish':{'id':$atomID,'opacity':$stringEditor.divide10($opacity.val())},
                    'value': $opacity.val()
                }
            });
        });
        $opacitySlider.slider({
            value: 1,
            min: 0,
            max: 10,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                $setUIValue.setValue({
                    'iacOpacity':{
                        'publish':{'id':$atomID,'opacity':$stringEditor.divide10(ui.value)}
                    }
                });
                $opacity.val(ui.value);
            }
        });
        $closeButton.on('click', function(){
            $setUIValue.setValue({
                'iacClose':{
                    'publish':{'id':$atomID,'finish':true}
                }
            });
            $box.hide('fast');
        });
        $sound.on('click',function(){
            // Change sound Source //
            $setUIValue.setValue({
                'sound':{
                    'publish':{'id':$atomID,'sound':true}
                }
            });
            // Turn system sound on //
            $setUIValue.setValue({
                'sounds':{
                    'publish':{'sounds':true},
                    'value':true
                }
            });
        });
        
        // Add tooltip //
        $tooltipGenerator.addOnHoverTooltip({'target':'iacSound','placement':'top','message':"Move sound source to atom's center"});
        
        // Highlight Buttons
        $doll.find('a').hover(function(){$doll.find('img').attr('src','Images/doll-hover.png');},function(){$doll.find('img').attr('src','Images/doll.png');});
        $notes.find('a').hover(function(){$notes.find('img').attr('src','Images/notes-icon-purple.png');},function(){$notes.find('img').attr('src','Images/notes-icon-white.png');});
        $sound.find('a').hover(function(){$sound.find('img').attr('src','Images/sound-icon-hover-purple.png');},function(){$sound.find('img').attr('src','Images/sound-icon-hover.png');});
    };
    
    // Module Interface //
    individualAtomController.prototype.showBox = function(argument){
        
        // Atom ID //
        if (_.isUndefined(argument.id)) {
            $box.hide();
            return false;
        }
        else {
            $atomID = argument.id;
            $boxTitle.html('Atom '+$atomID);
        }
        
        // Fix Element Color //
        if (_.isUndefined(argument.name)) {
            $box.hide();
            return false;
        }
        else $symbol.find('a').attr('class','ch ch-'+$stringEditor.toLowerCase(argument.name));
        
        // Fix Element Name //
        if (_.isUndefined(argument.ionicIndex)) {
            $box.hide();
            return false;
        }
        else {
            if (argument.ionicIndex !== '0') $symbol.find('a').html('<span style="font-size:15px;">'+$stringEditor.capitalizeFirstLetter(argument.name)+'<sup>'+argument.ionicIndex+'</sup></span>');
            else $symbol.find('a').html($stringEditor.capitalizeFirstLetter(argument.name));
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
            $opacity.val($stringEditor.multiply10(argument.opacity));
            $opacitySlider.slider('value',$stringEditor.multiply10(argument.opacity));
        }
        
        // Apply Atom Visibility //
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
    };
    individualAtomController.prototype.hideBox = function(){
        $atomID = undefined;
        $box.hide('slow');
    };
    individualAtomController.prototype.moveBox = function(argument){
        var xCoord = 0, yCoord = 0;
        if (!(_.isUndefined(argument.x))) xCoord = argument.x;
        else return false;
        if (!(_.isUndefined(argument.y))) yCoord = argument.y;
        else return false;
        
        var fitsCanvas = $interfaceResizer.fitsCanvas({'x':xCoord,'y':yCoord,'width':boxWidth,'height':boxHeight});
        if (fitsCanvas === true) {
            $box.css('left',xCoord);
            $box.css('top',yCoord);
        }
        else if (fitsCanvas === 'width') {
            fitsCanvas = $interfaceResizer.fitsCanvas({'x':xCoord-boxWidth,'y':yCoord,'width':boxWidth,'height':boxHeight});
            if (fitsCanvas === 'height') {
                $box.css('left',xCoord-boxWidth);
                $box.css('top',yCoord-boxHeight);
            }
            else {
                $box.css('left',xCoord-boxWidth);
                $box.css('top',yCoord);
            }
        }
        else if (fitsCanvas === 'height') { 
            $box.css('left',xCoord);
            $box.css('top',yCoord-boxHeight);
        }
        return true;
    };
    
    return individualAtomController;
});