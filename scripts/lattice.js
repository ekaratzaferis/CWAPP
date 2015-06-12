'use strict';

define([
  'pubsub', 'three', 'underscore',
  'point', 'grid','face','millervector','millerplane', 'crystalAtom', 'explorer'
], function(
  PubSub, THREE, _,
  Point, Grid, Face, MillerVector, MillerPlane, CrystalAtom, Explorer
) {
  var events = {
    LOAD: 'lattice.load',
    DIRECTION_STATE: 'lattice.direction_state', 
    PLANE_STATE: 'lattice.plane_state'
  };

  var defaultParameters = {
    repeatX: 1, repeatY: 1, repeatZ: 1,
    scaleX: 1, scaleY: 1, scaleZ: 1,
    alpha: 90, beta: 90, gamma: 90
  };

  var shearing = [
    'alpha', 'beta', 'gamma'
  ];

  var reverseShearing = shearing.slice(0).reverse();

  var scaling = [
    'scaleX', 'scaleY', 'scaleZ'
  ];

  var reverseScaling = scaling.slice(0).reverse();

  function Lattice(menu, soundMachine) {

    // lattice
    this.menu = menu ;  
    this.lattice = null;
    this.parameters = defaultParameters;
    this.points = {}; 
    this.mutex = false;
    this.currentMotif = [];
    this.latticeName = 'none';  
    this.latticeType = 'none'; // may be useless
    this.latticeSystem = 'none'; // may be useless 
    this.actualAtoms =[]; 

    // grade
    this.gradeChoice = {"face":false, "grid":false};
    this.gridPointsPos = [];
    this.grids = [];
    this.hexGrids = {};
    this.faces = [];
    this.gradeParameters = {"radius" : 1, "cylinderColor" : "FFFFFF" , "faceOpacity" : 1 , "faceColor" : "FFFFFF"};
    this.hexagonalShapes = [] ;
    // miller
    this.millerParameters = []; 

    this.millerPlanes = [];
    this.planeState = {state:"initial", editing : undefined, dname : undefined};
    this.planeList =[];
    this.tempPlanes =[];

    this.millerDirections = [];
    this.directionalState = {state:"initial", editing : undefined, dname : undefined};    
    this.directionalList =[];
    this.tempDirs = [] ;
    this.planesUnique = [];
    this.directionsUnique = [] ;

    //view
    this.viewBox = [];
    this.viewMode = 'Classic';
  }; 
  Lattice.prototype.changeView = function(arg) {
    var _this = this, i =0;
    _this.viewMode = arg ;
    if(this.actualAtoms.length!==0){
      
      var geometry = new THREE.Geometry();  
      var scene = Explorer.getInstance().object3d;

      while(i < _this.viewBox.length ) {  
        _this.viewBox[i].object3d.updateMatrix();  
        geometry.merge( _this.viewBox[i].object3d.geometry, _this.viewBox[i].object3d.matrix ); 
        i++; 
      } 

      var box = new THREE.Mesh(_this.customBox(_this.viewBox), new THREE.MeshLambertMaterial({color:"#FF0000" }) );
      
      if(_this.viewMode === 'Subtracted'){
        i = 0 ;
        while(i < _this.actualAtoms.length ) {
          _this.actualAtoms[i].object3d.visible = true; 
          _this.actualAtoms[i].subtractedSolidView(box, _this.actualAtoms[i].object3d.position); 
          i++;
        } 
        var object = scene.getObjectByName('solidvoid');
        if(!_.isUndefined(object)) scene.remove(object);
       
      }
      else if(_this.viewMode === 'SolidVoid'){   

        var geometry = new THREE.Geometry();  
         
        while(i < _this.actualAtoms.length ) {  
          _this.actualAtoms[i].SolidVoid(_this.actualAtoms[i].object3d.position);  
          var mesh = new THREE.Mesh(new THREE.SphereGeometry(_this.actualAtoms[i].getRadius(), 32, 32), new THREE.MeshLambertMaterial() );
          mesh.position.set( _this.actualAtoms[i].object3d.position.x, _this.actualAtoms[i].object3d.position.y, _this.actualAtoms[i].object3d.position.z);
          mesh.updateMatrix();  
          geometry.merge( mesh.geometry, mesh.matrix );
          _this.actualAtoms[i].object3d.visible = false;   

          i++; 
        } 

        var cube = THREE.CSG.toCSG(box); 
        cube = cube.inverse();
        var spheres = THREE.CSG.toCSG(geometry);
        var geometryCSG = cube.subtract(spheres);
        var geom = THREE.CSG.fromCSG(geometryCSG);
        var finalGeom = assignUVs(geom);
   
        var solidBox = new THREE.Mesh( finalGeom, new THREE.MeshLambertMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  })  );
        solidBox.name = 'solidvoid';
        Explorer.add({'object3d' : solidBox}); 
      }
      else if(_this.viewMode === 'gradeLimited'){   

      }
      else if(_this.viewMode === 'Classic'){ 
        while(i < _this.actualAtoms.length ) { 
          _this.actualAtoms[i].object3d.visible = true;
          _this.actualAtoms[i].classicView(); 
          i++;
        }  
        var object = scene.getObjectByName('solidvoid');
        if(!_.isUndefined(object)) scene.remove(object);
      }

    }
  };
  Lattice.prototype.destroyPoints = function() {
    var _this = this; 
    _.each(this.points, function(point, reference) {
      point.destroy();
      delete _this.points[reference];
    });
  }; 
  Lattice.prototype.destroyGrids = function() {
    var _this = this; 
    _.each(this.grids, function(grid, reference) {
      grid.grid.destroy();
      delete _this.grids[reference];
    });
  }; 
  Lattice.prototype.updateLatticeUI = function( params){


    this.menu.setSliderValue("beta", params.beta );
    this.menu.setSliderValue("gamma", params.gamma );
    this.menu.setSliderValue("alpha", params.alpha );

    $('#beta').val(params.scaleZ);
    $('#alpha').val(params.scaleZ);
    $('#gamma').val(params.scaleZ);

    $('#scaleX').val(params.x);
    $('#scaleY').val(params.y);
    $('#scaleZ').val(params.z);

  }
  Lattice.prototype.setMotif = function(motif, params){
    var _this = this ; 
    this.updateLatticeUI(params);
    _this.currentMotif = motif ;

    _.each(_this.actualAtoms, function(atom,k) {
      atom.destroy();   
    }); 
    _this.actualAtoms.splice(0); 

    _this.backwardTransformations();
     
    this.parameters.scaleX = params.x ;
    this.parameters.scaleY = params.y ;
    this.parameters.scaleZ = params.z ;
    this.parameters.alpha = params.alpha ;
    this.parameters.beta = params.beta ;
    this.parameters.gamma = params.gamma ;

    _this.forwardTransformations();  
    
    _.each(_this.points, function(point,kk) { 
      var p = point.object3d.position.clone(); 
      _.each(motif, function(atom) {   
        var a = atom.object3d.position.clone();   
        _this.actualAtoms.push( 
          new CrystalAtom(
            new THREE.Vector3(p.x + a.x, p.y + a.y, p.z + a.z), 
            atom.getRadius(), 
            atom.object3d.children[0].material.color,
            atom.elementName, 
            atom.getID(),
            a.x,
            a.y,
            a.z,
            p,
            atom.object3d.children[1].material.map.image.currentSrc,
            atom.object3d.children[0].material.opacity,
            atom.object3d.children[2].material.wireframe,
            kk
          )  
        );
      });
    });  

    _this.updateLatticeTypeRL();

    console.log(this.actualAtoms.length);
  }; 
  Lattice.prototype.createGrid = function() {
    
    var gridPoints = this.lattice.gridPoints;
    var usedGridOrigins = [];
     
    if (_.isUndefined(gridPoints) && (this.latticeName !== 'hexagonal')) { 
      return;
    }
    
    var parameters = this.parameters;
    var origin, g,destinationReference;
    var destination;
    var _this = this;
    var visible = (this.gradeChoice.grid  ) ;
     
    // erase previous grid 
    this.destroyGrids();
     
    _.times(parameters.repeatX , function(_x) {
      _.times(parameters.repeatY , function(_y) {
        _.times(parameters.repeatZ , function(_z) {
             
          _.each(gridPoints, function(xyz, which){

            switch(which) {
              case 'first':  
                var originReference = 'r_' + (xyz[0]+_x) +'_'+ (xyz[1]+_y) + '_'+ (xyz[2]+_z) + '_0';
                 
                if (_.isUndefined(usedGridOrigins[originReference])) {
                    
                    origin = _this.points[originReference];

                    destinationReference = 'r_' + (1+_x) + '_' + _y + '_' + _z + '_0';
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({ grid:g, origin:originReference, destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0 });
                    
                    destinationReference = 'r_' + _x + '_' + (1+_y) + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + _x + '_' + _y + '_' + (1+_z) + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    usedGridOrigins[originReference] = 1;
                     
                }
                
                break;

              case 'left':
                var originReference = 'r_' + (xyz[0]+_x) +'_'+ (xyz[1]+_y) +'_'+ (xyz[2]+_z) + '_0'; 

                if (_.isUndefined(usedGridOrigins[originReference])) { 

                    origin = _this.points[originReference];

                    destinationReference = 'r_' + (1+_x) + '_' + _y + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + _x + '_' + (1+_y) + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + (1+_x) + '_' + (1+_y) + '_' + (1+_z) + '_0' ; 
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    usedGridOrigins[originReference] = 1;
                }
                break;
              case 'right':
                var originReference = 'r_' + (xyz[0]+_x) +'_'+ (xyz[1]+_y) +'_'+ (xyz[2]+_z) + '_0'; 

                if (_.isUndefined(usedGridOrigins[originReference])) { 

                    origin = _this.points[originReference];

                    destinationReference = 'r_' + (1+_x) + '_' + _y + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + _x + '_' + _y + '_' + (1+_z) + '_0' ; 
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + (1+_x) + '_' + (1+_y) + '_' + (1+_z) + '_0' ; 
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    usedGridOrigins[originReference] = 1;
                }
                break;
              case 'front':
                var originReference = 'r_' + (xyz[0]+_x) +'_'+ (xyz[1]+_y) +'_'+ (xyz[2]+_z) + '_0'; 
                if (_.isUndefined(usedGridOrigins[originReference])) { 

                    origin = _this.points[originReference];

                    destinationReference = 'r_' + _x + '_' + (1+_y) + '_' + _z + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + _x + '_' + _y + '_' + (1+_z) + '_0';
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    destinationReference = 'r_' + (1+_x) + '_' + (1+_y) + '_' + (1+_z) + '_0' ;
                    destination = _this.points[destinationReference];
                    g = new Grid(origin.object3d.position, destination.object3d.position, visible);
                    _this.grids.push({grid:g, origin:originReference,destination:destinationReference, a:origin.object3d.position, b:destination.object3d.position, updated:0});

                    usedGridOrigins[originReference] = 1;
                }
                break; 
            } 
          }); 
        });
      });
    }); 
 
  }; 
  Lattice.prototype.updatePoints = function() { 

    var lattice = this.lattice; 
    this.destroyPoints();
     
    if (_.isEmpty(lattice)) return; 

    var parameters = this.parameters;
    var origin = lattice.originArray[0];
    var vector = lattice.vector;

    var limit = new THREE.Vector3(
      parameters.repeatX * vector.x + origin.x,
      parameters.repeatY * vector.y + origin.y,
      parameters.repeatZ * vector.z + origin.z
    );
    var index;
    var originLength = lattice.originArray.length, currentPoint, previousPoint;    
     
    var _this = this;

    if(_this.latticeName !== 'hexagonal'){
      var position;
      var reference;
      _.times(parameters.repeatX + 1, function(_x) {
        _.times(parameters.repeatY + 1, function(_y) {
          _.times(parameters.repeatZ + 1, function(_z) {  
            for (var index = 0; index < originLength; index++) {
              origin = lattice.originArray[index];
              position = new THREE.Vector3(
                _x * vector.x + origin.x,
                _y * vector.y + origin.y,
                _z * vector.z + origin.z
              ); 
              if (position.x <= limit.x && position.y <= limit.y && position.z <= limit.z) 
              {     
                reference = 'r_' + _x + '_' + _y + '_' + _z + '_' + index;
                 
                if (_.isUndefined(_this.points[reference])) {
                  _this.points[reference] = new Point(position);   
                }
              }                   
            }
          }); // repeat X
        }); // repeat Y
      }); // repeat Z
    }
    else{ 
      _.each(_this.grids, function(grid) {
        grid.grid.destroy(); 
      });  
      while(_this.grids.length > 0) {
          _this.grids.pop();
      }; 
      _.each(_this.hexGrids, function(g, reference) {
        _this.hexGrids[reference] = false;
      });  

      var a = parameters.scaleZ ;
      var c = parameters.scaleY ;
      var co = 0 , previousPoint, currentPoint;

      var vertDist = a*Math.sqrt(3);
      _this.hexagonalShapes.splice(0);
      _.times(parseInt(parameters.repeatY) + 1, function(_y) {
        _.times(parseInt(parameters.repeatX)   , function(_x) {
          _.times(parseInt(parameters.repeatZ)  , function(_z) {
            var hexPoints = [];
            // point in the middle
            var z = (_x % 2==0) ? (_z*vertDist) : ((_z*vertDist + vertDist/2));
            var y =  _y*c ;
            var x = _x*a*1.5 ;
            var reference = 'h_'+(x).toFixed(2)+(y).toFixed(2)+(z).toFixed(2) ; 
            _this.points[reference] = new Point(new THREE.Vector3(x,y,z)); 
            // point in the middle 

            _.times(6 , function(_r) {

              var v = new THREE.Vector3( a, 0, 0 ); 
              var axis = new THREE.Vector3( 0, 1, 0 );
              var angle = (Math.PI / 3) * _r ; 
              v.applyAxisAngle( axis, angle );

              var z = (_x % 2==0) ? (v.z + _z*vertDist) : ((v.z + _z*vertDist + vertDist/2));
              var y =  v.y + _y*c ;
              var x = v.x + _x*a*1.5 ;
              
              var position = new THREE.Vector3( x, y, z);
              z = z.toFixed(2) ;
              if(z==0) z = '0.00'; // check for negative zeros  

              var reference = 'h_'+(x).toFixed(2)+(y).toFixed(2)+z ;
              hexPoints.push(position);
              if (_.isUndefined( _this.points[reference])) { 
                _this.points[reference] = new Point(position);   
                if(_y>0) _this.createHexGrid([position, new THREE.Vector3(position.x, position.y - c, position.z)],true);
              }  

            });

            _this.createHexGrid(hexPoints,false);
            _this.hexagonalShapes.push(hexPoints); 
          });
        });
      }); 
    };   
  };
  Lattice.prototype.createHexGrid = function(hexPoints, vertical) {
    var _this = this;
    var visible = (this.gradeChoice.grid ); //recreate motif inm lattice and add atom in motif
    if(vertical){
      var a = hexPoints[0];
      var b = hexPoints[1];

      var x = (a.x).toFixed(2);
      var y = (a.y).toFixed(2);
      var z = (a.z).toFixed(2);

      var k = (b.x).toFixed(2);
      var l = (b.y).toFixed(2);
      var m = (b.z).toFixed(2); 
          
      if(z==0) z = '0.00';
      if(m==0) m = '0.00'; 

      var originReference = 'h_'+x+y+z ;
      var destinationReference = 'h_'+k+l+m ; 
      var g = new Grid(hexPoints[0], hexPoints[1],  visible);

      _this.grids.push({ grid:g, origin:originReference, destination:destinationReference, a:a, b:b, updated:0 });
      updateGrid(_this.grids[_this.grids.length-1]);
         
    }
    else{ 
      for (var i = 0 ; i< hexPoints.length ; i++) {
        var a = hexPoints[i];
        var b = (i === 5 ) ? hexPoints[0] : hexPoints[i+1];

        var x = (a.x).toFixed(2);
        var y = (a.y).toFixed(2);
        var z = (a.z).toFixed(2);

        var k = (b.x).toFixed(2);
        var l = (b.y).toFixed(2);
        var m = (b.z).toFixed(2); 
            
        if(z==0) z = '0.00';
        if(m==0) m = '0.00';

        var reference = 'h_'+x+y+z+k+l+m ;
        var reference2 = 'h_'+k+l+m+x+y+z ;
        var originReference = 'h_'+x+y+z ;
        var destinationReference = 'h_'+k+l+m ;
         
        /*if(_this.hexGrids[reference] == undefined) _this.hexGrids[reference] = false;

        if(_this.hexGrids[reference] === false && _this.hexGrids[reference2] === undefined){  
          _this.hexGrids[reference] = true; */
  
          var g = new Grid(a,b, visible);
          _this.grids.push({ grid:g, origin:originReference, destination:destinationReference, a:a, b:b, updated:0  });
          updateGrid(_this.grids[_this.grids.length-1]);
        //}
      };
    } 
  };
  Lattice.prototype.recreateMotif = function() {
    
    var _this = this;
     
    if(_this.currentMotif.length === 0 ) return ;
    _.each(_this.points, function(point,kk) { 
      var p = point.object3d.position; 
      _.each(_this.currentMotif, function(atom) {  
        var a = atom.object3d.position; 
        var color, texture, opacity, wireframe;
        if(!_.isUndefined(atom.object3d) && !atom.object3d.children) { 
          color = atom.color; 
          texture = atom.texture;
          opacity = atom.opacity;
          wireframe = atom.wireframe; 
        }
        else{ 
          atom.object3d.children[0].material.color ; 
          texture = atom.object3d.children[1].material.map.image.currentSrc ;
          opacity = atom.object3d.children[1].material.opacity ;
          wireframe = atom.object3d.children[2].material.wireframe ;
          color = atom.color ;
        }
        _this.actualAtoms.push( 
          new CrystalAtom(
            new THREE.Vector3(p.x + a.x, p.y + a.y, p.z + a.z), 
            atom.getRadius(), 
            color,
            atom.elementName, 
            atom.getID(),
            a.x,
            a.y,
            a.z,
            p,
            texture,
            opacity,
            wireframe,
            kk
          )  
        );
      });
    });   
  };
  Lattice.prototype.getAnglesScales = function(){

    var anglesScales = {  
      "alpha" : this.lattice.defaults.alpha, 
      "beta" : this.lattice.defaults.beta, 
      "gamma" : this.lattice.defaults.gamma,
      "scaleX" : this.parameters.scaleX,
      "scaleY" : this.parameters.scaleY,
      "scaleZ" : this.parameters.scaleZ  
    }; 
     
    return anglesScales ; 
  };
  Lattice.prototype.load = function(latticeName) {  
    if (_.isEmpty(latticeName)) {
      this.lattice = null;
      this.destroyPoints();
      PubSub.publish(events.LOAD, null);
      return;
    }

    var _this = this;

    _this.latticeName = latticeName;
    require(['lattice/' + latticeName], function(lattice) {
      _this.lattice = lattice; 
      _this.latticeSystem = _this.lattice.latticeSystem ;
      _this.latticeType = _this.lattice.latticeType ;
      _this.update();
      PubSub.publish(events.LOAD, lattice); 
    }); 
  };

  var transformationMatrix = function(parameter) {
     
    // According to wikipedia model
    var ab = Math.tan((90 - ((parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - (( parameter.alpha) || 90)) * Math.PI / 180);

    var sa = parameter.scaleX || 1; 
    var sb = parameter.scaleY || 1;
    var sc = parameter.scaleZ || 1;

    /* if we do not have scales :  

      1, ab, ac,       x        x*1 + ab*y + ac*z
      0,  1,  0,   X   y   =          y*1
      0, bc,  1,       z           bc*y + z*1
      0,  0,  0,                      0         
          
    */
    
    var m = new THREE.Matrix4();
    m.set(
      sa, ab, ac,  0,
      xy, sb, zy,  0,
      xz, bc, sc,  0,
       0,  0,  0,  1
    );
     
    return m;
  }; 
  Lattice.prototype.transform = function(caller, parameterKeys, operation) {  
    var matrix; 
    var argument;
    var points = this.points;
    var actualAtoms = this.actualAtoms;
    var parameters = this.parameters;
    var _this = this;
      
    _.each(parameterKeys, function(k) { 
      if (_.isUndefined(parameters[k]) === false) { 
        argument = {};
        argument[k] = operation(parameters[k]); 
        matrix = transformationMatrix(argument);  
        _.each(_this.actualAtoms, function(atom) {
          if(!_.isUndefined(atom.object3d)){     
            atom.centerOfMotif.applyMatrix4(matrix);  
            atom.object3d.position.x = atom.centerOfMotif.x + atom.offsetX;  
            atom.object3d.position.y = atom.centerOfMotif.y + atom.offsetY;  
            atom.object3d.position.z = atom.centerOfMotif.z + atom.offsetZ; 
          } 
        }); 
        _.each(points, function(point, reference) { 
          var pos = point.object3d.position.applyMatrix4(matrix);   
          if(caller==0) { 
            _.each(_this.grids, function(grid){ 
              if(grid.origin == reference) {  
                grid.a = pos;
                grid.updated++; 
                if(grid.updated==2) { 
                  grid.updated = 0;
                  updateGrid(grid);
                }
              }
              else if(grid.destination == reference){ 
                grid.b = pos;
                grid.updated++; 
                if(grid.updated==2){ 
                  grid.updated = 0;
                  updateGrid(grid);
                } 
              }
            }); 
          } 
        });   
        _.each(_this.faces, function(face, k) {
          _.each(face.object3d.geometry.vertices, function(vertex , k){ 
            face.object3d.geometry.verticesNeedUpdate = true ; 
            vertex.applyMatrix4(matrix); 
          });   
        });             
      } 
      _.each(_this.millerPlanes, function(plane, reference) { 
        plane.plane.object3d.geometry.verticesNeedUpdate = true ;
        var vertices = plane.plane.object3d.geometry.vertices;
        _.each(vertices, function(vertex , k){  
          vertex.applyMatrix4(matrix); 
        });
      });
      _.each(_this.millerDirections, function(directional, reference) {
        directional.startPoint.applyMatrix4(matrix);
        directional.endpointPoint.applyMatrix4(matrix)
        updateMillerVector(directional);  

      }); 
    }); 
  };


  Lattice.prototype.createFaces = function(){ 
    var _this = this;
    var parameters = this.parameters;
    var gradeParameters = this.gradeParameters;
    var visible = (this.gradeChoice.face  );

    _.each(this.faces, function(face, reference) {
      face.destroy();
    });
    _this.faces.splice(0);
    _this.viewBox.splice(0);
    
    if(this.latticeName !== 'hexagonal'){
      for (var _z = 0; _z <= parameters.repeatZ; _z++) {   
           
        _this.faces.push(
          new Face(
            _this.points['r_0_0_'+_z+'_0'].object3d.position , 
            _this.points['r_0_'+parameters.repeatY+'_'+_z+'_0'].object3d.position , 
            _this.points['r_'+parameters.repeatX+'_0_'+_z+'_0'].object3d.position ,
            _this.points['r_'+parameters.repeatX+'_'+parameters.repeatY+'_'+_z+'_0'].object3d.position,
            gradeParameters.faceOpacity, 
            gradeParameters.faceColor,
            visible 
            )
        );
        
        if(_z == 0) {   
           _this.viewBox['_000'] = _this.points['r_0_0_'+_z+'_0'].object3d; 
           _this.viewBox['_010'] = _this.points['r_0_'+parameters.repeatY+'_'+_z+'_0'].object3d; 
           _this.viewBox['_100'] = _this.points['r_'+parameters.repeatX+'_0_'+_z+'_0'].object3d;
           _this.viewBox['_110'] = _this.points['r_'+parameters.repeatX+'_'+parameters.repeatY+'_'+_z+'_0'].object3d;
        }
        else if(_z == parameters.repeatZ){  
          _this.viewBox['_001'] = _this.points['r_0_0_'+_z+'_0'].object3d ; 
          _this.viewBox['_011'] = _this.points['r_0_'+parameters.repeatY+'_'+_z+'_0'].object3d; 
          _this.viewBox['_101'] = _this.points['r_'+parameters.repeatX+'_0_'+_z+'_0'].object3d ;
          _this.viewBox['_111'] = _this.points['r_'+parameters.repeatX+'_'+parameters.repeatY+'_'+_z+'_0'].object3d;
        }
      };
          
      for (var _y = 0; _y <= parameters.repeatY; _y++) {   
         
        _this.faces.push(
          new Face(
            _this.points['r_0_'+_y+'_0_0'].object3d.position , 
            _this.points['r_'+parameters.repeatX+'_'+_y+'_0_0'].object3d.position , 
            _this.points['r_0_'+_y+'_'+parameters.repeatZ+'_0'].object3d.position ,
            _this.points['r_'+parameters.repeatX+'_'+_y+'_'+parameters.repeatZ+'_0'].object3d.position,
            gradeParameters.faceOpacity, 
            gradeParameters.faceColor,
            visible 
            )
        );
         
      }; 

      for (var _x = 0; _x <= parameters.repeatX; _x++) {   
         
        _this.faces.push(
          new Face(
            _this.points['r_'+_x+'_0_0_0'].object3d.position , 
            _this.points['r_'+_x+'_'+parameters.repeatY+'_0_0'].object3d.position , 
            _this.points['r_'+_x+'_0_'+parameters.repeatZ+'_0'].object3d.position ,
            _this.points['r_'+_x+'_'+parameters.repeatY+'_'+parameters.repeatZ+'_0'].object3d.position,
            gradeParameters.faceOpacity, 
            gradeParameters.faceColor,
            visible  
            )
        );
         
      }; 
    } 
    else{
      for (var i = 0; i < _this.hexagonalShapes.length ; i++) { 
        var oneHex = _this.hexagonalShapes[i]; 
        _this.createHexFace(oneHex, gradeParameters.faceOpacity, gradeParameters.faceColor, visible);  
      }; 
    }  
  };
  Lattice.prototype.createHexFace = function(hexagon, faceOpacity, faceColor, visible){

    var _this = this ;
    var parameters = this.parameters;
    _this.faces.push(
      new Face(
        hexagon[0] , 
        hexagon[1] , 
        hexagon[2] , 
        hexagon[3] ,  
        faceOpacity, 
        faceColor,
        visible ,
        hexagon[4] , 
        hexagon[5]  
      )
    );
    if(hexagon[0].y>0){  
      for (var i = 0; i<6; i++) {
        var next = (i==5) ? hexagon[0] : hexagon[i+1] ;
        _this.faces.push(
          new Face(
            hexagon[i] , 
            next , 
            new THREE.Vector3(next.x, next.y - parameters.scaleY, next.z) , 
            new THREE.Vector3(hexagon[i].x, hexagon[i].y - parameters.scaleY, hexagon[i].z) ,  
            faceOpacity, 
            faceColor,
            visible ,
            0  
          )
        );
      }; 
    }; 
  };
  function updateMillerVector(directional) { 
     
    var arrow = directional.direction.object3d;
    var start = directional.startPoint.clone();
    var end = directional.endpointPoint.clone();

    var length =  start.distanceTo(end) ; 
    var direction = new THREE.Vector3().subVectors( end,  start).normalize();
 
    arrow.position.set(start.x, start.y, start.z);
    arrow.setDirection(direction.normalize());
    arrow.setLength(length,  length/8, length/20); 
    directional.direction.updateDirectionPos(start, end); 
  };
  Lattice.prototype.directionParameterChange = function(arg) {
    var _this = this, parameters = this.parameters ;
    
   // _.each(_this.tempDirs, function(directional, ref) {
      if( !_.isUndefined(arg.dirRadius)) { 
        _.each(_this.tempDirs, function(directional, ref) {
          directional.direction.updateTubeRadius(arg.dirRadius);   
        });
      }   
      else if( !_.isUndefined(arg.directionColor)) { 
        _.each(_this.tempDirs, function(directional, ref) {
          directional.direction.setColor(arg.directionColor);
        });   
      } 
      else if( !_.isUndefined(arg.millerU) || !_.isUndefined(arg.millerV) || !_.isUndefined(arg.millerW) || !_.isUndefined(arg.millerT) ) { 
         
        var u = (_.isUndefined(arg.millerU)) ? _this.tempDirs[0].u : parseInt(arg.millerU); 
        var v = (_.isUndefined(arg.millerV)) ? _this.tempDirs[0].v : parseInt(arg.millerV); 
        var w = (_.isUndefined(arg.millerW)) ? _this.tempDirs[0].w : parseInt(arg.millerW); 
        var t = (_.isUndefined(arg.millerT)) ? _this.tempDirs[0].t : parseInt(arg.millerT); 
         
        if((this.latticeName === 'hexagonal')){
           
        }
        else{ 
          var devider = Math.max(Math.abs(u),Math.abs(v),Math.abs(w)), counter = 0;
          u/=devider;
          v/=devider;
          w/=devider;  

          _.times(parameters.repeatX , function(_x) {
            _.times(parameters.repeatY , function(_y) {
              _.times(parameters.repeatZ , function(_z) { 

                var directional = _this.tempDirs[counter];
                var startPoint = (new THREE.Vector3 ( (v < 0 ? (v*(-1)) : 0 ) , (w < 0 ? (w*(-1)) : 0 ) , (u < 0 ? (u*(-1)) : 0 ))) ; 
                var endpointPoint = new THREE.Vector3 (  (v < 0 ? 0 : v ) , (w < 0 ? 0 : w ) , (u < 0 ? 0 : u ) ) ; 
                startPoint.x += _x ; 
                startPoint.y += _y ; 
                startPoint.z += _z ; 
                endpointPoint.x += _x ; 
                endpointPoint.y += _y ; 
                endpointPoint.z += _z ;  
                 
                directional.u = parseInt($('#millerU').val()) ; 
                directional.v = parseInt($('#millerV').val()) ; 
                directional.w = parseInt($('#millerW').val()) ; 
                directional.t = parseInt($('#millerT').val()) ; 
                directional.startPoint = startPoint; 
                directional.endpointPoint = endpointPoint; 
                directional.id = ("_"+($('#millerU').val())+""+($('#millerV').val())+""+($('#millerW').val())+"") ;
                
                _this.forwardTransformationsMiller(_this.tempDirs[counter]);   
                directional.direction.updateDirectionPos(startPoint, endpointPoint); 
              
                counter++;
              });
            });
          });
        } 
      }   
       
    //});  


  };
  Lattice.prototype.planeParameterChange = function(arg) {
    var _this = this, parameters = this.parameters ;
     
    if( !_.isUndefined(arg.planeColor)) {
      _.each(_this.tempPlanes, function(plane, ref) { 
        plane.plane.setColor(arg.planeColor);  
      }); 
    }   
    else if( !_.isUndefined(arg.planeOpacity)) { 
      _.each(_this.tempPlanes, function(plane, ref) {
        plane.plane.setOpacity(arg.planeOpacity);   
      });
    } 
    else if( !_.isUndefined(arg.millerH) || !_.isUndefined(arg.millerK) || !_.isUndefined(arg.millerL) || !_.isUndefined(arg.millerI) ) { 
      var counter = 0 ;
      var h = parseInt(($('#millerH').val())); 
      var k = parseInt(($('#millerK').val())); 
      var l = parseInt(($('#millerL').val())); 
      var i = parseInt(($('#millerI').val())); 
      
      h = (h!=0) ? 1/h : 0 ;
      k = (k!=0) ? 1/k : 0 ;
      l = (l!=0) ? 1/l : 0 ;
        

      if(_this.latticeName !== 'hexagonal'){
        if( h!=0 && k!=0 && l!=0) { 
          _.times(parameters.repeatX , function(_x) {
            _.times(parameters.repeatY , function(_y) {
              _.times(parameters.repeatZ , function(_z) {        
                var a = new THREE.Vector3( (k<0 ? (1+k) : k) + _x,  (l<0 ? 1 : 0 ) + _y , (h<0 ? 1 : 0) + _z); 
                var b = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x,  (l<0 ? (1+l) : l ) + _y, (h<0 ? 1 : 0) + _z ); 
                var c = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x, (l<0 ? 1 : 0 ) + _y, (h<0 ? (1+h) : h) + _z );
                var plane = _this.tempPlanes[counter];
                 
                plane.a = a ; 
                plane.b = b ; 
                plane.c = c ; 
                plane.h = parseInt(($('#millerH').val())) ; 
                plane.k = parseInt(($('#millerK').val())) ;  
                plane.l = parseInt(($('#millerL').val())) ;  
                plane.id =  ("_"+($('#millerH').val())+""+($('#millerK').val())+""+($('#millerL').val())+"");
                 
                var vertices = plane.plane.object3d.geometry.vertices;
                vertices[0] = a ;
                vertices[1] = b ;
                vertices[2] = c ;

                _this.forwardTransformationsMiller(plane);  
                
                counter++;
              });
            });
          });
        }
        else{ 
          var a = new THREE.Vector3(0,0,0), b = new THREE.Vector3(0,0,0), c = new THREE.Vector3(0,0,0) , d = new THREE.Vector3(0,0,0);  
          if (h!=0){
            a.z = h;
            if(k!=0){
              b.z = h;
              b.y = 1;
              c.x = k;
              c.y = 1;
              d.x = k;
            }
            else if(l!=0){
              b.z = h;
              b.x = 1;
              c.x = 1;
              c.y = l;
              d.y = l;
            }
            else{
              b.z = h;
              b.y = 1;
              c.x = 1;
              c.y = 1;
              c.z = h;
              d.x = 1;
              d.z = h;
            }
          }
          else if(k!=0){
            a.x = k;
            if(l!=0){
              b.z = 1;
              b.x = k;
              c.y = l;
              c.z = 1;
              d.y = l;     
            }
            else{
              b.x = k;
              b.y = 1;
              c.z = 1;
              c.x = k;
              c.y = 1;
              d.z = 1;
              d.x = k;
            } 
          }
          else{
            a.y = l;
            b.y = l;
            b.x = 1;
            c.x = 1;
            c.y = l;
            c.z = 1;
            d.y = l;
            d.z = 1; 
          }
          if(h<0) {
            a.z+=1;
            b.z+=1;
            c.z+=1;
            d.z+=1;
          }
          if(k<0) {
            a.x+=1;
            b.x+=1;
            c.x+=1;
            d.x+=1;
          }
          if(l<0) {
            a.y+=1;
            b.y+=1;
            c.y+=1;
            d.y+=1;
          }
          _.times(parameters.repeatX , function(_x) {
            _.times(parameters.repeatY , function(_y) {
              _.times(parameters.repeatZ , function(_z) { 
                var plane = _this.tempPlanes[counter];
                 
                plane.a = a ; 
                plane.b = b ; 
                plane.c = c ; 
                plane.d = d ; 
                plane.h = parseInt(($('#millerH').val())) ; 
                plane.k = parseInt(($('#millerK').val())) ;  
                plane.l = parseInt(($('#millerL').val())) ;  
                plane.id =  ("_"+($('#millerH').val())+""+($('#millerK').val())+""+($('#millerL').val())+"");
                
                var _a = new THREE.Vector3(a.x + _x , a.y + _y, a.z + _z);
                var _b = new THREE.Vector3(b.x + _x , b.y + _y, b.z + _z);
                var _c = new THREE.Vector3(c.x + _x , c.y + _y, c.z + _z);
                var _d = new THREE.Vector3(d.x + _x , d.y + _y, d.z + _z); 

                var vertices = plane.plane.object3d.geometry.vertices;
                vertices[0] = _a ;
                vertices[1] = _b ;
                vertices[2] = _c ;
                vertices[3] = _d ;

                _this.forwardTransformationsMiller(plane); 

                counter++;
              });
            });
          });
        }
      } 
       
    }   
        
  };
  Lattice.prototype.revertShearing = function() {
    this.transform(1,reverseShearing, function(value) {  
      return -value;
    });
  };

  Lattice.prototype.revertScaling = function() {
    this.transform(1, reverseScaling, function(value) { 
      return (value === 0 ? 0 : 1 / value);
    }); 
  };

  var calculateDelta = function(original, update) {
    var delta = {};
    if (_.isObject(update)) {
        _.each(update, function(value, k) {
          if ( _.isUndefined(original[k]) === false && value !== original[k]) {
            delta[k] = value;
          }
        });
    }
    return delta;
  };

  Lattice.prototype.backwardTransformations = function() {   
    this.revertShearing();
    this.revertScaling();
  };

  Lattice.prototype.forwardTransformations = function() {  
    this.transform(0,_.union(scaling, shearing), function(value) {
      return value;
    });
  };

  Lattice.prototype.update = function() {  
    if(this.latticeName !== 'hexagonal'){
      this.backwardTransformations(); 
      this.updatePoints();
      this.forwardTransformations();
    }
    else{
      this.updatePoints();
    } 
  };

  Lattice.prototype.setGrade = function(gradeParameters) { 
    
    var _this = this; 
    _.each(gradeParameters, function(param, k) { 
      _this.gradeParameters[k] = param ; 
    }); 
    this.setGradeParameters(); 
  };
  
  Lattice.prototype.setGradeChoices = function(gradeChoices) { 
     
    if(!_.isUndefined(gradeChoices["faceCheckButton"])) {

      this.gradeChoice.face = gradeChoices["faceCheckButton"];

      if(this.gradeChoice.face == false){
        _.each(this.faces, function(face) {
          face.setVisible(false);
        });
      }
      else{
        _.each(this.faces, function(face) {
          face.setVisible(true);
       });
      }

    };

    if(!_.isUndefined(gradeChoices["gridCheckButton"])) { 
      this.gradeChoice.grid = gradeChoices["gridCheckButton"];
      if(this.gradeChoice.grid == false){
        _.each(this.grids, function(grid) {
          grid.grid.setVisible(false);
        });
      }
      else{
        _.each(this.grids, function(grid) {
          grid.grid.setVisible(true);
        });
      } 
    };

  };

  Lattice.prototype.setGradeParameters = function() { 

    // TODO improvement: if parameter does not change loops shouldn't run

    var _this = this;
     
    if(_.isUndefined(_this.gradeParameters)) return;
      
    _.each(this.grids, function(grid) { 
      grid.grid.setRadius(_this.gradeParameters.radius);
      grid.grid.setColor( _this.gradeParameters.cylinderColor); 
    });

    _.each(this.faces, function(face) {
      face.setOpacity(_this.gradeParameters.faceOpacity);
      face.setColor( _this.gradeParameters.faceColor);
    });

  }
  Lattice.prototype.updateLatticeTypeRL = function(){ return 0;
    var params = this.parameters ;
    if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){ 
      $("select option[value='cubic_primitive']").attr("selected","selected");
    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
    else if( params.scaleX === params.scaleY && params.scaleX === params.scaleZ && params.alpha === params.beta && params.beta === params.gamma){

    }
  }; 
  Lattice.prototype.setParameters = function(latticeParameters) { 

    if(this.latticeName !== 'hexagonal'){  
      var delta = calculateDelta(this.parameters, latticeParameters);
      var _this = this;
      var deltaKeys = _.keys(delta); // keys : retrieve all names of object properties

      this.backwardTransformations();

      _.extend(this.parameters, delta);  

      if (_.indexOf(deltaKeys, 'repeatX')!=-1 || _.indexOf(deltaKeys, 'repeatY')!=-1 || _.indexOf(deltaKeys, 'repeatZ')!=-1) {  
        _.each(_this.actualAtoms, function(atom,k) {  atom.destroy(); });
        this.actualAtoms.splice(0);   
        this.updatePoints();  
        this.createGrid();  
        this.createFaces();
        this.setGradeParameters();
        this.forwardTransformations();  // todo may be useless
        this.reCreateMillers();
        this.recreateMotif(); 
      }
      else{
        this.forwardTransformations();  
      } 
      this.setGradeChoices(this.gradeChoice);
    }
    else{
      var delta = calculateDelta(this.parameters, latticeParameters);
      var _this = this;
      var deltaKeys = _.keys(delta);  
      _.extend(this.parameters, delta); 
      _.each(_this.actualAtoms, function(atom,k) {  atom.destroy(); });
      this.actualAtoms.splice(0); 
      this.updatePoints();   
      this.createFaces();
      this.setGradeParameters();
      this.setGradeChoices(this.gradeChoice); 
      this.recreateMotif();

    }   
    _this.updateLatticeTypeRL();
  };
  Lattice.prototype.getParameters = function() {
    return this.parameters ;
  }; 
  Lattice.prototype.onLoad = function(callback) {
    PubSub.subscribe(events.LOAD, callback);
  };
  Lattice.prototype.reCreateMillers = function() {
    var _this = this; 

    this.planesUnique = _.uniq(_this.millerPlanes, function(p) { return p.id; });

    for (var i = 0; i < this.millerPlanes.length; i++) {
      this.millerPlanes[i].plane.destroy();
    }  
    this.millerPlanes.splice(0);
 
    for (var i = 0; i < this.planesUnique.length; i++) { 
      var plane = this.planesUnique[i];
      var params = {
        millerH : plane.h, 
        millerK :  plane.k, 
        millerL : plane.l,
        planeColor : plane.planeColor,
        planeOpacity : plane.planeOpacity,
        planeName : plane.planeName  
      };    
      this.createMillerPlane(params, false, true);   
    }
    
    ///////////////////////////////////////////////

    this.directionsUnique = _.uniq(_this.millerDirections, function(p) { return p.id; });

    for (var i = 0; i < this.millerDirections.length; i++) {
      this.millerDirections[i].direction.destroy();
    }

    this.millerDirections.splice(0);

    for (var i = 0; i < this.directionsUnique.length; i++) { 
      var directional = this.directionsUnique[i];
      var params = {
        millerU : directional.u, 
        millerV :  directional.v, 
        millerW : directional.w,
        directionColor : directional.directionColor,
        directionName : directional.directionName,
        dirRadius : directional.direction.radius
      };   
      this.createMillerDirection(params, false, true); 
    }   
  }
  Lattice.prototype.createMillerPlane = function(millerParameters, temp, transform) {
    var _this = this ;
    var parameters = this.parameters ;
    var h = parseInt(millerParameters.millerH ); 
    var k = parseInt(millerParameters.millerK ); 
    var l = parseInt(millerParameters.millerL );
    var id;  

    h = (h!=0) ? 1/h : 0 ;
    k = (k!=0) ? 1/k : 0 ;
    l = (l!=0) ? 1/l : 0 ;
    
    if(_this.latticeName !== 'hexagonal'){
      if( h!=0 && k!=0 && l!=0) { 
        _.times(parameters.repeatX , function(_x) {
          _.times(parameters.repeatY , function(_y) {
            _.times(parameters.repeatZ , function(_z) {        
              var a = new THREE.Vector3( (k<0 ? (1+k) : k) + _x,  (l<0 ? 1 : 0 ) + _y , (h<0 ? 1 : 0) + _z); 
              var b = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x,  (l<0 ? (1+l) : l ) + _y, (h<0 ? 1 : 0) + _z ); 
              var c = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x, (l<0 ? 1 : 0 ) + _y, (h<0 ? (1+h) : h) + _z );
              
              var x =  new MillerPlane(a, b, c, undefined, parseInt(millerParameters.planeOpacity) , millerParameters.planeColor );
              id = _this.generatePlaneKey();
              if(!temp){ 
                _this.millerPlanes[id] = {
                  visible: true,
                  plane : x, 
                  a : a, 
                  b : b, 
                  c : c, 
                  id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                  h : parseInt(millerParameters.millerH),
                  k : parseInt(millerParameters.millerK),
                  l : parseInt(millerParameters.millerL),
                  planeOpacity : parseInt(millerParameters.planeOpacity),
                  planeColor : millerParameters.planeColor,
                  planeName : millerParameters.planeName,
                };  
                _this.forwardTransformationsMiller(_this.millerPlanes[id]); 
              }
              else{ 
                _this.tempPlanes.push({
                  visible: true,
                  plane : x, 
                  a : a, 
                  b : b, 
                  c : c ,  
                  id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                  h : parseInt(millerParameters.millerH),
                  k : parseInt(millerParameters.millerK),
                  l : parseInt(millerParameters.millerL),
                  planeOpacity : parseInt(millerParameters.planeOpacity),
                  planeColor : millerParameters.planeColor,
                  planeName : millerParameters.planeName,
                }); 
                _this.forwardTransformationsMiller(_this.tempPlanes[_this.tempPlanes.length-1]);  
              }
            });
          });
        });
      }
      else{ 
        var a = new THREE.Vector3(0,0,0), b = new THREE.Vector3(0,0,0), c = new THREE.Vector3(0,0,0) , d = new THREE.Vector3(0,0,0);  
        if (h!=0){
          a.z = h;
          if(k!=0){
            b.z = h;
            b.y = 1;
            c.x = k;
            c.y = 1;
            d.x = k;
          }
          else if(l!=0){
            b.z = h;
            b.x = 1;
            c.x = 1;
            c.y = l;
            d.y = l;
          }
          else{
            b.z = h;
            b.y = 1;
            c.x = 1;
            c.y = 1;
            c.z = h;
            d.x = 1;
            d.z = h;
          }
        }
        else if(k!=0){
          a.x = k;
          if(l!=0){
            b.z = 1;
            b.x = k;
            c.y = l;
            c.z = 1;
            d.y = l;     
          }
          else{
            b.x = k;
            b.y = 1;
            c.z = 1;
            c.x = k;
            c.y = 1;
            d.z = 1;
            d.x = k;
          }

        }
        else{
          a.y = l;
          b.y = l;
          b.x = 1;
          c.x = 1;
          c.y = l;
          c.z = 1;
          d.y = l;
          d.z = 1;

        }
        if(h<0) {
          a.z+=1;
          b.z+=1;
          c.z+=1;
          d.z+=1;
        }
        if(k<0) {
          a.x+=1;
          b.x+=1;
          c.x+=1;
          d.x+=1;
        }
        if(l<0) {
          a.y+=1;
          b.y+=1;
          c.y+=1;
          d.y+=1;
        }
        _.times(parameters.repeatX , function(_x) {
          _.times(parameters.repeatY , function(_y) {
            _.times(parameters.repeatZ , function(_z) {
             
              var _a = new THREE.Vector3(a.x + _x , a.y + _y, a.z + _z);
              var _b = new THREE.Vector3(b.x + _x , b.y + _y, b.z + _z);
              var _c = new THREE.Vector3(c.x + _x , c.y + _y, c.z + _z);
              var _d = new THREE.Vector3(d.x + _x , d.y + _y, d.z + _z);
              var x = new MillerPlane(_a,_b,_c,_d, millerParameters.planeOpacity , millerParameters.planeColor );
              id = _this.generatePlaneKey();
              if(!temp){ 
                _this.millerPlanes[id] = {
                  visible: true,
                  plane : x, 
                  a : a, 
                  b : b, 
                  c : c , 
                  d : d , 
                  id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                  h : parseInt(millerParameters.millerH),
                  k : parseInt(millerParameters.millerK),
                  l : parseInt(millerParameters.millerL),
                  planeOpacity : parseInt(millerParameters.planeOpacity),
                  planeColor : millerParameters.planeColor,
                  planeName : millerParameters.planeName,
                }; 
                _this.forwardTransformationsMiller(_this.millerPlanes[id]); 
              }
              else{
                 _this.tempPlanes.push({
                  visible: true,
                  plane : x, 
                  a : a, 
                  b : b, 
                  c : c , 
                  d : d , 
                  id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                  h : parseInt(millerParameters.millerH),
                  k : parseInt(millerParameters.millerK),
                  l : parseInt(millerParameters.millerL),
                  planeOpacity : parseInt(millerParameters.planeOpacity),
                  planeColor : millerParameters.planeColor,
                  planeName : millerParameters.planeName,
                }); 
                _this.forwardTransformationsMiller(_this.tempPlanes[_this.tempPlanes.length-1]);
              }
            });
          });
        });
      }
    }
    else{/*
      if( h!=0 && k!=0 && l!=0) { 
        var a = new THREE.Vector3( (k<0 ? (1+k) : k) + _x,  (l<0 ? 1 : 0 ) + _y , (h<0 ? 1 : 0) + _z); 
        var b = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x,  (l<0 ? (1+l) : l ) + _y, (h<0 ? 1 : 0) + _z ); 
        var c = new THREE.Vector3( (k<0 ? 1 : 0 ) + _x, (l<0 ? 1 : 0 ) + _y, (h<0 ? (1+h) : h) + _z );
        
        var x =  new MillerPlane(a, b, c, undefined, millerParameters.planeOpacity , millerParameters.planeColor );
        id = generateKey();
        if(!temp){ 
          _this.millerPlanes[id] = {
            plane : x, 
            a : a, 
            b : b, 
            c : c, 
            id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
            h : millerParameters.millerH,
            k : millerParameters.millerK,
            l : millerParameters.millerL,
            planeOpacity : millerParameters.planeOpacity,
            planeColor : millerParameters.planeColor,
            planeName : millerParameters.planeName,
          }; 

          _this.forwardTransformationsMiller(_this.millerPlanes[id]); 
        }
        else{
           
          _this.tempPlanes[id] = {
            plane : x, 
            a : a, 
            b : b, 
            c : c , 
            id : ("_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
            h : millerParameters.millerH,
            k : millerParameters.millerK,
            l : millerParameters.millerL,
            planeOpacity : millerParameters.planeOpacity,
            planeColor : millerParameters.planeColor,
            planeName : millerParameters.planeName,
          }; 
          _this.forwardTransformationsMiller(_this.tempPlanes[id]); 
        }
      }*/
    }
      
  };

  Lattice.prototype.createMillerDirection = function(millerParameters, temp, transform) {
    var _this = this ;
    var hexagonal = (this.latticeName !== 'hexagonal') ? false : true ;
    var parameters = this.parameters ;
    var u = parseInt(millerParameters.millerU), v = parseInt(millerParameters.millerV), w = parseInt(millerParameters.millerW), t = parseInt(millerParameters.millerT) ; 
    var id, checkVals = parseInt(u + v) * -1 ; 

    if(hexagonal){
      if(t != checkVals ) {   
        return null ;
      }
      var devider = Math.max(Math.abs(u),Math.abs(v),Math.abs(w),Math.abs(t));
      var aLength = parseInt(this.parameters.scaleZ) ;
      var cLength = parseInt(this.parameters.scaleY) ;

      var axis = new THREE.Vector3( 0, 1, 0 );

      var a3 = new THREE.Vector3( aLength, 0, 0 ); 
      var rotA3 = (t>0) ? ((Math.PI*2) / 3) : ((Math.PI*5) / 3) ;
      a3.applyAxisAngle( axis, rotA3) ;

      var a2 = new THREE.Vector3( aLength, 0, 0 );  
      var rotA2 = (v>0) ? (0) : ( Math.PI ) ;
      a2.applyAxisAngle( axis, rotA2) ;

      var a1 = new THREE.Vector3( aLength, 0, 0 ); 
      var rotA1 = (u>0) ? ((Math.PI*4) / 3) : ( Math.PI/3 ) ;
      a1.applyAxisAngle( axis, rotA1) ;

      var c = new THREE.Vector3(0,cLength,0);  
      a1.setLength(Math.abs(u/devider));
      a2.setLength(Math.abs(v/devider));
      a3.setLength(Math.abs(t/devider));
      c.setLength(Math.abs(w/devider)); 
      
      a1.add(a2.add(a3.add(c)));
      new MillerVector(new THREE.Vector3(0,0,0) , a1, millerParameters.directionColor, millerParameters.dirRadius) ;  
       
    }
    else{ 
      var devider = Math.max(Math.abs(u),Math.abs(v),Math.abs(w));
      u/=devider;
      v/=devider;
      w/=devider;  

      _.times(parameters.repeatX , function(_x) {
        _.times(parameters.repeatY , function(_y) {
          _.times(parameters.repeatZ , function(_z) {
            id = _this.generateDirectionKey() ;
            var startPoint = (new THREE.Vector3 ( (v < 0 ? (v*(-1)) : 0 ) , (w < 0 ? (w*(-1)) : 0 ) , (u < 0 ? (u*(-1)) : 0 ))) ; 
            var endpointPoint = new THREE.Vector3 (  (v < 0 ? 0 : v ) , (w < 0 ? 0 : w ) , (u < 0 ? 0 : u ) ) ; 
            startPoint.x += _x ; 
            startPoint.y += _y ; 
            startPoint.z += _z ; 
            endpointPoint.x += _x ; 
            endpointPoint.y += _y ; 
            endpointPoint.z += _z ; 
            if(!temp){ 
              _this.millerDirections[id] = {
                visible: true,
                direction : undefined,
                startPoint : startPoint , 
                endpointPoint : endpointPoint,
                id : ("_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
                u : parseInt(millerParameters.millerU),
                v : parseInt(millerParameters.millerV),
                w : parseInt(millerParameters.millerW),
                directionColor : millerParameters.directionColor,
                name : millerParameters.directionName
              };
               
              _this.forwardTransformationsMiller(_this.millerDirections[id]); 
              _this.millerDirections[id].direction  = new MillerVector(startPoint , endpointPoint, millerParameters.directionColor, millerParameters.dirRadius) ;
            
            }
            else{  
              _this.tempDirs.push({
                visible: true,
                direction : undefined,
                startPoint : startPoint , 
                endpointPoint : endpointPoint,
                id : ("_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
                u : parseInt(millerParameters.millerU),
                v : parseInt(millerParameters.millerV),
                w : parseInt(millerParameters.millerW),
                directionColor : millerParameters.directionColor,
                name : millerParameters.directionName
              });
              _this.forwardTransformationsMiller(_this.tempDirs[_this.tempDirs.length-1]); 
              _this.tempDirs[_this.tempDirs.length-1].direction  = new MillerVector(startPoint , endpointPoint, millerParameters.directionColor, millerParameters.dirRadius) ;
            }
          });
        });
      });
    }
  };

  Lattice.prototype.selectDirection = function (which){
    if(which==="---") return;
    var _this = this;
    var u,v,w,name,color;
    PubSub.publish(events.DIRECTION_STATE,"editing"); 
   
    var index ;
    for (var i = 0; i < this.millerDirections.length; i++) {

      if(this.millerDirections[i].id === which) {
        this.tempDirs.push(this.millerDirections[i]);
        u = this.millerDirections[i].u;
        v = this.millerDirections[i].v;
        w = this.millerDirections[i].w;
        name = this.millerDirections[i].name;
        color = this.millerDirections[i].directionColor; 
      }
    };
    this.millerDirections.splice(index,1);
    _this.directionalState.editing = which;
    _this.directionalState.dname = name;
    $("#millerU").val(u);
    $("#millerV").val(v);
    $("#millerW").val(w);
    $("#directionName").val(name);
    $("#inner-editor").val(color);  

  };
  Lattice.prototype.selectPlane = function (which){
    if(which==="---") return;
    var _this = this;
    var h,k,l,name,color, opacity;
    PubSub.publish(events.PLANE_STATE,"editing");
 
    var index ;
    for (var i = 0; i < this.millerPlanes.length; i++) {

      if(this.millerPlanes[i].id === which) {
        this.tempPlanes.push(this.millerPlanes[i]);
        h = this.millerPlanes[i].h; 
        k = this.millerPlanes[i].k;
        l = this.millerPlanes[i].l;
        name = this.millerPlanes[i].name;
        color =  this.millerPlanes[i].planeColor;
        opacity =  this.millerPlanes[i].planeOpacity; 
        
        index=i;
      }
    }   
    this.millerPlanes.splice(index,1);

    _this.planeState.editing = which;
    _this.planeState.dname = name;
    $("#millerH").val(h);
    $("#millerK").val(k);
    $("#millerL").val(l);
    $("#planeName").val(name);
    // $("#").val(opacity);  TODO opacity slider
  };
  Lattice.prototype.onDirectionStateChange = function(callback) {
    PubSub.subscribe(events.DIRECTION_STATE, callback);
  };
  Lattice.prototype.onPlaneStateChange = function(callback) { 
    PubSub.subscribe(events.PLANE_STATE, callback);
  };
  Lattice.prototype.directionState = function (state){
    var _this = this ;
    _this.directionalState.state = state;
    switch(state) {
        case "initial": 
          jQuery('#newDirection').removeAttr('disabled'); 
          jQuery('#deleteDirection').attr('disabled', 'disabled'); 
          jQuery('#saveDirection').attr('disabled', 'disabled');
          $("input.dirInput").val('');
          $("input.dirInput").attr("disabled", true); 
          $("#directionalStatus").html( "<strong>Status : </strong> starting..." );
          $("#millerU").val('1');
          $("#millerV").val('1');
          $("#millerW").val('1');
          $("#millerT").val('-1'); 
          break;
        case "creating":
          jQuery('#saveDirection').removeAttr('disabled'); 
          jQuery('#newDirection').attr('disabled', 'disabled');
          jQuery('#deleteDirection').removeAttr('disabled', 'disabled');
          $("input.dirInput").removeAttr("disabled");
          $("#directionalStatus").html( "<strong>Status : </strong> creating..." );
          $("#millerU").val('1');
          $("#millerV").val('1');
          $("#millerW").val('1');
          $("#millerT").val('-1');
          break;
        case "editing":
          jQuery('#saveDirection').removeAttr('disabled'); 
          jQuery('#deleteDirection').removeAttr('disabled');
          jQuery('#newDirection').attr('disabled', 'disabled'); 
          $("input.dirInput").removeAttr("disabled");
          $("#directionalStatus").html( "<strong>Status : </strong> editing direction <strong>"+_this.directionalState.dname+"</strong> ..." );
          break;
      }
  }
  Lattice.prototype._planeState = function (state){ 
    var _this = this ;
    _this.planeState.state = state;
    switch(state) {
        case "initial": 
          jQuery('#newPlane').removeAttr('disabled');
          jQuery('#deletePlane').attr('disabled', 'disabled'); 
          jQuery('#savePlane').attr('disabled', 'disabled');
          $("input.planeInput").val('');
          $("input.planeInput").attr("disabled", true);
          $("#planeStatus").html( "<strong>Status : </strong> starting..." );
          $("#millerH").val('1');
          $("#millerK").val('1');
          $("#millerL").val('1');
          $("#millerI").val('-1'); 
          break;
        case "creating":
          jQuery('#savePlane').removeAttr('disabled'); 
          jQuery('#newPlane').attr('disabled', 'disabled');
          jQuery('#deletePlane').removeAttr('disabled', 'disabled');
          $("input.planeInput").removeAttr('disabled');
          $("#planeStatus").html( "<strong>Status : </strong> creating..." );
          $("#millerH").val('1');
          $("#millerK").val('1');
          $("#millerL").val('1');
          $("#millerI").val('-1'); 
          break;
        case "editing":
          jQuery('#savePlane').removeAttr('disabled'); 
          jQuery('#deletePlane').removeAttr('disabled');
          jQuery('#newPlane').removeAttr('disabled'); 
          $("input.planeInput").removeAttr("disabled");  
          $("#planeStatus").html( "<strong>Status : </strong> editing direction <strong>"+_this.planeState.dname+"</strong> ..." );
          break;
      }
  }
  Lattice.prototype.submitDirectional = function(millerParameters) {  
    if( (millerParameters.millerU==="" || millerParameters.millerV==="" || millerParameters.millerW==="")
      && ( millerParameters.button==="saveDirection")) { 
      return;
    }
    var _this = this ;
    var buttonClicked = millerParameters.button ;
    var directionID = "_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+"";
 
    if (_this.directionalState.state === "initial"){
      if( buttonClicked === "newDirection"){   
        for (var i = 0; i < this.tempDirs.length; i++) {
          this.tempDirs[i].direction.destroy(); 
        };  
        this.tempDirs.splice(0);

        this.createMillerDirection(millerParameters, true, false);
        
        PubSub.publish(events.DIRECTION_STATE,"creating");
      }
    }
    else if (_this.directionalState.state === "creating"){
      switch(buttonClicked) {
        case "deleteDirection": 
          PubSub.publish(events.DIRECTION_STATE,"initial");
          for (var i = 0; i < this.tempDirs.length; i++) {
            this.tempDirs[i].direction.destroy(); 
          };  
          this.tempDirs.splice(0);
          _this.removeDirectionList();
          break;

        case "saveDirection":
          PubSub.publish(events.DIRECTION_STATE,"initial");
          for (var i = 0; i < this.tempDirs.length; i++) {
            this.tempDirs[i].direction.destroy(); 
          };  
          this.tempDirs.splice(0);
          var found = _.find(_this.directionalList, function(directional){ return directional.id === directionID; });
          if(_.isUndefined(found)){
            this.createMillerDirection(millerParameters, false, false);
            _this.updateDirectionList(millerParameters); 
          } 
          break;
      }
    }
    else if (_this.directionalState.state === "editing"){ 
      switch(buttonClicked) { 

        case "saveDirection": 
          PubSub.publish(events.DIRECTION_STATE,"initial");
          
          for (var i = 0; i < this.tempDirs.length; i++) {
            this.tempDirs[i].direction.destroy(); 
          };  
          this.tempDirs.splice(0);
          this.createMillerDirection(millerParameters, false, false);
          _this.updateDirectionList(millerParameters, _this.directionalState.editing);
           
          break;
  
        case "deleteDirection": 
          PubSub.publish(events.DIRECTION_STATE,"initial");
          for (var i = 0; i < this.tempDirs.length; i++) {
            this.tempDirs[i].direction.destroy(); 
          };  
          this.tempDirs.splice(0);
          _this.removeDirectionList();
          break;
      } 
    } 
  };

  Lattice.prototype.submitPlane = function(millerParameters) { 
    if(
      (millerParameters.millerH==="" || millerParameters.millerK==="" || millerParameters.millerL==="")
      && ( millerParameters.button==="savePlane")) {
      return;
    }
    var _this = this ;
    var buttonClicked = millerParameters.button ;
    var planeID = "_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+"";
 
    if (_this.planeState.state === "initial"){
      if( buttonClicked === "newPlane"){  
        for (var i = 0; i < this.tempPlanes.length; i++) {
          this.tempPlanes[i].plane.destroy(); 
        };  
        this.tempPlanes.splice(0);
        this.createMillerPlane(millerParameters, true, false);
        PubSub.publish(events.PLANE_STATE,"creating");
      }
    }
    else if (_this.planeState.state === "creating"){
      switch(buttonClicked) {  
        case "savePlane":
          PubSub.publish(events.PLANE_STATE,"initial");
          for (var i = 0; i < this.tempPlanes.length; i++) {
            this.tempPlanes[i].plane.destroy(); 
          };  
          this.tempPlanes.splice(0);
          var found = _.find(_this.planeList, function(plane){ return plane.id === planeID; });
          if(_.isUndefined(found)){
            this.createMillerPlane(millerParameters, false, false);
            _this.updatePlaneList(millerParameters); 
          }
          break;
        case "deletePlane": 
          PubSub.publish(events.PLANE_STATE,"initial"); 
          for (var i = 0; i < this.tempPlanes.length; i++) {
            this.tempPlanes[i].plane.destroy(); 
          };  
          this.tempPlanes.splice(0);
          _this.removePlaneList();
          break;
      }
    }
    else if (_this.planeState.state === "editing"){

      switch(buttonClicked) { 

        case "savePlane": 
          PubSub.publish(events.PLANE_STATE,"initial");
          for (var i = 0; i < this.tempPlanes.length; i++) {
            this.tempPlanes[i].plane.destroy(); 
          };  
          this.tempPlanes.splice(0);
          this.createMillerPlane(millerParameters, false, false);
          _this.updatePlaneList(millerParameters, _this.planeState.editing);
           
          break;

        case "deletePlane": 
          PubSub.publish(events.PLANE_STATE,"initial"); 
          for (var i = 0; i < this.tempPlanes.length; i++) {
            this.tempPlanes[i].plane.destroy(); 
          };  
          this.tempPlanes.splice(0);
          _this.removePlaneList();
          break;
      }

    }
    
  };
    
  Lattice.prototype.updatePlaneList = function(millerParameters, oldId)  {
    var _this = this ;
    var $planes = jQuery('#planes');

    if(!_.isUndefined(oldId)){
      var $option = jQuery("#"+oldId);
      $option.remove();
      _.each(_this.planeList, function(x, reference) {
        if(x.id===oldId) delete _this.planeList[reference];
      });

    }

    var text = "Plane : "+millerParameters.planeName+"  ["+millerParameters.millerH+","+millerParameters.millerK+","+millerParameters.millerL+"] ";
    var id = "_"+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+"";
    var option = "<option id="+id+" value="+id+">"+text+"</option>" ;
    $planes.append(option) ;

    var item = { id : id};
    _this.planeList.push(item); // TODO when it searches for pre existed option look at the select element not in this
     
  };
  Lattice.prototype.updateDirectionList = function(millerParameters, oldId)  {
    var _this = this ;
    var $vectors = jQuery('#vectors');
    
    if(!_.isUndefined(oldId)){
      var $option = jQuery("#"+oldId);
      $option.remove();
      _.each(_this.directionalList, function(x, reference) {
        if(x.id===oldId) delete _this.directionalList[reference];
      }); 
    }

    var text = "Vector : "+millerParameters.directionName+"  ["+millerParameters.millerU+","+millerParameters.millerV+","+millerParameters.millerW+"] ";
    var id = "_"+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+"";
    var option = "<option id="+id+" value="+id+">"+text+"</option>" ;
    $vectors.append(option) ;

    var item = { id : id};
    _this.directionalList.push(item); // TODO when it searches for pre existed option look at the select element not in this
     
  };
  Lattice.prototype.removeDirectionList = function(millerParameters, oldId)  {
    jQuery("#"+this.directionalState.editing).remove();    
  };
  Lattice.prototype.removePlaneList = function(millerParameters, oldId)  {
    jQuery("#"+this.planeState.editing).remove();    
  };
  Lattice.prototype.transformMiller = function( shape, parameterKeys, operation ) {
    var matrix; 
    var argument;
    var parameters = this.parameters;
    var _this = this;
     
    _.each(parameterKeys, function(k) { // TODO performance imporvement - no need to be executed so many times
 
        if (_.isUndefined(parameters[k]) === false) {
          argument = {};
          argument[k] = operation(parameters[k]);
          matrix = transformationMatrix(argument);
          if(_.isUndefined ( shape.plane) ){ 
            shape.startPoint.applyMatrix4(matrix);
            shape.endpointPoint.applyMatrix4(matrix); 

          }  
          else{ 
            shape.plane.object3d.geometry.verticesNeedUpdate = true ;
            var vertices = shape.plane.object3d.geometry.vertices;
            _.each(vertices, function(vertex , k){
              vertex.applyMatrix4(matrix); 
            }); 
          } 
        } 
    });
      
  };

  Lattice.prototype.revertShearingMiller = function() { 
    this.transformMiller(reverseShearing, function(value) {  
      return -value;
    });
  };
  Lattice.prototype.getLatticeType = function(){
    var lattice = this.lattice;
    var l = lattice.latticeType; 
    return l;
  };
  Lattice.prototype.getLatticeSystem = function(){
    var lattice = this.lattice;
    var l = lattice.latticeSystem; 
    return l;
  };
  Lattice.prototype.getLatticeName = function(){ 
    return this.latticeName;
  };
  Lattice.prototype.revertScalingMiller = function() {
    this.transformMiller(reverseScaling, function(value) {
      return (value === 0 ? 0 : 1 / value);
    });
  };

  Lattice.prototype.backwardTransformationsMiller = function() { 
    this.revertShearingMiller();
    this.revertScalingMiller();
  };

  Lattice.prototype.forwardTransformationsMiller = function(shape) { 

    this.transformMiller(shape,_.union(scaling, shearing), function(value) {
      return value;
    });
  };
  function updateGrid ( grid) {
    
    var _grid = grid.grid.object3d;
    var pointA = grid.a;
    var pointB = grid.b; 
    var distance = pointA.distanceTo(pointB) ; 
    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(distance/2);

    var newPoint =  pointA.clone().add(dir) ;  
    var direction = new THREE.Vector3().subVectors( pointB, newPoint );
    var direcNorm = direction;
    direcNorm.normalize(); 

    var arrow = new THREE.ArrowHelper( direcNorm ,newPoint );

    _grid.rotation.set(arrow.rotation.x,arrow.rotation.y,arrow.rotation.z);
    _grid.scale.y = distance/0.001; //distance/grid.geometry.parameters.height;
    _grid.position.set(newPoint.x,newPoint.y,newPoint.z);

  }; 
  Lattice.prototype.generatePlaneKey = function() {
    return (this.millerPlanes.length); 
  }
  Lattice.prototype.generateDirectionKey = function() {
    return (this.millerDirections.length); 
  }
  function assignUVs( geometry ){ //todo maybe it doesn't work right
     
    geometry.computeBoundingBox();

    var max     = geometry.boundingBox.max;
    var min     = geometry.boundingBox.min;

    var offset  = new THREE.Vector2(0 - min.x, 0 - min.y);
    var range   = new THREE.Vector2(max.x - min.x, max.y - min.y);

    geometry.faceVertexUvs[0] = [];
    var faces = geometry.faces;

    for (var i = 0; i < geometry.faces.length ; i++) {

      var v1 = geometry.vertices[faces[i].a];
      var v2 = geometry.vertices[faces[i].b];
      var v3 = geometry.vertices[faces[i].c];

      geometry.faceVertexUvs[0].push([
        new THREE.Vector2( ( v1.x + offset.x ) / range.x , ( v1.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v2.x + offset.x ) / range.x , ( v2.y + offset.y ) / range.y ),
        new THREE.Vector2( ( v3.x + offset.x ) / range.x , ( v3.y + offset.y ) / range.y )
      ]);

    }

    geometry.uvsNeedUpdate = true;

    return geometry;
  }
  Lattice.prototype.customBox = function(points) { 

    var vertices = [];
    var faces = [];
    var _this = this ;

    if(this.latticeName !== 'hexagonal'){
      vertices.push(points['_000'].position); // 0
      vertices.push(points['_010'].position); // 1
      vertices.push(points['_011'].position); // 2

      vertices.push(points['_001'].position); // 3
      vertices.push(points['_101'].position); // 4
      vertices.push(points['_111'].position); // 5
      vertices.push(points['_110'].position); // 6
      vertices.push(points['_100'].position); // 7

      faces.push(new THREE.Face3(0,1,2));
      faces.push(new THREE.Face3(0,2,3));

      faces.push(new THREE.Face3(3,2,5));
      faces.push(new THREE.Face3(3,5,4));
   
      faces.push(new THREE.Face3(4,5,6));
      faces.push(new THREE.Face3(4,6,7));

      faces.push(new THREE.Face3(7,6,1));
      faces.push(new THREE.Face3(7,1,0));

      faces.push(new THREE.Face3(7,0,3));
      faces.push(new THREE.Face3(7,3,4));

      faces.push(new THREE.Face3(2,1,6));
      faces.push(new THREE.Face3(2,6,5)); 
    }
    else{
      var bottomFacePoints=[];
      var upperFacePoints=[]; 
      _.times(2, function(_y) {  
        _.times(6 , function(_r) { 

          var v = new THREE.Vector3( _this.parameters.scaleZ, 0, 0 ); 
          var axis = new THREE.Vector3( 0, 1, 0 );
          var angle = (Math.PI / 3) * _r ; 
          v.applyAxisAngle( axis, angle );

          var z = v.z ;
          var y = v.y + _y*_this.parameters.scaleY ;
          var x = v.x ; 
          var position = new THREE.Vector3( x, y, z);
          
          if(_y > 0){
            upperFacePoints.push(position);
          }
          else{
            bottomFacePoints.push(position);
          }
        }); 
      }); 

      for (var i = 0; i<6; i++) {
        vertices[i] = bottomFacePoints[i];
        vertices[i+6] = upperFacePoints[i];
      };
      for (var i = 0; i<4; i++) {
        faces.push(new THREE.Face3(0,i+1,i+2));
        faces.push(new THREE.Face3(i+8,i+7,6)); 
      } 
      for (var i = 0; i<5; i++) { 
        faces.push(new THREE.Face3(i+7,i+1,i));
        faces.push(new THREE.Face3(i+6,i+7,i));
      } 
      faces.push(new THREE.Face3(6,0,5));
      faces.push(new THREE.Face3(11,6,5));
    }

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;

    geom.mergeVertices();

    return geom;
  }

  return Lattice;

});
