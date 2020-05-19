/**
 * Created by sone on 2017/5/2.
 */
$(function () {
    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=AclUserAccreditInfo&entityId=" + $.getUrlParam("id"));
    });
    $.userAccreditInfoUpdateApp = {
        allRole: null,
        roleType: null,
        roleArray: null,
        userDate: null,
        purchaseRole: new Object(),
        // oldName:null,
        init: function () {
            //获取form表单值并且填充表单数据
            var id = $.getUrlParam("id")
            $.userAccreditInfoUpdateApp.queryIsValid(id);

            $("#channelTypeDiv").hide();
            this.queryUserTypeList();
            BUI.use(['bui/form', 'bui/grid','bui/data','bui/tooltip'], function (Form, Grid,Data,Tooltip) {
                var columns = [
                    {title: '主键', dataIndex: 'id', width: '1%', visible: false},
                    {title : '所属业务线',dataIndex :'nameValue', width:300,elCls : 'center',renderer:function(val, obj){
                        return "<input  type='checkbox' value='"+JSON.stringify({channelCode: obj.code, channelName: obj.name})+"' name='ck-"+val.channelCode+"' />" + val.channelName
                    }},
                    {title : '所属业务销售渠道',dataIndex :'sellChannelList', width:250,elCls : 'left',renderer:function(val, obj){
                        var str ="";
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                str+="<input  type='checkbox' sellChannelCode='"+val[i].sellCode+"' value='"+JSON.stringify({sellChannelCode: val[i].sellCode, sellChannelName: val[i].sellName})+"' name='ck-"+obj.code+"[]'/>"+ "<span style='margin-right:15px;'>" +val[i].sellName +"</span>";
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
                grid.on("aftershow", function() {
                    $.userAccreditInfoUpdateApp.fileForm(id);
                })
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
                                  
                    if (formData.userType != "overallUser" && formData.channelCode == "") {
                        BUI.Message.Alert("请选择渠道","warning");
                    } else {
                        if (form.isValid()) {
                            if ($("input[name='roleNames']:checked").length == 0) {
                                BUI.Message.Alert("至少选择一个角色","warning");
                            } else {
                                formData['roleNames'] = formData.roleNames.toString()
                                $.userAccreditInfoUpdateApp.updateUser(formData, tip);
                            }
                        }
                    }
                });

                /*   //用户名称是否存在验证
                 $("#name").on("blur", function () {
                 var name = $("#name").val();
                 var id = $.getUrlParam("id")
                 var aContent = $.AjaxContent();
                 aContent.url = $.scmServerUrl + "accredit/check/" + $.getUrlParam("id");
                 aContent.data = {"id": id, "name": name};
                 aContent.success = function (result, textStatus) {
                 if (result.appcode != 1) {
                  BUI.Message.Alert(result.databuffer,'warning');
                 } else {
                 if (result.result == "查询授权用户已存在") {
                 BUI.Message.Alert("该授权用户已经存在,请用其他名称！");
                 $("#name").val("");
                 }
                 }
                 };
                 $.ajax(aContent);
                 });*/


                $("#userType").on("change", function () {
                    /**
                     * 用户类型更改
                     */
                    var val = $("#userType").val();
                    // var purchaseRole = $.userAccreditInfoUpdateApp.purchaseRole;

                    var id = $.getUrlParam("id");
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl + "accredit/checkPurchase/" + id;
                    aContent.async = true;
                    // aContent.timeout = 200;
                    aContent.success = function (result, textStatus) {
                        if (result.appcode != 1) {
                            BUI.Message.Alert(result.databuffer,"warning");
                        } else {
                            if (result.result != null) {
                                if (val == 'overallUser') {                                
                                    BUI.Message.Alert("该用户还属于正在使用的【"+result.result+"】采购组中，请先将用户从采购组中移除！",function(){
                                        $.userAccreditInfoUpdateApp.fileForm(id);
                                    },'warning');
                                }
                                else {
                                    BUI.Message.Alert("采购组员已在采购组(" + result.result + ")中，采购组角色已自动勾选!","warning");
                                }
                            }

                        }
                    };
                    $.ajax(aContent);

                    switch (val) {
                        case "" :
                            $("#selectRole").empty();
                            $("#selectRole").append("<b>请先选择用户类型</b>");
                            break;
                        case "mixtureUser" :
                            //混合用户
                            $("#channelTypeDiv").show();
                            $.userAccreditInfoUpdateApp.queryRoleList("",val);
                            break;
                        case  "overallUser" :
                            $("#channelTypeDiv").hide();
                            $.userAccreditInfoUpdateApp.queryRoleList("wholeJurisdiction",val);
                            //全局用户
                            break;
                        case "channelUser":
                            //渠道用户
                            $("#channelTypeDiv").show();
                            $.userAccreditInfoUpdateApp.queryRoleList("channelJurisdiction",val);
                            break;
                    }

                });

                $("#btn_list").on("click", function () {
                    window.location.href = "userAccreditInfoList.html";
                    //window.history.go(-1);
                });

                // $('input[name="roleNames"]').on('change', function () {
                //     var purchaseRole = $.userAccreditInfoUpdateApp.purchaseRole;
                //     // console.log(purchaseRole);
                //     if (!$.isEmptyObject(purchaseRole)) {
                //         if ($(this).val() == purchaseRole.id) {
                //             // BUI.Message.Alert("采购组员已在采购组中无法取消!");
                //             // $("input:checkbox[value='" + purchaseRole.id + "']").attr('checked', 'true');
                //             //传到后台做校验
                //             $.userAccreditInfoUpdateApp.checkPurchase();
                //         }
                //     }
                // });
            });
        },
        /**
         *验证采购组员
         */
        checkPurchase: function () {
            var purchaseRole = $.userAccreditInfoUpdateApp.purchaseRole;
            var id = $.getUrlParam("id");
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/checkPurchase/" + id;
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,"warning");
                } else {
                    if (result.result != null) {
                        BUI.Message.Alert("采购组员已在采购组(" + result.result + ")中，请先将用户从采购组中移除！","warning");
                        $("input:checkbox[value='" + purchaseRole.id + "']").attr('checked', 'true');

                    }
                }
            }
            $.ajax(aContent);
        },
        /***
         * 查询用户类型列表
         */
        queryUserTypeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/userType";
            aContent.data = {};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,"warning");
                } else {
                    $.AddItem2('userType', result.result, 'value', 'name', '请选择');
                }
            };
            $.ajax(aContent);
        },

        /***
         * 修改user
         * @param fromData
         */
        updateUser: function (fromData, tip) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/updateaccredit/" + $.getUrlParam("id");
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title', result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    window.location.href = "userAccreditInfoList.html";
                }
            };
            $.ajax(aContent);
        },

        /**
         * 查询对应的角色
         */
        queryRoleList: function (roleType,val) {
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
                        $.userAccreditInfoUpdateApp.forRole(allRole, "channelJurisdiction");
                        $("#selectRole").append("<div style='margin: 10px 0'>全局用户：</div>");
                        $.userAccreditInfoUpdateApp.forRole(allRole, "wholeJurisdiction");
                    } else {
                        $.userAccreditInfoUpdateApp.forRole(allRole, roleType);
                    }
                    if (val != 'overallUser') {
                        $("input:checkbox[value='" + $.userAccreditInfoUpdateApp.purchaseRole.id + "']").attr('checked', 'true');
                    }
                    $('input[name="roleNames"]').on('change', function () {
                        var purchaseRole = $.userAccreditInfoUpdateApp.purchaseRole;
                        // console.log(purchaseRole);
                        if (!$.isEmptyObject(purchaseRole)) {
                            if ($(this).val() == purchaseRole.id) {
                                // BUI.Message.Alert("采购组员已在采购组中无法取消!");
                                // $("input:checkbox[value='" + purchaseRole.id + "']").attr('checked', 'true');
                                //传到后台做校验
                                $.userAccreditInfoUpdateApp.checkPurchase();
                            }
                        }
                    });

                }
            };
            $.ajax(aContent);
        },
        forRole: function (allRole, roleType) {
            //遍历添加角色选择框
            var childSize = 0;
            for (var i = 0; i < allRole.length; i++) {
                if (allRole[i].roleType == roleType) {
                    var html = "<label class='checkbox'  style='display:inline-block;min-width: 140px;line-height:35px;'>" +
                        "<input name='roleNames' type='checkbox'  value=" + allRole[i].id + ">" + allRole[i].name + "</label>" +
                        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

                    var _html = $(html);
                    $("#selectRole").append(_html);
                    childSize++;
                    if (childSize % 5 == 0) {
                        //设置每一行的复选框数量
                        $("#selectRole").append("</br>")
                    }
                }
            }
        },
        /***
         * 填充表单
         * @param id zhujianID
         */
        fileForm: function (id) {

            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/accreditInfo/" + id;
            aContent.data = {"id": id};
            aContent.success = function (result, textStatus) {
                var checkedBoxByName = function(name) {
                    $("input[name='"+name+"']").attr("checked", true)
                }

                var checkedBoxBySelector = function(selctor) {
                    $(selctor).attr("checked", true)
                }

                if (result.appcode != 1) {
                    BUI.Message.Alert("查询用户失败." +result.databuffer,"warning");

                } else {
                    var userDate = result.result;
                    var channelExtList = userDate.channelExtList
                    $("#name").val(userDate.name);
                    $("#phone").val(userDate.phone);
                    $("#remark").val(userDate.remark);
                    $("#userType").attr("value", userDate.userType);
                    $("input[name=isValid][value='"+(userDate.isValid)+"']").attr("checked",true);
                    // $.userAccreditInfoUpdateApp.oldName = userDate.name;
                    if (userDate.userType == "overallUser") {
                        $.userAccreditInfoUpdateApp.queryRoleListLoad("wholeJurisdiction", userDate.roleNames);
                    } else if (userDate.userType == "channelUser") {
                        $.userAccreditInfoUpdateApp.queryRoleListLoad("channelJurisdiction", userDate.roleNames);
                    } else {
                        $.userAccreditInfoUpdateApp.queryRoleListLoad("", userDate.roleNames);
                    }

                    if (userDate.userType != "overallUser") {
                        $("#channelTypeDiv").show();
                        $("#channelCode").attr("value", userDate.channelCode);

                     }

                    //所属业务线及销售渠道：
                    for(var i = 0, len = channelExtList.length; i < len; i++) {
                        var channel = channelExtList[i];
                        var sellChannelList = channel.sellChannelList
                        checkedBoxByName('ck-'+channel.code);
                        if(sellChannelList && sellChannelList.length > 0) {
                            for(var j = 0, len2 = sellChannelList.length; j < len2; j++) {
                                checkedBoxBySelector("input[name='ck-"+channel.code+"[]'][sellchannelcode='"+sellChannelList[j].sellCode+"']")
                            }
                        }
                    }
                }
            };
            $.ajax(aContent);
        },


        /**
         * 编辑时回写
         */
        queryRoleListLoad: function (roleType, roleIds) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/rolelist/";
            aContent.data = {"roleType": roleType};
            aContent.type = "GET";
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title', result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    var roleArray = roleIds;
                    roleArray = roleArray.replace("[", "");
                    roleArray = roleArray.replace("]", "");
                    // if (roleArray.indexOf(",") > 0) {
                    roleArray = roleArray.split(',');
                    // }
                    var allRole = result.result;
                    $("#selectRole").empty();
                    if (roleType == "") {
                        //混合用户：将渠道和全局用户分类
                        $("#selectRole").append("<div style='margin: 10px 0'>渠道用户：</div>");
                        $.userAccreditInfoUpdateApp.forRoleLoad(allRole, "channelJurisdiction", roleArray);
                        $("#selectRole").append("<div style='margin: 10px 0'>全局用户：</div>");
                        $.userAccreditInfoUpdateApp.forRoleLoad(allRole, "wholeJurisdiction", roleArray);
                    } else {
                        $("#selectRole").append("</br>");
                        $.userAccreditInfoUpdateApp.forRoleLoad(allRole, roleType, roleArray);
                    }
                    $('input[name="roleNames"]').on('change', function () {
                        var purchaseRole = $.userAccreditInfoUpdateApp.purchaseRole;
                        // console.log(purchaseRole);
                        if (!$.isEmptyObject(purchaseRole)) {
                            if ($(this).val() == purchaseRole.id) {
                                // BUI.Message.Alert("采购组员已在采购组中无法取消!");
                                // $("input:checkbox[value='" + purchaseRole.id + "']").attr('checked', 'true');
                                //传到后台做校验
                                $.userAccreditInfoUpdateApp.checkPurchase();
                            }
                        }
                    });

                }
            };
            $.ajax(aContent);
        },
        forRoleLoad: function (allRole, roleType, roleArray) {
            //遍历添加角色选择框
            var childSize = 0;
            for (var i = 0; i < allRole.length; i++) {
                if (allRole[i].roleType == roleType) {
                    var html = "<label class='checkbox' style='display:inline-block;min-width: 140px;line-height:35px;'>" +
                        "<input name='roleNames' type='checkbox'  id='" + allRole[i].id + "' value=" + allRole[i].id + ">" + allRole[i].name + "</label>";
                    if (allRole[i].name == "采购组员") {
                        $.userAccreditInfoUpdateApp.purchaseRole['id'] = allRole[i].id;
                        $.userAccreditInfoUpdateApp.purchaseRole['name'] = allRole[i].name;
                    }
                    var _html = $(html);
                    $("#selectRole").append(_html);
                    childSize++;
                    if (childSize % 5 == 0) {
                        //设置每一行的复选框数量
                        $("#selectRole").append("</br>")
                    }
                }
                for (var j = 0; j < roleArray.length; j++) {
                    $("#" + roleArray[j]).attr("checked", true);
                }
            }
            /*for (var i = 0; i < allRole.length; i++) {
             if (allRole[i].roleType == roleType) {
             if (typeof roleArray != Array) {
             roleArray = [roleArray]
             }

             var html = "<label class='checkbox'>" +
             "<input name='roleNames' type='checkbox'  value=" + allRole[i].id + ">" + allRole[i].name + "</label>" +
             "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";

             var _html = $(html);
             $("#selectRole").append(_html);
             childSize++;
             if (childSize % 5 == 0) {
             //设置每一行的复选框数量
             $("#selectRole").append("</br>")
             }
             // for (var j = 0; j < roleArray.length; j++) {
             //     if (allRole[i].roleType == roleType) {
             //         var html = "<label class='checkbox'>" +
             //             "<input name='roleNames' type='checkbox'  value=" + allRole[i].id + ">" + allRole[i].name + "</label>" +
             //             "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
             //
             //         var _html = $(html);
             //         $("#selectRole").append(_html);
             //         childSize++;
             //         if (childSize % 5 == 0) {
             //             //设置每一行的复选框数量
             //             $("#selectRole").append("</br>")
             //         }
             //     }
             // }
             // $("#selectRole").append(_html);
             // childSize++;
             // if (childSize % 5 == 0) {
             //     //设置每一行的复选框数量
             //     $("#selectRole").append("</br>")
             // }
             }
             }*/
        },
        //查询已关联角色启停状态
        queryIsValid: function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/rolevalid/" + id;
            aContent.data = {};
            aContent.type = "GET";
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title', result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    if (result.result != null) {
                        BUI.Message.Alert("该用户关联的角色(" + result.result + ")已被停用,将不再显示","warning");
                    }
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function (e) {
        $.userAccreditInfoUpdateApp.init();
    });
}(jQuery));
