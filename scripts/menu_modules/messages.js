/*global define*/
'use strict';

// Dependecies

define([
    'jquery',
    'jquery-ui',
    'underscore'
], function(
    jQuery,
    jQuery_ui,
    _
) 
{
    // Messages
    var messageList = {
        1:'<p>You have unlocked the lattice restrictions. <br/><br/> From now on no autopilot nor lattice restrictions will be applied.</p>',
        2:'<p>You have unlocked the autopilot restrictions. <br/><br/>From now on atoms no longer behave as rigid spheres and you will be able to change lattice parameters within the restrictions of the lattice you have chosen.</p>',
        3:'<p>This functionality is CPU intensive and your computer may be unavailable for a few minutes. <br/><br/> Are you sure you want to continue?</p>',
        4:'<p><b>CrystalWalk</b> is a crystal editor and visualizer software designed for teaching materials science and engineering. <br/><br/>Based in <b>WebGL/HTML5</b>, it provides an accessible and interactive platform to students, professors and researchers.<br/><br/><b>CrystalWalk</b> is an <i>open-source</i> project developed by <b>Fernando Bardella’s Nuclear Technology PhD research</b> at the <b>Nuclear Energy Research Institute (IPEN) / Brazilian National Nuclear Commission (CNEN) at University of São Paulo (USP)</b>.<br/><br/>You can find more information at the project page at crystalwalk.org or reach the author at <b>bardella@ipen.br</b> for any questions, comments or concerns. </p>'
    };
    
    // Contructor //
    function messages() {
        
    };
    
    messages.prototype.getMessage = function(id){
        return messageList[id];
    };
    messages.prototype.setMessage = function(message){
        var newID = (Object.keys(messageList).length) + 1;
        messageList[newID] = message;
        return newID;
    };
    
    return messages;
});