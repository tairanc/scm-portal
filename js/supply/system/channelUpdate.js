/**
 * Created by sone on 2017/5/3.
 */
$(function () {

    $("span[class=logs-btn]").click(function () {
        $.showLogsDialog("logInfoPage?entityType=Channel&entityId=" + $.getUrlParam("id"));
    });

    var temp = "";//用于标记原始的name
    $.channelUpdateApp = {
        _isValid: "",
        init: function () {
            this.queryChannelList();
            var id = $.getUrlParam("id")

            $.channelUpdateApp.fileForm(id);

            BUI.use(['bui/form', 'bui/tooltip'], function (Form, Tooltip) {
                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();

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
                    form.valid();
                    if (form.isValid()){
                        var nameflag = false;
                        if(temp == $("#name").val()){
                            nameflag = true;
                        }
                        $.channelUpdateApp.checkChannel(false, function () {
                            obj = document.getElementsByName("sellChannel");
                            check_val = [];                                
                                for(k in obj){
                                    if(obj[k].checked)
                                    check_val.push(obj[k].value);
                                };
                                if(check_val.length==0){
                                    BUI.Message.Alert("请选择业务销售渠道！", "warning");
                                }else{
                                    var formData = form.serializeToObject();
                                    formData.sellChannel=check_val.join(",");
                                    $.channelUpdateApp.save(formData, tip); 
                                    }                                                        
                        },nameflag);
                    }
                });

                $("#name").on("blur", function () {
                    var name = $("#name").val();
                    if (temp == name) {
                        return;
                    }
                    if (name == "") {
                        return false;
                    }
                    form.valid();
                    if (form.isValid()){
                        $.channelUpdateApp.checkChannel(true);
                    }
                });
                $("#btn_list").on("click",function(){
                    window.location.href = "channelList.html";
                });


            });
        },
        /**
         *渠道名称校验
         */
        checkChannel: function (isShowAlert, successFun,nameflag) {
            var name = $("#name").val()
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/channel";
            aContent.data = {"name": name};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    if ("" != result.result && null != result.result) {
                        if (isShowAlert) {
                            BUI.Message.Alert("该渠道名称已经存在,请用其他名称！", "warning");
                        }
                        if(nameflag) {
                            successFun()
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
         * @param id zhujianID
         */
        fileForm: function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/channelInSellChannel/" + id;
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert("查询渠道失败", "warning");
                } else {
                    var channelDtl = result.result;
                    var sellChannelList=channelDtl.sellChannelList;
                    for(var i=0;i<sellChannelList.length;i++){
                        var sellCode= sellChannelList[i].sellCode;
                        $("input[value=" + sellCode + "]").prop("checked",true);
                    }
                    $("#id").val(channelDtl.id);
                    $("#code").val(channelDtl.code);
                    $("#name").val(channelDtl.name);
                    temp = channelDtl.name;
                    $("#remark").val(channelDtl.remark);
                    $.channelUpdateApp._isValid = channelDtl.isValid;

                }
            };
            $.ajax(aContent);
        },
        /*查询业务线所有的销售渠道*/
        queryChannelList: function(){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"system/channelList";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var channelValue = result.result;
                    for(var i=0;i<channelValue.length;i++){
                        var html='<input type="checkbox" name ="sellChannel" value="'+channelValue[i].sellCode+'"/><label style="margin-right:15px;">'+channelValue[i].sellName+'</label>';
                        $("#channelList").append(html);
                    }
                }
            };
            $.ajax(aContent);
        },
        /***
         * 保存渠道
         * @param fromData
         */
        save: function (fromData, tip) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/channel/" + fromData['id'];
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href = "channelList.html";
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function (e) {
        $.channelUpdateApp.init();
    });
    //页面完全加载完成后设置单选框默认选中
    window.onload = function () {
        $.setRadioChecked('isValid', $.channelUpdateApp._isValid);
    }
}(jQuery));
