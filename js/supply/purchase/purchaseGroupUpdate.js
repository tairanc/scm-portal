/**
 * Created by sone on 2017/5/22.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=PurchaseGroup&entityId=" + $.getUrlParam("id"));
    });

    $(document).ready(function(e) {
        queryBuyer();
    });

    var leaderId="";
    var memberIds="";
    var temp="";//用于标记原始的name
    /**
     * 查询采购的人员
     */
    function queryBuyer() {
        var aContent = $.AjaxContent();
        aContent.url = $.scmServerUrl + "purchase/purchaseGroupUserNew";//查询采购的员工的地址
        aContent.data = {};
        aContent.success = function(result,textStatus){
            if(result.appcode != 1){
                 BUI.Message.Alert(result.databuffer,'warning');
            }else{
                //显示表格里面的tbody
                var  resultList =  result.result;
                var appContext="";
                for(var i=0;i<resultList.length;i++){
                    var context="<tr>"+
                        "<td style='width: 100px' id="+resultList[i].id+">"+resultList[i].name+"</td>"+
                        "<td style='width: 100px'>"+"<input type='checkbox' name='ZuYuan' id="+resultList[i].id+'C'+"  value="+resultList[i].id+">"+"</td>"+
                        "<td style='width: 100px'>"+"<input type='radio' name='ZuZhang' id="+resultList[i].id+'R'+" onclick=' $.purchaseGroupUpdateApp.test(this.id.substring(0,this.id.length-1))' value="+resultList[i].id+">"+"</td>"+
                        "</tr>";

                    appContext=appContext+context;
                }
                $("#J_Tbody").html(appContext);
            }
            $.purchaseGroupUpdateApp.init();
        };
        $.ajax(aContent);
    };


    $.purchaseGroupUpdateApp = {
        _isValid : "",
        init:function(){

            var id = $.getUrlParam("id")

            $.purchaseGroupUpdateApp.queryUsersIsValid(id);

            $.purchaseGroupUpdateApp.fileForm(id);
            BUI.use(['bui/form','bui/tooltip','bui/overlay','bui/mask','bui/data','bui/grid'],function(Form, Tooltip,Overlay,Data,Grid){
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

                    //$("input[type='radio']").attr("checked",true).val();
                    var radioVal =  $('input[name="ZuZhang"]').filter(':checked').val();
                    if(radioVal==null || radioVal==""){
                        $("#secendMsg").text('未选择组长')
                        return;
                    }
                    $('#leaderUserId').val(radioVal);//赋值组长的id
                    $('#leaderName').val($("#"+radioVal).text());//赋值组长的name

                    var memberUserIdTemp="";
                    var memberUserNameTemp="";
                   $('input:checkbox[name=ZuYuan]:checked').each(function(i){
                       if($(this).val()==radioVal){
                           return true;
                       }
                       memberUserIdTemp+=($(this).val()+",")
                       memberUserNameTemp+=($("#"+$(this).val()).text()+",");
                    });
                    var memberUserId=memberUserIdTemp.substring(0,memberUserIdTemp.length-1);
                    var memberUserName=memberUserNameTemp.substring(0,memberUserNameTemp.length-1)
                    $('#memberUserId').val(memberUserId);
                    $('#memberName').val(memberUserName);//赋值组员的信息

                    form.valid();
                    if (form.isValid()){
                        var nameflag = false;
                        if(temp == $("#name").val()){
                            nameflag = true;
                        }
                        $.purchaseGroupUpdateApp.checkPurchaseGroup(false, function () {
                            var formData = form.serializeToObject();
                            $.purchaseGroupUpdateApp.save(formData, tip);
                        },nameflag);
                    }

                });

                $("#name").on("blur",function(){
                    var name = $("#name").val();
                    name = $.trimRight(name);
                    if(name == "" || name==temp){
                        return false;
                    }
                    $.purchaseGroupUpdateApp.checkPurchaseGroup(true);
                });


                $("#btn_list").on("click",function(){
                    window.location.href = "purchaseGroupList.html";
                	//window.history.go(-1);
                });

                var formgrid = new Form.HForm({
                    srcNode: '#J_Form_add_grid',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });

                formgrid.render();

                var columns = [
                    {
                        title: '<font style="color: red" class="certCls">*</font>姓名',
                        dataIndex: 'name',
                        width: '45%',elCls: 'center',
                        editor: {xtype: 'text', rules: {required: true, maxlength: 10}}
                    },
                    {
                        title: '<font style="color: red" class="certCls">*</font>手机号',
                        dataIndex: 'phoneNumber',
                        width: '45%',elCls: 'center',
                        editor: {xtype: 'text', rules: {required: true, maxlength: 11,mobile:0}}
                    },
                    // {title: '删除', width: '15%', elCls: 'center',renderer:function(value){
                    //     return  '<span>X</span>';
                    // }},
                    {hasTools: true, moveUpFlag: false, moveDownFlag: false, delFlag: true,elCls: 'center',width: '15%', userStyle:true,}
                ];
                var Grid = Grid,
                    Store = Data.Store;

                var textTable = new DynamicGrid(columns);
                var textDataConfig = {
                    gridId: "add_grid",
                    // sortName: "sort",
                    showRowNumber:true,
                    oldDateNotEdit: true,
                    dataUrl: $.scmServerUrl + "purchase/purchaseGroupUserNew"
                };
                textTable.initDataAjax({}, textDataConfig);

                $("#add_more_btn").on('click', function () {
                        textTable.addRow();
                });

                //提示窗
                $.purchaseGroupUpdateApp.tip = new Tooltip.Tip({
                    align: {
                        node: '#edit_btn'
                    },
                    alignType: 'top-left',
                    offset: 10,
                    triggerEvent: 'click',
                    autoHideType: 'click',
                    title: '',
                    elCls: 'tips tips-warning',
                    titleTpl: '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>\
                                <div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                });
                


                //页面弹出层
                $.purchaseGroupUpdateApp.dialog = new Overlay.Dialog({
                    title: "采购组员维护",
                    width: 600,
                    height: 400,
                    mask: true,
                    contentId: 'add_content',
                    buttons: [
                        {
                            text: '保存',
                            id:"save",
                            elCls: 'button button-primary save',
                            handler: function () {
                                var records = [];
                                records = textTable.getData();
                                var truelength = 0 ;
                                for (var i = 0; i < records.length; i++) {
                                    if (records[i].status && records[i].status === 1) {
                                        if (!records[i]['name'] || records[i]['name'].length > 10) {
                                            BUI.Message.Alert("名称输入有误!",'warning');
                                            truelength ++ ;
                                        }else if (!records[i]['phoneNumber'] || records[i]['phoneNumber'].length !== 11 ) {
                                            BUI.Message.Alert("手机格式不正确!",'warning');
                                            truelength ++ ;
                                        }
                                    }
                                }
                                if (truelength == 0) {
                                    // console.log("true")
                                    var formData = {
                                        "gridValue":JSON.stringify(records)
                                    }
                                    $.purchaseGroupUpdateApp.savechild(formData, tip);
                                    // queryBuyer();
                                    var ids = $.getUrlParam("id")
                                    window.location.href = "purchaseGroupUpdate.html?id="+ids+"&groupName="+escape($("#name").val());
                                }
                            }
                        }, {
                            text: '取消',
                            elCls: 'button button-primary',
                            handler: function () {
                                // $.classify.form.clearErrors();
                                this.close();
                            }
                        }
                    ],

                });
                //新增按钮
                $("#edit_btn").on("click",function(){
                    $.purchaseGroupUpdateApp.editFlag = false;
                    $.purchaseGroupUpdateApp.dialog.render();
                    $.purchaseGroupUpdateApp.dialog.show();
                    //window.history.go(-1);
                });

            });
        },

        queryUsersIsValid:function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/purchaseGroupUser/"+id;//根据采购组的id，查询已经被使用的采购组员的状态
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var  resultL =  result.result;
                    if(resultL.length==0){
                        return;
                    }else{
                        var namsTemp = "";
                        for(var i=0;i<resultL.length;i++){
                            namsTemp+=(resultL[i].name+',')
                        }
                        var nams = namsTemp.substring(0,namsTemp.length-1);
                        BUI.Message.Alert(nams+'的授权已经被取消,如果进行编辑,将自动从该采购组移除','warning');
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         *采购组名称校验
         */
        checkPurchaseGroup : function (isShowAlert, successFun,nameflag) {
            var name = $("#name").val();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/purchaseGroup";
            aContent.data = {"name": name};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    if ("" != result.result && null != result.result) {
                        if (isShowAlert) {
                            BUI.Message.Alert("该采购组名称已经存在,请用其他名称！", "warning");
                        }
                        if(nameflag) {
                            successFun();
                        }
                        $("#name").val("");
                    }else {
                        if (successFun) {
                            successFun()
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
            aContent.url = $.scmServerUrl+"purchase/purchaseGroup/"+id;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert("查询采购组失败","warning");
                }else{
                    var purchaseDtl = result.result;
                    $("#id").val(purchaseDtl.id);
                    $("#code").val(purchaseDtl.code);
                    $("#name").val(purchaseDtl.name);
                    //初始化采购组名称
                if($.getUrlParam("groupName")&& $.getUrlParam("groupName")!=""){
                    $("#name").val(unescape($.getUrlParam("groupName")));
                }
                    temp=purchaseDtl.name


                    $("#remark").val(purchaseDtl.remark);
                    leaderId = purchaseDtl.leaderUserId;
                    memberIds=purchaseDtl.memberUserId;
                    // $.purchaseGroupUpdateApp._isValid = purchaseDtl.isValid;
                    $.setRadioChecked('isValid',purchaseDtl.isValid);
                    $.purchaseGroupUpdateApp.checkedAttr(leaderId,memberIds);
                }
            };
            $.ajax(aContent);

        },
        /**
         *组员表格的回显
         */
        checkedAttr:function (leaderId,memberIds) {
            $('input:checkbox[name=ZuYuan]').each(function(i){
                var arrayMemberIds = new Array();
                arrayMemberIds = memberIds.split(",");
                for (var i=0;i<arrayMemberIds.length;i++){
                    if($(this).val()==arrayMemberIds[i]){
                        $(this).attr('checked',true);
                    }
                }
            });
            $('input:radio[name=ZuZhang]').each(function(i){
                if($(this).val()==leaderId){
                    $(this).attr('checked',true);
                    var idr = $(this).attr('id')
                    var idc = idr.substring(0,idr.length-1)+'C'
                    $("#"+idc).attr('disabled',true);
                }
            });
        },
        /***
         * 修改采购组
         * @param fromData
         */
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/purchaseGroup/"+fromData['id'];
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "purchaseGroupList.html";
                	//window.history.go(-1);
                }
            };
            $.ajax(aContent);
        },
        /*
        *保存采购组组员信息
        */ 
        savechild:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/purchaseGroupUserNew";
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,function() {
                        window.location.reload();
                    },'error');
                }else{
                    // window.history.go(-1);
                    // $.purchaseGroupUpdateApp.editFlag = false;
                    // $.purchaseGroupUpdateApp.dialog.render();
                    $.purchaseGroupUpdateApp.dialog.hide();
                }
            };
            $.ajax(aContent);
        },
        test:function(aa) {
            $("#secendMsg").text('')
            $("#"+aa+'C').attr('checked',false);
            $('input:checkbox[name=ZuYuan]').each(function(i){
                $(this).attr('disabled',false);
            });
            $("#"+aa+'C').attr('disabled',true);
        }
    };
}(jQuery));
