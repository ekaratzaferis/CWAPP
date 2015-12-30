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
    // Variables
    var argument = undefined;
    var $messageList = undefined;
    var $warningModal = jQuery('#warning_modal');
    var $infoModal = jQuery('#info_modal');
    var $errorModal = jQuery('#error_modal');
    var pubEvent = 'menu.dialog_result';
    
    // Warning Interface
    var $closeWarning = jQuery('#closeWarning');
    var $cancelWarning = jQuery('#cancelWarning');
    var $continueWarning = jQuery('#continueWarning');
    
    // Contructor //
    function userDialog(argument) {
        if (!(_.isUndefined(argument.messages))) $messageList = argument.messages;
        else return false;
        
        // Reset callback
        $warningModal.caller = 'none';
        $closeWarning.on('click',function(){
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            $warningModal.caller = 'userDenied';
        });
        $cancelWarning.on('click',function(){
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            $warningModal.caller = 'userDenied';
        });
        $continueWarning.on('click',function(){
            argument = {};
            argument.result = true;
            PubSub.publish(pubEvent, argument);
            // Trigger callback if any
            if ($warningModal.caller !== 'none') {
                $warningModal.caller.trigger('action');
                $warningModal.caller = 'none';
            }
            $warningModal.caller = 'userConfirmed';
        });
        $warningModal.on('hide.bs.modal', function(){
            // If modal is hidden by system event, only reset callback
            if ($warningModal.caller !== undefined){
                if ( ($warningModal.caller === 'userConfirmed') || ($warningModal.caller === 'userDenied') ){
                    $warningModal.caller = 'none';
                    return true;
                }
            }
            // else publish failure
            argument = {};
            argument.result = false;
            PubSub.publish(pubEvent, argument);
            $warningModal.caller = 'none';
        });
    };
    
    userDialog.prototype.showWarningDialog = function(argument){
        var screen_height = jQuery(window).height();
        
        // Pick message source
        if (!(_.isUndefined(argument.messageID))) $warningModal.find('#warningMessage').html($messageList.getMessage(argument.messageID));
        else if (!(_.isUndefined(argument.message))) $warningModal.find('#warningMessage').html(argument.message);
        
        // Position Modal
        $warningModal.modal('show').css('margin-top',(screen_height/2)-100);
        
        // Pass Caller
        if (!(_.isUndefined(argument.caller))) $warningModal.caller = argument.caller;
    };
    userDialog.prototype.showInfoDialog = function(argument){
        var screen_height = jQuery(window).height();
        $infoModal.find('#infoMessage').html($messageList.getMessage(argument.messageID));
        if (argument.messageID === 4) $infoModal.modal('show').css('margin-top',(screen_height/2)-250);
        else $infoModal.modal('show').css('margin-top',(screen_height/2)-100);
    };
    userDialog.prototype.showErrorDialog = function(argument){
        var screen_height = jQuery(window).height();
        $errorModal.find('#errorLabel h2').html('Error '+argument.code);
        $errorModal.find('#errorMessage').html($messageList.getMessage(argument.messageID));
        $errorModal.modal('show').css('margin-top',(screen_height/2)-100);
    };
    userDialog.prototype.hideInfoDialog = function(){
        $infoModal.modal('hide');
    };
    
    return userDialog;
});