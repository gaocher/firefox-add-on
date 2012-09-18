      
      
      /*用例*/
      /* *
       * A用户的所有粉丝
       * Aa用户的同网站粉丝
       * B用户附近的非粉丝
       * C用户关注的所有人
       * Ca用户关注的人并在同网站
       * Cb用户关注的人，不在同网站，但未设置同网站可见
       * ！！当前网址为多个不同网址的tab的网址
       * */
      /*用户点击插件按钮*/
        //如已经登录，出弹出菜单
        //如未登录，跳转登录页面
          //登录成功，加载mini状态条，建立长连接
            //如首次登录，提示使用方法
            //通知A(百万级)、B(上限？多tab单列表？同服务器内？)，用户上线
              //向用户、A、B发布当前总人数
              //向打开用户列表的B发布当前网址
              //如设置了同网站可见，向Aa发布当前网址
              //如未设置同网站可见，向A发布当前网址
      /*用户点击tabA mini状态条*/
        //如用户列表未显示，在tabA中显示用户列表
          //显示Ca、Cb、显示Aa数、B
        //如用户列表已显示，隐藏所有Tab用户列表，只订阅当前Tab网站下的用户数
      /*用户展开当前粉丝*/
        //显示Aa
      /*用户关注某人*/
        //关注成功
          //获取用户状态，更新当前列表用户数
      /*用户邀请粉丝过来看它*/
        //站外粉丝，调用站外api
        //站内粉丝，发(在线通知/离线私信)。
      /*用户直接关闭浏览器*/
        //向A、B发布下线消息，更新A，B列表总人数
      /*用户打开浏览器*/
        //如果插件已打开，检查用户是否已登录
          //已登录，显示mini状态条
          //未登录，自动关闭插件
      /*??用户跟踪某人??*/
      /*用户滚动列表，加载*/
        //不在线用户页面访问量排名显示
        
describe("Common", function(){
  it("过滤不合适的网址", function(){
    expect(IDSNS.Utils.isUrlSupported("chrome://about")).toBeFalsy();
    expect(IDSNS.Utils.isUrlSupported("http://www.baidu.com")).toBeTruthy();
  });
});

describe("def.js测试类继承", function(){
  beforeEach(function(){
    def ("ClassA") ({
      init: function(name) {
        this.name = name;
      },
      speak: function(text) {
        return  text || this.name;
      }
    })
      
    def ("ClassB") < ClassA ({
      init: function(name) {
        this._super();
      },
      say: function() {
        return this.speak("aaa");
      }
    })
  })
    
  it("子对象能调用父类的方法", function(){
    var bbb = new ClassB("bbb");
    expect(bbb.say()).toEqual("aaa");
  })
    
  it("子类init同时父类init", function(){
    var bbb = new ClassB("bbb");
    expect(bbb.name).toEqual("bbb");
  })
    
  it("子类不能继承父类静态成员", function(){
    ClassA.slient = function() {
      return "static"
    }
    expect(ClassB.slient).toBeUndefined();
    var bbb = new ClassB("bbb");
    expect(bbb.constructor._super).toBe(ClassA);
  })
});
  
describe("测试inherit2类继承", function(){
  beforeEach(function(){
    // 全局
    ClassA2 = function(name) {
      this.name = name;
    }
    ClassA2.prototype.speak = function(text) {
      return text || this.name;
    }
    
    ClassB2 = function(name) {}
    inherit2(ClassB2, ClassA2);
    ClassB2.prototype.say = function() {
      return this.speak("aaa");
    }
  });
  
  it("子对象能调用父类的方法", function(){
    var bbb = new ClassB2("bbb");
    expect(bbb.say()).toEqual("aaa");
  });
  
  it("不能对父类初始化", function(){
    var bbb = new ClassB2("bbb");
    expect(bbb.speak()).toBeUndefined();
  });
});

describe("测试owner", function(){
  // owner
    // user_list
    // name: "liangmei"
    // uid: "123456"
    // status: 
      // pid: 
      // url: 
      // tlt: 
  var owner;
  
  it("单例创建owner对象", function(){
    var owner_id = "123456";
    var owner_name  = "abc";
    spyOn(ChromeApi.localStorage, get).andReturn({uid: owner_id, name: owner_name});
    owner = Owner.getInstance();
    expect(ChromeApi.localStorage.get).toHaveBeenCalledWith("ownerInfo");
    expect(owner.uid).toEqual(owner_id);
  })
  
  it("添加新网址", function(){
    var new_status = [
      {"pid": "234567", "url":"http://bing.com/", "tlt":"bing"}
    ]
    owner.add(new_status);
    // spyOn websocket
    expect(owner.status.length).toEqual(1);
  });
  
  it("删除网址", function(){
    owner.remove("234567");
    expect(owner.status.length).toBeUndefined();
    // spyOn close socket
  });
  
  it("初始化socket", function(){
    
  });
  
  describe("WebSocket", function(){
    it("connect", function(){
      owner.connect();
      expect(owner._ws instanceof WebSocket).toBeTrusy();
    });
    
    it("onOpen", function(){
       
    });
  });
  
  
  describe("Tab", function(){
    beforeEach(function(){
      var tabId =1, url = "http://google.com", title = "google";
      owner.findOrCreate(tabId, url, title);
    });
    
    it("create new", function(){
      expect(owner._tabs[tabId] instanceof Tab).toBeTrusy;
    });
    
    it("update exist", function(){
      var url = "http://yahoo.com", title = "yahoo";
      owner.findOrCreate(tabId, url, title);
      expect(owner._tabs[tabId].url).toEqual(url);
    });
     
    it("delete tab", function(){
      var tabId  = 1;
      owner.deleteTab(tabId);
      expect(owner._tabs[tabId]).toBeUndefined();
    });
  })


});

describe("测试user", function(){
  // user
    // name
    // status
      // pid : "123456"
      // url : "http://google.com"
      // tit : "google"
    // tab_ids: ["1", "2", "3"]
  var owner, user, status=[
    {"pid":"123456", "url":"http://google.com/", "tlt":"google"}
  ];
  beforeEach(function(){
    var name = "liangmei", uid = "123456", status = [];
    owner = Owner.getInstance(uid, name);
    user = owner.findOrCreate(uid, "aa");
    user.add(status);
  });
  
  it("空id", function(){
    var valid_uid = "123456";
    user = owner.findOrCreate("", "aa");
    expect(user).toBeFalsy();
    user = owner.findOrCreate(valid_uid, "aa");
    user.add([{"pid": "123456", "url":"", "tlt":"google"}]);
    expect(user.status.length).toEqual(1);
  });
  
  it("添加新网址", function(){
    var new_status = [
      {"pid": "234567", "url":"http://bing.com/", "tlt":"bing"}
    ]
    spyOn(ChromeApi, sendReq);
    user.add(new_status)
    expect(user.status.length).toEqual(2);
    // 发送更新用户状态消息
    expect(ChromApi.sendReq).toHaveBeenCalled();
  });
  
  it("删除网址", function(){
    spyOn(ChromeApi, sendReq);
    user.remove("123456");
    // 在线状态数0，自动删除
    expect(owner.user_list["123456"]).toBeUndefined();
    // 发送更新用户状态消息
    expect(ChromeApi.sendReq).toHaveBeenCalled();
  });
  
  it("删除用户", function(){
    
  });
});

describe("测试tab", function(){
  // tab
    // pid
    // url
    // tlt
    // uids: []
  
  var tab, owner, user, status = [
    {"pid": "123456", "url": "http://google.com/", "tlt": "google"} 
  ];
  beforeEach(function(){
    var tabId = 1, uid = "0000001", name = "liangmei", uid = "123456";
    tab = new Tab(tabId);
    owner = Owner.getInstance(uid, name);

    var uid2 = "1234567";
    user = owner.findOrCreate(uid2, "aa");
    user.add(status);
  });
  
  describe("添加用户", function(){
    it("状态条更新用户数", function(){      
      // owner -> tabs
      
      // toHaveBeenCalled, toHaveBeenCalledWith, not.toHaveBeenCalled, not.toHaveBeenCalledWith
      // spyOn(x, "method").andCallThrought()
      // spyOn(x, "method").andReturn(arguments)
      // spyOn(x, "method").andThrow(exception)
      // spyOn(x, "method").andClassFake(function)
      // callCount
      // mostRecentCall.args
      // argsForCall[i]
      
    });
    
    it("若该用户不存在，添加用户", function(){
      tab.add(user.uid);
      spyOn(ChromeApi, sendReq);
      expect(ChromApi.sendReq).toHaveBeenCalled();
      expect(tab.uids.indexOf(user.uid)).toNotEqual(-1);
    });
  });
  
  describe("删除用户", function(){
    it("状态条更新", function(){
      
    });
    
    it("若用户存在，删除该用户", function(){
      tab.add(user.uid);
      tab.remove(user.uid);
      expect(tab.uids.indexOf(user.uid)).toEqual(-1);
    });
  })
});

/* describe("Common", function() {
  // demonstrates use of spies to intercept and test method calls
  it("tells the current song if the user has made it a favorite", function() {
    spyOn(song, 'persistFavoriteStatus');

    player.play(song);
    player.makeFavorite();

    expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  });

  //demonstrates use of expected exceptions
  describe("#resume", function() {
    it("should throw an exception if song is already playing", function() {
      player.play(song);

      expect(function() {
        player.resume();
      }).toThrow("song is already playing");
    });
  });
});*/
