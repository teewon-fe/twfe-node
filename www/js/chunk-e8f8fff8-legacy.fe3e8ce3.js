(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-e8f8fff8"],{"4ec0":function(e,t,n){"use strict";var s=n("5369"),i=n.n(s);i.a},5369:function(e,t,n){},eefd:function(e,t,n){"use strict";n.r(t);var s=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{directives:[{name:"bottom",rawName:"v-bottom",value:0,expression:"0"}],staticClass:"tw-loginbox",on:{click:e.focusInput}},[n("div",[e._v("注册或登录")]),e._l(e.cmds,(function(t,s){return n("div",{key:s},[e._v(e._s(t))])})),n("div",[n("span",[e._v(e._s(e.currCmd)+"$:")]),"checkbox"===("enter-password"===e.step?"password":"text")?n("input",{directives:[{name:"model",rawName:"v-model",value:e.value,expression:"value"}],ref:"input",staticClass:"tw-loginbox-input",attrs:{type:"checkbox"},domProps:{checked:Array.isArray(e.value)?e._i(e.value,null)>-1:e.value},on:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.handleCmd(t)},change:function(t){var n=e.value,s=t.target,i=!!s.checked;if(Array.isArray(n)){var u=null,a=e._i(n,u);s.checked?a<0&&(e.value=n.concat([u])):a>-1&&(e.value=n.slice(0,a).concat(n.slice(a+1)))}else e.value=i}}}):"radio"===("enter-password"===e.step?"password":"text")?n("input",{directives:[{name:"model",rawName:"v-model",value:e.value,expression:"value"}],ref:"input",staticClass:"tw-loginbox-input",attrs:{type:"radio"},domProps:{checked:e._q(e.value,null)},on:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.handleCmd(t)},change:function(t){e.value=null}}}):n("input",{directives:[{name:"model",rawName:"v-model",value:e.value,expression:"value"}],ref:"input",staticClass:"tw-loginbox-input",attrs:{type:"enter-password"===e.step?"password":"text"},domProps:{value:e.value},on:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.handleCmd(t)},input:function(t){t.target.composing||(e.value=t.target.value)}}})])],2)},i=[],u={name:"page-login",data:function(){return{cmds:[],currCmd:"用户(请用真实姓名)",step:"enter-user",value:""}},methods:{focusInput:function(){this.$refs.input.focus()},nextCmd:function(e){this.cmds.push("".concat(this.currCmd,"$:").concat(this.value)),this.currCmd=e,this.value=""},handleCmd:function(){var e=this,t=this.$api.login.getUser.params;"enter-user"===this.step?this.value.trim()?(t.usr=this.value,this.nextCmd("密码(你记得住就行)"),this.step="enter-password"):this.cmds.push("请输入用户名"):"enter-password"===this.step?(this.value.trim()?(t.pwd=this.value,this.step++,this.$api.login.getUser.send()):this.cmds.push("请输入用户密码"),setTimeout((function(){var t=.6;t>.5?(e.nextCmd("手机(输入手机号码)"),e.step="enter-mob"):e.$router.push("/home")}),2e3)):"enter-mob"===this.step&&(this.value.trim()?this.$ui.pattern.phone.test(this.value)?(t.mob=this.value,this.$api.login.addUser.send()):this.cmds.push("请输入正确的手机号码"):this.cmds.push("第一次登录需输入手机号码")),this.$nextTick((function(){window.scrollTo(0,document.documentElement.offsetHeight+10)}))}},mounted:function(){this.focusInput()}},a=u,r=(n("4ec0"),n("623f")),o=Object(r["a"])(a,s,i,!1,null,null,null);t["default"]=o.exports}}]);