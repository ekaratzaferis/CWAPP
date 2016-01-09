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
    // This module contains a static reference to ALL HTML elements that are being used by this application. //
    // Add new element according to their visual position in the application. ex. new element on Public Library tab, goes to Library section. //
    
    // Contructor //
    function userDialog() {
        // Menu Ribbon //
        this.menu = {};
        this.menu.tabs = {
           'latticeTab':jQuery('#latticeTab'),
           'motifTab':jQuery('#motifLI'),
           'visualTab':jQuery('#visualTab'),
           'pndTab':jQuery('#millerPI'),
           'publicTab':jQuery('#publicTab'),
           'notesTab':jQuery('#notesTab'),
           'helpTab':jQuery('#helpTab')
        };
        this.menu.toggles = {
            'xyzAxes': jQuery('#xyzAxes'),
            'abcAxes': jQuery('#abcAxes'),
            'edges': jQuery('#edges'),
            'faces': jQuery('#faces'),
            'latticePoints': jQuery('#latticePoints'),
            'planes': jQuery('#planes'),
            'directions': jQuery('#directions'),
            'atomToggle': jQuery('#atomToggle'),
            'atomRadius': jQuery('#atomRadius'),
            'unitCellViewport': jQuery('#unitCellViewport'),
            'labelToggle': jQuery('#labelToggle'),
            'highlightTangency': jQuery('#highlightTangency')
        };
        this.menu.other = {
            atomRadiusSlider: jQuery('#atomRadiusSlider'),
            atomRadiusSliderContainer: jQuery('#atomRadiusSliderContainer')
        };
        
        // Lattice Tab //
        this.lattice = {};
        this.lattice.parameters = {
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
        this.lattice.sliders = {
            scaleX: jQuery('#scaleXSlider'),
            scaleY: jQuery('#scaleYSlider'),
            scaleZ: jQuery('#scaleZSlider'),
            alpha: jQuery('#alphaSlider'),
            beta: jQuery('#betaSlider'),
            gamma: jQuery('#gammaSlider')  
        };
        this.lattice.padlocks = {
            lattice: jQuery('#latticePadlock'),
            motif: jQuery('#motifPadlock')
        };
        this.lattice.visual = {
            edgeCheckbox: jQuery('[name=gridCheckButton]'),
            edgeColorPicker: jQuery('#cube_color_border'),
            radius: jQuery('#radius'),
            radiusSlider: jQuery('#radiusSlider'),
            faceCheckbox: jQuery('[name=faceCheckButton]'),
            faceColorPicker: jQuery('#cube_color_filled'),
            opacity: jQuery('#faceOpacity'),
            opacitySlider: jQuery('#faceOpacitySlider'),
        }
        this.lattice.other = {
            autoRefresh: jQuery('.autoRefresh'),
            refreshButtons: jQuery('.latticeButtons'),
            icheck: jQuery('input.icheckbox, input.iradio'),
            spinner: jQuery('.spinner'),
            tangency: jQuery('#tangency'),
            selected: jQuery('#selected_lattice')
        };
        
        // Motif Tab //
        this.motif = {};
        this.motif.latticeLabels = {
            'scaleX' : jQuery('#meLengthA'),
            'scaleY' : jQuery('#meLengthB'),
            'scaleZ' : jQuery('#meLengthC'),
            'alpha' : jQuery('#meAngleA'),
            'beta' : jQuery('#meAngleB'),
            'gamma' : jQuery('#meAngleG')
        };
        this.motif.actions = {
            preview: jQuery('.previewAtomChanges'),
            autoRefresh: jQuery('.autoRefresh'),
            save: jQuery('.saveAtomChanges'),
            delete: jQuery('#deleteAtom'),
            add: jQuery('#atomPalette')
        };
        this.motif.panel = {
            color: jQuery('#atomColor'),
            opacitySlider: jQuery('#atomOpacitySlider'),
            tangentR: jQuery('#tangentR'),
            tangency: jQuery('#tangency'),
            atomPositioningXYZ: jQuery('#atomPositioningXYZ'),
            atomPositioningABC: jQuery('#atomPositioningABC')
        };
        this.motif.other = {
            lockCameras: jQuery('#lockCameraIcon'),
            swapButton: jQuery('#swapBtn'),
            atomTable: jQuery('#atomTable'),
            cellVolume: jQuery('#cellVolume'),
            cellVolumeSlider: jQuery('#cellVolumeSlider'),
            name: jQuery('.element-symbol-container').find('a'),
            nameContainer: jQuery('.element-symbol-container')
        };
        this.motif.atomParameters = {
            atomOpacity: jQuery('#atomOpacity'),
            atomWireframe: jQuery('#atomWireframe'),
            atomTexture: jQuery('#atomTexture')
        };
        this.motif.motifInputs = {
            atomPosX : jQuery('#atomPosX'),
            atomPosY : jQuery('#atomPosY'), 
            atomPosZ : jQuery('#atomPosZ')
        };
        this.motif.motifInputsLabels = {
            xa : jQuery('label[for=txt_coordinates_x]'),
            yb : jQuery('label[for=txt_coordinates_y]'), 
            zc : jQuery('label[for=txt_coordinates_z]')
        };
        this.motif.motifInputsSliders = {
            atomPosX : jQuery('#atomPosXSlider'),
            atomPosY : jQuery('#atomPosYSlider'), 
            atomPosZ : jQuery('#atomPosZSlider')
        };
        this.motif.motifSliders = {
            atomPosX: jQuery('#atomPosXSlider'), 
            atomPosY: jQuery('#atomPosYSlider'), 
            atomPosZ: jQuery('#atomPosZSlider')
        };
        this.motif.rotatingAngles = {
            combo: {
                rotAngleTheta : jQuery('#rotAngleTheta'),
                rotAnglePhi : jQuery('#rotAnglePhi')
            },
            x: jQuery('#rotAngleX'),
            y: jQuery('#rotAngleY'),
            z: jQuery('#rotAngleZ'),
            section: jQuery('.tangent-properties-container')
        };
        
        // Visual Tab //
        this.visual = {};
        this.visual.fog = {
            checkbox: jQuery('input[name="fog"]'),
            density: jQuery('#fogDensity'),
            color : jQuery('#fogColor'),
            densitySlider: jQuery('#fogDensitySlider')
        };
        this.visual.parameters = {
            lights: jQuery('#lights'),
            ssao: jQuery('#ssao'),
            shadows: jQuery('#shadows'),
            distortionOn: jQuery('#distortionOn'),
            distortionOff: jQuery('#distortionOff'),
            anaglyph: jQuery('#anaglyph'),
            oculus: jQuery('#oculus'),
            sideBySide3D: jQuery('#3DsideBySide'),
            onTop3D: jQuery('#3DonTop'),
            fullScreen: jQuery('#fullScreen'),
            leapMotion: jQuery('#leapMotion'),
            crystalCamTargetOn: jQuery("#crystalCamTargetOn"),
            crystalCamTargetOff: jQuery("#crystalCamTargetOff")
        };
        this.visual.stereoscopic = {
            anaglyph: jQuery('#anaglyph'),
            oculus: jQuery('#oculus'),
            sideBySide3D: jQuery('#3DsideBySide'),
            onTop3D: jQuery('#3DonTop')
        };
        this.visual.parameters.renderizationMode = {
            realistic: jQuery('#realistic'),
            wireframe: jQuery('#wireframe'),
            toon: jQuery('#toon'),
            flat: jQuery('#flat')
        };
        this.visual.parameters.crystalMode = {
            crystalClassic: jQuery('#crystalClassic'),
            crystalSubstracted: jQuery('#crystalSubstracted'),
            crystalSolidVoid: jQuery('#crystalSolidVoid'),
            crystalGradeLimited: jQuery('#crystalGradeLimited')
        };
        this.visual.parameters.unitCellMode = {
            cellClassic: jQuery('#cellClassic'),
            cellSubstracted: jQuery('#cellSubstracted'),
            cellSolidVoid: jQuery('#cellSolidVoid'),
            cellGradeLimited: jQuery('#cellGradeLimited')
        };
        this.visual.sound = {
            sounds: jQuery('#sounds'),
            soundSlider: jQuery('#soundSlider')
        };
        this.visual.other = {
            reset: jQuery('#reset')
        };
        this.visual.tools = {};
        this.visual.tools.colorPickers = {
            crystalScreen : jQuery('#crystalScreenColor'),
            cellScreen : jQuery('#cellScreenColor'),
            motifXScreen : jQuery('#motifXScreenColor'),
            motifYScreen : jQuery('#motifYScreenColor'),
            motifZScreen : jQuery('#motifZScreenColor')
        };
        this.visual.tools.zoomOptions = {
            zoom70: jQuery('#zoom70'),   
            zoom80: jQuery('#zoom80'),   
            zoom90: jQuery('#zoom90'),   
            zoom100: jQuery('#zoom100'),
            autoZoom: jQuery('#autoZoom')
        };
        
        // PnD Tab //
        this.pnd = {}
        this.pnd.tables = {
            planes: jQuery('#planesTable'),
            directions: jQuery('#directionTable')
        }; 
        this.pnd.planeButtons = { 
            savePlane: jQuery('#savePlane'),
            deletePlane: jQuery('#deletePlane'),
            newPlane: jQuery('#newPlane'),
            parallelPlane: jQuery('#parallelPlane')
        };
        this.pnd.directionButtons = { 
            saveDirection: jQuery('#saveDirection'),
            deleteDirection: jQuery('#deleteDirection'),
            newDirection: jQuery('#newDirection')
        };
        this.pnd.planeParameters = {
            millerH: jQuery('#millerH'),
            millerK: jQuery('#millerK'),
            millerL: jQuery('#millerL'),
            millerI: jQuery('#millerI'),
            planeColor: jQuery('#planeColor'),
            planeOpacity: jQuery('#planeOpacity'),
            planeName: jQuery('#planeName')
        };
        this.pnd.directionParameters = {
            millerU: jQuery('#millerU'),
            millerV: jQuery('#millerV'),
            millerW: jQuery('#millerW'),
            millerT: jQuery('#millerT'),
            directionColor: jQuery('#directionColor'),
            directionName : jQuery('#directionName'),
            dirRadius : jQuery('#dirRadius')
        };
        this.pnd.other = {
            hexICoord: jQuery('#hexICoord'),
            hexTCoord: jQuery('#hexTCoord')
        };
        
        // Public Library Tab //
        this.library = {};
        this.library.stl = {
            lowRes: jQuery('#lowSTL'),
            mediumRes: jQuery('#mediumSTL'),
            highRes: jQuery('#highSTL'),
            target: jQuery('#stl_alternate_actions'),
            toggler: jQuery('.btn_alternate_stl_toggler')
        };
        this.library.png = {
            target: jQuery('#png_alternate_actions'),
            toggler: jQuery('.btn_alternate_png_toggler')
        };
        this.library.saveOnline = {
            target: jQuery('#cnt_alternate_actions'),
            toggler: jQuery('.btn_alternate_action_toggler'),
            link: jQuery('#saveOnlineLink'),
            selectLink: jQuery('#selectLink')
        };
        this.library.json = {
            export: jQuery('#exportJSON'),
            open: jQuery('#openJSON'),
            openDialog: jQuery('#openJSONInput')
        };
        this.library.project = {
            download: jQuery('#downloadProject'),
            name: jQuery('#projectName'),
            tags: jQuery('#projectTags'),
            description: jQuery('#projectDescription')
        };
        this.library.search = {
            results: jQuery('#searchResults'),
            preview: jQuery('#resultPreviewBig'),
            previewTitle: jQuery('#previewTitle h4'),
            previewDescription: jQuery('#previewDescription p'),
            previewTags: jQuery('#previewTags'),
            openPreview: jQuery('#openPreview'),
            openPreviewQR: jQuery('#openPreviewQR'),
            footer: jQuery('.footerLink')
        };
        
        // IAC //
        this.iac = {};
        this.iac.box = {
            body: jQuery('#iacBox'),
            title: jQuery('#iacLabel h2'),
            close: jQuery('#iacClose')
        };
        this.iac.buttons = {
            visibility: jQuery('#iacToggle'),
            doll: jQuery('#iacDoll'),
            color: jQuery('#iacColor'),
            notes: jQuery('#iacNotes'),
            sound: jQuery('#iacSound')
        }
        this.iac.other = {
            symbol: jQuery('#iacSymbol'),
            radius: jQuery('#radiusLabelValue'),
            radiusLabel: jQuery('#radiusLabel'),
            opacity: jQuery('#iacOpacity'),
            opacitySlider: jQuery('#iacOpacitySlider')
        };
        
        // Modals //
        this.modals = {};
        this.modals.dialog = {
            warning: {
                modal: jQuery('#warning_modal'),
                close: jQuery('#closeWarning'),
                cancel: jQuery('#cancelWarning'),
                continue: jQuery('#continueWarning')
            },
            info: jQuery('#info_modal'),
            error: jQuery('#error_modal')
        };
        this.modals.qr = {
            modal: jQuery('#openQR'),
            download: jQuery('#downloadQR'),
            image: jQuery('#QRImage'),
            link: jQuery('#saveOnlineLinkQR'),
            selectLink: jQuery('#selectLinkQR')
        };
        this.modals.periodicTable = {
            element: jQuery('.ch'),
            ionicValues: jQuery('.property-block'),
            ionicPreview: jQuery('#tempSelection').find('p'),
            footer: jQuery('.modal-pre-footer')
        };
        this.modals.lattice = {
            block: jQuery('.mh_bravais_lattice_block')
        };
        
        // Notes //
        this.notes = {};
        this.notes.actions = {
            new: jQuery('#newNote'),
            save: jQuery('#saveNote'),
            delete: jQuery('#deleteNote') 
        };
        this.notes.properties = {
            title: jQuery('#noteTitle'),
            color: jQuery('#noteColor'),
            opacity: jQuery('#noteOpacity')
        };
        this.notes.other = {
            body: jQuery('#noteBody'),
            table: jQuery('#notesTable')  
        };
        
        // Interface //
        this.interface = {};
        this.interface.canvas = {
            tooltip: jQuery('#canvasTooltip'),
            appLogo: jQuery('#appLogo'),
            unitCellRenderer: jQuery('#unitCellRenderer'),
            unitCellRendererMouse: jQuery('#unitCellRendererMouse'),
            atomRadiusSlider: jQuery('#atomRadiusSliderContainer'),
            xyz: {
                xLabel: jQuery('#xLabel'), 
                yLabel: jQuery('#yLabel'),  
                zLabel: jQuery('#zLabel')
            },
            abc: {
                aLabel: jQuery('#aLabel'), 
                bLabel: jQuery('#bLabel'),  
                cLabel: jQuery('#cLabel')
            }
        };
        this.interface.screen = {
            wrapper: jQuery('#screenWrapper'),
            appContainer: jQuery('#app-container'),
            body: jQuery('body'),
            bravaisModal: jQuery('#bravais_lattice_modal'),
            scrollBars: jQuery('.custom_scrollbar')
        };
        this.interface.sidebar = {
            toggler: jQuery('#controls_toggler'),
            menu: jQuery('#main_controls_container'),
            menuContainer: jQuery('.main-controls-container'),
            menuInner: jQuery('.main-controls-inner'),
            tabList: jQuery('.main-tab-nav-container')
        };
        this.interface.progress = {
            wrapper: jQuery('#progressBarWrapper'),
            bar: jQuery('#progressBar')
        };
    };
    
    return userDialog;
});