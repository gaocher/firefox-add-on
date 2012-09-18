// 
//  user.js
//  extension
//  
//  Created by liang mei on 2012-05-16.
//  Copyright 2012 juji.inc. All rights reserved.
// 

define(['./card'], function(CardView){
  var UserView = Backbone.View.extend({
    className: "idsns-msg",
    
    html: ''+
        '<div class="idsns-msg-who" uid="<%= id %>">'+
          '<span class="idsns-msg-user"><%= uname %></span>'+
          '<span class="idsns-msg-page">'+
            '<% if (!_.isEmpty(latestPage)) { %>'+
              '<a href="<%= latestPage.url%>" target="_blank"><%= latestPage.title%></a>'+
            '<% } %>'+
          '</span>'+
        '</div>'+
        '<div class="idsns-msg-uin">'+
          '<% if (avatar) { %>'+
            '<img src="<%= avatar %>" class="bar-avatar"></img>'+
          '<% } %>'+
          '<% if (desc.uin) { %>'+  
            '<%= desc.uin %>'+
          '<% } %>'+
        '</div>'+
        '<div class="idsns-msg-uout">'+
          '<% if (avatar) { %>'+
            '<img src="<%= avatar %>" class="bar-avatar"></img>'+
          '<% } %>'+
          '<% if (desc.uout) { %>'+
            '<%= desc.uout %>'+
          '<% } %>'+
        '</div>',
    
    template: null,
    
    events: {
      'hover .idsns-msg-user': 'toggle_card',
      'click .idsns-msg-user': 'onOpenChat',
    },
    
    initialize: function(){
      this.template = _.template(this.html);
      this.model.bind('change', this.render, this);
      this.model.bind('remove', this.onUserRemove, this); // trigger from collection
    },
    
    onUserRemove: function(){
      this.remove();
    },
    
    render: function(){
      var mdata = this.model.toJSON();
      mdata.avatar = this.model.getAvatar("min");
      $(this.el).html(this.template(mdata));
      return this;
    },
    
    /*
      TODO 
    */
    pageSwitchEffect: function(){
      
    },
    
    start_show: function(){
      if (this.$(".idsns-msg-uin")) {
        this.$(".idsns-msg-who").removeClass("bounceInRight").hide();
        this.$(".idsns-msg-uin").show().addClass("bounceInRight");
        setTimeout(function(){
          this.$(".idsns-msg-who").show().addClass("bounceInRight");
          this.$(".idsns-msg-uin").removeClass("bounceInRight").hide();
        }, 2000);
      }
    },
    
    start_leave: function(){
      if (this.$(".idsns-msg-uout")) {
        this.$(".idsns-msg-who").hide();
        this.$(".idsns-msg-uout").show();
        setTimeout(function(){
          this.remove();
        }, 2000);
      } 
    },
    
    toggle_card: function(e){      
      if(e.type == "mouseleave"){
        if (this.card) {
          this.card.startHideTimeout();
        }
      } else {
        if (!this.card || this.card.removed){
          $(".idsns-ui-card").remove();
          /*
            TODO collection view get idsns-msg-who from e.target 
            config uid as id
          */
          var userId = this.$(".idsns-msg-who").attr("uid");
          /*
            TODO error dealing
          */
          if (!userId) return;
          this.card = new CardView({id: userId, parentPos: this.position()});
          this.card.render();
        } else {
          this.card.stopHideTimeout();
        }
      }
    },

    position: function(){
      return _.extend({}, this.$el.offset(), {
        width: this.$el[0].offsetWidth,
        height: this.$el[0].offsetHeight
      });
    },
    
    onOpenChat: function(){
      var self = this;
      chrome.extension.sendMessage({
        code: IDSNS.Const.OPENCHAT2USER, 
        msg: {
          id: self.model.id, 
          uname: self.model.get('uname')
        }
      });
    }
    
  });
  
  return UserView;
})