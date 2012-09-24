document.documentElement.addEventListener("request-message", function(event) {
    console.log('request-message');
    data = event.detail;
    console.log('##'+JSON.stringify(data));
    self.port.emit('request',data);
    self.port.on('response',function(data){
        console.log(JSON.stringify(data))
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent("response-message", true, true, data);
        document.documentElement.dispatchEvent(event);
    });
    console.log("##over");
}, false);