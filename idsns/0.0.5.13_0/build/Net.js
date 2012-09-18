// require Const.js, backbone, underscore

IDSNS.util.namespace("IDSNS");

IDSNS.Net = function(){
  this.initialize();
};

_.extend(IDSNS.Net.prototype, Backbone.Events, {
  constructor: IDSNS.Net,
  
  initialize: function(){
    this.state = localStorage.getItem('idsns-state');
    if (!bgDebug && this.state == IDSNS.Const.ONLINE){
      this._ensureOpenSocket();
    }
  },
  
  debugLog: function(str){
    if (debug) {
      console.log(str);
    }
  },
  
  _createSocket: function(){
    var self = this;
    /*
      TODO io event handler `this`
    */
    this.io = io.connect('http://yunitongzai.com', {'try multiple transports': false});
    this.io.on('disconnect', function(){
      self.debugLog('disconnect');
      self.changeState(IDSNS.Const.OFFLINE);
    });
    
    this.io.on('connect', function(){
      // work around to connect but offline ??
      self.changeState(IDSNS.Const.ONLINE);
      self.debugLog('socket connected');
    });
    this.io.on('error', function(e){self.onOffline(); console.log(e);});
    this.io.on('connecting', function(){self.debugLog('connecting');});
    this.io.on('connect_failed', function(){self.debugLog('connect_failed');});
    this.io.on('reconnect', function(){self.debugLog('reconnect');});
    this.io.on('reconnecting', function(){self.debugLog('reconnecting');});
    this.io.on('reconnect_failed', function(){self.debugLog('reconnect_failed');});
    
    _.each([
      'initFollowing',
      'create',
      'update',
      IDSNS.Const.DESTROY,
      'close',
      IDSNS.Const.SHOW,
      IDSNS.Const.GROUP_MSG,
      IDSNS.Const.GROUP_UPDATE
    ], function(ioEvent){
      self.io.on(ioEvent, function(){
        var args = _.toArray(arguments);
        args.unshift(ioEvent);
        Backbone.Events.trigger.apply(self, args);
      });
    });
  },
  
  onOnline: function(){
    var self = this;
    this._ensureOpenSocket();
    if (this.state == IDSNS.Const.HIDDEN2ALL || this.state == IDSNS.Const.HIDDEN2FANS){
      this.io.emit(IDSNS.Const.SWITCHHIDDEN, IDSNS.Const.ONLINE, function(){
        self.changeState(IDSNS.Const.ONLINE);
      });
    }
  },
  
  onOffline: function(){
    var self = this;
    this._ensureCloseSocket();
    this.changeState(IDSNS.Const.OFFLINE);
  },
  
  onHidden2All: function(){
    var self = this;
    this._ensureOpenSocket();
    if (this.state != IDSNS.Const.HIDDEN2ALL){
      this.io.emit(IDSNS.Const.SWITCHHIDDEN, IDSNS.Const.HIDDEN2ALL, function(){
        self.changeState(IDSNS.Const.HIDDEN2ALL);
      });
    }
  },
  
  onHidden2Fans: function(){
    var self = this;
    this._ensureOpenSocket();
    if (this.state != IDSNS.Const.HIDDEN2FANS) {
      this.io.emit(IDSNS.Const.SWITCHHIDDEN, IDSNS.Const.HIDDEN2FANS, function(){
        self.changeState(IDSNS.Const.HIDDEN2FANS);
      });
    }
  },

  /*
    content script load ready check online stat
  */
  onGetState: function(msg, sender, resp){
    var self = this;
    if (typeof resp == 'function') resp(self.state);
  },
  
  _ensureOpenSocket: function(){
    if (!this.io) {
      this._createSocket();
    } else if (!this.io.socket.connected && !this.io.socket.connecting) {
      this.io.socket.connect('http://yunitongzai.com', {'try multiple transports': false});
    }
  },

  _ensureCloseSocket: function(){
    if (this.io) {
      this.io.disconnect();
    }
  },
  
  changeState: function(state){
    this.trigger(state);
    this.state = state;
    localStorage.setItem('idsns-state', this.state);
  }
});
