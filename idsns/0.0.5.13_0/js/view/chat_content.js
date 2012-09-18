define([
  'hbs!./template/chat_msg_temp', 
  'hbs!./template/author_msg_temp',
  'hbs!./template/chat_content_temp'
  ], function(chat_msg_temp, author_msg_temp, chat_content_temp){
  var ChatContentView = Backbone.View.extend({
    className: "tab-pane",
    
    events: {
      /*
        TODO test event delegate or bind
      */
      "click .cg-remove-user": '_onRemoveUser',
      "click .cg-block-user": '_onBlockUser',
      "click .icon-chevron-left": '_onMoveLeft',
      "click .icon-chevron-right": '_onMoveRight',
      "click .icon-remove" : "_onClose",
      "click .icon-hand-up" : "_onLoadMore",
      "click .icon-off" : "_onExit",
      "click .icon-plus" : "_onBeforeAddUser",
      "keydown .msgInput" : "_onMsgInput",
      "click .sendMsgBtn" : "sendMsg",
      "click .cg-add-user-wrap" : "_disableAutoHide", 
      "focus": '_onFocus'
    },
    
    initialize: function(){
      this.avatar_cursor = 0;
      // this.model.unbind();
      this.model.bind('change:users', this.render, this);
      this.model.bind('addMsg', this.addMsg, this);
      this.model.bind('remove', this._onRemove, this);
      // this.model.bind('moreMsgs', this._onMoreMsgs, this);
    },
    
    render: function(){
      var self = this;
      $(this.el).html(this._renderContentHtml(this.model.parseModel()));
      this.$el.attr('id', this.model.id);
      
      var users_count = this.model.get("users").length;
      this.avatar_cursor = Math.floor(users_count/10);
      if (this.avatar_cursor == 0) 
        this.$('.icon-chevron-right').addClass('click-disabled');
      // render all msgs
      for (var i=0, max = this.model.chat_msgs.length; i < max; i++) {
        self.addMsg(self.model.chat_msgs[i]);
      };
      this.$('.cg-avatar-wrap').dropdown();
      this.$('.icon-plus').dropdown();
      // menu not disappear when clicked
      // self.$('.cg-add-user-wrap').click(function(e){
      //   if ($(e.target).hasClass('cg-add-user')) self._onAddUser(e);
      //   return false;
      // });
      return this;
    },
    
    _onBeforeAddUser: function(){
      var self = this;
      self.$('.cg-add-user-wrap .loading-result').hide();
      self.$('.cg-add-user-wrap .loading').hide();
    },
    
    _disableAutoHide: function(e){
      var self = this;
      if ($(e.target).hasClass('cg-add-user')) {
        var uname = this.$('.cg-add-user-input').val();
        if (_.isEmpty(uname)) return;
        // add item fake
        this.model.save({}, {
          wait: true, 
          add: true, 
          uname: uname,
          success: function(){
            self.$('.cg-add-user-wrap .loading-result').css('display', 'block').html('添加成功');
            self.$('.cg-add-user-wrap .loading').hide();
          },
          error: function(){
            self.$('.cg-add-user-wrap .loading-result').css('display', 'block').html('此用户不存在或无法添加'); 
            self.$('.cg-add-user-wrap .loading').hide();
          }
        });
        this.$('.cg-add-user-wrap .loading').css('display', 'block');
      }
      return false;
    },
    
    _onRemoveUser: function(e){
      var self = this
        , uid = $(e.target).attr('uid');
      if (_.isEmpty(uid)) return;
      this.model.save({}, { wait: true, add: false, uid: uid });
    },
    
    _onExit: function(){
      var self = this
        , uid = IDSNS.glb_user.id;
      this.model.save({}, { wait: true, add: false, uid: uid });
    },
    
    _onBlockUser: function(e){
      var uid = $(e.target).attr("uid");
      var request = new IDSNS.web.Request();
      request.blockUser(uid);
    },
    
    sendMsg: function(){
      var msg = this.$('.msgInput').val();
      if (!(/\S+/).test(msg)) return;
      this.model.sendMsg(msg);
      this.$('.msgInput').val('');
    },
    
    /*
      TODO add old/new msg
    */
    addMsg: function(chat_msg){
      var temp_data = this.parseMsg(chat_msg);
      /*
        TODO test uname exist
      */
      var msg_html = this._renderMsgHtml(temp_data);
      this.$('.outputWrap')
        .append(msg_html)
        .scrollTop(this.$('.outputWrap')[0].scrollHeight);
    },
    
    parseMsg: function(chat_msg){
      var temp_data = {}, fId = chat_msg.get('fId');
      temp_data.id = this.model.id;
      temp_data.author = (fId == IDSNS.glb_user.id) ? true : false;
      temp_data.msg = chat_msg.get('msg');
      var users = this.model.get('users');
      var fuser = (fId == IDSNS.glb_user.id) ? IDSNS.glb_user : _.find(users, function(user){ return user.id == fId });
      temp_data.uname = fuser.uname;
      temp_data.t = chat_msg.get('t');
      return temp_data;
    },
    
    _onFocus: function(){
      this.model.clearFetchedMsgs();
      this.model.clearUnread();
    },
    
    _onMsgInput: function(e){
      if (e.ctrlKey && e.keyCode == 13) {
        this.sendMsg();
        return false;
      }
    },
    
    _onMoreMsgs: function(chat_msgs){
      var self = this;
      _.each(chat_msgs, function(chat_msg){
        var temp_data = self.parseMsg(chat_msg), msg_html = self._renderMsgHtml(temp_data);
        self.$('.outputWrap').prepend(msg_html);
      });
      self.$('.outputWrap').scrollTop(0);
    },
    
    _renderMsgHtml: function(temp_data){
      var time = temp_data.t
        , send_time = time ? new Date(time) : new Date();
      send_time = send_time.format("yyyy-mm-dd HH:MM");
      temp_data.send_time = send_time;
      if (!temp_data.author) {
        return chat_msg_temp(temp_data);
      } else {
        return author_msg_temp(temp_data);
      }
    },
    
    _renderContentHtml: function(temp_data){
      _.each(temp_data.users, function(user){
        var avatar = _.isEmpty(user.avatar) ? 
          '/images/thumb_small_default.png' : 
          IDSNS.Const.ImgBase + 'thumb_small_'+ user.avatar
          , sname = user.uname > 5 ? user.uname.slice(0, 5)+"..." : user.uname;
        user.full_avatar = avatar;
        user.sname = sname;
      });
      return chat_content_temp(temp_data);
    },
    
    _onClose: function(){
      this.model.destroy();
    },
    
    _onLoadMore: function(){
      var self = this;
      this.model.loadMore(function(msgs){
        self._onMoreMsgs(msgs);
      });
    },
    
    _onMoveRight: function(){
      if (this.$('.icon-chevron-right').hasClass('click-disabled')) return;
      if ((this.avatar_cursor+1)*10 > this.model.get("users").length) {
        this.$('.icon-chevron-right').addClass('click-disabled');
      }
      this.avatar_cursor += 1;
      this.$('.icon-chevron-left').removeClass('disabled');
      this.$('.cg-avatar-ul').animate({left: '-=350'}, 1000);
    },
    
    _onMoveLeft: function(){
      if (this.$('.icon-chevron-left').hasClass('disabled')) return;
      if (this.avatar_cursor == 1) {
        this.$('.icon-chevron-left').addClass('disabled');
      }
      this.avatar_cursor -= 1;
      this.$('.icon-chevron-right').removeClass('click-disabled');
      this.$('.cg-avatar-ul').animate({left: '+=350'}, 1000);
    },
    
    _onRemove: function(){
      this.$el.remove();
    }
  });

  return ChatContentView;
})