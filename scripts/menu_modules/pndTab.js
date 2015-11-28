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
    var $getUIValue = undefined;
    var $tooltipGenerator = undefined;
    var $disableUIElement = undefined;
    var $setUIValue = undefined;
    var $messages = undefined;
    
    // Selectors //
    var $planesTable = jQuery('#planesTable');
    var $directionTable = jQuery('#directionTable'); 
    
    // Grouping //
    var planeButtons = { 
        savePlane: jQuery('#savePlane'),
        deletePlane: jQuery('#deletePlane'),
        newPlane: jQuery('#newPlane'),
        parallelPlane: jQuery('#parallelPlane')
    };
    var directionButtons = { 
        saveDirection: jQuery('#saveDirection'),
        deleteDirection: jQuery('#deleteDirection'),
        newDirection: jQuery('#newDirection')
    };
    var planeParameters = {
        millerH: jQuery('#millerH'),
        millerK: jQuery('#millerK'),
        millerL: jQuery('#millerL'),
        millerI: jQuery('#millerI'),
        planeColor: jQuery('#planeColor'),
        planeOpacity: jQuery('#planeOpacity'),
        planeName : jQuery('#planeName')
    };
    var directionParameters = {
        millerU: jQuery('#millerU'),
        millerV: jQuery('#millerV'),
        millerW: jQuery('#millerW'),
        millerT: jQuery('#millerT'),
        directionColor: jQuery('#directionColor'),
        directionName : jQuery('#directionName'),
        dirRadius : jQuery('#dirRadius')
    };
    
    // Contructor //
    function pndTab(argument) {
        // Acquire Module References //
        if (!(_.isUndefined(argument.getUIValue))) $getUIValue = argument.getUIValue;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.messages))) $messages = argument.messages;
        else return false;
        
        $setUIValue = argument.setUIValue;
        
        // Hide extra miller parameters and tables
        jQuery('#hexICoord').hide('slow');
        jQuery('#hexTCoord').hide('slow');
        $planesTable.hide('slow');
        $directionTable.hide('slow');
        
        // Inputs //
        _.each(planeParameters, function($parameter, k) {

            // Construct Select Picker
            if (k === 'planeColor'){
                $parameter.spectrum({
                    color: "#ffffff",
                    allowEmpty:true,
                    chooseText: "Choose",
                    cancelText: "Close",
                    move: function(){
                        $setUIValue.setValue({
                            planeColor:{
                                other: $parameter,
                                publish:{planeColor:'#'+$parameter.spectrum('get').toHex()},
                                value: '#'+$parameter.spectrum('get').toHex()
                            }
                        });
                    },
                    change: function(){
                        $setUIValue.setValue({
                            planeColor:{
                                other: $parameter,
                                publish:{planeColor:'#'+$parameter.spectrum('get').toHex()},
                                value: '#'+$parameter.spectrum('get').toHex()
                            }
                        });
                    }
                });
            }
            else {
                if (k === 'planeOpacity'){
                    $parameter.html('<option>0</option><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option>');
                    $parameter.selectpicker();
                    $parameter.selectpicker('val','6');
                }
                // Change Handlers
                $parameter.on('change', function() {
                    // Publish Value
                    var publish = {};
                    publish = parallelInterception(publish);
                    publish[k] = $parameter.val();
                    var argument = {};
                    argument[k] = {
                        value: $parameter.val(),
                        publish: publish
                    };
                    $setUIValue.setValue(argument);
                });   
            }
        }); 
        _.each(directionParameters, function($parameter, k) {
            
            // Construct Select Picker
            if (k === 'directionColor'){
                $parameter.spectrum({
                    color: "#ffffff",
                    allowEmpty:true,
                    chooseText: "Choose",
                    cancelText: "Close",
                    move: function(){
                        $setUIValue.setValue({
                            directionColor:{
                                other: $parameter,
                                publish:{directionColor:'#'+$parameter.spectrum('get').toHex()},
                                value: '#'+$parameter.spectrum('get').toHex()
                            }
                        });
                    },
                    change: function(){
                        $setUIValue.setValue({
                            directionColor:{
                                other: $parameter,
                                publish:{directionColor:'#'+$parameter.spectrum('get').toHex()},
                                value: '#'+$parameter.spectrum('get').toHex()
                            }
                        });
                    }
                });
            }
            else{
                if (k === 'dirRadius'){
                    $parameter.html('<option>10</option><option>20</option><option>40</option><option>60</option><option>80</option><option>100</option>');
                    $parameter.selectpicker();
                }
                // Change Handlers
                $parameter.on('change', function() {

                    // Publish Value
                    var publish = {};
                    publish[k] = $parameter.val();
                    var argument = {};
                    argument[k] = {
                        value: $parameter.val(),
                        publish: publish
                    }
                    $setUIValue.setValue(argument);

                });
            }
        });
        // Disable Inputs
        $disableUIElement.disableElement({
            planeName:{
                value: true
            },
            planeOpacity:{
                value: true
            },
            planeColor:{
                value: true
            },
            millerH:{
                value: true
            },
            millerK:{
                value: true
            },
            millerL:{
                value: true
            },
            millerI:{
                value: true
            },
            directionName:{
                value: true
            },
            directionColor:{
                value: true
            },
            dirRadius:{
                value: true
            },
            millerU:{
                value: true
            },
            millerV:{
                value: true
            },
            millerW:{
                value: true
            },
            millerT:{
                value: true
            }
        });
        
        // Button Handlers //
        _.each(planeButtons, function($parameter, k ) {
            $parameter.on('click', function(){
                if (!($parameter.hasClass('disabled'))){
                    
                    // Construct publish object
                    var publish = $getUIValue.getValue({
                        planeColor: {
                            id: 'planeColor'  
                        },
                        planeName: {
                            id: 'planeName'  
                        },
                        planeOpacity: {
                            id: 'planeOpacity'  
                        },
                        millerH: {
                            id: 'millerH'  
                        },
                        millerK: {
                            id: 'millerK'  
                        },
                        millerL: {
                            id: 'millerL'  
                        },
                        millerI: {
                            id: 'millerI'  
                        }
                    })
                    publish = parallelInterception(publish);
                    publish.button = k;
                    PubSub.publish('menu.miller_plane_submit', publish);
                }
            });
        });
        _.each(directionButtons, function($parameter, k ) {
            $parameter.on('click', function(){
                if (!($parameter.hasClass('disabled'))){
                    // Construct publish object
                    var publish = $getUIValue.getValue({
                        directionColor: {
                            id: 'directionColor'  
                        },
                        directionName: {
                            id: 'directionName'  
                        },
                        dirRadius: {
                            id: 'dirRadius'  
                        },
                        millerU: {
                            id: 'millerU'  
                        },
                        millerV: {
                            id: 'millerV'  
                        },
                        millerW: {
                            id: 'millerW'  
                        },
                        millerT: {
                            id: 'millerT'  
                        }
                    })
                    publish.button = k;
                    PubSub.publish('menu.miller_directional_submit', publish);
                }
            });
        });
    };
    
    function parallelInterception(argument){
        if ($planesTable.find('.bg-light-purple').find('.parallel').hasClass('active')) argument.parallel = true;
        else argument.parallel = false;
        if ($planesTable.find('.bg-light-purple').find('.interception').hasClass('active')) argument.interception = true;
        else argument.interception = false;  
        return argument;
    };
    
    pndTab.prototype.hidePlanes = function(state){
        if (state === true){
            $planesTable.find('.planeButton').find('img').attr('src','Images/hidden-icon-sm.png');
            PubSub.publish('menu.planes_toggle', {'planeToggle':state});
        }
        else {
            $planesTable.find('.planeButton').find('img').attr('src','Images/visible-icon-sm.png');
            PubSub.publish('menu.planes_toggle', {'planeToggle':state});
        }
    };
    pndTab.prototype.hideDirections = function(state){
        if (state === true){
            $directionTable.find('.directionButton').find('img').attr('src','Images/hidden-icon-sm.png');
            PubSub.publish('menu.directions_toggle', {'directionToggle':state});
        }
        else {
            $directionTable.find('.directionButton').find('img').attr('src','Images/visible-icon-sm.png');
            PubSub.publish('menu.directions_toggle', {'directionToggle':state});
        }
    };
    pndTab.prototype.highlightPlaneEntry = function(argument){
        $planesTable.find('#'+argument['id']).removeAttr('class');
        $planesTable.find('#'+argument['id']).attr('class',argument['color']);  
    };
    pndTab.prototype.editPlane = function(argument){
        var parameters;
        
        // Parameters [,,,,] //
        if ( argument['i'] === undefined ) parameters = '['+argument['h']+','+argument['k']+','+argument['l']+']';
        else parameters = '['+argument['h']+','+argument['k']+','+argument['l']+','+argument['i']+']';
        
        // Buttons //
        if (!(_.isUndefined(argument.parallel))) (argument.parallel) ? argument.parallel = 'active' : argument.parallel = '';
        if (!(_.isUndefined(argument.interception))) (argument.interception) ? argument.interception = 'active' : argument.interception = '';
        
        // Add,Edit,Remove Entry //
        switch(argument['action']){
            case 'save':
                $planesTable.find('tbody').append('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="planeButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td><td class="visibility"><a class="parallel"><img src="Images/planes.png" class="img-responsive" alt=""/></a></td><td class="visibility"><a class="interception"><img src="Images/atomIcon.png" class="img-responsive" alt=""/></a></td></tr>');
                $planesTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;  

            case 'edit':
                $planesTable.find('#'+argument['oldId']).replaceWith('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="planeButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td><td class="visibility"><a class="parallel '+argument['parallel']+'"><img src="Images/planes.png" class="img-responsive" alt=""/></a></td><td class="visibility"><a class="interception '+argument['interception']+'"><img src="Images/atomIcon.png" class="img-responsive" alt=""/></a></td></tr>');
                $planesTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;

            case 'delete':
                $planesTable.find('#'+argument['oldId']).remove();
                break;

        }
        
        // Handlers //
        if ( (argument['action']==='save') | (argument['action']==='edit') ){
            
            // Select Entry //
            $planesTable.find('#'+argument['id']).find('.selectable').on('click',function(){
                $setUIValue.setValue({
                    selectPlane:{
                        publish: argument['id']   
                    }
                });
            });
            
            // Toggle Visibility //
            $planesTable.find('#'+argument['id']).find('.planeButton').on('click', function(){
                var value = undefined;
                ($planesTable.find('#'+argument['id']).find('.planeButton').hasClass('visible')) ? value = false : value = true;
                $setUIValue.setValue({
                    planeVisibility:{
                        value: value,
                        publish: {id:argument['id'], visible: value},
                        other: $planesTable.find('#'+argument['id'])
                    }
                });
            });
            
            // Parallel Planes //
            $planesTable.find('#'+argument['id']).find('.parallel').on('click', function(){
                var value = undefined;
                ($planesTable.find('#'+argument['id']).find('.parallel').hasClass('active')) ? value = false : value = true;
                $setUIValue.setValue({
                    planeParallel:{
                        value: value,
                        publish: {id:argument['id'], parallel: value},
                        other: $planesTable.find('#'+argument['id'])
                    }
                });
            });
            
            // Atom Interception //
            $planesTable.find('#'+argument['id']).find('.interception').on('click', function(){
                var value = undefined;
                ($planesTable.find('#'+argument['id']).find('.interception').hasClass('active')) ? value = false : value = true;
                $setUIValue.setValue({
                    planeInterception:{
                        value: value,
                        publish: {id:argument['id'], interception: value},
                        other: $planesTable.find('#'+argument['id'])
                    }
                });
            });
        }

        // Show Table if there are entries //
        if ($planesTable.find('tr').length > 0) $planesTable.show('slow');
        else $planesTable.hide('slow');  
    };
    pndTab.prototype.highlightDirectionEntry = function(argument){
        $directionTable.find('#'+argument['id']).removeAttr('class');
        $directionTable.find('#'+argument['id']).attr('class',argument['color']);  
    };
    pndTab.prototype.editDirection = function(argument){
        var parameters;
        
        // Parameters [,,,,] //
        if ( argument['t'] === undefined ) parameters = '['+argument['u']+','+argument['v']+','+argument['w']+']';
        else parameters = '['+argument['u']+','+argument['v']+','+argument['w']+','+argument['t']+']';
        
        // Add,Edit,Remove Entry //
        switch(argument['action']){
            case 'save':
                $directionTable.find('tbody').append('<tr id="'+ argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="directionButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                $directionTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;  

            case 'edit':
                $directionTable.find('#'+argument['oldId']).replaceWith('<tr id="'+argument['id']+'" class="bg-dark-gray"><td class="visibility"><a class="directionButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td class="selectable pnd-serial">'+parameters+'</td><td class="selectable pnd-name">'+argument['name']+'</td><td class="selectable pnd-color"><div class="color-picker color-picker-sm theme-02 bg-purple"><div class="color"></div></div></td></tr>');
                $directionTable.find('#'+argument['id']).find('.color').css('background',argument['color']);
                break;

            case 'delete':
                $directionTable.find('#'+argument['oldId']).remove();
                break;

        }
        
        // Handlers //
        if ( (argument['action']==='save') | (argument['action']==='edit') ){
            
            // Select Entry //
            $directionTable.find('#'+argument['id']).find('.selectable').on('click',function(){
                $setUIValue.setValue({
                    selectDirection:{
                        publish: argument['id']   
                    }
                });
            });
            
            // Toggle Visibility //
            $directionTable.find('#'+argument['id']).find('.directionButton').on('click', function(){
                var value = undefined;
                ($directionTable.find('#'+argument['id']).find('.directionButton').hasClass('visible')) ? value = false : value = true;
                $setUIValue.setValue({
                    directionVisibility:{
                        value: value,
                        publish: {id:argument['id'], visible: value},
                        other: $directionTable.find('#'+argument['id'])
                    }
                });
            });
        }

        // Show Table if there are entries //
        if ($directionTable.find('tr').length > 0) $directionTable.show('slow');
        else $directionTable.hide('slow'); 
    };
    pndTab.prototype.setPlaneEntryVisibility = function(argument){
        $disableUIElement.disableElement({
            entryVisibity:{
                value: argument.action,
                other: $planesTable.find('#'+argument['id']).find('.planeButton')
            }
        });
    };
    pndTab.prototype.setDirectionEntryVisibility = function(argument){
        $disableUIElement.disableElement({
            entryVisibity:{
                value: argument.action,
                other: $directionTable.find('#'+argument['id']).find('.directionButton')
            }
        });
    };
    
    return pndTab;
});