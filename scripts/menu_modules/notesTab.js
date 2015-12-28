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
    var idCounter = 0;
    
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
                        publish: { id: notes.activeEntry, color: '#'+$noteColor.spectrum('get').toHex() },
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
                        publish: { id: notes.activeEntry, color: '#'+$noteColor.spectrum('get').toHex() },
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
            if (!($newNote.hasClass('disabled'))){
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
            }
        });
        $saveNote.on('click',function(){
            if (!($saveNote.hasClass('disabled'))){
                editNote({
                    title: $noteTitle.val(),
                    body: $noteBody.val(),
                    color: '#'+$noteColor.spectrum('get').toHex(),
                    opacity: $noteOpacity.val(),
                    atomNote: notes[notes.activeEntry].atomNote,
                    x: notes[notes.activeEntry].x,
                    y: notes[notes.activeEntry].y
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
            }
        });
        $deleteNote.on('click',function(){
            if (!($deleteNote.hasClass('disabled'))){
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
            }
        });
        
        // Reset //
        $notesTable.on('reset', function(){
             $notesTable.find('tbody').html('');
        });
    };
    
    function addNote(newID){
        var id = undefined;
        var atomNote = false;
        
        // Clear Forms
        $noteTitle.val('');
        $noteBody.val('');
        $noteOpacity.selectpicker('val','10');
        $noteColor.children().css('background','transparent');
        
        // Add Note //
        if (_.isUndefined(newID)) {
            id = 'note'+idCounter;
            idCounter++;
        }
        else {
            atomNote = true;
            id = newID;
        }
        $notesTable.find('tbody').append('<tr id="'+id+'" class="bg-dark-gray"><td colspan="1" class="visibility"><a class="noteButton visible"><img src="Images/visible-icon-sm.png" class="img-responsive" alt=""/></a></td><td colspan="4" class="selectable note-name">Untitled Note</td></tr>');
        $notesTable.show('slow');
        
        // Create Database Entry //
        notes[id] = {
            title: '',
            body: '',
            color: '#FFFFFF',
            opacity: '',
            atomNote: atomNote,
            x: 0,
            y: 0
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
            if (notes[id].atomNote === true) {
                var x = parseInt($screen.find('#'+id).css('left'),10) + parseInt($screen.find('#'+id).css('width'),10) / 2;
                var y = parseInt($screen.find('#'+id).css('top'),10) + parseInt($screen.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: value, x: x, y: y, color: notes[id].color}
                    }
                });
            }
            showCanvasNote(id,value);
        });
        $notesTable.find('#'+id).on('hide',function(){
            if(_.isUndefined(notes[id].temp)) return false;
            else{
                if (notes[id].temp === true){
                    // UI //
                    $setUIValue.setValue({
                        noteVisibility:{
                            value: false,
                            other: $notesTable.find('#'+id)
                        }
                    });
                    showCanvasNote(id.toString(),false);
                    notes[id].temp = undefined;
                    
                    // System //
                    var x = parseInt($screen.find('#'+id).css('left'),10) + parseInt($screen.find('#'+id).css('width'),10) / 2;
                    var y = parseInt($screen.find('#'+id).css('top'),10) + parseInt($screen.find('#'+id).css('height'),10) / 2;
                    notes[id].x = x;
                    notes[id].y = y;
                    $setUIValue.setValue({
                        noteVisibility:{
                            publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                        }
                    });
                }
            }
        });
        $setUIValue.setValue({
            noteVisibility:{
                value: false,
                other: $notesTable.find('#'+id)
            }
        });
        
        if (atomNote === true) $setUIValue.setValue({
            atomNoteTable: { 
                publish: {
                    id: id,
                    add: true
                }          
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
        if (notes.activeEntry !== false) {
            if (notes[notes.activeEntry].atomNote === true) {
                delete notes[notes.activeEntry];
                $setUIValue.setValue({
                    atomNoteTable: { 
                        publish: {
                            id: notes.activeEntry,
                            add: false
                        }          
                    }  
                });
            }
            else delete notes[notes.activeEntry];
        }
        else return false;
        
        // Remove Entry //
        $notesTable.find('#'+notes.activeEntry).remove();
        deleteCanvasNote(notes.activeEntry);
        highlightNote('q',false);
        
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
        if (notes[id].color !== '') $noteColor.spectrum('set',notes[id].color);
        if (notes[id].opacity !== '') $noteOpacity.selectpicker('val',notes[id].opacity);
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
            scroll: false,
            drag: function(event, ui){
                if (notes[id].atomNote === true){
                    var x = parseInt(ui.position.left) + parseInt($screen.find('#'+id).css('width'),10) / 2;
                    var y = parseInt(ui.position.top) + parseInt($screen.find('#'+id).css('height'),10) / 2;
                    notes[id].x = x;
                    notes[id].y = y;
                    $setUIValue.setValue({
                        noteMovement:{
                            publish: { id: id, x: x, y: y }   
                        }
                    });
                }
            },
            containment: jQuery('#app-container')
        });
        notepad.find('img').on('click',function(){
            showCanvasNote(id,false);
            $setUIValue.setValue({
                noteVisibility:{
                    value: false,
                    other: $notesTable.find('#'+id)
                }
            });
            if (notes[id].atomNote === true) {
                var x = parseInt($screen.find('#'+id).css('left'),10) + parseInt($screen.find('#'+id).css('width'),10) / 2;
                var y = parseInt($screen.find('#'+id).css('top'),10) + parseInt($screen.find('#'+id).css('height'),10) / 2;
                notes[id].x = x;
                notes[id].y = y;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: false, x: x, y: y, color: notes[id].color}
                    }
                });
            }
        });  
    };
    function deleteCanvasNote(id){
        $screen.find('#'+id).remove();
    };
    function getAtomNoteTable(){
        var table = [];
        _.each(notes, function($parameter,k){
            if ($parameter.atomNote === true) {
                var x = parseInt($screen.find('#'+k).css('left'),10) + parseInt($screen.find('#'+k).css('width'),10) / 2;
                var y = parseInt($screen.find('#'+k).css('top'),10) + parseInt($screen.find('#'+k).css('height'),10) / 2;
                notes[k].x = x;
                notes[k].y = y;
                table.push({
                    id: k,
                    x: x,
                    y: y
                });
            }
        });
        return table;
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
    notesTab.prototype.getAtomNoteTable = function(){
        return getAtomNoteTable();  
    };
    notesTab.prototype.focusNote = function(id){
        if(_.isUndefined(notes[id.toString()])) return false;
        else{
            if($notesTable.find('#'+id).find('.noteButton').hasClass('visible')) return true;
            else {
                $setUIValue.setValue({
                    noteVisibility:{
                        value: true,
                        other: $notesTable.find('#'+id)
                    }
                });
                showCanvasNote(id.toString(),true);
                // Mark to close
                notes[id.toString()].temp = true;
                // System //
                var x = parseInt($screen.find('#'+id).css('left'),10) + parseInt($screen.find('#'+id).css('width'),10) / 2;
                var y = parseInt($screen.find('#'+id).css('top'),10) + parseInt($screen.find('#'+id).css('height'),10) / 2;
                $setUIValue.setValue({
                    noteVisibility:{
                        publish: {id:id, visible: true, x: x, y: y, color: notes[id.toString()].color}
                    }
                });
            }
        };
    };
    notesTab.prototype.getNotes = function(){
        return notes;  
    };
    notesTab.prototype.restoreNotes = function(notes){
        
    };
    
    return notesTab;
});