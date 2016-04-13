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
    /* This module handles the 3 dialog modals:
            - Error Modal
            - Information Modal
            - Warning Modal
                - It gaves the option to "freeze" any user interaction until he takes some action on the dialog window
                - It is called by passing the caller HTML element, and depending on the action that the user takes,
                  it triggers the caller's 'action' listener.
    */
    
    // Variables
    var argument = undefined;
    var $messageList = undefined;
    var $interface = undefined;
    var html = undefined;
    var pubEvent = 'menu.dialog_result';
    var steps = {
        1 : {
            element : 'tutorial_next',
            text    : 'THIS IS STEP 1',
            state   : true,
            next    : '2'
        },
        2 : {
            element : 'tutorial_close',
            text    : 'THIS IS STEP 1112312311',
            state   : false,
            next    : '3'
        },
        3 : {
            element : 'publicTab',
            text    : 'THANOS',
            state   : false,
            next    : 'last'
        },
        last : {
            element : 'notesTab',
            text    : 'FERNANDO FERNANDO FERNANDO FERNANDO FERNANDO',
            state   : false,
            next    : ''
        }
    };
    
    // Contructor //
    function userDialog(argument) {
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
        else return false;
        if (!(_.isUndefined(argument.interfaceResizer))) $interface = argument.interfaceResizer;
        else return false;
        if (!(_.isUndefined(argument.html))) html = argument.html;
        else return false;
        
        // Warning Modal Handlers //
        html.modals.dialog.warning.modal.caller = 'none';
        html.modals.dialog.warning.close.on('click',function(){
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            // Trigger Cancel Action //
            if (html.modals.dialog.warning.modal.caller !== 'none') html.modals.dialog.warning.modal.caller.trigger('actionFail');
            html.modals.dialog.warning.modal.caller = 'userDenied';
        });
        html.modals.dialog.warning.cancel.on('click',function(){
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            // Trigger Cancel Action //
            if (html.modals.dialog.warning.modal.caller !== 'none') html.modals.dialog.warning.modal.caller.trigger('actionFail');
            html.modals.dialog.warning.modal.caller = 'userDenied';
        });
        html.modals.dialog.warning.continue.on('click',function(){
            argument = {};
            argument.result = true;
            PubSub.publish(pubEvent, argument);
            // Trigger callback if any
            if (html.modals.dialog.warning.modal.caller !== 'none') {
                html.modals.dialog.warning.modal.caller.trigger('action');
                html.modals.dialog.warning.modal.caller = 'none';
            }
            html.modals.dialog.warning.modal.caller = 'userConfirmed';
        });
        html.modals.dialog.warning.modal.on('hide.bs.modal', function(){
            // If modal is hidden by system event, only reset callback
            if (html.modals.dialog.warning.modal.caller !== undefined){
                if ( (html.modals.dialog.warning.modal.caller === 'userConfirmed') || (html.modals.dialog.warning.modal.caller === 'userDenied') ){
                    html.modals.dialog.warning.modal.caller = 'none';
                    return true;
                }
                else {
                    html.modals.dialog.warning.modal.caller.trigger('actionFail');
                    html.modals.dialog.warning.modal.caller = 'none';
                    return true;
                }
            }
            // else publish failure
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            html.modals.dialog.warning.modal.caller = 'none';
        });
        
        // Info Modal Handlers //
        html.modals.dialog.tutorial.on('click',function(){
            start_tutorial(); 
        });
        html.modals.dialog.doNotShowAgain.on('click',function(){
            console.log('EDW KANEIS SAVE TA COOKIES');
        });
        
        // Tutorial Layout //
        html.tutorial.box.body.draggable({
            scroll: false,
            handle: '#tutorialHeader'
        });
        
        // Tutorial Handlers //
        html.tutorial.box.close.on('click', function(){
            finish_tutorial();
        });
        html.tutorial.box.next.on('click', function(){
            tutorial_next(); 
        });
        
        // Show info at startup //       <----------- AYTO TO TREXEIS MONO AN DEIS ME KAPOIO ELEGXO PWS YPARXOUN TA COOKIES
        this.showInfoDialog({ messageID: 4 });
        
    };
    
    function start_tutorial(){
        html.tutorial.box.body.show();
        tutorial_step('1');
    };
    
    function finish_tutorial(){
        html.tutorial.box.body.hide('slow');
        $interface.tutorialElementOff();
    };
    
    function tutorial_next(){
        var active = '';
        _.each(steps, function($parameter, k){
            if ($parameter.state === true) active = k;
        });
        if (active === 'last') finish_tutorial();
        else {
            steps[active].state = false;
            tutorial_step(steps[active].next);
        }
    };
    
    function tutorial_step(i){
        $interface.tutorialElementOff();
        html.tutorial.box.text.html(steps[i].text);
        steps[i].state = true;
        $interface.tutorialElementOn({ id: steps[i].element });
        if (i === 'last') html.tutorial.box.next.html('Finish');
    };
    
    userDialog.prototype.showWarningDialog = function(argument){
        var screen_height = jQuery(window).height();
        
        // Pick message source
        if (!(_.isUndefined(argument.messageID))) html.modals.dialog.warning.modal.find('#warningMessage').html($messageList.getMessage(argument.messageID));
        else if (!(_.isUndefined(argument.message))) html.modals.dialog.warning.modal.find('#warningMessage').html(argument.message);
        
        // Position Modal
        html.modals.dialog.warning.modal.modal('show').css('margin-top',(screen_height/2)-100);
        
        // Pass Caller
        if (!(_.isUndefined(argument.caller))) html.modals.dialog.warning.modal.caller = argument.caller;
    };
    userDialog.prototype.showInfoDialog = function(argument){
        if(argument.messageID === undefined){  
            var screen_height = jQuery(window).height();
            html.modals.dialog.warning.modal.find('#infoMessage').html(argument.message);
            html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-100);
        }
        else{ 
            var screen_height = jQuery(window).height();
            html.modals.dialog.info.find('#infoMessage').html($messageList.getMessage(argument.messageID));
            if (argument.messageID === 4) html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-250);
            else html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-100);
        } 
    };
    userDialog.prototype.showErrorDialog = function(argument){
        var screen_height = jQuery(window).height();
        html.modals.dialog.error.find('#errorLabel h2').html('Error '+argument.code);
        html.modals.dialog.error.find('#errorMessage').html($messageList.getMessage(argument.messageID));
        html.modals.dialog.error.modal('show').css('margin-top',(screen_height/2)-100);

    };
    userDialog.prototype.hideInfoDialog = function(){
        html.modals.dialog.info.modal('hide');
    };
    
    return userDialog;
});