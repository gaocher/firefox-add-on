define(function(){
  var Tab = Backbone.Model.extend({
    defaults: {
      url: "",
      title: "",
      domain: ""
    },
    /*
      TODO
        current tab load first
        listen tab switch event
    */
    /*
      TODO add tab count additional data
    */
    /*
      TODO current domain == url domain
    */
    initialize: function(){
      // server set
      // this.domain = this.url.match(/:\/\/(.[^/]+)/)[1];
      // this.domain = this.domain.replace(/([a-zA-Z0-9]+.)/,"");
    },
    
    
    sync: function(method, model, options){
      function respHandler(resp){
        var allUsers = model.collection.follows;
        if (resp) {
          var data = resp.domain ? {domain: resp.domain} : {};
          options.success(data);
        } else {
          options.error("record not found");
        }
        /*
          TODO users Object -> Array
        */
        if (resp && resp.users) {
          allUsers = _.union(allUsers, resp.users);
        }
        if (allUsers.length > 0) model.collection.sendUsers2Tab(model.get('id'), allUsers);
      };
      
      function getDomain(url){
        var domain = url.match(/:\/\/(.[^/]+)/)[1]
          , port = domain.split(":")[1]
          , host = domain.split(":")[0]
          , maybeIp = host.split(".");
        if (maybeIp.length == 4) {
          var isIp = _.reduce(maybeIp, function(memo, num){ if (isNaN(parseInt(num))) memo = false; return memo; }, true);
          if (isIp) return port ? maybeIp.join(".") + ":" + port : maybeIp.join(".");
        }
        domain = domain.replace(/([a-zA-Z0-9]+.)/, "");
        return domain;
      };
      
      var io = model.collection.net.io;
      if (!io) return;

      switch (method) {
        case "read":
          io.emit("read", model.toJSON(), respHandler);
          break;
        case "create":
          if (debug) {
            console.log('create new tab: ' + JSON.stringify(model.toJSON()));
          }
          io.emit("create", model.toJSON(), respHandler);
          break;
        case "update":
          if (debug) {
            console.log(
              'update tab, previous: ' + options.preUrl + 
              ' now: ' + 
              JSON.stringify(model.toJSON())
            );
          }
          io.emit("update", options.preUrl, model.toJSON(), respHandler);
          break;
        case "delete":
          io.emit("delete", model.get('url')); // TODO database id is better
          break;
        default: break;
      }
    }
  });
  return Tab;
});