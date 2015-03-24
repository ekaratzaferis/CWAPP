'use strict';

define([
  'three',
  'pubsub'
], function(
  THREE,
  PubSub
) {
  // singleton
  var instance;

  var events = {
    ADD: 'hudExplorer.add',
    REMOVE: 'hudExplorer.remove'
  };

  function HudExplorer(options) {
    options = options || {};

    this.object3d = new THREE.Scene();

    var _this = this;
    PubSub.subscribe(events.ADD, function(message, object) {
      _this.add(object);
    });
    PubSub.subscribe(events.REMOVE, function(message, object) {
      _this.remove(object);
    });
  }

  HudExplorer.prototype.getObjByName = function(name) {
    var obj = this.object3d.getObjectByName(name,true);
    return obj;
  };

  HudExplorer.prototype.add = function(object) {
    this.object3d.add(object);
  };

  HudExplorer.prototype.remove = function(object) {
    this.object3d.remove(object.object3d.object3d);
  };

  return {
    getInstance: function(options) {
      return (instance = instance || new HudExplorer(options));
    },
    add: function(object) {
      PubSub.publish(events.ADD, object);
    },
    remove: function(object) {
      PubSub.publish(events.REMOVE, object);
    }
  };
});
