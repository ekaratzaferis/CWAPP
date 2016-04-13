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
        4:'<p>CrystalWalk is a crystal editor and visualizer software designed for teaching materials science and engineering. Based in WebGL/HTML5, it provides an accessible and interactive platform to students, professors and researchers.</p><br><p>CrystalWalk is an open-source project developed by Fernando Bardella’s Nuclear Technology PhD research at the Nuclear Energy Research Institute (IPEN) / Brazilian National Nuclear Commission (CNEN) at University of São Paulo (USP).</p><br> <p>A series of tutorials on how to create and explore crystal structures is accessible at CrystalWalk’s Instructable Channel at <a href="http://www.instructables.com/id/CrystalWalk-Collection/" target="_blank">http://www.instructables.com/id/CrystalWalk-Collection/</a> If this is your first time using CrystalWalk, you can access its Interactive Step-By-Step Tutorial by clicking on the button below.</p><br><p style = "display:inline">You can also find more information at CrystalWalk project’s page at crystalwalk.org, or reach the author at <a href="mailto:bardella@ipen.br" target="_blank">bardella@ipen.br</a> for any questions, comments or concerns. </p>',
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
        99:'Click to SET FULL SCREEN MODE',
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
        36 : '<strong>Downloading File: Pending... <br> Packing Files: Pending...</strong> <br><br> CrystalWalk standalone mode requires <a href="https://www.w3.org/TR/html5/browsers.html#origin" target="_blank">same origin policy</a> and local files access to properly execute in your computer. From one side you will no longer need internet access, but it may require some special permission on your browser to run it properly. We’ve put some scripts to facilitate on this process to you, but please refer to this <a href="https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally" target="_blank">link</a> or the <a href="link: http://www.instructables.com/id/CrystalWalk-Collection/" target="_blank">CrystalWalk instructable</a> channel for more information. ',
        37 : '<strong>Downloading File: Failed <br> Packing Files: Failed...</strong> <br><br> CrystalWalk standalone mode requires <a href="https://www.w3.org/TR/html5/browsers.html#origin" target="_blank">same origin policy</a> and local files access to properly execute in your computer. From one side you will no longer need internet access, but it may require some special permission on your browser to run it properly. We’ve put some scripts to facilitate on this process to you, but please refer to this <a href="https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally" target="_blank">link</a> or the <a href="link: http://www.instructables.com/id/CrystalWalk-Collection/" target="_blank">CrystalWalk instructable</a> channel for more information. ',
        38 : '<strong>Downloading File: OK <br> Packing Files: Pending...</strong> <br><br> CrystalWalk standalone mode requires <a href="https://www.w3.org/TR/html5/browsers.html#origin" target="_blank">same origin policy</a> and local files access to properly execute in your computer. From one side you will no longer need internet access, but it may require some special permission on your browser to run it properly. We’ve put some scripts to facilitate on this process to you, but please refer to this <a href="https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally" target="_blank">link</a> or the <a href="link: http://www.instructables.com/id/CrystalWalk-Collection/" target="_blank">CrystalWalk instructable</a> channel for more information. ',
        39 : '<strong>Downloading File: OK <br> Packing Files: OK</strong> <br><br> CrystalWalk standalone mode requires <a href="https://www.w3.org/TR/html5/browsers.html#origin" target="_blank">same origin policy</a> and local files access to properly execute in your computer. From one side you will no longer need internet access, but it may require some special permission on your browser to run it properly. We’ve put some scripts to facilitate on this process to you, but please refer to this <a href="https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally" target="_blank">link</a> or the <a href="link: http://www.instructables.com/id/CrystalWalk-Collection/" target="_blank">CrystalWalk instructable</a> channel for more information. ',
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
        deleteDirectiontt: 'Click to DELETE selected DIRECTION',
        atomPalettett: 'Click to ADD a NEW ATOM to your MOTIF',
        tangency: 'Click to ENABLE/DISABLE ATOMS to OVERLAPP',
        atomPositioningXYZ: 'Use ABSOLUT coordinates to position selected ATOM in the MOTIF composition. Coordinates are given in Å relative to the CRYSTALLOGRAPHIC (ABC) AXIS',
        atomPositioningABC: 'Use VECTORIAL coordinates to position selected ATOM in the MOTIF composition. Coordinates are given in fractions relative to both the BRAVAIS LATTICE (abc) and CRYSTALLOGRAPHIC (ABC) AXIS. For this reason, no automatic LATTICE adjustment is allowed once this options is enabled',
        atomPosZ: 'Set ATOM POSITION in *** a or x **** the MOTIF composition. *** Coordinates are given in Å relative to the CRYSTALLOGRAPHIC (ABC) AXIS *** OR *** Coordinates are given in fractions relative to both the BRAVAIS LATTICE (abc) and CRYSTALLOGRAPHIC (ABC) AXIS***',
        atomPosZSlider: 'Drag to set ATOM POSITION in *** a or x **** the MOTIF composition. *** Coordinates are given in Å relative to the CRYSTALLOGRAPHIC (ABC) AXIS *** OR *** Coordinates are given in fractions relative to both the BRAVAIS LATTICE (abc) and CRYSTALLOGRAPHIC (ABC) AXIS***',
        atomPosX: 'Set ATOM POSITION in *** b or y **** the MOTIF composition. *** Coordinates are given in Å relative to the CRYSTALLOGRAPHIC (ABC) AXIS *** OR *** Coordinates are given in fractions relative to both the BRAVAIS LATTICE (abc) and CRYSTALLOGRAPHIC (ABC) AXIS***',
        atomPosXSlider: 'Drag to set ATOM POSITION in *** b or y **** the MOTIF composition. *** Coordinates are given in Å relative to the CRYSTALLOGRAPHIC (ABC) AXIS *** OR *** Coordinates are given in fractions relative to both the BRAVAIS LATTICE (abc) and CRYSTALLOGRAPHIC (ABC) AXIS***',
        atomPosY: 'Set ATOM POSITION in *** z or c **** the MOTIF composition. *** Coordinates are given in Å relative to the CRYSTALLOGRAPHIC (ABC) AXIS *** OR *** Coordinates are given in fractions relative to both the BRAVAIS LATTICE (abc) and CRYSTALLOGRAPHIC (ABC) AXIS***',
        atomPosYSlider: 'Drag to set ATOM POSITION in *** z or c **** the MOTIF composition. *** Coordinates are given in Å relative to the CRYSTALLOGRAPHIC (ABC) AXIS *** OR *** Coordinates are given in fractions relative to both the BRAVAIS LATTICE (abc) and CRYSTALLOGRAPHIC (ABC) AXIS***',
        atomColor: "Click to pick a MOTIF'S ATOM COLOR",
        atomOpacity: "Click to set a MOTIF'S ATOM OPACITY",
        cellVolume: 'Set BRAVAIS LATTICE LENGTH in both a,b and c uniformly',
        cellVolumeSlider: 'Drag to scale BRAVAIS LATTICE LENGTH in both a,b and c uniformly',
        meLengthA: 'Drag to change BRAVAIS LATTICE LENGTH in a',
        meLengthB: 'Drag to change BRAVAIS LATTICE LENGTH in b',
        meLengthC: 'Drag to change BRAVAIS LATTICE LENGTH in c',
        meAngleA: 'Drag to change BRAVAIS LATTICE ANGLE in α',
        meAngleB: 'Drag to change BRAVAIS LATTICE ANGLE in β',
        meAngleG: 'Drag to change BRAVAIS LATTICE ANGLE in γ',
        wireframe: 'Click to Set 3D RENDERING MODE to WIREFRAME',
        toon: 'Click to Set 3D RENDERING MODE to DRAW',
        flat: 'Click to Set RENDERING MODE to UNLIT',
        realistic: 'Click to Set RENDERING MODE to FULL LIT',
        distortionOn: 'Click to Set PERSPECTIVE MODE to CONICAL',
        distortionOff: '',
        anaglyph: 'Click to Set CRYSTAL STEREOSCOPIC MODE to ANAGLYPH',
        oculus: 'Click to Set CRYSTAL STEREOSCOPIC MODE to HMD/OCULUS RIFT',
        '3DsideBySide': 'Click to Set CRYSTAL STEREOSCOPIC MODE to 3D MONITOR (SIDE-BY-SIDE)',
        '3DonTop': 'Click to Set CRYSTAL STEREOSCOPIC MODE to 3D MONITOR (OVER-UNDER)',
        anaglyphCell: 'Click to Set UNIT CELL STEREOSCOPIC MODE to ANAGLYPH',
        oculusCell: 'Click to Set UNIT CELL STEREOSCOPIC MODE to HMD/OCULUS RIFT',
        '3DsideBySideCell': 'Click to Set UNIT CELL STEREOSCOPIC MODE to 3D MONITOR (SIDE-BY-SIDE)',
        '3DonTopCell': 'Click to Set UNIT CELL STEREOSCOPIC MODE to 3D MONITOR (OVER-UNDER)',
        crystalCamTargetOff: 'Click to Set FOCAL POINT to the CENTER OF CRYSTAL',
        crystalCamTargetOn: 'Click to Set FOCAL POINT to the CENTER OF XYZ AXYS',
        leapMotion: 'Click to ENABLE/DISABLE LEAP MOTION INTERFACE',
        crystalClassic: 'Click to Set CRYSTAL MODEL REPRESENTATION to CONSTRUCTIVE CELL',
        crystalSubstracted: 'Click to Set CRYSTAL MODEL REPRESENTATION to CROPPED CELL',
        crystalSolidVoid: 'Click to Set CRYSTAL MODEL REPRESENTATION to EMPTY SPACE',
        crystalGradeLimited: 'Click to Set CRYSTAL MODEL REPRESENTATION to SYMMETRIC CELL',
        cellClassic: 'Click to Set UNIT CELL MODEL REPRESENTATION to CONSTRUCTIVE CELL',
        cellSubstracted: 'Click to Set UNIT CELL MODEL REPRESENTATION to CROPPED CELL',
        cellSolidVoid: 'Click to Set UNIT CELL MODEL REPRESENTATION to EMPTY SPACE',
        cellGradeLimited: 'Click to Set UNIT CELL MODEL REPRESENTATION to SYMMETRIC CELL',
        fogColor: 'Click to Pick SPATIAL FOG COLOR',
        fogDensity: 'SET SPATIAL FOG DENSITY',
        fogDensitySlider: 'Drag to SET SPATIAL FOG DENSITY',
        sounds: 'Click to ENABLE/DISABLE SPATIAL SOUND',
        crystalScreenColor: 'Click to Pick CRYSTAL SCREEN CANVAS COLOR',
        cellScreenColor: 'Click to Pick UNIT CELL SCREEN CANVAS COLOR',
        motifXScreenColor: 'Click to Pick MOTIFF EDITOR X SCREEN CANVAS COLOR',
        motifYScreenColor: 'Click to Pick MOTIFF EDITOR Y SCREEN CANVAS COLOR',
        motifZScreenColor: 'Click to Pick MOTIFF EDITOR Z SCREEN CANVAS COLOR',
        autoRenderizationQuality: 'Click to AUTOMATICALLY adjusts RENDERING PRESETS to based on available graphical and computing resources ',
        lowRenderizationQuality: 'Click to Adjust RENDERING PRESETS to LOW graphical and computing resources. LOD:2 SSAO:OFF SHADOWS:OFF ANTIALISING:OFF',
        mediumRenderizationQuality: 'Click to Adjust RENDERING PRESETS to MEDIGUM graphical and computing resources. LOD:3 SSAO:ON SHADOWS:OFF ANTIALISING:ON',
        highRenderizationQuality: 'Click to Adjust RENDERING PRESETS to MEDIGUM graphical and computing resources. LOD:4 SSAO:ON SHADOWS:ON ANTIALISING:ON',
        lodSlider: "Click to set 3D OBJECTS LEVEL OF DETAIL, increasing or decreasing VOXEL VOLUME by recursively subdividing OCTREE'S BASED 3D GEOMETRY to the N Level",
        lights: 'Click to ENABLE/DISABLE DIRECTIONAL LIGHT',
        ssao: 'Click to ENABLE/DISABLE SSAO',
        shadows: 'Click to ENABLE/DISABLE AMBIENT LIGHT',
        newNotett: 'Click to Add a NEW COMMENT OR NARRATIVE',
        noteTitle: 'Enter COMMENT & NARRATIVE TITLE',
        noteColor: 'Click to PICK COMMENT & NARRATIVE COLOR',
        noteOpacity: 'Click to SET COMMENT & NARRATIVE OPACITY',
        noteBody: 'Enter COMMENT & NARRATIVE',
        saveNote: 'Click to SAVE COMMENT & NARRATIVE',
        deleteNotett: 'Click to DELETE SELECTED COMMENT & NARRATIVE',
        downloadProject: 'Click to DOWNLOAD a .ZIP file with a standalone version of your model',
        exportJSON: 'Click to DOWNLOAD a .json data file with all the data of your project',
        saveOnlinett: 'Click to SAVE your project settings ONLINE. You will be provided an URL after this action',
        snapshotTT: 'Click to SAVE a snapshot of your project in the PNG format',
        stlTT: 'Click to EXPORT your 3D GEOMETRY in the STL format',
        searchQuery: 'Enter any keywords to search online database records',
        openJSON: 'Click to UPLOAD and IMPORT saved CrystalWalk Project data',
        cellEdge: 'Click to SHOW/HIDE CELL EDGES',
        cellFace: 'Click to SHOW/HIDE CELL FACES',
        subPlaneHex: 'MILLER-BRAVAIS INDICES OF A PLANE IN A HEXAGONAL SYSTEM - (hkil) COORIDNATES',
        subDirectionHex: 'MILLER-BRAVAIS INDICES OF A DIRECTION IN A HEXAGONAL SYSTEM - [uvtw] COORIDNATES',
        planeVisibility: 'Click to SHOW/HIDE selected PLANE',
        directionVisibility: 'Click to SHOW/HIDE selected DIRECTION',
        planeParallel: 'Click to SHOW/HIDE FAMILY OF PARALLEL PLANES',
        motifEdge: "Click to SHOW/HIDE MOTIF'S CELL EDGES",
        motifAuto: "Click to implement MOTIF'S ATOM UNIT CELL changes in the whole CRYSTAL",
        planeInterception: 'Click to SHOW/HIDE PLANE INTERCEPTED ATOMS',
        elementSymbolContainer: "Click to CHANGE selected MOTIF'S ATOM CHEMICAL ELEMENT or ION",
        atomVisibility: "Click to SHOW/HIDE selected MOTIF'S ATOM",
        saveAtomChanges: "Click to SAVE selected MOTIF'S ATOM settings and implement changes in the whole CRYSTAL",
        lockCameraIcon: "Click to ENABLE/DISABLE SYNCING UNIT CELL / CRYSTAL CAMERAS",
        atomTangent: "Click to enable TANGENT MODE and set selected MOTIF'S ATOM POSITION relative to the ABOVE. Coordinates are given in θ, φ and r relative to spheric coordinates.",
        rotAngleSection: "Enter  θ, φ and r relative to the ABOVE MOTIF'S ATOM POSITION spheric coordinates.",
        cameraCheckbox: "Click to SAVE CAMERA POSITION",
        reset: "Click to RESET THE CRYSTALWALK APPLICATION",
        printMode: "Click to SET PRINT MODE PRESET",
        screenMode: "Click to SET SCREEN MODE PRESET",
        swapBtn: "CLICK TO SWITCH BETWEEN UNIT CELL AND MOTIF VIEWS",
        oculusTracker: "CLICK TO ENABLE/DISABLE OCULUS RIFT MOTION TRACKER",
        cardboard: "CLICK TO ENABLE/DISABLE CARDBOARD VIEW AND TRACKERS"
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