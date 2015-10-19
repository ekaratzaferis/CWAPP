'use strict';

define(function() {
  return {
    originArray: [
      { x: 0, y: 0, z: 0 }
    ],
    latticeType: "hexagonal", 
    latticeSystem: "hexagonal",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1.000,
      'scaleY': 1.000,
      'scaleZ': 1.000,
      'gamma': 120,
      'beta': 90,
      'alpha': 90
    },
    gridPoints: {  
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
    } 
  };
});
