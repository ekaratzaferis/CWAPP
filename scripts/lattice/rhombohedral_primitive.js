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
      'scaleX': 1.000,
      'scaleY': 1.000,
      'scaleZ': 1.000,
      'alpha': 60,
      'beta':  60,
      'gamma': 60
    },
    restrictions: {
      'scaleX': {
        'scaleZ': '='
      },
      'scaleY': {
        'scaleZ': '='
      }, 
      'gamma': {
        'aplha': '='
      },
      'beta': {
        'aplha': '='
      },
      'alpha': {
        '90': '≠'
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
