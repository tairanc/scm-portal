/**
 * Created by sone on 2017/5/3.
 */
$(function () {

    $("span[class=logs-btn]").click(function () {
        $.showLogsDialog("logInfoPage?entityType=SellChannel&entityId=" + $.getUrlParam("id"));
    });

    var temp = "";//用于标记原始的name
    $.sellChannelUpdate = {
        _isValid: "",
        _storeId: "",//门店销售系统内门店ID
        init: function () {
            var id = $.getUrlParam("id");

            this.querySellType();

            $.sellChannelUpdate.fileForm(id);

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
                        if(temp == $("#sellName").val()){
                            nameflag = true;
                        };
                        $.sellChannelUpdate.checkChannel(false, function () {
                            var formData = form.serializeToObject();
                            formData.sellName = $.trim(formData.sellName);
                            $.sellChannelUpdate.save(formData, tip);                                                                
                        },nameflag);
                    }
                });

                $("#sellName").on("blur", function () {
                    var name = $.trim($("#sellName").val());
                    if (temp == name) {
                        return;
                    }
                    if (name == "") {
                        return false;
                    }
                    form.valid();
                    if (form.isValid()){
                        $.sellChannelUpdate.checkChannel(true);
                    }
                });
                $("#btn_list").on("click",function(){
                    window.location.href = "sellChannel.html";
                });

                $("#sellType").on("change",function(){
                    var val = $(this).val();
                    if(val == "2"){//门店
                        $("#storeId").val($.sellChannelUpdate._storeId);
                        $("#storeDiv").show();
                    }else{
                        $("#storeId").val("");
                        $("#storeDiv").hide();
                    }
                });


            });
        },
        /**
         *销售渠道名称校验
         */
        checkChannel: function (isShowAlert, successFun,nameflag) {
            var name = $.trim($("#sellName").val());
            var id = $.getUrlParam("id");
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/sellChannelName";
            aContent.data = {"name": name,"id":id};
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
                        $("#sellName").val("");
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
            aContent.url = $.scmServerUrl + "system/sellChannel/" + id;
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert("查询渠道失败", "warning");
                } else {
                    var channelDtl = result.result;
                    $("#id").val(channelDtl.id);
                    /*if(channelDtl.sellType==0){
                        $("#sellType option[value=0]").attr("selected",true);
                    }
                    if(channelDtl.sellType==1){
                        $("#sellType option[value=1]").attr("selected",true);
                    }*/
                    $.setSelectItem("sellType", channelDtl.sellType);
                    if(channelDtl.sellType == "2"){//门店
                        $.sellChannelUpdate._storeId = channelDtl.storeId;
                        $("#storeId").val(channelDtl.storeId);
                        $("#storeDiv").show();
                    }
                    $("#sellCode").val(channelDtl.sellCode);
                    $("#sellName").val(channelDtl.sellName);
                    temp = channelDtl.name;
                    $("#remark").val(channelDtl.remark)
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询销售渠道类型
         * @param url
         * @param data
         */
        querySellType : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/selectByTypeCode/salesChannelType";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem("sellType", result.result, "value", "name", true);
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
            aContent.url = $.scmServerUrl + "system/update/sellChannel/" + fromData['id'];
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href = "sellChannel.html";
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function (e) {
        $.sellChannelUpdate.init();
    });
}(jQuery));
