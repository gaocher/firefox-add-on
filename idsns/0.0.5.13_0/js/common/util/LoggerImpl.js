IDSNS.util.LoggerImpl = function LoggerImpl(logger) {
  this.__defineGetter__("logger", this.getLogger);
  this.__defineSetter__("logger", this.setLogger);
  this.__defineGetter__("enabled", this.isEnabled);
  this.__defineSetter__("enabled", this.setEnabled);
  this.initialize(logger);
};
IDSNS.util.LoggerImpl.ClassRegistry = new Array();
IDSNS.util.LoggerImpl.isResponsibleFor = function(navigator) {
  return false;
};
IDSNS.util.LoggerImpl.prototype = {
  constructor: IDSNS.util.LoggerImpl,
  _logger: null,
  _enabled: false,
  handleInheritance: function(child, parent) {
    IDSNS.util.LoggerImpl.ClassRegistry.push(child);
  },
  initialize: function(logger) {
    this.logger = logger;
  },
  answerImplementorInstance: function(klass) {
    if (this.constructor == klass) {
      return this;
    }  
  },
  isEnabled: function() {
    return this._enabled;
  },
  setEnabled: function(bool) {
    this._enabled = (bool) ? true : false;
  },
  getLogger: function() {
    return this._logger;
  },
  setLogger: function(logger) {
    if (logger instanceof IDSNS.util.Logger) {
      this._logger = logger;
    }
  },
  dir: function(obj) {},
  trace: function() {},
  debug: function(str) {},
  warn: function(str) {},
  error: function(str) {},
  exception: function(str) {},
  clear: function() {},
}