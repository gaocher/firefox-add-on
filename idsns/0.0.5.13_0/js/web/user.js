(function(){  
  /**
   * IDSNS Users
   * 
   * @param uid {String} user id
   * @param name {String} user name
   * @param slogan {Object} user slogan in and out
   * @param status {Array} user status 
   */
  IDSNS.User = function(uid, name, slogan){
    this.init();
    this._uid = uid;
    this.name = name;
    this.slogan = slogan;
  },
  IDSNS.User.prototype = {
    constructor: IDSNS.User,
    _uid: null,
    _name: null,
    _slogan: {},
    _status: {},
    
    init: function(){
      this.__defineGetter__("uid", this.getUid);
      this.__defineGetter__("name", this.getName);
      this.__defineSetter__("name", this.setName);
      this.__defineGetter__("slogan", this.getSlogan);
      this.__defineSetter__("slogan", this.setSlogan);
      this.__defineGetter__("status", this.getStatus);
      this.__defineSetter__("status", this.setStatus);
    },
    
    getUid: function(){
      return this._uid;
    },
    
    getName: function(){
      return this._name;
    },
    setName: function(name){
      this._name = name;
    },
    
    getSlogan: function(){
      return this._slogan;
    },
    /**
     * @param {Object} {in:"aa",out:"bb"}
     */
    setSlogan: function(slogan){
      this._slogan = slogan || {in:"", out:""};
    },
    
    getStatus: function(){
      return this._status;
    },
    setStatus: function(status){
      this._status = status || {};
    },
    
    /**
     * 添加新网址
     * @param status {Array} 新用户的网址
     * @return 是否添加成功
     */
    add: function(status){
      var ret = [], i;
      for(;status[i];i++){
        var stat = status[i]
        if (stat.pid != "" && !this._status[stat.pid]) {
          this._status[stat.pid] = stat.info;
          ret.push(stat);
        }
      }
      if (ret.length > 0) {
        ChromeApi.sendReq2CS({ 
          code: "new_status", 
          data: {uid: this._uid, status: ret} 
        });
        return true;
      }
      return false;
    },
    
    /**
     * 删除网址
     * @param pids {Array} 网址的id
     */
    remove: function(pids){
      var ret = [], i;
      for(;pids[i];i++){
        var pid = pids[i];
        if (this._status[pid]) {
          ret.push(pid);
        }
      }
      if (ret.length > 0) {
        ChromeApi.sendReq2CS({
          code: "delete_status",
          data: ret
        })
        return true;
      }
      return false;
    }
  }
})();
