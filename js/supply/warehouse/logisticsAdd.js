/**
 * Created by sone on 2017/5/2.
 */
$(function () {
    $.logisticsAddApp = {
        allRole: null,

        init: function () {
            $("#channelTypeDiv").hide();

            this.queryUserTypeList();
            BUI.use(['bui/form','bui/grid','bui/data', 'bui/tooltip'], function (Form, Grid,Data,Tooltip) {
                var columns = [
                    {title: '主键', dataIndex: 'id', width: '1%', visible: false},
                    {title : '所属业务线',dataIndex :'nameValue', width:300,elCls : 'center',renderer:function(val, obj){
                        return "<input  type='checkbox' value='"+JSON.stringify({channelCode: obj.code, channelName: obj.name})+"' name='ck-"+val.channelCode+"' />" + val.channelName
                    }},
                    {title : '所属业务销售渠道',dataIndex :'sellChannelList', width:250,elCls : 'left',renderer:function(val, obj){
                        var str ="";
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                str+="<input  type='checkbox' value='"+JSON.stringify({sellChannelCode: val[i].sellCode, sellChannelName: val[i].sellName})+"' name='ck-"+obj.code+"[]'/>"+ "<span style='margin-right:15px;'>" +val[i].sellName +"</span>";
                            }
                            return str;
                        }  
                    }}
                ];
                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();
                var Grid = Grid,
                    Store = Data.Store;
                var store = new Store({
                    url : $.scmServerUrl + "accredit/select/channel",
                    autoLoad:true,
                    proxy : {
                        method : 'get',
                        dataType : 'json'//返回数据的类型
                    },
                    root:'result',
                    params: {}                   
                }),
                grid = new Grid.Grid({
                    render:'#grid',
                    columns : columns,
                    store: store,
                    width:'100%',
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>'
                });
                grid.render();
                var tip = new Tooltip.Tip({
                    align: {
                        node: '#save_btn'
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
                $("#save_btn").on("click", function () {                    
                    var formData = form.serializeToObject();    // 表格数据
                    var channelMsg = []; // 最终的提交数组
                    var channelMsgMap = {}; // 关联业务线与渠道选择
                    var map;
                     // 关联数据
                    for(var key in formData){
                        if(formData.hasOwnProperty(key) && key.indexOf('ck-') === 0) {
                            var yewuCode = '' // 业务线code

                            if(key.indexOf('[]') > 0) {  // 如果是渠道数组
                                yewuCode = key.replace(/ck\-|\[\]/g, '') // 获取业务线code
                                if(yewuCode){
                                    // 如果没有业务, 先初始化业务对象
                                    if(!channelMsgMap[yewuCode]){ 
                                        channelMsgMap[yewuCode] = {} 
                                    }
                                    if(!channelMsgMap[yewuCode].sellChannelList) {
                                        channelMsgMap[yewuCode].sellChannelList = []
                                    }; 
                                    if(typeof formData[key] === 'string') {
                                        channelMsgMap[yewuCode].sellChannelList.push(JSON.parse(formData[key]))
                                    } else {
                                        // 循环解析 JSON 字符串成对象
                                        for(var i = 0, list =  formData[key], len = formData[key].length; i < len; i++) {
                                            channelMsgMap[yewuCode].sellChannelList.push(JSON.parse(list[i]))
                                        }
                                    }
                                    
                                } 
                            } else { // 如果是业务对象
                                yewuCode = key.replace(/ck\-/g, '')
                                if(yewuCode) {
                                    channelMsgMap[yewuCode] = JSON.parse(formData[key]) 
                                }
                            }
                            delete formData[key];
                        }
                    }
                    // 解析
                    for(var key in channelMsgMap) {
                        if(channelMsgMap.hasOwnProperty(key)) {
                            channelMsg.push(channelMsgMap[key]);
                        }
                    }
                    formData.channelMsg = JSON.stringify(channelMsg);                    
                    if (formData.userType == "") {
                        BUI.Message.Alert("请选择用户","warning");

                    }
                    else if (formData.userType != "overallUser" && formData.channelCode == "") {
                        BUI.Message.Alert("请选择渠道","warning");

                    } else {
                        console.log(formData)
                        // if (form.isValid()) {
                        //     if ($("input[name='roleNames']:checked").length == 0) {
                        //         BUI.Message.Alert("至少选择一个角色","warning");
                        //     } else {
                        //         formData['roleNames'] = formData.roleNames.toString()
                        //         $.logisticsAddApp.save(formData, tip);
                        //     }
                        // }
                    }
                });

                $("#save_btnss").on("click", function () {                    
                    var formData = form.serializeToObject();    // 表格数据
                    var channelMsg = []; // 最终的提交数组
                    var channelMsgMap = {}; // 关联业务线与渠道选择
                    var map;
                     // 关联数据
                    for(var key in formData){
                        if(formData.hasOwnProperty(key) && key.indexOf('ck-') === 0) {
                            var yewuCode = '' // 业务线code

                            if(key.indexOf('[]') > 0) {  // 如果是渠道数组
                                yewuCode = key.replace(/ck\-|\[\]/g, '') // 获取业务线code
                                if(yewuCode){
                                    // 如果没有业务, 先初始化业务对象
                                    if(!channelMsgMap[yewuCode]){ 
                                        channelMsgMap[yewuCode] = {} 
                                    }
                                    if(!channelMsgMap[yewuCode].sellChannelList) {
                                        channelMsgMap[yewuCode].sellChannelList = []
                                    }; 
                                    if(typeof formData[key] === 'string') {
                                        channelMsgMap[yewuCode].sellChannelList.push(JSON.parse(formData[key]))
                                    } else {
                                        // 循环解析 JSON 字符串成对象
                                        for(var i = 0, list =  formData[key], len = formData[key].length; i < len; i++) {
                                            channelMsgMap[yewuCode].sellChannelList.push(JSON.parse(list[i]))
                                        }
                                    }
                                    
                                } 
                            } else { // 如果是业务对象
                                yewuCode = key.replace(/ck\-/g, '')
                                if(yewuCode) {
                                    channelMsgMap[yewuCode] = JSON.parse(formData[key]) 
                                }
                            }
                            delete formData[key];
                        }
                    }
                    // 解析
                    for(var key in channelMsgMap) {
                        if(channelMsgMap.hasOwnProperty(key)) {
                            channelMsg.push(channelMsgMap[key]);
                        }
                    }
                    formData.channelMsg = JSON.stringify(channelMsg);                    
                    if (formData.userType == "") {
                        BUI.Message.Alert("请选择用户","warning");

                    }
                    else if (formData.userType != "overallUser" && formData.channelCode == "") {
                        BUI.Message.Alert("请选择渠道","warning");

                    } else {

                        if (form.isValid()) {
                            if ($("input[name='roleNames']:checked").length == 0) {
                                BUI.Message.Alert("至少选择一个角色","warning");
                            } else {
                                formData['roleNames'] = formData.roleNames.toString()
                                $.logisticsAddApp.save(formData, tip);
                                // console.log(formData);
                            }
                        }
                    }
                });

                //用户名称是否存在验证
                /* $("#name").on("blur", function () {
                 var name = $("#name").val();
                 if (name == "") {
                 return false;
                 }
                 var aContent = $.AjaxContent();
                 aContent.url = $.scmServerUrl + "accredit/check";
                 aContent.data = {"name": name};
                 aContent.success = function (result, textStatus) {
                 if (result.appcode != 1) {
                  BUI.Message.Alert(result.databuffer,'warning');
                 } else {
                 if ("查询授权用户已存在"== result.result) {
                 BUI.Message.Alert("该用户名称已经存在,请用其他名称！");
                 $("#name").val("");
                 }
                 }
                 };
                 $.ajax(aContent);
                 });*/
                //手机号校验
                $("#phone").on("blur", function () {
                    var phone = $("#phone").val();
                    if (phone == "") {
                        return false;
                    }
                    if (!$("#phone").val().match(/^1[3|4|5|7|8][0-9]\d{4,8}$/)) {
                        // $("#phone").focus();
                        return false;
                    }
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl + "accredit/checkPhone";
                    aContent.data = {"phone": phone};
                    aContent.success = function (result, textStatus) {
                        if (result.appcode != 1) {
                             BUI.Message.Alert(result.databuffer,'warning');
                        } else {
                            if ("" != result.result && null != result.result) {
                                BUI.Message.Alert(result.result,"warning");
                                $("#phone").val("");
                            }
                        }
                    };
                    $.ajax(aContent);
                });

                $("#userType").on("change", function () {
                    $.logisticsAddApp.roleTypeChange();
                });

                $("#btn_list").on("click", function () {
                    window.location.href = "logisticsList.html";
                    //window.history.go(-1);
                });

            });
        },

        /**
         * 用户类型更改
         */
        roleTypeChange: function () {

            var val = $("#userType").val();

            switch (val) {
                case "" :
                    $("#selectRole").empty();
                    $("#channelTypeDiv").hide();
                    $("#selectRole").append("<b>请先选择用户类型</b>");
                    break;
                case "mixtureUser" :
                    //混合用户
                    $("#channelTypeDiv").show()
                    $.logisticsAddApp.queryRoleList("");
                    break;
                case  "overallUser" :
                    $("#channelTypeDiv").hide();
                    $.logisticsAddApp.queryRoleList("wholeJurisdiction");
                    //全局用户
                    break;
                case "channelUser":
                    //渠道用户
                    $("#channelTypeDiv").show()
                    $.logisticsAddApp.queryRoleList("channelJurisdiction");
                    break;
            }
        },

        /***
         * 查询用户类型列表
         */
        queryUserTypeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/userType";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem2('userType', result.result, 'value', 'name', '请选择');
                }
            };
            $.ajax(aContent);
        },

        /***
         * 保存角色
         * @param fromData
         */
        save: function (fromData, tip) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/saveaccredit";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title', result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    window.location.href = "logisticsList.html";
                    // console.log(result.databuffer);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询对应的角色
         */
        queryRoleList: function (roleType) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/rolelist/";
            aContent.data = {"roleType": roleType};
            aContent.type = "GET";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title', result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    var allRole = result.result;
                    $("#selectRole").empty();
                    if (roleType == "") {
                        //混合用户：将渠道和全局用户分类
                        $("#selectRole").append("<div style='margin: 10px 0'>渠道用户：</div>");
                        $.logisticsAddApp.forRole(allRole, "channelJurisdiction");
                        $("#selectRole").append("<div style='margin: 10px 0'>全局用户：</div>");
                        $.logisticsAddApp.forRole(allRole, "wholeJurisdiction");
                    } else {
                        $("#selectRole").append("</br>");
                        $.logisticsAddApp.forRole(allRole, roleType);
                    }

                }
            };
            $.ajax(aContent);
        },
        forRole: function (allRole, roleType) {
            //遍历添加角色选择框
            var childSize = 0;
            for (var i = 0; i < allRole.length; i++) {
                if (allRole[i].roleType == roleType) {
                    $("#selectRole").append("<label class='checkbox' style='display:inline-block;min-width: 155px;line-height:35px;'>" +
                        "<input name='roleNames' type='checkbox' style='font-size: small' value=" + allRole[i].id + ">" + allRole[i].name+"" + "</label>");
                    childSize++;
                    if (childSize % 5 == 0) {
                        //设置每一行的复选框数量
                        $("#selectRole").append("</br>")
                    }
                }
            }
        },

    };
    $(document).ready(function (e) {
        $.logisticsAddApp.init();
    });
}(jQuery));
