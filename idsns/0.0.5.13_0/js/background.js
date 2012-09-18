var bgDebug = false, debug = "<%= debug %>" == 'true' ? true : false;

/*
  TODO sync bandge stat
*/

define([
    'collection/tabs', 
    'collection/chat_groups'
  ], 
  function(Tabs, ChatGroups){
    
    var net = new IDSNS.Net();
    var tabs = new Tabs(null, {net: net});
    IDSNS.glb_groups = new ChatGroups(null, {net: net});
    IDSNS.glb_user = {};
    
    var request = new IDSNS.web.Request();
    // once extension is open
    request.checkAuthenticated(function(response){
      if (response && response.id) {
        _.extend(IDSNS.glb_user, response);
        net.onOnline();
      } else {
        net.onOffline();
      }
    });
    
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
      var request = arguments[0]
        , rest = Array.prototype.slice.call(arguments, 1);
      if (typeof request == 'object' && request != null) {
        switch(request.code){
          case IDSNS.Const.ONLINE:
            if (request.msg) {
              // globe store login user info
              _.extend(IDSNS.glb_user, request.msg);
            }
            net.onOnline();
            break;
          case IDSNS.Const.OFFLINE:
            net.onOffline(); break;
          case IDSNS.Const.HIDDEN2ALL:
            net.onHidden2All(); break;
          case IDSNS.Const.HIDDEN2FANS:
            net.onHidden2Fans(); break;
          case IDSNS.Const.GET_STATE:
            // var args = [request.msg].concat(rest);
            /*
              TODO why diff?
            */
            net.onGetState(null, null, sendResponse);
            // net.onGetState.apply(this, args);
            break;
          case IDSNS.Const.RINGING:
            $("#ringing")[0].play();
            break;
          default: break;
        }
      }
    });
  }
);