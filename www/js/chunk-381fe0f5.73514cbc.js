(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-381fe0f5"],{"07a8":function(t,e,s){},"25f7":function(t,e,s){"use strict";s.r(e);var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("main",{staticClass:"tw-body"},[s("div",{staticClass:"tw-body-inner xcontainer"},[s("div",{staticClass:"tw-flex mb-small"},[s("div",{staticClass:"tw-flex-body"},[s("tw-search",{staticClass:"xmedium",attrs:{placeholder:"请输入项目名称"},model:{value:t.searchWord,callback:function(e){t.searchWord=e},expression:"searchWord"}})],1),t.$app.user.role===t.$cnt.ROLE_TEAM_LEADER?s("div",[s("router-link",{staticClass:"tw-btn xsecondary xmedium",attrs:{to:"/new-project"}},[t._v("创建项目")])],1):t._e()]),s("div",{staticClass:"tw-card mb-medium pb-medium"},[t._m(0),s("div",{staticClass:"tw-grid xpc4 xlpad4 xpad4 text-center"},[s("div",{staticClass:"tw-grid-col"},[s("div",{staticClass:"text-huge"},[s("span",{staticClass:"text-highlight"},[t._v(t._s(t.$api.project.count.data.doing))]),t._v("/"+t._s(t.$api.project.count.data.total))]),s("div",{staticClass:"text-small text-weaking scale-less-medium"},[t._v("进行中/总数(个)")]),t._m(1)]),t._m(2),t._m(3),t._m(4)])]),s("div",{directives:[{name:"bottom",rawName:"v-bottom",value:70,expression:"70"}],staticClass:"tw-body-content"},[t._m(5),s("table",{staticClass:"tw-table"},[t._m(6),s("tbody",t._l(t.projects,(function(e,a){return s("tr",{key:e.id},[s("td",[t._v(t._s(a+1))]),s("td",[s("router-link",{staticClass:"text-link",attrs:{to:"/project-detail?id="+e.id}},[t._v(t._s(e.project_name))])],1),s("td",[t._v(t._s(e.project_leader_name))]),s("td",{staticClass:"pr-huge"},[s("el-progress",{attrs:{percentage:e.progress,format:t.format,color:"risky"===e.status?"#f56c6c":"#218fff"}})],1),s("td",[t._v(t._s(e.task_time))]),s("td",[t._v(t._s(e.next_time_node.text))])])})),0)]),s("tw-pagination",{attrs:{type:"front",pageSize:t.$api.project.getProjects.params.pageSize,total:t.$api.project.getProjects.data.total},on:{"update:pageSize":function(e){return t.$set(t.$api.project.getProjects.params,"pageSize",e)},"update:page-size":function(e){return t.$set(t.$api.project.getProjects.params,"pageSize",e)},pageChange:function(e){return t.$api.project.getProjects.send()},sizeChange:function(e){return t.$api.project.getProjects.send()}},model:{value:t.$api.project.getProjects.params.pageNo,callback:function(e){t.$set(t.$api.project.getProjects.params,"pageNo",e)},expression:"$api.project.getProjects.params.pageNo"}})],1)])])},i=[function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"tw-title xnomark xico"},[s("div",{staticClass:"tw-title-left"},[s("i",{staticClass:"tw-ico xsummary"}),s("span",{staticClass:"text-default"},[t._v("项目统计")])])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"text-medium"},[s("i",{staticClass:"tw-ico xproject dt-n1 mr-3"}),t._v("项目统计")])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"tw-grid-col"},[s("div",{staticClass:"text-huge"},[s("span",{staticClass:"text-highlight"},[t._v("--")]),t._v("/--")]),s("div",{staticClass:"text-small text-weaking scale-less-medium"},[t._v("未排期/已排期(h)")]),s("div",{staticClass:"text-medium"},[s("i",{staticClass:"tw-ico xcmonth dt-n1 mr-3"}),t._v("本月工时")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"tw-grid-col"},[s("div",{staticClass:"text-huge"},[s("span",{staticClass:"text-highlight"},[t._v("--")]),t._v("/--")]),s("div",{staticClass:"text-small text-weaking scale-less-medium"},[t._v("当前/目标(页/人天)")]),s("div",{staticClass:"text-medium"},[s("i",{staticClass:"tw-ico xspeed dt-n1 mr-3"}),t._v("开发效率")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"tw-grid-col"},[s("div",{staticClass:"text-huge"},[s("span",{staticClass:"text-highlight"},[t._v("--")]),t._v("/--")]),s("div",{staticClass:"text-small text-weaking scale-less-medium"},[t._v("本月/总数(个)")]),s("div",{staticClass:"text-medium"},[s("i",{staticClass:"tw-ico xbug dt-n1 mr-3"}),t._v("缺陷密度")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"tw-title"},[s("h3",{staticClass:"tw-title-left text-default"},[t._v("项目列表")])])},function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("thead",[s("tr",[s("th",{staticStyle:{width:"5em"}},[t._v("序号")]),s("th",[t._v("项目名称")]),s("th",{staticStyle:{width:"10em"}},[t._v("负责人")]),s("th",{staticStyle:{width:"180px"}},[t._v("进度")]),s("th",{staticStyle:{width:"10em"}},[t._v("总工时(人/天)")]),s("th",{staticStyle:{width:"15em"}},[t._v("下一里程碑")])])])}],c={name:"page-home",data(){return{searchWord:""}},computed:{projects(){return this.$api.project.getProjects.data.list.map(t=>t.project)}},methods:{format(t){return t+"%"}},created(){this.$api.project.count.send(),this.$api.project.getProjects.reset().send()}},r=c,l=(s("d6e1"),s("9ca4")),n=Object(l["a"])(r,a,i,!1,null,null,null);e["default"]=n.exports},d6e1:function(t,e,s){"use strict";var a=s("07a8"),i=s.n(a);i.a}}]);