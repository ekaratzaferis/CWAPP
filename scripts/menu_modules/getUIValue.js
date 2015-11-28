/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'pubsub',
    'underscore',
    'icheck',
    'jColor'
], function(
    jQuery,
    jQuery_ui,
    PubSub, 
    _,
    icheck,
    jColor
) 
{    
    
    // Variables //
    var $selector = undefined;
    
    // Modules References //
    var $stringEditor = undefined;
    
    // Contructor //
    function getUIValue(argument) {
        // Acquire Module References //
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
    };
    
    function retrieveValue(index,selector){
        switch(index){
            
        };
    };
    function retrieveValueFromID(index){
        switch(index){
            
            // Motif Tab
            case 'tangency':{
                if (jQuery('#tangency').parent().hasClass('purpleThemeActive')) return true;
                else return false;
            }
            case 'atomOpacity':{
                return $stringEditor.inputIsNumber(jQuery('#atomOpacity').val());
            }
            case 'atomColor':{
                return jQuery('#atomColor').spectrum('get').toHex();
            }
            case 'atomPosX':{
                return $stringEditor.inputIsNumber(jQuery('#atomPosX').val());
            }
            case 'atomPosY':{
                return $stringEditor.inputIsNumber(jQuery('#atomPosY').val());
            }
            case 'atomPosZ':{
                return $stringEditor.inputIsNumber(jQuery('#atomPosZ').val());
            }
            case 'rotAngleTheta':{
                return jQuery('#rotAngleTheta').val();
            }
            case 'rotAnglePhi':{
                return jQuery('#rotAnglePhi').val();
            }
            case 'tangentR':{
                return jQuery('#tangentR').val();
            }
            case 'rotAngleX':{
                return jQuery('#rotAngleX').text();
            }
            case 'rotAngleY':{
                return jQuery('#rotAngleY').text();
            }
            case 'rotAngleZ':{
                return jQuery('#rotAngleZ').text();
            }
            case 'cellVolume':{
                return $stringEditor.inputIsNumber(jQuery('#cellVolume').val());  
            }
            case 'atomPositioningABC':{
                if (jQuery('#atomPositioningABC').hasClass('buttonPressed')) return true;
                else return false;
            }
            case 'atomPositioningXYZ':{
                if (jQuery('#atomPositioningXYZ').hasClass('buttonPressed')) return true;
                else return false;
            }
            case 'atomName':{
                return jQuery('.element-symbol-container').find('a').html();
            }
                
            // Lattice Tab
            case 'repeatX':{
                return $stringEditor.inputIsInteger(jQuery('#repeatX').val());
            }
            case 'repeatY':{
                return $stringEditor.inputIsInteger(jQuery('#repeatY').val());
            }
            case 'repeatZ':{
                return $stringEditor.inputIsInteger(jQuery('#repeatZ').val());
            }
            case 'scaleX':{
                return $stringEditor.inputIsNumber(jQuery('#scaleX').val());
            }
            case 'scaleY':{
                return $stringEditor.inputIsNumber(jQuery('#scaleY').val());
            }
            case 'scaleZ':{
                return $stringEditor.inputIsNumber(jQuery('#scaleZ').val());
            }
            case 'alpha':{
                return $stringEditor.inputIsNumber(jQuery('#alpha').val());
            }
            case 'beta':{
                return $stringEditor.inputIsNumber(jQuery('#beta').val());
            }
            case 'gamma':{
                return $stringEditor.inputIsNumber(jQuery('#gamma').val());
            }
                
            // PnD Tab
            case 'planeColor':{
                return jQuery('#planeColor').spectrum('get').toHex();
            }
            case 'planeName':{
                return jQuery('#planeName').val();
            }
            case 'planeOpacity':{
                return $stringEditor.inputIsNumber(jQuery('#planeOpacity').val());
            }
            case 'millerH':{
                return $stringEditor.inputIsInteger(jQuery('#millerH').val());
            }
            case 'millerK':{
                return $stringEditor.inputIsInteger(jQuery('#millerK').val());
            }
            case 'millerL':{
                return $stringEditor.inputIsInteger(jQuery('#millerL').val());
            }
            case 'millerI':{
                return $stringEditor.inputIsInteger(jQuery('#millerI').val());
            }
            case 'directionColor':{
                return jQuery('#directionColor').spectrum('get').toHex();
            }
            case 'directionName':{
                return jQuery('#directionName').val();
            }
            case 'dirRadius':{
                return $stringEditor.divide10(jQuery('#dirRadius').val());
            }
            case 'millerU':{
                return $stringEditor.inputIsInteger(jQuery('#millerU').val());
            }
            case 'millerV':{
                return $stringEditor.inputIsInteger(jQuery('#millerV').val());
            }
            case 'millerW':{
                return $stringEditor.inputIsInteger(jQuery('#millerW').val());
            }
            case 'millerT':{
                return $stringEditor.inputIsInteger(jQuery('#millerT').val());
            }
            
            // Visual Tab
            case 'wireframe':{
                if (jQuery('#wireframe').hasClass('active')) return true;
                else return false;
            }
            case 'toon':{
                if (jQuery('#toon').hasClass('active')) return true;
                else return false;
            }
            case 'flat':{
                if (jQuery('#flat').hasClass('active')) return true;
                else return false;
            }
            case 'realistic':{
                if (jQuery('#realistic').hasClass('active')) return true;
                else return false;
            }
            case 'lights':{
                if (jQuery('#lights').hasClass('active')) return true;
                else return false;
            }
            case 'distortionOn':{
                if (jQuery('#distortionOn').hasClass('active')) return true;
                else return false;
            }
            case 'distortionOff':{
                if (jQuery('#distortionOff').hasClass('active')) return true;
                else return false;
            }
            case 'anaglyph':{
                if (jQuery('#anaglyph').hasClass('active')) return true;
                else return false;
            }
            case 'oculus':{
                if (jQuery('#oculus').hasClass('active')) return true;
                else return false;
            }
            case '3D':{
                if (jQuery('#3D').hasClass('active')) return true;
                else return false;
            }
            case 'crystalCamTargetOn':{
                if (jQuery('#crystalCamTargetOn').hasClass('active')) return true;
                else return false;
            }
            case 'crystalCamTargetOff':{
                if (jQuery('#crystalCamTargetOff').hasClass('active')) return true;
                else return false;
            }
            case 'fullScreen':{
                if (jQuery('#fullScreen').hasClass('active')) return true;
                else return false;
            }
            case 'leapMotion':{
                if (jQuery('#leapMotion').hasClass('active')) return true;
                else return false;
            }
            case 'crystalClassic':{
                if (jQuery('#crystalClassic').hasClass('active')) return true;
                else return false;
            }
            case 'crystalSubstracted':{
                if (jQuery('#crystalSubstracted').hasClass('active')) return true;
                else return false;
            }
            case 'crystalSolidVoid':{
                if (jQuery('#crystalSolidVoid').hasClass('active')) return true;
                else return false;
            }
            case 'crystalGradeLimited':{
                if (jQuery('#crystalGradeLimited').hasClass('active')) return true;
                else return false;
            }
            case 'cellClassic':{
                if (jQuery('#cellClassic').hasClass('active')) return true;
                else return false;
            }
            case 'cellSubstracted':{
                if (jQuery('#cellSubstracted').hasClass('active')) return true;
                else return false;
            }
            case 'cellSolidVoid':{
                if (jQuery('#cellSolidVoid').hasClass('active')) return true;
                else return false;
            }
            case 'cellGradeLimited':{
                if (jQuery('#cellGradeLimited').hasClass('active')) return true;
                else return false;
            }
            case 'zoom100':{
                if (jQuery('#zoom100').hasClass('active')) return true;
                else return false;
            }
            case 'zoom90':{
                if (jQuery('#zoom90').hasClass('active')) return true;
                else return false;
            }
            case 'zoom80':{
                if (jQuery('#zoom80').hasClass('active')) return true;
                else return false;
            }
            case 'zoom70':{
                if (jQuery('#zoom70').hasClass('active')) return true;
                else return false;
            }
            case 'fog':{
                if (jQuery('[name="fog"]').hasClass('active')) return true;
                else return false;
            }
            case 'fogColor':{
                return '#'+jQuery('#fogColor').spectrum('get').toHex();
            }
            case 'fogDensity':{
                return jQuery('#fogDensity').val();   
            }
            case 'sounds':{
                if (jQuery('#sounds').hasClass('active')) return true;
                else return false;
            } 
            case 'crystalScreenColor':{
                return '#'+jQuery('#crystalScreenColor').spectrum('get').toHex();
            }
            case 'cellScreenColor':{
                return '#'+jQuery('#cellScreenColor').spectrum('get').toHex();
            }
            case 'motifXScreenColor':{
                return '#'+jQuery('#motifXScreenColor').spectrum('get').toHex();
            }
            case 'motifYScreenColor':{
                return '#'+jQuery('#motifYScreenColor').spectrum('get').toHex();
            }
            case 'motifZScreenColor':{
                return '#'+jQuery('#motifZScreenColor').spectrum('get').toHex();
            }
                
        };
    }
    
    getUIValue.prototype.getValue = function(argument){
        var returnObject = {};
        if (Object.keys(argument).length <= 0) return false;
        else {
            _.each(argument,function($parameter, k){
                
                // Retrieve value
                if (!(_.isUndefined($parameter.selector))) returnObject[k] = retrieveValue($parameter.id,$parameter.selector);
                else returnObject[k] = retrieveValueFromID($parameter.id);
                
            });
        }
        return returnObject;
    };
    
    return getUIValue;
});