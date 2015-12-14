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
    // Variables //
    var value = undefined;
    var localRestrictions = undefined;
    var restrictionList = {};
    var collisions = {};
    var collisionTooltip = false;
    var collisionRange = {
        scaleX: 0.5,
        scaleY: 0.5,
        scaleZ: 0.5,
        alpha: 3,
        beta: 3,
        gamma: 3
    };
    
    // Grouping //
    var conditions = {
        autoRefresh: false,
        atomAdded: false
    }
    var LastLatticeParameters = [];
    var lengthSlider = ['scaleX','scaleY','scaleZ'];
    var angleSliders = ['alpha','beta','gamma'];
    var latticeParameters = {
        repeatX: jQuery('#repeatX'),
        repeatY: jQuery('#repeatY'),
        repeatZ: jQuery('#repeatZ'),
        scaleX: jQuery('#scaleX'),
        scaleY: jQuery('#scaleY'),
        scaleZ: jQuery('#scaleZ'),
        alpha: jQuery('#alpha'),
        beta: jQuery('#beta'),
        gamma: jQuery('#gamma')
    };
    var latticeLabels = {
        'scaleX' : jQuery('#meLengthA'),
        'scaleY' : jQuery('#meLengthB'),
        'scaleZ' : jQuery('#meLengthC'),
        'alpha' : jQuery('#meAngleA'),
        'beta' : jQuery('#meAngleB'),
        'gamma' : jQuery('#meAngleG')
    };
    
    // Module References //
    var $messages = undefined;
    var $setUIValue = undefined;
    var $stringEditor = undefined;
    var $disableUIElement = undefined;
    var $userDialog = undefined;
    var $tooltipGenerator = undefined;
    
    // Selectors //
    var $latticePadlock = jQuery('#latticePadlock');
    var $motifPadlock = jQuery('#motifPadlock');
    var $tangency = jQuery('#tangency');
    var $autoRefresh = jQuery('.autoRefresh');
    var $icheck = jQuery('input.icheckbox, input.iradio');
    var $colorBorder = jQuery('#cube_color_border');
    var $colorFilled = jQuery('#cube_color_filled');
    var $radiusSlider = jQuery('#radiusSlider');
    var $faceOpacitySlider = jQuery('#faceOpacitySlider');
    var $spinner = jQuery('.spinner');
    var $radius = jQuery('#radius');
    var $faceOpacity = jQuery('#faceOpacity');
    
    // Contructor //
    function latticeTab(argument) {
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.userDialog))) $userDialog = argument.userDialog;
        else return false;
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        
        // Inputs //
        jQuery($icheck).iCheck({
            checkboxClass: 'icheckbox_square-grey',
            radioClass: 'iradio_square-grey'
        });
        $icheck.on('ifChecked',function(){
            var name = jQuery(this).attr('name');
            var argument = {};
            var publish = {};
            var value = {};
            value.value = true;
            publish[name] = true;
            value.publish = publish;
            argument[name] = value;
            $setUIValue.setValue(argument);
        });
        $icheck.on('ifUnchecked',function(){
            var name = jQuery(this).attr('name');
            var argument = {};
            var publish = {};
            var value = {};
            value.value = false;
            publish[name] = false;
            value.publish = publish;
            argument[name] = value;
            $setUIValue.setValue(argument);
        });
        $colorBorder.spectrum({
            color: "#A19EA1",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    cylinderColor:{
                        other: $colorBorder,
                        value: $colorBorder.spectrum('get').toHex(),
                        publish: { cylinderColor: $colorBorder.spectrum('get').toHex() }
                    }
                });
            },
            change: function(){
                $setUIValue.setValue({
                    cylinderColor:{
                        other: $colorBorder,
                        value: $colorBorder.spectrum('get').toHex(),
                        publish: { cylinderColor: $colorBorder.spectrum('get').toHex() }
                    }
                });
            }
        });
        $colorBorder.children().css('background','#A19EA1');
        $colorFilled.spectrum({
            color: "#907190",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    faceColor:{
                        other: $colorFilled,
                        value: $colorFilled.spectrum('get').toHex(),
                        publish: { faceColor: $colorFilled.spectrum('get').toHex() }
                    }
                });
            },
            change: function(){
                $setUIValue.setValue({
                    faceColor:{
                        other: $colorFilled,
                        value: $colorFilled.spectrum('get').toHex(),
                        publish: { faceColor: $colorFilled.spectrum('get').toHex() }
                    }
                });
            }
        });
        $colorFilled.children().css('background','#907190');
        $spinner.spinner({
            min: 1,
            spin: function(event,ui){
                var name = jQuery(this).attr('id');
                var argument = {};
                var value = {};
                value.value = ui.value;
                var publish = {};
                publish[name] = ui.value;
                value.publish = publish;
                argument[name] = value;
                $setUIValue.setValue(argument);
            }
        });
        _.each(latticeParameters, function($parameter, k) {
            LastLatticeParameters[k] = 1;
            // Spinner Inputs //
            if ((k === 'repeatX')||(k === 'repeatY')||(k === 'repeatZ')){
                $parameter.val(1);
                $parameter.on('change',function(){
                    var argument = {};
                    var sendValue = {};
                    var publish = {};
                    publish[k] = $parameter.val();
                    sendValue.publish = publish;
                    sendValue.value = $parameter.val();
                    argument[k] = sendValue;
                    $setUIValue.setValue(argument);
                });
            }
            else{
                
                // Initiate Inputs //
                if ((k === 'scaleX')||(k === 'scaleY')||(k === 'scaleZ')){
                    $parameter.val(1.000);
                    LastLatticeParameters[k] = 1;
                }
                else{
                    $parameter.val(90.000);
                    LastLatticeParameters[k] = 90;
                }
                
                // Handlers
                $parameter.on('change', function() {
                    var argument = {};
                    if ($stringEditor.inputIsNumber($parameter.val()) !== false) {
                        argument[k] = $stringEditor.inputIsNumber($parameter.val());
                        var restrictionsMet = applyRestrictions(k,argument[k],false);
                        if ( restrictionsMet === 'success' ) $parameter.trigger('success', [argument[k]]);
                    }
                    else {
                        $parameter.val(LastLatticeParameters[k]);
                        $tooltipGenerator.showTooltip({
                            'target': k,
                            'placement': 'top',
                            'message': $messages.getMessage(20)
                        });
                    }
                });      
                $parameter.on('reflect',function(event, value) {
                    $parameter.val(value);
                    $parameter.trigger('success',[value]);
                });
                $parameter.on('success',function(event, value) {
                    
                    var argument = {};
                    var publish = {};
                    publish[k] = value;
                    if (conditions.atomAdded === false) {
                        argument[k] = {
                            value: value,
                            publish: publish   
                        };
                    }
                    else {
                        argument[k+'Motif'] = {
                            other: $parameter,
                            value: value,
                            publish: publish   
                        };
                    }
                    $setUIValue.setValue(argument);
                    
                    // Auto Refresh //
                    if (conditions.autoRefresh === true){
                        $setUIValue.setValue({
                            motifRefresh:{
                                publish: { empty: 0 }   
                            }
                        });
                    }
                    LastLatticeParameters[k] = value;
                });
                $parameter.on('fail',function(event, value) {
                    $parameter.val(value);
                    LastLatticeParameters[k] = value;
                    jQuery('#'+k+'Slider').slider('value',value);
                });
                $parameter.on('undo',function(event, value) {
                    $parameter.trigger('fail',[value]);
                });
            }
        });
        _.each(lengthSlider, function(name) {
            LastLatticeParameters[name] = 1;
            jQuery('#'+name+'Slider').on('fail', function(event, value){
                var argument = {};
                var sendValue = {};
                var publish = {};
                
                // Pick different event is sliders are being used by Motif //
                publish[name] = value;
                sendValue.publish = publish;
                sendValue.value = value;
                if (conditions.atomAdded === false) argument[name] = sendValue;
                else argument[name+'Motif'] = sendValue;
                $setUIValue.setValue(argument);
                
                // Update latest value //
                LastLatticeParameters[name] = value;
                jQuery('#'+name).val(value);
            });
            jQuery('#'+name+'Slider').on('undo', function(event, value){
                jQuery('#'+name+'Slider').trigger('fail',[value]);
            });
            jQuery('#'+name+'Slider').on('reflect', function(event, value){
                var argument = {};
                var sendValue = {};
                var publish = {};
                
                // Pick different event is sliders are being used by Motif //
                publish[name] = value;
                sendValue.publish = publish;
                sendValue.value = value;
                if (conditions.atomAdded === false) argument[name] = sendValue;
                else argument[name+'Motif'] = sendValue;
                $setUIValue.setValue(argument);
                
                // Update latest value //
                LastLatticeParameters[name] = value;
                jQuery('#'+name).val(value);
            });
            jQuery('#'+name+'Slider').slider({
                value: 1,
                min: 1,
                max: 20,
                step: 0.01,
                animate: true,
                slide: function(event, ui){
                    var argument = {};
                    var value = {};
                    var publish = {};
                    
                    // Pass Collistion Detection //
                    if (!(_.isUndefined(collisions[name]))){
                        if (collision(ui.value,collisions[name],collisionRange[name]) === true){
                            if (collisionTooltip === false){
                                $tooltipGenerator.addStaticTooltip({
                                    'target': name+'Slider',
                                    'placement': 'top',
                                    'message': $messages.getMessage(24)
                                });
                                collisionTooltip = true;
                                // Publish only once //
                                _.each(latticeParameters, function($parameter,k){
                                    if (k === name) {
                                        applyRestrictions(k+'Slider',collisions[name].toString(),true);
                                        publish[name] = collisions[name];
                                    }
                                });
                                value.publish = publish;
                                value.other = jQuery('#name');
                                if (conditions.atomAdded === false) argument[name] = value;
                                else argument[name+'Motif'] = value;
                                $setUIValue.setValue(argument);
                            }
                            jQuery('#'+name).val(collisions[name]);
                            jQuery('#'+name+'Slider').slider('value',collisions[name]);
                            return false; 
                        } 
                    }
                    
                    // Pass Restrictions //
                    _.each(latticeParameters, function($parameter,k){
                        if (k === name) {
                            applyRestrictions(k+'Slider',ui.value.toString(),true);
                            publish[name] = ui.value;
                        }
                    });
                    value.publish = publish;
                    value.other = jQuery('#name');
                    if (conditions.atomAdded === false) argument[name] = value;
                    else argument[name+'Motif'] = value;
                    $setUIValue.setValue(argument);
                    collisionTooltip = false;
                    jQuery('#'+name+'Slider').tooltip('destroy');
                    jQuery('#'+name).val(ui.value);
                },
                stop: function(event,ui){
                    if (conditions.autoRefresh === true){
                        $setUIValue.setValue({
                            motifRefresh:{
                                publish: { empty: 0 }   
                            }
                        });
                    }
                    jQuery('#'+name+'Slider').tooltip('destroy');
                    collisionTooltip = false;
                }
            });
        });
        _.each(angleSliders, function(name) {
            LastLatticeParameters[name] = 1;
            jQuery('#'+name+'Slider').on('fail', function(event, value){
                var argument = {};
                var sendValue = {};
                var publish = {};
                
                // Pick different event is sliders are being used by Motif //
                publish[name] = value;
                sendValue.publish = publish;
                sendValue.value = value;
                if (conditions.atomAdded === false) argument[name] = sendValue;
                else argument[name+'Motif'] = sendValue;
                $setUIValue.setValue(argument);
                
                // Update latest value //
                LastLatticeParameters[name] = value;
                jQuery('#'+name).val(value);
            });
            jQuery('#'+name+'Slider').on('undo', function(event, value){
                jQuery('#'+name+'Slider').trigger('fail',[value]);
            });
            jQuery('#'+name+'Slider').on('reflect', function(event, value){
                var argument = {};
                var sendValue = {};
                var publish = {};
                
                // Pick different event is sliders are being used by Motif //
                publish[name] = value;
                sendValue.publish = publish;
                sendValue.value = value;
                if (conditions.atomAdded === false) argument[name] = sendValue;
                else argument[name+'Motif'] = sendValue;
                $setUIValue.setValue(argument);
                
                // Update latest value //
                LastLatticeParameters[name] = value;
                jQuery('#'+name).val(value);
            });
            jQuery('#'+name+'Slider').slider({
                value: 90,
                min: 1,
                max: 180,
                step: 1,
                animate: true,
                slide: function(event, ui){
                    var argument = {};
                    var value = {};
                    var publish = {};
                    
                    // Pass Collistion Detection //
                    if (!(_.isUndefined(collisions[name]))){
                        if (collision(ui.value,collisions[name],collisionRange[name]) === true){
                            if (collisionTooltip === false){
                                $tooltipGenerator.addStaticTooltip({
                                    'target': name+'Slider',
                                    'placement': 'top',
                                    'message': $messages.getMessage(24)
                                });
                                collisionTooltip = true;
                                // Publish only once //
                                _.each(latticeParameters, function($parameter,k){
                                    if (k === name) {
                                        applyRestrictions(k+'Slider',collisions[name].toString(),true);
                                        publish[name] = collisions[name];
                                    }
                                });
                                value.publish = publish;
                                value.other = jQuery('#name');
                                if (conditions.atomAdded === false) argument[name] = value;
                                else argument[name+'Motif'] = value;
                                $setUIValue.setValue(argument);
                            }
                            jQuery('#'+name).val(collisions[name]);
                            jQuery('#'+name+'Slider').slider('value',collisions[name]);
                            return false; 
                        } 
                    }
                    
                    // Pass Restrictions //
                    _.each(latticeParameters, function($parameter,k){
                        if (k === name) {
                            applyRestrictions(k+'Slider',ui.value.toString(),true);
                            publish[name] = ui.value;
                        }
                    });
                    value.publish = publish;
                    value.other = jQuery('#name');
                    if (conditions.atomAdded === false) argument[name] = value;
                    else argument[name+'Motif'] = value;
                    $setUIValue.setValue(argument);
                    collisionTooltip = false;
                    jQuery('#'+name+'Slider').tooltip('destroy');
                    jQuery('#'+name).val(ui.value);
                    
                },
                stop: function(event,ui){
                    if (conditions.autoRefresh === true){
                        $setUIValue.setValue({
                            motifRefresh:{
                                publish: { empty: 0 }   
                            }
                        });
                    }
                    jQuery('#'+name+'Slider').tooltip('destroy');
                    collisionTooltip = false;
                }
            });
        });
        $radius.val(2);
        $radius.on('change', function() {
            $setUIValue.setValue({
                radius:{
                    publish:{radius:$radius.val()},
                    value: $radius.val()
                }
            });
        });
        $faceOpacity.val(3);
        $faceOpacity.on('change', function() {
            $setUIValue.setValue({
                faceOpacity:{
                    publish:{radius:$faceOpacity.val()},
                    value: $faceOpacity.val()
                }
            });
        });
        $radiusSlider.slider({
            value: 2,
            min: 1,
            max: 10,
            step: 1,
            animate: true,
            slide: function(event, ui){
                $setUIValue.setValue({
                    radius:{
                        publish:{radius:ui.value}
                    }
                });
                $radius.val(ui.value);
            }
        });
        $faceOpacitySlider.slider({
            value: 3,
            min: 1,
            max: 10,
            step: 1,
            animate: true,
            slide: function(event, ui){
                $setUIValue.setValue({
                    faceOpacity:{
                        publish:{faceOpacity:ui.value}
                    }
                });
                $faceOpacity.val(ui.value);
            }
        });
        
        // Buttons //
        $disableUIElement.disableElement({
            latticePadlock:{
                value: true
            },
            motifPadlock:{
                value: true
            },
            latticeRefreshButtons:{
                value: true
            }
        });
        $latticePadlock.on('click', function() {
            if (!($latticePadlock.hasClass('disabled'))) latticePadlock();
        }); 
        $latticePadlock.on('reset',function(){
            // Clear Lattice Restrictions //
            removeLatticeRestrictions();
            localRestrictions = undefined;
        });
        $motifPadlock.on('click', function() {
            if (!($motifPadlock.hasClass('disabled'))) {
                if (!($motifPadlock.children().hasClass('active'))) {
                    $setUIValue.setValue({
                        motifPadlock:{
                            publish: { padlock: true }
                        }
                    });   
                }
                else {
                    $setUIValue.setValue({
                        motifPadlock:{
                            publish: { padlock: false }
                        }
                    });   
                }
            }
        });
        $autoRefresh.on('click', function(){
            if (!($autoRefresh.hasClass('off'))) {
                $autoRefresh.addClass('off');
                conditions.autoRefresh = false;
            }
            else{
                $autoRefresh.removeClass('off');
                conditions.autoRefresh = true;
            }
            $setUIValue.setValue({
                autoUpdate:{
                    publish: {autoUpdate: conditions.autoRefresh}   
                }
            });
        });
    };
    function latticePadlock(){
        if (!($latticePadlock.children().hasClass('active'))) {
            
            // If crystal is added //
            if (!( jQuery('#selected_lattice').html() === 'Choose a Lattice' )) {

                // Change Title //
                $setUIValue.setValue({
                    selectedLattice:{
                        value: $messages.getMessage(21)   
                    }
                });
                
                // Lattice Padlock //
                $latticePadlock.find('a').button('toggle');
                $latticePadlock.children().addClass('active');
                $disableUIElement.disableElement({
                    latticePadlock:{
                        value: true
                    },
                    motifPadlock:{
                        value: true   
                    }
                });
                
                // Clear Lattice Restrictions //
                removeLatticeRestrictions();
                
                // Motif Padlock //
                $setUIValue.setValue({
                    motifPadlock:{
                        publish: { padlock: true }
                    }
                });
                
                // Show Info Message //
                $userDialog.showInfoDialog({ messageID:1 });
            }
        }
    };
    function removeLatticeRestrictions(){
        restrictionList = {};
        $disableUIElement.disableElement({
            latticeParameters:{ value: false } 
        });
    };
    function setLatticeRestrictions(restrictions){
        // Return is restrictions is not an object
        if (_.isObject(restrictions) === false) {
            return;
        }

        localRestrictions = restrictions;

        var left = {};
        var right = {};

        _.each(latticeParameters, function($parameter, pk) {

            $parameter.prop('disabled',false);
            jQuery('#'+pk+'Slider').slider('enable');

            if (_.isUndefined(restrictions[pk]) === false) {

                // Left side of expression
                left[pk] = $parameter;

                _.each(restrictions[pk], function(operator, rk) {

                    // Right side of expression
                    right[rk] = latticeParameters[rk];

                    var restrictionName = 'restriction'+Object.keys(restrictionList).length;

                    if (operator === '=') {
                        // Add equalToNumber restriction
                        if (_.isUndefined(right[rk])) {
                            left[pk].prop('disabled',true);
                            jQuery('#'+pk+'Slider').slider('disable');
                            restrictionList[restrictionName] = function(caller,value){
                                if (caller === pk){
                                    if (parseFloat(value) !== parseFloat(rk)) {
                                        return { 
                                            action: 'fail',
                                            source: left[pk],
                                            target: parseFloat(rk),
                                            value: parseFloat(rk),
                                            restriction: 'equalTo'
                                        };
                                    }
                                }
                                else if (caller === pk+'Slider'){
                                    if (parseFloat(value) !== parseFloat(rk)) {
                                        return { 
                                            action: 'fail',
                                            source: jQuery('#'+pk+'Slider'),
                                            target: parseFloat(rk),
                                            value: parseFloat(rk),
                                            restriction: 'equalTo'
                                        };
                                    }
                                }
                                return { action: 'success' };
                            }
                        }
                        // Add equalToInput restriction
                        else {
                            if (right[rk].prop('disabled') === false){
                                right[rk].prop('disabled',true);
                                jQuery('#'+rk+'Slider').slider('disable');
                            }
                            restrictionList[restrictionName] = function(caller,value){
                                if(caller === pk){
                                    return {
                                        action: 'reflect',
                                        source: left[pk],
                                        target: right[rk],
                                        value: value
                                    };
                                }
                                else if (caller === pk+'Slider'){
                                    return {
                                        action: 'reflect',
                                        source: jQuery('#'+pk+'Slider'),
                                        target: jQuery('#'+rk+'Slider'),
                                        value: value
                                    };
                                }
                                return { action: 'success' };
                            }
                        }
                    } 
                    else if (operator === '≠') {

                        // Add differentThanNumber restriction
                        if (_.isUndefined(right[rk])) {
                            restrictionList[restrictionName] = function(caller,value){
                                if (caller === pk){
                                    if (parseFloat(value) === parseFloat(rk)) {
                                        return { 
                                            action: 'fail',
                                            source: left[pk],
                                            target: parseFloat(rk),
                                            value: LastLatticeParameters[pk],
                                            restriction: 'differentThan'
                                        };
                                    }
                                }
                                else if (caller === pk+'Slider'){
                                    if (parseFloat(value) === parseFloat(rk)) {
                                        return { 
                                            action: 'fail',
                                            source: jQuery('#'+pk+'Slider'),
                                            target: parseFloat(rk),
                                            value: LastLatticeParameters[pk],
                                            restriction: 'differentThan'
                                        };
                                    }
                                }
                                return { action: 'success' };
                            }
                        }
                        // Add differentThanInput restriction
                        else {
                            restrictionList[restrictionName] = function(caller,value){
                                if (caller === pk){
                                    if (value === right[rk].val()) {
                                        return { 
                                            action: 'undo',
                                            source: left[pk],
                                            target: right[rk],
                                            value: LastLatticeParameters[pk]
                                        };
                                    }
                                }
                                else if (caller === pk+'Slider'){
                                    if (value === right[rk].val()) {
                                        return { 
                                            action: 'undo',
                                            source: jQuery('#'+pk+'Slider'),
                                            target: jQuery('#'+rk+'Slider'),
                                            value: LastLatticeParameters[pk]
                                        };
                                    }
                                }
                                return { action: 'success' };
                            }
                        }
                    }
                });
            }
        });
    };
    function unlockMotifPadlock(){
        
        if (!($motifPadlock.children().addClass('active'))) $motifPadlock.find('a').button('toggle');
        $motifPadlock.children().addClass('active');
        
        // Turn off tangency //
        $setUIValue.setValue({
            tangency: {
                value: false
            }
        });
        
        // Enable Lattice Parameters //
        $disableUIElement.disableElement({
            latticeParameters:{
                value: false   
            }
        });
        
        // Re-apply lattice restrictions is needed
        if (!($latticePadlock.children().hasClass('active'))) {
            removeLatticeRestrictions();
            setLatticeRestrictions(localRestrictions);
        }
        $userDialog.showInfoDialog({ messageID : 2 });
    };
    function lockMotifPadlock(){
        
        if ($motifPadlock.children().addClass('active')) $motifPadlock.find('a').button('toggle');
        $motifPadlock.children().removeClass('active');
        
        // Turn on tangency //
        $setUIValue.setValue({
            tangency: {
                value: true
            }
        });
        
        // Disable Lattice Parameters //
        $disableUIElement.disableElement({
            latticeParameters:{
                value: true   
            }
        });
    };
    function applyRestrictions(caller,value,context,noTooltips){
        // Run restrictions
        var result = {};
        var returnValue = 'success';

        if (_.isEmpty(restrictionList)) return returnValue;
        _.each(restrictionList, function($parameter,pk){
            result[pk] = $parameter(caller,value);
        });

        // Evaluate Resutls
        // ORDER [ ≠X > =X >  ≠Number,=Number]
        _.each(result, function($param, a){
            if ($param.action === 'undo') {
                if (noTooltips !== true){
                    $tooltipGenerator.showTooltip({
                        target: $param.source.attr('id'),
                        placement: 'top',
                        message: $stringEditor.translateParameter($param.source.attr('id'))+' should be ≠ '+$stringEditor.translateParameter($param.target.attr('id'))
                    });
                    $param.source.trigger($param.action, [$param.value]);
                    returnValue = 'abort';
                }
            }
        });
        if (returnValue !== 'abort') {
            _.each(result, function($param, a){
                if ($param.action === 'reflect') {
                    $param.source.trigger($param.action, [$param.value]);
                    $param.target.trigger($param.action, [$param.value]);
                    returnValue = 'reflect';
                }
            });
        }
        if (returnValue !== 'abort') {
            _.each(result, function($param, a){
                if ($param.action === 'fail') {
                    var message;
                    if ($param.restriction === 'equalTo') message = $stringEditor.translateParameter($param.source.attr('id'))+' should be = '+$param.target;
                    else message = $stringEditor.translateParameter($param.source.attr('id'))+' should be ≠ '+$param.target;
                    if (noTooltips !== true){
                        $tooltipGenerator.showTooltip({
                            target: $param.source.attr('id'),
                            placement: 'top',
                            message: message
                        });
                        $param.source.trigger($param.action, [$param.value]);
                        returnValue = 'fail';
                    }
                }
            });
        }
        return returnValue;
    };
    function collision(value,limit,range){
        var upper = limit + range;
        var lower = limit - range; 
        if ( (value > lower) && (value < upper) ) return true;
        else return false;
    };
    function sliderWidth(name){
        var width = jQuery('#'+name+'Slider').width();
        if (width > 0) return width;
        else return 187.578;
    };
    function sliderStepWidth(name){
        var range = jQuery('#'+name+'Slider').slider('option','max') - jQuery('#'+name+'Slider').slider('option','min');
        var numberOfSteps = (range / jQuery('#'+name+'Slider').slider('option','step')) + 1;
        return sliderWidth(name) / numberOfSteps;
    };
    function countSteps(step,value,min){
        var counter = 0;
        while(value > min) {
            value -= step;
            counter++;
        }
        return counter;
    };
    function refreshStickyVisuals(){
        _.each(collisions, function($parameter,k){
            var steps = countSteps(jQuery('#'+k+'Slider').slider('option','step'),collisions[k],jQuery('#'+k+'Slider').slider('option','min'));
            var shift = steps*sliderStepWidth(k);
            jQuery('#'+k+'Shift').css('width',shift+'px');
        });
    };
    
    latticeTab.prototype.setLatticeRestrictions = function(argument){
        setLatticeRestrictions(argument);  
    };
    latticeTab.prototype.updateCondition = function(argument){
        _.each(argument, function($parameter, k){
             conditions[k] = $parameter;
        });
    };
    latticeTab.prototype.getConditions = function(){
        return conditions;
    };
    latticeTab.prototype.setMotifPadlock = function(state){
        if (state === 'lock') {
            if (($motifPadlock.children().hasClass('active'))) $motifPadlock.find('a').removeClass('active');
            lockMotifPadlock();
        }
        else if (state === 'unlock') {
            if (!($motifPadlock.children().hasClass('active'))) $motifPadlock.find('a').addClass('active');
            unlockMotifPadlock();
        }
    };
    latticeTab.prototype.setLatticeParameters = function(parameters){
        _.each(latticeParameters, function($latticeParameter, k) {
            if (_.isUndefined(parameters[k]) === false) {
                var argument = {};
                var publish = {};
                publish[k] = parameters[k];
                argument[k] = {
                    value: parameters[k],
                    publish: publish
                };
                $setUIValue.setValue(argument);
                LastLatticeParameters[k] = parameters[k];
            }
        }); 
    };
    latticeTab.prototype.disableLatticeParameters = function(parameters){
        _.each(latticeParameters, function($parameter, k) {
            if (parameters[k] !== undefined) {
                var argument = {};
                argument[k] = {
                    value: parameters[k]   
                }
                disableUIElementModule.disableElement(argument);
            }
        });  
    };
    latticeTab.prototype.updateLatticeLabels = function(){
        _.each(latticeLabels, function($parameter,k){
            var labelLength = parseFloat(latticeParameters[k].val()).toFixed(3);
            var labelAngle = parseFloat(latticeParameters[k].val()).toFixed(0);
            if ( (k !== 'alpha') && (k !== 'beta') && (k !== 'gamma') ) $parameter.text(labelLength+'Å'); 
            else $parameter.text(labelAngle+'°'); 
        });
    };
    latticeTab.prototype.stickySlider = function(argument){
        // Read state from argument //
        if (_.isUndefined(argument)) return false;
        else {
            _.each(argument, function($parameter,k){
                if ($parameter === false) {
                    delete collisions[k];
                    jQuery('#'+k+'Collision').css('background-color','white');
                }
                else collisions[k] = $parameter;
                jQuery('#'+k+'Collision').css('background-color','#6f6299');
            });
            refreshStickyVisuals();
        }
        return true;
    };
    latticeTab.prototype.refreshStickyVisuals = function(){
        refreshStickyVisuals();
    };
    
    return latticeTab;
});