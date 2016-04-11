'use strict';

define([
  'three', 
  'underscore'
], function(
  THREE, 
  _
) { 
 
  function FitToCrystal(orbitControl, lattice, renderer, scene) { 
    
    this.orbitControl = orbitControl ; 
    this.lattice = lattice ; 
    this.renderer = renderer ; 
    this.scene = scene;
    this.lastCameState = {
      position : this.orbitControl.camera.position.clone(), 
      target : this.orbitControl.control.target.clone()
    };

  };
  FitToCrystal.prototype.revertCamera = function(arg){
    var camera = this.orbitControl.camera;
    camera.position.copy(this.lastCameState.position);
    this.orbitControl.control.target.copy(this.lastCameState.target); 
  };
  FitToCrystal.prototype.fit = function(){
    
    var  sign = -1; // direction
    var camera = this.orbitControl.camera;

    this.lastCameState.position = camera.position.clone();
    this.lastCameState.target = this.orbitControl.control.target.clone();

    // find centroid
    var g = this.lattice.customBox(this.lattice.viewBox);
    var centroid = new THREE.Vector3(0,0,0);

    if(g !== undefined){ 
      centroid = new THREE.Vector3(); 
      for ( var z = 0, l = g.vertices.length; z < l; z ++ ) {
        centroid.add( g.vertices[ z ] ); 
      }  
      centroid.divideScalar( g.vertices.length );
    }
    //
    
    var camLookingAt = centroid, counter = 0 ;
    this.orbitControl.control.target = centroid ;
    this.orbitControl.update();
  
    var frustum = new THREE.Frustum();
    frustum.setFromMatrix( new THREE.Matrix4().multiply( camera.projectionMatrix, camera.matrixWorldInverse ) );
    
    for (var j = frustum.planes.length - 1; j >= 0; j--) {  
      var p = frustum.planes[j]; 
      for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
        var sphere = new THREE.Sphere(this.lattice.actualAtoms[i].object3d.position.clone(), this.lattice.actualAtoms[i].radius); 
        if(p.distanceToSphere(sphere) < 0.1 ){
          sign = 1;
        } 
      };
    };

    var finished = false;
  
    while( finished === false && camera.position.length() > 2 && counter < 10000 ){ /* counter is bug handler */
     
      var vec = camLookingAt.clone().sub(camera.position.clone());
      vec.setLength(vec.length() + sign);
       
      var newPos = new THREE.Vector3(-1*vec.x, -1*vec.y, -1*vec.z);
      var MCpos = newPos.clone();  
      MCpos.setLength(MCpos.length()-1);  
      this.scene.movingCube.position.copy(MCpos);
      camera.position.copy(newPos);
  
      var frustum = new THREE.Frustum();
      frustum.setFromMatrix( new THREE.Matrix4().multiply( camera.projectionMatrix, camera.matrixWorldInverse ) );
      
      finished = (sign === -1) ? finished : true ;

      for (var j = frustum.planes.length - 1; j >= 0; j--) {  
        
        var p = frustum.planes[j];  
        
        for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
          finished = checkCollision(p, camera,this.lattice.actualAtoms[i].object3d.position.clone(), this.lattice.actualAtoms[i].radius, this.lattice.actualAtoms[i].visibility, sign, finished);
        };

        for (var i = this.lattice.cachedAtoms.length - 1; i >= 0; i--) { 
          finished = checkCollision(p, camera,this.lattice.cachedAtoms[i].object3d.position.clone(), this.lattice.cachedAtoms[i].radius, this.lattice.cachedAtoms[i].visibility, sign, finished);
        };

        _.each(this.lattice.points, function(point, reference) { 
          finished = checkCollision(p, camera,point.object3d.position.clone(), 0.04, true, sign, finished);
        }); 
 
      };
      
      counter++;
    }  
    console.log(this.orbitControl.camera.position);
    console.log(this.orbitControl.control.target);
    this.orbitControl.update();
  }; 

  function checkCollision(p, camera, position, radius, visibility, sign, bool){

    if(visibility === false){
      //return bool;
    }

    var sphere = new THREE.Sphere(position, radius); 
           
    if( sign === 1 && p.distanceToSphere(sphere) < 0.5 ){ 
      bool = false;
    }

    if( sign === -1 && p.distanceToSphere(sphere) < 1 ){ 
      bool = true; 
    }

    return bool;

  }

  return FitToCrystal;

});
