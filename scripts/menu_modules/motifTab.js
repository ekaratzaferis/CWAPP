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
    // Module References //
    var $messages = undefined;
    var $getUIValue = undefined;
    var $setUIValue = undefined;
    var $menuRibbon = undefined;
    var $tooltipGenerator = undefined;
    var $latticeTab = undefined;
    var $disableUIElement = undefined;
    
    // Selectors //
    var $atomTable = jQuery('#atomTable');
    var $atomOpacitySlider = jQuery('#atomOpacitySlider');
    var $tangentR = jQuery('#tangentR');
    var $cellVolume = jQuery('#cellVolume');
    var $cellVolumeSlider = jQuery('#cellVolumeSlider');
    var $atomPalette = jQuery('#atomPalette');
    var $previewAtomChanges = jQuery('.previewAtomChanges');
    var $autoRefresh = jQuery('.autoRefresh');
    var $saveAtomChanges = jQuery('.saveAtomChanges');
    var $deleteAtom = jQuery('#deleteAtom');
    var $tangency = jQuery('#tangency');
    var $atomPositioningXYZ = jQuery('#atomPositioningXYZ');
    var $atomPositioningABC = jQuery('#atomPositioningABC');
    var $lockCameras = jQuery('#lockCameraIcon');
    var $swapButton = jQuery('#swapBtn');
    var $atomColor = jQuery('#atomColor');
    
    // Grouping //
    var atomParameters = {
        atomOpacity: jQuery('#atomOpacity'),
        atomWireframe: jQuery('#atomWireframe'),
        atomTexture: jQuery('#atomTexture')
    };
    var motifInputs = {
        atomPosX : jQuery('#atomPosX'),
        atomPosY : jQuery('#atomPosY'), 
        atomPosZ : jQuery('#atomPosZ')
    };
    var motifSliders = {
        atomPosX: jQuery('#atomPosXSlider'), 
        atomPosY: jQuery('#atomPosYSlider'), 
        atomPosZ: jQuery('#atomPosZSlider')
    };
    var rotatingAngles = {
        rotAngleTheta : jQuery('#rotAngleTheta'),
        rotAnglePhi : jQuery('#rotAnglePhi')
    };
    var latticeLabels = {
        scaleX : jQuery('#meLengthA'),
        scaleY : jQuery('#meLengthB'),
        scaleZ : jQuery('#meLengthC'),
        alpha : jQuery('#meAngleA'),
        beta : jQuery('#meAngleB'),
        gamma : jQuery('#meAngleG')
    };
    
    // Contructor //
    function motifTab(argument) {
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.getUIValue))) $getUIValue = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.menuRibbon))) $menuRibbon = argument.menuRibbon;
        else return false;
        if (!(_.isUndefined(argument.latticeTab))) $latticeTab = argument.latticeTab;
        else return false;
        
        // Reset
        $atomTable.on('reset',function(){
            $atomTable.find('tbody').html('');
        });
        
        // Input Handlers
        $atomOpacitySlider.slider({
            value: 10,
            min: 0,
            max: 10,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                $setUIValue.setValue({
                    atomOpacity:{
                        publish:{atomOpacity:ui.value}
                    }
                });
                atomParameters.atomOpacity.val(ui.value);
            }
        });
        $cellVolumeSlider.slider({
            value: 100,
            min: 0,
            max: 400,
            step: 0.1,
            animate: true,
            slide: function(event, ui){
                var value = ui.value;
                var tangency = $getUIValue.getValue({tangency: {id:'tangency'}});
                if (tangency.tangency === true){
                    if (value < 100) {
                        value = 100;
                        $cellVolume.val(value);
                        $cellVolumeSlider.slider('value',value);
                        $tooltipGenerator.showTooltip({
                            'target': 'cellVolumeSlider',
                            'placement': 'top',
                            'message': $messages.getMessage(22)
                        });
                        $setUIValue.setValue({
                            cellVolume:{
                                publish: {cellVolume:100}
                            }
                        });
                        return false;
                    }
                }
                $setUIValue.setValue({
                    cellVolume:{
                        publish: {cellVolume:value}
                    }
                });
                $cellVolume.val(value);
            }
        });
        $cellVolume.on('change', function() {
            console.log('asd');
            $setUIValue.setValue({
                cellVolume:{
                    value: $cellVolume.val(),
                    publish: {cellVolume:$cellVolume.val()}
                }
            });       
        });
        $cellVolume.val(100);
        $tangentR.on('change', function() {
            $setUIValue.setValue({
                tangetR:{
                    publish: {tangentR:$tangentR.val()}   
                }
            });
        });
        _.each(atomParameters, function($parameter, k ) {
            $parameter.on('change', function() {
                
                // Get //
                var askValue = {};
                askValue[k] = {id:k};
                var publish = $getUIValue(askValue);
                
                // Set Value //
                var argument = {};
                argument[k] = { 
                    value: publish[k]
                }
                $setUIValue.setValue(argument);
                
                
                // Publish if everything ok
                var publish = $getUIValue(askValue);
                if (publish[k] !== false) {
                    var argument = {};
                    argument[k] = { 
                        publish: publish
                    }
                    $setUIValue.setValue(argument);
                }
            }); 
        });
        _.each(motifInputs, function($parameter, k) {
            $parameter.on('change', function() {
                
                // Get //
                var askValue = {};
                askValue[k] = {id:k};
                var publish = $getUIValue.getValue(askValue);
                publish.trigger = 'textbox';
                
                // Set Value //
                var argument = {};
                argument[k] = { 
                    value: publish[k]
                }
                $setUIValue.setValue(argument);
                
                // Publish if everything ok
                var publish = $getUIValue(askValue);
                if (publish[k] !== false) {
                    var argument = {};
                    argument[k] = { 
                        publish: publish
                    }
                    $setUIValue.setValue(argument);
                }
            });
        });
        _.each(motifSliders, function($parameter, k) {
            $parameter.slider({
                value: 0,
                min: -20.000,
                max: 10.000,
                step: 0.001,
                animate: true,
                slide: function(event, ui){
                    var publish = {};
                    publish[k] = ui.value;
                    var argument = {};
                    argument[k] = {publish: publish};
                    $setUIValue.setValue(argument);
                    motifInputs[k].val(ui.value);
                }
            });
        });
        _.each(rotatingAngles, function($parameter, k) {
            $parameter.on('change', function() {
                $setUIValue.setValue({
                    rotatingAngles:{
                        publish: {rotAnglePhi: jQuery('#rotAnglePhi').val(), rotAngleTheta: jQuery('#rotAngleTheta').val() }   
                    }
                });
            });
        });
        $atomColor.spectrum({
            color: "#ffffff",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    atomColor:{
                        other: $atomColor,
                        publish:{atomColor:$atomColor.spectrum('get').toHex()},
                        value: '#'+$atomColor.spectrum('get').toHex()
                    }
                });
            },
            change: function(){
                $setUIValue.setValue({
                    atomColor:{
                        other: $atomColor,
                        publish:{atomColor:$atomColor.spectrum('get').toHex()},
                        value: '#'+$atomColor.spectrum('get').toHex()
                    }
                });
            }
        });
        
        $tangency.on('click',function(){
            var value = undefined;
            if ( !($tangency.parent().hasClass('disabled')) ){
                ($tangency.parent().hasClass('purpleThemeActive')) ? value = true : value = false;
                $setUIValue.setValue({
                    tangency:{
                        publish:{button:'tangency',tangency:value},
                        value:value
                    }
                });
                if (value === false) {
                    $setUIValue.setValue({
                        cellVolume:{
                            value: 100,
                            publish: {cellVolume:100}
                        }
                    });
                }
            }
        });
        $previewAtomChanges.on('click', function(){  
            var value = undefined;
            if (!($previewAtomChanges.hasClass('disabled'))){
                $setUIValue.setValue({
                    previewAtomChanges:{
                        publish:{empty:0}
                    }
                });
            }
        });   
        $saveAtomChanges.on('click', function(){
            if (!($saveAtomChanges.hasClass('disabled'))){
                var publish = {};
                publish = $getUIValue.getValue({
                    atomColor:{
                        id:'atomColor'   
                    },
                    atomOpacity:{
                        id:'atomOpacity'   
                    }
                });
                publish.button = 'saveChanges';
                $setUIValue.setValue({
                    saveAtomChanges:{
                        publish: publish,
                        other: $saveAtomChanges
                    }
                });
            }
        });
        $deleteAtom.on('click', function(){
            if (!($deleteAtom.hasClass('disabled'))){
                $setUIValue.setValue({
                    deleteAtom:{
                        publish: {'button':'deleteAtom'},
                        other: $deleteAtom
                    }
                });
            }
        });
        $atomPositioningXYZ.on('click', function() {
            var value = undefined;
            if (!($atomPositioningXYZ.hasClass('disabled'))){ 
                ($atomPositioningXYZ.hasClass('buttonPressed')) ? value = false : value = true;
                $setUIValue.setValue({
                    atomPositioningXYZ:{
                        publish: {xyz:value},
                        value: value
                    }
                });
            }
        });
        $atomPositioningABC.on('click', function() {
            var value = undefined;
            if (!($atomPositioningABC.hasClass('disabled'))){ 
                ($atomPositioningABC.hasClass('buttonPressed')) ? value = false : value = true;
                $setUIValue.setValue({
                    atomPositioningABC:{
                        publish: {abc:value},
                        value: value
                    }
                });
            }
        });
        $atomTable.find('tbody').sortable({
            appendTo: document.body,
            axis: 'y',
            containment: "parent",
            cursor: "move",
            items: "> tr",
            tolerance: "pointer",
            cancel: 'td.atomButton, td.btn-tangent',
            update: function(e,ui){ 
                if (jQuery(ui.item).attr('role') !== 'empty'){
                    $atomTable.find('tbody').sortable("cancel");
                }
                else if (ui.item.prev('tr').length > 0){
                    if (ui.item.prev('tr').attr('role') === 'parent') $atomTable.find('tbody').sortable('cancel');
                    else if (ui.item.prev('tr').attr('role') === 'parentChild') $atomTable.find('tbody').sortable('cancel');
                }
            }
        });
        $lockCameras.click(function() { 
            var value = undefined;
            ($lockCameras.hasClass('active')) ? value = false : value = true;
            $setUIValue.setValue({
                lockCameras:{
                    publish: {'syncCameras':value},
                    value: value,
                    other: $lockCameras
                }
            });          
        });
        _.each(latticeLabels, function($parameter, k){
            $parameter.parent().parent().on('click', function(){
                $menuRibbon.switchTab('latticeTab');
                var conditions = $latticeTab.getConditions();
                if (conditions.atomAdded !== false) $swapButton.trigger('click');
            });
        });
        $swapButton.on('click', function(){
            var value = undefined;
            var swap = undefined;
            ($swapButton.hasClass('motif')) ? value = false : value = true;
            ($swapButton.hasClass('motif')) ? swap = 'latticeTab' : swap = 'motifLI';
            $setUIValue.setValue({
                swapButton:{
                    other: $swapButton,
                    publish:{swap:swap},
                    value:value
                }
            });
        });
        
        // Initiation
        $disableUIElement.disableElement({
            atomTable:{
                value: true
            },
            atomOpacity:{
                value: true
            },
            atomOpacitySlider:{
                value: true
            },
            atomColor:{
                value: true
            },
            atomPosX:{
                value: true
            },
            atomPosY:{
                value: true
            },
            atomPosZ:{
                value: true
            },
            atomPosXSlider:{
                value: true
            },
            atomPosYSlider:{
                value: true
            },
            atomPosZSlider:{
                value: true
            },
            tangentR:{
                value: true
            },
            atomPositioningXYZ:{
                value: true
            },
            atomPositioningABC:{
                value: true
            },
            saveAtomChanges:{
                other: $saveAtomChanges,
                value: true
            }
        });
        $atomTable.hide();
    };
    function getChainLevel(id){
        var level = 0;
        var tangent = $atomTable.find('#'+id).attr('tangentTo');
        if (tangent !== 'x'){
            level =  1 + getChainLevel(tangent);               
        }
        return level;
    };
    function tangent(id){
        var arg = {};
        var current = $atomTable.find('#'+id);
        var above = current.prev('tr');
        var parent = $atomTable.find('#'+current.attr('tangentTo'));
        //UNLINK
        if ( (current.find('.btn-tangent').hasClass('active')) && !(current.find('.btn-tangent').hasClass('blocked')) ) {

            // If atom is a child
            if (current.attr('role') === 'child') {

                // Publish Event
                arg["dragMode"]= false;
                arg["parentId"]= current.attr('tangentTo');
                PubSub.publish('menu.drag_atom', arg);

                // Assign role empty and deactivate button
                current.attr('role','empty');
                current.find('.btn-tangent').removeClass('active');

                // Remove role if only parent
                if (parent.attr('role') === 'parent'){
                    parent.attr('role','empty');
                }
                // Assign child role again
                else{
                    parent.attr('role','child');
                    parent.find('.btn-tangent').addClass('active');
                }

                //UNLINK and hide icon
                current.attr('tangentTo','x');
                current.find('.chain').addClass('hiddenIcon');
                current.find('.element-serial').toggleClass('small');
            }
        }
        //LINK
        else if (!(current.find('.btn-tangent').hasClass('blocked'))) {
            if (current.attr('role') === 'empty') {
                // If there's an atom above
                if (above.length !== 0 ) {

                    // If atom above isn't a parent
                    if (above.attr('role') !== 'parent'){

                        // Make child and activate button
                        current.attr('role','child');
                        current.find('.btn-tangent').addClass('active');

                        // Make atom above a parent or parentChild
                        if (above.attr('role') === 'empty') above.attr('role','parent');
                        else above.attr('role','parentChild');

                        // Link Parent-Child and show icon
                        current.attr('tangentTo',above.attr('id'));
                        current.find('.element-serial').toggleClass('small');
                        current.find('.chain').removeClass('hiddenIcon');
                        current.find('.chain').find('a').html(getChainLevel(id));

                        // Publish Event
                        arg["dragMode"]= true;
                        arg["parentId"]= above.attr('id');
                        PubSub.publish('menu.drag_atom', arg);
                    }
                }
            }
        }   
    };
    function breakChain(argument){
        var current = $atomTable.find('#'+argument['id']);
        var above = current.prev('tr');
        var below = current.next('tr');

        // Handle parent
        if (current.attr('role') === 'child'){
            if (above.attr('role') === 'parent') {
                above.attr('role','empty');
                above.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
            }
            else above.attr('role','child');
        }
        else if (current.attr('role') === 'parent'){
            if (below.attr('role') === 'child') below.attr('role','empty');
            else below.attr('role','parent');
            below.attr('tangentTo','x');
            below.find('.chain').addClass('hiddenIcon');
            below.find('.element-serial').removeClass('small');
            below.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
        }
        else if (current.attr('role') === 'parentChild'){
            if (above.attr('role') === 'parent') {
                above.attr('role','empty');
                above.attr('tangentTo','x');
                above.find('.chain').addClass('hiddenIcon');
                above.find('.element-serial').removeClass('small');
                above.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
            }
            else above.attr('role','child');
            if (below.attr('role') === 'child') below.attr('role','empty');
            else below.attr('role','parent');
            below.attr('tangentTo','x');
            below.find('.chain').addClass('hiddenIcon');
            below.find('.element-serial').removeClass('small');
            below.find('.btn-tangent').attr('class','btn-tangent disabled blocked');
        }

        // Update list
        if (argument['remove'] === true) current.remove();
        else{
            current.attr('role','empty');
            current.find('.chain').addClass('hiddenIcon');
            current.find('.element-serial').removeClass('small');
            current.find('.btn-tangent').attr('class','btn-tangent');
            current.attr('tangentTo','x');
            if (above.attr('tangentTo') !== 'x') tangent(current.attr('id'));
            else current.find('.btn-tangent').addClass('blocked');
        }
        jQuery('#tableAtom tbody tr').each(function(){
            jQuery(this).find('.chain').find('a').html(getChainLevel(jQuery(this).attr('id')));
        });
    };
    
    motifTab.prototype.toggleExtraParameter = function(choice,action){
        if ( (choice === 'i') && (action === 'block') ) jQuery('#hexICoord').show('fast');
        else if ( (choice === 'i')) jQuery('#hexICoord').hide('fast');
        else if ( (choice === 't') && (action === 'block') ) jQuery('#hexTCoord').show('fast');
        else jQuery('#hexTCoord').hide('fast');
        setTimeout(function(){$.fn.matchHeight._update();},500);
    };
    motifTab.prototype.editAtom = function(argument){
        
        var constructor = {};
        constructor.eyeButton = '';
        constructor.visible = '';
        constructor.elementCode = '';
        constructor.elementName = '';
        constructor.atomPos = '';
        constructor.small = '';
        constructor.role = 'empty';
        constructor.chain = 'hiddenIcon chain';
        constructor.tangentTo = 'x';
        constructor.btnState = 'btn-tangent blocked';
        constructor.current = $atomTable.find('#'+argument['id']);
        constructor.level = '';

        // Update construct object from argument //
        _.each(argument, function($parameter, k){
            switch(k){
                case 'visible':
                    if ($parameter === true) { constructor.visible = 'visible'; constructor.eyeButton = constructor.visible; }
                    else { constructor.visible = ''; constructor.eyeButton = 'hidden'; }   
                    break;
                case 'elementCode':
                    constructor.elementCode = $parameter;
                    break;
                case 'elementName':
                    constructor.elementName = $parameter;
                    break;
                case 'ionicIndex':
                    if ($parameter !== '0' && $parameter !== '3b') constructor.elementName = '<span style="font-size:13px;">'+constructor.elementName+'<sup>'+argument['ionicIndex']+'</sup></span>';
                    break;
                case 'atomPos':
                    constructor.atomPos = $parameter;
                    break;
            }
        });

        // Update atom entry properties //
        if (argument['action']==='edit') {
            // Role
            constructor.role = constructor.current.attr('role');
            constructor.tangentTo = constructor.current.attr('tangentTo');
            // Element serial size
            if (constructor.role === 'child') constructor.small = 'small';
            else if (constructor.role === 'parentChild') constructor.small = 'small';
            // Chain
            constructor.chain = constructor.current.find('.chain').attr('class');
            constructor.level = getChainLevel(argument['id']);
            //Color
            constructor.btnState = constructor.current.find('.btn-tangent').attr('class');
        }

        // Construct HTML Query //
        var HTMLQuery = '<tr id="'+argument['id']+'" role="'+constructor.role+'" tangentTo="'+constructor.tangentTo+'" class="bg-light-gray"><td class="visibility atomButton '+constructor.visible+'"><a><img src="Images/'+constructor.eyeButton+'-icon-sm.png" class="img-responsive" alt=""/></a></td"><td class="hiddenIcon blank"></td><td class="'+constructor.chain+'"><a id="level">'+constructor.level+'</a><img src="Images/chain-icon.png" class="img-responsive" alt=""/></td><td class="element ch-'+constructor.elementCode+'">'+constructor.elementName+'</td><td  class="element-serial '+constructor.small+' selectable"><a>'+constructor.atomPos+'</a></td><td class="'+constructor.btnState+'"><a href="#"><img src="Images/tangent-icon.png" class="img-responsive" alt=""/></a></td></tr>';

        // Add, Remove, Edit Entry
        switch(argument['action']){
            case 'save':
                $atomTable.find('tbody').append(HTMLQuery);
                break;  

            case 'edit':
                constructor.current.replaceWith(HTMLQuery);
                setTimeout(function(){
                    constructor.current.find('.element').attr('class','element').css('background',argument['atomColor']);
                },300);
                break;

            case 'delete':
                constructor.current.remove();
                break;

        }
        
        // Update Current Selection //
        constructor.current = $atomTable.find('#'+argument['id']);
        
        // Handlers //
        if ( (argument['action']==='save') || (argument['action']==='edit') ){
            constructor.current.find('.btn-tangent').on('click', function(){
                tangent(argument['id']);
            });
            constructor.current.find('.selectable').on('click',function(){
                $setUIValue.setValue({
                    selectAtom:{
                        publish: argument['id']
                    }
                });
            });
            constructor.current.find('.atomButton').on('click', function(){
                var value = undefined;
                (constructor.current.find('.atomButton').hasClass('visible')) ? value = false : value = true;
                $setUIValue.setValue({
                    atomVisibility:{
                        value: value,
                        publish: {id:argument['id'],visible:value},
                        other: constructor.current
                    }
                });
            });
        }
        
        // Show table if there are entries //
        if ($atomTable.find('tr').length > 0) $atomTable.css('display','block');
        else {
            $atomTable.css('display','none');
            $atomTable.find('tbody').sortable('disable');
        }  
    };
    motifTab.prototype.highlightAtomEntry = function(argument){
        if (argument['color'] === 'bg-light-purple') {
            $atomTable.find('#'+argument['id']).find('.btn-tangent').removeClass('blocked');
            $atomTable.find('#'+argument['id']).find('.btn-tangent').removeClass('disabled');
        }
        else if ($atomTable.find('#'+argument['id']).find('.btn-tangent').hasClass('active')){
            $atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('blocked');
        }
        else {
            $atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('disabled');
            $atomTable.find('#'+argument['id']).find('.btn-tangent').addClass('blocked');
        }
        $atomTable.find('#'+argument['id']).removeAttr('class');
        $atomTable.find('#'+argument['id']).attr('class',argument['color']);   
    };
    motifTab.prototype.btnTangentState = function(argument){
        var current = $atomTable.find('#'+argument['id']).find('.btn-tangent');
        switch(argument['state']){
            case 'reset':
                current.attr('class','btn-tangent');
                break;
            case 'activate':
                current.attr('class','btn-tangent active');
                break;
            case 'block':
                current.addClass('blocked');
                break;
            case 'unblock':
                current.removeClass('blocked');
                break;
            case 'disable':
                current.attr('class','btn-tangent disabled');
                break;
        }  
    };
    motifTab.prototype.setAtomEntryVisibility = function(argument){
        $disableUIElement.disableElement({
            entryVisibity:{
                value: argument.action,
                other: $atomTable.find('#'+argument['id']).find('.atomButton')
            }
        });
    };
    motifTab.prototype.breakChain = function(argument){
         breakChain(argument); 
    };
    motifTab.prototype.getChainLevel = function(id){
        return getChainLevel(id);  
    };
    
    return motifTab;
});