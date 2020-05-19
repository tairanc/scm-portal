/**
 * Created by hzwdx on 2017/6/26.
 */
$(function(){
    $("#btn_list").on("click",function(){
        window.location.href = "warehouseManage.html";
    });    
    $.warehouseOrderDetail2App = {
        _jdSupplierCode : "JD", //京东供应商编码
        _warehouseOrderCode : "",
        store : null,
        /**
         * 初始化
         */
        init : function () {
            //window.location.href = decodeURI(window.location.href)
            this.ownerName = $.getUrlParamdecode("ownerName");
            this.warehouseOwnerId = $.getUrlParamdecode("warehouseOwnerId");
            this.ownerId = $.getUrlParamdecode("ownerId");
            this.ownerWarehouseState=$.getUrlParamdecode("ownerWarehouseState");
            this.warehouseName=$.getUrlParamdecode("warehouseName");
            this.warehouseInfoId=$.getUrlParamdecode("id");
            this.isNoticeSuccess=$.getUrlParamdecode("isNoticeSuccess");
            $("#ownerName").val(this.ownerName);
            $("#warehouseOwnerId").val(this.warehouseOwnerId);
            $("#ownerId").val(this.ownerId);
            $("#ownerWarehouseState").html(this.ownerWarehouseState);
            $("#warehouseName").html(this.warehouseName);
            $("#remark").html($.getUrlParamdecode("remark"));            
            if(this.isNoticeSuccess==1){
                $("#save_btn").hide();
            }
            if(this.isNoticeSuccess==1&&$.getUrlParamdecode("ownerWarehouseState")=="待通知"||this.isNoticeSuccess==1&&$.getUrlParamdecode("ownerWarehouseState")=="通知失败"){
                $("#notice_btn").show();
            }
            if($.getUrlParamdecode("ownerWarehouseState")=="通知成功"){
                $("#warehouse_notice").hide();
            }  
            BUI.use(['bui/form', 'bui/tooltip'], function (Form, Tooltip){
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
                $("#btn_list").on("click",function(){
                    window.location.href = "warehouseManage.html";
                });
                $("#save_btn").on("click",function(){
                    form.valid();
                    if (form.isValid()){
                        var formData = form.serializeToObject();
                        formData.warehouseId = $.getUrlParamdecode("warehouseId");
                        $.warehouseOrderDetail2App.save(formData);
                    };
                });
            });
        },
        /**
         * 查询仓库订单明细
         * @param warehouseOrderCode
         */
        queryOrderDetail : function (warehouseOrderCode) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"order/warehouseOrder/warehouseOrderCode/"+warehouseOrderCode;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    var warehouseOrder = result.result;
                    $.warehouseOrderDetail2App.fillData(warehouseOrder);
                    $.warehouseOrderDetail2App.initItemsDetail(warehouseOrder['orderItemList']);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 填充数据
         * @param shopOrder
         */
        fillData: function (warehouseOrder) {
            if(warehouseOrder['supplierCode'] == $.warehouseOrderDetail2App._jdSupplierCode&&warehouseOrder['supplierOrderStatus']!=1){
                $("#jingDongAdd").show();
            }
            for(key in warehouseOrder){
                var val = warehouseOrder[key];
                if(val == null){
                    val = "";
                }
                $("#"+key).text(val);
            }
            var platformOrder = warehouseOrder['platformOrder'];
            $("#receiverName").text(platformOrder['receiverName']);
            $("#receiverMobile").text(platformOrder['receiverMobile']);
            var _provinceCityArea = platformOrder['receiverProvince'] + "." + platformOrder['receiverCity'];
            if(platformOrder['receiverDistrict']){
                _provinceCityArea = _provinceCityArea + "." + platformOrder['receiverDistrict'];
            }
            $("#provinceCityArea").text(_provinceCityArea);
            $("#receiverAddress").text(platformOrder['receiverAddress']);
            setTimeout(function(){
                $("#supplierOrderStatus").text($.dictTranslate("supplierOrderStatus", warehouseOrder['supplierOrderStatus']));
            },300);
        },
        /*保存货主信息*/
        save:function(formData,tips){
            var aContent = $.AjaxContent();
            formData.id=$.getUrlParamdecode("id");
            aContent.url = $.scmServerUrl + "warehouseInfo/ownerInfo/" + formData['id'];
            aContent.data = formData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href = "warehouseManage.html";
                }
            };
            $.ajax(aContent);
        },
        /*查询仓库信息*/
        queryWarehouseInfo:function(id){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/warehouse/" + id;
            aContent.data = {};
            aContent.success = function (result, textStatus){
                if (result.appcode != 1) {
                    BUI.Message.Alert("查询仓库失败", "warning");
                }else{
                    var result = result.result;
                    if(result.isNoticeSuccess==1){
                        $("#save_btn").hide();
                    }
                    if(result.isNoticeSuccess==1&&$.getUrlParamdecode("ownerWarehouseState")=="待通知"||result.isNoticeSuccess==1&&$.getUrlParamdecode("ownerWarehouseState")=="通知失败"){
                        $("#notice_btn").show();
                    }
                    if($.getUrlParamdecode("ownerWarehouseState")=="通知成功"){
                        $("#warehouse_notice").hide();
                    }  
                }
            };
            $.ajax(aContent);
        }      
 }
    $(document).ready(function (e) {
        $.warehouseOrderDetail2App.init();
    });
}(jQuery));