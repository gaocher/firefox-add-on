// 
//  userlist.js
//  extension
//  
//  Created by liang mei on 2012-05-16.
//  Copyright 2012 __MyCompanyName__. All rights reserved.
// 

define(['./user'], function(UserView){
  var UserListView = Backbone.View.extend({
    id: "idsns-userlist-wrap",
    
    className: "none",
    
    html: ''+
      '<div id="idsns-minbar">'+
        '<span class="idsns-minbar-title">附近有<b class="idsns-minbar-num">0</b>人</span>'+
      '</div>'+
      '<div class="scrollable disabled">'+
        '<div class="tray">'+
          '<div class="knob">'+
            '<div class="knob-top"></div><div class="knob-middle"></div><div class="knob-bottom"></div>'+
          '</div>'+
        '</div>'+
        '<div id="idsns-userlist">'+
        '</div>'+
      '</div>',

    template: null,
    
    scroll: {
      visibleHeight: 0,
      totalHeight: 0,
      disabled: true,
      scrollAmount : 5,
      maxY: 0,
      minY: 0
    },
    
    drag: {
      onDrag: null,
      dragging: false,
      eleStart: 0,
      yStart: 0,
      dy: 0,
      y: 0
    },
    
    events: {
      'mousedown #idsns-minbar': 'onMouseDown',
      'mousewheel': 'onMouseWheel',
      'hover': 'toggleScroller'
      // 'hover .idsns-msg': 'toggle_card'
    },
    
    /*
      collection event:
        change model -> "change"
        add model -> "add"
        remove model -> "remove"
        sort model -> "reset"
        reset model -> "reset"
        create new model -> "add", "sync"
    */
    initialize: function(){
      var self = this;
      this.template = _.template(this.html);
      this.collection.bind('reset', this.renderList, this);
      this.collection.bind('add', this.renderUser, this);
      this.collection.bind('remove', this.onUserRemove, this);
      this.collection.bind('change', this.changeUser, this);
      this.collection.bind('offline', this._offline, this);
      this.collection.bind('online', this._online, this);
    },
    
    _offline: function(){
      /*
        TODO group delete for performance upgrade
      */
      this.$el.addClass('none');
    },
    
    _online: function(){
      this.$el.removeClass('none');
    },
    
    render: function(){
      $(this.el).html(this.template());
      return this;
    },

    renderList: function(){
      var self = this;
      this.$("#idsns-userlist").html("");
      this.collection.each(function(user){
        var userview = new UserView({model: user});
        this.$("#idsns-userlist").append(userview.render().el);
      });
      this.updateCount();
      // update scroller
      this.update();
    },
    
    renderUser: function(user){
      var userview  = new UserView({model: user});
      this.$("#idsns-userlist").append(userview.render().el);
      userview.start_show();
      this.updateCount();
      this.update();
    },
    
    onUserRemove: function(user){
      this.updateCount();
      this.update();
    },
    
    changeUser: function(user){
      this.update();
    },
    
    updateCount: function(){
      this.$(".idsns-minbar-num").html(this.collection.size());
    },
    
    toggleList: function(){
      this.$(".scrollable").toggleClass('none');
    },
    
    // ===============
    // = custom drag =
    // ===============
    onMouseDown: function(e){
      if (e.which === 3) return;
      this.drag.onDrag = this._handleDrag.bind(this);
      this._handleDrag(e);
      this._activate(true);
    },
    
    _activate: function(flag) {
      if (flag) {
        $('body').on('mousemove', this.drag.onDrag);
        $('body').on('mouseup', this.drag.onDrag); 
      } else {
        $('body').off('mousemove', this.drag.onDrag);
        $('body').off('mouseup', this.drag.onDrag);
      }
    },
    
    _handleDrag: function(e){
      e.stopPropagation();
      e.preventDefault();
      this.drag.y = e.pageY;
      
      if (e.type === 'mousedown') {
        this.drag.yStart = this.drag.y;
        this.drag.eleStart = parseInt(this.$el.css('top'));
      }

      this.drag.dy = this.drag.y - this.drag.yStart;
      
      switch (e.type) {
        case 'mousemove':
          if (!this.drag.dragging) {
            // start
            if(this.drag.dy * this.drag.dy >= 4) {
              this.drag.dragging = true;
            }
          } else {
            // move
            if (this.drag.eleStart + this.drag.dy > 0) {
              this.$el.css('top', this.drag.eleStart + this.drag.dy + 'px');
            } else {
              this.$el.css('top', '0px');
            }
          }
          break;
        case 'mouseup':
          if (!this.drag.dragging) {
            // click
            this.toggleList();
          }
          this._activate(false);
          this.drag.dragging = false;
          break;
        default: break;
      }
    },
    
    
    // =================
    // = custom scroll =
    // =================
    toggleScroller: function(e){
      if (this.$('.scrollable').hasClass('disabled')) return;
      if (e.type == "mouseleave") {
        this.$('.tray').fadeOut();
      } else {
        this.$('.tray').fadeIn();
      }
    },
    
    onMouseWheel: function(e, delta, deltaX, deltaY){
      if (!this.scroll.disabled) {
        var step = this.scroll.scrollAmount;
        this.scrollContent(this.contentScrollTop() - delta * step);
        e.preventDefault();
        return false;
      }
    },
    
    contentScrollTop: function(){
      return this.$("#idsns-userlist").scrollTop();
    },
    
    scrollContent: function(top){
      // update if content or container changed
      this.update();
      var h = this.scroll.totalHeight - this.scroll.visibleHeight
       , ratio = h > 0 ? top/h : 0;
      ratio = Math.max(0, Math.min(h > 0 ? 1 : 0, ratio));
      this.$("#idsns-userlist").scrollTop(Math.round(ratio * h));
      this.updateKnobTop();
    },
    
    /*
      update scroller
      update if content or container changed
        switch knob show
        refresh container size
    */
    update: function(){
      var scrollable = this.$("#idsns-userlist");
      var visibleHeight = scrollable[0].offsetHeight
        , totalHeight = scrollable[0].scrollHeight;
      // check if content or container has changed;
      if(this.scroll.visibleHeight !== visibleHeight || this.scroll.totalHeight !== totalHeight) {
        // disable scroll
        this.scroll.disabled = totalHeight <= visibleHeight + 2;
        this.$('.scrollable').toggleClass('disabled', this.scroll.disabled);
        
        // update content height or container height
        this.scroll.visibleHeight = visibleHeight;
        this.scroll.totalHeight = totalHeight;

        // if there's nothing to scroll, we disable the scroll bar
        if(this.scroll.totalHeight >= this.scroll.visibleHeight) {
          // update knob size if content or container has changed and knob exist
          this.updateKnobSize();
          // knob max scroll height
          this.scroll.maxY = this.$(".tray").height() - this.$(".knob").height();
          // knob min scroll height
          this.scroll.minY = 0;
          // update knob top for knob resize
          this.updateKnobTop();
        }
      }

      /*
        TODO if content or container size not changed, no need to update knobtop or knobsize
        init scroll visibleHeight, totalHeight
      */
      // this.updateKnobTop();
      // this.updateKnobSize();
    },
    
    // update knob top
    updateKnobTop: function() {
      var r = this.scrollRatio();
      var y = this.scroll.minY + (this.scroll.maxY-this.scroll.minY) * r;
      if (!isNaN(y)) this.$(".knob").css("top", y + 'px');
    },
    
    // update knob size
    updateKnobSize: function(){
      var knobSize = this.$(".tray").height() * (this.scroll.visibleHeight / this.scroll.totalHeight);
      knobSize = knobSize > 20 ? knobSize : 20;
      this.$(".knob").css({height : knobSize + 'px'});
    },
    
    // current scroll ratio
    scrollRatio: function(){
      return this.contentScrollTop() / (this.scroll.totalHeight - this.scroll.visibleHeight);
    }
  });
  
  return UserListView;
})