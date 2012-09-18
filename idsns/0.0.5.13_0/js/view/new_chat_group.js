/*
  TODO 
    keyup search event
*/
define(['hbs!./template/new_chat_group_temp'], function(new_chat_group_temp){
  var NewChatGroupView = Backbone.View.extend({
    className: "tab-pane active",
    
    id: "new_group_content",
        
    events: {
      "click .Button": "createGroup"
    },
    
    initialize: function(){},
    
    render: function(){
      var init_names = [];
      this.collection.each(function(group){
        var tmp_names = _.map(group.get("users"), function(user){
           if (_.isString(user)) {
             return user; // name
           } else {
             return user.uname
           }
        });
        init_names.push(tmp_names);
      });
      init_names = _.flatten(init_names);
      init_names = _.uniq(init_names);
      $(this.el).html(new_chat_group_temp({names: init_names}));
      return this;
    },
    
    createGroup: function(){
      var names = this.$(".chzn-select-group").val();
      if (!names) return;
      names = _.uniq(_.without(names, ""));
      this.collection.create({users: names}, {wait: true});
      this.$('.search-choice-close').trigger('click');
      this.$('.chzn-select-group').val([]);
      /*
        TODO
          show loading
          add or show exist
      */
    },
    
    chosenBtnInit: function(){
      this.$(".chzn-select-group").ajaxChosen({
        method: 'GET',
        url: IDSNS.web.Request.BASE+'/autocomplete_uname',
        dataType: 'json'
      }, function(data){
        if (data.code != 0) return;
        return data.data;
      });
    }
  });
  
  return NewChatGroupView;
})
    
