/*
  TODO 
    model with/without id?
    sync
*/
define(function(){
  var ChatMsg = Backbone.Model.extend({
    defaults: {
      gId: '', // group id
      fId: '', // from user id
      msg: '', // msg
      t: '' // time
    },
    
    idAttribute: '_id',
    
    initialize: function(){}
  });
  
  return ChatMsg;
});