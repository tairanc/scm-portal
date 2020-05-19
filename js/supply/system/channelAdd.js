/**
 * Created by sone on 2017/5/2.
 */
$(function(){
    $.channelAddApp = {

        init:function(){
            this.queryChannelList();            
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
                    if (form.isValid()){
                        $.channelAddApp.checkChannel(false, function () {
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
                                $.channelAddApp.save(formData, tip);
                            }                                                    
                        });
                    }

                });

                $("#name").on("blur",function(){
                    form.valid();
                    if (form.isValid()){
                        $.channelAddApp.checkChannel(true);
                    }
                });
                
                $("#btn_list").on("click",function(){
                    window.location.href = "channelList.html";
                	//window.history.go(-1);
                });

            });
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
                        $("#sellChannelList").append(html);
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         *渠道名称校验
         */
        checkChannel: function (isShowAlert, successFun) {
            var name = $("#name").val();
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
         * 保存渠道
         * @param fromData
         */
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/channel";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "channelList.html";
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function(e) {
        $.channelAddApp.init();
    });
}(jQuery));
