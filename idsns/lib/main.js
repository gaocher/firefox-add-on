var widgets = require("widget");
var data = require("self").data;
var panel = require("panel").Panel(
    {
        width:300,
        height:400,
        contentURL:data.url("popup.html")
    }
)

var widget = widgets.Widget(
    {
        id:"idsns",
        label:"yunitongzai",
        contentURL:data.url("images/icon.png"),
        panel:panel
    }
)