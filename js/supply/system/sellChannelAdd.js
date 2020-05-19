/**
 * Created by sone on 2017/5/2.
 */
$(function(){
    $.channelAddApp = {
        init:function(){

            this.querySellType();

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
                    form.valid();
                    var sellTypeVal = $("#sellType").val();
                    console.log(sellTypeVal)
                    if(sellTypeVal==""){
                        BUI.Message.Alert("请选择销售渠道类型！", "warning");
                    }else{
                        if (form.isValid()){
                            $.channelAddApp.checkChannel(false, function () {
                                var formData = form.serializeToObject();
                                formData.sellName = $.trim(formData.sellName)
                                $.channelAddApp.save(formData, tip);
                            });
                        }
                    }                    

                });

                $("#sellName").on("blur",function(){
                    form.valid();
                    if (form.isValid()){
                        $.channelAddApp.checkChannel(true);
                    }
                });
                
                $("#btn_list").on("click",function(){
                    window.location.href = "sellChannel.html";
                	//window.history.go(-1);
                });

                $("#sellType").on("change",function(){
                    var val = $(this).val();
                    if(val == "2"){//门店
                        $("#storeId").val("");
                        $("#storeDiv").show();
                    }else{
                        $("#storeId").val("");
                        $("#storeDiv").hide();
                    }
                });

            });
        },
       /*销售渠道名称校验*/
        checkChannel: function (isShowAlert, successFun) {
            var name = $.trim($("#sellName").val())
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/sellChannelName";
            aContent.data = {"name": name};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    if ("" != result.result && null != result.result) {
                        if (isShowAlert) {
                            BUI.Message.Alert("该渠道名称已经存在,请用其他名称！", "warning");
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
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/save/sellChannel";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "sellChannel.html";
                	//window.history.go(-1);
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function(e) {
        $.channelAddApp.init();
    });
}(jQuery));
