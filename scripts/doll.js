
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

  function Doll( doll, camera, crystalOrbit, lattice ) {

    this.plane = {'object3d' : undefined} ;
    var _this = this;
    
    this.doll = doll;
    this.camera = camera;
    this.lattice = lattice;
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

    var dollIntersect = raycaster.intersectObjects( [this.doll] );
        
    if ( dollIntersect.length > 0 ) {
        
      if ( this.INTERSECTED != dollIntersect[0].object ) {
         
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
        
    var intersects = raycaster.intersectObjects( [this.doll] );

    if ( intersects.length > 0 )  {
      
      this.crystalOrbit.control.enabled = false;
      this.SELECTED = intersects[0].object; 
      var intersects = raycaster.intersectObject( this.plane.object3d ); 
      this.offset.copy( intersects[ 0 ].point ).sub( this.plane.object3d.position ); 
      document.getElementById(this.container).style.cursor = 'none';

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
        this.dollMode();
      }
       
    }

    document.getElementById(this.container).style.cursor = 'auto';
     
  };
  Doll.prototype.dollMode  = function(){ 
    console.log(this.crystalOrbit.control);
    var vec = new THREE.Vector3(
      this.crystalOrbit.camera.position.x - this.atomUnderDoll.position.x, 
      this.crystalOrbit.camera.position.y - this.atomUnderDoll.position.y, 
      this.crystalOrbit.camera.position.z - this.atomUnderDoll.position.z
      );
    vec.setLength(0.00001);
    this.crystalOrbit.camera.position.set(vec.x + this.atomUnderDoll.position.x, vec.y + this.atomUnderDoll.position.y, vec.z + this.atomUnderDoll.position.z);
    this.crystalOrbit.control.target = new THREE.Vector3(this.atomUnderDoll.position.x, this.atomUnderDoll.position.y, this.atomUnderDoll.position.z);
  };

  return Doll;
  
});  
