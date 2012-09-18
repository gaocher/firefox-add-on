var IDSNS = IDSNS || {};
IDSNS.util = IDSNS.util || {};
/**
 * namespace
 * Luca Matteis http://stackoverflow.com/questions/527089/is-it-possible-to-create-a-namespace-in-jquery
 */
IDSNS.util.namespace = function() {
  var a = arguments, o = null, i, j ,d;
  for (i=0; i<a.length; i=i+1) {
    d = a[i].split(".");
    o = window;
    for (j=0; j<d.length; j=j+1) {
      o[d[j]] = o[d[j]] || {};
      o = o[d[j]];
    }
  }
  return o;
}

/**
 * get local storage
 * @param {String} local storage key name
 * @return {Object}
 */
IDSNS.util.getStore = function(key){
  var cache = localStorage, ret,
    value = cache.getItem(key);
  if (value) {
    try {
      ret = JSON.parse(value);
    } catch(e) {}
    return ret;
  } else {
    return null;
  } 
}

/**
 * set local storage
 * @param {String|Object} key key name | key-value object
 * @param {Object} value key value
 */
IDSNS.util.setStore = function(key, value){
  var cache = localStorage;
  if (typeof key === "string") {
    cache.setItem(key, JSON.stringify(value));
  } else if (typeof key === "object") {
    for (var k in key){
      if (key.hasOwnProperty(k)) {
        cache.setItem(k, key[k]);
      }
    }
  }
}

/**
 * log implementation factory
 * @param {Object} browser navigator object
 * @param {Object} log implementation object
 */
IDSNS.util.getImplementationFor = function(navigator) {
  var reg = IDSNS.util.LoggerImpl.ClassRegistry;
  var impls = [];
  for ( var i = 0; i < reg.length; i++) {
    if (typeof reg[i] == 'function'
        && typeof reg[i].isResponsibleFor == 'function'
        && reg[i].isResponsibleFor(navigator)) {
      impls.push(reg[i]);
    }
  }
  if (impls.length == 0) {
    return IDSNS.util.LoggerImpl;
  } else {
    return impls[0];
  }
}

/**
 * get logger
 * @param {String} logger scope
 */
IDSNS.util.getLogger = function(scope) {
   var logger =  IDSNS.util.Logger.getInstance(scope || arguments.callee.caller);
   return logger;
 }
 
/**
 * simple inherit
 */
IDSNS.util.inherit = function(child, parent) {
  if (!child || !parent) return;
  if (typeof parent.constructor == 'function') {
    // Normal Inheritance
    child.prototype = new parent;
    child.prototype.constructor = child;
  } else {
    // Pure Virtual Inheritance
    child.prototype = parent;
    child.prototype.constructor = child;
  }
  if (typeof child.prototype.handleInheritance == 'function') {
    child.prototype.handleInheritance.apply(child, [child, parent]);
  }
}

/**
 * generate uuid
 */
IDSNS.util.generateQuad = function() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
IDSNS.util.generateGuid = function() {
  return (this.generateQuad() + this.generateQuad() + "-"
    + this.generateQuad() + "-" + this.generateQuad() + "-"
    + this.generateQuad() + "-" + this.generateQuad() + this.generateQuad() + this.generateQuad());
}