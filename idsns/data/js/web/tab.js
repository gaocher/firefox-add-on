(function(){  
  /**
   * IDSNS Tabs
   * 
   * @param tabId {Number} current tab id
   * @param url {String} current tab url
   * @param tlt {String} current tab title 
   */
  IDSNS.Tab = function(tabId, url, title){
    this.init();
    this._tabId = tabId;
    this.url = url;
    this.tlt = title;
  },
  IDSNS.Tab.prototype = {
    constructor: IDSNS.Tab,
    _tabId: null,
    _url: null,
    _title: null,
    _uids: [],
    _user_count: 0,
    
    init: function(){
      this.__defineGetter__("tabId", this.getTabId);
      this.__defineGetter__("url", this.getUrl);
      this.__defineSetter__("url", this.setUrl);
      this.__defineGetter__("title", this.getTitle);
      this.__defineSetter__("title", this.setTitle);
      this.__defineGetter__("uids", this.getUids);
      this.__defineGetter__("user_count", this.getUserCount);
      this.__defineSetter__("user_count", this.setUserCount);
    },
    
    getTab: function(){
      return this._tabId;
    },
    
    getUrl: function(){
      return this._url;
    },
    setUrl: function(url){
      this._url = url || "";
    },
    
    getTitle: function(){
      return this._title;
    },
    setTitle: function(title){
      this._title = title || "";
    },
    
    getUids: function(){
      return this._uids;
    },
    
    getUserCount: function(){
      return this._user_count;
    },
    setUserCount: function(user_count){
      this._user_count = parseInt(user_count);
      if (isNan(this._user_count)) {
        this._user_count = 0; 
      }
    },
    
    /**
     * 添加新用户
     * @param {Otring} 新用户
     * @return 是否添加成功
     */
    add: function(users){
      if (this._uids.indexOf(user.id) == -1) {
        this._uids.push(user.id);
        IDSNS.chrome.api.sendReq(IDSNS.Const.CREATE_USER, users)
        ChromeApi.sendReq2CS({ code: "new_user", data: user });
        return true;
      } else {
        ChromeApi.sendReq2CS({ code: "update_user", data: user });
        return false;
      }
    },
    
    /**
     * 删除用户
     * @param uid {String} 用户的id
     */
    remove: function(){
      var index = this._uids.indexOf(uid)
      if (index != -1) {
        this._uids.splice(index, 0);
        ChromeApi.sendReq2CS({ code: "delete_user", data: uid });
        return true;
      } else {
        return false;
      }
    }
  }
})();
