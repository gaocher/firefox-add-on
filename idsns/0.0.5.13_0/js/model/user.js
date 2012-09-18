/*
  deps Const.js
*/
define(function(){
  var User = Backbone.Model.extend({
    defaults: {
      uname: "",
      avatar: "",
      desc: {
        uin: "",
        uout: ""
      },
      pages: {},
      latestPage: {}
    },
    
    initialize: function(){
      this.resetLatestPage({silent: true});
    },
    
    // delete page when leaving
    deletePage: function(url){
      var pages = this.get('pages');
      if (pages[url]) {
        // http://stackoverflow.com/questions/6351271/backbone-js-get-and-set-nested-object-attribute
        // nested attribute unset work around, not care for change or validation
        delete pages[url]
        // reset latest page
        if (this.get('latestPage').url == url) this.resetLatestPage();
      }
    },
    
    // update exist page
    updatePage: function(from, to){
      var pages = this.get('pages');
      if (pages[from]) {
        delete pages[from]
        pages[to.url] = to.title
        if (this.get('latestPage').url == from) this.set('latestPage', to);
      } else {
        this.createPage(to);
      }
    },
    
    // create new page
    createPage: function(to){
      this.get('pages')[to.url] = { title: to.title, domain: to.domain };
      this.set('latestPage', to);
    },
    
    // set lastest
    resetLatestPage: function(options){
      var pages = this.get('pages')
        , pages_count = Object.keys(pages).length
        , last_key = pages_count > 0 ? Object.keys(pages)[pages_count-1] : null;
      this.set('latestPage', last_key ? {url: last_key, title: pages[last_key].title} : {}, options);
    },
    
    getAvatar: function(size){
      var url = this.get("avatar");
      if (!url) return null;
      var prefix = size == "min" ? "thumb_min_" : (size == "small" ? "thumb_small_" : "thumb_large_");
      if (/192\.168\.1\./.test(IDSNS.Const.ImgBase)) { prefix = ''; }
      return IDSNS.Const.ImgBase + prefix + url;
    }
  });
  return User;
});