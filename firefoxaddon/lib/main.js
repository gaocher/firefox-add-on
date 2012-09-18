var widgets = require("widget");
var self = require("self");
var data = self.data;


var pageMod = require("page-mod");
pageMod.PageMod({
    include: "*",
    contentScriptFile: data.url("popup.js")
});

var popup = require("panel").Panel(
    {
        //width:200,
        //height:300,
        contentURL:data.url("popup.html"),
        contentScriptFile:[data.url("jquery.js"),data.url("content.js")]
    }
);
var widget = widgets.Widget(
    {
        id:"colorpage",
        label:"switchColor",
       contentURL:data.url("icon.png"),
        panel:popup
    }
);
var tabs = require("tabs");

tabs.on('activate', function(tab) {
    console.log(tab.title);
});
popup.port.on('click',function(data){
   console.log(data);
    tabs.activeTab.attach({
        contentScript:
            'document.body.style.backgroundColor = "'+data+'";'
    });

});
/*
var Request = require("request").Request;
var quijote = Request({
  url: "http://www.baidu.com/",
  onComplete: function (response) {
    console.log(response.text);
  }
});
 
quijote.get();
*/