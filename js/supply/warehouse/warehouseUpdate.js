/**
 * Created by sone on 2017/5/3.
 */
$(function () {

    $("span[class=logs-btn]").click(function () {
        $.showLogsDialog("logInfoPage?entityType=WarehouseInfo&entityId=" + $.getUrlParam("id"));
    });
    $("#warehouseTypeCode").attr("disabled",true);
    $("#operationalNature").attr("disabled",true);
    $("#operationalType").attr("disabled",true);
    $("#storeCorrespondChannel").attr("disabled",true);
    $("#operationalNature").on("change",function(){
         var formData = $.warehouseUpdateApp.form.serializeToObject();
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
         var formData = $.warehouseUpdateApp.form.serializeToObject();
        if (formData.operationalType == 1 || formData.operationalType == 2 ) {
            $("#operationalTypeShows").show();
        }else{
            $("#operationalTypeShows").hide();
            $("#operationalTypeShows").val("");
        }
     });
    $("#save_btn").on("click", function () {
        $.warehouseUpdateApp.form.valid();
        if($("input[name='isThroughQimen']:checked").val()==1){
            var qimenWarehouseCode = $("#qimenWarehouseCode").val();
            if(qimenWarehouseCode==""){
                 BUI.Message.Alert("请填写奇门仓库编码！", "warning");
            }else{
                if ($.warehouseUpdateApp.form.isValid()){
                    var nameflag = false;
                    if(temp == $("#name").val()){
                        nameflag = true;
                    }
                    $.warehouseUpdateApp.checkWarehouse(false, function(){
                        var formData = $.warehouseUpdateApp.form.serializeToObject();
                        if($("input[name='isThroughQimen']:checked").val()==0){
                            formData.qimenWarehouseCode="";
                        };
                        if (formData.operationalNature != 1) {
                           formData.operationalType = null 
                        }
                        $.warehouseUpdateApp.save(formData);
                    },nameflag);
                }
            }
        }else{
            if ($.warehouseUpdateApp.form.isValid()){
                var nameflag = false;
                if(temp == $("#name").val()){
                    nameflag = true;
                }
                $.warehouseUpdateApp.checkWarehouse(false, function(){
                    var formData = $.warehouseUpdateApp.form.serializeToObject();
                    // if($("input[name='isThroughQimen']:checked").val()==0){
                    //     formData.qimenWarehouseCode="";
                    // };
                    // if (formData.operationalNature != 1) {
                    //    formData.operationalType = null 
                    // }
                    formData.storeCorrespondChannel = $("#storeCorrespondChannel").val();
                    formData.operationalNature = $("#operationalNature").val();
                    formData.operationalType = $("#operationalType").val();
                    $.warehouseUpdateApp.save(formData);
                },nameflag);
            }
        }        
    });
    $("input[name='isThroughQimen']").on("change",function(){
        var isCode = $("input[name='isThroughQimen']:checked").val();
        if(isCode=="1"){
            $("#qimenCode").show();
        }if(isCode=="0"){
            $("#qimenCode").hide();
        }
    });
    //下拉选改变触发的函数
    $("#warehouseTypeCode").on("change", function () {
        var value = $("#warehouseTypeCode").val();
        if (value == 'bondedWarehouse') { //等于保税仓
            if (isCustomsClearance) {
                $("#isCustomsClearance").attr("value", isCustomsClearance);
            }
            $("#selectCustoms").prop("hidden", false);
        } else {
            $("#selectCustoms").prop("hidden", true);
            $("#isCustomsClearance").find("option[value='']").attr("selected", true);
        }
    })
    $("#isCustomsClearance").on("change", function () {
        if ($("#isCustomsClearance").val() == "") {
            $("#customTip").text("不能为空！");
        } else {
            $("#customTip").text("");
        }
    })


    $("#warehouseName").on("blur", function () {
        var name = $("#warehouseName").val();
        if (temp == name) {
            return;
        }
        if (name == "") {
            return false;
        }

        $.warehouseUpdateApp.checkWarehouse(true);

    });

    $("#btn_list").on("click", function () {
        window.location.href = "warehouseManage.html";
    });

    var temp = "";//用户标记仓库的原有的名字
    var isCustomsClearance;//用户标记仓库的原
    $.warehouseUpdateApp = {
        init: function () {
            var _self = this;
            BUI.use(['bui/form', 'bui/tooltip'], function (Form, Tooltip) {
                $.warehouseUpdateApp.form = new Form.HForm({
                    srcNode: '#J_Form'
                }).render();
                _self.querySalesChannel();
                _self.queryWarehouseTypeList();
                _self.queryClearanceList();
            });

        },
        /***
         * 查询清关列表
         */
        queryClearanceList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/clearance";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    isCustomsClearance = result.result;
                    $.AddItem2('isCustomsClearance', result.result, 'code', 'name', '请选择');
                }
            };
            $.ajax(aContent);
        },
        /**
         *仓库名称校验
         */
        checkWarehouse: function (isShowAlert, successFun,nameflag) {
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
                        if(nameflag) {
                            successFun()
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
        querySalesChannel: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/salesChannel";
            aContent.data = {};
            aContent.async = false;
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
        queryWarehouseTypeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/warehouseType";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem2('warehouseTypeCode', result.result, 'value', 'name', '请选择');
                }
                var id = $.getUrlParam("id");
                $.warehouseUpdateApp.fileForm(id);
            };
            $.ajax(aContent);
        },
        /***
         * 填充表单
         * @param id 主键ID
         */
        fileForm: function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/warehouse/" + id;
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert("查询仓库失败", "warning");
                } else {
                    var warehouseDtl = result.result;
                    $("#id").val(warehouseDtl.id);
                    $("#code").val(warehouseDtl.code);
                    $("#warehouseName").val(warehouseDtl.warehouseName);
                    temp = warehouseDtl.name
                    $("#warehouseRemark").val(warehouseDtl.warehouseRemark);
                    //$("#warehouseTypeCode").val(warehouseDtl.warehouseTypeCode);
                    $("#warehouseTypeCode").attr("value", warehouseDtl.warehouseTypeCode);
                    $("#warehouseContactNumber").attr("value", warehouseDtl.warehouseContactNumber);
                    $("#warehouseContact").attr("value", warehouseDtl.warehouseContact);
                    $("#senderPhoneNumber").attr("value", warehouseDtl.senderPhoneNumber);
                    $("#province").attr("value", warehouseDtl.province);
                    $("#province").trigger("change");
                    if(warehouseDtl.isThroughQimen==1){
                        $("#yes").attr('checked',true);
                        $("#qimenCode").show();
                        $("#qimenWarehouseCode").attr("value", warehouseDtl.qimenWarehouseCode);
                    }
                    if(warehouseDtl.isThroughQimen==0){
                        $("#no").attr('checked',true);
                    }
                    $("#city").attr("value", warehouseDtl.city);
                    $("#city").trigger("change");
                    $("#area").attr("value", warehouseDtl.area);
                    isCustomsClearance = warehouseDtl.isCustomsClearance;
                    $("#isCustomsClearance").attr("value", warehouseDtl.isCustomsClearance);
                    $("#address").val(warehouseDtl.address);
                    $.warehouseUpdateApp.judgeWarehouseTypeCode($("#warehouseTypeCode").val());
                    $.setRadioChecked('isValid', warehouseDtl.isValid);
                    if (warehouseDtl.operationalNature == 0) {
                        $("#operationalNature").attr("value",  '0');
                    }else if (warehouseDtl.operationalNature == 1) {
                        $("#operationalNature").attr("value",  '1');
                        $("#operationalTypeShow").show();
                    }
                    if (warehouseDtl.operationalType == 0) {
                        $("#operationalType").attr("value",  '0');
                    }else if (warehouseDtl.operationalType == 1) {
                        $("#operationalType").attr("value",  '1');
                        $("#storeCorrespondChannel").attr("value", warehouseDtl.storeCorrespondChannel);
                        $("#operationalTypeShows").show();
                    }else if (warehouseDtl.operationalType == 2) {
                        $("#operationalType").attr("value",  '2');
                        $("#storeCorrespondChannel").attr("value", warehouseDtl.storeCorrespondChannel);
                        $("#operationalTypeShows").show();
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         * 判断清关是否显示
         */
        judgeWarehouseTypeCode: function (warehouseTypeCode) {
            if (warehouseTypeCode == 'bondedWarehouse') {
                $("#selectCustoms").prop("hidden", false);
            } else {
                $("#selectCustoms").prop("hidden", true);
            }
        },
        /***
         * 修改仓库
         * @param fromData
         */
        save: function (fromData) {
            //仓库的类型判断
            var value = $("#warehouseTypeCode").val();
            if (value == 'bondedWarehouse') {
                if ($("#isCustomsClearance").val() == "") {
                    $("#customTip").text("不能为空！");
                    return false;
                }
            }
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/warehouse/" + fromData['id'];
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href = "warehouseManage.html";
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function (e) {
        $.warehouseUpdateApp.init();
    });
}(jQuery));
