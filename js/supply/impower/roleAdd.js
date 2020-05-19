/**
 * Created by sone on 2017/5/2.
 */
$(function(){
    var setting = {
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            onClick: function (e, treeId, treeNode, clickFlag) {
                var zTree = $.fn.zTree.getZTreeObj("gylZtree");
                $("#msg").text("")
                zTree.checkNode(treeNode, !treeNode.checked, true);
            },
            onCheck:function (e, treeId, treeNode) {
                var zTree = $.fn.zTree.getZTreeObj("gylZtree");
                var nodes = new Array();
                nodes = zTree.getCheckedNodes(true);		//取得选中的结点
                if(nodes.length==0){
                    //$("#msg").text("未选择权限")
                }else {
                    $("#msg").text("")
                }
            }
        }
    }
    $.roleAddApp = {
        init:function(){

            this.queryRoleTypeList();

            BUI.use(['bui/form','bui/tooltip'],function(Form, Tooltip){
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();

                var tip = new Tooltip.Tip({
                    align:{
                        node : '#save_btn'
                    },
                    alignType : 'top-left',
                    offset : 10,
                    triggerEvent : 'click',
                    autoHideType:'click',
                    title : '',
                    elCls : 'tips tips-warning',
                    titleTpl : '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>\
                                <div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                });
                
                $("#save_btn").on("click",function(){
                    if ($.roleAddApp.submitCheckedNodes(form)==false){
                        return false;
                    }
                	var formData = form.serializeToObject();
                	if(form.isValid()){
	                       $.roleAddApp.save(formData, tip);
                    }
                });

                $("#name").on("blur",function(){
                    var name = $("#name").val();
                    if(name == ""){
                        return false;
                    }
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl + "accredit/role";
                    aContent.data = {"name":name};
                    aContent.success = function(result,textStatus){
                        if(result.appcode != 1){
                             BUI.Message.Alert(result.databuffer,'warning');
                        }else{
                            if("" != result.result && null != result.result){
                                BUI.Message.Alert("该角色名称已经存在,请用其他名称！","warning");
                                $("#name").val("");
                            }
                        }
                    };
                    $.ajax(aContent);
                });

                $("#roleType").on("change",function () {
                    $.roleAddApp.roleTypeChange();
                });

                $("#btn_list").on("click",function(){
                    window.location.href = "roleList.html";
                	//window.history.go(-1);
                });

            });
        },

        /**
         * 角色类型更改
         */
        roleTypeChange:function () {
            var val=$("#roleType").val();
            if(val==""){
                $("#msg").text("");
                $("#gylZtree").prop("hidden",true);
                return;
            }
            if(val=="wholeJurisdiction"){//全局角色
                $("#msg").text("");
                $("#gylZtree").prop("hidden",false);
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + "accredit/jurisdictionWholeModule";//
                aContent.data = {};
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                         BUI.Message.Alert(result.databuffer,'warning');
                    }else{
                        $.fn.zTree.init($("#gylZtree"),setting , result.result);
                        var zTreeObj = $.fn.zTree.getZTreeObj("gylZtree");
                        zTreeObj.expandAll(true);		//展开所有树节点
                    }
                };
                $.ajax(aContent);
                return;
            }
            if(val=="channelJurisdiction"){//渠道角色
                $("#msg").text("");
                $("#gylZtree").prop("hidden",false);
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + "accredit/jurisdictionChannelModule";//
                aContent.data = {};
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                         BUI.Message.Alert(result.databuffer,'warning');
                    }else{
                        $.fn.zTree.init($("#gylZtree"),setting , result.result);
                        var zTreeObj = $.fn.zTree.getZTreeObj("gylZtree");
                        zTreeObj.expandAll(true);		//展开所有树节点
                    }
                };
                $.ajax(aContent);
                return;
            }
        },
        /***
         * 查询角色类型列表
         */
        queryRoleTypeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/roleType";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('roleType', result.result,'value','name','请选择');
                }
            };
            $.ajax(aContent);
        },
        /***
         * 保存角色
         * @param fromData
         */
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/role";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.beforeSend = function () {
                return $.showLoadMask();
            };
            aContent.success = function(result,textStatus){            
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "roleList.html";
                	//window.history.go(-1);
                }
            };
            $.ajax(aContent);
        },

        //获取到所以用户选中的节点id值
        //获取所有选择的节点，提交时调用下面函数
        submitCheckedNodes : function(form) {
        var nodes = new Array();
        var zTreeObj = $.fn.zTree.getZTreeObj("gylZtree");
        if(zTreeObj==null){
            form.isValid();
            return false;
        }
        nodes = zTreeObj.getCheckedNodes(true);		//取得选中的结点
        if(nodes.length<=0){
            $("#msg").text("未选择权限");
            return false;
        }
        var str = "";
        for (i = 0; i < nodes.length; i++) {
            if((""+nodes[i].id).length==5){
                if (str != "") {
                    str += ",";
                }
                str += nodes[i].id;
            }
        }
        $('#roleJurisdiction').val(str);		//将拼接完成的字符串放入隐藏域，这样就可以通过post提交
     }
    };
    $(document).ready(function(e) {
        $.roleAddApp.init();
    });
}(jQuery));
