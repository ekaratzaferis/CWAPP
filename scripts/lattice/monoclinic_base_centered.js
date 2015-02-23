'use strict';

define(function() {
  return {
    originArray: [
      { x: 0,   y: 0,   z: 0   },
      { x: 0.5, y: 0.5, z: 0   }
    ],
    theType: "base",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.0,
      'scaleY': 1.2,
      'scaleZ': 1.4,
      'alpha': 90,
      'beta': 120,
      'gamma': 90
    },
    restrictions: {
      'scaleX': {
        'scaleY': '≠',
        'scaleZ': '≠',
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
        '90': '≠'
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
