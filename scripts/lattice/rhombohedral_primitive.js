'use strict';

define(function() {
  return {
    originArray: [
      { x: 0, y: 0, z: 0 }
    ], 
    latticeType: "primitive", 
    latticeSystem: "rhombohedral",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.0,
      'scaleY': 1.0,
      'scaleZ': 1.0,
      'alpha': 60,
      'beta':  60,
      'gamma': 60
    },
    restrictions: {
      'scaleY': {
        'scaleX': '='
      },
      'scaleZ': {
        'scaleY': '='
      },
      
      'gamma': {
        '90': '≠',   
      },
      'beta': {
        'gamma': '=',
      },
      'alpha': {
        'gamma': '='
      }
    },
    gridPoints: {

      'first' : [0,0,0],
      'left'  : [1,1,0],
      'right' : [1,0,1],
      'front' : [0,1,1],
    }
  };
});
