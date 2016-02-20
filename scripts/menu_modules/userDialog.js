/*global define*/
'use strict';

// Dependecies

define([
    'pubsub',
    'underscore'
], function(
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
    var html = undefined;
    var pubEvent = 'menu.dialog_result';
    
    // Contructor //
    function userDialog(argument) {
        // Acquire Module References
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
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
        var screen_height = jQuery(window).height();
        html.modals.dialog.info.find('#infoMessage').html($messageList.getMessage(argument.messageID));
        if (argument.messageID === 4) html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-250);
        else html.modals.dialog.info.modal('show').css('margin-top',(screen_height/2)-100);
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