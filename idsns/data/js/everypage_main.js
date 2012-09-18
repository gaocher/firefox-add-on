csDebug = false;
bgDebug = false;
debug = false;


define(['view/userlist', 'collection/tab_users'], 
  function(UserList, TabUsers){
    /*
      TODO sync current tab to others only if it's on content page
      get frameset title & url
      speed up!! try to load on document start
    */
    
    if (document.body) {
      if (document.body.tagName.toLowerCase() != 'frameset') {
        if (window.frameElement && 
          document.width * document.height <= (window.screen.width * window.screen.height) / 2) 
          return
        var tab_users = new TabUsers()
          , userlist = new UserList({collection: tab_users});
        $("body").append(userlist.render().el);
      }
    }
    
    
    /*
      TODO remove data prepare
    */
    // tab_users.create({
    //   uname: Date.now(),
    //   desc: {
    //     uin: "hi",
    //     uout: "bye"
    //   },
    //   pages: {
    //     "http://google.com": "google"
    //   }
    // }, {wait: true});
    
   // tab_users.fetch();
});