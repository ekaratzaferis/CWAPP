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
    // Variables
    var target = undefined;
    var notes = {};
    
    // Module References
    var $setUIValue = undefined;
    var $tooltipGenerator = undefined;
    var $disableUIElement = undefined;
    var $menuRibbon = undefined;
    var $stringEditor = undefined;
    
    // Selectors //
    var $newNote = jQuery('#newNote');
    var $saveNote = jQuery('#saveNote');
    var $deleteNote = jQuery('#deleteNote');
    var $noteTitle = jQuery('#noteTitle');
    var $noteColor = jQuery('#noteColor');
    var $noteOpacity = jQuery('#noteOpacity');
    var $noteBody = jQuery('#noteBody');
    var $notesTable = jQuery('#notesTable');
    var $screen = jQuery('#screenWrapper');
    
    // Contructor //
    function notesTab(argument) {
        // Acquire Module References //
        if (!(_.isUndefined(argument.setUIValue))) $setUIValue = argument.setUIValue;
        else return false;
        if (!(_.isUndefined(argument.tooltipGenerator))) $tooltipGenerator = argument.tooltipGenerator;
        else return false;
        if (!(_.isUndefined(argument.disableUIElement))) $disableUIElement = argument.disableUIElement;
        else return false;
        if (!(_.isUndefined(argument.menuRibbon))) $menuRibbon = argument.menuRibbon;
        else return false;
        if (!(_.isUndefined(argument.stringEditor))) $stringEditor = argument.stringEditor;
        else return false;
        
        // Inputs //
        $noteOpacity.html('<option>0</option><option>2</option><option>4</option><option>6</option><option>8</option><option>10</option>');
        $noteOpacity.selectpicker();
        $noteOpacity.selectpicker('val','10');
        $noteOpacity.on('change',function(){
            $screen.find('#'+notes.activeEntry).css('-ms-filter','progid:DXImageTransform.Microsoft.Alpha(Opacity='+$stringEditor.multiply10($noteOpacity.val())+')');
            $screen.find('#'+notes.activeEntry).css('filter','alpha(opacity='+$stringEditor.multiply10($noteOpacity.val())+')');
            $screen.find('#'+notes.activeEntry).css('opacity',$stringEditor.divide10($noteOpacity.val()));
        });
        $noteColor.spectrum({
            color: "#ffffff",
            allowEmpty:true,
            chooseText: "Choose",
            cancelText: "Close",
            move: function(){
                $setUIValue.setValue({
                    noteColor:{
                        other: $noteColor,
                        value: '#'+$noteColor.spectrum('get').toHex()
                    }
                });
                $screen.find('#'+notes.activeEntry).css('background-color','#'+$noteColor.spectrum('get').toHex());
                $screen.find('#'+notes.activeEntry).find('.notes').css('background-color','#'+$noteColor.spectrum('get').toHex());
            },
            change: function(){
                $setUIValue.setValue({
                    noteColor:{
                        other: $noteColor,
                        value: '#'+$noteColor.spectrum('get').toHex()
                    }
                });
                $screen.find('#'+notes.activeEntry).css('background-color','#'+$noteColor.spectrum('get').toHex());
                $screen.find('#'+notes.activeEntry).find('.notes').css('background-color','#'+$noteColor.spectrum('get').toHex());
            }
        });
        $disableUIElement.disableElement({
            noteTitle:{
                value: true    
            },
            noteBody:{
                value: true    
            },
            noteOpacity:{
                value: true    
            },
            noteColor:{
                value: true    
            }
        });
        $notesTable.hide('slow');
        
        // Buttons //
        $newNote.on('click',function(){
            highlightNote(notes.activeEntry,false);
            highlightNote(addNote(),true);
            $disableUIElement.disableElement({
                noteTitle:{
                    value: false    
                },
                noteBody:{
                    value: false    
                },
                noteOpacity:{
                    value: false    
                },
                noteColor:{
                    value: false 
                },
                newNote:{
                    value: true   
                },
                saveNote:{
                    value: false   
                },
                deleteNote:{
                    value: false   
                }
            });
        });
        $saveNote.on('click',function(){
            editNote({
                title: $noteTitle.val(),
                body: $noteBody.val(),
                color: '#'+$noteColor.spectrum('get').toHex(),
                opacity: $noteOpacity.val()
            });
            $disableUIElement.disableElement({
                noteTitle:{
                    value: true    
                },
                noteBody:{
                    value: true    
                },
                noteOpacity:{
                    value: true    
                },
                noteColor:{
                    value: true 
                },
                newNote:{
                    value: false   
                },
                saveNote:{
                    value: true   
                },
                deleteNote:{
                    value: true   
                }
            });
        });
        $deleteNote.on('click',function(){
            deleteNote();
            $disableUIElement.disableElement({
                noteTitle:{
                    value: true    
                },
                noteBody:{
                    value: true    
                },
                noteOpacity:{
                    value: true    
                },
                noteColor:{
                    value: true 
                },
                newNote:{
                    value: false   
                },
                saveNote:{
                    value: true   
                },
                deleteNote:{
                    value: true   
                }
            });
        });        
    };
    
    function addNote(newID){
        var id = undefined;
        
        // Add Note //
        if (_.isUndefined(newID)) id = 'note'+Object.keys(notes).length;
        else id = newID;
        $notesTable.find('tbody').append('<tr id="'+id+'" class="bg-dark-gray"><td colspan="1" class="visibility"><a class="noteButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td colspan="4" class="selectable note-name">Untitled Note</td></tr>');
        $notesTable.show('slow');
        
        // Create Database Entry //
        notes[id] = {
            title: '',
            body: '',
            color: '',
            opacity: ''
        };
        createCanvasNote(id);
        
        // Handlers //
        $notesTable.find('#'+id).find('.selectable').on('click',function(){
            selectNote(id);
        });
        $notesTable.find('#'+id).find('.noteButton').on('click', function(){
            var value = undefined;
            ($notesTable.find('#'+id).find('.noteButton').hasClass('visible')) ? value = false : value = true;
            $setUIValue.setValue({
                noteVisibility:{
                    value: value,
                    other: $notesTable.find('#'+id)
                }
            });
            showCanvasNote(id,value);
        });
        $setUIValue.setValue({
            noteVisibility:{
                value: false,
                other: $notesTable.find('#'+id)
            }
        });

        return id;
    };
    function editNote(note){
        // Update Database //
        if (notes.activeEntry !== false) notes[notes.activeEntry] = note;
        else return false;
        
        // Update Entry //
        if (note.title !== '') {
            $notesTable.find('#'+notes.activeEntry).find('.note-name').html(note.title);
            $screen.find('#'+notes.activeEntry).find('.noteTitle').html(note.title);
        }
        if (note.body !== '') $screen.find('#'+notes.activeEntry).find('.notes').html(note.body);
        highlightNote(notes.activeEntry,false);
        
        // Clear Forms
        $noteTitle.val('');
        $noteBody.val('');
        $noteOpacity.selectpicker('val','10');
        $noteColor.children().css('background','transparent');
    };
    function deleteNote(){
        // Update Database //
        if (notes.activeEntry !== false) notes[notes.activeEntry] = '';
        else return false;
        
        // Remove Entry //
        $notesTable.find('#'+notes.activeEntry).remove();
        deleteCanvasNote(notes.activeEntry);
        highlightNote('',false);
        
        // Clear Forms
        $noteTitle.val('');
        $noteBody.val('');
        $noteOpacity.selectpicker('val','10');
        $noteColor.children().css('background','transparent');
    };
    function selectNote(id){
        highlightNote(notes.activeEntry,false);
        $noteTitle.val(notes[id].title);
        $noteBody.val(notes[id].body);
        $noteColor.spectrum('set',notes[id].color);
        $noteOpacity.selectpicker('val',notes[id].opacity);
        highlightNote(id,true);
        $disableUIElement.disableElement({
            noteTitle:{
                value: false    
            },
            noteBody:{
                value: false    
            },
            noteOpacity:{
                value: false    
            },
            noteColor:{
                value: false 
            },
            newNote:{
                value: true   
            },
            saveNote:{
                value: false   
            },
            deleteNote:{
                value: false   
            }
        });
    };
    function highlightNote(id,state){
        var color = (state) ? 'bg-light-purple' : 'bg-dark-gray';
        $notesTable.find('#'+id).removeAttr('class');
        $notesTable.find('#'+id).attr('class',color);
        if (state === true) notes.activeEntry = id;
        else notes.activeEntry = false;
    };
    function showCanvasNote(id,value){
        if (value === true) $screen.find('#'+id).show('slow');
        else $screen.find('#'+id).hide('slow');
    };
    function createCanvasNote(id){
        $screen.prepend('<div id="'+id+'" class="noteWrapper"><div class="noteBar"><img src="Images/close.png" /><div class="noteTitle">Notes</div></div><div class="wordwrap notes">'+notes[id].body+'</div></div>');
        var notepad = $screen.find('#'+id);
        notepad.hide();
        notepad.draggable({
            scroll: false
        });
        notepad.find('img').on('click',function(){
            showCanvasNote(id,false);
            $setUIValue.setValue({
                noteVisibility:{
                    value: false,
                    other: $notesTable.find('#'+id)
                }
            });
        });  
    };
    function deleteCanvasNote(id){
        $screen.find('#'+id).remove();
    };
    
    notesTab.prototype.moveToNote = function(id){
        $menuRibbon.switchTab('notesTab');
        if (_.isUndefined(notes[id])) {
            highlightNote(notes.activeEntry,false);
            highlightNote(addNote(id),true);
            $disableUIElement.disableElement({
                noteTitle:{
                    value: false    
                },
                noteBody:{
                    value: false    
                },
                noteOpacity:{
                    value: false    
                },
                noteColor:{
                    value: false 
                },
                newNote:{
                    value: true   
                },
                saveNote:{
                    value: false   
                },
                deleteNote:{
                    value: false   
                }
            });
        }
        else selectNote(id);
    };
    
    return notesTab;
});