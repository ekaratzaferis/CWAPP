
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore',
  'motifExplorer'
], function(
  THREE,
  jQuery,
  PubSub,
  _,
  MotifExplorer
) { 
  var raycaster = new THREE.Raycaster(); 
  var mouse = new THREE.Vector2();

  function MouseEvents( motifEditor, func, _camera, domElement ) {
    this.plane = {'object3d' : undefined} ;
    this.camera = _camera;
    this.container = domElement; 
    this.objects = [] ;
    this.motifEditor = motifEditor ;
    var _this =this;

    this.offset = new THREE.Vector3();
    this.INTERSECTED;
    this.SELECTED;

    if(func === 'dragNdrop'){
      
      this.plane.object3d = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 10000, 10000, 2, 2 ),
        new THREE.MeshBasicMaterial( { color: "#"+((1<<24)*Math.random()|0).toString(16)  } )
      );
      this.plane.object3d.visible = false;

      if(this.container === 'motifPosX' ) this.plane.object3d.position.z = -100;
      if(this.container === 'motifPosY' ) this.plane.object3d.position.x = -100;
      if(this.container === 'motifPosZ' ) this.plane.object3d.position.y = -100;
      
      this.plane.object3d.lookAt(this.camera.position);
      MotifExplorer.add(this.plane);

    }
    var mMoove = this.onDocumentMouseMove.bind(this) ;
    var mDown = this.onDocumentMouseDown.bind(this) ;
    var mUp = this.onDocumentMouseUp.bind(this) ;
    
    document.getElementById(this.container).addEventListener("mousemove", mMoove, false);
    document.getElementById(this.container).addEventListener("mousedown", mDown, false);
    document.getElementById(this.container).addEventListener("mouseup",   mUp, false);

  }; 

  MouseEvents.prototype.onDocumentMouseMove = function(event){ 
    var _this = this;
     
    event.preventDefault();

    if(this.container === 'motifPosX' ){
      mouse.x = ( -1 + 2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
      mouse.y = (  3 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
    }
    else if(this.container === 'motifPosY' ) {
      mouse.x = ( -3 + 2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
      mouse.y = (  3 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
    }
    else if(this.container === 'motifPosZ' ) {
      mouse.x = ( -5 + 2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
      mouse.y = (  3 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
    } 
 
    raycaster.setFromCamera( mouse, _this.camera );
     
    if ( _this.SELECTED ) {
        
      var intersects = raycaster.intersectObject( _this.plane.object3d );
      var pos = intersects[ 0 ].point.sub( _this.offset ) ;
      _this.SELECTED.position.copy( pos );
       
      if(pos.x>20 || pos.x<-20){  
        _this.SELECTED.position.x = pos.x>0 ? 20 : -20 ;
        pos.x = pos.x>0 ? 20 : -20 ;
        _this.plane.object3d.position.copy( _this.INTERSECTED.position ); 
        document.getElementById(_this.container).style.cursor = 'auto';
      }
      if(pos.y>20 || pos.y<-20){ 
        _this.SELECTED.position.y = pos.y>0 ? 20 : -20 ;
        pos.y = pos.y>0 ? 20 : -20 ;
        _this.plane.object3d.position.copy( _this.INTERSECTED.position );  
        document.getElementById(_this.container).style.cursor = 'auto';
      }
      if(pos.z>20 || pos.z<-20){
        _this.SELECTED.position.z = pos.z>0 ? 20 : -20 ;
        pos.z = pos.z>0 ? 20 : -20 ;
        _this.plane.object3d.position.copy( _this.INTERSECTED.position );    
        document.getElementById(_this.container).style.cursor = 'auto';
      }
      if(this.container === 'motifPosX' ) _this.motifEditor.dragAtom('x', pos, _this.SELECTED.id) ;
      else if(this.container === 'motifPosY' ) _this.motifEditor.dragAtom('y', pos, _this.SELECTED.id) ;
      else if(this.container === 'motifPosZ' ) _this.motifEditor.dragAtom('z', pos, _this.SELECTED.id) ;
       
      return;

    }
     
    var intersects = raycaster.intersectObjects( _this.getAtoms() );

    if ( intersects.length > 0 &&  intersects[0].object.parent.name ==='atom') {
      
      if ( _this.INTERSECTED != intersects[0].object.parent ) {

        _this.INTERSECTED = intersects[0].object.parent;

        _this.plane.object3d.position.copy( _this.INTERSECTED.position );
         
      }

      document.getElementById(_this.container).style.cursor = 'pointer';

    } 
    else {

      _this.INTERSECTED = null;

      document.getElementById(_this.container).style.cursor = 'auto';

    }
    
  }
  MouseEvents.prototype.onDocumentMouseDown = function(event){  
    var _this =this;

    event.preventDefault();
    if(!(_this.motifEditor.editorState.state === 'initial')) {
      raycaster.setFromCamera( mouse, _this.camera );
      
      var intersects = raycaster.intersectObjects( _this.getAtoms() );

      if ( intersects.length > 0 &&  intersects[0].object.parent.name ==='atom') {
            
        _this.SELECTED = intersects[0].object.parent; 
        var intersects = raycaster.intersectObject( _this.plane.object3d ); 
        _this.offset.copy( intersects[ 0 ].point ).sub( _this.plane.object3d.position ); 
        document.getElementById(_this.container).style.cursor = 'none';

      }
    }
     
  };

  MouseEvents.prototype.onDocumentMouseUp  = function(event){  
    var _this =this;
    event.preventDefault();

    if ( _this.INTERSECTED ) {

      _this.plane.object3d.position.copy( _this.INTERSECTED.position );
      _this.SELECTED = null;
      _this.motifEditor.rotateAroundAtom();

    }

    document.getElementById(_this.container).style.cursor = 'auto';

  };

  MouseEvents.prototype.getAtoms = function() {  
    var _this = this;
    _this.objects = [] ;

    MotifExplorer.getInstance().object3d.traverse (function (object) {
      if (object.name === 'atom') { 
        for (var i = 0; i < object.children.length; i++) { 
          _this.objects.push(object.children[i]);
        };
      }
    });
    return _this.objects;
  };

  return MouseEvents;
  
});  
