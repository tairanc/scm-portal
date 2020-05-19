/**
 * Created by sone on 2017/5/2.
 */
$(function(){
    $.warehouseConfigApp = {
        warehouseList : null,
        init : function(){            
            $.warehouseConfigApp.warehouseList();
            $("#warehouseName").on('change',function(){
                var warehouseIndex=$("#warehouseName").val();
                var isThroughWms=$.warehouseConfigApp.warehouseList[warehouseIndex].isThroughWms;  
                var isNoticeSuccess=$.warehouseConfigApp.warehouseList[warehouseIndex].isNoticeSuccess;  
                var isNoticeWarehouseItems=$.warehouseConfigApp.warehouseList[warehouseIndex].isNoticeWarehouseItems;              
                var wmsWarehouseCode =$.warehouseConfigApp.warehouseList[warehouseIndex].wmsWarehouseCode; 
                $("#wmsWarehouseCode").val(wmsWarehouseCode)
                if(isThroughWms==0){
                    $("#qimenFalse").attr('checked',true);
                }else if(isThroughWms==1){
                    $("#qimenTrue").attr('checked',true);
                };
                if(isNoticeSuccess==0){
                    $("#noticeFalse").attr('checked',true);
                }else if(isNoticeSuccess==1){
                    $("#noticeTrue").attr('checked',true);
                };
                if(isNoticeWarehouseItems==0){
                    $("#itemFalse").attr('checked',true);
                }else if(isNoticeWarehouseItems==1){
                    $("#itemTrue").attr('checked',true);
                };                
            });
            // $("input[name='isThroughWms']").on("change",function(){
            //     var isCode = $("input[name='isThroughWms']:checked").val();
            //     if(isCode=="1"){
            //         $("#qimenCode").show();
            //     }else{
            //         $("#qimenCode").hide();
            //     }
            // });
            // $("input[name='isNoticeWarehouseItems']").on("change",function(){
            //     var isCode = $("input[name='isThroughWms']:checked").val();
            //     var isNoticeWarehouseItemsVal = $("input[name='isNoticeWarehouseItems']:checked").val();
            //     if(isCode=="0"&&isNoticeWarehouseItemsVal==1){
            //         BUI.Message.Alert('在通过奇门的情况下才能对接商品信息通知接口!','warning');
            //         $("#itemFalse").attr('checked',true);
            //     }
            // });
            // $("input[name='isNoticeSuccess']").on("change",function(){
            //     var isCode = $("input[name='isThroughWms']:checked").val();
            //     var isNoticeSuccessVal = $("input[name='isNoticeSuccess']:checked").val();
            //     if(isCode=="0"&&isNoticeSuccessVal==1){
            //         BUI.Message.Alert('在通过奇门的情况下才能对接货主信息通知接口!','warning');
            //         $("#noticeFalse").attr('checked',true);     
            //     }
            // });
            $("#save").on('click',function(){
                var warehouseIndex=$("#warehouseName").val();
                if(warehouseIndex==""){
                     BUI.Message.Alert('请选择仓库!','warning');
                };
                var warehouseId=$.warehouseConfigApp.warehouseList[warehouseIndex].id;
                var wmsWarehouseCode = $("#wmsWarehouseCode").val();
                var isThroughWms =$("input[name='isThroughWms']:checked").val();
                var isNoticeSuccess =$("input[name='isNoticeSuccess']:checked").val();
                var isNoticeWarehouseItems =$("input[name='isNoticeWarehouseItems']:checked").val();
                var formData = {
                    wmsWarehouseCode: wmsWarehouseCode,
                    isThroughWms:isThroughWms,
                    isNoticeSuccess:isNoticeSuccess,
                    isNoticeWarehouseItems:isNoticeWarehouseItems
                }; 
                if(!isThroughWms){
                    BUI.Message.Alert('请选择是否通过奇门!','warning');
                }else if(!isNoticeSuccess){
                    BUI.Message.Alert('请选择是否已对接货主信息通知接口!','warning');
                }else if(!isNoticeWarehouseItems){
                    BUI.Message.Alert('请选择是否已对接商品信息通知接口!','warning');
                }else if(!$("#wmsWarehouseCode").val()){
                    BUI.Message.Alert('请填写仓库编码!','warning');
                }else{
                    $.warehouseConfigApp.saveWarehouseConfig(warehouseId,formData)
                } 
            });
        },
        /*查询所有仓库列表*/
        warehouseList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"system/warehouseConfig";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.warehouseConfigApp.warehouseList=result.result;
                     $.AddItem3('warehouseName', result.result,  'warehouseName', '请选择');
                }
            };
            $.ajax(aContent);
        },
        /*保存仓库配置===*/
        saveWarehouseConfig:function (id,fromData) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/warehouseConfig/" +id;
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    BUI.Message.Alert('该仓库配置保存成功',function(){
                        window.location.href='warehouseConfig.html';
                    },'success');
                    //window.location.href='warehouseConfig.html';
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        $.warehouseConfigApp.init();
    });
}(jQuery));