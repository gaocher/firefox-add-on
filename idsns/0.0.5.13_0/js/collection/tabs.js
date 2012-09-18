// 
//  tabs.js
//  extension
//  
//  Created by liang mei on 2012-05-19.
//  Copyright 2012 __MyCompanyName__. All rights reserved.
// 

/*
  TODO read tab users api call after extension open
  message parser
  client onCloseTimeout isn't the same meaning for server
  load faster
  open browser first time open many tabs
*/
define(['../model/tab'], function(Tab){  
  /*
    TODO localstorage store online status
  */
  var Tabs = Backbone.Collection.extend({
    model: Tab,    
    
    follows: [],
    
    initialize: function(models, options) {
      var self = this;
      self.net = options.net;
      if (!self.net) return;
      self._unbindLocalTabEvent();
      
      self.tabEventsHandler = {
        'onRemoved': self._onLocalTabRemoved.bind(self),
        'onUpdated': self._onLocalTabUpdated.bind(self),
        'onCreated': self._onLocalTabCreated.bind(self),
        'onActivated': self._activeCurrentPage.bind(self)
      }
      
      /*
        following
        +11: get following user state

        tab
        +22: remote tab create
        +23: remote tab update
        +24: remote user destroy all tabs
        +25: remote tab close

        user
        +31: remote user switch state
      */
      self.net.on(IDSNS.Const.ONLINE, self._onOnline.bind(self));
      self.net.on(IDSNS.Const.HIDDEN2ALL, self._onHidden.bind(self));
      self.net.on(IDSNS.Const.HIDDEN2FANS, self._onHidden.bind(self));
      self.net.on(IDSNS.Const.OFFLINE, self._onOffline.bind(self));
      self.net.on('initFollowing', self._onInitFollowing.bind(self));
      self.net.on('create', self._onRemoteTabCreate.bind(self));
      self.net.on('update', self._onRemoteTabUpdate.bind(self));
      self.net.on(IDSNS.Const.DESTROY, self._onRemoteUserDestroy.bind(self));
      self.net.on('close', self._onRemoteTabClose.bind(self));
      self.net.on(IDSNS.Const.SHOW, self._onRemoteUserShow.bind(self));
      self._bindLocalTabEvent();
    },
    
    _onInitFollowing: function(data){
      var self = this;
      if (debug) console.log('init following: '+JSON.stringify(data));
      self.net.changeState(data.state ? data.state : IDSNS.Const.ONLINE);
      self.follows = _.union(self.follows, data.users);
    },
    
    _publish2Tabs: function(code, msg, domain){
      var self = this;
      self.each(function(tab){
        if (domain && tab.get('domain') != domain) return;
        self._sendTabReq(tab.get('id'), code, msg);
      });
    },
    
    _addFollows: function(user, to, from){
      var self = this;
      var find = _.find(self.follows, function(u){
        if (u.id == user.id) {
          if (from && u.pages[from]) {
            delete u.pages[from];
          }
          u.pages[to.url] = {
            title: to.title, 
            domain: to.domain
          };
          return true;
        }          
      });
      if (!find) {
        var tmp = {};
        tmp[to.url] = {
          title: to.title, 
          domain: to.domain
        };
        self.follows.push({
          id: user.id,
          uname: user.uname,
          desc: user.desc,
          pages: tmp
        });
      }
    },
    
    _onRemoteTabCreate: function(user, page){
      var self = this;
      if (debug) {
        console.log(JSON.stringify(user)+' create: '+JSON.stringify(page));
      }
      if (user.follow) {
        self._addFollows(user, page);
        self._publish2Tabs(IDSNS.Const.USER_CREATE, {user: user, to: page});
      } else {
        self._publish2Tabs(IDSNS.Const.USER_CREATE, {user: user, to: page}, page.domain);
      }
    },
    
    _onRemoteTabUpdate: function(user, from , to){
      var self = this;
      if (debug) {
        console.log(JSON.stringify(user)+' update: '+JSON.stringify(from)+' to: '+JSON.stringify(to));
      }
      var fromUrl = from.domain ? from.url : from;
      if (user.follow) {
        self._addFollows(user, to, fromUrl);
        self._publish2Tabs(IDSNS.Const.USER_UPDATE, {user: user, from: fromUrl, to: to});
      } else if(from.domain == to.domain) {
        self._publish2Tabs(IDSNS.Const.USER_UPDATE, {user: user, from: fromUrl, to: to}, from.domain);
      }
    },
    
    _onRemoteTabClose: function(user, page){
      var self = this;
      if (debug) {
        console.log(user.id +' close: '+JSON.stringify(page));
      }
      var url = page.domain ? page.url : page;
      if (user.follow) {
        _.find(self.follows, function(u){
          if (u.id == user.id) {
            delete u.pages[url];
            return true;
          }
        });
      }
      if (user.follow) {
        self._publish2Tabs(IDSNS.Const.USER_CLOSE, {id: user.id, url: url, follow: user.follow});
      } else {
        self._publish2Tabs(IDSNS.Const.USER_CLOSE, {id: user.id, url: url, follow: user.follow}, page.domain);
      }
    },
    
    _removeFollows: function(userId){
      var self = this
        , findUser = _.find(self.follows, function(u){return u.id == userId;});
      if (findUser) {
        self.follows = _.without(self.follows, findUser);
      }
    },
    
    _onRemoteUserDestroy: function(userId){
      var self = this;
      if (debug) {
        console.log(userId + ' destroy');
      }
      self._removeFollows(userId);
      self._publish2Tabs(IDSNS.Const.USER_DESTROY, {id: userId});
    },

    _onRemoteUserShow: function(user){
      var self = this;
      if (debug) {
        console.log(user.id + ' state: '+ user.state);
      }
      if(user.follow) {
        var pages = user.pages;
        Object.keys(pages).forEach(function(key){
          var data = pages[key];
          data.url = key;
          self._addFollows(user, data);
        });
      }
      self._publish2Tabs(IDSNS.Const.SHOW, {user: user});
    },    

    _sendTabReq: function(tabId, code, msg, callback) {
      if (typeof callback == "function") {
        chrome.tabs.sendMessage(tabId, {code:code, msg:msg}, callback);
      } else {
        chrome.tabs.sendMessage(tabId, {code:code, msg:msg});
      }
    },
    
    /*
      TODO domain match
    */
    sendUsers2Tab: function(id, users) {
      var model = this.get(id);
      if (model) {
        this._sendTabReq(parseInt(id), IDSNS.Const.USER_INDEX, {users: users});
      }
    },
    
    _activeCurrentPage: function(){
      var self = this;
      // sync current tab 
      chrome.tabs.getSelected(null,function(tab){
        if (/^http(s)?:\/\//.test(tab.url) == false) return;
        if (tab && tab.status == "complete") {
          var curHost = $.url(tab.url).attr('host');
          var blockedSites = IDSNS.glb_user.blockedSite;
          if (_.include(blockedSites, curHost)) {
            return;
          }
          var model = self.get(tab.id);
          if (model) return;
          // notify content script
          // ONLINE or HIDDEN
          self._sendTabReq(tab.id, IDSNS.Const.ONLINE);
          self.create({id: tab.id, url: tab.url, title: tab.title});
        }
      });
    },
    
    _onOnline: function(){
      this._bindLocalTabEvent();
      this._activeCurrentPage();
      IDSNS.chrome.api.updateBadge(IDSNS.Const.ONLINE);
    },
    
    _onOffline: function(){
      var self = this;
      this._unbindLocalTabEvent();
      // destroy all tabs
      this.each(function(tab) {
        self._sendTabReq(tab.get('id'), IDSNS.Const.OFFLINE);
        self.remove(tab);
      });
      // clear follows
      this.follows = [];
      IDSNS.chrome.api.updateBadge(IDSNS.Const.OFFLINE);
    },
    
    _onHidden: function(){
      var self = this;
      this._bindLocalTabEvent();
      this._activeCurrentPage();
      IDSNS.chrome.api.updateBadge(IDSNS.Const.HIDDEN2ALL); // hidden2all icon equal hidden2fans
    },

    _onLocalTabCreated: function(tab){
      var self = this, blockedSites = IDSNS.glb_user.blockedSite;
      if (/^http(s)?:\/\//.test(tab.url) == false) return;
      if (tab && tab.status == "complete") {
        if (debug) {
          console.log("created tab id: "+ tab.id);
          chrome.tabs.getSelected(null,function(tab) {
            console.log("current tab id: " + tab.id + " url: "+ tab.url);            
          });
        }
        var curHost = $.url(tab.url).attr('host');
        if (_.include(blockedSites, curHost)) {
          self._sendTabReq(tab.id, IDSNS.Const.OFFLINE);
          return;
        }
        self._sendTabReq(tab.id, IDSNS.Const.TAB_INFO, {}, function(info){
          if (!info || !info.url) return;
          self.create({id: tab.id, url: info.url, title: info.title});
        });
      }
    },
    
    _onLocalTabUpdated: function(tabId, changeInfo, tab){
      var self = this;
      if (/^http(s)?:\/\//.test(tab.url) == false) return;
      if (tab && tab.status == "complete") {
        if (debug) {
          console.log("updated tab id: "+ tabId);
          chrome.tabs.getSelected(null,function(tab) {
            console.log("current tab id: " + tab.id + " url: "+ tab.url);            
          });
        }
        var curHost = $.url(tab.url).attr('host')
          , blockedSites = IDSNS.glb_user.blockedSite;
        if (_.include(blockedSites, curHost)) {
          self._sendTabReq(tab.id, IDSNS.Const.OFFLINE);
          return;
        }
        self._sendTabReq(tab.id, IDSNS.Const.TAB_INFO, {}, function(info){
          if (!info || !info.url) return;
          var model = self.get(tab.id);
          if (model) {
            var preUrl = model.get("url") ? model.get("url") : null;
            model.save({url: info.url, title: info.title}, {preUrl: preUrl});
          } else {
            self.create({id: tab.id, url: info.url, title: info.title});
          }
        });

      }
    },
    
    _onLocalTabRemoved: function(tabId, removeInfo){
      if (debug) console.log('removed tab id: '+ tabId);
      var tab = this.get(tabId);
      if (tab) {
        tab.destroy();
      }
    },
    
    _bindLocalTabEvent: function(){
      var self = this;
      Object.keys(self.tabEventsHandler).forEach(function(key){
        if (!chrome.tabs[key].hasListener(self.tabEventsHandler[key])) {
          chrome.tabs[key].addListener(self.tabEventsHandler[key]);
        }
      });
      /*
        TODO
          fetch latest page after destroy
          long loading time page didn't fire event
      */
    },
    
    _unbindLocalTabEvent: function(){
      var self = this;
      if (self.tabEventsHandler) {
        Object.keys(self.tabEventsHandler).forEach(function(key){
          if (chrome.tabs[key].hasListener(self.tabEventsHandler[key])) {
            chrome.tabs[key].removeListener(self.tabEventsHandler[key]);
          }
        });
      }
    }
  });
  return Tabs;
});