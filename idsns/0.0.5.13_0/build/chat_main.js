/**
 * @license handlebars hbs 0.2.1 - Alex Sexton, but Handlebars has it's own licensing junk
 *
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/require-cs for details on the plugin this was based off of
 */

// 
//  chat_main.js
//  extension
//  
//  Created by liang mei on 2012-07-14.
//  Copyright 2012 __MyCompanyName__. All rights reserved.
// 

(function(){var e={};e.VERSION="1.0.beta.6",e.helpers={},e.partials={},e.registerHelper=function(e,t,n){n&&(t.not=n),this.helpers[e]=t},e.registerPartial=function(e,t){this.partials[e]=t},e.registerHelper("helperMissing",function(e){if(arguments.length===2)return undefined;throw new Error("Could not find property '"+e+"'")});var t=Object.prototype.toString,n="[object Function]";e.registerHelper("blockHelperMissing",function(e,r){var i=r.inverse||function(){},s=r.fn,o="",u=t.call(e);u===n&&(e=e.call(this));if(e===!0)return s(this);if(e===!1||e==null)return i(this);if(u==="[object Array]"){if(e.length>0)for(var a=0,f=e.length;a<f;a++)o+=s(e[a]);else o=i(this);return o}return s(e)}),e.registerHelper("each",function(e,t){var n=t.fn,r=t.inverse,i="";if(e&&e.length>0)for(var s=0,o=e.length;s<o;s++)i+=n(e[s]);else i=r(this);return i}),e.registerHelper("if",function(r,i){var s=t.call(r);return s===n&&(r=r.call(this)),!r||e.Utils.isEmpty(r)?i.inverse(this):i.fn(this)}),e.registerHelper("unless",function(t,n){var r=n.fn,i=n.inverse;return n.fn=i,n.inverse=r,e.helpers["if"].call(this,t,n)}),e.registerHelper("with",function(e,t){return t.fn(e)}),e.registerHelper("log",function(t){e.log(t)}),e.Exception=function(e){var t=Error.prototype.constructor.apply(this,arguments);for(var n in t)t.hasOwnProperty(n)&&(this[n]=t[n]);this.message=t.message},e.Exception.prototype=new Error,e.SafeString=function(e){this.string=e},e.SafeString.prototype.toString=function(){return this.string.toString()},function(){var t={"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},n=/&(?!\w+;)|[<>"'`]/g,r=/[&<>"'`]/,i=function(e){return t[e]||"&amp;"};e.Utils={escapeExpression:function(t){return t instanceof e.SafeString?t.toString():t==null||t===!1?"":r.test(t)?t.replace(n,i):t},isEmpty:function(e){return typeof e=="undefined"?!0:e===null?!0:e===!1?!0:Object.prototype.toString.call(e)==="[object Array]"&&e.length===0?!0:!1}}}(),e.Compiler=function(){},e.JavaScriptCompiler=function(){},function(t,n){t.OPCODE_MAP={appendContent:1,getContext:2,lookupWithHelpers:3,lookup:4,append:5,invokeMustache:6,appendEscaped:7,pushString:8,truthyOrFallback:9,functionOrFallback:10,invokeProgram:11,invokePartial:12,push:13,assignToHash:15,pushStringParam:16},t.MULTI_PARAM_OPCODES={appendContent:1,getContext:1,lookupWithHelpers:2,lookup:1,invokeMustache:3,pushString:1,truthyOrFallback:1,functionOrFallback:1,invokeProgram:3,invokePartial:1,push:1,assignToHash:1,pushStringParam:1},t.DISASSEMBLE_MAP={};for(var r in t.OPCODE_MAP){var i=t.OPCODE_MAP[r];t.DISASSEMBLE_MAP[i]=r}t.multiParamSize=function(e){return t.MULTI_PARAM_OPCODES[t.DISASSEMBLE_MAP[e]]},t.prototype={compiler:t,disassemble:function(){var e=this.opcodes,n,r,i=[],s,o,u;for(var a=0,f=e.length;a<f;a++){n=e[a];if(n==="DECLARE")o=e[++a],u=e[++a],i.push("DECLARE "+o+" = "+u);else{s=t.DISASSEMBLE_MAP[n];var l=t.multiParamSize(n),c=[];for(var h=0;h<l;h++)r=e[++a],typeof r=="string"&&(r='"'+r.replace("\n","\\n")+'"'),c.push(r);s=s+" "+c.join(" "),i.push(s)}}return i.join("\n")},guid:0,compile:function(e,t){this.children=[],this.depths={list:[]},this.options=t;var n=this.options.knownHelpers;this.options.knownHelpers={helperMissing:!0,blockHelperMissing:!0,each:!0,"if":!0,unless:!0,"with":!0,log:!0};if(n)for(var r in n)this.options.knownHelpers[r]=n[r];return this.program(e)},accept:function(e){return this[e.type](e)},program:function(e){var t=e.statements,n;this.opcodes=[];for(var r=0,i=t.length;r<i;r++)n=t[r],this[n.type](n);return this.isSimple=i===1,this.depths.list=this.depths.list.sort(function(e,t){return e-t}),this},compileProgram:function(e){var t=(new this.compiler).compile(e,this.options),n=this.guid++;this.usePartial=this.usePartial||t.usePartial,this.children[n]=t;for(var r=0,i=t.depths.list.length;r<i;r++){depth=t.depths.list[r];if(depth<2)continue;this.addDepth(depth-1)}return n},block:function(e){var t=e.mustache,n,r,i,s,o=this.setupStackForMustache(t),u=this.compileProgram(e.program);e.program.inverse&&(s=this.compileProgram(e.program.inverse),this.declare("inverse",s)),this.opcode("invokeProgram",u,o.length,!!t.hash),this.declare("inverse",null),this.opcode("append")},inverse:function(e){var t=this.setupStackForMustache(e.mustache),n=this.compileProgram(e.program);this.declare("inverse",n),this.opcode("invokeProgram",null,t.length,!!e.mustache.hash),this.declare("inverse",null),this.opcode("append")},hash:function(e){var t=e.pairs,n,r;this.opcode("push","{}");for(var i=0,s=t.length;i<s;i++)n=t[i],r=n[1],this.accept(r),this.opcode("assignToHash",n[0])},partial:function(e){var t=e.id;this.usePartial=!0,e.context?this.ID(e.context):this.opcode("push","depth0"),this.opcode("invokePartial",t.original),this.opcode("append")},content:function(e){this.opcode("appendContent",e.string)},mustache:function(e){var t=this.setupStackForMustache(e);this.opcode("invokeMustache",t.length,e.id.original,!!e.hash),e.escaped&&!this.options.noEscape?this.opcode("appendEscaped"):this.opcode("append")},ID:function(e){this.addDepth(e.depth),this.opcode("getContext",e.depth),this.opcode("lookupWithHelpers",e.parts[0]||null,e.isScoped||!1);for(var t=1,n=e.parts.length;t<n;t++)this.opcode("lookup",e.parts[t])},STRING:function(e){this.opcode("pushString",e.string)},INTEGER:function(e){this.opcode("push",e.integer)},BOOLEAN:function(e){this.opcode("push",e.bool)},comment:function(){},pushParams:function(e){var t=e.length,n;while(t--)n=e[t],this.options.stringParams?(n.depth&&this.addDepth(n.depth),this.opcode("getContext",n.depth||0),this.opcode("pushStringParam",n.string)):this[n.type](n)},opcode:function(e,n,r,i){this.opcodes.push(t.OPCODE_MAP[e]),n!==undefined&&this.opcodes.push(n),r!==undefined&&this.opcodes.push(r),i!==undefined&&this.opcodes.push(i)},declare:function(e,t){this.opcodes.push("DECLARE"),this.opcodes.push(e),this.opcodes.push(t)},addDepth:function(e){if(e===0)return;this.depths[e]||(this.depths[e]=!0,this.depths.list.push(e))},setupStackForMustache:function(e){var t=e.params;return this.pushParams(t),e.hash&&this.hash(e.hash),this.ID(e.id),t}},n.prototype={nameLookup:function(e,t,r){return/^[0-9]+$/.test(t)?e+"["+t+"]":n.isValidJavaScriptVariableName(t)?e+"."+t:e+"['"+t+"']"},appendToBuffer:function(e){return this.environment.isSimple?"return "+e+";":"buffer += "+e+";"},initializeBuffer:function(){return this.quotedString("")},namespace:"Handlebars",compile:function(e,t,n,r){this.environment=e,this.options=t||{},this.name=this.environment.name,this.isChild=!!n,this.context=n||{programs:[],aliases:{self:"this"},registers:{list:[]}},this.preamble(),this.stackSlot=0,this.stackVars=[],this.compileChildren(e,t);var i=e.opcodes,s;this.i=0;for(a=i.length;this.i<a;this.i++)s=this.nextOpcode(0),s[0]==="DECLARE"?(this.i=this.i+2,this[s[1]]=s[2]):(this.i=this.i+s[1].length,this[s[0]].apply(this,s[1]));return this.createFunctionContext(r)},nextOpcode:function(e){var n=this.environment.opcodes,r=n[this.i+e],i,s,o,u;if(r==="DECLARE")return i=n[this.i+1],s=n[this.i+2],["DECLARE",i,s];i=t.DISASSEMBLE_MAP[r],o=t.multiParamSize(r),u=[];for(var a=0;a<o;a++)u.push(n[this.i+a+1+e]);return[i,u]},eat:function(e){this.i=this.i+e.length},preamble:function(){var e=[];this.useRegister("foundHelper");if(!this.isChild){var t=this.namespace,n="helpers = helpers || "+t+".helpers;";this.environment.usePartial&&(n=n+" partials = partials || "+t+".partials;"),e.push(n)}else e.push("");this.environment.isSimple?e.push(""):e.push(", buffer = "+this.initializeBuffer()),this.lastContext=0,this.source=e},createFunctionContext:function(t){var n=this.stackVars;this.isChild||(n=n.concat(this.context.registers.list)),n.length>0&&(this.source[1]=this.source[1]+", "+n.join(", "));if(!this.isChild){var r=[];for(var i in this.context.aliases)this.source[1]=this.source[1]+", "+i+"="+this.context.aliases[i]}this.source[1]&&(this.source[1]="var "+this.source[1].substring(2)+";"),this.isChild||(this.source[1]+="\n"+this.context.programs.join("\n")+"\n"),this.environment.isSimple||this.source.push("return buffer;");var s=this.isChild?["depth0","data"]:["Handlebars","depth0","helpers","partials","data"];for(var o=0,u=this.environment.depths.list.length;o<u;o++)s.push("depth"+this.environment.depths.list[o]);if(t)return s.push(this.source.join("\n  ")),Function.apply(this,s);var a="function "+(this.name||"")+"("+s.join(",")+") {\n  "+this.source.join("\n  ")+"}";return e.log(e.logger.DEBUG,a+"\n\n"),a},appendContent:function(e){this.source.push(this.appendToBuffer(this.quotedString(e)))},append:function(){var e=this.popStack();this.source.push("if("+e+" || "+e+" === 0) { "+this.appendToBuffer(e)+" }"),this.environment.isSimple&&this.source.push("else { "+this.appendToBuffer("''")+" }")},appendEscaped:function(){var e=this.nextOpcode(1),t="";this.context.aliases.escapeExpression="this.escapeExpression",e[0]==="appendContent"&&(t=" + "+this.quotedString(e[1][0]),this.eat(e)),this.source.push(this.appendToBuffer("escapeExpression("+this.popStack()+")"+t))},getContext:function(e){this.lastContext!==e&&(this.lastContext=e)},lookupWithHelpers:function(e,t){if(e){var n=this.nextStack();this.usingKnownHelper=!1;var r;!t&&this.options.knownHelpers[e]?(r=n+" = "+this.nameLookup("helpers",e,"helper"),this.usingKnownHelper=!0):t||this.options.knownHelpersOnly?r=n+" = "+this.nameLookup("depth"+this.lastContext,e,"context"):(this.register("foundHelper",this.nameLookup("helpers",e,"helper")),r=n+" = foundHelper || "+this.nameLookup("depth"+this.lastContext,e,"context")),r+=";",this.source.push(r)}else this.pushStack("depth"+this.lastContext)},lookup:function(e){var t=this.topStack();this.source.push(t+" = ("+t+" === null || "+t+" === undefined || "+t+" === false ? "+t+" : "+this.nameLookup(t,e,"context")+");")},pushStringParam:function(e){this.pushStack("depth"+this.lastContext),this.pushString(e)},pushString:function(e){this.pushStack(this.quotedString(e))},push:function(e){this.pushStack(e)},invokeMustache:function(e,t,n){this.populateParams(e,this.quotedString(t),"{}",null,n,function(e,t,n){this.usingKnownHelper||(this.context.aliases.helperMissing="helpers.helperMissing",this.context.aliases.undef="void 0",this.source.push("else if("+n+"=== undef) { "+e+" = helperMissing.call("+t+"); }"),e!==n&&this.source.push("else { "+e+" = "+n+"; }"))})},invokeProgram:function(e,t,n){var r=this.programExpression(this.inverse),i=this.programExpression(e);this.populateParams(t,null,i,r,n,function(e,t,n){this.usingKnownHelper||(this.context.aliases.blockHelperMissing="helpers.blockHelperMissing",this.source.push("else { "+e+" = blockHelperMissing.call("+t+"); }"))})},populateParams:function(e,t,n,r,i,s){var o=i||this.options.stringParams||r||this.options.data,u=this.popStack(),a,f=[],l,c,h;o?(this.register("tmp1",n),h="tmp1"):h="{ hash: {} }";if(o){var p=i?this.popStack():"{}";this.source.push("tmp1.hash = "+p+";")}this.options.stringParams&&this.source.push("tmp1.contexts = [];");for(var d=0;d<e;d++)l=this.popStack(),f.push(l),this.options.stringParams&&this.source.push("tmp1.contexts.push("+this.popStack()+");");r&&(this.source.push("tmp1.fn = tmp1;"),this.source.push("tmp1.inverse = "+r+";")),this.options.data&&this.source.push("tmp1.data = data;"),f.push(h),this.populateCall(f,u,t||u,s,n!=="{}")},populateCall:function(e,t,n,r,i){var s=["depth0"].concat(e).join(", "),o=["depth0"].concat(n).concat(e).join(", "),u=this.nextStack();if(this.usingKnownHelper)this.source.push(u+" = "+t+".call("+s+");");else{this.context.aliases.functionType='"function"';var a=i?"foundHelper && ":"";this.source.push("if("+a+"typeof "+t+" === functionType) { "+u+" = "+t+".call("+s+"); }")}r.call(this,u,o,t),this.usingKnownHelper=!1},invokePartial:function(e){params=[this.nameLookup("partials",e,"partial"),"'"+e+"'",this.popStack(),"helpers","partials"],this.options.data&&params.push("data"),this.pushStack("self.invokePartial("+params.join(", ")+");")},assignToHash:function(e){var t=this.popStack(),n=this.topStack();this.source.push(n+"['"+e+"'] = "+t+";")},compiler:n,compileChildren:function(e,t){var n=e.children,r,i;for(var s=0,o=n.length;s<o;s++){r=n[s],i=new this.compiler,this.context.programs.push("");var u=this.context.programs.length;r.index=u,r.name="program"+u,this.context.programs[u]=i.compile(r,t,this.context)}},programExpression:function(e){if(e==null)return"self.noop";var t=this.environment.children[e],n=t.depths.list,r=[t.index,t.name,"data"];for(var i=0,s=n.length;i<s;i++)depth=n[i],depth===1?r.push("depth0"):r.push("depth"+(depth-1));return n.length===0?"self.program("+r.join(", ")+")":(r.shift(),"self.programWithDepth("+r.join(", ")+")")},register:function(e,t){this.useRegister(e),this.source.push(e+" = "+t+";")},useRegister:function(e){this.context.registers[e]||(this.context.registers[e]=!0,this.context.registers.list.push(e))},pushStack:function(e){return this.source.push(this.nextStack()+" = "+e+";"),"stack"+this.stackSlot},nextStack:function(){return this.stackSlot++,this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot),"stack"+this.stackSlot},popStack:function(){return"stack"+this.stackSlot--},topStack:function(){return"stack"+this.stackSlot},quotedString:function(e){return'"'+e.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r")+'"'}};var s="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "),o=n.RESERVED_WORDS={};for(var u=0,a=s.length;u<a;u++)o[s[u]]=!0;n.isValidJavaScriptVariableName=function(e){return!n.RESERVED_WORDS[e]&&/^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(e)?!0:!1}}(e.Compiler,e.JavaScriptCompiler),e.VM={template:function(t){var n={escapeExpression:e.Utils.escapeExpression,invokePartial:e.VM.invokePartial,programs:[],program:function(t,n,r){var i=this.programs[t];return r?e.VM.program(n,r):i?i:(i=this.programs[t]=e.VM.program(n),i)},programWithDepth:e.VM.programWithDepth,noop:e.VM.noop};return function(r,i){return i=i||{},t.call(n,e,r,i.helpers,i.partials,i.data)}},programWithDepth:function(e,t,n){var r=Array.prototype.slice.call(arguments,2);return function(n,i){return i=i||{},e.apply(this,[n,i.data||t].concat(r))}},program:function(e,t){return function(n,r){return r=r||{},e(n,r.data||t)}},noop:function(){return""},invokePartial:function(t,n,r,i,s,o){options={helpers:i,partials:s,data:o};if(t===undefined)throw new e.Exception("The partial "+n+" could not be found");if(t instanceof Function)return t(r,options);if(!e.compile)throw new e.Exception("The partial "+n+" could not be compiled when running in runtime-only mode");return s[n]=e.compile(t),s[n](r,options)}},e.template=e.VM.template,define("Handlebars",[],function(){return e})})(),define("hbs",[],function(){return{get:function(){return Handlebars},write:function(e,t,n){if(t+customNameExtension in buildMap){var r=buildMap[t+customNameExtension];n.asModule(e+"!"+t,r)}},version:"1.0.3beta",load:function(e,t,n,r){}}}),define("hbs!view/template/chat_group_temp",["hbs","Handlebars"],function(e,t){var n=t.template(function(e,t,n,r,i){function v(e,t){var r="",i;return r+='\n  <span class="badge">',a=n.unread,i=a||e.unread,typeof i===c?i=i.call(e,{hash:{}}):i===p&&(i=h.call(e,"unread",{hash:{}})),r+=d(i)+"</span>\n",r}n=n||e.helpers;var s="",o,u,a,f,l=this,c="function",h=n.helperMissing,p=void 0,d=this.escapeExpression;s+='<a href="#',a=n.id,o=a||t.id,typeof o===c?o=o.call(t,{hash:{}}):o===p&&(o=h.call(t,"id",{hash:{}})),s+=d(o)+'" data-toggle="tab">\n  ',a=n.unames,o=a||t.unames,typeof o===c?o=o.call(t,{hash:{}}):o===p&&(o=h.call(t,"unames",{hash:{}})),s+=d(o)+"\n</a>\n",a=n.unread,o=a||t.unread,u=n["if"],f=l.program(1,v,i),f.hash={},f.fn=f,f.inverse=l.noop,o=u.call(t,o,f);if(o||o===0)s+=o;return s+="\n",s});return t.registerPartial("view_template_chat_group_temp",n),n}),define("view/chat_group",["hbs!./template/chat_group_temp"],function(e){var t=Backbone.View.extend({tagName:"li",events:{click:"_onClick"},initialize:function(){var e=this;this.model.bind("change:users",this.render,this),this.model.bind("change:unread",this.onUpdateUnread,this),this.model.bind("active",this._onActive,this),this.model.bind("remove",this._onRemove,this)},render:function(){var t=this.model.toJSON();return t.id=this.model.id,t.unames=_.pluck(t.users,"uname").join(" "),$(this.el).html(e(t)),this},onUpdateUnread:function(){if($(this.el).hasClass("active"))return;this.render()},_onActive:function(){this.$el.find("a").click()},_onClick:function(){$("#"+this.model.id).focus()},_onRemove:function(){this.$el.remove()}});return t}),define("hbs!view/template/new_chat_group_temp",["hbs","Handlebars"],function(e,t){var n=t.template(function(e,t,n,r,i){function v(e,t){var n="",r;return n+='\n      <option value="',r=e,typeof r===c?r=r.call(e,{hash:{}}):r===p&&(r=h.call(e,"this",{hash:{}})),n+=d(r)+'">',r=e,typeof r===c?r=r.call(e,{hash:{}}):r===p&&(r=h.call(e,"this",{hash:{}})),n+=d(r)+"</option>\n    ",n}n=n||e.helpers;var s="",o,u,a,f,l=this,c="function",h=n.helperMissing,p=void 0,d=this.escapeExpression;s+='<div id="new_group_content">\n  <label>输入参与者名称</label>\n  <select class="chzn-select-group" id="group_users" data-placeholder="名称" multiple="multiple" name="group_users[]" size="10">\n    ',a=n.names,o=a||t.names,u=n.each,f=l.program(1,v,i),f.hash={},f.fn=f,f.inverse=l.noop,o=u.call(t,o,f);if(o||o===0)s+=o;return s+='\n  </select>\n  <a class="Button Button11 WhiteButton ContrastButton">新建</a>\n</div>',s});return t.registerPartial("view_template_new_chat_group_temp",n),n}),define("view/new_chat_group",["hbs!./template/new_chat_group_temp"],function(e){var t=Backbone.View.extend({className:"tab-pane active",id:"new_group_content",events:{"click .Button":"createGroup"},initialize:function(){},render:function(){var t=[];return this.collection.each(function(e){var n=_.map(e.get("users"),function(e){return _.isString(e)?e:e.uname});t.push(n)}),t=_.flatten(t),t=_.uniq(t),$(this.el).html(e({names:t})),this},createGroup:function(){var e=this.$(".chzn-select-group").val();if(!e)return;e=_.uniq(_.without(e,"")),this.collection.create({users:e},{wait:!0}),this.$(".search-choice-close").trigger("click"),this.$(".chzn-select-group").val([])},chosenBtnInit:function(){this.$(".chzn-select-group").ajaxChosen({method:"GET",url:IDSNS.web.Request.BASE+"/autocomplete_uname",dataType:"json"},function(e){if(e.code!=0)return;return e.data})}});return t}),define("hbs!view/template/chat_msg_temp",["hbs","Handlebars"],function(e,t){var n=t.template(function(e,t,n,r,i){n=n||e.helpers;var s="",o,u,a=this,f="function",l=n.helperMissing,c=void 0,h=this.escapeExpression;return s+='<div class="msg-from clearfix">\n  <p class="left">\n    <span class="from_user">',u=n.uname,o=u||t.uname,typeof o===f?o=o.call(t,{hash:{}}):o===c&&(o=l.call(t,"uname",{hash:{}})),s+=h(o)+' </span>\n    <span class="send_time">',u=n.send_time,o=u||t.send_time,typeof o===f?o=o.call(t,{hash:{}}):o===c&&(o=l.call(t,"send_time",{hash:{}})),s+=h(o)+'</span>\n  </p>\n</div>\n<div class="msg-content clearfix">\n  <p class="left">',u=n.msg,o=u||t.msg,typeof o===f?o=o.call(t,{hash:{}}):o===c&&(o=l.call(t,"msg",{hash:{}})),s+=h(o)+"</p>\n</div>",s});return t.registerPartial("view_template_chat_msg_temp",n),n}),define("hbs!view/template/author_msg_temp",["hbs","Handlebars"],function(e,t){var n=t.template(function(e,t,n,r,i){n=n||e.helpers;var s="",o,u,a=this,f="function",l=n.helperMissing,c=void 0,h=this.escapeExpression;return s+='<div class="msg-from clearfix">\n  <p class="right">\n    <span class="from_user">',u=n.uname,o=u||t.uname,typeof o===f?o=o.call(t,{hash:{}}):o===c&&(o=l.call(t,"uname",{hash:{}})),s+=h(o)+' </span>\n    <span class="send_time">',u=n.send_time,o=u||t.send_time,typeof o===f?o=o.call(t,{hash:{}}):o===c&&(o=l.call(t,"send_time",{hash:{}})),s+=h(o)+'</span>\n  </p>\n</div>\n<div class="msg-content clearfix">\n  <p class="right">',u=n.msg,o=u||t.msg,typeof o===f?o=o.call(t,{hash:{}}):o===c&&(o=l.call(t,"msg",{hash:{}})),s+=h(o)+"</p>\n</div>\n",s});return t.registerPartial("view_template_author_msg_temp",n),n}),define("hbs!view/template/chat_content_temp",["hbs","Handlebars"],function(e,t){var n=t.template(function(e,t,n,r,i){function v(e,t){var n="",r;return n+='\n        <li class="cg-avatar-li">\n          <a class="cg-avatar-wrap" data-toggle="dropdown">\n            <img src="',r=e.full_avatar,typeof r===c?r=r.call(e,{hash:{}}):r===p&&(r=h.call(e,"this.full_avatar",{hash:{}})),n+=d(r)+'" title="',r=e.uname,typeof r===c?r=r.call(e,{hash:{}}):r===p&&(r=h.call(e,"this.uname",{hash:{}})),n+=d(r)+'">\n          </a>\n          <ul class="dropdown-menu">\n            <li><a href="#" class="cg-block-user" uid=',r=e.id,typeof r===c?r=r.call(e,{hash:{}}):r===p&&(r=h.call(e,"this.id",{hash:{}})),n+=d(r)+">拉黑",r=e.sname,typeof r===c?r=r.call(e,{hash:{}}):r===p&&(r=h.call(e,"this.sname",{hash:{}})),n+=d(r)+'</a></li>\n            <li><a href="#" class="cg-remove-user" uid=',r=e.id,typeof r===c?r=r.call(e,{hash:{}}):r===p&&(r=h.call(e,"this.id",{hash:{}})),n+=d(r)+">移除",r=e.sname,typeof r===c?r=r.call(e,{hash:{}}):r===p&&(r=h.call(e,"this.sname",{hash:{}})),n+=d(r)+"</a></li>\n          </ul>\n      ",n}n=n||e.helpers;var s="",o,u,a,f,l=this,c="function",h=n.helperMissing,p=void 0,d=this.escapeExpression;s+='<div class="chat_content clearfix">\n  <div class="chatgroup-cg">\n    <ul class="cg-avatar-ul">\n      ',a=n.users,o=a||t.users,u=n.each,f=l.program(1,v,i),f.hash={},f.fn=f,f.inverse=l.noop,o=u.call(t,o,f);if(o||o===0)s+=o;return s+='\n    </ul>\n  </div>\n  <ul class="ctrl-icons">\n    <li class="ctrl-icon">\n      <i class="icon-chevron-left click-disabled" title="向左"></i>\n    </li>\n    <li class="ctrl-icon">\n      <i class="icon-chevron-right" title="向右"></i>\n    </li>\n    <li class="ctrl-icon">\n      <i class="icon-plus" title="添加新联系人" data-toggle="dropdown"></i>\n      <ul class="dropdown-menu cg-add-user-wrap">\n        <li class="clearfix">\n          <input class="cg-add-user-input" type="text"/>\n          <img class="loading" src="/images/ajax-loader.gif"/>\n          <span class="loading-result"></span>\n          <a class="Button Button11 WhiteButton ContrastButton cg-add-user">添加联系人</a>\n        </li>\n      </ul>\n    </li>\n    <li class="ctrl-icon">\n      <i class="icon-hand-up" title="加载历史记录"></i>\n    </li>\n    <li class="ctrl-icon">\n      <i class="icon-remove" title="关闭会话"></i>\n    </li>\n    <li class="ctrl-icon">\n      <i class="icon-off" title="退出会话"></i>\n    </li>\n  </ul>\n  <div class="outputWrap"></div>\n  <div class="inputWrap">\n    <div class="groupUsersWrap">\n    </div>\n    <div class="groupMsgInputWrap">\n      <textarea class="msgInput" style="resize:none;"></textarea>\n    </div>\n    <div class="groupCtrlPanel">\n      按 ctrl+enter 发送\n      <a class="Button Button11 WhiteButton ContrastButton sendMsgBtn">发送</a>\n    </div>\n  </div>\n</div>',s});return t.registerPartial("view_template_chat_content_temp",n),n}),define("view/chat_content",["hbs!./template/chat_msg_temp","hbs!./template/author_msg_temp","hbs!./template/chat_content_temp"],function(e,t,n){var r=Backbone.View.extend({className:"tab-pane",events:{"click .cg-remove-user":"_onRemoveUser","click .cg-block-user":"_onBlockUser","click .icon-chevron-left":"_onMoveLeft","click .icon-chevron-right":"_onMoveRight","click .icon-remove":"_onClose","click .icon-hand-up":"_onLoadMore","click .icon-off":"_onExit","click .icon-plus":"_onBeforeAddUser","keydown .msgInput":"_onMsgInput","click .sendMsgBtn":"sendMsg","click .cg-add-user-wrap":"_disableAutoHide",focus:"_onFocus"},initialize:function(){this.avatar_cursor=0,this.model.bind("change:users",this.render,this),this.model.bind("addMsg",this.addMsg,this),this.model.bind("remove",this._onRemove,this)},render:function(){var e=this;$(this.el).html(this._renderContentHtml(this.model.parseModel())),this.$el.attr("id",this.model.id);var t=this.model.get("users").length;this.avatar_cursor=Math.floor(t/10),this.avatar_cursor==0&&this.$(".icon-chevron-right").addClass("click-disabled");for(var n=0,r=this.model.chat_msgs.length;n<r;n++)e.addMsg(e.model.chat_msgs[n]);return this.$(".cg-avatar-wrap").dropdown(),this.$(".icon-plus").dropdown(),this},_onBeforeAddUser:function(){var e=this;e.$(".cg-add-user-wrap .loading-result").hide(),e.$(".cg-add-user-wrap .loading").hide()},_disableAutoHide:function(e){var t=this;if($(e.target).hasClass("cg-add-user")){var n=this.$(".cg-add-user-input").val();if(_.isEmpty(n))return;this.model.save({},{wait:!0,add:!0,uname:n,success:function(){t.$(".cg-add-user-wrap .loading-result").css("display","block").html("添加成功"),t.$(".cg-add-user-wrap .loading").hide()},error:function(){t.$(".cg-add-user-wrap .loading-result").css("display","block").html("此用户不存在或无法添加"),t.$(".cg-add-user-wrap .loading").hide()}}),this.$(".cg-add-user-wrap .loading").css("display","block")}return!1},_onRemoveUser:function(e){var t=this,n=$(e.target).attr("uid");if(_.isEmpty(n))return;this.model.save({},{wait:!0,add:!1,uid:n})},_onExit:function(){var e=this,t=IDSNS.glb_user.id;this.model.save({},{wait:!0,add:!1,uid:t})},_onBlockUser:function(e){var t=$(e.target).attr("uid"),n=new IDSNS.web.Request;n.blockUser(t)},sendMsg:function(){var e=this.$(".msgInput").val();if(!/\S+/.test(e))return;this.model.sendMsg(e),this.$(".msgInput").val("")},addMsg:function(e){var t=this.parseMsg(e),n=this._renderMsgHtml(t);this.$(".outputWrap").append(n).scrollTop(this.$(".outputWrap")[0].scrollHeight)},parseMsg:function(e){var t={},n=e.get("fId");t.id=this.model.id,t.author=n==IDSNS.glb_user.id?!0:!1,t.msg=e.get("msg");var r=this.model.get("users"),i=n==IDSNS.glb_user.id?IDSNS.glb_user:_.find(r,function(e){return e.id==n});return t.uname=i.uname,t.t=e.get("t"),t},_onFocus:function(){this.model.clearFetchedMsgs(),this.model.clearUnread()},_onMsgInput:function(e){if(e.ctrlKey&&e.keyCode==13)return this.sendMsg(),!1},_onMoreMsgs:function(e){var t=this;_.each(e,function(e){var n=t.parseMsg(e),r=t._renderMsgHtml(n);t.$(".outputWrap").prepend(r)}),t.$(".outputWrap").scrollTop(0)},_renderMsgHtml:function(n){var r=n.t,i=r?new Date(r):new Date;return i=i.format("yyyy-mm-dd HH:MM"),n.send_time=i,n.author?t(n):e(n)},_renderContentHtml:function(e){return _.each(e.users,function(e){var t=_.isEmpty(e.avatar)?"/images/thumb_small_default.png":IDSNS.Const.ImgBase+"thumb_small_"+e.avatar,n=e.uname>5?e.uname.slice(0,5)+"...":e.uname;e.full_avatar=t,e.sname=n}),n(e)},_onClose:function(){this.model.destroy()},_onLoadMore:function(){var e=this;this.model.loadMore(function(t){e._onMoreMsgs(t)})},_onMoveRight:function(){if(this.$(".icon-chevron-right").hasClass("click-disabled"))return;(this.avatar_cursor+1)*10>this.model.get("users").length&&this.$(".icon-chevron-right").addClass("click-disabled"),this.avatar_cursor+=1,this.$(".icon-chevron-left").removeClass("disabled"),this.$(".cg-avatar-ul").animate({left:"-=350"},1e3)},_onMoveLeft:function(){if(this.$(".icon-chevron-left").hasClass("disabled"))return;this.avatar_cursor==1&&this.$(".icon-chevron-left").addClass("disabled"),this.avatar_cursor-=1,this.$(".icon-chevron-right").removeClass("click-disabled"),this.$(".cg-avatar-ul").animate({left:"+=350"},1e3)},_onRemove:function(){this.$el.remove()}});return r}),define("view/chat_groups",["./chat_group","./new_chat_group","./chat_content"],function(e,t,n){var r=Backbone.View.extend({id:"chat_group_list",className:"nav-tabs",tagName:"ul",events:{},initialize:function(){var e=this;this.collection.unbind(),this.collection.bind("reset",e.renderList,e),this.collection.bind("add",e.onGroupAdd,e),this.renderList()},renderList:function(){var e=this;this.$el.html('<li id="new_group_item"><a href="#new_group_content" class="Button Button11 WhiteButton ContrastButton" data-toggle="tab">新会话</a><img src="/images/icon.png" /></li>');var n=new t({collection:e.collection});$("#chat_right").html(n.render().el),n.chosenBtnInit();var r=e.collection.getDeletedGroups();this.collection.each(function(t){_.indexOf(r,t.id)==-1?e.renderGroup(t):e.collection.remove(t)})},onGroupAdd:function(e){this.renderGroup(e),this.activeGroup(e.id)},activeGroup:function(e){!e&&this.collection.models.length>0?(e=this.collection.at(0).id,this.$el.find("li a[href=#"+e+"]").click()):e?e&&this.$el.find("li a[href=#"+e+"]").click():this.$el.find("#new_group_item").addClass("active")},renderGroup:function(t){var r=this,i=new e({model:t});r.$el.append(i.render().el);var s=new n({model:t});$("#chat_right").append(s.render().el)}});return r});var IDSNS=IDSNS||{};define("chat_main",["view/chat_groups"],function(e){var t=chrome.extension.getBackgroundPage();IDSNS.glb_user=t.IDSNS.glb_user;var n=new e({collection:t.IDSNS.glb_groups}),r=t.IDSNS.glb_groups;r.bind(IDSNS.Const.ONLINE,function(){$("#offShadow").hide()}).bind(IDSNS.Const.OFFLINE,function(){$("#offShadow").show()}),chrome.windows.getCurrent(function(e){r.chatWindowId=e.id,r.onChatWindowFocus(e.id)}),$("#chat_left").append(n.el);if(r.initChat2User){var i=t.IDSNS.glb_groups.find(function(e){var t=e.get("users");return t.length==1&&t[0].id==r.initChat2User.id?!0:!1});i?n.activeGroup(i.id):(n.activeGroup(),r.create({users:[r.initChat2User.uname]},{wait:!0})),t.initChat2User=null}else n.activeGroup()})