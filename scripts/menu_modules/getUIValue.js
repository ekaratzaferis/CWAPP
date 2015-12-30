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
            case 'planeVisibility':{
                if (jQuery('#planesTable').find('#'+selector).find('.planeButton').hasClass('visible')) return true;
                else return false;
            }
            case 'parallel':{
                if (jQuery('#planesTable').find('#'+selector).find('.parallel').hasClass('active')) return true;
                else return false;
            }
            case 'interception':{
                if (jQuery('#planesTable').find('#'+selector).find('.interception').hasClass('active')) return true;
                else return false;
            }
        };
    };
    function retrieveValueFromID(index){
        switch(index){
            
            case 'activeTab':{
                if (jQuery('#latticeTab').hasClass('active')) return 'latticeTab';
                else if (jQuery('#motifLI').hasClass('active')) return 'motifTab';
                else if (jQuery('#visualTab').hasClass('active')) return 'visualTab';
                else if (jQuery('#millerPI').hasClass('active')) return 'pndTab';
                else if (jQuery('#notesTab').hasClass('active')) return 'notesTab';
                else if (jQuery('#publicTab').hasClass('active')) return 'publicTab';
            }
            case 'tabDisable':{
                var result = {};
                if (jQuery('#latticeTab').hasClass('disabled')) result.latticeTab = true;
                else result.latticeTab = false;
                if (jQuery('#motifLI').hasClass('disabled')) result.motifTab = true;
                else result.motifTab = false;
                if (jQuery('#visualTab').hasClass('disabled')) result.visualTab = true;
                else result.visualTab = false;
                if (jQuery('#millerPI').hasClass('disabled')) result.pndTab = true;
                else result.pndTab = false;
                if (jQuery('#notesTab').hasClass('disabled')) result.notesTab = true;
                else result.notesTab = false;
                if (jQuery('#publicTab').hasClass('disabled')) result.publicTab = true;
                else result.publicTab = false;
                return result;
            }
            case 'toggleButtons':{
                var result = {};
                if (jQuery('#latticePoints').parent().hasClass('lightThemeActive')) result.latticePoints = true;
                else result.latticePoints = false;
                if (jQuery('#edges').parent().hasClass('lightThemeActive')) result.edges = true;
                else result.edges = false;
                if (jQuery('#faces').parent().hasClass('lightThemeActive')) result.faces = true;
                else result.faces = false;
                if (jQuery('#xyzAxes').parent().hasClass('lightThemeActive')) result.xyzAxes = true;
                else result.xyzAxes = false;
                if (jQuery('#abcAxes').parent().hasClass('lightThemeActive')) result.abcAxes = true;
                else result.abcAxes = false;
                if (jQuery('#unitCellViewport').parent().hasClass('lightThemeActive')) result.unitCellViewport = true;
                else result.unitCellViewport = false;
                if (jQuery('#planes').parent().hasClass('lightThemeActive')) result.planes = true;
                else result.planes = false;
                if (jQuery('#directions').parent().hasClass('lightThemeActive')) result.directions = true;
                else result.directions = false;
                if (jQuery('#atomRadius').parent().hasClass('lightThemeActive')) result.atomRadius = true;
                else result.atomRadius = false;
                if (jQuery('#atomToggle').parent().hasClass('lightThemeActive')) result.atomToggle = true;
                else result.atomToggle = false;
                if (jQuery('#labelToggle').parent().hasClass('lightThemeActive')) result.labelToggle = true;
                else result.labelToggle = false;
                if (jQuery('#highlightTangency').parent().hasClass('lightThemeActive')) result.highlightTangency = true;
                else result.highlightTangency = false;
                
                result.atomRadiusSlider = jQuery('#atomRadiusSlider').slider('value');
                return result;
            }
                
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
            case 'motifLabels':{
                var result = {};
                result.a = jQuery('#meLengthA').html();
                result.b = jQuery('#meLengthB').html();
                result.c = jQuery('#meLengthC').html();
                result.alpha = jQuery('#meAngleA').html();
                result.beta = jQuery('#meAngleB').html();
                result.gamma = jQuery('#meAngleG').html();
                return result;
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
            case 'selectedLattice':{
                return jQuery('#selected_lattice').html();
            }
            case 'latticePadlockDisable':{
                if (jQuery('#latticePadlock').hasClass('disabled')) return true;
                else return false;
            }
            case 'latticePadlock':{
                if (jQuery('#latticePadlock').children().hasClass('active')) return true;
                else return false;
            }
            case 'borderColor':{
                return '#'+jQuery('#cube_color_border').spectrum('get').toHex();
            }
            case 'filledColor':{
                return '#'+jQuery('#cube_color_filled').spectrum('get').toHex();
            }
            case 'radius':{
                return $stringEditor.inputIsInteger(jQuery('#radius').val());
            }
            case 'opacity':{
                return $stringEditor.inputIsInteger(jQuery('#faceOpacity').val());
            }
                
            // PnD Tab
            case 'planeColor':{
                return '#'+jQuery('#planeColor').spectrum('get').toHex();
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
                return $stringEditor.divide10(jQuery('#dirRadius').val()).toString();
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
            case 'motifPadlockDisable':{
                if (jQuery('#motifPadlock').hasClass('disabled')) return true;
                else return false;
            }
            case 'motifPadlock':{
                if (jQuery('#motifPadlock').children().hasClass('active')) return true;
                else return false;
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
            case 'ssao':{
                if (jQuery('#ssao').hasClass('active')) return true;
                else return false;
            }
            case 'shadows':{
                if (jQuery('#shadows').hasClass('active')) return true;
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
            case 'sideBySide3D':{
                if (jQuery('#3DsideBySide').hasClass('active')) return true;
                else return false;
            }
            case 'onTop3D':{
                if (jQuery('#3DonTop').hasClass('active')) return true;
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
            case 'autoZoom':{
                if (jQuery('#autoZoom').hasClass('active')) return true;
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
            case 'soundVolume':{
                return jQuery('#soundSlider').slider('value');   
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
    
    getUIValue.prototype.getAppState = function(){
        var app = {};
        
        // Retrieve Menu Ribbon Values //
        app.activeTab = retrieveValueFromID('activeTab');
        app.tabDisable = retrieveValueFromID('tabDisable');
        app.toggleButtons = retrieveValueFromID('toggleButtons');
        
        // Retrieve Lattice Tab Values //
        app.selectedLattice = retrieveValueFromID('selectedLattice');
        app.latticePadlockDisable = retrieveValueFromID('latticePadlockDisable');
        app.latticePadlock = retrieveValueFromID('latticePadlock');
        app.repeatX = retrieveValueFromID('repeatX');
        app.repeatY = retrieveValueFromID('repeatY');
        app.repeatZ = retrieveValueFromID('repeatZ');
        app.motifPadlockDisable = retrieveValueFromID('motifPadlockDisable');
        app.motifPadlock = retrieveValueFromID('motifPadlock');
        app.scaleX = retrieveValueFromID('scaleX');
        app.scaleY = retrieveValueFromID('scaleY');
        app.scaleZ = retrieveValueFromID('scaleZ');
        app.alpha = retrieveValueFromID('alpha');
        app.beta = retrieveValueFromID('beta');
        app.gamma = retrieveValueFromID('gamma');
        app.borderColor = retrieveValueFromID('borderColor');
        app.filledColor = retrieveValueFromID('filledColor');
        app.radius = retrieveValueFromID('radius');
        app.opacity = retrieveValueFromID('opacity');
        
        // Retrieve Motif Tab Values //
        app.tangency = retrieveValueFromID('tangency');
        app.cellVolume = retrieveValueFromID('cellVolume');
        app.motifLabels = retrieveValueFromID('motifLabels');
        
        // Retrieve Visual Tab Values //
        app.wireframe = retrieveValueFromID('wireframe');
        app.toon = retrieveValueFromID('toon');
        app.flat = retrieveValueFromID('flat');
        app.realistic = retrieveValueFromID('realistic');
        app.lights = retrieveValueFromID('lights');
        app.ssao = retrieveValueFromID('ssao');
        app.shadows = retrieveValueFromID('shadows');
        app.distortionOn = retrieveValueFromID('distortionOn');
        app.distortionOff = retrieveValueFromID('distortionOff');
        app.anaglyph = retrieveValueFromID('anaglyph');
        app.oculus = retrieveValueFromID('oculus');
        app.sideBySide3D = retrieveValueFromID('sideBySide3D');
        app.onTop3D = retrieveValueFromID('onTop3D');
        app.crystalCamTargetOn = retrieveValueFromID('crystalCamTargetOn');
        app.crystalCamTargetOff = retrieveValueFromID('crystalCamTargetOff');
        app.fullScreen = retrieveValueFromID('fullScreen');
        app.leapMotion = retrieveValueFromID('leapMotion');
        app.crystalClassic = retrieveValueFromID('crystalClassic');
        app.crystalSubstracted = retrieveValueFromID('crystalSubstracted');
        app.crystalSolidVoid = retrieveValueFromID('crystalSolidVoid');
        app.crystalGradeLimited = retrieveValueFromID('crystalGradeLimited');
        app.cellClassic = retrieveValueFromID('cellClassic');
        app.cellSubstracted = retrieveValueFromID('cellSubstracted');
        app.cellSolidVoid = retrieveValueFromID('cellSolidVoid');
        app.cellGradeLimited = retrieveValueFromID('cellGradeLimited');
        app.autoZoom = retrieveValueFromID('autoZoom');
        app.zoom100 = retrieveValueFromID('zoom100');
        app.zoom90 = retrieveValueFromID('zoom90');
        app.zoom80 = retrieveValueFromID('zoom80');
        app.zoom70 = retrieveValueFromID('zoom70');
        app.fog = retrieveValueFromID('fog');
        app.fogColor = retrieveValueFromID('fogColor');
        app.fogDensity = retrieveValueFromID('fogDensity');
        app.sounds = retrieveValueFromID('sounds');
        app.soundVolume = retrieveValueFromID('soundVolume');
        app.crystalScreenColor = retrieveValueFromID('crystalScreenColor');
        app.cellScreenColor = retrieveValueFromID('cellScreenColor');
        app.motifXScreenColor = retrieveValueFromID('motifXScreenColor');
        app.motifYScreenColor = retrieveValueFromID('motifYScreenColor');
        app.motifZScreenColor = retrieveValueFromID('motifZScreenColor');
        
        return app;
    };
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