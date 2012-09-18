/*
  TODO 加好友 搜索好友 切换
   同网站
*/

IDSNS.util.namespace("IDSNS");

IDSNS.EventHandler = function EventHandler(scope) {
  this.initialize(scope);
};

IDSNS.EventHandler.prototype = {
  constructor: IDSNS.EventHandler
  , _scope: null
  , _map: null
  , initialize: function(scope) {
      this._map = {};
      this.scope = scope;
    }
  , getScope: function() {
      return this._scope;
    }
  , setScope: function(scope) {
      if (typeof scope == 'object') {
        this._scope = scope;
      }
    }
  , add: function(eventName, fn, scope) {
      if (!this._map[eventName]) {
        this._map[eventName] = [];
      }
      this._map[eventName].push( {
        fn : fn,
        scope : scope
      });
    }
  , remove: function(eventName, fn) {
      if (this._map[eventName]) {
        if (fn) {
          for ( var i = 0; i < this._map[eventName].length; i++) {
            if (this._map[eventName][i].fn == fn) {
              delete this._map[eventName][i];
              break;
            }
          }
        } else {
          delete this._map[eventName];
        }
      }
    }
  , removeAll: function() {
      this._map = {};
    }
  , handleEvent: function(eventName, args) {
      if (this._map[eventName]) {
        for ( var i = 0; i < this._map[eventName].length; i++) {
          var fn = this._map[eventName][i].fn
            , scope = this._map[eventName][i].scope || this.scope;
          fn.apply(scope, args);
        }
      }
    } 
}