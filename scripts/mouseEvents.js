
/*global define*/
'use strict';

define([
  'three',
  'jquery',
  'pubsub',
  'underscore',
  'motifExplorer',
  'navCubeHud'
], function(
  THREE,
  jQuery,
  PubSub,
  _,
  MotifExplorer,
  NavCubeHud
) { 
  var raycaster = new THREE.Raycaster(); 
  var mouse = new THREE.Vector2();

  function MouseEvents( motifEditor, func,  _camera, domElement,  orbitControls) {
    this.plane = {'object3d' : undefined} ;
    this.func = func ;
    this.container = domElement;   
    this.orbitControls = orbitControls; 
    this.objects = [] ;
    this.camera = _camera ;
    this.motifEditor = motifEditor ;
    var _this =this;

    this.offset = new THREE.Vector3();
    this.INTERSECTED;
    this.SELECTED;
  
    if(this.func === 'dragNdrop' ){
      
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
 
      var mMoove = this.onDocumentMouseMove.bind(this) ;
      var mDown  = this.onDocumentMouseDown.bind(this) ;
      var mUp    = this.onDocumentMouseUp.bind(this) ;
      
      document.getElementById(this.container).addEventListener("mousemove", mMoove, false);
      document.getElementById(this.container).addEventListener("mousedown", mDown, false);
      document.getElementById(this.container).addEventListener("mouseup",   mUp, false);
    }
    else if( this.func === 'navCubeDetect'){
       
      var mMoove = this.onDocumentMouseMove.bind(this) ;
      var mDown = this.onDocumentMouseDown.bind(this) ;
      var mUp = this.onDocumentMouseUp.bind(this) ;
      
      document.getElementById(this.container).addEventListener("mousemove", mMoove, false);
      document.getElementById(this.container).addEventListener("mousedown", mDown, false);
      document.getElementById(this.container).addEventListener("mouseup",   mUp, false);
    }

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
    else if(this.container === 'hudRendererCube' ) {

      var contWidth = $('#crystalRenderer').width() ;
       
      if(contWidth < 800 ){
        mouse.x = (  -7 +  2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
        mouse.y = (   1 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
        console.log(mouse);
      }
      else{  
        mouse.x = (  -1 +  2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
        mouse.y = (   1 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
      }
       
      raycaster.setFromCamera( mouse, _this.camera );
       
      var intersects = raycaster.intersectObjects( _this.getAtoms() );
       
      if ( intersects.length > 0  ) {
        if(intersects[0].object.name = 'cube' ){  
          
          document.getElementById(_this.container).style.cursor = 'pointer';
          var index;
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==-1){
            index = 5 ;
          }
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==1){
            index = 4 ;
          }
          if(intersects[0].face.normal.x==1 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==0){
            index = 0 ;
          }
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==-1 &&intersects[0].face.normal.z==0){
            index = 3 ;
          }
          if(intersects[0].face.normal.x==-1 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==0){
            index = 1 ;
          }
          if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==1 &&intersects[0].face.normal.z==0){
            index = 2 ;
          }
           
          intersects[0].object.material.materials[intersects[0].face.materialIndex] = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/'+index+'Hit.jpg' ) });
          
          for (var i = 0; i<6; i++) {
            if( i!= index) intersects[0].object.material.materials[i] = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/'+i+'.jpg' ) });
          };
        }
      }
      else{
        var materialArray = [];
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/0.jpg' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/1.jpg' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/2.jpg' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/3.jpg' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/4.jpg' ) }));
        materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'Images/5.jpg' ) }));
        var cube = _this.getAtoms() ;
        cube[0].material.materials =  materialArray ;
        document.getElementById(_this.container).style.cursor = 'auto';
      }
      return ;
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

    if(this.func === 'dragNdrop'){  
      if( !(_this.motifEditor.editorState.state === 'initial') && _this.motifEditor.manualAabc === false ) {
        raycaster.setFromCamera( mouse, _this.camera );
        
        var intersects = raycaster.intersectObjects( _this.getAtoms() );

        if ( intersects.length > 0 &&  intersects[0].object.parent.name === 'atom') {
              
          _this.SELECTED = intersects[0].object.parent; 
          var intersects = raycaster.intersectObject( _this.plane.object3d ); 
          _this.offset.copy( intersects[ 0 ].point ).sub( _this.plane.object3d.position ); 
          document.getElementById(_this.container).style.cursor = 'none';

        }
      }
     }
     else if(this.func === 'navCubeDetect'){

      var contWidth = $('#crystalRenderer').width() ;
       
      if(contWidth < 800 ){
        mouse.x = (  -7 +  2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
        mouse.y = (   1 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
        console.log(mouse);
      }
      else{  
        mouse.x = (  -1 +  2 * ( event.clientX / ( $('#'+_this.container).width() ) ) );
        mouse.y = (   1 - 2 * ( event.clientY / ( $('#'+_this.container).height() ) ) ); 
      }
    
      raycaster.setFromCamera( mouse, _this.camera );
       
      var intersects = raycaster.intersectObjects( _this.getAtoms() );
       
      if ( intersects.length > 0  ) {
                
        var index;
        if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==-1){
          index = 5 ;
        }
        else if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==1){
          index = 4 ;
        }
        else if(intersects[0].face.normal.x==1 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==0){
          index = 0 ; 
        }
        else if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==-1 &&intersects[0].face.normal.z==0){
          index = 3 ;
        }
        else if(intersects[0].face.normal.x==-1 && intersects[0].face.normal.y==0 &&intersects[0].face.normal.z==0){
          index = 1 ;
        }
        else if(intersects[0].face.normal.x==0 && intersects[0].face.normal.y==1 &&intersects[0].face.normal.z==0){
          index = 2 ;
        }

        var params = this.motifEditor.getParameters() ;
        var x = params.scaleX * params.repeatX/2 ;
        var y = params.scaleY * params.repeatY /2;
        var z = params.scaleZ * params.repeatZ/2 ;
        var center = new THREE.Vector3(x,y,z) ;

        for (var i = this.orbitControls.length - 1; i >= 0; i--) { 

          if( this.orbitControls[i].getCamName() != 'crystal'  ) { 
            center = new THREE.Vector3(0,0,0); // mperdeuontai auta 
          }
          if( (this.orbitControls[i].getCamName() == 'cell') && $('#syncCameras').is(':checked') ){  
            this.orbitControls[i].setThetaPhi(angles[index].theta, angles[index].phi, center ); 
          }
          if(this.orbitControls[i].getCamName() != 'cell'){
            this.orbitControls[i].setThetaPhi(angles[index].theta, angles[index].phi, center );
          }

        };  
      } 
    }
  };

  var angles = {
    '0' : {'theta' : 90*Math.PI/180, 'phi'  : 90*Math.PI/180},
    '1' : {'theta' : -90*Math.PI/180, 'phi' : 90*Math.PI/180},
    '2' : {'theta' : 0*Math.PI/180, 'phi'  : 0*Math.PI/180},
    '3' : {'theta' : 0*Math.PI/180, 'phi'  : 180*Math.PI/180},
    '4' : {'theta' : 0*Math.PI/180, 'phi'  : 90*Math.PI/180},
    '5' : {'theta' : 180*Math.PI/180, 'phi'  : 90*Math.PI/180} 
  };

  MouseEvents.prototype.onDocumentMouseUp  = function(event){  
    var _this =this;
    event.preventDefault();

    if(this.func === 'dragNdrop'){ 

      if ( _this.INTERSECTED ) {

        _this.plane.object3d.position.copy( _this.INTERSECTED.position );
        _this.SELECTED = null;
        _this.motifEditor.rotateAroundAtom();

      }

      document.getElementById(_this.container).style.cursor = 'auto';
    }

  };

  MouseEvents.prototype.getAtoms = function() {  
    var _this = this;
    _this.objects = [] ;

    if(this.func === 'dragNdrop'){ 
      MotifExplorer.getInstance().object3d.traverse (function (object) {
        if (object.name === 'atom') { 
          for (var i = 0; i < object.children.length; i++) { 
            _this.objects.push(object.children[i]);
          };
        }
      });
    }
    else if(this.func === 'navCubeDetect'){ 
      NavCubeHud.getInstance().object3d.traverse (function (object) { 
        if (object.name === 'cube') { 
          _this.objects.push(object ); 
        }; 
      });
    }
    return _this.objects;
  };

  return MouseEvents;
  
});  
