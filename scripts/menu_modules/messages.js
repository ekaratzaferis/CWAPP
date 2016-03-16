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
        6:'Click to SHOW/HIDE ORTHOGONAL (XYZ) AXIS',
        7:'Click to SHOW/HIDE CRYSTALLOGRAPHIC (ABC) AXIS',
        8:'Click to SHOW/HIDE CELL EDGES',
        9:'Click to SHOW/HIDE CELL FACES',
        10:'Click to SHOW/HIDE BRAVAIS LATTICE POINTS',
        11:'Click to SHOW/HIDE CRYSTAL DIRECTIONS',
        12:'Click to SHOW/HIDE CRYSTAL PLANES',
        13:'Click to SHOW/HIDE ATOMS',
        14:'Click to SHOW/HIDE ATOM VOLUME KNOB',
        15:'Click to SHOW/HIDE UNITCELL VIEWPORT',
        16:'Click to SHOW/HIDE ATOM LABELS',
        17:'Click to SHOW/HIDE OVERLAPPED ATOMS',
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
        triclinic_primitive:'Triclinic Simple',
        controls_toggler: 'Hide / Unhide',
        latticeTab: 'Bravais Lattice Editor',
        motifLI: 'Motif Editor',
        visualTab: 'Visualization & Interaction',
        millerPI: 'Crystal Planes & Directions',
        notesTab: 'Comments & Narrative',
        publicTab: 'Import & Export',
        helpTab: 'About',
        selected_lattice: 'Click to choose a BRAVAIS LATTICE TYPE',
        latticePadlock: 'Click to disable BRAVAIS LATTICE RESTRICTIONS',
        repeatZ: 'Click to change BRAVAIS LATTICE REPETITION in X',
        repeatX: 'Click to change BRAVAIS LATTICE REPETITION in Y',
        repeatY: 'Click to change BRAVAIS LATTICE REPETITION in Z',
        scaleZ: 'Drag to change BRAVAIS LATTICE LENGTH in a',
        scaleX: 'Drag to change BRAVAIS LATTICE LENGTH in b',
        scaleY: 'Drag to change BRAVAIS LATTICE LENGTH in c',
        beta: 'Drag to change BRAVAIS LATTICE ANGLE in α',
        alpha: 'Drag to change BRAVAIS LATTICE ANGLE in β',
        gamma: 'Drag to change BRAVAIS LATTICE ANGLE in γ',
        motifPadlock: 'Click to disable AUTOPILOT RESTRICTIONS',
        latticePreview: 'Click to refresh LATTICE settings to Crystal structure',
        latticeAutoRefresh: 'Click to enable/disable automatic LATTICE settings refresh',
        cube_color_border: 'Click to pick a CELL EDGE COLOR',
        cube_color_filled: 'Click to pick a CELL FACE COLOR',
        radius: 'Drag to change CELL EDGE Radius',
        faceOpacity: 'Drag to change CELL FACE opacity',
        newPlanett:'Click to ADD a NEW PLANE',
        millerH:'Set PLANE COORDINATE for h',
        millerK:'Set PLANE COORDINATE for k',
        millerL:'Set PLANE COORDINATE for l',
        millerI:'Set PLANE COORDINATE for i',
        savePlane:'Click to SAVE selected PLANE SETTINGS',
        planeOpacity:'Drag to set PLANE OPACITY',
        planeColor:'Click to pick a PLANE COLOR',
        planeName:'Enter PLANE NAME',
        deletePlanett:'Click to DELETE selected PLANE',
        millerU: 'Set DIRECTION COORDINATE for u',
        millerV: 'Set DIRECTION COORDINATE for v',
        millerW: 'Set DIRECTION COORDINATE for w',
        millerT: 'Set DIRECTION COORDINATE for t',
        newDirectiontt: 'Click to ADD a NEW DIRECTION',
        saveDirection: 'Click to SAVE selected DIRECTION SETTINGS',
        dirRadius: 'Drag to set DIRECTION OPACITY',
        directionColor: 'Click to pick a DIRECTION COLOR',
        directionName: 'Enter DIRECTION NAME',
        deleteDirectiontt: 'Click to DELETE selected DIRECTION'
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