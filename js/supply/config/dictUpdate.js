/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function(){

    $.dictUpdateApp = {
        _isValid : "",
        init:function(){
            var id = $.getUrlParam("id")
            $.dictUpdateApp.fileForm(id);
            $.dictUpdateApp.queryDictTypeList();

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
	                       $.dictUpdateApp.save(formData, tip);
	                   }
                });
                
                $("#btn_list").on("click",function(){
                    window.location.href = "dictList.html";
                });
                $("#reset_btn").on("click",function(){
                    var currentUrl = window.location.href;
                    window.location.href = currentUrl;
                });
            });
        },
        /***
         * 填充表单
         * @param id zhujianID
         */
        fileForm:function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dict/"+id;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    alert("查询字典类型明细失败."+result.databuffer)
                }else{
                    var dictDtl = result.result;
                    $("#id").val(dictDtl.id);
                    $("#name").val(dictDtl.name);
                    $("#value").val(dictDtl.value);
                    $.dictUpdateApp._isValid = dictDtl.isValid;
                    $.setSelectItem("typeCode",dictDtl.typeCode);//自动加载
                }
            };
            $.ajax(aContent);
        },
        /***
         *查询字典类型列表
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
         * 保存字典
         * @param fromData
         */
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dict/"+fromData['id'];
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "dictList.html";
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function(e) {
        $.dictUpdateApp.init();
    });
    //页面完全加载完成后设置单选框默认选中
    window.onload=function(){
        $.setRadioChecked('isValid', $.dictUpdateApp._isValid);
    }
}(jQuery));
