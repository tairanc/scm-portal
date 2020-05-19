/**
 * Created by sone on 2017/5/2.
 */
$(function(){
    $.warehouseAddApp = {
        init:function(){
            this.querySalesChannel();
            var isCode ="";
            // console.log(isCode);
            this.queryWarehouseTypeList();
            this.queryClearanceList();

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
                
                $("#operationalNature").on("change",function(){
                     var formData = form.serializeToObject();
                    if (formData.operationalNature == 1) {
                        $("#operationalTypeShow").show();
                    }else{
                        $("#operationalTypeShow").hide();
                        $("#operationalTypeShow").val("");
                        $("#operationalTypeShows").hide();
                        $("#operationalTypeShows").val("");
                    }
                 });

                $("#operationalType").on("change",function(){
                     var formData = form.serializeToObject();
                    if (formData.operationalType == 1 || formData.operationalType == 2 ) {
                        $("#operationalTypeShows").show();
                    }else{
                        $("#operationalTypeShows").hide();
                        $("#operationalTypeShows").val("");
                    }
                 });
                
                $("#save_btn").on("click",function(){
                    form.valid();  
                    if($("input[name='isThroughQimen']:checked").val()==1){
                        var qimenWarehouseCode = $("#qimenWarehouseCode").val();
                        if(qimenWarehouseCode==""){
                             BUI.Message.Alert("请填写奇门仓库编码！", "warning");
                        }else{
                            if (form.isValid()){
                                $.warehouseAddApp.checkWarehouse(false, function () {
                                    var formData = form.serializeToObject();
                                    if (formData.operationalNature != 1) {
                                       formData.operationalType = null 
                                    }
                                    $.warehouseAddApp.save(formData, tip);
                                });
                            }
                        }
                    }else{
                        if (form.isValid()){
                            $.warehouseAddApp.checkWarehouse(false, function () {
                                var formData = form.serializeToObject();
                                if($("input[name='isThroughQimen']:checked").val()==0){
                                    formData.qimenWarehouseCode="";
                                };
                                if (formData.operationalNature != 1) {
                                   formData.operationalType = null 
                                }
                                $.warehouseAddApp.save(formData, tip);
                            });
                        }
                    }                                    

                });

                $("#warehouseName").on("blur",function(){
                    if($("#warehouseName").val() =="" || $("#warehouseName").val() == null){
                        return;
                    }
                    $.warehouseAddApp.checkWarehouse(true);
                });
                
                $("#btn_list").on("click",function(){
                    window.location.href = "warehouseManage.html";
                });
                $("input[name='isThroughQimen']").on("change",function(){
                    isCode = $("input[name='isThroughQimen']:checked").val();
                    if(isCode=="1"){
                        $("#qimenCode").show();
                    }else{
                        $("#qimenCode").hide();
                    }
                });

                //下拉选改变触发的函数
                $("#warehouseTypeCode").on("change",function () {
                    var value=$("#warehouseTypeCode").val();
                    if(value=='bondedWarehouse'){ //等于保税仓
                        $("#selectCustoms").prop("hidden",false);
                    }else {
                        $("#selectCustoms").prop("hidden",true);
                        $("#isCustomsClearance").find("option[value='']").attr("selected",true);
                    }
                })
                $("#isCustomsClearance").on("change",function () {
                    if($("#isCustomsClearance").val()==""){
                        $("#customTip").text("不能为空！");
                    }else{
                        $("#customTip").text("");
                    }
                })
            });
        },
        /**
         *warehouse名称校验
         */
        checkWarehouse: function (isShowAlert, successFun) {
            var name = $("#warehouseName").val()
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/warehouse";
            aContent.data = {"name": name};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    if ("" != result.result && null != result.result) {
                        if (isShowAlert) {
                            BUI.Message.Alert("该仓库名称已经存在,请用其他名称！", "warning");
                        }
                        $("#warehouseName").val("");
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
         * 省市区的数据校验
         */
        checkData:function () {
            var province = $("#province").val();
            var city = $("#city").val();
            var area = $("#area").val();

            if( province==""){
                $("#checkData").text("!省不能为空");
                return true;
            }else{
                $("#checkData").text("");
            }

            if(city == "" ){
                $("#checkData").text("!市不能为空");
                return true;
            }else {
                $("#checkData").text("");
            }

            if(area == ""){
                $("#checkData").text("!地区不能为空");
                return true;
            }else{
                $("#checkData").text("");
            }
            return false;

        },
        querySalesChannel: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/salesChannel";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem2('storeCorrespondChannel', result.result, 'sellCode', 'sellName', '请选择');
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询仓库类型
         */
        queryWarehouseTypeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/warehouseType";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('warehouseTypeCode', result.result,'value','name','请选择',[]);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询清关列表
         */
        queryClearanceList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/clearance";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('isCustomsClearance', result.result,'code','name','请选择');
                }
            };
            $.ajax(aContent);
        },
        /***
         * 保存仓库
         * @param fromData
         */
        save:function(fromData,tip){
            //仓库的类型判断
            var value=$("#warehouseTypeCode").val();
            if(value=='bondedWarehouse'){
                if($("#isCustomsClearance").val()==""){
                    $("#customTip").text("不能为空！");
                    return false;
                }
            }
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/warehouse";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "warehouseManage.html";
                	//window.history.go(-1);
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function(e) {
        $.warehouseAddApp.init();
    });
}(jQuery));
