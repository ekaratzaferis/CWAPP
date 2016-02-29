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
  };
 
  FitToCrystal.prototype.fit = function(){
    
    var  sign = -1; // direction
    var camera = this.orbitControl.camera;

    camera.updateMatrix(); // make sure camera's local matrix is updated
    camera.updateMatrixWorld(); // make sure camera's world matrix is updated
    camera.matrixWorldInverse.getInverse( camera.matrixWorld );

    var frustum = new THREE.Frustum();
    frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
    
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
 
    var camLookingAt = this.orbitControl.control.target.clone(), counter = 0 ;
      
    while( finished === false && camera.position.length() > 2){ /* counter is bug handler */
       
      var vec = camLookingAt.clone().sub(camera.position.clone());
      vec.setLength(vec.length() + sign);
       
      var newPos = new THREE.Vector3(-1*vec.x, -1*vec.y, -1*vec.z);
      var MCpos = newPos.clone();  
      MCpos.setLength(MCpos.length()-1);  
      this.scene.movingCube.position.copy(MCpos);
      camera.position.copy(newPos);

      camera.updateMatrix(); // make sure camera's local matrix is updated
      camera.updateMatrixWorld(); // make sure camera's world matrix is updated
      camera.matrixWorldInverse.getInverse( camera.matrixWorld );
  
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
    
  }; 

  function checkCollision(p, camera, position, radius, visibility, sign, bool){

    if(visibility === false){
      return bool;
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
