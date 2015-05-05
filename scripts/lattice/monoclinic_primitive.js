'use strict';

define(function() {
  return {
    originArray: [
      { x: 0, y: 0, z: 0 }
    ], 
    latticeType: "primitive", 
    latticeSystem: "monoclinic",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.5,
      'scaleY': 2.0,
      'scaleZ': 1.0,
      'alpha': 120,
      'beta': 90,
      'gamma': 90
    },
    restrictions: {
      'scaleX': {
        'scaleZ': '≠',
        'scaleY': '≠'
      },
      'scaleY': {
        'scaleZ': '≠',
        'scaleX': '≠'
      },
      'scaleZ': {
        'scaleX': '≠',
        'scaleY': '≠'
      },

      'beta': {
         '90': '≠', 
      },
      'alpha': {
        'alpha': '='
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
