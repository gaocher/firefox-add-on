/*
  should
    get fetch groups when online
    show total unread messages when online in popup
    initialize chat_groups view
    
  user should
    count unread msg num -> got an unread buffer
*/

define(['../model/chat_group', '../model/chat_msg'], function(ChatGroup, ChatMsg){
  var ChatGroups = Backbone.Collection.extend({
    model: ChatGroup,
    
    url: '<%= root_url %>/groups',
    
    chatWindowFocused: false,
    
    noticeTimer: null,
    
    initUnreadMsgs: [], // share between multiply instance
    
    chatWindowId: null,
    
    initChat2User: null,
    
    initialize: function(models, options){
      var self = this;
      self.net = options.net;
      if (!self.net) return;
      self.net.on(IDSNS.Const.ONLINE, function(){
        self.fetch({
          silent: true, 
          success: function(collection, resp){
            
            if (self.initUnreadMsgs.length > 0) {
              _.each(self.initUnreadMsgs, function(chat_msg){
                var init_group = collection.get(chat_msg.get('gId'));
                init_group.chat_msgs.push(chat_msg);
                init_group.fetched_msgs.push(chat_msg.id);
              });
              self.initUnreadMsgs = [];
              self.switchBadgeNotice(true);
              self.trigger('ringing', self);
              chrome.extension.sendMessage({code: IDSNS.Const.RINGING});
            }
            self.trigger('reset', self);
          }
        });
        self.trigger(IDSNS.Const.ONLINE);
      });
      
      self.net.on(IDSNS.Const.HIDDEN2ALL, function(){
        self.trigger(IDSNS.Const.ONLINE);
      });
      self.net.on(IDSNS.Const.HIDDEN2FANS, function(){
        self.trigger(IDSNS.Const.ONLINE);
      });
      self.net.on(IDSNS.Const.OFFLINE, function(){
        self.trigger(IDSNS.Const.OFFLINE);
      });
      
      /*
        chat group
        +41: receive remote group msg
        +42: remote group change
      */
      self.net.on(IDSNS.Const.GROUP_MSG, self._onGroupMsg.bind(self));
      self.net.on(IDSNS.Const.GROUP_UPDATE, self._onGroupUpdate.bind(self));      
      chrome.windows.onRemoved.addListener(function(windowId){
        if (windowId == self.chatWindowId) {
          self.chatWindowId = null;
          self.chatWindowFocused = false;
        }
      });
      chrome.windows.onFocusChanged.addListener(self.onChatWindowFocus);
      chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if (request && request.code == IDSNS.Const.OPENCHAT2USER) {
          self.initChat2User = request.msg;
          self.openChatWindow();
        }
      });
    },

    onChatWindowFocus: function(windowId){
      var self = this;
      if (self.chatWindowId && windowId == self.chatWindowId) {
        // stopBadgeNotice
        self.switchBadgeNotice(false);
        self.chatWindowFocused = true;
      } else {
        self.chatWindowFocused = false;
      }
    },
    
    removeSelfFromGroup: function(group){
      if (!group.users) return;
      group.users = _.reject(group.users, function(user){ return user.id == IDSNS.glb_user.id});
    },
    
    _onGroupMsg: function(msg){
      /*
        db msg: groupId, fromUserId, msg, time
        trans msg: groupId, fromUserId, msg
      */
      var self = this
        , model = this.get(msg.gId)
        , chat_msg = new ChatMsg(msg);

      if (!model) {
        // sync group from server
        self.net.io.emit(IDSNS.Const.GROUP_READ, msg.gId, function(group){
          if (!group) return;
          self.removeSelfFromGroup(group);
          self.add(group);
          var read_group = self.get(group.id);
          // show msg alert, reorder chat group list
          self._addMsg2Group(read_group, chat_msg);
        });
      } else {
        self._addMsg2Group(model, chat_msg);
      }
    },
    
    _addMsg2Group: function(group, msg){
      var self = this;
      group.chat_msgs.push(msg);
      group.updateFlag();
      group.trigger('addMsg', msg);
      chrome.extension.sendMessage({code: IDSNS.Const.RINGING});
    },
    
    _onGroupUpdate: function(data){
      var self = this
        , model = this.get(data.gId);
      if (!model || !data.user) return;
      var users = model.get('users');        
      if (data.add) {
        var uids = _.pluck(users, 'id');
        if (!_.include(uids, data.user.id)) {
          model.set('users', _.union([data.user], users));
        }
      } else {
        users = _.filter(users, function(user){ return user.id != data.user });
        if (users.length == 0 || data.user == IDSNS.glb_user.id) {
          self.remove(model);
        } else {
          model.set('users', users);
        }
      }
    },
    
    /*
      TODO test overwrite
    */
    parse: function(resp, xhr){
      var self = this;
      if (resp.msgs && resp.msgs.length > 0) {
        _.each(resp.msgs, function(msg){
          var chat_msg = new ChatMsg(msg);
          self.initUnreadMsgs.push(chat_msg);
        });
      }
      
      if (resp.groups && resp.groups.length > 0) {
        _.each(resp.groups, function(group){
          self.removeSelfFromGroup(group);
        });
      }
      return resp.groups;
    },
    
    switchBadgeNotice: function(start){
      if (!start && this.noticeTimer) {
        clearInterval(this.noticeTimer);
        this.noticeTimer = null;
        chrome.browserAction.setIcon({path: '/images/icon.png'});
      } else if (start && !this.noticeTimer)  {
        var on = false;
        this.noticeTimer = setInterval(function(){
          if (!on) {
            chrome.browserAction.setIcon({path: '/images/icon-active.png'});
            on = true;
          } else {
            chrome.browserAction.setIcon({path: '/images/icon.png'});
            on = false;
          }
        }, 500);
      }
    },
    
    focusChatWindow: function(){
      if (this.chatWindowId) {
        chrome.windows.update(this.chatWindowId, {focused: true});
      }
    },
    
    openChatWindow: function(){
      if (!this.chatWindowId) {
        var left = screen.width / 2 - 316;
        var top = screen.height / 2 - 225;
        window.open('/chat.html', '', 
        'status=no,'+
        'resizable=no,'+
        'scrollbars=yes,'+
        'personalbar=no,'+
        'directories=no,'+
        'location=no,'+
        'toolbar=no,'+
        'menubar=no,'+
        'width=632,'+
        'height=450,'+
        'left='+left+','+
        'top='+top);
      } else {
        this.focusChatWindow();
      }
    },
    
    getDeletedGroups: function(){
      var self = this;
      var deletedGroups = JSON.parse(localStorage.getItem('deletedGroups')) || [];
      return deletedGroups;
    }
  });
  
  return ChatGroups;
});