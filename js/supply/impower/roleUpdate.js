/**
 * Created by sone on 2017/5/16.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=AclRole&entityId=" + $.getUrlParam("id"));
    });

    var temp="";//标记名称，用于校验

    var roleType="";
    var roleId="";

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
                    $("#msg").text("");
                }
            }
        }
    }
    $.roleUpdateApp = {
        _isValid : "",
        init:function(){

            this.queryRoleTypeList();
            var id = $.getUrlParam("id")
            $.roleUpdateApp.fileForm(id);

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

                    $("#name").prop('disabled',false);
                    $('#roleType').prop('disabled',false);
                    $("#isValid").prop('disabled',false);
                    $("#isValid2").prop('disabled',false);

                    if ($.roleUpdateApp.submitCheckedNodes(form)==false){
                        return false;
                    }
                    var formData = form.serializeToObject();
                    if(form.isValid()){
                        $.roleUpdateApp.save(formData, tip);
                    }
                });

                $("#isValid").on("click", function () {
                   // 0 1
                    if($.roleUpdateApp._isValid!=$("#isValid").val()){
                        $.roleUpdateApp.checkUserNum(id,$("#isValid").val())
                    }
                });
                $("#isValid2").on("click", function () {
                    if($.roleUpdateApp._isValid!=$("#isValid2").val()){
                        $.roleUpdateApp.checkUserNum(id,$("#isValid2").val())
                    }
                });

                $("#name").on("blur",function(){

                    var name = $("#name").val();
                    if(temp==name){
                        return;
                    }
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
                    $.roleUpdateApp.roleTypeChange();
                });

                $("#btn_list").on("click",function(){
                    window.location.href = "roleList.html";
                    //window.history.go(-1);
                });

            });
        },
        checkUserNum:function (id,isValid) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"accredit/roleAccreditInfo";
            aContent.data = {roleId: id};//角色id去查询用户数量
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    if(isValid=='0'){
                        if (result.result != 0) {
                            var msg = '<label style="color:red;">当前有' + result.result + '个用户正在使用该角色，停用后这些用户对应的权限也将失效！</label>';
                            BUI.Message.Show({
                                msg: msg,
                                icon: 'warning',
                                buttons: [
                                    {
                                        text: '确定',
                                        elCls: 'button button-primary',
                                        handler: function () {
                                            this.close();
                                        }
                                    }/*,{
                                        text: '取消',
                                        elCls: 'button ',
                                        handler: function () {
                                            this.close();
                                        }
                                    }*/
                                ],
                                cancel: function () {
                                    // TODO 取消操作
                                }
                            });
                           // BUI.Message.Confirm(msg,'question');

                        }
                    }
                    if(isValid=='1'){
                        if (result.result != 0) {
                            var msg = '<label style="color:red;">当前有' + result.result + '个用户将要启用该角色，启用后这些用户对应的权限也将有效！</label>';
                            BUI.Message.Show({
                                msg: msg,
                                icon: 'warning',
                                buttons: [
                                    {
                                        text: '确定',
                                        elCls: 'button button-primary',
                                        handler: function () {
                                            this.close();
                                        }
                                    }/*,{
                                        text: '取消',
                                        elCls: 'button ',
                                        handler: function () {
                                            this.close();
                                        }
                                    }*/
                                ],
                                cancel: function () {
                                    // TODO 取消操作
                                }
                            });
                           //BUI.Message.Confirm(msg,'question');

                        }
                    }
                }
            };
            $.ajax(aContent);
        },
        /***
         * 填充表单
         * @param id 主键ID
         */
        fileForm:function (id) {

            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"accredit/role/"+id;  //根据id查询角色对象，并且获得关联的权限
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert("查询渠道失败","warning");
                }else{
                    var role = result.result;
                    if(role.name == '采购组员'){//是系统角色
                        $("#name").prop('disabled',true);
                        $('#roleType').prop('disabled',true);
                        //$("#selectRoleType").attr("readonly",true);
                        $("#isValid").prop('disabled',true);
                        $("#isValid2").prop('disabled',true);
                    }
                    $("#id").val(role.id);
                    $("#name").val(role.name);
                    temp = role.name;
                    $("#remark").val(role.remark);
                   // $("#roleType").val(role.roleType);
                    $("#roleType").attr("value",role.roleType);
                    $.roleUpdateApp.queryAccessList(role.roleType,role.id);
                    $.roleUpdateApp._isValid = role.isValid;
                    $.setRadioChecked('isValid', role.isValid);
                }
            };
            $.ajax(aContent);
        },
        /**
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
        /**
         * 回写授权列表
         * @param roleTyepe 用户类型
         */
        queryAccessList:function (roleTyepe,roleId) {
            if(roleTyepe=="wholeJurisdiction"){//全局角色
                //$("#msg").text("");
                $("#gylZtree").prop("hidden",false);
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + "accredit/jurisdictionWholeModule/"+roleId;
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
            if(roleTyepe=="channelJurisdiction"){//渠道角色
                //$("#msg").text("");
                $("#gylZtree").prop("hidden",false);
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + "accredit/jurisdictionChannelModule/"+roleId;
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
                aContent.url = $.scmServerUrl + "accredit/jurisdictionWholeModule";
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
                aContent.url = $.scmServerUrl + "accredit/jurisdictionChannelModule";
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
         * 修改角色
         * @param fromData
         */
        save:function(fromData, tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"accredit/role/"+fromData['id'];
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                	window.location.href = "roleList.html";
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
        $.roleUpdateApp.init();
    });
    //页面完全加载完成后设置单选框默认选中
    window.onload=function(){
        $.setRadioChecked('isValid', $.roleUpdateApp._isValid);
    }
}(jQuery));
