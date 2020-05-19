/**
 * Created by sone on 2017/5/23.
 */
$(function(){
    $.purchaseGroupInfoApp = {
        _isValid : "",
        init:function(){
            var code = $.getUrlParam("code")
            $.purchaseGroupInfoApp.fileForm(code);
            $("#btn_list").on("click",function(){
                window.location.href = "purchaseGroupList.html";
                //window.history.go(-1);
            });

        },
        /***
         * 填充信息--根据采购组的编码查询采购组的信息
         * @param code 编码
         */
        fileForm:function (code) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"purchase/purchaseGroupCode/"+code;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert("查询采购组失败");
                }else{
                    var purchaseDtl = result.result;
                    $("#id").val(purchaseDtl.id);
                    $("#code").val(purchaseDtl.code);
                    $("#name").val(purchaseDtl.name);
                    $("#remark").val(purchaseDtl.remark);
                    $("#leaderUserId").val(purchaseDtl.leaderName);
                    var member = purchaseDtl.memberName;
                    var strs = new Array();
                    strs = member.split(",");
                    var memberStrs = "";
                    for(var i = 0;i<strs.length;i++){
                        if(strs[i]==""){
                            break;
                        }
                        if(i==0){
                            memberStrs +=("<div class='control-group'>"+"<label class='control-label' >"+'采购组组员：'+"</label>"+"<div class='controls'>"+"<input style='width: 200px;border: 5px' type='text' value="+strs[i]+" readonly>"+"</div>"+"</div>");
                        }else{
                            memberStrs +=("<div class='control-group'>"+"<label class='control-label' >"+'采购组组员：'+"</label>"+"<div class='controls'>"+"<input style='width: 200px;border: 5px' type='text' value="+strs[i]+" readonly>"+"</div>"+"</div>");
                        }

                    }
                    $("#userDiv").after(memberStrs)
                    $.setRadioChecked('isValid',purchaseDtl.isValid);
                    /*$.purchaseGroupInfoApp._isValid = purchaseDtl.isValid;*/
                }
            };
            $.ajax(aContent);
        },

    };
    $(document).ready(function(e) {
        $.purchaseGroupInfoApp.init();
    });
    //页面完全加载完成后设置单选框默认选中
    window.onload=function(){
        $.setRadioChecked('isValid', $.purchaseGroupInfoApp._isValid);
    }
}(jQuery));
