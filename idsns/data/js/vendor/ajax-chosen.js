(function($) {
   return $.fn.ajaxChosen = function(options, callback) {
     $(this).each(function(index){
       var select=$(this);
       select.chosen({"no_results_text":'<img src="/images/ajax-loader.gif">'});
       return select.next('.chzn-container').find(".search-field > input").bind('keyup', function(evt) {
         var field, val, found = true, stroke;
         val = $.trim($(this).attr('value'));
         $(".no-results span").each(function(){
           if ($(this).html().trim() == val) found = false;
         })
         stroke = evt.which != null ? evt.which : evt.keyCode;
         switch (stroke) {
           case 13:
             var word, $target = select.next().find(".tag_word:first")
             if ($target.length != 0) {
               word =  $target.html()
               $("<option class='added_option'/>").attr('value', word).html(word).appendTo(select);
               select.trigger("liszt:updated");
               select.next().find(".added_option").last().mouseover().mouseup();
             }
           default:break;
         }
         if ($.trim(val) === "" || val === $(this).data('prevVal') || found) return;
         if (this.timer) clearTimeout(this.timer);
         $(this).data('prevVal', val);
         field = $(this);
         options.data = {
           query: val
         };
         if (typeof success === "undefined" || success === null) {
           success = options.success;
         }
         options.success = function(data) {
           var items;
           if (data == undefined) {
             select.next().find(".no-results:first").remove();
            return;
           } else if (data.code == "1") {
             var target = select.next().find(".no-results:first");
             target.html("标签 <em class='tag_word'>"+target.find("span").html()+"</em> 不存在，按回车添加标签");
             return
           };
           select.find('.ajax_option').each(function() {
             if (!$(this).is(":selected")) $(this).remove();
           });
           items = callback(data);
           $.each(items, function(value, text) {
             $("<option class='ajax_option' />").attr('value', text).html(text).appendTo(select);
           });
           select.trigger("liszt:updated");
           select.next().find(".search-field input").first().keyup()
           if (typeof success !== "undefined" && success !== null) return success();
         };
         return this.timer = setTimeout(function() {
           return $.ajax(options);
         }, 800);
       });
      
     })
   };
 })(jQuery);