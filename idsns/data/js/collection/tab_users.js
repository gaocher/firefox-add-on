define(['../model/user'], function(User){
  var TabUsers = Backbone.Collection.extend({
    model: User,
        
    initialize: function(){
      this.bindChromeEvent();
    },
    
    bindChromeEvent: function(){
      var self = this;
      try {
        this.bind(IDSNS.Const.USER_INDEX, this._userIndex, this);
        this.bind(IDSNS.Const.USER_UPDATE, this._userUpdate, this);
        this.bind(IDSNS.Const.USER_CREATE, this._userCreate, this);
        this.bind(IDSNS.Const.USER_CLOSE, this._userClose, this);
        this.bind(IDSNS.Const.USER_DESTROY, this._userDestroy, this);
        this.bind(IDSNS.Const.SHOW, this._onShow, this);
        // popup trigger
        this.bind(IDSNS.Const.OFFLINE, this._offline, this);
        this.bind(IDSNS.Const.ONLINE, this._online, this);
        this.bind(IDSNS.Const.TAB_INFO, this._onTabInfo, this);
        // msg
        this.bind(IDSNS.Const.RECV_MSG, this._onRecvMsg, this);
        this.bind(IDSNS.Const.CHAT_GROUP, this._onGroupUpdate, this);
        
      } catch(e) {
        console.log(e.stack);
      }
      
      chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (typeof request == 'object' && request != null) {
          if (sendResponse) {
            self.trigger(request.code, request.msg, sendResponse); 
          } else {
            self.trigger(request.code, request.msg); // ignore sender & response
          }
        }
      });
      
      self.sendReq(IDSNS.Const.GET_STATE, {}, function(state){
        state == IDSNS.Const.OFFLINE ? self.trigger('offline') : self.trigger('online');
      });
    },
    
    _onTabInfo: function(msg, resp){
      resp({title: document.title || window.location.href, url: window.location.href});
    },
    
    _online: function(){
      this.trigger('online');
    },
    
    _offline: function(){
      this.remove(this.models);
      this.trigger('offline');
    },
    
    /*
      user close a page
      msg: id, url
    */
    _userClose: function(msg){
      var user = this.get(msg.id);
      if (debug) console.log('user close: '+JSON.stringify(msg));
      if (user) {
        /*
          TODO deep model https://github.com/powmedia/backbone-deep-model
        */
        user.deletePage(msg.url);
        if (_.isEmpty(user.get('pages')) && !msg.follow) {
          this.remove(user);
          if (debug) console.log('get user after delete: '+JSON.stringify(this.get(msg.id)));
        }
      }
    },
    
    /*
      user offline
    */
    _userDestroy: function(msg){
      var user = this.get(msg.id);
      if (debug) console.log('user destroy: '+JSON.stringify(msg));
      if (user) {
        this.remove(user);
      }
    },
    
    /*
      user update a url
      msg: user, from, to
    */
    _userUpdate: function(msg){
      var user = this.get(msg.user.id);
      if (user) {
        user.updatePage(msg.from, msg.to);
        if (debug) console.log('update page '+JSON.stringify(msg));
      } else {
        // create if not exist
        if (debug) console.log('update unexist user '+JSON.stringify(msg));
        this._userCreate(msg);
      }
    },

    /*
      user open a new tab
      msg: user, to
    */
    _userCreate: function(msg){
      if (!msg.to) return;
      var user = this.get(msg.user.id);
      if (!user) {
        if (debug) console.log('create user '+JSON.stringify(msg));
        // add a user without pages
        user = msg.user;
        /*
          TODO ensure msg.to valid, server or client?
        */
        user.pages = {};
        user.pages[msg.to.url] = msg.to;
        this.add(user);
      } else {
        if (debug) console.log(JSON.stringify(user)+'create page '+JSON.stringify(msg));
        user.createPage(msg.to);
      }
    },
    
    _onShow: function(msg){
      var self = this
        , u = msg.user
        , user = this.get(u.id);
      if (debug) console.log('show user: '+JSON.stringify(msg));

      if (u.follow && !user) {
        self.add(u);
      }
    },
    
    /*
      init users
    */
    _userIndex: function(msg){
      /*
        TODO ensure msg.users pages valid
      */
      if (debug) console.log('index: '+JSON.stringify(msg.users));
      this.add(msg.users);
    },
    
    sendReq: function(code, msg, callback){
      if (typeof msg == 'function') {
        callback = msg;
        msg = '';
      }
      /*
        TODO just send code 
      */
      if (typeof callback == "function") {
        chrome.extension.sendMessage({code: code, msg: msg}, callback);
      } else {
        chrome.extension.sendMessage({code: code, msg: msg});
      }
    },
    
    
  });
  
  return TabUsers;
})