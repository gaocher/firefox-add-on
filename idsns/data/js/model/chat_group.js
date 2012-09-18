/*
  TODO
    sync: autocomplete
    show unread
*/

define(['./chat_msg'], function(ChatMsg){
  var ChatGroup = Backbone.Model.extend({
    defaults: {
      /*
        TODO
          request [unames] -> response {id:, uname:, avatar:} ??
          response add requestor info
      */
      users: [],
      
      /*
        TODO move unread outside
      */
      unread: 0
    }, 
        
    // msg ids store in db unread
    // fetched_msgs: [],
    
    // chat_msgs: [],
    
    initialize: function(){
      var self = this;
      this.chat_msgs = [];
      this.fetched_msgs = [];
    },
    
    updateFlag: function(){
      var focused = this.collection.chatWindowFocused;
      if (!focused) {
        this.collection.switchBadgeNotice(true);
      }
      this.incrUnread();
    },
    
    sendMsg: function(msg){
      var self = this
        , chat_msg = new ChatMsg({
            gId: self.id,
            fId: IDSNS.glb_user.id,
            msg: msg
          })
        , io = self.collection.net.io;
      io.emit(IDSNS.Const.GROUP_MSG, chat_msg.toJSON());
      chat_msg.set({t: new Date()}, {silent: true});
      this.chat_msgs.push(chat_msg);
      this.trigger('addMsg', chat_msg);
    },
    
    incrUnread: function(num){
      if (!num) num = 1;
      this.set('unread', this.get('unread') + num);
    },
    
    clearUnread: function(){
      this.set('unread', 0);
    },
    
    clearFetchedMsgs: function(){
      var self = this
        , io = this.collection.net.io;
      if (this.fetched_msgs.length > 0) {
        io.emit(IDSNS.Const.CLEAR_UNREAD, self.fetched_msgs);
        this.fetched_msgs = [];
      }
    },
    
    loadMore: function(cbk){
      var self = this;
      var io = this.collection.net.io;
      var time = this.chat_msgs[0] ? 
        this.chat_msgs[0].get("t") : new Date();
      io.emit(
        IDSNS.Const.GROUP_MORE_MSG, 
        {gId: self.id, t: time}, 
        function(msgs){
          if (!msgs || msgs.length == 0) return;
          var tmpMsgs = [];
          _.each(msgs, function(msg){
            var chat_msg = new ChatMsg(msg);
            self.chat_msgs.unshift(chat_msg);
            tmpMsgs.push(chat_msg);
          });
          cbk(tmpMsgs);
        }
      );
    },
    
    add2DeletedGroups: function(id){
      var self = this;
      /*
        TODO multi account bugfix
      */
      var deletedGroups = JSON.parse(localStorage.getItem('deletedGroups')) || [];
      deletedGroups.push(id || self.id);
      localStorage.setItem('deletedGroups', JSON.stringify(deletedGroups));
    },
    
    removeFromDeletedGroups: function(id){
      var self = this;
      var deletedGroups = JSON.parse(localStorage.getItem('deletedGroups')) || [];
      deletedGroups = _.without(deletedGroups, id || self.id);
      localStorage.setItem('deletedGroups', JSON.stringify(deletedGroups));
    },
    
    removeSelfFromGroup: function(group){
      if (!group.users) return;
      group.users = _.reject(group.users, function(user){ return user.id == IDSNS.glb_user.id});
    },
    
    sync: function(method, model, options){
      var io = this.collection.net.io
        , self = this;
      /*
        ? socket or http
      */
      // add self
      if (!io) return;
      /*
        TODO not send unread
      */
      switch (method) {
        case "create":
          // add self
          var jsonModel = model.toJSON();
          jsonModel.users.push(IDSNS.glb_user.uname);
          io.emit(IDSNS.Const.GROUP_CREATE, jsonModel, function(group){
            if (group && group.id && (group.users.length > 1)) {
              self.removeSelfFromGroup(group);
              // check if deleted
              self.removeFromDeletedGroups(group.id);
              var exist_group = self.collection.get(group.id);
              if (exist_group) {
                exist_group.trigger('active');
              } else {
                options.success(group);
              }
            } else {
              options.error('group not valid');
            }
          });
          break;
        case "update":
          // group[0] target group, group[1] origin group if not eql target group
          var data = options.add ? 
            {gId: self.id, uname: options.uname, add: options.add} : 
            {gId: self.id, uid: options.uid, add: options.add};
          io.emit(IDSNS.Const.GROUP_UPDATE, data, function(groups){
            if (groups && groups[0]) {
              var target_group = groups[0];
              self.removeSelfFromGroup(target_group)
              self.removeFromDeletedGroups(target_group.id);
              var group_model = self.collection.get(target_group.id);
              if (group_model) {
                // pass
                options.success(target_group);
              } else {
                group_model = self.collection.add(target_group).get(target_group.id);
              }
              group_model.trigger('active');
            }
            
            if (groups && groups[1]) {
              var origin_group = group[1];
              self.removeSelfFromGroup(origin_group);
              var group_model = self.collection.get(origin_group.id);
              if (group_model) {
                group_model.set(origin_group);
              }
            }
            
            if (groups && groups.length == 0 && !options.add) {
              self.collection.remove(self);
            }
            
            if (!groups || groups.length == 0) {
              options.error();
            }
          });
          break;
        case "read": break;
        case "delete":
          self.add2DeletedGroups();
          options.success();
          break;
        default: break;
      }
    },
    
    parseModel: function(){
      var gJson = this.toJSON();
      // _.each(gJson.users, function(user){
      //   var prefix = (/192\.168\.1\./.test(IDSNS.Const.ImgBase)) ? '' : 'thumb_small_';
      //   user.avatar = _.isEmpty(user.avatar) ? 
      //     '/images/default-avatar.png' : 
      //     IDSNS.Const.ImgBase + prefix + user.avatar;
      // });
      return gJson;
    }
  });
  
  return ChatGroup;
});