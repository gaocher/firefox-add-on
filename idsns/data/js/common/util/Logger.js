/**
 * @param level
 * @param logImplementor
 * @return
 */
IDSNS.util.Logger = function Logger(scope, level, logImplementor) {
  this.__defineGetter__("level", this.getLevel);
  this.__defineSetter__("level", this.setLevel);
  this.__defineGetter__("scope", this.getScope);
  this.__defineSetter__("scope", this.setScope);
  this.__defineGetter__("scopeName", this.getScopeName);
  this.__defineGetter__("scopeNameAsPrefix", this.getScopeNameAsPrefix);
  this.__defineGetter__("useTimestamp", this.isUseTimestamp);
  this.__defineSetter__("useTimestamp", this.setUseTimestamp);
  this.__defineGetter__("usePrefix", this.isUsePrefix);
  this.__defineSetter__("usePrefix", this.setUsePrefix);
  this.__defineGetter__("enabled", this.isEnabled);
  this.__defineSetter__("enabled", this.setEnabled);
  this.scope = scope || arguments.callee.caller;
  this.level = level;
  if (typeof logImplementor != 'undefined' && logImplementor instanceof IDSNS.util.LoggerImpl) {
    this.impl = logImplementor;
  } else {
    var _impl = IDSNS.util.getImplementationFor(navigator);
    this.impl = new _impl(this);
  }
};
IDSNS.util.Logger.LOG_LEVEL_DEBUG = 0;
IDSNS.util.Logger.LOG_LEVEL_INFO = 1;
IDSNS.util.Logger.LOG_LEVEL_WARN = 2;
IDSNS.util.Logger.LOG_LEVEL_ERROR = 3;
IDSNS.util.Logger.LOG_LEVEL_EXCEPTION = 4;
IDSNS.util.Logger.LOG_LEVEL_OFF = 5;
IDSNS.util.Logger.GLOBAL_LEVEL = IDSNS.util.Logger.LOG_LEVEL_ERROR;

IDSNS.util.Logger.DEBUG_PREFIX = "[DEBUG] ";
IDSNS.util.Logger.INFO_PREFIX = "[INFO] ";
IDSNS.util.Logger.WARN_PREFIX = "[WARN] ";
IDSNS.util.Logger.ERROR_PREFIX = "[ERROR] ";
IDSNS.util.Logger.EXCEPTION_PREFIX = "[EXCEPTION] ";

IDSNS.util.Logger._instances = {};

IDSNS.util.Logger.getInstance = function(scope) {
  scope = scope || arguments.callee.caller;
  var scopeName = (typeof scope == 'function') ? scope.name
      : scope.constructor.name;
  if (typeof this._instances[scopeName] == 'undefined') {
    this._instances[scopeName] = new IDSNS.util.Logger(scope);
  }
  return this._instances[scopeName];
};
IDSNS.util.Logger.setInstance = function(logger) {
  this._instance = logger;
};
IDSNS.util.Logger.destroyInstance = function(scope) {
  scope = scope || arguments.callee.caller;
  var scopeName = (typeof scope == 'function') ? scope.name
      : scope.constructor.name;
  delete this._instances[scopeName];
IDSNS.util.Logger};
IDSNS.util.Logger.setGlobalLevel = function(level) {
  var l = parseInt(level);
  if (isNaN(l)) {
    return;
  }
  IDSNS.util.Logger.GLOBAL_LEVEL = l;
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].setLevel(l);
    }
  }
};
IDSNS.util.Logger.setLevel = function(level) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].setLevel(level);
    }
  }
};
IDSNS.util.Logger.enableImplementor = function(klass) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].enableImplementor(klass);
    }
  }
};
IDSNS.util.Logger.disableImplementor = function(klass) {
  if (this._instances) {
    for ( var i in this._instances) {
      this._instances[i].disableImplementor(klass);
    }
  }
};

IDSNS.util.Logger.prototype = {
  constructor: IDSNS.util.Logger,
  _level: 0,
  _scope: null,
  _usePrefix: true,
  _useTimestamp: true,
  _enabled: true,
  getImplementor: function(klass) {
    if (klass) {
      return this.impl.answerImplementorInstance(klass);
    } else {
      return this.impl;
    }
  },
  enableImplementor: function(klass) {
    if (klass) {
      var i = this.getImplementor(klass);
      if (i) {
        i.enabled = true;
      }
    } else {
      this.impl.enabled = true;
    }
  },
  disableImplementor: function(klass) {
    if (klass) {
      var i = this.getImplementor(klass);
      if (i) {
        i.enabled = false;
      }
    } else {
      this.impl.enabled = false;
    }
  },
  setLevel: function(level) {
    this._level = parseInt(level);
    if (isNaN(this._level)) {
      this._level = IDSNS.util.Logger.GLOBAL_LEVEL;
    } 
  },
  getLevel: function() {
    return this._level;
  },
  setScope: function(obj) {
    if (typeof obj == 'function') {
      this._scope = obj;
    } else if (typeof obj == 'object' && obj != null) {
      this._scope = obj.constructor;
    }
  },
  getScope: function() {
    return this._scope;
  },
  getScopeName: function() {
    if (this.scope) {
      return this.scope.name;
    } else {
      return "";
    }
  },
  getScopeNameAsPrefix: function() {
    var scopeName = this.scopeName;
    return (scopeName) ? "[" + scopeName + "] ": "";
  },
  _padNumber: function(num, len) {
    var padStr = "0"
    num = parseInt(num);
    if (isNaN(num)) {
      num = 0;
    }
    var isPositive = (num >= 0) ? true : false;
    var numStr = "" + Math.abs(num);
    while (numStr.length < len) {
      numStr = padStr + numStr;
    }
    if (!isPositive) {
      numStr = "-" + numStr;
    }
    return numStr;
  },
  getPrefix: function(pfx) {
    var str = "";
    if (this.useTimestamp) {
      var d = new Date();
      var mo = this._padNumber((d.getMonth() + 1), 2);
      var dd = this._padNumber(d.getDate(), 2);
      var h = this._padNumber(d.getHours(), 2);
      var m = this._padNumber(d.getMinutes(), 2);
      var s = this._padNumber(d.getSeconds(), 2);
      var tz = this._padNumber((0 - (d.getTimezoneOffset() / 60) * 100), 4);
      str += mo + "/" + dd + "/" + d.getFullYear() + " " + h + ":" + m + ":" + s
          + "." + d.getMilliseconds() + " " + tz + " ";
    }
    if (this.usePrefix) {
      str += pfx;
    }
    str += this.scopeNameAsPrefix;
    return str;
  },
  isUsePrefix: function() {
    return this._usePrefix;
  },
  setUsePrefix: function(bool) {
    this._usePrefix = (bool) ? true : false;
  },
  isUseTimestamp: function() {
    return this._useTimestamp;
  },
  setUseTimestamp: function() {
    this._useTimestamp = (bool) ? true : false;
  },
  isEnabled: function() {
    return this._enabled;
  },
  setEnabled: function(bool) {
    this._enabled = (bool) ? true : false;
  },
  isDebugEnabled: function() {
    return (this.enabled && this.level <= IDSNS.util.Logger.LOG_LEVEL_DEBUG)
  },
  // Dumps an objects properties and methods to the console.
  dump: function() {
    if (this.enabled && this.impl.enabled) {
      this.impl.dir(obj);
    }
  },
  // Same as dump
  dir: function(obj) {
    if (this.enabled && this.impl.enabled) {
      this.impl.dir(obj);
    }
  },
  // Dumps a stracktrace to the console.
  trace: function() {
    if (this.enabled && this.impl.enabled) {
      this.impl.trace();
    }
  },
  // Prints a debug message to the console.
  debug: function(str) {
    if (this.enabled && this.impl.enabled
        && this.level <= IDSNS.util.Logger.LOG_LEVEL_DEBUG) {
      this.impl.debug(this.getPrefix(IDSNS.util.Logger.DEBUG_PREFIX) + str);
    }
  },
  // Prints a warning message to the console.
  warn: function(str) {
    if (this.enabled && this.impl.enabled
        && this.level <= IDSNS.util.Logger.LOG_LEVEL_WARN) {
      this.impl.warn(this.getPrefix(IDSNS.util.Logger.WARN_PREFIX) + str);
    }
  },
  exception: function(str) {
    if (this.enabled && this.impl.enabled
        && this.level <= IDSNS.util.Logger.LOG_LEVEL_EXCEPTION) {
      this.impl
          .exception(this.getPrefix(IDSNS.util.Logger.EXCEPTION_PREFIX) + str);
    }
  },
  alert: function(str) {
    if (this.enabled && this.impl.enabled) {
      this.impl.alert(str);
    }
  },
  clear: function() {
    this.impl.clear();
  }
}