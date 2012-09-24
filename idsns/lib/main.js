var widgets = require("widget");
var data = require("self").data;
var Request = require("request").Request;
var panel = require("panel").Panel(
    {
        width:300,
        height:400,
        contentURL:data.url("popup.html"),
        contentScriptFile:data.url("js/listen.js")
    }
);
panel.port.on("request",function(data){
    console.log("panel request",data.data);
    var request =  Request({
        url:data.url,
        content:data.data,
        onComplete:function(response){
            console.log("panel complete");
            console.log(response.text);
            console.log(response.status+response.statusText);
            for (var headerName in response.headers) {
                console.log(headerName + " : " + response.headers[headerName]);
            }
            panel.port.emit('response',response.json);
        }
    });
    request.headers['X-Requested-With'] = 'XMLHttpRequest';
    if(data.type=="GET" || data.type=="get")request.get();
    else
        request.post();
});
var widget = widgets.Widget(
    {
        id:"idsns",
        label:"yunitongzai",
        contentURL:data.url("images/icon.png"),
        panel:panel
    }
)