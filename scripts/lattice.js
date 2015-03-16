/*global define*/
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

  function Lattice() {
    this.lattice = null;
    this.parameters = defaultParameters;
    this.points = {}; 
    this.mutex = false;
    this.currentMotif = [];
    // grade
    this.gradeChoice = {"face":"off", "grid":"off"};
    this.gridPointsPos = [];
    this.grids = [];
    this.faces = [];
    this.gradeParameters = {"radius" : 1, "cylinderColor" : "FFFFFF" , "faceOpacity" : 1 , "faceColor" : "FFFFFF"};

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

    this.actualAtoms = []; 
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

      var box = new THREE.Mesh(customBox(_this.viewBox), new THREE.MeshBasicMaterial({color:"#FF0000" }) );
      
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
          var mesh = new THREE.Mesh(new THREE.SphereGeometry(_this.actualAtoms[i].getRadius(), 32, 32), new THREE.MeshBasicMaterial() );
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
   
        var solidBox = new THREE.Mesh( finalGeom, new THREE.MeshBasicMaterial({ color: "#"+((1<<24)*Math.random()|0).toString(16)  })  );
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
  Lattice.prototype.setMotif = function(motif, dimensions){
    var _this = this ; 
    _this.currentMotif = motif ;
    _.each(_this.actualAtoms, function(atom,k) {
      atom.destroy();   
    }); 
    _this.actualAtoms.splice(0); 

    _this.backwardTransformations();
    this.parameters.scaleX = dimensions.x ;
    this.parameters.scaleY = dimensions.y ;
    this.parameters.scaleZ = dimensions.z ;
    _this.forwardTransformations();  
 
    _.each(_this.points, function(point,kk) { 
      var p = point.object3d.position.clone(); 
      _.each(motif, function(atom) {   
        var a = atom.object3d.position.clone(); 
        _this.actualAtoms.push( 
          new CrystalAtom(
            new THREE.Vector3(p.x + a.x, p.y + a.y, p.z + a.z), 
            atom.getRadius(), 
            atom.object3d.children[1].material.color,
            atom.elementName, 
            atom.getID(),
            a.x,
            a.y,
            a.z,
            p
          )  
        );
      });
    });  
  }; 
  Lattice.prototype.createGrid = function() {
  
      var gridPoints = this.lattice.gridPoints;
      var usedGridOrigins = [];

      if (_.isUndefined(gridPoints)) { 
        return;
      }

      var parameters = this.parameters;
      var origin, g,destinationReference;
      var destination;
      var _this = this;
      var visible = (this.gradeChoice.grid === "on" ) ;

      // erase previous grid 
      _.each(_this.grids, function(grid) {
          grid.grid.destroy(); 
      });
      while(_this.grids.length > 0) {
          _this.grids.pop();
      };

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

    if (_.isEmpty(lattice)) {
      return;
    }

    var parameters = this.parameters;
    var origin = lattice.originArray[0];
    var vector = lattice.vector;

    var limit = new THREE.Vector3(
      parameters.repeatX * vector.x + origin.x,
      parameters.repeatY * vector.y + origin.y,
      parameters.repeatZ * vector.z + origin.z
    );
    var index;
    var originLength = lattice.originArray.length;    
    var position;
    var reference;
    var _this = this;

     
    _.times(parameters.repeatX + 1, function(_x) {
      _.times(parameters.repeatY + 1, function(_y) {
        _.times(parameters.repeatZ + 1, function(_z) {

            for (index = 0; index < originLength; index++) {
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
    
  };
  Lattice.prototype.recreateMotif = function() {
    
    var _this = this;
     
    if(_this.currentMotif.length === 0 ) return ;
    _.each(_this.points, function(point,kk) { 
      var p = point.object3d.position; 
      _.each(_this.currentMotif, function(atom) {   
        var a = atom.object3d.position; 
        _this.actualAtoms.push( 
          new CrystalAtom(
            new THREE.Vector3(p.x + a.x, p.y + a.y, p.z + a.z), 
            atom.getRadius(), 
            atom.object3d.children[1].material.color,
            atom.elementName, 
            atom.getID(),
            a.x,
            a.y,
            a.z,
            p
          )  
        );
      });
    }); 

  };
  Lattice.prototype.getAnglesScales = function(){

    var anglesScales = { 
      "alpha" : this.parameters.alpha, 
      "beta" : this.parameters.beta, 
      "gamma" : this.parameters.gamma,
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

    require(['lattice/' + latticeName], function(lattice) {
      _this.lattice = lattice;
      _this.update();
      PubSub.publish(events.LOAD, lattice);
    });
    
  };

  var transformationMatrix = function(parameter) {

    // According to wikipedia model
    var ab = Math.tan((90 - ((180-parameter.beta) || 90)) * Math.PI / 180);
    var ac = Math.tan((90 - (parameter.gamma || 90)) * Math.PI / 180);
    var xy = 0;
    var zy = 0;
    var xz = 0;
    var bc = Math.tan((90 - ((180-parameter.alpha) || 90)) * Math.PI / 180);

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
          atom.centerOfMotif.applyMatrix4(matrix);  
          atom.object3d.position.x = atom.centerOfMotif.x + atom.offsetX;  
          atom.object3d.position.y = atom.centerOfMotif.y + atom.offsetY;  
          atom.object3d.position.z = atom.centerOfMotif.z + atom.offsetZ;  
        });
         
        _.each(points, function(point, reference) {
         
          var pos = point.object3d.position.applyMatrix4(matrix); // 4x3 mult 3x1
          
          if(caller==0) {
            _.filter(_this.grids, function(grid){  
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
      var visible = (this.gradeChoice.face === "on" );

      _.each(this.faces, function(face, reference) {
        face.destroy();
      });
      _this.faces.splice(0);
      _this.viewBox.splice(0);

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
      
  };
    
  function updateMillerVector(directional) { 
    var arrow = directional.direction.object3d;
    var start = directional.startPoint;
    var end = directional.endpointPoint;

    var length =  start.distanceTo(end) ; 
    var direction = new THREE.Vector3().subVectors( end,  start).normalize();

    arrow.position.set(start.x, start.y, start.z);
    arrow.setDirection(direction.normalize());
    arrow.setLength(length);

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
    this.backwardTransformations();
    this.updatePoints();
    this.forwardTransformations();
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

      if(this.gradeChoice.face == "off"){
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
      if(this.gradeChoice.grid == "off"){
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

  Lattice.prototype.setParameters = function(latticeParameters) {  
        
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
       
  };
  Lattice.prototype.getParameters = function() {
    return this.parameters ;
  }; 
  Lattice.prototype.onLoad = function(callback) {
    PubSub.subscribe(events.LOAD, callback);
  };
  Lattice.prototype.reCreateMillers = function() {
    var _this = this;
    if(this.millerPlanes.length>0) {
      _.each(_this.millerPlanes, function(plane, reference) {
        var params = {
            millerH : plane.h, 
            millerK :  plane.k, 
            millerL : plane.l,
            planeColor : plane.planeColor,
            planeOpacity : plane.planeOpacity,
            planeName : plane.planeName
            };
        plane.plane.destroy();
        delete _this.millerPlanes[reference]; 
        _this.createMillerPlane(params, false, true);  
      });
    };

    if(this.millerDirections.length>0) {
      _.each(_this.millerDirections, function(directional, reference) {
        var params = {
            millerU : directional.u, 
            millerV :  directional.v, 
            millerW : directional.w,
            directionColor : directional.directionColor,
            directionName : directional.directionName
            };
        directional.direction.destroy();
        delete _this.millerDirections[reference];
        _this.createMillerDirection(params, false, true);   
      });
    };
  }
  Lattice.prototype.createMillerPlane = function(millerParameters, temp, transform) {
    var _this = this ;
    var parameters = this.parameters ;
    var h = millerParameters.millerH ; 
    var k = millerParameters.millerK ; 
    var l = millerParameters.millerL ;
    var id;  

    h = (h!=0) ? 1/h : 0 ;
    k = (k!=0) ? 1/k : 0 ;
    l = (l!=0) ? 1/l : 0 ;
    
    if( h!=0 && k!=0 && l!=0) { 
      _.times(parameters.repeatX , function(_x) {
        _.times(parameters.repeatY , function(_y) {
          _.times(parameters.repeatZ , function(_z) {        
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
                id : (""+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
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
                id : (""+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                h : millerParameters.millerH,
                k : millerParameters.millerK,
                l : millerParameters.millerL,
                planeOpacity : millerParameters.planeOpacity,
                planeColor : millerParameters.planeColor,
                planeName : millerParameters.planeName,
              }; 
              _this.forwardTransformationsMiller(_this.tempPlanes[id]); 
             
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
            id = generateKey();
            if(!temp){ 
              _this.millerPlanes[id] = {
                plane : x, 
                a : a, 
                b : b, 
                c : c , 
                id : (""+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
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
                id : (""+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+""),
                h : millerParameters.millerH,
                k : millerParameters.millerK,
                l : millerParameters.millerL,
                planeOpacity : millerParameters.planeOpacity,
                planeColor : millerParameters.planeColor,
                planeName : millerParameters.planeName,
              }; 
              _this.forwardTransformationsMiller(_this.tempPlanes[id]);
            }
          });
        });
      });
    }
      
  };

  Lattice.prototype.createMillerDirection = function(millerParameters, temp, transform) {
    var _this = this ;
    var parameters = this.parameters ;
    var u = millerParameters.millerU, v = millerParameters.millerV, w = millerParameters.millerW ; 
    var id ;
    var devider = Math.max(Math.abs(u),Math.abs(v),Math.abs(w));
    u/=devider;
    v/=devider;
    w/=devider;  

    _.times(parameters.repeatX , function(_x) {
      _.times(parameters.repeatY , function(_y) {
        _.times(parameters.repeatZ , function(_z) {
          id = generateKey();
          var startPoint = new THREE.Vector3 ( (v < 0 ? (v*(-1)) : 0 ) , (w < 0 ? (w*(-1)) : 0 ) , (u < 0 ? (u*(-1)) : 0 )) ; 
          var endpointPoint = new THREE.Vector3 (  (v < 0 ? 0 : v ) , (w < 0 ? 0 : w ) , (u < 0 ? 0 : u ) ) ; 
          startPoint.x += _x ; 
          startPoint.y += _y ; 
          startPoint.z += _z ; 
          endpointPoint.x += _x ; 
          endpointPoint.y += _y ; 
          endpointPoint.z += _z ; 
          if(!temp){ 
            _this.millerDirections[id] = {
              direction : undefined,
              startPoint : startPoint , 
              endpointPoint : endpointPoint,
              id : (""+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
              u : millerParameters.millerU,
              v : millerParameters.millerV,
              w : millerParameters.millerW,
              directionColor : millerParameters.directionColor,
              name : millerParameters.directionName
            };
            _this.forwardTransformationsMiller(_this.millerDirections[id]); 
            _this.millerDirections[id].direction  = new MillerVector(startPoint , endpointPoint, millerParameters.directionColor) ;
          }
          else{
            _this.tempDirs[id] = {
              direction : undefined,
              startPoint : startPoint , 
              endpointPoint : endpointPoint,
              id : (""+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+""),
              u : millerParameters.millerU,
              v : millerParameters.millerV,
              w : millerParameters.millerW,
              directionColor : millerParameters.directionColor,
              name : millerParameters.directionName
            };
            _this.forwardTransformationsMiller(_this.tempDirs[id]); 
            _this.tempDirs[id].direction  = new MillerVector(startPoint , endpointPoint, millerParameters.directionColor) ;
          }
        });
      });
    });
  };

  Lattice.prototype.selectDirection = function (which){
    if(which==="---") return;
    var _this = this;
    var u,v,w,name,color;
    PubSub.publish(events.DIRECTION_STATE,"editing");
   
    _.each(_this.tempDirs, function(dir, reference) {
      dir.direction.destroy();
      delete _this.tempDirs[reference];
    });  
    _.each(_this.millerDirections, function(dir, reference) {
      if(dir.id === which) {
        _this.tempDirs.push(dir);
        u = _this.millerDirections[reference].u;
        v = _this.millerDirections[reference].v;
        w = _this.millerDirections[reference].w;
        name = _this.millerDirections[reference].name;
        color = _this.millerDirections[reference].directionColor;
        delete _this.millerDirections[reference];
      }
    });  
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
   
    _.each(_this.tempPlanes, function(plane, reference) {
      plane.plane.destroy();
      delete _this.tempPlanes[reference];
    });  
    _.each(_this.millerPlanes, function(plane, reference) {

      if(plane.id === which) {
        _this.tempPlanes.push(plane);
        h = _this.millerPlanes[reference].h;

        k = _this.millerPlanes[reference].k;
        l = _this.millerPlanes[reference].l;
        name = _this.millerPlanes[reference].name;
        color = _this.millerPlanes[reference].planeColor;
        opacity = _this.millerPlanes[reference].planeOpacity;
        delete _this.millerPlanes[reference];
      }
    });  
    
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
          jQuery('#previewDirection').attr('disabled', 'disabled');
          jQuery('#saveDirection').attr('disabled', 'disabled');
          $("input.dirInput").val('');
          $("input.dirInput").attr("disabled", true);
          $("#directionalStatus").html( "<strong>Status : </strong> starting..." );
          break;
        case "creating":
          jQuery('#saveDirection').removeAttr('disabled');
          jQuery('#previewDirection').removeAttr('disabled');
          jQuery('#newDirection').attr('disabled', 'disabled');
          jQuery('#deleteDirection').attr('disabled', 'disabled');
          $("input.dirInput").removeAttr("disabled");
          $("#directionalStatus").html( "<strong>Status : </strong> creating..." );
          break;
        case "editing":
          jQuery('#saveDirection').removeAttr('disabled');
          jQuery('#previewDirection').removeAttr('disabled');
          jQuery('#deleteDirection').removeAttr('disabled');
          jQuery('#newDirection').removeAttr('disabled'); 
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
          jQuery('#previewPlane').attr('disabled', 'disabled');
          jQuery('#savePlane').attr('disabled', 'disabled');
          $("input.planeInput").val('');
          $("input.planeInput").attr("disabled", true);
          $("#planeStatus").html( "<strong>Status : </strong> starting..." );
          break;
        case "creating":
          jQuery('#savePlane').removeAttr('disabled');
          jQuery('#previewPlane').removeAttr('disabled');
          jQuery('#newPlane').attr('disabled', 'disabled');
          jQuery('#deletePlane').attr('disabled', 'disabled');
          $("input.planeInput").removeAttr('disabled');
          $("#planeStatus").html( "<strong>Status : </strong> creating..." );
          break;
        case "editing":
          jQuery('#savePlane').removeAttr('disabled');
          jQuery('#previewPlane').removeAttr('disabled');
          jQuery('#deletePlane').removeAttr('disabled');
          jQuery('#newPlane').removeAttr('disabled'); 
          $("input.planeInput").removeAttr("disabled");
          $("#planeStatus").html( "<strong>Status : </strong> editing direction <strong>"+_this.planeState.dname+"</strong> ..." );
          break;
      }
  }
  Lattice.prototype.submitDirectional = function(millerParameters) { 
    if(
      (millerParameters.millerU==="" || millerParameters.millerV==="" || millerParameters.millerW==="")
      && (millerParameters.button==="previewDirection" || millerParameters.button==="saveDirection")) { 
      return;
    }
    var _this = this ;
    var buttonClicked = millerParameters.button ;
    var directionID = ""+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+"";
 
    if (_this.directionalState.state === "initial"){
      PubSub.publish(events.DIRECTION_STATE,"creating");
    }
    else if (_this.directionalState.state === "creating"){
      switch(buttonClicked) {
        case "previewDirection":
          _.each(_this.tempDirs, function(dir, reference) {
            dir.direction.destroy();
            delete _this.tempDirs[reference];
          });
          this.createMillerDirection(millerParameters, true, false);
          break;

        case "saveDirection":
          PubSub.publish(events.DIRECTION_STATE,"initial");
          _.each(_this.tempDirs, function(dir, reference) {
            dir.direction.destroy();
            delete _this.tempDirs[reference];
          });
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
        case "previewDirection":
          _.each(_this.tempDirs, function(dir, reference) {
            dir.direction.destroy();
            delete _this.tempDirs[reference];
          });
          this.createMillerDirection(millerParameters, true, false);

          break;

        case "saveDirection": 
          PubSub.publish(events.DIRECTION_STATE,"initial");
          
          _.each(_this.tempDirs, function(dir, reference) {
            dir.direction.destroy();
            delete _this.tempDirs[reference];
          });
          this.createMillerDirection(millerParameters, false, false);
          _this.updateDirectionList(millerParameters, _this.directionalState.editing);
           
          break;

        case "newDirection": 
          PubSub.publish(events.DIRECTION_STATE,"creating");
           _.each(_this.tempDirs, function(dir, reference) {
            dir.direction.destroy();
            delete _this.tempDirs[reference];
          });
          _this.removeDirectionList();
          break;

        case "deleteDirection": 
          PubSub.publish(events.DIRECTION_STATE,"initial");
          _.each(_this.tempDirs, function(dir, reference) {
            dir.direction.destroy();
            delete _this.tempDirs[reference];  
          });
          _this.removeDirectionList();
          break;
      }

    }
    
  };

  Lattice.prototype.submitPlane = function(millerParameters) { 
    if(
      (millerParameters.millerH==="" || millerParameters.millerK==="" || millerParameters.millerL==="")
      && (millerParameters.button==="previewPlane" || millerParameters.button==="savePlane")) {
      return;
    }
    var _this = this ;
    var buttonClicked = millerParameters.button ;
    var planeID = ""+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+"";
 
    if (_this.planeState.state === "initial"){
      PubSub.publish(events.PLANE_STATE,"creating");
    }
    else if (_this.planeState.state === "creating"){
      switch(buttonClicked) {
        case "previewPlane":
          _.each(_this.tempPlanes, function(plane, reference) {
            plane.plane.destroy();
            delete _this.tempPlanes[reference];
          });
          this.createMillerPlane(millerParameters, true, false);
          break;

        case "savePlane":
          PubSub.publish(events.PLANE_STATE,"initial");
          _.each(_this.tempPlanes, function(plane, reference) {
            plane.plane.destroy();
            delete _this.tempPlanes[reference];
          });
          var found = _.find(_this.planeList, function(plane){ return plane.id === planeID; });
          if(_.isUndefined(found)){
            this.createMillerPlane(millerParameters, false, false);
            _this.updatePlaneList(millerParameters); 
          }
          break;
      }
    }
    else if (_this.planeState.state === "editing"){

      switch(buttonClicked) {
        case "previewPlane":
          _.each(_this.tempPlanes, function(plane, reference) {
            plane.plane.destroy();
            delete _this.tempPlanes[reference];
          });
          this.createMillerPlane(millerParameters, true, false);

          break;

        case "savePlane": 
          PubSub.publish(events.PLANE_STATE,"initial");
          _.each(_this.tempPlanes, function(plane, reference) {
            plane.plane.destroy();
            delete _this.tempPlanes[reference];
          });
          this.createMillerPlane(millerParameters, false, false);
          _this.updatePlaneList(millerParameters, _this.planeState.editing);
           
          break;

        case "newPlane": 
          PubSub.publish(events.PLANE_STATE,"creating");
           _.each(_this.tempPlanes, function(plane, reference) {
            plane.plane.destroy();
            delete _this.tempPlanes[reference];
          });
          _this.removePlaneList();
          break;

        case "deletePlane": 
          PubSub.publish(events.PLANE_STATE,"initial");
          _.each(_this.tempPlanes, function(plane, reference) {
            plane.plane.destroy();
            delete _this.tempPlanes[reference];  
          });
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
    var id = ""+millerParameters.millerH+""+millerParameters.millerK+""+millerParameters.millerL+"";
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
    var id = ""+millerParameters.millerU+""+millerParameters.millerV+""+millerParameters.millerW+"";
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
    var l = lattice.theType;
    return l;
  }

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
  var key = 0 ;
  function generateKey(){
    return key++; 
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
  function customBox(points) { 

    var vertices = [];
    var faces = [];

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

    var geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;

    geom.mergeVertices();

    return geom;
  }
  return Lattice;

});
