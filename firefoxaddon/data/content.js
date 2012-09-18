//window.addEventListener("message",function(event){window.alert(event.data);document.write('xxx'+event.data);},false);


$('div').click(function(){
   //console.log($(this).html());
    //document.defaultView.postMessage('myclickxxx','*');

});
document.defaultView.addEventListener('message',function(event){self.port.emit('click',event.data);console.log(event.data)});
	$.ajax({
		url:'http://www.yunitongzai.com',
		success:function(data, textStatus, jqXHR){
			//alert('success');
				//alert(data);
				
		},
		complete:function(jqXHR, textStatus){
			//alert(textStatus);
			//window.postMessage(textStatus,'*')
			console.log(textStatus);
		}
	});
var request = new XMLHttpRequest();
request.open('GET', 'http://www.baidu.com/');
request.send(); // because of "false" above, will block until the request is done
                // and status is available. Not recommended, however it works for simple cases.
 
  request.onreadystatechange = function onreadystatechange() {
  console.log('xxx');
    console.log(request.readyState);
    if (request.readyState === 4) {
	  
      
	  console.log(request.responseText);
	  
    }
  };