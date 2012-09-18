/**
 * popup
 */
(function(){
  IDSNS.chrome.Popup = function(){
    /*
      this.bg = chrome.extension.getBackgroundPage()
    var groups = this.bg.IDSNS.glb_groups;
    if (groups.noticeTimer) {
      $("#openChat").html("你有新消息");
      $("#openChat").css({color:"red"});
    }
    */
  },
  
  IDSNS.chrome.Popup.prototype = {
    constructor: IDSNS.chrome.Popup,
    
    // view
    switchView: function(name) {
      var self = this;
      $("#auth-checking").hide();
      $(".auth").hide();
      $(".pop").hide();
      switch (name) {
        case "auth-checking": $("#auth-checking").show(); break;
        case "auth": $(".auth").show(); break;
        case "pop": $(".pop").show(); break;
        default: break;
      }
      $("html").height($(".wrapper").outerHeight()+"px");
    },
    
    handleAuthCheck: function(resp){
      var fn = IDSNS.chrome.Popup.prototype;
      var self = this;
      if (resp && resp.id) {
        fn.switchView.apply(this, ["pop"]);
        var prefix = 'thumb_small_';
        var avatar = _.isEmpty(resp.avatar) ? '/images/'+prefix+'default.png' : IDSNS.Const.ImgBase + prefix + resp.avatar;
        $(".user .avatar img").attr("src", avatar);
        $(".user .uname").html(resp.uname);
        $(".user .fans").html(resp.fans+" 粉丝");
      } else { // not authenticated
        if (resp && resp.errors) {
          $('.errors span').html(resp.errors).parent().show();
        }
        fn.switchView.apply(this, ["auth"]);
        //chrome.extension.sendMessage({code: IDSNS.Const.OFFLINE});
      }
    },
    
    handleLoginSubmit: function(response){
      this.handleAuthCheck(response);
      if (response.id) {
        //chrome.extension.sendMessage({code: IDSNS.Const.ONLINE, msg: response});
        $("#online").attr('checked', true);
      }
    },
    
    handleLogout: function(){
      var fn = IDSNS.chrome.Popup.prototype;
      var self = this;
      fn.switchView.apply(this, ["auth"]);
      //chrome.extension.sendMessage({code: IDSNS.Const.OFFLINE});
      // bgInstance.logoutSuccess();
    },
    
    handleSwitch: function(code){
      //chrome.extension.sendMessage({code: code});
    },
    
    start: function() {
      // TODO: test mock
      var self = this;
      self.initBind();
      // 
      // TODO: test spy
      // TODO: test should be called with
      self.switchView("auth-checking");
      /*
        TODO set authing Timeout 
      */
      // TODO: test 
      var request = new IDSNS.web.Request();
      request.checkAuthenticated(this.handleAuthCheck);
    },
    
    initBind: function() {
      var self = this;
      $("#authForm").submit(function(){
        var data = {}, names = ["email", "password", "remember"];
        $(this).find("input").each(function(){
          var name = $(this).attr("name");
          if (names.indexOf(name) > -1) data[name] = $(this).val();
        });
        var request = new IDSNS.web.Request({data:data});
        request.authenticate(self.handleLoginSubmit.bind(self));
        return false;
      });
      
      $("#openSetting").click(function(){
        window.open(IDSNS.web.Request.BASE + "/setting");
      });
      
      $("#openChat").click(function(){
        var groups = self.bg.IDSNS.glb_groups;
        groups.openChatWindow();
      });
      
      // logout
      $("#logout").click(function(){
        var request = new IDSNS.web.Request();
        request.logout(self.handleLogout);
      });
      
      $("#signup").click(function(){
        chrome.tabs.create({url: IDSNS.web.Request.BASE+"/signup", active: true});
      });
      
      $("#online").click(function(){
        self.handleSwitch(IDSNS.Const.ONLINE);
        $(this).attr('checked', true);
      });
      
      $("#offline").click(function(){
        self.handleSwitch(IDSNS.Const.OFFLINE);
        $(this).attr('checked', true);
      });
      
      $("#hidden2All").click(function(){
        self.handleSwitch(IDSNS.Const.HIDDEN2ALL);
        $(this).attr('checked', true);
      });
      
      $("#hidden2Fans").click(function(){
        self.handleSwitch(IDSNS.Const.HIDDEN2FANS);
        $(this).attr('checked', true);
      });
      
      $(".close").click(function(){
        $(this).parent().hide();
      });
      
      var curHost = '';
      if (IDSNS.glb_user) {
        chrome.tabs.getSelected(null, function(tab){
          if (/^http(s)?:\/\//.test(tab.url) == false) {
            $("#add2Blacklist").hide();
            return;
          } else {
            $("#add2Blacklist").show();
            curHost = $.url(tab.url).attr('host');
            var blockedSites = IDSNS.glb_user.blockedSite;
            if (_.include(blockedSites, curHost)) {
              $("#add2Blacklist a").html('取消拉黑该网站');
            }
          }
        });
      }
      
      $("#add2Blacklist").click(function(){
        var self = this;
        var request = new IDSNS.web.Request();
        // blocked: boolean, domain: string
        /*
          TODO localStorage support
        */
        var blockedSites = IDSNS.glb_user.blockedSite;
        var block = _.include(blockedSites, curHost) ? false : true;
        request.toggleBlacklist(curHost, block, function(data){
          if (data && JSON.parse(data.blocked)) {
            if(!_.include(blockedSites, curHost))
              IDSNS.glb_user.blockedSite.push(curHost);
            $("#add2Blacklist a").html('取消拉黑该网站');
          } else if (data && !JSON.parse(data.blocked)) {
            if (_.include(blockedSites, curHost))
              IDSNS.glb_user.blockedSite = _.without(blockedSites, curHost);
            $("#add2Blacklist a").html('将当前网站拉黑');
          }
        });
      });
/*
      chrome.extension.sendMessage({code: IDSNS.Const.GET_STATE}, function(state){
        switch (state){
          case IDSNS.Const.ONLINE:
            $("#online").attr('checked', true);
            break;
          case IDSNS.Const.OFFLINE:
            $("#offline").attr('checked', true);
            break;
          case IDSNS.Const.HIDDEN2ALL:
            $("#hidden2All").attr('checked', true);
            break;
          case IDSNS.Const.HIDDEN2FANS:
            $("#hidden2Fans").attr('checked', true);
            break;
          default: break;
        }
      });
      */
    }
  }
})();

$(document).ready(function(){
  //var bg = chrome.extension.getBackgroundPage();
  //IDSNS.glb_user = bg.IDSNS.glb_user;
  var popup = new IDSNS.chrome.Popup();
  popup.start();
})