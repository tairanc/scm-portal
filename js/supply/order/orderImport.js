/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    $.orderImportApp = {
        dialog: null,
        errDialog:null,
        errorOrderUrl:"",
        /**
         * 初始化
         */
        init : function () {
            this.querySellChannel();

            $('#excelFile').on('change',function(e){

                var file = e.target.files[0];
                if (file == undefined) {
                    return
                }
                strs = (file.name).split(".");
                var suffix = strs[strs.length - 1];
                if(suffix!="xls"&&suffix!="xlsx"){
                    BUI.Message.Alert("文件格式不正确,请上传.xls或.xlsx为后缀的文件", "warning");
                    return;
                };

            });

            $("#orderBtn").on('click', function () {
                var sellCode = $("#sellCode").val();
                if("" == sellCode){
                    BUI.Message.Alert("请选择销售渠道!", "warning");
                    return false;
                }
                var file = document.getElementById("excelFile").files[0];
                if(file){
                    $.orderImportApp.submitOrderImport();
                }else {
                    BUI.Message.Alert("请选择导入文件!", "warning");
                    return false;
                }

            });

        },
        /***
         * 销售渠道
         */
        querySellChannel: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/ywxSellChannelList";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.AddItem('sellCode', result.result, 'sellCode', 'sellName', true);
                }
            };
            $.ajax(aContent);
        },
        /*导入失败说明模态框*/
        importFailDialog : function(orderCode){
            BUI.use(['bui/overlay','bui/mask'],function(Overlay){
                if(!$.orderImportApp.errDialog){
                    $.orderImportApp.errDialog = new Overlay.Dialog({
                        title:'导入失败说明',
                        width:'30%',
                        height:'40%',
                        contentId:'errMsg',
                        buttons:[
                            {
                                text:'下载失败说明',
                                elCls : 'button button-primary myBtn',
                                handler: function(){
                                    window.open($.orderImportApp.errorOrderUrl);
                                }
                            },
                            {
                                text:'取消',
                                elCls : 'button',
                                handler : function(){
                                    this.close();
                                }
                            }
                        ]
                    });
                }
            });
        },
        /***
         * 订单导入提交
         */
        submitOrderImport: function () {
            $.showLoadMask('正在导入订单,请耐心等待！切勿关闭或者刷新该导入页面！');

            var formData = new FormData();
            var file = document.getElementById("excelFile").files[0];
            formData.append("sellCode", $("#sellCode").val());
            formData.append("file", file);
            $.ajax({
                url:$.scmServerUrl + 'order/orderImport',
                type:'post',
                data: formData,
                timeout: 600000,
                // 告诉jQuery不要去处理发送的数据
                processData : false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType : false,
                complete : function(){
                    $.hideLoadMask();
                },
                success : function(responseStr) {
                    if(responseStr.appcode == 1){
                        BUI.Message.Alert(responseStr.databuffer,'warning');
                    }else{
                        BUI.Message.Alert("导入成功!",'info');
                    }
                    $("#excelFile").val("");
                },
                error:function(err, status){
                    var result=(JSON.parse(err.responseText)).result
                    if(err.status==400){
                        $.orderImportApp.errorOrderUrl=$.scmServerUrl+ "order/downloadErrorOrder/" + result.orderCode;
                        $.orderImportApp.importFailDialog(result.orderCode);
                        $.orderImportApp.errDialog.show();
                        $("#sucNum").html(result.successCount);
                        $("#failNum").html(result.failCount);
                        $("#excelFile").val("");
                    }else{
                        BUI.Message.Alert(JSON.parse(err.responseText).databuffer,'warning');
                        $("#excelFile").val("");
                    }
                }
            });
        }
    }
    $(document).ready(function (e) {
        $.orderImportApp.init();
  });
  
  //点击模板下载事件

  $('.templateDown').on('click', function () {
     window.open("/download/order/orderTemplate.xls");
  })
}(jQuery)); 