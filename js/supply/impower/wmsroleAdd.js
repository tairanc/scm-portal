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
    $.wmsroleAddApp = {
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
                    if ($.wmsroleAddApp.submitCheckedNodes(form)==false){
                        return false;
                    }
                	var formData = form.serializeToObject();
                    if (formData.name == "") {
                        BUI.Message.Alert("名称不能为空！",'warning');
                        return
                    }else if (formData.phone == "") {
                        BUI.Message.Alert("手机号码不能为空！",'warning');
                        return 
                    }else if (formData.warehouseCode == "" || formData.warehouseCode.length < 1) {
                        BUI.Message.Alert("所属自营仓编码不能为空!",'warning');
                        return 
                    }
                	if(form.isValid()){
                        formData.isDeleted = 0;
	                       $.wmsroleAddApp.save(formData, tip);
                    }
                });

                $("#name").on("blur",function(){
                    var name = $("#name").val();
                    if(name == ""){
                        return false;
                    }
                    // var aContent = $.AjaxContent();
                    // aContent.url = $.scmServerUrl + "accredit/role";
                    // aContent.data = {"name":name};
                    // aContent.success = function(result,textStatus){
                    //     if(result.appcode != 1){
                    //          BUI.Message.Alert(result.databuffer,'warning');
                    //     }else{
                    //         if("" != result.result && null != result.result){
                    //             BUI.Message.Alert("该角色名称已经存在,请用其他名称！","warning");
                    //             $("#name").val("");
                    //         }
                    //     }
                    // };
                    // $.ajax(aContent);
                });

                //手机号校验
                $("#phone").on("blur", function () {

                    var phone = $("#phone").val();
                    if (phone == "") {
                        return false;
                    }
                    if (!$("#phone").val().match(/^1[3|4|5|7|8][0-9]\d{8}$/)) {
                        // $("#phone").focus();
                        return false;
                    }
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl + "aclWmsUser/aclWmsUserPhone";
                    aContent.data = {"phone": phone};
                    aContent.type = "POST";
                    aContent.success = function (result, textStatus) {
                        if (result.appcode != 1) {
                             BUI.Message.Alert(result.databuffer,'warning');
                        } else {
                            if (result.result!=1) {
                                BUI.Message.Alert(result.result,"warning");
                                $("#phone").val("");
                            }
                        }
                    };
                    $.ajax(aContent);
                });

                // $("#roleType").on("change",function () {
                //     $.wmsroleAddApp.roleTypeChange();
                // });

                $("#btn_list").on("click",function(){
                    window.location.href = "wmsroleList.html";
                	//window.history.go(-1);
                });

            });
        },

        /**
         * 角色类型更改
         */
        roleTypeChange:function (val) {
            // var val=$("#roleType").val();
            if(val==""){
                $("#msg").text("");
                $("#gylZtree").prop("hidden",true);
                return;
            }
                $("#msg").text("");
                $("#gylZtree").prop("hidden",false);
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + "aclWmsUser/aclWmsUserResource";//
                aContent.data = {};
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                         BUI.Message.Alert(result.databuffer,'warning');
                    }else{
                        $.each(result.result,function(index, el) {
                            if(el.check)
                            {
                                el.checked=true;
                            }
                            el.pId=el.parentId;
                            el.id=el.code;
                        });
                        $.fn.zTree.init($("#gylZtree"),setting , result.result);
                        var zTreeObj = $.fn.zTree.getZTreeObj("gylZtree");
                        zTreeObj.expandAll(true);		//展开所有树节点
                    }
                };
                $.ajax(aContent);
                return;
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
        queryWmsList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"aclWmsUser/aclWmsUserWarehouse";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var allRole = result.result;
                        $("#warehouseCodeDiv").empty();
                        $.wmsroleAddApp.forRole(allRole, '');
                }
            };
            $.ajax(aContent);
        },
        forRole: function (allRole, roleType) {
            //遍历添加角色选择框
            var childSize = 0;
            for (var i = 0; i < allRole.length; i++) {
                // if (allRole[i].roleType == roleType) {
                    $("#warehouseCodeDiv").append("<label class='checkbox' style='display:inline-block;min-width: 155px;line-height:35px;'>" +
                        "<input type='checkbox' style='font-size: small' value=" + allRole[i].code + ">" + allRole[i].warehouseName+"" + "</label>");
                    childSize++;
                    if (childSize % 5 == 0) {
                        //设置每一行的复选框数量
                        $("#warehouseCodeDiv").append("</br>")
                    }
                // }
            }
        },
        /***
         * 保存角色
         * @param fromData
         */
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "aclWmsUser/aclWmsUserSave";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){            
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "wmsroleList.html";
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
        // console.log(nodes)
        var str = "";
        for (i = 0; i < nodes.length; i++) {
            // if((""+nodes[i].id).length==5){
                if (str != "") {
                    str += ",";
                }
                str += nodes[i].code;
            // }
        }
        $('#resourceCode').val(str);		//将拼接完成的字符串放入隐藏域，这样就可以通过post提交
        //自营仓
        var wc_str="";
        $("#warehouseCodeDiv input:checkbox:checked").each(function(index, el) {
            if (wc_str != "") {
                    wc_str += ",";
            }
            wc_str+=$(el).val();
        });
        $('#warehouseCode').val(wc_str);
     }
    };
    $(document).ready(function(e) {
        $.wmsroleAddApp.init();
        $.wmsroleAddApp.roleTypeChange("wholeJurisdiction");
        $.wmsroleAddApp.queryWmsList();
    });
}(jQuery));
