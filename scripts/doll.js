
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
  var yPosGearSlider = [-5.7 , -4.35 , -3 , -1.65 , -0.30];
  var levelNames = [ 'Lattice Points', 'Motif', 'Cropped unit cell', 'Unit cell', 'Crystal' ];

  function Doll(camera, crystalOrbit, lattice, animationMachine , keyboard, soundMachine, gearTour) {

    this.plane = {'object3d' : undefined} ;
    var _this = this;
     
    this.soundMachine = soundMachine; 
    this.keyboard = keyboard; 
    this.dollOn = false;
    this.camera = camera;
    this.lattice = lattice;
    this.animationMachine = animationMachine;
    this.gearTour = gearTour;
    this.container = 'crystalRendererMouse';
    this.INTERSECTED;
    this.SELECTED;
    this.offset = new THREE.Vector3();
    this.crystalOrbit = crystalOrbit;
    this.atomUnderDoll ; 
    this.objsToIntersect = [];
    this.gearState = 5;
    this.levels = [];
    this.levelLabels = [];
    this.enablemouseEvents = true;

    this.plane.object3d = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 10000, 10000, 2, 2 ),
      new THREE.MeshBasicMaterial( { transparent: true, opacity : 0.1   } )
    ); 
    this.plane.object3d.visible = false; 
    this.plane.object3d.lookAt(this.camera.position);
 
    DollExplorer.add(this.plane);

    /// doll icon  
 
    this.dollHolder = createDollHolder();
    
    this.dollHolder.position.y = 4;  

    this.doll = createDoll();   
    this.doll.name = 'doll';
    this.doll.visible = false;
    this.doll.position.y =  4;  

    DollExplorer.add( { object3d : this.doll });
    this.objsToIntersect.push(this.doll);

    DollExplorer.add( { object3d :this.dollHolder });
    this.objsToIntersect.push(this.dollHolder);

    this.gearBar = createGearBar(); 
    this.gearBarSlider = createGearBarSlider(); 
    this.gearBarSlider.position.y = -0.3;
    
    DollExplorer.add( { object3d :this.gearBar });
    this.objsToIntersect.push(this.gearBar);

    DollExplorer.add( { object3d :this.gearBarSlider });
    this.objsToIntersect.push(this.gearBarSlider);

    for (var i = 0; i < yPosGearSlider.length ; i++) {
      var m = new THREE.Mesh( new THREE.PlaneBufferGeometry(1.2,0.6), new THREE.MeshBasicMaterial({ transparent: true, opacity : 0.4, color: 0xffffff}) );
      m.position.y = yPosGearSlider[i];
      m.name = i;
      m.visible = false;
      DollExplorer.add({object3d : m});
      this.levels[i] = m ;
      this.objsToIntersect.push(m);
    };  
 
    for (var g = 0; g < levelNames.length ; g++) {
      this.levelLabels[g] = makeTextSprite(
        levelNames[g],  
        { 
          fontsize: 25.0, 
          fontface: "Arial", 
          borderColor: {r:0, g:128, b:255, a:1.0},  
          fontColor: {r:189, g:189, b:189, a:1.0} 
        } 
      );
      this.levelLabels[g].position.y = yPosGearSlider[g] - 2;   
      this.levelLabels[g].visible = false;  
      this.objsToIntersect.push(this.levelLabels[g]);
      DollExplorer.add({object3d : this.levelLabels[g]});
    };
        
    this.rePosition();

    var mMoove = this.onDocumentMouseMove.bind(this) ;
    var mDown  = this.onDocumentMouseDown.bind(this) ;
    var mUp    = this.onDocumentMouseUp.bind(this) ;
    
    document.getElementById('crystalRendererMouse').addEventListener("mousemove", mMoove, false);
    document.getElementById('crystalRendererMouse').addEventListener("mousedown",  mDown, false);
    document.getElementById('crystalRendererMouse').addEventListener("mouseup"  ,    mUp, false);

  }; 
  function createGearBarSlider(){

    var obj = new THREE.Object3D();

    var sliderG = new THREE.Geometry();
    var v1 = new THREE.Vector3(-0.625 ,  0.3,  0);
    var v2 = new THREE.Vector3(-0.625 , -0.3,  0); 
    var v3 = new THREE.Vector3( 0.625 , -0.3,  0);  
    var v4 = new THREE.Vector3( 0.625 ,  0.3,  0);  
     
    sliderG.vertices.push(v1);
    sliderG.vertices.push(v2);
    sliderG.vertices.push(v3);
    sliderG.vertices.push(v4);
    
    sliderG.faces.push( new THREE.Face3( 0, 1, 2 ) );
    sliderG.faces.push( new THREE.Face3( 0, 2, 3 ) );

    sliderG.computeFaceNormals(); 
    
    var slider = new THREE.Mesh( sliderG, new THREE.MeshBasicMaterial({ color: 0x6F6299})); 
    
    var geometryL = new THREE.Geometry();
    geometryL.vertices.push(
      v1,
      v2,
      v3,
      v4,
      v1
    );

    var line = new THREE.Line( geometryL, new THREE.LineBasicMaterial({ color: 0x15002B}) );

    slider.name = 'gearBarSlider';  

    obj.add(line);
    obj.add(slider);
    return obj;
  };

  function createGearBar(){

    var obj = new THREE.Object3D();

    // line 
    var lineG = new THREE.Geometry();
    var Lv1 = new THREE.Vector3(-0.15,  0,  0);
    var Lv2 = new THREE.Vector3(-0.15, -6,  0); 
    var Lv3 = new THREE.Vector3( 0.15, -6,  0);  
    var Lv4 = new THREE.Vector3( 0.15,  0,  0);  
     
    lineG.vertices.push(Lv1);
    lineG.vertices.push(Lv2);
    lineG.vertices.push(Lv3);
    lineG.vertices.push(Lv4);
    
    lineG.faces.push( new THREE.Face3( 0, 1, 2 ) );
    lineG.faces.push( new THREE.Face3( 0, 2, 3 ) );

    lineG.computeFaceNormals(); 
    
    var line = new THREE.Mesh( lineG, new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    line.name = 'line'; 
 
    obj.add(line);
     
    // plus plane
    var plusSquareG = new THREE.Geometry();
    var Sv1 = new THREE.Vector3(-0.6 ,  0.6,  0);
    var Sv2 = new THREE.Vector3(-0.6 , -0.6,  0); 
    var Sv3 = new THREE.Vector3( 0.6 , -0.6,  0);  
    var Sv4 = new THREE.Vector3( 0.6 ,  0.6,  0);  
     
    plusSquareG.vertices.push(Sv1);
    plusSquareG.vertices.push(Sv2);
    plusSquareG.vertices.push(Sv3);
    plusSquareG.vertices.push(Sv4);
    
    plusSquareG.faces.push( new THREE.Face3( 0, 1, 2 ) );
    plusSquareG.faces.push( new THREE.Face3( 0, 2, 3 ) );

    plusSquareG.computeFaceNormals(); 
    
    var plusSquare = new THREE.Mesh( plusSquareG, new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    plusSquare.name = 'plus'; 
    plusSquare.position.y = 0.6 ; 

    // plus symbol
    var plusSquareGp = new THREE.Geometry(); 
    var Pv1 = new THREE.Vector3(-0.4 ,  0.1,  0);
    var Pv2 = new THREE.Vector3(-0.4 , -0.1,  0); 
    var Pv3 = new THREE.Vector3( 0.4 , -0.1,  0);  
    var Pv4 = new THREE.Vector3( 0.4 ,  0.1,  0);

    var Pv5 = new THREE.Vector3( -0.1 ,   0.4,  0);
    var Pv6 = new THREE.Vector3( -0.1 ,  -0.4,  0);
    var Pv7 = new THREE.Vector3(  0.1 ,  -0.4,  0);
    var Pv8 = new THREE.Vector3(  0.1 ,   0.4,  0);

    plusSquareGp.vertices.push(Pv1);
    plusSquareGp.vertices.push(Pv2);
    plusSquareGp.vertices.push(Pv3);
    plusSquareGp.vertices.push(Pv4);

    plusSquareGp.vertices.push(Pv5);
    plusSquareGp.vertices.push(Pv6);
    plusSquareGp.vertices.push(Pv7);
    plusSquareGp.vertices.push(Pv8);

    plusSquareGp.faces.push( new THREE.Face3( 0, 1, 2 ) );
    plusSquareGp.faces.push( new THREE.Face3( 0, 2, 3 ) );

    plusSquareGp.faces.push( new THREE.Face3( 4, 5, 6 ) );
    plusSquareGp.faces.push( new THREE.Face3( 4, 6, 7 ) );

    plusSquareGp.computeFaceNormals(); 
    
    var plusSquareP = new THREE.Mesh( plusSquareGp, new THREE.MeshBasicMaterial({ color: 0x2B262F }) );
    plusSquareP.name = 'plusSymbol'; 
    plusSquareP.position.y = 0.6 ; 
 
    obj.add(plusSquare);
    obj.add(plusSquareP); 

    // minus plane 
    var minusSquareG = plusSquareG.clone();

    var minusSquare = new THREE.Mesh( minusSquareG, new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    minusSquare.name = 'minus'; 
    minusSquare.position.y = -6.6 ;  

    // plus symbol
    var minusSquareGp = new THREE.Geometry(); 
    var Pv1 = new THREE.Vector3(-0.4 ,  0.1,  0);
    var Pv2 = new THREE.Vector3(-0.4 , -0.1,  0); 
    var Pv3 = new THREE.Vector3( 0.4 , -0.1,  0);  
    var Pv4 = new THREE.Vector3( 0.4 ,  0.1,  0);
  
    minusSquareGp.vertices.push(Pv1);
    minusSquareGp.vertices.push(Pv2);
    minusSquareGp.vertices.push(Pv3);
    minusSquareGp.vertices.push(Pv4); 

    minusSquareGp.faces.push( new THREE.Face3( 0, 1, 2 ) );
    minusSquareGp.faces.push( new THREE.Face3( 0, 2, 3 ) );
  
    minusSquareGp.computeFaceNormals(); 
    
    var minusSquareM = new THREE.Mesh( minusSquareGp, new THREE.MeshBasicMaterial({ color: 0x2B262F }) );
    minusSquareM.name = 'minusSymbol'; 
    minusSquareM.position.y = -6.6 ;  

    obj.add(minusSquare);
    obj.add(minusSquareM);

    // levels 
    var levelsGeom = new THREE.Geometry();

    for (var i = 0; i < 5; i++) {
      var Sv1 = new THREE.Vector3(-0.35,  0.12 + i*1.4,  0);
      var Sv2 = new THREE.Vector3(-0.35, -0.12 + i*1.4,  0); 
      var Sv3 = new THREE.Vector3( 0.35, -0.12 + i*1.4,  0);  
      var Sv4 = new THREE.Vector3( 0.35,  0.12 + i*1.4,  0);  
       
      levelsGeom.vertices.push(Sv1);
      levelsGeom.vertices.push(Sv2);
      levelsGeom.vertices.push(Sv3);
      levelsGeom.vertices.push(Sv4);
      
      levelsGeom.faces.push( new THREE.Face3( 0+4*i, 1+4*i, 2+4*i ) );
      levelsGeom.faces.push( new THREE.Face3( 0+4*i, 2+4*i, 3+4*i ) );
    };
 
    levelsGeom.computeFaceNormals(); 
    
    var levels = new THREE.Mesh( levelsGeom, new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    levels.name = 'levels';  
    levels.position.y = -5.8 ;    
   
    obj.add(levels);
 
    return obj;
  };
  function createDoll(){

    var geom = new THREE.Geometry();
    var v1 = new THREE.Vector3(0,-0.2,0);
    var v2 = new THREE.Vector3(-0.9,0,0);
    var v3 = new THREE.Vector3(0,-1.2,0);
    var v4 = new THREE.Vector3(0.9,0,0);
     
    geom.vertices.push(v1);
    geom.vertices.push(v2);
    geom.vertices.push(v3);
    geom.vertices.push(v4);
    
    geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geom.faces.push( new THREE.Face3( 0, 2, 3 ) );

    geom.computeFaceNormals();
    
    var mesh = new THREE.Mesh( geom, new THREE.MeshBasicMaterial({ color: 0x6F6299 }) );
  
    return mesh;
  };
  function createDollHolder(){

    var obj = new THREE.Object3D();

    var obj1 = new THREE.Mesh( new THREE.CircleGeometry( 1, 32 ), new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    obj1.name = 'dollHolder'; 
    obj.add(obj1);

    var obj2 = new THREE.Mesh( new THREE.CircleGeometry( 0.85, 32 ), new THREE.MeshBasicMaterial({ color: 0x000000 }) );
    obj2.name = 'dollHolder';   
    obj.add(obj2);

    var obj3 = new THREE.Mesh( new THREE.CircleGeometry( 0.45, 32 ), new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    obj3.name = 'dollHolder';   
    obj.add(obj3);

    var obj4 = new THREE.Mesh( new THREE.CircleGeometry( 0.32, 32 ), new THREE.MeshBasicMaterial({ color: 0xA19EA1 }) );
    obj4.name = 'dollHolder';
    obj4.position.y = 0.9;  
    obj.add(obj4);

    return obj;
  };
 
  Doll.prototype.setVisibility = function(bool) {
    
    this.gearBar.visible = bool;
    this.gearBarSlider.visible = bool; 
    this.dollHolder.visible = bool;

    this.enablemouseEvents = bool;
  }; 
  Doll.prototype.rePosition = function(){  
     
    var frustum = new THREE.Frustum(); 
    var _this = this;
    this.camera.updateProjectionMatrix(); 

    frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse ) ); 

    for (var i = frustum.planes.length - 1; i >= 0; i--) {    
      var px = frustum.planes[i].intersectLine( new THREE.Line3( new THREE.Vector3(0,0,0), new THREE.Vector3(-1000,0,0) ) ) ; 
     
      if(px !== undefined ) {  
        this.xIntersect = px.x;
        this.doll.position.x = this.xIntersect + 9 ; 
        this.doll.position.y = 4; 
        this.dollHolder.position.x = this.xIntersect + 5.5 ; 
        this.gearBar.position.x = this.xIntersect + 5.5 ; 
        this.gearBarSlider.position.x = this.xIntersect + 5.5 ;

        for (var j = 0; j < this.levels.length ; j++) { 
          this.levels[j].position.x = this.xIntersect + 5.5 ;
          this.levelLabels[j].position.x = this.xIntersect + 12 ; 
        }; 
      } 
    }; 

  } 
  Doll.prototype.setAtomUnderDoll = function(atom){  
    this.atomUnderDoll = atom ;  
  };
  Doll.prototype.onDocumentMouseMove = function(event){ 
    var _this = this;
    
    if(this.enablemouseEvents !== true){
      return;
    }
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

    var intersects2 = raycaster.intersectObjects( this.objsToIntersect, true );
    var entered = false;

    for (var i = intersects2.length - 1; i >= 0; i--) {  
      if ( this.INTERSECTED !== intersects2[i].object && intersects2[i].object.name === 'doll') {
        entered = true;
        this.INTERSECTED = intersects2[i].object; 
        this.plane.object3d.position.copy( this.INTERSECTED.position );  
        document.getElementById(this.container).style.cursor = 'pointer';
      }  
      if(intersects2[i].object.name === 'dollHolder' ){
        entered = true;
        this.dollHolder.children[0].material.color.setHex(0x6F6299); // 0xCA_6A04 D537FF
        this.dollHolder.children[2].material.color.setHex(0x6F6299);
        this.dollHolder.children[3].material.color.setHex(0x6F6299);
        document.getElementById(this.container).style.cursor = 'pointer';
      }
      if((intersects2[i].object.name === 'doll' && this.dollOn === true)){
        document.getElementById(this.container).style.cursor = 'pointer';
        entered = true;
      }
      if((intersects2[i].object.name === 0) || (intersects2[i].object.name === 1) || (intersects2[i].object.name === 2) || (intersects2[i].object.name === 3) || (intersects2[i].object.name === 4) ){
        entered = true;
        intersects2[i].object.visible = true; 
        this.levelLabels[intersects2[i].object.name].visible = true;
        document.getElementById(this.container).style.cursor = 'pointer';
      } 
      if(intersects2[i].object.name === 'plusSymbol' || intersects2[i].object.name === 'minusSymbol'){
        entered = true; 
        document.getElementById(this.container).style.cursor = 'pointer';
      }
      if(intersects2[i].object.name === 'minus' || intersects2[i].object.name === 'plus'){
        entered = true; 
        if(this.gearState !== 5 && intersects2[i].object.name === 'plus') { 
          this.levelLabels[4].visible = false;
        } 
        if(this.gearState !== 1 && intersects2[i].object.name === 'minus') { 
          this.levelLabels[0].visible = false;
        }  
         
        document.getElementById(this.container).style.cursor = 'pointer';
        intersects2[i].object.material.color.setHex(0x6F6299); 
      }   
    };
    if(entered === false ){

      this.INTERSECTED = null; 
      document.getElementById(this.container).style.cursor = 'auto';  
      this.gearBar.children[1].material.color.setHex(0xA19EA1);
      this.gearBar.children[3].material.color.setHex(0xA19EA1);   
      this.dollHolder.children[0].material.color.setHex(0xA19EA1);
      this.dollHolder.children[2].material.color.setHex(0xA19EA1);
      this.dollHolder.children[3].material.color.setHex(0xA19EA1);

      for (var f = this.levels.length - 1; f >= 0; f--) { 
        this.levels[f].visible = false;
        this.levelLabels[f].visible = false;
      };

    }  
  };
  Doll.prototype.onDocumentMouseDown = function(event){  
    var _this = this;

    if(this.enablemouseEvents !== true){
      return;
    }
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

    var intersects = raycaster.intersectObjects( this.objsToIntersect, true );
 
    for (var i = intersects.length - 1; i >= 0; i--) { 
      
      if(intersects[i].object.name === 'dollHolder'){  
        if(this.soundMachine.procced) {
          this.soundMachine.play('dollHolder');
        }
        if(this.dollOn){
          intersects[i].object.parent.children[0].material.color.setHex(0xA19EA1);
          intersects[i].object.parent.children[2].material.color.setHex(0xA19EA1);
          intersects[i].object.parent.children[3].material.color.setHex(0xA19EA1); 
          this.rePosition();
          this.dollOn = false;
          this.doll.visible = false; 

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

          this.dollOn = true; 
          this.doll.visible = true;
      
        }
      }
      else if(intersects[i].object.name === 'minus'){
        this.soundMachine.play('dollHolder'); // to change 
         
        if(this.gearState > 1 ){
          this.gearState--;
          for (var k = this.levelLabels.length - 1; k >= 0; k--) {
            this.levelLabels[k].visible = false;
          };
          this.levelLabels[this.gearState-1].visible = true;
          setTimeout(function() {_this.levelLabels[_this.gearState-1].visible = false;}, 1000);
          this.gearBarSlider.position.y = yPosGearSlider[this.gearState-1];
          this.gearTour.setState(this.gearState);
        } 
      }  
      else if(intersects[i].object.name === 'plus'){ 
        this.soundMachine.play('dollHolder'); //to change 
        if(this.gearState < 5 ){
          this.gearState++;
          for (var k = this.levelLabels.length - 1; k >= 0; k--) {
            this.levelLabels[k].visible = false;
          };
          this.levelLabels[this.gearState-1].visible = true;
          setTimeout(function() {_this.levelLabels[_this.gearState-1].visible = false;}, 1000);
          this.gearBarSlider.position.y = yPosGearSlider[this.gearState-1];
          this.gearTour.setState(this.gearState);
        } 
      } 
      else if(intersects[i].object.name === 0 || intersects[i].object.name === 1 || intersects[i].object.name === 2 || intersects[i].object.name === 3 ||intersects[i].object.name === 4 ){ 
        this.gearBarSlider.position.y = yPosGearSlider[intersects[i].object.name];
        this.gearState = intersects[i].object.name + 1 ;
        if(this.soundMachine.procced) this.soundMachine.storePlay('dollHolder'); 
        this.gearTour.setState(this.gearState);
      }  
      else if(intersects[i].object.name === 'doll'){    
        this.crystalOrbit.control.enabled = false;
        this.SELECTED = intersects[i].object; 
        var intersects_ = raycaster.intersectObject( this.plane.object3d ); 
        this.offset.copy( intersects_[0].point ).sub( this.plane.object3d.position ); 
        document.getElementById(this.container).style.cursor = 'none'; 
      }
    };
       
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
    this.rePosition();
  };
  function makeTextSprite( message, parameters ) { 
    if ( parameters === undefined ) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ?  parameters["fontface"] : "Arial"; 
    var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18; 
    var borderThickness = parameters.hasOwnProperty("borderThickness") ?   parameters["borderThickness"] : 0; 
    var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 }; 
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:0};
  
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = " bold " + fontsize + "px " + fontface;
      
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness; 
    // text color 
    context.fillStyle = "rgba("+parameters.fontColor.r+", "+parameters.fontColor.g+", "+parameters.fontColor.b+", 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas) 
    texture.minFilter = THREE.NearestFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial( 
      { map: texture, useScreenCoordinates: false, transparent:true, opacity:1 } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(10,5,1.0);
    return sprite;  
  }

  return Doll;
  
});  
