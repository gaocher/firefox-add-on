define(function(){
  var Store = function(name) {
    this.name = name;
    var store = localStorage.getItem(this.name);
    this.data = (store && JSON.parse(store)) || {};
  };

  _.extend(Store.prototype, {
    save: function() {
      localStorage.setItem(this.name, JSON.stringify(this.data));
    },

    create: function(model) {
      this.data[model.id] = model;
      this.save();
      return model;
    },

    update: function(model) {
      this.data[model.id] = model;
      this.save();
      return model;
    },

    find: function(model) {
      return this.data[model.id];
    },

    findAll: function() {
      return _.values(this.data);
    },
  
    findRange: function(offset, limit) {
      var range = _.range(offset*limit, (offset+1)*limit)
        , ret = []
        , dataArr = this.findAll();
      _.each(range, function(index){
        if (dataArr[index]){
          ret.push(dataArr[index]);
        }
      });
      return ret;
    },
  
    destroy: function(model) {
      delete this.data[model.id];
      this.save();
      return model;
    },
  
    destroyAll: function() {
      this.data = {};
      this.save();
    }
  });
  
  return Store;
});