(function(){
    console.log('xxx');
    function hackAjax(fn,data){
        console.log("hackAjax");
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent("request-message", true, true,data);
        document.documentElement.dispatchEvent(event);
        document.documentElement.addEventListener("response-message", function(event) {
            fn(event.detail);
        }, false);
    }
  IDSNS.util.namespace("IDSNS.web");
  IDSNS.web.Request = function(options){
    this.opts = {
      url: IDSNS.web.Request.BASE,
      async: true,
      cache: true,
      type: "GET"
      // data, dataType, beforeSend, error, dataFilter, success, complete
    }
    for (var i in options) {
      this.opts[i] = options[i];
    }
    /*
    this.opts.beforeSend = function(xhr){
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    }
    */
  }
  IDSNS.web.Request.BASE = 'http://yunitongzai.com',
  IDSNS.web.Request.prototype = {
    constructor: IDSNS.web.Request,
    opts: {},
    checkAuthenticated: function(fn) {

      this.opts.url += "/checkAuth";
      this.opts.dataType = "JSON";
/*
        console.log("hackAjax");
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent("request-message", true, true,data);
        document.documentElement.dispatchEvent(event);
        document.documentElement.addEventListener("response-message", function(event) {
            fn(event.detail);
        }, false);
        */
        //hackAjax(fn,this.opts);

      $.ajax(this.opts).always(function(data, textStatus, jqXHR){
        // TODO: ajax test
        fn(data);
      });

        /*
         var event = document.createEvent('CustomEvent');
         event.initCustomEvent("request-message", true, true,this.opts);
         document.documentElement.dispatchEvent(event);
         */
    },
    authenticate: function(fn) {
      this.opts.url += "/login";
      this.opts.dataType = "JSON";
      this.opts.type = "POST";
      hackAjax(fn,this.opts);


        /*
      $.ajax(this.opts).always(function(data, textStatus, jqXHR){
        fn(data);
      });
      */
    },
    logout: function(fn) {
      this.opts.url += "/logout";
      this.opts.dataType = "JSON";
        hackAjax(fn,this.opts);
        /*
      $.ajax(this.opts).always(function(data, textStatus, jqXHR){
        fn(data);
      });
      */
    },
    toggleBlacklist: function(host, block, fn) {
      if (_.isEmpty(host)) return;
      this.opts.url += '/blocked_site';
      this.opts.dataType = 'JSON';
      this.opts.type = 'POST';
      this.opts.data = {host: host, block: block};
        hackAjax(fn,this.opts);
        /*
      $.ajax(this.opts).always(function(data, textStatus, jqXHR){
        fn(data);
      });
      */
    },
    blockUser: function(userId, fn) { 
      if (_.isEmpty(userId)) return;
      this.opts.url += '/blocked_user';
      this.opts.dataType = 'JSON';
      this.opts.type = 'POST';
      this.opts.data = {id: userId};
        hackAjax(fn,this.opts);
        /*
      $.ajax(this.opts).always(function(data, textStatus, jqXHR){
        if (fn) fn(data);
      });
      */
    }
  }
})();
