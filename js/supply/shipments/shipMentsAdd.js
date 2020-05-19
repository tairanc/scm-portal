/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function(){

    $.shipMentsAddApp = {
        _dictQueryUrl : $.scmServerUrl + "config/dicts",
        init:function(){

            BUI.use(['bui/form','bui/tooltip'],function(Form, Tooltip){
                $.shipMentsAddApp.queryDictTypeList();
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
	                       $.shipMentsAddApp.save(formData, tip);
	                   }
                });

                $("#name").on("blur",function(){
                    if(form.isValid()){
                        var typeCode = $("#typeCode").val();
                        if("" == typeCode){
                            BUI.Message.Alert("请先选择字典类型！","warning");
                            return false;
                        }
                        var name = $("#name");
                        var param = {typeCode: typeCode, name : name.val()};
                        $.checkRepat($.shipMentsAddApp._dictQueryUrl, name, param, "该名称已经存在,请用其他名称！");
                    }
                });

                $("#value").on("blur",function(){
                    if(form.isValid()){
                        var typeCode = $("#typeCode").val();
                        if("" == typeCode){
                            BUI.Message.Alert("请先选择字典类型！","warning");
                            return false;
                        }
                        var value = $("#value");
                        var param = {typeCode: typeCode, value : value.val()};
                        $.checkRepat($.shipMentsAddApp._dictQueryUrl, value, param, "该字典值已经存在,请用其他字典值！");
                    }
                });
                
                $("#btn_list").on("click",function(){
                    window.location.href = "shipMentsList.html";
                });

                $("#reset_btn").on("click",function(){
                    form.clearErrors(true,true);
                });
            });
        },
        /***
         * 查询字典类型列表
         */
        queryDictTypeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dictTypes";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('typeCode', result.result,'code','name',true);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 保存字典类型
         * @param fromData
         */
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dict";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                }else{
                    window.location.href = "shipMentsList.html";
                }
            };
            $.ajax(aContent);
        }
    };

    $(document).ready(function(e) {
        $.shipMentsAddApp.init();
    });
}(jQuery));
