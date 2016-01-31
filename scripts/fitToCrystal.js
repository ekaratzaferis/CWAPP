'use strict';

define([
  'three', 
  'underscore'
], function(
  THREE, 
  _
) { 
 
  function FitToCrystal(orbitControl, lattice) { 
    
    this.orbitControl = orbitControl ; 
    this.lattice = lattice ; 
  };
 
  FitToCrystal.prototype.fit = function(){
    
    var  sign = -1; // direction

    this.orbitControl.camera.updateMatrixWorld();
    var frustum = new THREE.Frustum();
    frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( this.orbitControl.camera.projectionMatrix, this.orbitControl.camera.matrixWorldInverse ) );
    
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


    var camLookingAt = this.orbitControl.control.target.clone(), counter = 0;

    while( finished === false && counter < 50){
      
      var vec = camLookingAt.clone().sub(this.orbitControl.camera.position.clone());
      vec.setLength(vec.length() - 1);
      this.orbitControl.camera.position.set(sign*vec.x, sign*vec.y, sign*vec.z);

      this.orbitControl.camera.updateMatrixWorld();
      var frustum = new THREE.Frustum();
      frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( this.orbitControl.camera.projectionMatrix, this.orbitControl.camera.matrixWorldInverse ) );
 
      for (var j = frustum.planes.length - 1; j >= 0; j--) {  
        var p = frustum.planes[j]; 
        for (var i = this.lattice.actualAtoms.length - 1; i >= 0; i--) { 
          var sphere = new THREE.Sphere(this.lattice.actualAtoms[i].object3d.position.clone(), this.lattice.actualAtoms[i].radius); 
          console.log(p.distanceToSphere(sphere));
          if( ((sign ===  -1) && (p.distanceToSphere(sphere) < 1) ) || ((sign === 1) && (p.distanceToSphere(sphere) > 0.5 )) ){ 
            finished = true;
            console.log(p.distanceToSphere(sphere));
          } 
        };
      };
      
      counter++;
    }
    console.log('finished '+counter);
    
  }; 

   
  return FitToCrystal;

});
