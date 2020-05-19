/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function(){

    $.dictTypeAddApp = {
        _dictTypeQueryUrl : $.scmServerUrl + "config/dictTypes",
        init:function(){

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
                	var formData = form.serializeToObject();
                	if(form.isValid()){
	                       $.dictTypeAddApp.save(formData, tip);
	                   }
                });

                $("#code").on("blur",function(){
                    if(form.isValid()){
                        var code = $("#code");
                        var param = {code : code.val()};
                        $.checkRepat($.dictTypeAddApp._dictTypeQueryUrl, code, param, "该编号已经存在,请用其他编号！");
                    }
                });

                $("#name").on("blur",function(){
                    if(form.isValid()){
                        var name = $("#name");
                        var param = {name : name.val()};
                        $.checkRepat($.dictTypeAddApp._dictTypeQueryUrl, name, param, "该名称已经存在,请用其他名称！");
                    }
                });
                
                $("#btn_list").on("click",function(){
                    window.location.href = "dictTypeList.html";
                });

                $("#reset_btn").on("click",function(){
                    form.clearErrors(true,true);
                });
            });
        },
        /***
         * 保存字典类型
         * @param fromData
         */
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "config/dictType";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "dictTypeList.html";
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function(e) {
        $.dictTypeAddApp.init();
    });
}(jQuery));
