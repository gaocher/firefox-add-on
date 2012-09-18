/*
  TODO chat_group users changeable
  ononline
    fetch all groups, if groups empty
  group onopen
    create opening if not exist, or open exist
  group onchange
    jump to exist if exist or change current, notify remote change msg
  chat msg onreceive
    insert to group, update group unread, update groups unread
  chat msg onsend
    insert to group, notify remote
    ack: failed, insert to group
*/

define([
  './chat_group',
  './new_chat_group',
  './chat_content'
  ], function(ChatGroupView, NewChatGroupView, ChatContentView){
  var ChatGroupsView = Backbone.View.extend({
    id: "chat_group_list",
    className: "nav-tabs",
    tagName: "ul",
    events: {},
    initialize: function(){
      var self = this;
      this.collection.unbind();
      this.collection.bind('reset', self.renderList, self);
      this.collection.bind('add', self.onGroupAdd, self);
      // this.collection.bind('remove', self.onGroupRemove, self);
      // this.collection.bind('change', self.onGroupChange, self);
      this.renderList();      
    },
    
    renderList: function(){
      var self = this;
      // clear all groups
      this.$el.html('<li id="new_group_item">'+
                      '<a href="#new_group_content" class="Button Button11 WhiteButton ContrastButton" data-toggle="tab">新会话</a>'+
                      '<img src="/images/icon.png" />'+
                    '</li>');
      var new_chat_group = new NewChatGroupView({collection: self.collection});
      $("#chat_right").html(new_chat_group.render().el);
      new_chat_group.chosenBtnInit();
      var deletedGroups = self.collection.getDeletedGroups();
      this.collection.each(function(chat_group){
        if (_.indexOf(deletedGroups, chat_group.id) == -1) {
          self.renderGroup(chat_group);
        } else {
          self.collection.remove(chat_group);
        }
      });      
    },
    
    onGroupAdd: function(chat_group){
      this.renderGroup(chat_group);
      this.activeGroup(chat_group.id);
    },
    
    activeGroup: function(groupId){
      if (!groupId && this.collection.models.length > 0) {
        groupId = this.collection.at(0).id;
        this.$el.find('li a[href=#'+groupId+']').click();
      } else if(!groupId) {
        this.$el.find('#new_group_item').addClass('active');
      } else if (groupId) {
        this.$el.find('li a[href=#'+groupId+']').click();
      }
    },
    
    renderGroup: function(chat_group){
      var self = this;
      var chat_group_view = new ChatGroupView({model: chat_group});
      self.$el.append(chat_group_view.render().el);      
      var chat_content_view = new ChatContentView({model: chat_group});      
      $('#chat_right').append(chat_content_view.render().el);
    }
  });
  
  return  ChatGroupsView;
});