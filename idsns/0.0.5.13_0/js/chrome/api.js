IDSNS.util.namespace("IDSNS.chrome")

IDSNS.chrome.api = {
  /**
   * get background instance
   */
  // getBackground: function() {
  //   if (!IDSNS._bgInstance) {
  //     var bg = chrome.extension.getBackgroundPage();
  //     if (window == bg) {
  //       IDSNS._bgInstance = new IDSNS.chrome.Background();
  //     } else {
  //       IDSNS._bgInstance = bg.IDSNS.chrome.api.getBackground();
  //     }
  //   }
  //   return IDSNS._bgInstance;
  // },
  
  updateBadge: function(code) {
    var color = {}, text ={};
    switch (code) {
      case IDSNS.Const.ONLINE:
        color.color = [ 255, 255, 0, 255 ];
        text.text = "on";
        break;
      case IDSNS.Const.HIDDEN2FANS:
      case IDSNS.Const.HIDDEN2ALL:
        color.color = [ 255, 100, 100, 255 ];
        text.text = "hide";
        break;
      case IDSNS.Const.OFFLINE:
        color.color = [ 255, 255, 255, 255 ];
        text.text = "off";
        break;
      default: break;
    }
    chrome.browserAction.setBadgeBackgroundColor(color);
    chrome.browserAction.setBadgeText(text);
  },
  
  /**
   * iterate all normal tabs
   * @param {Function} callback
   */
  tabIterator: function(callback, onlySelected)
  {
    chrome.windows.getAll(
      {populate : true},
      function(wins) {
        var w, t;
        for (w = 0; w < wins.length; w++) {
          if (wins[w].type === "normal") {
            for (t = 0; t < wins[w].tabs.length; t++) {
              if (!onlySelected || wins[w].tabs[t].selected) {
                callback(wins[w].tabs[t], wins[w]);
              }
            }
          }
        }
      }
    );
  },
  
  /**
   * send extension request
   */
  sendReq: function(code, msg, callback) {
    if (typeof callback == "function") {
      chrome.extension.sendMessage({code: code, msg: msg}, callback);
    } else {
      chrome.extension.sendMessage({code: code, msg: msg});
    }
  },
  
  /**
   * send tab request
   */
  sendTabReq: function(tabId, code, msg, callback) {
    if (typeof callback == "function") {
      chrome.tabs.sendMessage(tabId, {code:code, msg:msg}, callback);
    } else {
      chrome.tabs.sendMessage(tabId, {code:code, msg:msg});
    }
  } 
}