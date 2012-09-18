define(function(Store){
  var CardModel = Backbone.Model.extend({
    defaults: {
      uname: "",
      avatar: "",
      fans: 0,
      follow: 0,
      school: "",
      job: "",
      slogan: "",
      gender: "",
      year: 0,
      month: 0,
      day: 0,
      constellation: "",
      like: [],
      company: "",
      want2meet: [],
      want2have: [],
      following: false,
      pages: {}
    },
    
    /*
      TODO configurable
    */
    urlRoot: '<%= root_url %>/card',
    
    initialize: function() {},
    
    openChat2User: function(){
      var self = this;
      chrome.extension.sendMessage({code: IDSNS.Const.OPENCHAT2USER, msg: {id: self.id, uname: self.get('uname')}});
    },
    
    sendReq: function(code, msg, callback){
      self.sendReq(IDSNS.Const.GET_STATE, {}, function(state){
        state == IDSNS.Const.OFFLINE ? self.trigger('offline') : self.trigger('online');
      });
      
      if (typeof msg == 'function') {
        callback = msg;
        msg = '';
      }
      /*
        TODO just send code 
      */
      if (typeof callback == "function") {
        chrome.extension.sendMessage({code: code, msg: msg}, callback);
      } else {
        chrome.extension.sendMessage({code: code, msg: msg});
      }
    },
    
    getAvatar: function(size){
      var url = this.get("avatar");
      if (!url) return null;
      var prefix = size == "min" ? "thumb_min_" : (size == "small" ? "thumb_small_" : "thumb_large_");
      if (/192\.168\.1\./.test(IDSNS.Const.ImgBase)) { prefix = ''; }
      return IDSNS.Const.ImgBase + prefix + url;
    }
  });

  return CardModel;

})
