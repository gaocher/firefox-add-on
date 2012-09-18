define(['hbs!./template/chat_group_temp'], function(chat_group_temp){
  var ChatGroup = Backbone.View.extend({
    tagName: "li",
    
    events: {
      'click': '_onClick'
    },
    
    initialize: function(){
      var self = this;
      // this.model.unbind();
      this.model.bind('change:users', this.render, this);
      this.model.bind('change:unread', this.onUpdateUnread, this);
      this.model.bind('active', this._onActive, this);
      this.model.bind('remove', this._onRemove, this);
    },
    
    render: function(){
      var temp = this.model.toJSON();
      temp.id = this.model.id;
      temp.unames = _.pluck(temp.users, "uname").join(" ");
      
      $(this.el).html(chat_group_temp(temp));
      return this;
    },
    
    onUpdateUnread: function(){
      // not update on actived group
      if ($(this.el).hasClass('active')) return;
      this.render();
    },    
    
    _onActive: function(){
      this.$el.find('a').click();
    },
    
    // transport to focus callback handle this event
    _onClick: function(){
      $('#'+this.model.id).focus();
    },
    
    _onRemove: function(){
      this.$el.remove();
    }
  });
  
  return ChatGroup;
})
    
