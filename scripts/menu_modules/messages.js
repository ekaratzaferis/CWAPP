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
        4:'<p><b>CrystalWalk</b> is a crystal editor and visualizer software designed for teaching materials science and engineering. <br/><br/>Based in <b>WebGL/HTML5</b>, it provides an accessible and interactive platform to students, professors and researchers.<br/><br/><b>CrystalWalk</b> is an <i>open-source</i> project developed by <b>Fernando Bardella’s Nuclear Technology PhD research</b> at the <b>Nuclear Energy Research Institute (IPEN) / Brazilian National Nuclear Commission (CNEN) at University of São Paulo (USP)</b>.<br/><br/>You can find more information at the project page at crystalwalk.org or reach the author at <b>bardella@ipen.br</b> for any questions, comments or concerns. </p>',
        5:'You have to choose a Lattice before opening this tab',
        6:'xyz axes',
        7:'abc axes',
        8:'cell edges',
        9:'cell faces',
        10:'lattice points',
        11:'directions',
        12:'planes',
        13:'atoms',
        14:'atom radius',
        15:'unit cell viewport',
        16:'atom labels',
        17:'highlight overlapped atoms',
        18:'Choose a lattice',
        19:'Insert Integer',
        20:'Insert a number',
        21:'User Custom Defined',
        22:'Out of bounds value',
        23:'Press CTRL+C to copy the link',
        24:'Collision Detected',
        25:'800 x 600',
        26:'1024 x 768',
        27:'1366 x 768',
        28:'Insert Name',
        29:'Project is being saved to our Database. <br/><br/> This window will close automatically.',
        30:'Uploading File...',
        31:'Unknown Error. Try uploading the JSON file again.',
        32:'Swap between crystal and motif screen',
        33:'Frame Crystal',
        34:'Include QR Code',
        35:'Print Mode',
        cubic_primitive:'Cubic Simple',
        cubic_body_centered:'Cubic Body Centered',
        cubic_face_centered:'Cubic Face Centered',
        tetragonal_primitive:'Tetragonal Simple',
        tetragonal_body_centered:'Tetragonal Body Centered',
        orthorhombic_primitive:'Orthorhombic Simple',
        orthorhombic_body_centered:'Orthorhombic Body Centered',
        orthorhombic_face_centered:'Orthorhombic Face Centered',
        orthorhombic_base_centered:'Orthorhombic Base Centered',
        hexagonal_primitive:'Hexagonal',
        hexagonal:'Hexagonal Strange',
        rhombohedral_primitive:'Rhombohedral / Trigonal',
        monoclinic_primitive:'Monoclinic Simple',
        monoclinic_base_centered:'Monoclinic Base Centered',
        triclinic_primitive:'Triclinic Simple'
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