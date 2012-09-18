// 
//  card.js
//  extension
//  
//  Created by liang mei on 2012-05-17.
//  Copyright 2012 __MyCompanyName__. All rights reserved.
// 

define(['../model/card'], function(CardModel){
  var CardView = Backbone.View.extend({
    className: "idsns-ui-card",
    
    html: ''+
      '<div class="arrow"></div>'+
      '<div class="card-content" style="background:url('+IDSNS.Const.HostBase+'/images/bg_wood.png'+')">'+
        '<% if (!_.isEmpty(uname)) { %>'+
          '<% if (avatar) { %>'+
            '<img src="<%= avatar %>" class="card-avatar" onerror="this.style.width = \'20px\'"></img>'+
          '<% } %>'+
          '<p class="card-username clearfix">'+
            '<%= uname %>'+
            '<% if (!_.isEmpty(job)) { %>'+
              '<i class="job-icon"><%= job%></i>'+
            '<% } %>'+
            '<% if (age) { %>'+
              '<i class="age-icon"><%= age %></i>'+
            '<% } %>'+
            '<a class="card-btn card-btn-12 card-btn-white switch-page">'+
              '<strong class="return-tag">返回</strong>'+
              '<strong class="goto-tag">正在读</strong>'+
              '<span></span>'+
            '</a>'+
          '</p>'+
          '<% if (!_.isEmpty(slogan)) { %>'+
            '<p class="card-slogan"><%= slogan %></p>'+
          '<% } %>'+
          '<div class="card-page1">'+
            '<h4>关于我</h4>'+
            '<div class="card-tag-about">'+
              '<span>粉丝数<%= fans %></span>'+
              '<span>关注数<%= follow %></span>'+
              '<% if (school) { %>'+
                '<span><%= school %></span>'+
              '<% } %>'+
              '<% if (company) { %>'+
                '<span><%= company %></span>'+
              '<% } %>'+
              '<% if (constellation) { %>'+
                '<span><%= constellation %></span>'+
              '<% } %>'+
              '<% if (_.isEmpty(like)) { %>'+
                '<% _.each(like, function(item){ %>'+
                  '<span>喜欢<%= item %></span>'+
                '<% }) %>'+
              '<% } %>'+
            '</div>'+
            
            '<% if (!_.isEmpty(want2meet)) { %>'+
              '<h4>想认识</h4>'+
              '<div class="card-tag-want2meet">'+
                '<% _.each(want2meet, function(want){ %>'+
                  '<span><%= want %></span>'+
                '<% }) %>'+
              '</div>'+
            '<% } %>'+
            
            '<% if (!_.isEmpty(want2have)) { %>'+
              '<h4>想要</h4>'+
              '<div class="card-tag-want2have">'+
                '<% _.each(want2have, function(want){ %>'+
                  '<span><%= want %></span>'+
                '<% }) %>'+
              '</div>'+
            '<% } %>'+
            
          '</div>'+
          '<div class="card-page2">'+
            '<h4>正在读</h4>'+
            '<div class="card-current-browser">'+
              '<% _.each(pages, function(obj, url){ %>'+
                '<a href="<%= url%>"><%= obj.title%></a>'+
              '<% }); %>'+
            '</div>'+
          '</div>'+
          
          '<div class="btn-wrapper">'+
            '<a class="card-btn card-btn-12 card-btn-white openChat">'+
              '<strong>聊天</strong>'+
              '<span></span>'+
            '</a>'+
            '<% if (following) { %>'+
              '<a class="card-btn card-btn-12 card-btn-white toggleFollow">'+
                '<strong>取消关注</strong>'+
                '<span></span>'+
              '</a>'+
            '<% } else {%>'+
              '<a class="card-btn card-btn-12 card-btn-white toggleFollow">'+
                '<strong>关注</strong>'+
                '<span></span>'+
              '</a>'+
            '<% } %>'+
          '</div>'+
        '<% } else { %>'+
          // '<img class="loading" src="../../images/loader.gif"></img>'+
          '<span class="loading">加载中...</span>'+
        '<% } %>'+
      '</div>',
    
    template: null,
    
    events: {
      'hover': 'toggleCard',
      'click .toggleFollow': 'toggleFollow',
      'click .openChat': 'onOpenChat',
      'click .switch-page': 'switchPage'
    },
    
    /*
      params:
        userview
    */
    initialize: function(){
      this.template = _.template(this.html);
      this.model = new CardModel(this.options);
      this.model.bind('change', this.render, this);
      this.model.fetch();
      this.render();
    },
    
    render: function(){
      var mdata = this.model.toJSON();
      mdata.avatar = this.model.getAvatar("large");
      mdata.age = 0;
      if (this.model.get('year') != 0) {
        var year = new Date().getFullYear();
        mdata.age = year - this.model.get('year');
      }
      $(this.el).html(this.template(mdata));
      if (this.$el.parent().length == 0) {
        this.$el.appendTo("body");
      }
      this.updatePos();
      return this;
    },
    
    // call after append to dom
    updatePos: function(){
      var target_pos =  this.model.get('parentPos')
        , actualWidth = this.$el.outerWidth()
        , actualHeight = this.$el.outerHeight()
        , card_pos;
      card_pos = { top: target_pos.top - 5 /*+ target_pos.height / 2 - actualHeight / 2*/, left: target_pos.left - actualWidth };
      this.$el.css(card_pos).show();
    },
    
    startHideTimeout: function(){
      var self = this;
      this.hideTimeout = setTimeout(function(){
        self.removed = true;
        self.remove();
      }, 500)
    },
    
    stopHideTimeout: function(){
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    },
    
    toggleCard: function(e){
      if(e.type == "mouseleave"){
        this.startHideTimeout();
      } else {
        this.stopHideTimeout();
      }
    },
    
    toggleFollow: function(){
      this.model.save({following: !this.model.get('following')});
    },
    
    onOpenChat: function(){
      this.model.openChat2User();
    },
    
    switchPage: function(){
      var self = this;
      if (self.$('.switch-page').hasClass('return-btn')) {
        self.$('.card-page2').hide(function(){
          self.$('.card-page1').show();
          self.$('.switch-page').removeClass('return-btn')
        });
      } else {
        self.$('.card-page1').hide(function(){
          self.$('.card-page2').show();
          self.$('.switch-page').addClass('return-btn')    
        });
      }
    }
  });
  
  return CardView;
});