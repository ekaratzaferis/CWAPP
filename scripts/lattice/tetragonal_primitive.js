'use strict';

define(function() {
  return {
    originArray: [
      { x: 0, y: 0, z: 0 }
    ], 
    latticeType: "primitive", 
    latticeSystem: "tetragonal",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.0,
      'scaleY': 1.5,
      'scaleZ': 1.0,
      'alpha': 90,
      'beta': 90,
      'gamma': 90
    },
    restrictions: {
      'scaleX': {
        'scaleZ': '≠'
      },
      'scaleZ': {
        'scaleY': '≠',
        'scaleX': '≠'
      },
      'scaleY': {
        'scaleX': '='
      }, 
      'alpha': {
        'alpha': '='
      },
      'beta': {
        'beta': '='
      },
      'gamma': {
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
