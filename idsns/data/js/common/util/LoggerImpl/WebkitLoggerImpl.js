IDSNS.util.LoggerImpl.WebKitLoggerImpl = function WebKitLoggerImpl(logger) {
  this.initialize(logger);
};
IDSNS.util.inherit(IDSNS.util.LoggerImpl.WebKitLoggerImpl, IDSNS.util.LoggerImpl);
IDSNS.util.LoggerImpl.WebKitLoggerImpl.isResponsibleFor = function(navigator) {
  return navigator.userAgent.toLowerCase().indexOf("applewebkit/") > 0;
};
var fn = IDSNS.util.LoggerImpl.WebKitLoggerImpl.prototype;
fn.constructor=IDSNS.util.LoggerImpl.WebKitLoggerImpl;
fn._enabled=true;
fn.dir=function(obj) {
  console.group(this.logger.scopeName);
  console.dir(obj);
  console.groupEnd();
};
fn.trace=function() {
  console.group(this.logger.scopeName);
  console.trace();
  console.groupEnd();
};
fn.debug=function(str) {
  console.debug(str);
};
fn.info=function(str) {
  console.info(str);
};
fn.warn=function(str) {
  console.warn(str);
};
fn.error=function(str) {
  console.error(str);
};
fn.exception=function(str) {
  console.error(str);
  this.trace();
};
fn.alert=function(str) {
  alert(str);
}
