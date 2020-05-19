define("common/main",["bui/menu","bui/tab"],function(l){var k=BUI.app("PageUtil"),h=l("bui/menu"),m=l("bui/tab");var r="dl-selected",c="ks-hidden",A="dl-last",z="dl-hover",p="nav-item",u="dl-second-slib",f="dl-tab-item",v="dl-collapse",x="dl-hide-current",w="data-index",j=145;function o(C){var B="";if(localStorage.getItem("config")&&C){var D=JSON.parse(localStorage.getItem("config"));B="?"+D.version}return B}function g(B){window.topManager=B}function b(B,C){if(B.indexOf("?")!==-1){return B+"&"+C}else{return B+"?"+C}}function i(D,G,J,H,C){var K=this,E=new h.SideMenu(J),F=new m.NavTab(G),L=$(J.render),B=L.next("."+u+"-con"),I=L.parents("."+f);window.TopTab=F;if(B){B.on("click",function(){I.toggleClass(v)});B.parent().height(G.height)}if(H){I.addClass(v)}E.on("menuclick",function(N){var M=N.item;if(M){K.tab.addTab({id:M.get("id"),title:M.get("text"),href:M.get("href")+o(M.get("href")),closeable:M.get("closeable")},true)}});E.on("itemselected",function(N){var M=N.item;if(M){e(D,M.get("id"))}});F.on("activeChange",function(N){var M=N.item;if(M){K.menu.setSelectedByField(M.get("id"))}else{K.menu.clearSelection()}});K.tab=F;K.menu=E;K.homePage=C;F.render();E.render()}function e(C,B){B=B||"";var D="#"+C;if(B){D+="/"+B}location.hash=D}function d(){var F=location.hash,E=0,B="",C=F.indexOf("/"),D=null;if(!F){return null}if(C>=0){E=F.substring(1,C);B=F.substring(C+1);D=t(B);if(D){B=B.replace("?"+D,"")}}else{E=F.substring(1)}return{moduleId:E,pageId:B,search:D}}function t(B){var C=B.indexOf("?");if(C>=0){return B.substring(C+1)}return null}function n(B){if(!$.isArray(B)){return}var C=s(B);while(C!==-1){B.splice(C,1);C=s(B)}return B}function s(C){var B=-1;$.each(C,function(D,E){if(E===null||E===undefined){B=D;return false}});return B}function a(){var B=BUI.viewportHeight(),C=70;return B-C}function q(B){var C=$(B);if(C.hasClass(p)){return B}return C.parent("."+p)[0]}var y=function(B){n(B);y.superclass.constructor.call(this,B);this._init();g(this)};y.ATTRS={currentModelIndex:{},hideItmes:{value:[]},hideList:{},modules:{value:[]},modulesConfig:{},navList:{valueFn:function(){return $("#J_Nav")}},navContent:{valueFn:function(){return $("#J_NavContent")}},navItems:{valueFn:function(){return $("#J_Nav").children("."+p)}},navTabs:{valueFn:function(){return this.get("navContent").children("."+f)}},urlSuffix:{value:".html"}};BUI.extend(y,BUI.Base);BUI.augment(y,{openPage:function(Q){var L=this,G=Q.moduleId||L._getCurrentModuleId(),E=Q.id,N=Q.title||"新的标签页",D=Q.href,P=Q.isClose,F=Q.closeable,C=Q.reload,R=Q.search;var I=L._getModule(G);if(I){var J=I.tab,H=I.menu,B=H.getItem(E),M=J.getActivedItem(),O=M?M.get("id"):null,K=L._getModuleIndex(G);if(G!=L._getCurrentModuleId()){L._setModuleSelected(K)}if(B){L._setPageSelected(K,E,C,R)}else{J.addTab({id:E,title:N,href:D+o(D),sourceId:O,closeable:F},C)}if(P){M.close()}}},closePage:function(C,B){this.operatePage(B,C,"close")},reloadPage:function(C,B){this.operatePage(B,C,"reload")},setPageTitle:function(C,D,B){this.operatePage(B,D,"setTitle",[C])},operatePage:function(G,I,H,C){G=G||this._getCurrentModuleId();C=C||[];var B=this,D=B._getModule(G);if(D){var E=D.tab,F=I?E.getItemById(I):E.getActivedItem();if(F&&F[H]){F[H].apply(F,C)}}},_createModule:function(G){var B=this,E=B._getModuleConfig(G),D=B.get("modules");if(!E){return null}var G=E.id,C="#J_"+G+"Tab",F="#J_"+G+"Tree";module=new i(G,{render:C,height:a()-5},{render:F,items:E.menu,height:a()-5},E.collapsed,E.homePage);D[G]=module;return module},_hideHideList:function(){this.get("hideList").hide()},_init:function(){var B=this;B._initDom();B._initNavItems();B._initEvent()},_initNavItems:function(){var K=this,E=K.get("navItems"),D=K.get("hideItmes");if(E.length===0){return}$('<div class="nav-item-mask"></div>').appendTo($(E));var I=E.length,M=BUI.viewportWidth(),J=j,H=J*I,B=0;if(H<=M){return}$.each(E,function(N,O){$(O).attr(w,N);$(O).removeClass(A)});B=parseInt(M/J);var C=E[B-1];K._setLastItem(C);D.push($(C).clone()[0]);for(var G=B;G<I;G++){var L=$(E[G]),F=null;F=L.clone()[0];D.push(F);L.addClass(c)}K._initHideList()},_initHideList:function(){var D=this,C=D.get("hideList"),B=D.get("hideItmes");if(C){return}var F='<ul class="dl-hide-list ks-hidden"></ul>',E=$(F).appendTo("body");C=E;$.each(B,function(G,H){$(H).appendTo(C)});D.set("hideList",C);D._initHideListEvent()},_initHideListEvent:function(){var C=this,B=C.get("hideList");if(B==null){return}B.on("mouseleave",function(){C._hideHideList()});B.on("click",function(G){var F=q(G.target),E=null,D=0;if(F){E=$(F);D=E.attr(w);C._setModuleSelected(D);C._hideHideList()}})},_initContents:function(){var B=this,D=B.get("modulesConfig"),C=B.get("navContent");C.children().remove();$.each(D,function(F,G){var H=G.id,E=['<li class="dl-tab-item ks-hidden"><div class="dl-second-nav"><div class="dl-second-tree" id="J_',H,'Tree"></div><div class="',u,'-con"><div class="',u,'"></div></div></div><div class="dl-inner-tab" id="J_',H,'Tab"></div></li>'].join("");new $(E).appendTo(C)})},_initDom:function(){var B=this;B._initContents();B._initLocation()},_initEvent:function(){var B=this,C=B.get("navItems");C.each(function(D,E){var E=$(E);E.on("click",function(){var F=$(this);if(F.hasClass(r)){return}B._setModuleSelected(D,F)}).on("mouseenter",function(){$(this).addClass(z)}).on("mouseleave",function(){$(this).removeClass(z)})});B._initNavListEvent()},_initNavListEvent:function(){var C=this,B=C.get("hideList"),D=C.get("navList");D.on("mouseover",function(G){var F=q(G.target),E=$(F),H=null;if(E&&E.hasClass(A)&&B){H=E.offset();H.top+=37;H.left+=2;C._showHideList(H)}}).on("mouseout",function(F){var E=F.toElement;if(E&&B&&!$.contains(B[0],E)&&E!==B[0]){C._hideHideList()}})},_initLocation:function(){var B=this,F=d();if(F){var D=F.pageId,G=F.search,E=B._getModuleIndex(F.moduleId);B._setModuleSelected(E);B._setPageSelected(E,D,true,G)}else{var C=B.get("currentModelIndex"),H=B._getModuleId(C);if(C==null){B._setModuleSelected(0)}else{e(H)}}},_getModule:function(D){var B=this,C=B.get("modules")[D];if(!C){C=B._createModule(D)}return C},_getModuleIndex:function(D){var C=this,B=0;$.each(C.get("modulesConfig"),function(F,E){if(E.id===D){B=F;return false}});return B},_getModuleConfig:function(D){var C=this,B=null;$.each(C.get("modulesConfig"),function(F,E){if(E.id===D){B=E;return false}});return B},_getModuleId:function(B){var C=this.get("modulesConfig");if(C[B]){return C[B].id}else{return B}},_getCurrentPageId:function(){var B=this,F=B._getCurrentModuleId(),D=B._getModule(F),C="";if(D){var E=D.menu.getSelected();if(E){C=E.get("id")}}return C},_getCurrentModuleId:function(){return this._getModuleId(this.get("currentModelIndex"))},_isModuleInitial:function(B){return !!this.get("modules")[B]},_setLastItem:function(F){var B=this,C=B.get("lastShowItem");if(C===F){return}var D=null,E=$(C);itemEl=$(F);if(C){D=E.find("."+x);E.removeClass(A);E.addClass(c)}itemEl.addClass(A);itemEl.removeClass(c);if(!D){D=$('<span class="icon icon-white  icon-caret-down '+x+'">&nbsp;&nbsp;</span>')}D.appendTo(itemEl.children(".nav-item-inner"));B.set("lastShowItem",F)},_setModuleSelected:function(H,G){var J=this,F=J.get("navItems"),D=J.get("navTabs"),I=J.get("currentModelIndex");if(I!==H){var B=J._getModuleId(H),C=null,E=J.get("lastShowItem"),K=true;if(!J._isModuleInitial(B)){K=false}C=J._getModule(B);G=G||$(J.get("navItems")[H]);if(G.hasClass(c)&&E){J._setLastItem(G[0]);J._setSelectHideItem(H)}F.removeClass(r);G.addClass(r);D.addClass(c);$(D[H]).removeClass(c);I=H;J.set("currentModelIndex",I);curPageId=J._getCurrentPageId();e(B,curPageId);if(!curPageId&&C.homePage){J._setPageSelected(H,C.homePage)}}},_setPageSelected:function(G,H,I,M){var J=this,D=J._getModuleId(G)||G,E=J._getModule(D);if(E&&H){E.menu.setSelectedByField(H);var L=E.menu.getSelected(),F=E.tab,C="",B=-1;if(L&&L.get("id")===H){C=L.get("href");C=M?(b(C,M)):C;E.tab.addTab({id:L.get("id"),title:L.get("text"),closeable:L.get("closeable"),href:C+o(C)},!!I)}else{if(H){var K=H.replace("-","/");if(K.indexOf("/")===-1){K=D+"/"+K}if((B=H.indexOf("."))===-1){K+=J.get("urlSuffix")}C=M?(K+"?"+M):K;F.addTab({id:H,title:"",href:C+o(C)},!!I)}}}},_showHideList:function(D){var C=this,B=C.get("hideList");B.css("left",D.left);B.css("top",D.top);B.show()},_setSelectHideItem:function(F){var D=this,C=D.get("hideList"),B=D.get("hideItmes"),G=null,E=null,I=null,H=null;BUI.each(B,function(K){var J=$(K);if(J.attr(w)==F){E=K}if(J.hasClass(A)){G=K}});if(G!==E){if(G){H=$(G).find(".dl-hide-current");$(G).removeClass(A)}$(E).addClass(A);if(!H){H=new Node('<span class="dl-hide-current">&nbsp;&nbsp;</span>')}I=$(E);H.appendTo(I.children(".nav-item-inner"));I.prependTo(C)}}});k.MainPage=y;return y});