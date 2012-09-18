// 
//  chat_main.js
//  extension
//  
//  Created by liang mei on 2012-07-14.
//  Copyright 2012 __MyCompanyName__. All rights reserved.
// 

var IDSNS = IDSNS || {};
define(['view/chat_groups'], 
  function(ChatGroupsView){
    var bg = chrome.extension.getBackgroundPage();
    IDSNS.glb_user = bg.IDSNS.glb_user;
    
    var view = new ChatGroupsView({collection: bg.IDSNS.glb_groups});
    var glb_groups = bg.IDSNS.glb_groups;
    glb_groups.bind(IDSNS.Const.ONLINE, function(){
      $("#offShadow").hide();
    }).bind(IDSNS.Const.OFFLINE, function(){
      $("#offShadow").show();
    });
    
    chrome.windows.getCurrent(function(current){
      glb_groups.chatWindowId = current.id;
      glb_groups.onChatWindowFocus(current.id);
    });
    
    $('#chat_left').append(view.el);
    // active group
    if (glb_groups.initChat2User) {
      var findGroup = bg.IDSNS.glb_groups.find(function(model){
        var users = model.get('users');
        return (users.length == 1 && users[0].id == glb_groups.initChat2User.id) ? true : false;
      });
      if (findGroup) {
        view.activeGroup(findGroup.id);
      } else {
        /*
          TODO move to chat_groups
        */
        view.activeGroup();
        glb_groups.create({users: [glb_groups.initChat2User.uname]}, {wait: true});
      }
      bg.initChat2User = null;
    } else {
      view.activeGroup();
    }
  }
);