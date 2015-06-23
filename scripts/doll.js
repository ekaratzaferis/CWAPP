
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore', 
  'dollExplorer'
], function(
  THREE,
  jQuery,
  PubSub,
  _, 
  DollExplorer 
  
) { 
  var raycaster = new THREE.Raycaster(); 
  var mouse = new THREE.Vector2(); 
  var dollHolderOffMat = new THREE.MeshBasicMaterial( { transparent : true, map: (THREE.ImageUtils.loadTexture( 'Images/dollHolderOff.png' )) }); 
  var dollHolderOnMat = new THREE.MeshBasicMaterial( { transparent : true, map: (THREE.ImageUtils.loadTexture( 'Images/dollHolder.png' )) }); 

  function Doll( doll, camera, crystalOrbit, lattice, animationMachine , dollHolder, keyboard, soundMachine) {

    this.plane = {'object3d' : undefined} ;
    var _this = this;
    
    this.doll = doll;
    this.soundMachine = soundMachine;
    this.dollHolder = dollHolder;
    this.keyboard = keyboard;
    this.dollOn = false;
    this.camera = camera;
    this.lattice = lattice;
    this.animationMachine = animationMachine;
    this.container = 'crystalRenderer';
    this.INTERSECTED;
    this.SELECTED;
    this.offset = new THREE.Vector3();
    this.crystalOrbit = crystalOrbit;
    this.atomUnderDoll ; 

    this.plane.object3d = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 10000, 10000, 2, 2 ),
      new THREE.MeshBasicMaterial( { transparent: true, opacity : 0.1, color: "#"+((1<<24)*Math.random()|0).toString(16)  } )
    ); 
    this.plane.object3d.visible = false; 
    this.plane.object3d.lookAt(camera.position);
 
    DollExplorer.add(this.plane);

    var mMoove = this.onDocumentMouseMove.bind(this) ;
    var mDown  = this.onDocumentMouseDown.bind(this) ;
    var mUp    = this.onDocumentMouseUp.bind(this) ;
    
    document.getElementById('crystalRenderer').addEventListener("mousemove", mMoove, false);
    document.getElementById('crystalRenderer').addEventListener("mousedown",  mDown, false);
    document.getElementById('crystalRenderer').addEventListener("mouseup"  ,    mUp, false);
     
  }; 

  Doll.prototype.setAtomUnderDoll = function(atom){  
    this.atomUnderDoll = atom ;  
  };
  Doll.prototype.onDocumentMouseMove = function(event){ 
    var _this = this;
     
    event.preventDefault();
 
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
        
      if(this.atomUnderDoll){ 
        
        for (var i = 0; i < this.lattice.actualAtoms.length; i++) { 
          this.lattice.actualAtoms[i].object3d.children[0].material.color.set( this.lattice.actualAtoms[i].color) ;
        };
        this.atomUnderDoll.children[0].material.color.setHex(0x1ADB17);  

      }
      else{
        for (var j = 0; j < this.lattice.actualAtoms.length; j++) {  
          this.lattice.actualAtoms[j].object3d.children[0].material.color.set( this.lattice.actualAtoms[j].color) ;
        };
      }

      return;

    }

    var dollIntersect = raycaster.intersectObjects( [this.doll, this.dollHolder] );
        
    if ( dollIntersect.length > 0 ) {
        
      if ( this.INTERSECTED !== dollIntersect[0].object && dollIntersect[0].object.name === 'doll') {
         
        this.INTERSECTED = dollIntersect[0].object;

        this.plane.object3d.position.copy( this.INTERSECTED.position );  

      } 
      
      document.getElementById(this.container).style.cursor = 'pointer';

    } 
    else {

      this.INTERSECTED = null; 
      document.getElementById(this.container).style.cursor = 'auto';

    } 
  }
  Doll.prototype.onDocumentMouseDown = function(event){  
    var _this =this;

    event.preventDefault();

     
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
        
    var intersects = raycaster.intersectObjects( [this.doll, this.dollHolder] );

    if ( intersects.length > 0 )  {
      
      if(intersects[0].object.name === 'dollHolder'){ 
        if(this.soundMachine.procced) this.soundMachine.play('dollHolder');
        if(this.dollOn){
          intersects[0].object.material = dollHolderOffMat ;
          this.dollOn = false;
          this.doll.visible = false;
          this.doll.position.z = -100000000;  

          this.animationMachine.doll_toAtomMovement = undefined ;
          this.keyboard.dollmode = false;
          this.crystalOrbit.camera.position.set(30,30,60);
          this.crystalOrbit.control.target = new THREE.Vector3(0,0,0);
          this.crystalOrbit.control.rotateSpeed = 1.0;
          this.crystalOrbit.disableUpdate = false;
          this.crystalOrbit.control.enabled = true;
        } 
        else{
          intersects[0].object.material = dollHolderOnMat ;
          this.dollOn = true;
          this.doll.position.set(($('#app-container').width())/-1150 + 0.1,0,0);  
          this.doll.visible = true;
      
        }
      }
      else{   
        this.crystalOrbit.control.enabled = false;
        this.SELECTED = intersects[0].object; 
        var intersects = raycaster.intersectObject( this.plane.object3d ); 
        this.offset.copy( intersects[ 0 ].point ).sub( this.plane.object3d.position ); 
        document.getElementById(this.container).style.cursor = 'none';

      }
    } 
       
  }; 
   
  Doll.prototype.onDocumentMouseUp  = function(event){  
    var _this =this;
    event.preventDefault();
    this.crystalOrbit.control.enabled = true ; 
     
    if ( this.INTERSECTED ) {

      this.plane.object3d.position.copy( this.INTERSECTED.position ); 
      this.SELECTED = null;

      if(this.atomUnderDoll){ 
        if(this.soundMachine.procced) this.soundMachine.storePlay('atomUnderDoll'); 
        this.INTERSECTED.position.set( $('#app-container').width() / -1150 + 0.1, 0,0);  

        this.dollMode(this.atomUnderDoll);
        for (var j = 0; j < this.lattice.actualAtoms.length; j++) {  
          this.lattice.actualAtoms[j].object3d.children[0].material.color.set( this.lattice.actualAtoms[j].color) ;
          this.lattice.actualAtoms[j].object3d.visible = true ;
        }; 
      }  
    }

    document.getElementById(this.container).style.cursor = 'auto';
     
  };
  Doll.prototype.dollMode  = function(atom){ 
     
    var params = this.lattice.getParameters() ;
    var x = params.scaleX * params.repeatX/2 ;
    var y = params.scaleY * params.repeatY /2;
    var z = params.scaleZ * params.repeatZ/2 ;
    var target = new THREE.Vector3(x,y,z) ; 
    var t = target.clone();
    var newCamPos = new THREE.Vector3(atom.position.x - target.x, atom.position.y - target.y, atom.position.z - target.z);
    newCamPos.setLength(newCamPos.length()+0.001);
    newCamPos.x += target.x ;
    newCamPos.y += target.y ;
    newCamPos.z += target.z ;
 
    this.animationMachine.doll_toAtomMovement = { 
      positionTrigger : true, 
      targetTrigger : true, 
      orbitControl : this.crystalOrbit, 
      oldTarget : this.crystalOrbit.control.target.clone(), 
      oldPos : this.crystalOrbit.camera.position.clone(), 
      newTarget : new THREE.Vector3(atom.position.x, atom.position.y, atom.position.z), 
      targetFactor : 0,
      posFactor : 0,
      posFactor : 0,
      atom: atom,
      targConnectVector : new THREE.Vector3(
        target.x - this.crystalOrbit.control.target.x, 
        target.y - this.crystalOrbit.control.target.y, 
        target.z - this.crystalOrbit.control.target.z 
      ),
      posConnectVector : new THREE.Vector3(
        newCamPos.x - this.crystalOrbit.camera.position.x, 
        newCamPos.y - this.crystalOrbit.camera.position.y, 
        newCamPos.z - this.crystalOrbit.camera.position.z 
      )
    }; 
  };

  return Doll;
  
});  
