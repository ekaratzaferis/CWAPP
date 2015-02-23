'use strict';

define(function() {
  return {
    originArray: [
      { x: 0, y: 0, z: 0 }
    ],
    theType: "primitive",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.5,
      'scaleY': 1.5,
      'scaleZ': 1.0,
      'gamma': 120,
      'beta': 90,
      'alpha': 90
    },
    restrictions: {
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
