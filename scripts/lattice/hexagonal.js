'use strict';

define(function() {
  return {
    originArray: [
      { x: 0, y: 0, z: 0 }
    ],
    theType: "primitive",
    vector: { x: 1, y: 1, z: 1 },
    defaults: {
      'scaleX': 1,
      'scaleY': 1,
      'scaleZ': 1,
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
    }
     
  };
});
