
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore', 
  'explorer'
], function(
  THREE,
  jQuery,
  PubSub,
  _, 
  DollExplorer,
  Explorer 
  
) { 
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();  
  var yPosGearSlider = [-7.05, -5.7 , -4.35 , -3 , -1.65 , -0.30];
  var levelNames = [ '1. Lattice Points', '2. Motif', '3. Constructive Unit Cell', '4. Unit cell', '5. Cropped unit cell', '6. Crystal' ];

  function DollGearBarMouseEvents(camera, crystalOrbit, lattice , dollEditor, soundMachine, animationMachine, keyboard, gearTour, menu) {

    this.plane = {'object3d' : undefined} ;
    var _this = this;
       
    this.menu = menu;
    this.dollEditor = dollEditor;
    this.animationMachine = animationMachine;
    this.keyboard = keyboard;
    this.soundMachine = soundMachine;
    this.gearTour = gearTour;
    
    this.camera = camera;
    this.lattice = lattice;  
    this.container = 'crystalRendererMouse';
    this.INTERSECTED;
    this.SELECTED;
    this.offset = new THREE.Vector3();
    this.offset2 = new THREE.Vector3();
    this.crystalOrbit = crystalOrbit;
    this.tooltipMem;
    this.walkStep = 1;
    this.tooltipIsVisible = false;
    this.firstTimeEnded = false;

    this.plane.object3d = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 10000, 10000, 2, 2 ),
      new THREE.MeshBasicMaterial( { transparent: true, opacity : 0.1   } )
    ); 
    this.plane.object3d.visible = false; 
    this.plane.object3d.lookAt(this.camera.position);
 
    DollExplorer.add(this.plane);
 
    var mMoove = this.onDocumentMouseMove.bind(this) ; 
    var mUp    = this.onDocumentMouseUp.bind(this) ;
    
    document.getElementById('crystalRendererMouse').addEventListener("mousemove", mMoove, false); 
    document.getElementById('crystalRendererMouse').addEventListener("mouseup"  ,    mUp, false);
    
    document.body.addEventListener('click', function myClick(event) 
      {  
        _this.firstTimeEnded = true;
        _this.menu.canvasTooltip({ 
          'show':false
        });
        document.body.removeEventListener('click', myClick);  
      } 
    );

  }; 
  function myClick(event) { 
    document.body.removeEventListener('click', myClick);  
  } 
  DollGearBarMouseEvents.prototype.onDocumentMouseDown = function(event){  
    var _this = this, clickedOnMe = false; 
     
    if(this.dollEditor.enablemouseEvents !== true){
      return;
    }  
    this.SELECTED = undefined;
    
    var contWidth = $('#'+this.container).width() ;

    if(contWidth < 800 ){
      mouse.x = (  -3 +  2 * ( event.clientX / ( $('#'+this.container).width() ) ) );
      mouse.y = (   1 - 2 * ( event.clientY / ( $('#'+this.container).height() ) ) );  
    }
    else{  
      mouse.x = (  -1 +  2 * ( event.clientX / ( $('#'+this.container).width() ) ) );
      mouse.y = (   1 - 2 * ( event.clientY / ( $('#'+this.container).height() ) ) ); 
    }

    raycaster.setFromCamera( mouse, this.camera ); 

    var intersects = raycaster.intersectObjects( this.dollEditor.objsToIntersect, true );
 
    for (var i = intersects.length - 1; i >= 0; i--) { 
      
      if(intersects[i].object.name === 'dollHolder'){  
        clickedOnMe = true;
        if(this.soundMachine.procced) {
          this.soundMachine.play('dollHolder');
        }
        if(this.dollEditor.dollOn){
          intersects[i].object.parent.children[0].material.color.setHex(0xA19EA1);
          intersects[i].object.parent.children[2].material.color.setHex(0xA19EA1);
          intersects[i].object.parent.children[3].material.color.setHex(0xA19EA1); 
          this.dollEditor.rePosition();
          this.dollEditor.dollOn = false;
          this.dollEditor.doll.visible = false; 

          this.animationMachine.doll_toAtomMovement = undefined ;
          this.keyboard.dollmode = false;
          this.crystalOrbit.camera.position.set(30,30,60);
          this.crystalOrbit.control.target = new THREE.Vector3(0,0,0);
          this.crystalOrbit.control.rotateSpeed = 1.0;
          this.crystalOrbit.disableUpdate = false;
          this.crystalOrbit.control.enabled = true;
        } 
        else if(intersects[i].object.name === 'dollHolder'){ 
          intersects[i].object.parent.children[0].material.color.setHex(0x71469A);
          intersects[i].object.parent.children[2].material.color.setHex(0x71469A);
          intersects[i].object.parent.children[3].material.color.setHex(0x71469A); 

          this.dollEditor.dollOn = true; 
          this.dollEditor.doll.visible = true;
      
        }
      }
      else if(intersects[i].object.name === 'minus'){
        clickedOnMe = true;
        this.soundMachine.play('dollHolder'); // to change 
         
        if(this.dollEditor.gearState > 1 ){ 
          if(this.dollEditor.levelLabels[this.dollEditor.gearState-2].allowed === true){

            this.dollEditor.gearState--; 

            this.menu.canvasTooltip({
              'message':levelNames[this.dollEditor.gearState-1],
              'x':this.dollEditor.levelLabels[this.dollEditor.gearState-1].position.x,
              'y':this.dollEditor.levelLabels[this.dollEditor.gearState-1].position.y,
              'show':true
            }); 

            clearTimeout(this.tooltipMem);
 
            this.tooltipMem = setTimeout(function() {
              _this.menu.canvasTooltip({
                'show':false
              }); 
              _this.tooltipIsVisible = false;
            }, 1000);
 

            this.dollEditor.gearBarSlider.position.y = yPosGearSlider[this.dollEditor.gearState-1];
            this.gearTour.setState(this.dollEditor.gearState);
          }
        } 
      }  
      else if(intersects[i].object.name === 'plus'){ 
        clickedOnMe = true;
        this.soundMachine.play('dollHolder'); //to change 

        if(this.dollEditor.gearState < 6 ){ 
          if(this.dollEditor.levelLabels[this.dollEditor.gearState].allowed === true){
            this.dollEditor.gearState++;
            
            this.menu.canvasTooltip({
              'message':levelNames[this.dollEditor.gearState-1],
              'x':this.dollEditor.levelLabels[this.dollEditor.gearState-1].position.x,
              'y':this.dollEditor.levelLabels[this.dollEditor.gearState-1].position.y,
              'show':true
            });

            clearTimeout(this.tooltipMem);

            this.tooltipMem = setTimeout(function() {
              _this.menu.canvasTooltip({
                'show':false
              });  
            }, 1000);
             
            this.dollEditor.gearBarSlider.position.y = yPosGearSlider[this.dollEditor.gearState-1];
            this.gearTour.setState(this.dollEditor.gearState);
          } 
        } 
      } 
      else if(intersects[i].object.name === 0 || intersects[i].object.name === 1 || intersects[i].object.name === 2 || intersects[i].object.name === 3 || intersects[i].object.name === 4 || intersects[i].object.name === 5 ){ 
        clickedOnMe = true;

        if(this.dollEditor.levelLabels[intersects[i].object.name].allowed === true){ 
          this.walkTourSet(intersects[i].object.name);
          this.dollEditor.gearBarSlider.position.y = yPosGearSlider[intersects[i].object.name];
          this.dollEditor.gearState = intersects[i].object.name + 1 ;
          this.gearTour.setState(this.dollEditor.gearState);
        }
        if(this.soundMachine.procced) {
          this.soundMachine.storePlay('dollHolder'); 
        }
        
      }  
      else if(intersects[i].object.name === 'doll'){   
        clickedOnMe = true; 
        this.crystalOrbit.control.enabled = false;
        this.SELECTED = intersects[i].object; 
        var intersects_ = raycaster.intersectObject( this.plane.object3d ); 
        this.offset.copy( intersects_[0].point ).sub( this.plane.object3d.position ); 
        document.getElementById(this.container).style.cursor = 'none'; 
      }
    }; 
    return clickedOnMe; 
  }; 
  
  DollGearBarMouseEvents.prototype.setWalkStep = function(num){ 
    this.walkStep = num;
    var scene = DollExplorer.getInstance();

    var object = scene.object3d.getObjectByName( 0 );
    console.log(object);
    if(num === 2){
      scene.object3d.traverse (function (object)
      {  
        if (object.name === 0){
            console.log(object);
        }       
          
      });
      this.dollEditor.gearBarSlider.position.y = -5.7;
    }
    else if(num === 3){
      this.dollEditor.gearBarSlider.position.y = -0.30;
    }
  }; 
  DollGearBarMouseEvents.prototype.walkTourSet = function(clickedLevel){  
  
    if(this.walkStep === 1 && clickedLevel === 0){
       
      this.menu.highlightElement({id:'selected_lattice'}); 
      this.menu.switchTab('latticeTab'); 

      this.walkStep = 2;
    }
    else if(this.walkStep === 2 && clickedLevel === 1){
       
      this.menu.highlightElement({id:'atomPalette'}); 
      this.menu.switchTab('motifLI');

      this.walkStep = 3; 
    }
    else if(this.walkStep === 3 && ( clickedLevel === 2 || clickedLevel === 3 || clickedLevel === 4 || clickedLevel === 5)){
        
      this.menu.switchTab('visualTab'); 
    }
  };
  DollGearBarMouseEvents.prototype.onDocumentMouseMove = function(event){ 
    var _this = this;
    
    if(this.dollEditor.enablemouseEvents !== true){
      return;
    } 
 
    var contWidth = $('#'+this.container).width() ;
     
    if(contWidth < 800 ){
      mouse.x = (  -3 +  2 * ( event.clientX / ( $('#'+this.container).width() ) ) );
      mouse.y = (   1 - 2 * ( event.clientY / ( $('#'+this.container).height() ) ) );  
    }
    else{  
      mouse.x = (  -1 +  2 * ( event.clientX / ( $('#'+this.container).width() ) ) );
      mouse.y = (   1 - 2 * ( event.clientY / ( $('#'+this.container).height() ) ) ); 
    }
     
    raycaster.setFromCamera( mouse, this.camera );
    
    if ( this.SELECTED ) {
      
      var intersects = raycaster.intersectObject( this.plane.object3d );
      var pos = intersects[ 0 ].point.sub( this.offset ) ;

      this.SELECTED.position.copy( pos );
        
      if(this.dollEditor.atomUnderDoll){  
        for (var i = 0; i < this.lattice.actualAtoms.length; i++) { 
          this.lattice.actualAtoms[i].object3d.children[0].material.color.set( this.lattice.actualAtoms[i].color) ;
        };
        this.dollEditor.atomUnderDoll.children[0].material.color.setHex(0x1ADB17);  
      }
      else{
        for (var j = 0; j < this.lattice.actualAtoms.length; j++) {  
          this.lattice.actualAtoms[j].object3d.children[0].material.color.set( this.lattice.actualAtoms[j].color) ;
        };
      } 
      return; 
    }

    var intersects2 = raycaster.intersectObjects( this.dollEditor.objsToIntersect, true );

    var entered = false;
    var overGearLevels = false;

    for (var i = intersects2.length - 1; i >= 0; i--) {  
      if ( this.INTERSECTED !== intersects2[i].object && intersects2[i].object.name === 'doll') {
        entered = true;
        this.INTERSECTED = intersects2[i].object; 
        this.plane.object3d.position.copy( this.INTERSECTED.position );  
        document.getElementById(this.container).style.cursor = 'pointer';
      }  
      if(intersects2[i].object.name === 'dollHolder' ){
        entered = true;
        this.dollEditor.dollHolder.children[0].material.color.setHex(0x6F6299); // 0xCA_6A04 D537FF
        this.dollEditor.dollHolder.children[2].material.color.setHex(0x6F6299);
        this.dollEditor.dollHolder.children[3].material.color.setHex(0x6F6299);
        document.getElementById(this.container).style.cursor = 'pointer';
      }
      if((intersects2[i].object.name === 'doll' && this.dollEditor.dollOn === true)){
        document.getElementById(this.container).style.cursor = 'pointer';
        entered = true;
      }

      // gear tour levels
      if((intersects2[i].object.name === 0) || (intersects2[i].object.name === 1) || (intersects2[i].object.name === 2) || (intersects2[i].object.name === 3) || (intersects2[i].object.name === 4) || (intersects2[i].object.name === 5) ){
 
        entered = true ;
  
        if(this.dollEditor.levelLabels[intersects2[i].object.name].allowed === true){ 
          intersects2[i].object.visible = true; 
          clearTimeout(this.tooltipMem);
          this.menu.canvasTooltip({
            'message':levelNames[intersects2[i].object.name],
            'x':this.dollEditor.levelLabels[intersects2[i].object.name].position.x,
            'y':this.dollEditor.levelLabels[intersects2[i].object.name].position.y,
            'show':true
          });

          document.getElementById(this.container).style.cursor = 'pointer';
        }
        else{
          document.getElementById(this.container).style.cursor = 'not-allowed';
        }
        
      } 
      if(intersects2[i].object.name === 'plusSymbol' || intersects2[i].object.name === 'minusSymbol'){
        entered = true; 
        document.getElementById(this.container).style.cursor = 'pointer';
      }
      if(intersects2[i].object.name === 'minus' || intersects2[i].object.name === 'plus'){
        entered = true;  
        document.getElementById(this.container).style.cursor = 'pointer';
        intersects2[i].object.material.color.setHex(0x6F6299); 
      }   
    };
     
    if(entered === false ){
      
      if(this.firstTimeEnded === true){
        this.tooltipIsVisible = false; 
 
        this.menu.canvasTooltip({ 
          'show':false
        });
      }
       
      this.INTERSECTED = null; 
      document.getElementById(this.container).style.cursor = 'auto';  
      this.dollEditor.gearBar.children[1].material.color.setHex(0xA19EA1);
      this.dollEditor.gearBar.children[3].material.color.setHex(0xA19EA1);   
      this.dollEditor.dollHolder.children[0].material.color.setHex(0xA19EA1);
      this.dollEditor.dollHolder.children[2].material.color.setHex(0xA19EA1);
      this.dollEditor.dollHolder.children[3].material.color.setHex(0xA19EA1);
  
      for (var f = this.dollEditor.levels.length - 1; f >= 0; f--) { 
        this.dollEditor.levels[f].visible = false; 
      };

    }  
  };  
   
  DollGearBarMouseEvents.prototype.onDocumentMouseUp  = function(event){  
    var _this = this;
  
    this.crystalOrbit.control.enabled = true ; 
     
    if ( this.INTERSECTED ) {

      this.plane.object3d.position.copy( this.INTERSECTED.position ); 
      this.SELECTED = null;

      if(this.dollEditor.atomUnderDoll){ 
        if(this.soundMachine.procced) this.soundMachine.storePlay('atomUnderDoll'); 
        this.INTERSECTED.position.set( $('#app-container').width() / -1150 + 0.1, 0,0);  

        this.dollEditor.dollMode(this.dollEditor.atomUnderDoll);
        for (var j = 0; j < this.lattice.actualAtoms.length; j++) {  
          this.lattice.actualAtoms[j].object3d.children[0].material.color.set( this.lattice.actualAtoms[j].color) ;
          this.lattice.actualAtoms[j].object3d.visible = true ;
        }; 
      }  
    } 

    document.getElementById(this.container).style.cursor = 'auto';
     
  }; 
  return DollGearBarMouseEvents;
  
});  
